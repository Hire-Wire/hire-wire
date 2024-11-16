import UserController from './../../controllers/user.js';

class RetrieveUserProfileService {
  constructor(userId, authToken) {
    this.userId = userId;
    this.authToken = authToken;
  }

  async call() {
    console.log(`[INFO] Starting profile retrieval for userId: ${this.userId}`);
    try {
      const userDetails = await this.#fetchUserProfile();
      console.log('[INFO] Successfully fetched user details:', userDetails);
      return userDetails;
    } catch (error) {
      console.error(`[ERROR] Error fetching user profile: ${error.message}`);
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }

  async #fetchUserProfile() {
    console.log(`[INFO] Invoking UserController.view for userId: ${this.userId}`);
    try {
      const req = {
        params: { id: this.userId },
        user: { id: this.userId },
        headers: { authorization: `Bearer ${this.authToken}` },
      };

      const res = {
        json(data) {
          console.log('[INFO] User details fetched successfully.');
          return data;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
      };

      return await UserController.view(req, res);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch user details: ${error.message}`);
      throw new Error(`Failed to fetch user details: ${error.message}`);
    }
  }
}

export default RetrieveUserProfileService;
