// src/services/jobapplicationcreationservice.js

import JobApplication from '../../controllers/jobapplication.js';

class createJobApplication {
  async createJobApplication(userId, jobAppTitle, jobAppCompany, jobAppDescription, jobAppData = {}) {
    if (!userId || !jobAppTitle || !jobAppCompany || !jobAppDescription) {
      throw new Error('Missing required fields for job application creation.');
    }

    if (jobAppTitle.length < 2 || jobAppTitle.length > 100) {
      throw new Error('Job title must be between 2 and 100 characters.');
    }

    const createdJobApplication = await JobApplication.create({
      ...jobAppData,
      userId,
    });

    const createdJobDescription = await JobDescription.create({
      jobTitle: jobAppTitle,
      jobCompany: jobAppCompany,
      jobDescriptionBody: jobAppDescription,
      jobApplicationId: createdJobApplication.id,
    });

    await createdJobApplication.setDataValue('JobDescription', createdJobDescription);

    return createdJobApplication;
  }
}

export default new createJobApplication();
