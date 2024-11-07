/* eslint-disable class-methods-use-this */
import db from '../models/index.js';

const { JobApplication, JobDescription, Document } = db;

class JobApplicationController {
  /**
   * Creates a new job application and associates a job description with it.
   * @param {object} req - The request object, containing job application and job description data.
   * @param {object} res - The response object used to send back the status and result.
   * @returns {Promise<void>} - Returns a JSON response indicating success or failure.
   */
  createJobApplication = async (req, res) => {
    // Extract user ID from the authenticated request object
    const userId = req.user.id;

    // Destructure required fields for job description from the request body
    const { jobAppTitle, jobAppCompany, jobAppDescription, ...jobAppData } = req.body;

    // Validate that all required job description data is provided
    if (!jobAppTitle || !jobAppCompany || !jobAppDescription) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete job description data provided',
      });
    }

    try {
      // Create the JobApplication instance with user-provided data and associate it with userId
      const createdJobApplication = await JobApplication.create({
        ...jobAppData,
        userId,
      });

      // Create the JobDescription and associate it with the created JobApplication's ID
      createdJobApplication.JobDescription = await JobDescription.create({
        jobTitle: jobAppTitle,
        jobCompany: jobAppCompany,
        jobDescription: jobAppDescription,
        jobApplicationID: createdJobApplication.jobApplicationID, // Associate with foreign key
      });

      // Send a success response with the created job application and description
      return res.status(201).json({
        success: true,
        message: 'Job application and description created successfully',
        jobApplication: createdJobApplication,
      });
    } catch (error) {
      // Handle errors by returning a 400 status with the error message
      return res.status(400).json({
        success: false,
        message: 'Failed to create job application',
        error: error.message,
      });
    }
  };

  /**
   * Adds a document to an existing job application.
   * @param {object} req - The request object, containing document data.
   * @param {object} res - The response object used to send back the status and result.
   * @returns {Promise<void>} - Returns a JSON response indicating success or failure.
   */
  addDocument = async (req, res) => {
    const { jobApplicationID } = req.params;
    const { docType, docBody } = req.body;

    if (!docType || !docBody) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete document data provided',
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
          message: 'Job application not found',
        });
      }

      const newDocument = await Document.create({
        docType,
        docBody,
        jobApplicationID, // Associate with the JobApplication's ID
      });

      return res.status(201).json({
        success: true,
        message: 'Document added successfully',
        document: newDocument,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add document',
        error: error.message,
      });
    }
  };

  /**
   * Retrieves a specific job application by ID.
   * Includes JobDescription and attached documents
   * @param {object} req - The request object, with jobApplicationID in the URL parameters.
   * @param {object} res - The response object used to send back the status and result.
   * @returns {Promise<void>} - JSON response contains entire JobApplication data
   */
  getJobApplication = async (req, res) => {
    // Extract jobApplicationID from the request parameters
    const { jobApplicationID } = req.params;

    try {
      // Find the JobApplication by its jobApplicationID
      const jobApplication = await JobApplication.findOne({
        where: { jobApplicationID },
        include: [
          {
            model: JobDescription,
            as: 'JobDescription',
          },
          {
            model: Document,
            as: 'Documents',
          },
        ],
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Retrieved job application successfully',
        jobApplication,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve job application',
        error: error.message,
      });
    }
  };

  /**
   * Retrieves a document by its ID.
   * @param {object} req - The request object, containing document ID in params.
   * @param {object} res - The response object used to send back the status and result.
   * @returns {Promise<void>} - Returns a JSON response with the document or an error message.
   */
  getDocumentByID = async (req, res) => {
    const { documentID } = req.params;

    try {
      // Find the document by its primary key (docId)
      const document = await Document.findByPk(documentID);

      // Check if the document exists
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Return the document data if found
      return res.status(200).json({
        success: true,
        message: 'Document retrieved successfully',
        document,
      });
    } catch (error) {
      // Handle errors by returning a 500 status with the error message
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve document',
        error: error.message,
      });
    }
  };

  /**
   * Deletes a job application and all its associated job description and documents.
   * @param {object} req - The request object, containing jobApplicationID in the parameters.
   * @param {object} res - The response object used to send back the status and result.
   * @returns {Promise<void>} - Returns a JSON response indicating success or failure.
   */
  deleteJobApplication = async (req, res) => {
    const { jobApplicationID } = req.params;

    try {
      const jobApplication = await JobApplication.findByPk(jobApplicationID);

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found',
        });
      }

      // Delete the JobApplication (CASCADE)
      await jobApplication.destroy();

      return res.status(200).json({
        success: true,
        message: 'Job application and all associated data deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete job application',
        error: error.message,
      });
    }
  };
}

export default new JobApplicationController();
