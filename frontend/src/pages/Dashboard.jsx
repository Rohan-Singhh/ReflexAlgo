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
const ProfilePhotoModal = lazy(() => import('./Dashboard/ProfilePhotoModal'));

// ⚡ OPTIMIZATION: Simple in-memory cache with TTL
const dashboardCache = {
  data: null,
  timestamp: 0,
  TTL: 30000 // 30 seconds cache
};

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // ⚡ OPTIMIZATION: Initialize user synchronously from localStorage to prevent blank screen
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
    return null;
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchController = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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
      // Update user if it's different (in case localStorage changed)
      setUser(prevUser => {
        if (JSON.stringify(prevUser) !== JSON.stringify(parsedUser)) {
          return parsedUser;
        }
        return prevUser;
      });
      
      // Fetch dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, []);

  // ⚡ OPTIMIZED: Progressive loading with stale-while-revalidate pattern + better error handling
  const fetchDashboardData = useCallback(async (force = false) => {
    // Cancel any ongoing fetch
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // ⚡ INSTANT UI: Check cache first (unless forced refresh)
    if (!force && dashboardCache.data && Date.now() - dashboardCache.timestamp < dashboardCache.TTL) {
      const cached = dashboardCache.data;
      setDashboardStats(cached.stats || null);
      setReviews(cached.reviews || []);
      setAllReviews(cached.allReviews || []);
      setPatterns(cached.patterns || []);
      setLeaderboard(cached.leaderboard || []);
      setSubscription(cached.subscription || null);
      setIsLoading(false);
      return;
    }

    // Show loading only if no cached data exists
    setIsLoading(!dashboardCache.data);
    fetchController.current = new AbortController();

    try {
      // ⚡ PROGRESSIVE STEP 1: Fetch critical header data FIRST (fastest)
      const subscriptionPromise = subscriptionService.getSubscriptionStats().catch(err => {
        console.warn('Subscription fetch failed:', err);
        return { data: null };
      });
      
      // ⚡ PROGRESSIVE STEP 2: Fetch main dashboard data (parallel)
      const statsPromise = dashboardService.getDashboardStats().catch(err => {
        console.warn('Stats fetch failed:', err);
        return { data: null };
      });
      const reviewsPromise = dashboardService.getRecentReviews(3).catch(err => {
        console.warn('Reviews fetch failed:', err);
        return { data: [] };
      });
      
      // ⚡ PROGRESSIVE STEP 3: Fetch secondary data (can be slower)
      const allReviewsPromise = dashboardService.getRecentReviews(20).catch(err => {
        console.warn('All reviews fetch failed:', err);
        return { data: [] };
      });
      const patternsPromise = dashboardService.getPatternProgress().catch(err => {
        console.warn('Patterns fetch failed:', err);
        return { data: [] };
      });
      const leaderboardPromise = dashboardService.getLeaderboard(5).catch(err => {
        console.warn('Leaderboard fetch failed:', err);
        return { data: [] };
      });

      // ⚡ HYDRATE AS DATA ARRIVES (progressive rendering with graceful degradation)
      
      // Phase 1: Critical data (header) - never fail
      const subscriptionData = await subscriptionPromise;
      setSubscription(subscriptionData.data);
      
      // Phase 2: Main content (stats + recent reviews) - show immediately
      const [statsData, reviewsData] = await Promise.all([statsPromise, reviewsPromise]);
      setDashboardStats(statsData.data);
      setReviews(reviewsData.data || []);
      setIsLoading(false); // ⚡ Remove spinner as soon as main content loads
      
      // Phase 3: Secondary content (can load after UI is interactive)
      const [allReviewsData, patternsData, leaderboardData] = await Promise.all([
        allReviewsPromise,
        patternsPromise,
        leaderboardPromise
      ]);
      
      setAllReviews(allReviewsData.data || []);
      setPatterns(patternsData.data || []);
      setLeaderboard(leaderboardData.data || []);

      // ⚡ Cache the complete data (only cache valid data)
      dashboardCache.data = {
        stats: statsData.data,
        reviews: reviewsData.data || [],
        allReviews: allReviewsData.data || [],
        patterns: patternsData.data || [],
        leaderboard: leaderboardData.data || [],
        subscription: subscriptionData.data
      };
      dashboardCache.timestamp = Date.now();

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch dashboard data:', error);
        // ⚡ IMPROVED: Use cached data if available, otherwise use defaults
        if (dashboardCache.data) {
          const cached = dashboardCache.data;
          setDashboardStats(cached.stats || null);
          setReviews(cached.reviews || []);
          setAllReviews(cached.allReviews || []);
          setPatterns(cached.patterns || []);
          setLeaderboard(cached.leaderboard || []);
          setSubscription(cached.subscription || null);
        } else {
          // No cache available - use safe defaults
          setDashboardStats(null);
          setReviews([]);
          setAllReviews([]);
          setPatterns([]);
          setLeaderboard([]);
          setSubscription(null);
        }
        
        // Show error toast to user
        toast.error('Failed to load dashboard data. Using cached data if available.', 3000);
      }
      setIsLoading(false);
    } finally {
      fetchController.current = null;
    }
  }, [toast]);

  // ⚡ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
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
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      </Suspense>

      <main className="w-full max-w-[1920px] mx-auto px-8 lg:px-16 py-16">
        {/* Show Welcome & Stats only on overview tab */}
        {activeTab === 'overview' && (
          <>
            <Suspense fallback={
              <div className="mb-16 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 animate-pulse">
                <div className="h-8 w-48 bg-white/10 rounded mb-4" />
                <div className="h-4 w-32 bg-white/5 rounded" />
              </div>
            }>
              <DashboardWelcome 
                user={user} 
                stats={dashboardStats}
                subscription={subscription}
                onOpenPricing={() => setIsPricingOpen(true)} 
              />
            </Suspense>

            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 animate-pulse">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl mb-6" />
                    <div className="h-10 w-20 bg-white/10 rounded mb-3" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            }>
              <DashboardStats dashboardStats={dashboardStats} />
            </Suspense>
          </>
        )}

        <Suspense fallback={
          <div className="space-y-8 mt-16">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 animate-pulse">
              <div className="h-6 w-48 bg-white/10 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        }>
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
            onOpenPricing={() => {
              setIsUploadOpen(false);
              setIsPricingOpen(true);
            }}
            subscription={subscription}
          />
        )}
      </Suspense>

      {/* Profile Photo Modal */}
      <Suspense fallback={null}>
        {isPhotoModalOpen && (
          <ProfilePhotoModal
            isOpen={isPhotoModalOpen}
            onClose={() => setIsPhotoModalOpen(false)}
            currentPhoto={user?.profilePhoto}
            onPhotoUpdated={(newPhoto) => {
              const updatedUser = { ...user, profilePhoto: newPhoto };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
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
