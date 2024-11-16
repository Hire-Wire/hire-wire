import ExperienceController from '../../controllers/experience.js';
import formatExperience from './utils/formatExperience.js';

class RetrieveUserExperiencesService {
  constructor(userId, authToken) {
    this.userId = userId;
    this.authToken = authToken;
  }

  async call() {
    console.log(`[INFO] Starting experiences retrieval for userId: ${this.userId}`);
    try {
      const experiences = await this.#fetchUserExperiences();
      const formattedExperiences = formatExperience(experiences);
      console.log('[INFO] Successfully formatted user experiences:', formattedExperiences);

      if (
        (!formattedExperiences.employments || formattedExperiences.employments.length === 0) &&
        (!formattedExperiences.educations || formattedExperiences.educations.length === 0)
      ) {
        console.error('[ERROR] No experiences found for the user.');
        throw new Error('No experiences found for the user.');
      }

      return formattedExperiences;
    } catch (error) {
      console.error(`[ERROR] Error fetching or formatting user experiences: ${error.message}`);
      throw new Error(`Error fetching or formatting user experiences: ${error.message}`);
    }
  }

  async #fetchUserExperiences() {
    console.log('[INFO] Invoking ExperienceController.getAll for user experiences.');
    try {
      const req = {
        user: { id: this.userId },
        headers: { authorization: `Bearer ${this.authToken}` },
      };

      const res = {
        json(data) {
          console.log('[INFO] User experiences fetched successfully.');
          return data.experiences;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
      };

      const response = await ExperienceController.getAll(req, res);

      if (!response || !Array.isArray(response)) {
        console.error('[ERROR] Invalid response format from ExperienceController.getAll.');
        throw new Error('Invalid response format from ExperienceController.getAll.');
      }

      return response;
    } catch (error) {
      console.error(`[ERROR] Failed to fetch user experiences: ${error.message}`);
      throw new Error(`Failed to fetch user experiences: ${error.message}`);
    }
  }
}

export default RetrieveUserExperiencesService;
