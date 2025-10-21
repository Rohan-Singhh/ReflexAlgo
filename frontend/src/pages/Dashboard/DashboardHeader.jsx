import { memo, useState } from 'react';
import { LogOut, Settings, User, Crown, Zap, Bell, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';

const DashboardHeader = memo(({ user, subscription, activeTab, setActiveTab, onLogout, onOpenPricing, onUserUpdate, onOpenPhotoModal }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Get plan details
  const planName = subscription?.plan || 'starter';
  const isStarter = planName === 'starter';
  const isPro = planName === 'pro';
  const isTeam = planName === 'team';
  const isEnterprise = planName === 'enterprise';
  
  // Usage details for free users
  const usageUsed = subscription?.usage?.used || 0;
  const usageLimit = subscription?.usage?.limit || 3;
  const usageCount = isStarter ? `${usageUsed}/${usageLimit}` : null;
  
  // Plan badge colors and icons
  const planConfig = {
    starter: { 
      label: 'free', 
      color: 'from-gray-500/10 to-gray-600/10', 
      borderColor: 'border-gray-500/20 hover:border-gray-500/40',
      textColor: 'text-gray-400',
      dotColor: 'text-gray-600 group-hover:text-gray-500',
      upgradeText: '• upgrade'
    },
    pro: { 
      label: 'pro', 
      color: 'from-yellow-500/10 to-orange-500/10', 
      borderColor: 'border-yellow-500/20 hover:border-yellow-500/40',
      textColor: 'text-yellow-400',
      dotColor: 'text-yellow-600 group-hover:text-yellow-500',
      upgradeText: ''
    },
    team: { 
      label: 'team', 
      color: 'from-green-500/10 to-emerald-500/10', 
      borderColor: 'border-green-500/20 hover:border-green-500/40',
      textColor: 'text-green-400',
      dotColor: 'text-green-600 group-hover:text-green-500',
      upgradeText: ''
    },
    enterprise: { 
      label: 'enterprise', 
      color: 'from-purple-500/10 to-indigo-500/10', 
      borderColor: 'border-purple-500/20 hover:border-purple-500/40',
      textColor: 'text-purple-400',
      dotColor: 'text-purple-600 group-hover:text-purple-500',
      upgradeText: ''
    }
  };
  
  const currentPlan = planConfig[planName] || planConfig.starter;
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-2xl">
      <div className="w-full max-w-[1920px] mx-auto px-8 lg:px-16">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-200" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <motion.div
                    whileHover={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </motion.div>
              <div>
                <span className="text-lg font-bold text-white block leading-none tracking-tight group-hover:text-purple-300 transition-colors duration-150">ReflexAlgo</span>
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
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`relative px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <motion.span 
                      className="text-base"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {tab.icon}
                    </motion.span>
                    <span>{tab.label}</span>
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Plan Badge - Clickable to open pricing */}
            <motion.button
              onClick={onOpenPricing}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentPlan.color} border ${currentPlan.borderColor} rounded-2xl transition-all duration-150 group cursor-pointer`}
              title={isStarter ? `${usageUsed}/${usageLimit} reviews used - Upgrade for unlimited` : 'Manage subscription'}
            >
              <motion.div
                whileHover={{ rotate: [0, -15, 15, -15, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Crown className={`w-4 h-4 ${currentPlan.textColor}`} />
              </motion.div>
              <span className={`text-sm font-semibold ${currentPlan.textColor}`}>{currentPlan.label}</span>
              {isStarter && usageCount && (
                <span className={`text-xs ${currentPlan.textColor} opacity-70`}>{usageCount}</span>
              )}
              {isStarter && (
                <span className={`text-xs ${currentPlan.dotColor} transition-colors duration-150`}>{currentPlan.upgradeText}</span>
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button 
              className="relative p-3 rounded-2xl hover:bg-white/5 transition-all duration-150 group cursor-pointer"
              whileHover={{ y: -2, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                whileHover={{ rotate: [0, -20, 20, -20, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Bell className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors duration-150" />
              </motion.div>
              <motion.span 
                className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.button>
            
            {/* User Profile */}
            <div className="relative">
              <motion.div 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3.5 px-4 py-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-150 cursor-pointer group border border-white/0 hover:border-white/10"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-150 overflow-hidden"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </motion.div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-white leading-none mb-1.5">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-600 leading-none">{currentPlan.label} member</p>
                </div>
              </motion.div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onOpenPhotoModal) {
                          onOpenPhotoModal();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors duration-150 text-left"
                    >
                      <Camera className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user?.profilePhoto ? 'update photo' : 'add photo'}
                        </p>
                        <p className="text-xs text-gray-500">change your display picture</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <motion.button
              onClick={onLogout}
              whileHover={{ y: -2, scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-3 rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 group cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors duration-150" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

