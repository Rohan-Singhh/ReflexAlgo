import api from './api';

class ProfileService {
  // Authenticated: the current user's full profile
  async getMyProfile() {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to load profile';
    }
  }

  // Authenticated: update the current user's profile
  async updateProfile(payload) {
    try {
      const response = await api.patch('/profile', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  }

  // Public: a user's profile by username
  async getPublicProfile(username) {
    try {
      const response = await api.get(`/profile/u/${encodeURIComponent(username)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Profile not found';
    }
  }

  // Authenticated: check whether a username is available
  async checkUsername(username) {
    try {
      const response = await api.get(`/profile/username-available?u=${encodeURIComponent(username)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to check username';
    }
  }

  // Public: full achievement catalog (earned + locked rendering)
  async getAchievementCatalog() {
    try {
      const response = await api.get('/profile/achievements/catalog');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to load achievements';
    }
  }
}

export default new ProfileService();
