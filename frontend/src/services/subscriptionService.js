import api from './api';

class SubscriptionService {
  // Get current user's subscription stats
  async getSubscriptionStats() {
    try {
      const response = await api.get('/subscription/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch subscription';
    }
  }

  // Get full subscription details
  async getMySubscription() {
    try {
      const response = await api.get('/subscription/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch subscription';
    }
  }

  // Check if user can create review
  async checkReviewLimit() {
    try {
      const response = await api.get('/subscription/check-limit');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to check limit';
    }
  }

  // Change/upgrade plan
  async changePlan(plan, paymentInfo = {}) {
    try {
      const response = await api.post('/subscription/change-plan', {
        plan,
        paymentInfo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to change plan';
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.post('/subscription/cancel');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to cancel subscription';
    }
  }
}

export default new SubscriptionService();

