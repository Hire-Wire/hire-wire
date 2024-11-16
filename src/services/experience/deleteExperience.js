// services/experience/deleteExperience.js

import db from '../../models/index.js';

const { Education, Employment, Experience } = db;

class DeleteExperience {
  constructor(experienceId, userId, id) {
    this.experienceId = experienceId;
    this.userId = userId;
    this.id = id; // ID of the Education or Employment record to delete
  }

  async call() {
    try {
      const experience = await this.#findExperience();

      if (!experience) {
        return { statusCode: 404, success: false, error: 'Experience not found' };
      }

      const deleteResult = await this.#deleteAssociatedRecord(experience);

      if (deleteResult === 0) {
        return {
          statusCode: 404,
          success: false,
          error: `${experience.experienceType} record to delete not found`,
        };
      }

      const associatedRecordsCount = await this.#countAssociatedRecords();

      if (associatedRecordsCount === 0) {
        // No associated records left, delete the Experience
        await experience.destroy();
        return {
          statusCode: 200,
          success: true,
          message: 'Experience record deleted successfully',
        };
      }
      return {
        statusCode: 200,
        success: true,
        message: `${experience.experienceType} record deleted successfully`,
      };
    } catch (e) {
      return { statusCode: 500, success: false, error: e.message };
    }
  }

  #deleteAssociatedRecord(experience) {
    if (experience.experienceType.toUpperCase() === 'EDUCATION') {
      return Education.destroy({
        where: { id: this.id, experienceId: this.experienceId },
      });
    } if (experience.experienceType.toUpperCase() === 'EMPLOYMENT') {
      return Employment.destroy({
        where: { id: this.id, experienceId: this.experienceId },
      });
    }
    throw new Error('Invalid experience type');
  }

  async #findExperience() {
    const experience = await Experience.findOne({
      where: { id: this.experienceId, userId: this.userId },
    });

    return experience;
  }

  async #countAssociatedRecords() {
    const educationCount = await Education.count({
      where: { experienceId: this.experienceId },
    });
    const employmentCount = await Employment.count({
      where: { experienceId: this.experienceId },
    });

    return educationCount + employmentCount;
  }
}

export default DeleteExperience;
