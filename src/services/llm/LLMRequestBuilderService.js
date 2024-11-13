import UserDataService from '../user/userDataService.js'; // Importing the new UserDataService class

class LLMRequestBuilderService {
  constructor(userId, createdJobDescription, customPrompt) {
    this.userId = userId;
    this.jobDescription = createdJobDescription;
    this.customPrompt = customPrompt;
  }

  async call() {
    try {
      const { userDetails, userExperiences } = await this.#fetchRequiredData();
      const requestData = this.#structureLLMRequest(userDetails, userExperiences);
      return requestData;
    } catch (error) {
      throw new Error(`Failed to prepare LLM request data: ${error.message}`);
    }
  }

  // Fetch user details and experiences using UserDataService
  async #fetchRequiredData() {
    try {
      const userDataService = new UserDataService(this.userId);
      const { userDetails, userExperiences } = await userDataService.getUserData();
      return { userDetails, userExperiences };
    } catch (error) {
      throw error; // Propagate the error to be handled in the calling method
    }
  }

  // Structure the LLM request data
  #structureLLMRequest(user, experiences) {
    // Ensure experiences is an array before using .filter() and .map()
    const validExperiences = Array.isArray(experiences) ? experiences : [];

    const structuredData = {
      user: {
        userID: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phoneNumber,
      },
      workExperiences: validExperiences
        .filter(exp => exp.type === 'Employment')
        .map(exp => ({
          workExperienceID: exp.id,
          companyName: exp.organizationName,
          jobTitle: exp.Employment?.[0]?.jobTitle || 'N/A',
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.Employment?.[0]?.jobDescription || 'N/A',
        })),
      educations: validExperiences
        .filter(exp => exp.type === 'Education')
        .map(edu => ({
          educationID: edu.id,
          institutionName: edu.organizationName,
          degree: edu.Education?.[0]?.degree || 'N/A',
          startYear: edu.startDate ? new Date(edu.startDate).getFullYear() : null,
          endYear: edu.endDate ? new Date(edu.endDate).getFullYear() : null,
        })),
      jobDescription: this.jobDescription,
      customizationPrompt: this.customPrompt,
      devSettings: {
        rawText: true,
      },
    };

    return structuredData;
  }
}

export default LLMRequestBuilderService;
