import { useEffect, useState, memo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import codeReviewService from '../services/codeReviewService';
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

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

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

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [statsData, reviewsData, patternsData, leaderboardData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentReviews(3),
        dashboardService.getPatternProgress(),
        dashboardService.getLeaderboard(5)
      ]);

      setDashboardStats(statsData.data);
      setReviews(reviewsData.data);
      setPatterns(patternsData.data);
      setLeaderboard(leaderboardData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Continue with empty data - dashboard will show defaults
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCodeSubmit = async (reviewData) => {
    try {
      const result = await codeReviewService.submitCode(reviewData);
      
      // Refresh dashboard data to show new review
      fetchDashboardData();
      
      // Return the result so CodeUpload can handle the analyzing state
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'bruh, something broke. try again? 😅';
      toast.error(errorMessage, 4000);
      console.error('Code submission error:', error);
      throw error;
    }
  };

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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenPricing={() => setIsPricingOpen(true)}
        />
      </Suspense>

      <main className="w-full max-w-[1920px] mx-auto px-8 lg:px-16 py-16">
        <Suspense fallback={null}>
          <DashboardWelcome 
            user={user} 
            stats={dashboardStats}
            onOpenPricing={() => setIsPricingOpen(true)} 
          />
        </Suspense>

        <Suspense fallback={<div className="h-32 bg-white/5 rounded-2xl animate-pulse" />}>
          <DashboardStats dashboardStats={dashboardStats} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse mt-16" />}>
          <DashboardContent 
            activeTab={activeTab}
            reviews={reviews}
            patterns={patterns}
            leaderboard={leaderboard}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        </Suspense>
      </main>

      {/* Pricing Modal - Rendered at root level */}
      <Suspense fallback={null}>
        <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      </Suspense>

      {/* Code Upload Modal - Rendered at root level */}
      <Suspense fallback={null}>
        {isUploadOpen && (
          <CodeUpload
            onSubmit={handleCodeSubmit}
            onClose={() => setIsUploadOpen(false)}
          />
        )}
      </Suspense>

      {/* Auto-refresh when there are analyzing reviews */}
      <Suspense fallback={null}>
        <AutoRefresh reviews={reviews} onRefresh={fetchDashboardData} />
      </Suspense>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
