// Import necessary controllers and services
import controllers from './index.js';
import LlmService from '../services/llm/llmservice.js';

const {
  User,
  Experience,
  JobApplication,
} = controllers;

class LLMController {
  constructor() {
    this.userController = User;
    this.experienceController = Experience;
    this.jobAppController = JobApplication;
  }

  async fetchRequiredData(userId) {
    // Fetch user details and experiences
    const userDetails = await this.userController.view({ params: { id: userId } });
    const userExperiences = await this.experienceController.getAll({ user: { id: userId } });
    return { userDetails, userExperiences };
  }

  // eslint-disable-next-line class-methods-use-this
  structureLLMRequest(user, experiences, jobDescription, customPrompt, settings = {}) {
    return new Promise((resolve, reject) => {
      try {
        const llmRequestData = {
          user: {
            userID: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phoneNumber, // assuming phone number is `phoneNumber` in User model
          },
          workExperiences: experiences
            .filter(exp => exp.type === 'Employment')
            .map(exp => ({
              workExperienceID: exp.id,
              companyName: exp.organizationName,
              jobTitle: exp.Employment[0]?.jobTitle,
              startDate: exp.startDate,
              endDate: exp.endDate,
              description: exp.Employment[0]?.jobDescription,
            })),
          educations: experiences
            .filter(exp => exp.type === 'Education')
            .map(edu => ({
              educationID: edu.id,
              institutionName: edu.organizationName,
              degree: edu.Education[0]?.degree,
              startYear: edu.startDate ? new Date(edu.startDate).getFullYear() : null,
              endYear: edu.endDate ? new Date(edu.endDate).getFullYear() : null,
            })),
          jobDescription: {
            title: jobDescription.jobTitle || '', // Include jobTitle
            company: jobDescription.jobCompany || '', // Include jobCompany
            descriptionBody: jobDescription.jobDescriptionBody || '', // Include jobDescriptionBody
          },
          settings: {
            resumePageLength: settings.resumePageLength ?? 2,
            includeCoverLetter: settings.includeCoverLetter ?? true,
            includePersonalSummary: settings.includePersonalSummary ?? true,
            generateSkills: settings.generateSkills ?? true,
            highlightSkillsSection: settings.highlightSkillsSection ?? true,
          },
          customizationPrompt: customPrompt,
          devSettings: {
            rawText: true,
          },
        };

        resolve(llmRequestData);
      } catch (error) {
        reject(`Failed to structure LLM request: ${error.message}`);
      }
    });
  }

  async prepareLLMRequestData(userId, jobDescription, customPrompt) {
    const { userDetails, userExperiences } = await this.fetchRequiredData(userId);
    return this.structureLLMRequest(userDetails, userExperiences, jobDescription, customPrompt);
  }

  async processJobApplicationCreation(userId, jobTitle, jobCompany, jobDescriptionBody) {
    const createJobReq = {
      user: { id: userId },
      body: {
        jobAppTitle: jobTitle,
        jobAppCompany: jobCompany,
        jobAppDescription: jobDescriptionBody,
      },
    };
    const res = await this.jobAppController.createJobApplication(createJobReq);
    if (!res || !res.jobApplication || !res.jobApplication.id) {
      throw new Error('Job application could not be processed.');
    }
    return res.jobApplication.id;
  }

  // eslint-disable-next-line class-methods-use-this
  splitResumeAndCoverLetter(content) {
    const coverLetterStart = content.indexOf('# Cover Letter');
    if (coverLetterStart === -1) {
      throw new Error('Could not find the start of the cover letter (# Cover Letter).');
    }
    return {
      resume: content.substring(0, coverLetterStart).trim(),
      coverLetter: content.substring(coverLetterStart).trim()
        .replace(/^# Cover Letter\s*/, ''),
    };
  }

  async addDocumentToJobApp(jobAppId, docType, docBody, userId) {
    const req = {
      params: { id: jobAppId },
      body: { docType, docBody },
      user: { id: userId },
    };
    const res = await this.jobAppController.addDocument(req);
    if (res.statusCode !== 200) throw new Error(`Failed to add ${docType} to the job application.`);
    return res.data;
  }

  async generateContent(req, res) {
    const userId = req.user.id;
    const { jobTitle, jobCompany, jobDescriptionBody, customPrompt = '' } = req.body;

    if (!jobTitle || !jobCompany || !jobDescriptionBody) {
      return res.status(400).json({
        success: false,
        message: 'Job title, company, and description are required fields.',
      });
    }

    try {
      const jobAppId = await this.processJobApplicationCreation(
        userId,
        jobTitle,
        jobCompany,
        jobDescriptionBody
      );

      const jobDescription = {
        jobTitle,
        jobCompany,
        jobDescriptionBody,
      };

      const llmRequestData = await this.prepareLLMRequestData(
        userId,
        jobDescription,
        customPrompt
      );

      const chatGPTResponse = await LlmService.callChatGPT(llmRequestData);

      const { resume, coverLetter } = this.splitResumeAndCoverLetter(chatGPTResponse);

      await Promise.all([
        this.addDocumentToJobApp(jobAppId, 'resume', resume, userId),
        this.addDocumentToJobApp(jobAppId, 'coverLetter', coverLetter, userId),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Generation successful, documents saved.',
        data: { resume, coverLetter },
        jobAppId,
      });
    } catch (error) {
      console.error('Error in generateContent:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content.',
        error: error.message,
      });
    }
  }
}

export default new LLMController();
