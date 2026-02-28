import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Bell, User, Palette, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, exportAPI, remindersAPI } from '../services/api';
import { pageTransition } from '../animations/variants';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', accentColor: user?.accentColor || '#6366f1' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profile);
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await exportAPI.exportData('json');
      const blob = new Blob([JSON.stringify(await res.data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'habit-tracker-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportAPI.exportData('csv');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'habit-tracker-logs.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('CSV export failed'); }
  };

  const requestNotifications = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const sections = [
    {
      title: 'Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-50" value={user?.email} disabled />
          </div>
          <motion.button
            onClick={handleSaveProfile}
            disabled={saving}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">
            Enable browser notifications to get reminders for your habits.
          </p>
          <div className="flex items-center gap-3">
            <div className={`text-xs px-2.5 py-1 rounded-full font-mono ${
              notifPermission === 'granted' ? 'bg-green-500/10 text-green-400' :
              notifPermission === 'denied' ? 'bg-red-500/10 text-red-400' :
              'bg-yellow-500/10 text-yellow-400'
            }`}>
              {notifPermission === 'granted' ? '✓ Enabled' : notifPermission === 'denied' ? '✗ Blocked' : 'Not set'}
            </div>
            {notifPermission !== 'granted' && notifPermission !== 'denied' && (
              <button onClick={requestNotifications} className="btn-ghost text-sm">
                Enable Notifications
              </button>
            )}
            {notifPermission === 'denied' && (
              <p className="text-xs text-white/30">Please enable in browser settings</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Data & Export',
      icon: Download,
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">Export all your habit data and history.</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleExportJSON} className="btn-ghost text-sm flex items-center gap-2">
              <Download size={13} /> Export JSON
            </button>
            <button onClick={handleExportCSV} className="btn-ghost text-sm flex items-center gap-2">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      )
    },
    {
      title: 'Account',
      icon: Shield,
      content: (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">Account information and security.</p>
          <div className="glass rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Member since</span>
              <span className="text-white/70 font-mono">{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Achievements</span>
              <span className="text-white/70">{user?.achievements?.length || 0} unlocked</span>
            </div>
          </div>
          {user?.achievements?.length > 0 && (
            <div>
              <p className="text-xs text-white/30 mb-2 font-display uppercase tracking-wider">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {user.achievements.map(a => (
                  <div key={a.id} className="glass rounded-lg px-3 py-2 text-xs flex items-center gap-2" title={a.description}>
                    <span>{a.icon}</span>
                    <span className="text-white/60">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.div {...pageTransition} className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {sections.map(({ title, icon: Icon, content }) => (
          <motion.div
            key={title}
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * sections.indexOf(sections.find(s => s.title === title)) }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Icon size={14} className="text-accent" />
              </div>
              <h2 className="font-display font-semibold text-white">{title}</h2>
            </div>
            {content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
