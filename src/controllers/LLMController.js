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

    console.info(`[INFO] Starting content generation process for userId: ${userId}`);
    console.debug('[DEBUG] Request Body:', { jobTitle, jobCompany, jobDescriptionBody, customPrompt });

    if (!jobTitle || !jobCompany || !jobDescriptionBody) {
      console.warn('[WARN] Missing required fields: jobTitle, jobCompany, or jobDescriptionBody');
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
      console.info('[INFO] Creating job application...');
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobApplicationDetails
      ).call();
      const jobAppId = createdJobDescription.jobApplicationId;
      console.info(`[INFO] Job application created successfully with ID: ${jobAppId}`);

      // Retrieve user profile
      console.info('[INFO] Retrieving user profile...');
      const userProfile = await new RetrieveUserProfileService(userId, authToken).call();
      console.debug('[DEBUG] Retrieved user profile:', userProfile);

      // Retrieve user experiences
      console.info('[INFO] Retrieving user experiences...');
      const userExperiences = await new RetrieveUserExperiencesService(userId, authToken).call();
      console.debug('[DEBUG] Retrieved user experiences:', userExperiences);

      // Prepare LLM request data
      console.info('[INFO] Preparing LLM request data...');
      const builderService = new LLMRequestBuilderService(
        userProfile,
        userExperiences.employments,
        userExperiences.educations,
        jobApplicationDetails,
        customPrompt
      );
      const llmRequestData = await builderService.call();
      console.debug('[DEBUG] Prepared LLM request data:', llmRequestData);

      // Call LLM service
      console.info('[INFO] Calling LLM service...');
      const LLMClientService = new LLMGenerationService(llmRequestData);
      const generatedResult = await LLMClientService.callChatGPT();
      console.info('[INFO] Received response from LLM service.');

      // Process LLM response
      console.info('[INFO] Processing LLM response...');
      const LLMResponseProcessor = new LLMResponseProcessingService(generatedResult);
      const { resume, coverLetter } = await LLMResponseProcessor.call();
      console.debug('[DEBUG] Processed resume:', resume);
      console.debug('[DEBUG] Processed cover letter:', coverLetter);

      // Attach documents to job application
      console.info('[INFO] Attaching documents to job application...');
      const resumeAttachmentService = new AttachDocumentToJobApplicationService(
        jobAppId,
        'Resume',
        resume,
        userId
      );
      await resumeAttachmentService.call();
      console.info('[INFO] Resume attached successfully.');

      const coverLetterAttachmentService = new AttachDocumentToJobApplicationService(
        jobAppId,
        'Cover Letter',
        coverLetter,
        userId
      );
      await coverLetterAttachmentService.call();
      console.info('[INFO] Cover letter attached successfully.');

      console.info('[INFO] Content generation process completed successfully.');
      return res.status(200).json({
        success: true,
        message: 'Generation successful, documents saved.',
        data: { resume, coverLetter },
        jobAppId,
      });
    } catch (error) {
      console.error('[ERROR] Failed to generate content:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content.',
        error: error.message,
      });
    }
  };
}

export default new LLMController();
