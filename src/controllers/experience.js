/* eslint-disable class-methods-use-this */

import { validationResult } from 'express-validator';
import db from '../models/index.js';
import CreateExperience from '../services/experience/createExperience.js';
import UpdateExperience from '../services/experience/updateExperience.js';
import DeleteExperience from '../services/experience/deleteExperience.js';

const { Experience, Employment, Education, User } = db;

class ExperienceController {
  async create(req, res) {
    // Validate the request
    const errors = validationResult(req);
    // Collect errors from express-validator and manual validation
    const validationErrors = errors.array();

    // Manually validate experienceType and organizationName
    const { experienceType, organizationName } = req.body;

    if (!experienceType || typeof experienceType !== 'string' || experienceType.trim() === '') {
      validationErrors.push({
        param: 'experienceType',
        msg: 'experienceType is required and must be a non-empty string.',
      });
    }

    if (
      !organizationName
        || typeof organizationName !== 'string'
        || organizationName.trim() === ''
    ) {
      validationErrors.push({
        param: 'organizationName',
        msg: 'organizationName is required and must be a non-empty string.',
      });
    }

    // If there are validation errors, return 400 with the errors
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    try {
      // Delegate creation to the service layer
      const response = await new CreateExperience(req.body, req.user.id).call();
      const { statusCode, ...rest } = response;
      return res.status(statusCode).json(rest);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create experiences',
        error: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.user.id;

      // Fetch all experiences for the user
      const experiences = await Experience.findAll({
        where: { userID: userId },
        include: [
          {
            model: Education,
            required: false,
            // Only include if type is Education
            where: { '$Experience.ExperienceType$': 'Education' },
          },
          {
            model: Employment,
            required: false,
            // Only include if type is Employment
            where: { '$Experience.ExperienceType$': 'Employment' },
          },
        ],
      });

      return res.status(200).json({
        success: true,
        experiences,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve experiences',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updatedData = req.body;

    const updateService = new UpdateExperience(id, userId, updatedData);
    try {
      const result = await updateService.call();

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        updatedExperience: result.updatedExperience,
      });
    } catch (error) {
      // Check for specific error message and return a 404 if it's "Experience not found"
      if (error.message === 'Experience not found') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({ message: 'Failed to update experience' });
    }
  }

  async remove(req, res) {
    const { experienceId } = req.params;
    const userId = req.user.id;
    const { id } = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) { throw new Error('User not found'); }

      const deleteService = new DeleteExperience(experienceId, user.id, id);
      const response = await deleteService.call();
      const { statusCode, ...rest } = response;
      return res.status(statusCode).json(rest);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete experience',
        error: error.message,
      });
    }
  }
}

export default new ExperienceController();
