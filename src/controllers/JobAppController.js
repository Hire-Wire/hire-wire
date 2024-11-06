/* eslint-disable class-methods-use-this */
import { validationResult } from 'express-validator';
import { getUserDetails } from '../controllers/userController';
import { getUserExperiences } from '../controllers/experienceController';
import logger from '../../logger';

class JobAppController {
  /**
   * Fetches both user details and user experiences in parallel.
   * @param {string} userId - The ID of the user whose data is being fetched.
   * @returns {Promise<Array>} - An array containing user details and user experiences.
   */
  fetchUserAndExperienceDetails(userId) {
    return Promise.all([
      getUserDetails(userId),
      getUserExperiences(userId),
    ]);
  }

  /**
   * Structures data into the required JSON format for the LLM request.
   * @param {Object} userDetails - Basic user information (ID, name, email, phone).
   * @param {Array} userExperiences - List of user's employment experiences.
   * @param {Array} userEducation - List of user's education records.
   * @param {String} jobDescription - Job description provided for the LLM context.
   * @param {String} customizationPrompt - Customization prompt provided for LLM context
   * @param {Object} settings - Customization settings for the LLM request.
   * @returns {Object} - Structured JSON object containing user data for LLM input.
   */
  structureLLMRequest(userDetails, userExperiences, userEducation, jobDescription, customizationPrompt, settings = {}) {
    return {
      user: {
        userID: userDetails.id,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        phone: userDetails.phone,
      },
      workExperiences: userExperiences.map(exp => ({
        workExperienceID: exp.ExperienceID,
        companyName: exp.OrganizationName,
        jobTitle: exp.Employment[0]?.JobTitle,
        startDate: exp.StartDate,
        endDate: exp.EndDate,
        description: exp.Employment[0]?.JobDescription,
      })),
      educations: userEducation.map(edu => ({
        educationID: edu.ExperienceID,
        institutionName: edu.OrganizationName,
        degree: edu.Education[0]?.Degree,
        startYear: new Date(edu.StartDate).getFullYear(),
        endYear: edu.EndDate ? new Date(edu.EndDate).getFullYear() : null,
      })),
      jobDescription: { jobDescription },
      settings: {
        includeGPA: settings.includeGPA ?? true,
        resumePageLength: settings.resumePageLength ?? 2,
        includeCoverLetter: settings.includeCoverLetter ?? true,
        includePersonalSummary: settings.includePersonalSummary ?? true,
        generateSkills: settings.generateSkills ?? true,
        highlightSkillsSection: settings.highlightSkillsSection ?? true,
      },
      customizationPrompt: { customizationPrompt },
      devSettings: {
        rawText: true,
      },
    };
  }

  /**
   * Prepares a structured JSON object for the LLM request.
   * @param {Object} req - Request containing userId, jobPostingDetails, and optional settings.
   * @returns {Promise<Object>} - structure JSON to provide to LLM
   */
  async prepareLLMJSON(req) {
    const { userId } = req.params;
    const { jobPostingDetails, customizationPrompt, settings = {} } = req.body;

    const [
      userDetails,
      userExperiences,
    ] = await this.fetchUserAndExperienceDetails(userId);

    return this.structureLLMRequest(
      userDetails,
      userExperiences.filter(exp => exp.ExperienceType === 'Employment'),
      userExperiences.filter(exp => exp.ExperienceType === 'Education'),
      jobPostingDetails,
      customizationPrompt,
      settings
    );
  }

  /**
   * Generates content for a user based on job posting details and user profile.
   * @param {Object} req - The request object containing user details and job application
   * @param {Object} res - The response object for sending the result.
   * @returns {Promise<void>}
   */
  async triggerContentGeneration(req, res) {
    logger.info('JobAppController.triggerContentGeneration called.');

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobPostingDetails } = req.body;

    if (!jobPostingDetails) {
      return res.status(400).json({ error: 'Job details must not be empty' });
    }

    try {
      // Fetch and prepare data for the LLM
      const llmReqJSON = await this.prepareLLMJSON(req);

      // Send data to LLM and receive generated content
      const generatedContent = await this.sendToLLM(llmReqJSON);

      return res.status(201).json(generatedContent);
    } catch (error) {
      logger.error(`Error generating content: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new JobAppController();
