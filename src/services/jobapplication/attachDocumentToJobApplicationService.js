import db from '../../models/index.js';
const { Document, JobApplication } = db;

class AttachDocumentToJobApplicationService {
  constructor(jobAppId, docType, docBody, userId) {
    this.jobAppId = jobAppId;
    this.docType = docType;
    this.docBody = docBody;
    this.userId = userId;
  }

  async call() {
    try {
      this.#validateDocumentType();

      const jobApplication = await this.#findJobApplication();
      if (!jobApplication) {
        throw new Error('Job application not found or access denied.');
      }

      const newDocument = await Document.create({
        docType: this.docType,
        docBody: this.docBody,
        jobApplicationId: this.jobAppId,
      });

      return newDocument;
    } catch (error) {
      throw error;
    }
  }

  #validateDocumentType() {
    const validDocTypes = ['Resume', 'Cover Letter'];

    if (!this.docType || !this.docBody) {
      throw new Error('Document type and content are required.');
    }

    if (!validDocTypes.includes(this.docType)) {
      throw new Error('Invalid document type. Allowed types are "Resume" or "Cover Letter".');
    }
  }

  #findJobApplication() {
    return JobApplication.findOne({
      where: { id: this.jobAppId, userId: this.userId },
    });
  }
}

export default AttachDocumentToJobApplicationService;
