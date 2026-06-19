import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, Share2, Check, MapPin, Target, Github, Linkedin, Globe, Twitter,
  Flame, Trophy, Zap, Code2, Lock, ExternalLink, Crown,
} from 'lucide-react';
import profileService from '../services/profileService';
import Button from '../components/ui/Button';
import EditProfileModal from './Profile/EditProfileModal';
import { getBadgeIcon, getRarityStyle } from './Profile/badgeCatalog';

const PLAN_LABEL = { starter: 'Free', pro: 'Pro', team: 'Team', enterprise: 'Enterprise' };
const LINK_ICONS = { github: Github, linkedin: Linkedin, website: Globe, twitter: Twitter };

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-[#08080b] text-white">
    <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-violet-900/15 to-transparent pointer-events-none" />
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
  </div>
);

const StatTile = ({ icon: Icon, label, value, accent = 'text-violet-300' }) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 mb-2 text-zinc-500">
      <Icon className={`w-4 h-4 ${accent}`} />
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
  </div>
);

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const isPublic = Boolean(username);

  const [data, setData] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, catalogRes] = await Promise.all([
        isPublic ? profileService.getPublicProfile(username) : profileService.getMyProfile(),
        profileService.getAchievementCatalog().catch(() => ({ data: [] })),
      ]);
      setData(profileRes.data);
      setCatalog(catalogRes.data || []);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [isPublic, username]);

  useEffect(() => {
    if (!isPublic && !localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    load();
  }, [load, isPublic, navigate]);

  const handleShare = () => {
    const handle = data?.user?.username;
    if (!handle) return;
    const url = `${window.location.origin}/u/${handle}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading profile…</p>
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.03]">
            <Lock className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Profile not found</h1>
            <p className="text-zinc-500 text-sm mt-1">{error || 'This profile is private or does not exist.'}</p>
          </div>
          <Link to="/"><Button variant="secondary" size="md">Back home</Button></Link>
        </div>
      </PageShell>
    );
  }

  const { user, stats, rank, patterns = [], badges = [], subscription, recentReviews = [], isOwner } = data;
  const earnedMap = new Map(badges.map((b) => [b.badgeId, b]));
  const planLabel = PLAN_LABEL[subscription?.plan] || 'Free';
  const isPaid = subscription?.plan && subscription.plan !== 'starter';
  const xpPct = stats ? Math.min(100, Math.round((stats.experience / Math.max(stats.experienceToNextLevel, 1)) * 100)) : 0;
  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <PageShell>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(isOwner ? '/dashboard' : '/')}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isOwner ? 'Dashboard' : 'Home'}
        </button>
        <div className="flex items-center gap-2">
          {user.username && (
            <Button variant="secondary" size="sm" onClick={handleShare}>
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Share2 className="w-4 h-4" /> Share</>}
            </Button>
          )}
          {isOwner && (
            <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" /> Edit profile
            </Button>
          )}
        </div>
      </div>

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="ring-gradient relative rounded-3xl bg-zinc-950/60 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center ring-1 ring-white/10">
              {user.profilePhoto
                ? <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-3xl font-semibold text-white">{user.name?.[0]?.toUpperCase() || 'U'}</span>}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white">{user.name}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isPaid ? 'border-violet-500/30 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-white/[0.04] text-zinc-400'
              }`}>
                {isPaid && <Crown className="w-3 h-3" />}{planLabel}
              </span>
            </div>
            {user.username && <p className="text-sm text-zinc-500 mt-0.5">@{user.username}</p>}
            {user.headline && <p className="text-zinc-300 mt-3">{user.headline}</p>}
            {user.bio && <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">{user.bio}</p>}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-zinc-500">
              {user.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{user.location}</span>}
              {user.goal && <span className="inline-flex items-center gap-1.5"><Target className="w-4 h-4" />{user.goal}</span>}
              {memberSince && <span>Joined {memberSince}</span>}
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {Object.entries(user.links || {}).filter(([, v]) => v).map(([key, value]) => {
                const Icon = LINK_ICONS[key] || Globe;
                return (
                  <a key={key} href={value} target="_blank" rel="noreferrer"
                    className="grid place-items-center w-9 h-9 rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Preferred languages */}
            {user.preferredLanguages?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.preferredLanguages.map((lang) => (
                  <span key={lang} className="rounded-md bg-white/[0.04] border border-white/10 px-2.5 py-1 text-xs text-zinc-300 mono">{lang}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {stats ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatTile icon={Zap} label="Level" value={stats.level} accent="text-amber-300" />
            <StatTile icon={Trophy} label="World rank" value={rank?.global ? `#${rank.global}` : '—'} accent="text-violet-300" />
            <StatTile icon={Flame} label="Streak" value={`${stats.currentStreak}d`} accent="text-orange-300" />
            <StatTile icon={Code2} label="Reviews" value={stats.totalReviews} accent="text-sky-300" />
          </div>

          {/* XP bar */}
          <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400">Level {stats.level}</span>
              <span className="text-zinc-500">{stats.experience} / {stats.experienceToNextLevel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center text-sm text-zinc-500">
          This user keeps their activity private.
        </div>
      )}

      {/* Patterns */}
      {patterns.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Top patterns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patterns.map((p) => (
              <div key={p.name} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{p.emoji ? `${p.emoji} ` : ''}{p.name}</span>
                  <span className="text-xs text-violet-300">{p.mastery}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${p.mastery}%` }} />
                </div>
                <p className="text-xs text-zinc-500 mt-2">{p.problemsSolved} solved</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {catalog.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Achievements</h2>
            <span className="text-xs text-zinc-600">{badges.length} / {catalog.length} unlocked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {catalog.map((ach) => {
              const earned = earnedMap.has(ach.id);
              const Icon = getBadgeIcon(ach.icon);
              const rarity = getRarityStyle(ach.rarity);
              return (
                <div key={ach.id}
                  className={`relative rounded-2xl border p-4 transition-colors ${earned ? `${rarity.ring} bg-white/[0.03]` : 'border-white/[0.06] bg-white/[0.01]'}`}>
                  {earned && <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rarity.glow} pointer-events-none`} />}
                  <div className="relative">
                    <div className={`inline-grid place-items-center w-10 h-10 rounded-xl border ${earned ? `${rarity.ring} ${rarity.text}` : 'border-white/10 text-zinc-700'}`}>
                      {earned ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <p className={`mt-3 text-sm font-medium ${earned ? 'text-white' : 'text-zinc-500'}`}>{ach.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{ach.description}</p>
                    {earned && <span className={`mt-2 inline-block text-[10px] uppercase tracking-wide ${rarity.text}`}>{rarity.label}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <section className="mt-8 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Recent reviews</h2>
          <div className="space-y-2">
            {recentReviews.map((r) => {
              const inner = (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-white/20 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="rounded-md bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400 mono">{r.language}</span>
                      {r.complexityBefore && r.complexityAfter && (
                        <span className="text-[11px] text-zinc-500 mono">{r.complexityBefore} → {r.complexityAfter}</span>
                      )}
                      {r.improvement > 0 && <span className="text-[11px] text-emerald-400">+{r.improvement}%</span>}
                    </div>
                  </div>
                  {isOwner && <ExternalLink className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
                </div>
              );
              return isOwner
                ? <Link key={r.id} to={`/review/${r.id}`} className="block">{inner}</Link>
                : <div key={r.id}>{inner}</div>;
            })}
          </div>
        </section>
      )}

      {isOwner && (
        <EditProfileModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profile={data}
          onSaved={(updated) => setData(updated)}
        />
      )}
    </PageShell>
  );
};

export default Profile;
