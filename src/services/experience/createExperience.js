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

      if (experienceType.toUpperCase() === CreateExperience.EDUCATION) {
        await this.#createEducation(this.experience.education, baseExperience.id);
      } else if (experienceType.toUpperCase() === CreateExperience.EMPLOYMENT) {
        await this.#createEmployment(this.experience.employment, baseExperience.id);
      }

      return baseExperience;
    } catch (e) {
      throw new Error(e.message);
    }
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

  #createEducation(education, experienceId) {
    if (Array.isArray(education) && education.length > 0) {
      // Loop through the education array and create a new Education entry for each item
      return Promise.all(education.map(edu => 
        Education.create({ ...edu, experienceId })
      ));
    }

    // return Education.create({ ...education, experienceId });
  }

  #createEmployment(employment, experienceId) {

    if (Array.isArray(employment) && employment.length > 0) {
      // Loop through the employment array and create a new Employment entry for each item
      return Promise.all(employment.map(emp => 
        Employment.create({ ...emp, experienceId })
      ));
    }
    // return Employment.create({ ...employment, experienceId });
  }
}

export default CreateExperience;
