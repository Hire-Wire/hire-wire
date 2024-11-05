//src/controllers/experience.js 

import db from '../models/index.js';

const { Experience, Employment, Education } = db;

class ExperienceController {
    createExperience = async (req, res) => {
        const userId = req.user.id;
        try {
          const experiences = await Promise.all(req.body.map(exp =>
            Experience.create({ ...exp, UserID: userId })));
          return res.status(201).json({
            success: true, 
            message: 'Experiences created successfully',
            experiences});
        } catch (error) {
          return res.status(400).json({ 
            success: false,
            message: 'Failed to created experiences',
            error: error.message });
        }
      };
      
      getUserExperiences = async (req, res) => {
        const userId = req.user.id;
      
        try {
          const experiences = await Experience.findAll({
            where: { UserID: userId },
            include: [Employment, Education],
          });
          return res.status(200).json({
            success: true, 
            message: 'Retrieved experiences successfully',
            experiences});
        } catch (error) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve experiences',
            error: error.message });
        }
      };
      
      updateExperience = async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
      
        try {
          const [updated] = await Experience.update(req.body, {
            where: { ExperienceID: id, UserID: userId },
          });
      
          if (updated) {
            const updatedExperience = await Experience.findByPk(id, {
              include: [Employment, Education],
            });
            return res.status(200).json({
              success: true, 
              message: 'Experience updated successfully',
              updatedExperience});
          }
      
          return res.status(404).json({ error: 'Experience not found' });
        } catch (error) {
          return res.status(400).json({ 
            success: false, 
            message: 'Failed to update experience', 
            error: error.message });
        }
      };
      
      deleteExperience = async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
      
        try {
          const deleted = await Experience.destroy({
            where: { ExperienceID: id, UserID: userId },
          });
      
          if (deleted) {
            return res.status(204).send();
          }
      
          return res.status(404).json({ 
            success: false, 
            message: 'Experience not found',
            });
        } catch (error) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to delete experience', 
            error: error.message });
        }
      };
      
};

export default new ExperienceController();