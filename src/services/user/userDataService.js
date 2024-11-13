import request from 'supertest';
import app from '../../../server.js'; // Path to your server.js where Express is set up
import Authenticate from '../../utils/Authenticate.js';

class UserDataService {
  constructor(userId) {
    this.userId = userId;
  }

  async getUserData() {
    try {
      const userDetails = await this.#fetchUserDetails();
      const userExperiences = await this.#fetchUserExperiences();

      return { userDetails, userExperiences };
    } catch (error) {
      throw new Error(`Error fetching user data: ${error.message}`);
    }
  }

  // Fetch user details using the user endpoint
  async #fetchUserDetails() {
    // Assuming you have an authentication method to generate a token
    const authToken = await Authenticate.generateToken({ id: this.userId });

    const res = await request(app)
      .get(`/api/v1/users/${this.userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    if (res.status !== 200) {
      throw new Error(`Failed to fetch user details: ${res.body.message}`);
    }

    return res.body; // Assuming the user details are in the response body
  }

  // Fetch user experiences using the experiences endpoint
  async #fetchUserExperiences() {
    // Assuming you have an authentication method to generate a token
    const authToken = await Authenticate.generateToken({ id: this.userId });

    const res = await request(app)
      .get('/api/v1/experiences') // Replace with the correct endpoint for user experiences
      .set('Authorization', `Bearer ${authToken}`);

    if (res.status !== 200) {
      throw new Error(`Failed to fetch user experiences: ${res.body.message}`);
    }

    return res.body; // Assuming the user experiences are in the response body
  }
}

export default UserDataService;
