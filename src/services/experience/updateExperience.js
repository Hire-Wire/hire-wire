import db from '../../models/index.js';

const { Experience, Employment, Education } = db;

class UpdateExperience {
  constructor(experienceId, userId, updatedData) {
    this.experienceId = experienceId;
    this.userId = userId;
    this.updatedData = updatedData;
  }

  async call() {
    try {
      // Step 1: Update the base experience fields
      const [updated] = await Experience.update(this.updatedData, {
        where: { id: this.experienceId, userId: this.userId },
      });

      if (!updated) {
        return { success: false, error: 'Experience not found' };
      }

      // Step 2: Update related Employment or Education details if present in the updatedData
      const experienceType = this.updatedData.experienceType
        ? this.updatedData.experienceType.toUpperCase()
        : null;

      if (experienceType === 'EMPLOYMENT' && this.updatedData.employment) {
        await this.#updateEmployment(this.updatedData.employment);
      } else if (experienceType === 'EDUCATION' && this.updatedData.education) {
        await this.#updateEducation(this.updatedData.education);
      }

      // Step 3: Fetch and return the updated experience with associations
      const updatedExperience = await Experience.findByPk(this.experienceId, {
        include: [Employment, Education],
      });

      return {
        success: true,
        message: 'Experience updated successfully',
        updatedExperience,
      };
    } catch (e) {
      throw new Error(e.message);
      // return { success: false, error: e.message };
    }
  }

  // Private method to update Employment details
  async #updateEmployment(employmentData) {
    await Employment.update(employmentData, {
      where: { experienceId: this.experienceId },
    });
  }

  // Private method to update Education details
  async #updateEducation(educationData) {
    await Education.update(educationData, {
      where: { experienceId: this.experienceId },
    });
  }
}

export default UpdateExperience;
