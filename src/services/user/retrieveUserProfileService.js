import UserController from './../../controllers/user.js';

class RetrieveUserProfileService {
  constructor(userId, authToken) {
    this.userId = userId;
    this.authToken = authToken;
  }

  async call() {
    const userDetails = await this.#fetchUserProfile();
    return userDetails;
  }

  async #fetchUserProfile() {
    const req = {
      params: { id: this.userId },
      user: { id: this.userId },
      headers: { authorization: `Bearer ${this.authToken}` },
    };

    const res = {
      json(data) {
        return data;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
    };

    return await UserController.view(req, res);
  }
}

export default RetrieveUserProfileService;
