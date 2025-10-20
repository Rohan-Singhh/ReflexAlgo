import { useEffect } from 'react';

/**
 * Auto-refresh dashboard when there are analyzing reviews
 * Polls every 3 seconds if there are reviews in "analyzing" or "pending" state
 */
const AutoRefresh = ({ reviews, onRefresh }) => {
  useEffect(() => {
    // Check if there are any analyzing/pending reviews
    const hasAnalyzingReviews = reviews?.some(
      review => review.status === 'analyzing' || review.status === 'pending'
    );

    if (hasAnalyzingReviews && onRefresh) {
      // Poll every 3 seconds
      const interval = setInterval(() => {
        onRefresh();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [reviews, onRefresh]);

  return null; // This is a headless component
};

export default AutoRefresh;

