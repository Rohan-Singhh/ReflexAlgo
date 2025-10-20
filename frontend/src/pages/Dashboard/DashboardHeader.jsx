import { memo } from 'react';
import { LogOut, Settings, User, Crown, Zap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const DashboardHeader = memo(({ user, activeTab, setActiveTab, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-lg">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-none">ReflexAlgo</span>
                <span className="text-xs text-gray-500 leading-none">dashboard</span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-2">
              {[
                { id: 'overview', label: 'overview', icon: '🏠' },
                { id: 'reviews', label: 'reviews', icon: '📝' },
                { id: 'patterns', label: 'patterns', icon: '🧠' },
                { id: 'leaderboard', label: 'leaderboard', icon: '🏆' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Pro Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">pro</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-all group">
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                <span className="text-sm font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-white leading-none mb-1">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 leading-none">pro member</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

