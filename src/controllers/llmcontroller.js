// Import necessary controllers and services
import { User, Experience, JobApplication } from './index.js';
import OpenAILLMService from '../services/llm/OpenAILLMService.js';

class LLMController {
    constructor() {
        this.userController = User;
        this.experienceController = Experience;
        this.jobAppController = JobApplication;
        this.llmService = new OpenAILLMService(); // Initialize OpenAILLMService
    }

    // Helper to fetch all data required for the LLM request
    async fetchRequiredData(userId, jobAppId) {
        // Fetching user, experience, and job application data
        const userDetails = await this.userController.view({ params: { id: userId } });
        const userExperiences = await this.experienceController.getAll({ user: { id: userId } });
        const jobApplication =
            await this.jobAppController.getJobApplication(
                { params: { id: jobAppId }, user: { id: userId } });

        return {
            userDetails: userDetails.json(), // assuming .json() is implemented for controller responses
            userExperiences: userExperiences.json(),
            jobApplication: jobApplication.json(),
        };
    }

    structureLLMRequest(user, experiences, jobApplication, customPrompt, settings = {}) {
        return {
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
            jobDescription: jobApplication.JobDescription?.jobDescriptionBody || '', // assuming `jobDescriptionBody` contains the main description
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
    }

    // Handler for the route to generate content
    async generateContent(req, res) {
        const userId = req.user.id; // Authenticated user's ID
        const jobAppId = req.params.id;

        try {
            // Verify the job application belongs to the authenticated user
            const jobApplication = await this.jobAppController.getJobApplication({
                params: { id: jobAppId },
                user: { id: userId },
            });

            if (!jobApplication) {
                return res.status(404).json({ success: false, message: 'Job application not found' });
            }

            // Call the main function to generate LLM content
            const response = await this.getLLMResponse(req, res);
            return response;
        } catch (error) {
            console.error('Error in LLMController.generateContent:', error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }


    // Main function to handle LLM response and save it as a document
    async getLLMResponse(req, res) {
        const { id: jobAppId } = req.params;
        const userId = req.user.id; // Use authenticated user's ID
        const { settings, docType } = req.body;

        try {
            // Fetch all required data for the request
            const { userDetails, userExperiences, jobApplication } = await this.fetchRequiredData(userId, jobAppId);

            // Structure the request payload for LLM
            const llmRequest = this.structureLLMRequest(userDetails, userExperiences, jobApplication, settings);

            // Call the LLM via OpenAILLMService
            const responseContent = await this.llmService.callChatGPT(llmRequest);

            if (!responseContent) {
                throw new Error("Invalid LLM response received.");
            }

            // Store the generated content in the database via JobApplicationController
            const result = await this.jobAppController.addDocument({
                params: { id: jobAppId },
                body: {
                    docType,
                    docBody: responseContent,
                },
                user: { id: userId },
            });

            return res.json({ success: true, message: `${docType} saved successfully`, document: result });
        } catch (error) {
            console.error("Error in LLMController:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // Other methods like fetchRequiredData and structureLLMRequest would be here
}

export default new LLMController();
