/* eslint-disable class-methods-use-this */
import db from '../models/index.js';

const { JobApplication, JobDescription, Document } = db;

class JobApplicationController {
  /**
   * Creates a new job application and associates a job description with it.
   */

// SQL Query for inserting a new job application
// INSERT INTO job_applications (userId)
// VALUES (userId);

// SQL Query for inserting a new job description associated with the job application
// INSERT INTO job_descriptions (jobTitle, jobCompany, jobDescriptionBody, jobApplicationId)
// VALUES (jobAppTitle, jobAppCompany, jobAppDescription, jobApplicationId);
  createJobApplication = async (req, res) => {
    const userId = req.user?.id;
    const { jobAppTitle, jobAppCompany, jobAppDescription, ...jobAppData } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    if (!jobAppTitle || jobAppTitle.length < 2 || jobAppTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required and must be between 2 and 100 characters.',
      });
    }

    if (!jobAppCompany || !jobAppDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job company and description are required fields.',
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
        jobApplicationId: createdJobApplication.id,
      });

      await createdJobApplication.setDataValue('JobDescription', createdJobDescription);

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
  // SQL Query for inserting a new document for the job application
  // INSERT INTO documents (docType, docBody, jobApplicationId)
  // VALUES (docType, docBody, jobApplicationId);
  addDocument = async (req, res) => {
    const { id } = req.params;
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
      const jobApplication = await JobApplication.findOne({
        where: { id, userId: req.user.id },
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found or access denied.',
        });
      }

      const newDocument = await Document.create({
        docType,
        docBody,
        jobApplicationId: id,
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
// SQL Query for retrieving a job application along with its job description and documents
// SELECT * 
// FROM job_applications ja
// LEFT JOIN job_descriptions jd ON jd.jobApplicationId = ja.id
// LEFT JOIN documents d ON d.jobApplicationId = ja.id
// WHERE ja.id = jobApplicationId AND ja.userId = userId;
  getJobApplication = async (req, res) => {
    const { id } = req.params;

    try {
      const jobApplication = await JobApplication.findOne({
        where: { id, userId: req.user.id },
        include: [
          { model: JobDescription, as: 'JobDescription' },
          { model: Document, as: 'Documents' },
        ],
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found or access denied.',
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
  // SQL Query for retrieving a specific document by its ID
  // SELECT * 
  // FROM documents
  // WHERE id = documentId;
  getDocumentByID = async (req, res) => {
    const { id } = req.params;

    try {
      const document = await Document.findByPk(id);

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
  
// SQL Query for deleting the job application and all associated job description and documents
// DELETE FROM documents
// WHERE jobApplicationId = jobApplicationId;

// DELETE FROM job_descriptions
// WHERE jobApplicationId = jobApplicationId;

// DELETE FROM job_applications
// WHERE id = jobApplicationId AND userId = userId;
  deleteJobApplication = async (req, res) => {
    const { id } = req.params;

    try {
      const jobApplication = await JobApplication.findOne({
        where: { id, userId: req.user.id },
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found or access denied.',
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
