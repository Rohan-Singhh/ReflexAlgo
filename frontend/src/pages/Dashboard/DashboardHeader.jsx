import { memo, useEffect, useState } from 'react';
import { LogOut, Crown, Zap, Bell, Camera, CreditCard, Gauge, CheckCircle, Trophy, Sparkles, ShieldCheck, Inbox, UserCircle, LayoutGrid, FileCode, Layers, Sparkle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dashboardService from '../../services/dashboardService';

const getNotificationIcon = (type, icon) => {
  if (type === 'billing' || icon === 'crown') return Crown;
  if (type === 'usage_limit' || icon === 'meter') return Gauge;
  if (type === 'review_complete') return CheckCircle;
  if (type === 'rank_change') return Trophy;
  if (type === 'achievement' || type === 'level_up') return Sparkles;
  if (icon === 'shield') return ShieldCheck;
  return Bell;
};

const getNotificationTone = (type, priority) => {
  if (priority === 'high') return 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300';
  if (type === 'billing') return 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300';
  if (type === 'usage_limit') return 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300';
  if (type === 'review_complete') return 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-300';
  return 'from-white/10 to-white/5 border-white/10 text-gray-300';
};

const formatNotificationTime = (value) => {
  const createdAt = new Date(value).getTime();
  if (!createdAt) return 'now';
  const diffMs = Date.now() - createdAt;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

const DashboardHeader = memo(({ user, subscription, activeTab, setActiveTab, onLogout, onOpenPricing, onUserUpdate, onOpenPhotoModal }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');

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
      label: 'Free',
      color: 'from-gray-500/10 to-gray-600/10', 
      borderColor: 'border-gray-500/20 hover:border-gray-500/40',
      textColor: 'text-gray-400',
      dotColor: 'text-gray-600 group-hover:text-gray-500',
      upgradeText: '• upgrade'
    },
    pro: {
      label: 'Pro',
      color: 'from-yellow-500/10 to-orange-500/10', 
      borderColor: 'border-yellow-500/20 hover:border-yellow-500/40',
      textColor: 'text-yellow-400',
      dotColor: 'text-yellow-600 group-hover:text-yellow-500',
      upgradeText: ''
    },
    team: {
      label: 'Team',
      color: 'from-green-500/10 to-emerald-500/10', 
      borderColor: 'border-green-500/20 hover:border-green-500/40',
      textColor: 'text-green-400',
      dotColor: 'text-green-600 group-hover:text-green-500',
      upgradeText: ''
    },
    enterprise: {
      label: 'Enterprise',
      color: 'from-purple-500/10 to-indigo-500/10', 
      borderColor: 'border-purple-500/20 hover:border-purple-500/40',
      textColor: 'text-purple-400',
      dotColor: 'text-purple-600 group-hover:text-purple-500',
      upgradeText: ''
    }
  };
  
  const currentPlan = planConfig[planName] || planConfig.starter;

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    setNotificationError('');
    try {
      const response = await dashboardService.getNotifications(12);
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      setNotificationError(typeof error === 'string' ? error : 'Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (showNotifications) {
      loadNotifications();
    }
  }, [showNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
      try {
        await dashboardService.markNotificationRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    setShowNotifications(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-2xl">
      <div className="w-full max-w-[1920px] mx-auto px-8 lg:px-16">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/40">
                <Sparkle className="w-4 h-4 text-white" fill="currentColor" strokeWidth={2.5} />
              </div>
              <div className="leading-none">
                <span className="block text-[15px] font-semibold tracking-tight text-white">
                  Reflex<span className="text-zinc-400">Algo</span>
                </span>
                <span className="block text-[11px] text-zinc-600 mt-0.5">Dashboard</span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutGrid },
                { id: 'reviews', label: 'Reviews', icon: FileCode },
                { id: 'patterns', label: 'Patterns', icon: Layers },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-white bg-white/[0.07]'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" strokeWidth={1.75} />
                    <span>{tab.label}</span>
                  </span>
                </button>
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
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => {
                  setShowNotifications((current) => !current);
                  setShowProfileDropdown(false);
                }}
                className={`relative p-3 rounded-2xl border transition-all duration-150 group cursor-pointer ${
                  showNotifications ? 'bg-white/10 border-white/10' : 'border-transparent hover:bg-white/5'
                }`}
                whileHover={{ y: -2, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="Open notifications"
              >
                <motion.div
                  whileHover={{ rotate: [0, -20, 20, -20, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors duration-150" />
                </motion.div>
                {unreadCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 border-2 border-[#0A0A0A] text-[10px] font-bold text-white flex items-center justify-center"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-2rem)] bg-[#101010] border border-white/10 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                  >
                    <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/[0.06] to-white/[0.02]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-white">Notifications</h3>
                          <p className="text-xs text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={loadNotifications}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[440px] overflow-y-auto custom-scrollbar p-3">
                      {isLoadingNotifications ? (
                        <div className="py-10 flex flex-col items-center gap-3">
                          <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-gray-500">Loading updates…</p>
                        </div>
                      ) : notificationError ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
                          {notificationError}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Inbox className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-white">No notifications yet</p>
                          <p className="text-xs text-gray-500 mt-1">Plan changes and review updates will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type, notification.icon);
                            const tone = getNotificationTone(notification.type, notification.priority);

                            return (
                              <button
                                key={notification._id}
                                type="button"
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left rounded-2xl border p-4 transition-all hover:bg-white/[0.06] ${
                                  notification.isRead ? 'bg-white/[0.025] border-white/5' : 'bg-white/[0.055] border-white/10'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                      <p className="text-sm font-semibold text-white leading-snug">{notification.title}</p>
                                      <span className="text-[11px] text-gray-600 flex-shrink-0">{formatNotificationTime(notification.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{notification.message}</p>
                                  </div>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Profile */}
            <div className="relative">
              <motion.div 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
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
                        navigate('/profile');
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors duration-150 text-left border-b border-white/5"
                    >
                      <UserCircle className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-sm font-medium text-white">View profile</p>
                        <p className="text-xs text-gray-500">Your public profile & stats</p>
                      </div>
                    </button>
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
      {(showProfileDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
