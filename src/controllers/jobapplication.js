/* eslint-disable class-methods-use-this */
import db from '../models/index.js';

const { JobApplication, JobDescription, Document } = db;

class JobApplicationController {
  /**
   * Creates a new job application and associates a job description with it.
   * @param {object} req - The request object, containing job application and job description data.
   * @param {object} res - The response object used to send back the status and result.
   */
  createJobApplication = async (req, res) => {
    const userId = req.user?.id;
    const { jobAppTitle, jobAppCompany, jobAppDescription, ...jobAppData } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    if (!jobAppTitle || !jobAppCompany || !jobAppDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job title, company, and description are required fields.',
      });
    }

    try {
      const createdJobApplication = await JobApplication.create({
        ...jobAppData,
        userId,
      });

      const createdJobDescription = await JobDescription.create({
        jobTitle: jobAppTitle,
        jobCompany: jobAppCompany,
        jobDescriptionBody: jobAppDescription,
        jobApplicationID: createdJobApplication.jobApplicationID,
      });

      createdJobApplication.setDataValue('JobDescription', createdJobDescription);

      return res.status(201).json({
        success: true,
        message: 'Job application and description created successfully.',
        jobApplication: createdJobApplication,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create job application.',
        error: error.message,
      });
    }
  };

  /**
   * Adds a document to an existing job application.
   */
  addDocument = async (req, res) => {
    const { jobApplicationID } = req.params;
    const { docType, docBody } = req.body;

    if (!docType || !docBody) {
      return res.status(400).json({
        success: false,
        message: 'Document type and content are required.',
      });
    }

    const validDocTypes = ['Resume', 'Cover Letter'];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Allowed types are "Resume" or "Cover Letter".',
      });
    }

    try {
      const jobApplication = await JobApplication.findByPk(jobApplicationID);

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found.',
        });
      }

      const newDocument = await Document.create({
        docType,
        docBody,
        jobApplicationID,
      });

      return res.status(201).json({
        success: true,
        message: 'Document added successfully.',
        document: newDocument,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add document.',
        error: error.message,
      });
    }
  };

  /**
   * Retrieves a specific job application by ID, including JobDescription and attached documents.
   */
  getJobApplication = async (req, res) => {
    const { jobApplicationID } = req.params;

    try {
      const jobApplication = await JobApplication.findOne({
        where: { jobApplicationID },
        include: [
          { model: JobDescription, as: 'JobDescription' },
          { model: Document, as: 'Documents' },
        ],
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Job application retrieved successfully.',
        jobApplication,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve job application.',
        error: error.message,
      });
    }
  };

  /**
   * Retrieves a document by its ID.
   */
  getDocumentByID = async (req, res) => {
    const { documentID } = req.params;

    try {
      const document = await Document.findByPk(documentID);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document retrieved successfully.',
        document,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve document.',
        error: error.message,
      });
    }
  };

  /**
   * Deletes a job application and all its associated job description and documents.
   */
  deleteJobApplication = async (req, res) => {
    const { jobApplicationID } = req.params;

    try {
      const jobApplication = await JobApplication.findByPk(jobApplicationID);

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found.',
        });
      }

      await jobApplication.destroy();

      return res.status(200).json({
        success: true,
        message: 'Job application and all associated data deleted successfully.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete job application.',
        error: error.message,
      });
    }
  };
}

export default new JobApplicationController();
