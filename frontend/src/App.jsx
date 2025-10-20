import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Hero } from './components';

// ⚡ Lazy load sections below the fold with prefetch hints
const HowItWorks = lazy(() => import(/* webpackPrefetch: true */ './components/HowItWorks'));
const Features = lazy(() => import(/* webpackPrefetch: true */ './components/Features'));
const TargetAudience = lazy(() => import(/* webpackPrefetch: true */ './components/TargetAudience'));
const Pricing = lazy(() => import(/* webpackPrefetch: true */ './components/Pricing'));
const CTA = lazy(() => import(/* webpackPrefetch: true */ './components/CTA'));
const Footer = lazy(() => import(/* webpackPrefetch: true */ './components/Footer'));

// ⚡ Lazy load pages (high priority)
const SignUp = lazy(() => import(/* webpackPrefetch: true */ './pages/SignUp'));
const Login = lazy(() => import(/* webpackPrefetch: true */ './pages/Login'));
const Dashboard = lazy(() => import(/* webpackPreload: true */ './pages/Dashboard'));
const ReviewDetail = lazy(() => import(/* webpackPrefetch: true */ './pages/ReviewDetail'));

// ⚡ Minimal loading component for better perceived performance
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Landing Page Component
const LandingPage = () => (
  <div className="min-h-screen bg-black text-white overflow-x-hidden">
    <Navbar />
    <main>
      <Hero />
      <Suspense fallback={null}>
        <HowItWorks />
        <Features />
        <TargetAudience />
        <Pricing />
        <CTA />
      </Suspense>
    </main>
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Pages */}
        <Route 
          path="/signup" 
          element={
            <Suspense fallback={<PageLoader />}>
              <SignUp />
            </Suspense>
          } 
        />
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          } 
        />
        
        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          } 
        />
        
        {/* Review Detail */}
        <Route 
          path="/review/:id" 
          element={
            <Suspense fallback={<PageLoader />}>
              <ReviewDetail />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
