import { useEffect, useState, memo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

// ⚡ Lazy load Dashboard sub-components for better performance
const DashboardHeader = lazy(() => import('./Dashboard/DashboardHeader'));
const DashboardWelcome = lazy(() => import('./Dashboard/DashboardWelcome'));
const DashboardStats = lazy(() => import('./Dashboard/DashboardStats'));
const DashboardContent = lazy(() => import('./Dashboard/DashboardContent'));
const PricingModal = lazy(() => import('./Dashboard/PricingModal'));

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
          <DashboardWelcome user={user} onOpenPricing={() => setIsPricingOpen(true)} />
        </Suspense>

        <Suspense fallback={<div className="h-32 bg-white/5 rounded-2xl animate-pulse" />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse mt-16" />}>
          <DashboardContent activeTab={activeTab} />
        </Suspense>
      </main>

      {/* Pricing Modal - Rendered at root level */}
      <Suspense fallback={null}>
        <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      </Suspense>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
