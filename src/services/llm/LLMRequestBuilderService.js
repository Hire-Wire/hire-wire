class LLMRequestBuilderService {
  constructor(
    userDetails,
    userEmploymentExperiences,
    userEducationExperiences,
    jobApplicationDetails,
    customPrompt
  ) {
    this.userDetails = userDetails;
    this.userEmploymentExperiences = Array.isArray(userEmploymentExperiences)
      ? userEmploymentExperiences
      : [];
    this.userEducationExperiences = Array.isArray(userEducationExperiences)
      ? userEducationExperiences
      : [];
    this.jobDescription = jobApplicationDetails;
    this.customPrompt = customPrompt;
  }

  async call() {
    try {
      return await this.#structureLLMRequest();
    } catch (error) {
      throw new Error(`Failed to prepare LLM request data: ${error.message}`);
    }
  }

  // Structure the LLM request data
  #structureLLMRequest() {
    return new Promise((resolve, reject) => {
      try {
        // Process Employment Experiences
        const workExperiences = this.userEmploymentExperiences.map(exp => ({
          workExperienceID: exp.id || 'N/A',  // Handle case where no ID is available
          companyName: exp.organizationName || 'N/A',
          jobTitle: exp.jobTitle || 'N/A',
          startDate: exp.startDate || 'N/A',
          endDate: exp.endDate || 'N/A',
          description: exp.jobDescription || 'N/A',
        }));

        // Process Education Experiences
        const educations = this.userEducationExperiences.map(edu => ({
          educationID: edu.id || 'N/A',  // Handle case where no ID is available
          institutionName: edu.organizationName || 'N/A',
          degree: edu.degree || 'N/A',
          startYear: edu.startDate ? new Date(edu.startDate).getFullYear() : null,
          endYear: edu.endDate ? new Date(edu.endDate).getFullYear() : null,
        }));

        // Construct the final request payload
        const requestPayload = {
          user: {
            userID: this.userDetails.id || 'N/A',
            firstName: this.userDetails.firstName || 'N/A',
            lastName: this.userDetails.lastName || 'N/A',
            email: this.userDetails.email || 'N/A',
            phone: this.userDetails.phoneNumber || 'N/A',
          },
          workExperiences,
          educations,
          jobDescription: this.jobDescription || 'N/A',  // Handle case if no jobDescription is provided
          customizationPrompt: this.customPrompt || 'N/A',  // Handle case if no customPrompt is provided
          devSettings: {
            rawText: true,
          },
        };

        resolve(requestPayload);
      } catch (error) {
        reject(new Error(`Error structuring LLM request: ${error.message}`));
      }
    });
  }
}

export default LLMRequestBuilderService;
