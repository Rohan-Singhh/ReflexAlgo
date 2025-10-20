import { memo } from 'react';
import { LogOut, Settings, User, Crown, Zap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const DashboardHeader = memo(({ user, activeTab, setActiveTab, onLogout, onOpenPricing }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-2xl">
      <div className="w-full max-w-[1920px] mx-auto px-8 lg:px-16">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-none tracking-tight">ReflexAlgo</span>
                <span className="text-xs text-gray-600 leading-none">dashboard</span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'overview', label: 'overview', icon: '🏠' },
                { id: 'reviews', label: 'reviews', icon: '📝' },
                { id: 'patterns', label: 'patterns', icon: '🧠' },
                { id: 'leaderboard', label: 'leaderboard', icon: '🏆' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  className={`relative px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Pro Badge - Clickable to open pricing */}
            <button
              onClick={onOpenPricing}
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 rounded-2xl transition-all duration-150 group cursor-pointer"
            >
              <Crown className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform duration-150" />
              <span className="text-sm font-semibold text-yellow-400">pro</span>
              <span className="text-xs text-yellow-600 group-hover:text-yellow-500 transition-colors duration-150">• upgrade</span>
            </button>

            {/* Notifications */}
            <button className="relative p-3 rounded-2xl hover:bg-white/5 transition-all group">
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3.5 px-4 py-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group border border-white/0 hover:border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                <span className="text-sm font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-white leading-none mb-1.5">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-600 leading-none">pro member</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-3 rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

