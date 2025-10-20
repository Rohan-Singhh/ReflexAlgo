import api from './api';

class DashboardService {
  // Get user progress and stats
  async getUserProgress() {
    try {
      const response = await api.get('/dashboard/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch progress';
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch stats';
    }
  }

  // Get recent code reviews
  async getRecentReviews(limit = 3) {
    try {
      const response = await api.get(`/dashboard/reviews?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch reviews';
    }
  }

  // Get DSA pattern progress
  async getPatternProgress() {
    try {
      const response = await api.get('/dashboard/patterns');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch patterns';
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 5, period = 'all-time') {
    try {
      const response = await api.get(`/dashboard/leaderboard?limit=${limit}&period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch leaderboard';
    }
  }

  // Get notifications
  async getNotifications(limit = 10) {
    try {
      const response = await api.get(`/dashboard/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch notifications';
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await api.patch(`/dashboard/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to mark notification as read';
    }
  }
}

export default new DashboardService();

