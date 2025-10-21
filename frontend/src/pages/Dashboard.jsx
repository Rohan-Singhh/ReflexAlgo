import { useEffect, useState, memo, lazy, Suspense, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import codeReviewService from '../services/codeReviewService';
import subscriptionService from '../services/subscriptionService';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

// ⚡ Lazy load Dashboard sub-components for better performance
const DashboardHeader = lazy(() => import('./Dashboard/DashboardHeader'));
const DashboardWelcome = lazy(() => import('./Dashboard/DashboardWelcome'));
const DashboardStats = lazy(() => import('./Dashboard/DashboardStats'));
const DashboardContent = lazy(() => import('./Dashboard/DashboardContent'));
const PricingModal = lazy(() => import('./Dashboard/PricingModal'));
const CodeUpload = lazy(() => import('./Dashboard/CodeUpload'));
const AutoRefresh = lazy(() => import('./Dashboard/AutoRefresh'));

// ⚡ OPTIMIZATION: Simple in-memory cache with TTL
const dashboardCache = {
  data: null,
  timestamp: 0,
  TTL: 30000 // 30 seconds cache
};

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchController = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData || userData === 'undefined') {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch dashboard data
      fetchDashboardData();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // ⚡ OPTIMIZED: Cached fetch with stale-while-revalidate pattern
  const fetchDashboardData = useCallback(async (force = false) => {
    // Cancel any ongoing fetch
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // Check cache first (unless forced refresh)
    if (!force && dashboardCache.data && Date.now() - dashboardCache.timestamp < dashboardCache.TTL) {
      console.log('⚡ Using cached dashboard data');
      const cached = dashboardCache.data;
      setDashboardStats(cached.stats);
      setReviews(cached.reviews);
      setAllReviews(cached.allReviews);
      setPatterns(cached.patterns);
      setLeaderboard(cached.leaderboard);
      setSubscription(cached.subscription);
      return;
    }

    setIsLoading(true);
    fetchController.current = new AbortController();

    try {
      // ⚡ STEP 1: Fetch critical data first (header + subscription)
      const [subscriptionData] = await Promise.all([
        subscriptionService.getSubscriptionStats()
      ]);
      
      setSubscription(subscriptionData.data);

      // ⚡ STEP 2: Fetch remaining data in parallel (non-blocking)
      const [statsData, reviewsData, allReviewsData, patternsData, leaderboardData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentReviews(3),
        dashboardService.getRecentReviews(20), // Fetch more reviews for the reviews tab
        dashboardService.getPatternProgress(),
        dashboardService.getLeaderboard(5)
      ]);

      // Update state
      setDashboardStats(statsData.data);
      setReviews(reviewsData.data);
      setAllReviews(allReviewsData.data);
      setPatterns(patternsData.data);
      setLeaderboard(leaderboardData.data);

      // ⚡ Cache the data
      dashboardCache.data = {
        stats: statsData.data,
        reviews: reviewsData.data,
        allReviews: allReviewsData.data,
        patterns: patternsData.data,
        leaderboard: leaderboardData.data,
        subscription: subscriptionData.data
      };
      dashboardCache.timestamp = Date.now();

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch dashboard data:', error);
      }
    } finally {
      setIsLoading(false);
      fetchController.current = null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpgradeSuccess = useCallback((newPlan) => {
    // Show success toast
    toast.success(`🎉 Successfully upgraded to ${newPlan} plan!`, 4000);
    
    // Force refresh to bypass cache
    fetchDashboardData(true);
  }, [fetchDashboardData, toast]);

  const handleCodeSubmit = useCallback(async (reviewData) => {
    try {
      const result = await codeReviewService.submitCode(reviewData);
      
      // Don't refresh immediately - let modal handle it
      // Only refresh when modal closes or user views full details
      
      // Return the result so CodeUpload can handle the analyzing state
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'bruh, something broke. try again? 😅';
      toast.error(errorMessage, 4000);
      console.error('Code submission error:', error);
      throw error;
    }
  }, [toast]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      
      {/* ⚡ Lazy loaded sub-components for better performance */}
      <Suspense fallback={null}>
        <DashboardHeader 
          user={user}
          subscription={subscription}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenPricing={() => setIsPricingOpen(true)}
        />
      </Suspense>

      <main className="w-full max-w-[1920px] mx-auto px-8 lg:px-16 py-16">
        {/* Show Welcome & Stats only on overview tab */}
        {activeTab === 'overview' && (
          <>
            <Suspense fallback={null}>
              <DashboardWelcome 
                user={user} 
                stats={dashboardStats}
                subscription={subscription}
                onOpenPricing={() => setIsPricingOpen(true)} 
              />
            </Suspense>

            <Suspense fallback={<div className="h-32 bg-white/5 rounded-2xl animate-pulse" />}>
              <DashboardStats dashboardStats={dashboardStats} />
            </Suspense>
          </>
        )}

        <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse mt-16" />}>
          <DashboardContent 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reviews={reviews}
            allReviews={allReviews}
            patterns={patterns}
            leaderboard={leaderboard}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        </Suspense>
      </main>

      {/* Pricing Modal - Rendered at root level */}
      <Suspense fallback={null}>
        <PricingModal 
          isOpen={isPricingOpen} 
          onClose={() => setIsPricingOpen(false)}
          onUpgradeSuccess={handleUpgradeSuccess}
          currentPlan={subscription?.plan || 'starter'}
        />
      </Suspense>

      {/* Code Upload Modal - Rendered at root level */}
      <Suspense fallback={null}>
        {isUploadOpen && (
          <CodeUpload
            onSubmit={handleCodeSubmit}
            onClose={(shouldRefresh) => {
              setIsUploadOpen(false);
              // Refresh dashboard if user closed after submission
              if (shouldRefresh) {
                setTimeout(() => fetchDashboardData(true), 300);
              }
            }}
          />
        )}
      </Suspense>

      {/* Auto-refresh when there are analyzing reviews (but not when upload modal is open) */}
      <Suspense fallback={null}>
        <AutoRefresh 
          reviews={reviews} 
          onRefresh={fetchDashboardData}
          isUploadOpen={isUploadOpen}
        />
      </Suspense>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
