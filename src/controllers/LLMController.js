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

    const jobApplicationDetails = {
      jobTitle,
      jobCompany,
      jobDescriptionBody,
    };

    try {
      // Create job application
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobApplicationDetails
      ).call();
      const jobAppId = createdJobDescription.jobApplicationId;

      // Retrieve user profile
      const userProfile = await new RetrieveUserProfileService(userId, authToken).call();

      // Retrieve user experiences
      const userExperiences = await new RetrieveUserExperiencesService(userId, authToken).call();

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

      // Attach documents to job application
      const resumeAttachmentService = new AttachDocumentToJobApplicationService(
        jobAppId,
        'Resume',
        resume,
        userId
      );
      await resumeAttachmentService.call();

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
