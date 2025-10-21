import { useEffect, useRef, useCallback } from 'react';

/**
 * ⚡ OPTIMIZED: Smart Auto-refresh with exponential backoff + dynamic interval adjustment
 * - Starts with fast polling (2s) for immediate feedback
 * - Gradually increases interval (up to 10s) to reduce backend load
 * - Resets to fast polling when new analyzing reviews appear
 * - ONLY when dashboard is visible (not when upload modal is open)
 * - Uses dynamic setTimeout instead of setInterval for precise control
 */
const AutoRefresh = ({ reviews, onRefresh, isUploadOpen }) => {
  const pollCountRef = useRef(0);
  const lastReviewCountRef = useRef(0);
  const timeoutIdRef = useRef(null);
  const lastPollTimeRef = useRef(0);

  // ⚡ Smart exponential backoff: 2s → 3s → 5s → 7s → 10s
  const getInterval = useCallback((count) => {
    if (count < 3) return 2000;  // First 3 polls: 2s (fast feedback)
    if (count < 6) return 3000;  // Next 3 polls: 3s
    if (count < 10) return 5000; // Next 4 polls: 5s
    if (count < 15) return 7000; // Next 5 polls: 7s
    return 10000;                // After 15 polls: 10s (reduced load)
  }, []);

  // ⚡ FIXED: Use dynamic setTimeout for better control
  const schedulePoll = useCallback(() => {
    if (!onRefresh) return;

    const currentInterval = getInterval(pollCountRef.current);
    const timeSinceLastPoll = Date.now() - lastPollTimeRef.current;
    
    // Adjust interval based on actual time elapsed (compensate for slow responses)
    const adjustedInterval = Math.max(0, currentInterval - timeSinceLastPoll);
    
    timeoutIdRef.current = setTimeout(() => {
      lastPollTimeRef.current = Date.now();
      pollCountRef.current++;
      
      // Trigger refresh
      onRefresh();
      
      // Schedule next poll
      schedulePoll();
    }, adjustedInterval);
  }, [onRefresh, getInterval]);

  // ⚡ Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Cleanup previous timeout
    cleanup();

    // Don't auto-refresh if upload modal is open or if reviews is not valid
    if (isUploadOpen || !Array.isArray(reviews)) {
      pollCountRef.current = 0;
      lastReviewCountRef.current = 0;
      lastPollTimeRef.current = 0;
      return;
    }

    // Check if there are any analyzing/pending reviews
    const analyzingReviews = reviews.filter(
      review => review && (review.status === 'analyzing' || review.status === 'pending')
    );
    
    const hasAnalyzingReviews = analyzingReviews.length > 0;

    if (hasAnalyzingReviews && onRefresh) {
      // ⚡ Reset poll count if new analyzing review appeared
      if (analyzingReviews.length > lastReviewCountRef.current) {
        pollCountRef.current = 0;
        lastPollTimeRef.current = Date.now();
      }
      lastReviewCountRef.current = analyzingReviews.length;

      // Start polling
      schedulePoll();
    } else {
      // Reset when no analyzing reviews
      pollCountRef.current = 0;
      lastReviewCountRef.current = 0;
      lastPollTimeRef.current = 0;
    }

    // Cleanup on unmount or dependency change
    return cleanup;
  }, [reviews, onRefresh, isUploadOpen, schedulePoll, cleanup]);

  return null; // This is a headless component
};

export default AutoRefresh;

