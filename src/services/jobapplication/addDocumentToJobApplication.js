// src/services/jobapplicationdocumentservice.js

import JobApplication from '../../controllers/jobapplication.js';
import Document from '../../models/document.js';
import createJobApplication from '../services/jobapplicationcreationservice.js';
import addDocumentToJobApplication from '../services/jobapplicationdocumentservice.js';

class addDocumentToJobApplication {
  async addDocumentToJobApplication(jobAppId, docType, docBody, userId) {
    // Validate required fields
    if (!docType || !docBody) {
      throw new Error('Document type and content are required.');
    }

    // Validate document type
    const validDocTypes = ['Resume', 'Cover Letter'];
    if (!validDocTypes.includes(docType)) {
      throw new Error('Invalid document type. Allowed types are "Resume" or "Cover Letter".');
    }

    // Check if the job application exists and belongs to the user
    const jobApplication = await JobApplication.findOne({
      where: { id: jobAppId, userId },
    });

    if (!jobApplication) {
      throw new Error('Job application not found or access denied.');
    }

    // Create and associate the document with the job application
    const newDocument = await Document.create({
      docType,
      docBody,
      jobApplicationId: jobAppId,
    });

    return newDocument;
  }
}

export default new addDocumentToJobApplication();
