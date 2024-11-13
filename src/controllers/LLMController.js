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

    console.log(`Received request to generate content with the following data:
      UserId: ${userId},
      Job Title: ${jobTitle},
      Job Company: ${jobCompany},
      Job Description: ${jobDescriptionBody},
      Custom Prompt: ${customPrompt || 'None'}
    `);

    if (!jobTitle || !jobCompany || !jobDescriptionBody) {
      console.warn('Validation failed: Missing required fields (Job title, company, or description).');
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
      console.log('Creating job application for user...');
      const createdJobDescription = await new JobApplicationCreationService(
        userId,
        jobDescriptionInfo
      ).call();
      const jobAppId = createdJobDescription.jobApplicationId;
      console.log(`Job application created successfully with ID: ${jobAppId}`);

      // Step 2: Prepare LLM Request Data
      console.log('Building LLM request data...');
      const llmRequestData = await new LLMRequestBuilderService(
        userId,
        createdJobDescription,
        customPrompt
      ).call();
      console.log('LLM request data prepared:', llmRequestData);

      // Step 3: Call LLM Service
      console.log('Calling LLM service for content generation...');
      const chatGPTResponse = await new LLMGenerationService(llmRequestData).callChatGPT();
      console.log('LLM service response received:', chatGPTResponse);

      // Step 4: Process Response (Split Resume and Cover Letter)
      console.log('Processing LLM response to extract resume and cover letter...');
      const { resume, coverLetter } = new LLMResponseProcessingService(chatGPTResponse).call();
      console.log('Resume and cover letter extracted successfully.');

      // Step 5: Add Documents to Job Application
      console.log('Attaching documents to job application...');
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
      console.log('Documents attached successfully to job application.');

      return res.status(200).json({
        success: true,
        message: 'Generation successful, documents saved.',
        data: { resume, coverLetter },
        jobAppId,
      });
    } catch (error) {
      console.error('Error during content generation process:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content.',
        error: error.message,
      });
    }
  };
}

export default new LLMController();
