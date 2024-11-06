//src/controllers/experience.js 

import db from '../models/index.js';

const { Experience, Employment, Education } = db;

class ExperienceController {
  createExperience = async (req, res) => {
    const userId = req.user.id;
    try {
        let experiences = req.body;

        // If the request body is not an array (i.e., single experience object), wrap it in an array
        if (!Array.isArray(experiences)) {
            experiences = [experiences];
        }

        // Map over the array of experiences and create each one
        const createdExperiences = await Promise.all(
            experiences.map(exp =>
                Experience.create({ ...exp, UserID: userId })
            )
        );

        return res.status(201).json({
            success: true,
            message: 'Experiences created successfully',
            experiences: createdExperiences
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to create experiences',
            error: error.message
        });
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