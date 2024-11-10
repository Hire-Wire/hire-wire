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
      // Ensure the created job application and job description are completed before proceeding
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

      // Set job description on job application
      await createdJobApplication.setDataValue('JobDescription', createdJobDescription);

      return res.status(201).json({
        success: true,
        message: 'Job application and description created successfully.',
        jobApplication: createdJobApplication,
      });
    } catch (error) {
      console.error('Error in createJobApplication:', error);
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
    console.log('addDocument route reached with jobApplicationId:', req.params.id);
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

      // Await document creation to ensure successful creation before sending response
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
      console.error('Error in addDocument:', error);
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
      console.error('Error in getJobApplication:', error);
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
      console.error('Error in getDocumentByID:', error);
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

      // Await deletion to ensure completion before responding
      await jobApplication.destroy();

      return res.status(200).json({
        success: true,
        message: 'Job application and all associated data deleted successfully.',
      });
    } catch (error) {
      console.error('Error in deleteJobApplication:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete job application.',
        error: error.message,
      });
    }
  };
}

export default new JobApplicationController();
