import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AtSign, Globe, Github, Linkedin, Twitter } from 'lucide-react';
import profileService from '../../services/profileService';
import Button from '../../components/ui/Button';

const TEXT_LIMITS = { headline: 80, bio: 280, location: 80, goal: 120 };

const EditProfileModal = ({ isOpen, onClose, profile, onSaved }) => {
  const u = profile?.user || {};
  const [form, setForm] = useState({
    name: u.name || '',
    username: u.username || '',
    headline: u.headline || '',
    bio: u.bio || '',
    location: u.location || '',
    goal: u.goal || '',
    links: {
      github: u.links?.github || '',
      linkedin: u.links?.linkedin || '',
      website: u.links?.website || '',
      twitter: u.links?.twitter || '',
    },
    preferredLanguages: (u.preferredLanguages || []).join(', '),
    visibility: {
      isPublic: u.visibility?.isPublic !== false,
      showActivity: u.visibility?.showActivity !== false,
      showReviews: u.visibility?.showReviews !== false,
    },
  });
  const [usernameState, setUsernameState] = useState({ status: 'idle', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);
  const originalUsername = u.username || '';

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setLink = (key, value) => setForm((f) => ({ ...f, links: { ...f.links, [key]: value } }));
  const setVis = (key, value) => setForm((f) => ({ ...f, visibility: { ...f.visibility, [key]: value } }));

  const checkUsername = useCallback(async (value) => {
    if (value === originalUsername) {
      setUsernameState({ status: 'idle', message: '' });
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(value)) {
      setUsernameState({ status: 'invalid', message: '3-30 chars · a-z, 0-9, _' });
      return;
    }
    setUsernameState({ status: 'checking', message: 'Checking…' });
    try {
      const res = await profileService.checkUsername(value);
      const available = res.data?.available;
      setUsernameState({
        status: available ? 'available' : 'taken',
        message: available ? 'Available' : 'Already taken',
      });
    } catch {
      setUsernameState({ status: 'idle', message: '' });
    }
  }, [originalUsername]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(form.username), 400);
    return () => clearTimeout(debounceRef.current);
  }, [form.username, checkUsername]);

  const handleSave = async () => {
    if (usernameState.status === 'taken' || usernameState.status === 'invalid') return;
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        goal: form.goal,
        links: form.links,
        preferredLanguages: form.preferredLanguages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        visibility: form.visibility,
      };
      if (form.username && form.username !== originalUsername) {
        payload.username = form.username;
      }
      const res = await profileService.updateProfile(payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const field = 'w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors';
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="ring-gradient relative w-full max-w-lg max-h-[88vh] overflow-y-auto custom-scrollbar rounded-2xl bg-zinc-950 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-white">Edit profile</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Name</label>
              <input className={field} value={form.name} maxLength={50} onChange={(e) => set('name', e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  className={`${field} pl-9`}
                  value={form.username}
                  maxLength={30}
                  onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="your_handle"
                />
                {usernameState.status !== 'idle' && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs flex items-center gap-1 ${
                    usernameState.status === 'available' ? 'text-emerald-400'
                      : usernameState.status === 'checking' ? 'text-zinc-500'
                      : 'text-red-400'
                  }`}>
                    {usernameState.status === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {usernameState.status === 'available' && <Check className="w-3 h-3" />}
                    {usernameState.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className={labelCls}>Headline</label>
              <input className={field} value={form.headline} maxLength={TEXT_LIMITS.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. CS student · interview prep" />
            </div>

            <div>
              <label className={labelCls}>Bio <span className="text-zinc-600">({form.bio.length}/{TEXT_LIMITS.bio})</span></label>
              <textarea className={`${field} resize-none`} rows={3} value={form.bio} maxLength={TEXT_LIMITS.bio} onChange={(e) => set('bio', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Location</label>
                <input className={field} value={form.location} maxLength={TEXT_LIMITS.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" />
              </div>
              <div>
                <label className={labelCls}>Goal</label>
                <input className={field} value={form.goal} maxLength={TEXT_LIMITS.goal} onChange={(e) => set('goal', e.target.value)} placeholder="e.g. FAANG interviews" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Preferred languages</label>
              <input className={field} value={form.preferredLanguages} onChange={(e) => set('preferredLanguages', e.target.value)} placeholder="Python, JavaScript, C++ (comma separated)" />
            </div>

            <div className="space-y-2.5">
              <label className={labelCls}>Links</label>
              {[
                { key: 'github', icon: Github, ph: 'https://github.com/you' },
                { key: 'linkedin', icon: Linkedin, ph: 'https://linkedin.com/in/you' },
                { key: 'website', icon: Globe, ph: 'https://yoursite.com' },
                { key: 'twitter', icon: Twitter, ph: 'https://x.com/you' },
              ].map(({ key, icon: Icon, ph }) => (
                <div key={key} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input className={`${field} pl-9`} value={form.links[key]} maxLength={200} onChange={(e) => setLink(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <label className={labelCls}>Privacy</label>
              {[
                { key: 'isPublic', label: 'Public profile', hint: 'Anyone with your link can view it' },
                { key: 'showActivity', label: 'Show stats & activity', hint: 'Level, streak, rank, patterns' },
                { key: 'showReviews', label: 'Show public reviews', hint: 'Only reviews you mark public' },
              ].map(({ key, label, hint }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVis(key, !form.visibility[key])}
                  className="w-full flex items-center justify-between gap-3 py-2 text-left"
                >
                  <span>
                    <span className="block text-sm text-white">{label}</span>
                    <span className="block text-xs text-zinc-500">{hint}</span>
                  </span>
                  <span className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.visibility[key] ? 'bg-violet-500' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.visibility[key] ? 'translate-x-4' : ''}`} />
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">{error}</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="ghost" size="md" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving || usernameState.status === 'taken' || usernameState.status === 'invalid'}>
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save changes'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
