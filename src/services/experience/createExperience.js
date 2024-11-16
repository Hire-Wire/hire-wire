/*
  eslint class-methods-use-this: [
  "error", { "exceptMethods": ["#createEducation", "#createEmployment"] }
  ]
*/
import db from '../../models/index.js';

const { Experience, Employment, Education, User } = db;

class CreateExperience {
  static EDUCATION = 'EDUCATION';

  static EMPLOYMENT = 'EMPLOYMENT';

  constructor(experience, userId) {
    this.experience = experience;
    this.userId = userId;
  }

  async call() {
    try {
      const user = await this.#findUser();
      if (!user) { throw new Error('User not found'); }

      const { experienceType, organizationName } = this.experience;

      let baseExperience = await this.#findExistingExperience();
      if (!baseExperience) {
        baseExperience = await Experience.create(
          { experienceType, organizationName, userId: user.id }
        );
      }

      const result = await this.#processExperienceType(experienceType, baseExperience.id);
      if (result) { return result; }

      return {
        statusCode: 201,
        success: true,
        message: 'Experience created successfully',
        experience: baseExperience,
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async #processExperienceType(experienceType, experienceId) {
    if (experienceType.toUpperCase() === CreateExperience.EDUCATION) {
      // eslint-disable-next-line no-unused-vars
      const [education, created] = await this.#createEducation(
        this.experience.education,
        experienceId
      );
      if (!created) {
        return {
          statusCode: 403,
          message: 'Education already exists',
          success: false,
        };
      }
    } else if (experienceType.toUpperCase() === CreateExperience.EMPLOYMENT) {
      // eslint-disable-next-line no-unused-vars
      const [employment, created] = await this.#createEmployment(
        this.experience.employment,
        experienceId
      );
      if (!created) {
        return {
          statusCode: 403,
          message: 'Employment already exists',
          success: false,
        };
      }
    } else {
      throw new Error('Invalid experience type');
    }
    // No need to return anything if creation is successful
    return null;
  }

  async #findExistingExperience() {
    const existingExperience = await Experience.findOne({
      where: { organizationName: this.experience.organizationName, userId: this.userId },
    });

    return existingExperience;
  }

  async #findUser() {
    const user = await User.findByPk(this.userId);
    return user;
  }

  #createEducation(educationData, experienceId) {
    const { degree, ...rest } = educationData;
    return Education.findOrCreate({ where: { degree, experienceId }, defaults: { ...rest } });
  }

  #createEmployment(employmentData, experienceId) {
    const { jobTitle, ...rest } = employmentData;
    return Employment.findOrCreate({ where: { jobTitle, experienceId }, defaults: { ...rest } });
  }
}

export default CreateExperience;
