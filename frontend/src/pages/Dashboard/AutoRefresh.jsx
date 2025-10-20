import { useEffect } from 'react';

/**
 * Auto-refresh dashboard when there are analyzing reviews
 * Polls every 5 seconds if there are reviews in "analyzing" or "pending" state
 * ONLY when dashboard is visible (not when upload modal is open)
 */
const AutoRefresh = ({ reviews, onRefresh, isUploadOpen }) => {
  useEffect(() => {
    // Don't auto-refresh if upload modal is open
    if (isUploadOpen) {
      return;
    }

    // Check if there are any analyzing/pending reviews
    const hasAnalyzingReviews = reviews?.some(
      review => review.status === 'analyzing' || review.status === 'pending'
    );

    if (hasAnalyzingReviews && onRefresh) {
      // Poll every 5 seconds (was 3s)
      const interval = setInterval(() => {
        onRefresh();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [reviews, onRefresh, isUploadOpen]);

  return null; // This is a headless component
};

export default AutoRefresh;

