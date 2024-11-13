// src/controllers/LLMController.js
/* eslint-disable class-methods-use-this */
import LLMGenerationService from '../services/llm/LLMGenerationService.js';
import LLMResponseProcessingService from '../services/llm/LLMResponseProcessingService.js';
import LLMRequestBuilderService from '../services/llm/LLMRequestBuilderService.js';
import JobApplicationCreationService from
  '../services/jobapplication/jobApplicationCreationService.js';
import AttachDocumentToJobApplicationService from
  '../services/jobapplication/attachDocumentToJobApplicationService.js';

class LLMController {
  generateContent = async (req, res) => {
    const userId = req.user.id;
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

    const jobDescriptionInfo = {
      jobTitle,
      jobCompany,
      jobDescriptionBody,
    };

    try {
      // Step 1: Create Job Application
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobDescriptionInfo
      ).call();

      const jobAppId = createdJobDescription.jobApplicationId;

      // Step 2: Prepare LLM Request Data
      const llmRequestData = await new LLMRequestBuilderService(
        userId,
        createdJobDescription,
        customPrompt
      )
        .call();

      // Step 3: Call LLM Service
      const chatGPTResponse = await new LLMGenerationService(llmRequestData).callChatGPT();

      // Step 4: Process Response (Split Resume and Cover Letter)
      const { resume, coverLetter } = new LLMResponseProcessingService(chatGPTResponse).call();

      // Step 5: Add Documents to Job Application
      await Promise.all([
        new AttachDocumentToJobApplicationService(
          jobAppId,
          'Resume',
          resume,
          userId
        )
          .call(),
        new AttachDocumentToJobApplicationService(
          jobAppId,
          'Cover Letter',
          coverLetter,
          userId
        )
          .call(),
      ]);

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
