import React, { useState, useEffect } from 'react';
import {
  User, Bell, Edit2, Shield
} from 'lucide-react';
import Navbar from './Navbar'
import './Settings.css'
import parkingApi from '../api/parkingApi';
import { notifyProfileUpdated } from '../utils/notificationUtils';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [savedProfile, setSavedProfile] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) {
          console.warn('No auth token, using local fallback');
          const saved = localStorage.getItem('userProfile');
          if (saved) {
            const parsedProfile = JSON.parse(saved);
            setSavedProfile(parsedProfile);
            setProfile(parsedProfile);
          }
          return;
        }
        parkingApi.setToken(token);
        const user = await parkingApi.getMe();
        const profileData = {
          firstName: user.user.firstname || '',
          lastName: user.user.lastname || '',
          email: user.user.email || '',
          phone: user.user.phone || ''
        };
        setProfile(profileData);
        setSavedProfile(profileData);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          const parsedProfile = JSON.parse(saved);
          setSavedProfile(parsedProfile);
          setProfile(parsedProfile);
        }
      }
    };
    loadUserProfile();
  }, []);

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    try {
      const profileToSave = { ...profile };
      setSavedProfile(profileToSave);
      localStorage.setItem('userProfile', JSON.stringify(profileToSave));

      // Trigger notification for profile update
      notifyProfileUpdated(profileToSave);

      alert("Profile saved successfully!");
    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed: ' + error.message);
    }
  };

  return (
    <div className={`flex h-screen bg-[#080d0d] text-slate-300 font-sans overflow-hidden`}>
      <div className="flex w-full h-full bg-slate-50 dark:bg-[#0f2123] text-slate-900 dark:text-white transition-colors duration-200">

        <Navbar />

        <main className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-10 transition-all duration-300 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">
          <div className="max-w-5xl mx-auto px-8 py-10 space-y-12">

            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black leading-tight tracking-tight">Settings</h1>
              <p className="text-slate-500 dark:text-[#8ec6cc] text-lg">Manage your account, notifications, and app preferences.</p>
            </div>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-[#06e0f9]" /> Profile Settings
              </h2>

              <div className="bg-[#121e1e] p-8 md:p-10 rounded-[2.5rem] border border-white/5 flex flex-wrap justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="size-24 rounded-full border-2 border-[#06e0f9] p-1">
                      <div className="w-full h-full bg-slate-300 rounded-full bg-cover" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=Alex')` }}></div>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-[#06e0f9] text-[#0f2123] p-1.5 rounded-full border-2 border-white dark:border-[#1c3235] hover:scale-110 transition-transform">
                      <Edit2 size={12} strokeWidth={3} />
                    </button>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{savedProfile ? savedProfile.firstName || profile.firstName : profile.firstName || 'Unknown'} {savedProfile ? savedProfile.lastName || profile.lastName : profile.lastName || 'User'}</p>
                    <p className="text-slate-500 dark:text-[#8ec6cc]">{savedProfile ? savedProfile.email : profile.email || 'unknownuser@example.com'}</p>
                    <p className='text-slate-500 dark:text-[#8ec6cc]'>+91 {savedProfile ? savedProfile.phone : profile.phone || 'No phone number'}</p>
                    <span className="inline-flex items-center gap-1 bg-[#06e0f9]/20 text-[#06e0f9] text-[12px] px-3 py-1 rounded-full font-bold uppercase"><Shield size={12} />Verified User</span>
                  </div>
                </div>
                <button onClick={handleSaveProfile} className="bg-[#06e0f9] hover:bg-[#06e0f9]/80 text-[#0f2123] font-bold py-2 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(6,224,249,0.3)]">
                  Save Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold opacity-80">First Name</span>
                  <input
                    className="w-full rounded-lg border-slate-200 border-white text-black bg-transparent dark:bg-transparent text-slate-900 text-white h-12 px-4 shadow-sm focus:ring-2 focus:ring-[#06e0f9] outline-none settings-input"
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold opacity-80">Last Name</span>
                  <input
                    className="w-full rounded-lg border-slate-200 border-white text-black bg-transparent dark:bg-transparent text-slate-900 text-white h-12 px-4 shadow-sm focus:ring-2 focus:ring-[#06e0f9] outline-none settings-input"
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold opacity-80">Email Address</span>
                  <input
                    className="w-full rounded-lg border-slate-200 dark:border-white text-black bg-transparent dark:bg-transparent text-slate-900 text-white h-12 px-4 shadow-sm focus:ring-2 focus:ring-[#06e0f9] outline-none settings-input"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold opacity-80">Phone Number</span>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 border border-white/10 rounded-l-lg text-slate-400 font-mono text-sm">
                      +91
                    </span>
                    <input
                      className="flex-1 rounded-lg border-slate-200 dark:border-white text-black bg-transparent dark:bg-transparent text-slate-900 text-white h-12 px-4 shadow-sm focus:ring-2 focus:ring-[#06e0f9] outline-none settings-input rounded-l-none"
                      type="tel"
                      placeholder="00000 00000"
                      maxLength={10}
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="space-y-6 pt-10 border-t border-white/5">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="text-[#06e0f9]" /> Notifications
              </h2>
              <div className="bg-[#121e1e] rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                {Object.entries({
                  push: ["Push Notifications", "Alerts for reservation status and timing."],
                  email: ["Email Notifications", "Monthly billing statements and parking history."],
                  sms: ["SMS Alerts", "Urgent updates about your current parking session."]
                }).map(([key, [title, desc]]) => (
                  <div key={key} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="text-slate-500 dark:text-[#8ec6cc] text-sm">{desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(key)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${notifications[key] ? 'bg-[#06e0f9]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications[key] ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;