import ExperienceController from '../../controllers/experience.js';
import formatExperience from './utils/formatExperience.js';

class RetrieveUserExperiencesService {
  constructor(userId, authToken) {
    this.userId = userId;
    this.authToken = authToken;
  }

  async call() {
    const experiences = await this.#fetchUserExperiences();
    const formattedExperiences = formatExperience(experiences);

    if (
      (!formattedExperiences.employments || formattedExperiences.employments.length === 0) &&
      (!formattedExperiences.educations || formattedExperiences.educations.length === 0)
    ) {
      throw new Error('No experiences found for the user.');
    }

    return formattedExperiences;
  }

  async #fetchUserExperiences() {
    const req = {
      user: { id: this.userId },
      headers: { authorization: `Bearer ${this.authToken}` },
    };

    const res = {
      json(data) {
        return data.experiences;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
    };

    const response = await ExperienceController.getAll(req, res);

    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response format from ExperienceController.getAll.');
    }

    return response;
  }
}

export default RetrieveUserExperiencesService;
