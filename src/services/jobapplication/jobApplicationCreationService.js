import db from '../../models/index.js';
const { JobApplication, JobDescription, User } = db;

class JobApplicationCreationService {
  constructor(
    inputUserId,
    inputJobAppDescription = {}
  ) {
    this.userId = inputUserId;
    this.jobDescriptionInfo = inputJobAppDescription;
  }

  async call() {
    try {
      // Step 1: Check if the user exists
      const user = await this.#findUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Step 2: Validate job application fields
      this.#validateFields();

      // Step 3: Create Job Application
      const createdJobApplication = await JobApplication.create({
        userId: this.userId,
      });

      // Step 4: Create Job Description
      const createdJobDescription = await JobDescription.create({
        jobTitle: this.jobDescriptionInfo.jobTitle,
        jobCompany: this.jobDescriptionInfo.jobCompany,
        jobDescriptionBody: this.jobDescriptionInfo.jobDescriptionBody,
        jobApplicationId: createdJobApplication.id,
      });

      // Step 5: Associate JobDescription with JobApplication
      // Manual update if setJobDescription is not available
      await createdJobDescription.update({ jobApplicationId: createdJobApplication.id });

      return createdJobDescription; // Return the created job description
    } catch (error) {
      throw new Error(`Failed to create job application: ${error.message}`);
    }
  }

  // Private method to find user by userId
  async #findUser() {
    const user = await User.findByPk(this.userId);
    return user;
  }

  // Private method to validate fields
  #validateFields() {
    if (
      !this.userId
      || !this.jobDescriptionInfo.jobTitle
      || !this.jobDescriptionInfo.jobCompany
      || !this.jobDescriptionInfo.jobDescriptionBody) {
      throw new Error('Missing required fields for job application creation.');
    }
    if (this.jobDescriptionInfo.jobTitle.length < 2
      || this.jobDescriptionInfo.jobTitle.length > 100) {
      throw new Error('Job title must be between 2 and 100 characters.');
    }
  }
}

export default JobApplicationCreationService;
