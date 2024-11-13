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
      console.log(`Checking if user with ID ${this.userId} exists...`);
      const user = await this.#findUser();
      if (!user) {
        console.error('User not found');
        throw new Error('User not found');
      }
      console.log('User found:', user.toJSON());

      // Step 2: Validate job application fields
      console.log('Validating job application fields...');
      this.#validateFields();
      console.log('Job application fields validated.');

      // Step 3: Create Job Application
      console.log('Creating job application...');
      const createdJobApplication = await JobApplication.create({
        userId: this.userId,
      });
      console.log('Job application created:', createdJobApplication.toJSON());

      // Step 4: Create Job Description
      console.log('Creating job description with data:', this.jobDescriptionInfo);
      const createdJobDescription = await JobDescription.create({
        jobTitle: this.jobDescriptionInfo.jobTitle,
        jobCompany: this.jobDescriptionInfo.jobCompany,
        jobDescriptionBody: this.jobDescriptionInfo.jobDescriptionBody,
        jobApplicationId: createdJobApplication.id,
      });
      console.log('Job description created:', createdJobDescription.toJSON());

      // Step 5: Associate JobDescription with JobApplication
      console.log('Associating job description with job application...');
      await createdJobDescription.update({ jobApplicationId: createdJobApplication.id });
      console.log('Association updated successfully.');

      return createdJobDescription; // Return the created job description
    } catch (error) {
      console.error('Error in creating job application:', error.message);
      throw new Error(`Failed to create job application: ${error.message}`);
    }
  }

  // Private method to find user by userId
  async #findUser() {
    const user = await User.findByPk(this.userId);
    console.log('User lookup result:', user ? user.toJSON() : 'User not found');
    return user;
  }

  // Private method to validate fields
  #validateFields() {
    console.log('Validating fields:', this.jobDescriptionInfo);
    if (
      !this.userId
      || !this.jobDescriptionInfo.jobTitle
      || !this.jobDescriptionInfo.jobCompany
      || !this.jobDescriptionInfo.jobDescriptionBody) {
      console.error('Validation failed: Missing required fields');
      throw new Error('Missing required fields for job application creation.');
    }
    if (this.jobDescriptionInfo.jobTitle.length < 2
      || this.jobDescriptionInfo.jobTitle.length > 100) {
      console.error('Validation failed: Job title length out of bounds');
      throw new Error('Job title must be between 2 and 100 characters.');
    }
    console.log('Fields validated successfully.');
  }
}

export default JobApplicationCreationService;
