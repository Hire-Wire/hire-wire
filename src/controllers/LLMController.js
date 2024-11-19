import LLMGenerationService from '../services/llm/LLMGenerationService.js';
import LLMResponseProcessingService from '../services/llm/LLMResponseProcessingService.js';
import LLMRequestBuilderService from '../services/llm/LLMRequestBuilderService.js';
import JobApplicationCreationService from '../services/jobapplication/jobApplicationCreationService.js';
import AttachDocumentToJobApplicationService from '../services/jobapplication/attachDocumentToJobApplicationService.js';
import RetrieveUserExperiencesService from '../services/experience/retrieveUserExperiencesService.js';
import RetrieveUserProfileService from '../services/user/retrieveUserProfileService.js';

class LLMController {
  generateContent = async (req, res) => {
    const userId = req.user.id;
    const authToken = req.headers.authorization;

    const {
      jobTitle,
      jobCompany,
      jobDescriptionBody,
      customPrompt = '',
    } = req.body;

    if (!jobTitle || !jobCompany || !jobDescriptionBody) {
      return res.status(400).json({
        success: false,
        message: 'Job title, company, and description are required fields.',
      });
    }

// SQL Query to insert a new job description for the job application
// INSERT INTO job_descriptions (jobTitle, jobCompany, jobDescriptionBody, jobApplicationId)
// VALUES (jobTitle, jobCompany, jobDescriptionBody, jobAppId);
    const jobApplicationDetails = {
      jobTitle,
      jobCompany,
      jobDescriptionBody,
    };

    try {

// SQL Query to retrieve the user profile 
// SELECT * FROM users WHERE id = userId;
      // Retrieve user profile
      const userProfile = await new RetrieveUserProfileService(userId, authToken).call();
      let userExperiences;
      try {

// SQL Query to retrieve the user's experiences (employments and educations)
  // SQL Query for getting all Employment experiences:
  // SELECT e.id, e.experienceType, e.organizationName, emp.jobTitle, emp.jobDescription, emp.startDate, emp.endDate
  // FROM experiences e JOIN employment emp ON e.id = emp.experienceID
  // WHERE e.userID = userId AND e.experienceType = 'Employment';

  // SQL Query for getting all Education experiences:
  // SELECT e.id, e.experienceType, e.organizationName, edu.degree, edu.fieldOfStudy, edu.grade, edu.startDate, edu.endDate
  // FROM experiences e JOIN education edu ON e.id = edu.experienceID
  // WHERE e.userID = userId AND e.experienceType = 'Education';
        // Retrieve user experiences
        userExperiences = await new RetrieveUserExperiencesService(userId, authToken).call();

        const hasExperiences = (
          (Array.isArray(userExperiences.employments) && userExperiences.employments.length > 0)
          || (Array.isArray(userExperiences.educations) && userExperiences.educations.length > 0)
        );

        if (!hasExperiences) {
          return res.status(400).json({
            success: false,
            message: 'Failed to generate content. You have no experiences added.',
          });
        }
      } catch (error) {
        if (error.message === 'No experiences found for the user.') {
          return res.status(400).json({
            success: false,
            message: 'Failed to generate content. You have no experiences added.',
          });
        }

        return res.status(500).json({
          success: false,
          message: 'An error occurred while retrieving user experiences.',
          error: error.message,
        });
      }

      // Create job application
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobApplicationDetails
      ).call();
      const jobAppId = createdJobDescription.jobApplicationId;

      // Prepare LLM request data
      const builderService = new LLMRequestBuilderService(
        userProfile,
        userExperiences.employments,
        userExperiences.educations,
        jobApplicationDetails,
        customPrompt
      );
      const llmRequestData = await builderService.call();

      // Call LLM service
      const LLMClientService = new LLMGenerationService(llmRequestData);
      const generatedResult = await LLMClientService.callChatGPT();

      // Process LLM response
      const LLMResponseProcessor = new LLMResponseProcessingService(generatedResult);
      const { resume, coverLetter } = await LLMResponseProcessor.call();

      // SQL Query to insert documents (resume and cover letter) associated with the job application
      // For resume
      // INSERT INTO documents (docType, docBody, jobApplicationId)
      // VALUES ('Resume', resumeContent, jobAppId);
  
      // Attach documents to job application
      const resumeAttachmentService = new AttachDocumentToJobApplicationService(
        jobAppId,
        'Resume',
        resume,
        userId
      );
      await resumeAttachmentService.call();


      // SQL Query to insert documents (resume and cover letter) associated with the job application
      // For cover letter
      // INSERT INTO documents (docType, docBody, jobApplicationId)
      // VALUES ('Cover Letter', coverLetterContent, jobAppId);
      const coverLetterAttachmentService = new AttachDocumentToJobApplicationService(
        jobAppId,
        'Cover Letter',
        coverLetter,
        userId
      );
      await coverLetterAttachmentService.call();

      return res.status(200).json({
        success: true,
        message: 'Generation successful, documents saved.',
        data: { resume, coverLetter },
        jobAppId,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content.',
        error: error.message,
      });
    }
  };
}

export default new LLMController();
