// services/experience/deleteExperience.js

import db from '../../models/index.js';

const { Education, Employment, Experience } = db;

class DeleteExperience {
  constructor(experienceId, userId) {
    this.experienceId = experienceId;
    this.userId = userId;
  }

  async call() {
    try {
      // Step 1: Find the Experience record
      const experience = await Experience.findOne({
        where: { id: this.experienceId, userId: this.userId },
      });

      if (!experience) {
        return { success: false, error: 'Experience not found' };
      }

      // Step 2: Delete related Education or Employment experience if present
      if (experience.experienceType.toUpperCase() === 'EDUCATION') {
        // If it's an Education experience, delete related Education record
        await Education.destroy({ where: { experienceId: this.experienceId } });
      } else if (experience.experienceType.toUpperCase() === 'EMPLOYMENT') {
        // If it's an Employment experience, delete related Employment record
        await Employment.destroy({ where: { experienceId: this.experienceId } });
      }

      // Step 3: Delete the base Experience record
      // await Experience.destroy({
      //   where: { id: this.experienceId, userId: this.userId },
      // });

      // Step 3: Delete the base Experience record
      const deleteResult = await Experience.destroy({
        where: { id: this.experienceId, userId: this.userId },
      });

      // If the deletion fails, throw an error to be caught by the controller
      if (deleteResult === 0) {
        throw new Error('Failed to delete experience');
}


      return { success: true, message: 'Experience deleted successfully' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

}

export default DeleteExperience;
