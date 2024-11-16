// src/controllers/LLMController.js
/* eslint-disable class-methods-use-this */
import LLMGenerationService from '../services/llm/LLMGenerationService.js';
import LLMResponseProcessingService from '../services/llm/LLMResponseProcessingService.js';
import LLMRequestBuilderService from '../services/llm/LLMRequestBuilderService.js';
import JobApplicationCreationService from
  '../services/jobapplication/jobApplicationCreationService.js';
import AttachDocumentToJobApplicationService from
  '../services/jobapplication/attachDocumentToJobApplicationService.js';
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

    console.log('[INFO] Starting content generation process...');
    console.log(`[DEBUG] Received request for userId: ${userId}`);
    console.log('[DEBUG] Request Body:', { jobTitle, jobCompany, jobDescriptionBody, customPrompt });

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
      console.log('[INFO] Creating job application...');
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobApplicationDetails
      ).call();
      const jobAppId = createdJobDescription.jobApplicationId;
      console.log(`[INFO] Job application created successfully with ID: ${jobAppId}`);

      console.log('[INFO] Retrieving user profile...');
      const userProfile = await new RetrieveUserProfileService(
        userId,
        authToken
      ).call();
      console.log('[DEBUG] Retrieved user profile:', userProfile);

      console.log('[INFO] Retrieving user experiences...');
      const userExperiences = await new RetrieveUserExperiencesService(
        userId,
        authToken
      ).call();
      console.log('[INFO] Successfully retrieved experiences...', userExperiences);
      console.log('[INFO] Preparing LLM request data...');

      const builderService = await new LLMRequestBuilderService(
        userProfile,
        userExperiences.employments,
        userExperiences.educations,
        jobApplicationDetails,
        customPrompt
      );

      const llmRequestData = await builderService.call();

      console.log('[DEBUG] Prepared LLM request data:', llmRequestData);

      console.log('[INFO] Calling LLM service...');
      const chatGPTClient = new LLMGenerationService(llmRequestData); // Correctly instantiate
      const generatedResult = await chatGPTClient.callChatGPT(); // Explicitly call the method
      console.log('[INFO] Received response from LLM service.');

      console.log('[INFO] Processing LLM response...');
      const { resume, coverLetter } = await new LLMResponseProcessingService(generatedResult).call();
      console.log('[DEBUG] Processed resume:', resume);
      console.log('[DEBUG] Processed cover letter:', coverLetter);

      console.log('[INFO] Attaching documents to job application...');
      await Promise.all([
        new AttachDocumentToJobApplicationService(
          jobAppId,
          'Resume',
          resume,
          userId
        ).call(),
        new AttachDocumentToJobApplicationService(
          jobAppId,
          'Cover Letter',
          coverLetter,
          userId
        ).call(),
      ]);
      console.log('[INFO] Documents attached successfully.');

      console.log('[INFO] Content generation process completed successfully.');
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
