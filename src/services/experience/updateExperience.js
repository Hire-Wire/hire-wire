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
      const { organizationName } = this.updatedData;
      const [updated] = await Experience.update({ organizationName }, {
        where: { id: this.experienceId, userId: this.userId },
      });

      if (!updated) {
        return { success: false, error: 'Experience not found' };
      }

      const experienceType = this.updatedData.experienceType
        ? this.updatedData.experienceType.toUpperCase()
        : null;

      if (experienceType === 'EMPLOYMENT' && this.updatedData.employment) {
        await this.#updateEmployment(this.updatedData.employment);
      } else if (experienceType === 'EDUCATION' && this.updatedData.education) {
        await this.#updateEducation(this.updatedData.education);
      }

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
    }
  }

  async #updateEmployment(employmentData) {
    await Employment.update(employmentData, {
      where: { experienceId: this.experienceId, id: employmentData.id },
    });
  }

  async #updateEducation(educationData) {
    await Education.update(educationData, {
      where: { experienceId: this.experienceId, id: educationData.id },
    });
  }
}

export default UpdateExperience;
