import api from './api';

class CodeReviewService {
  // Submit code for review
  async submitCode(reviewData) {
    const response = await api.post('/reviews/submit', reviewData);
    return response.data;
  }

  // Get review status (for polling)
  async getReviewStatus(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch review status';
    }
  }

  // Get full review details
  async getReviewDetails(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch review details';
    }
  }
}

export default new CodeReviewService();

