import React, { useState, useEffect } from 'react';
import { Search, Shield, User, Crown } from 'lucide-react';
import NotificationBox from './NotificationBox';
import { getMe, getAdmins } from '../api/parkingApi.js';

// Role badge configuration
const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Administrator',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  admin: {
    label: 'Administrator',
    icon: Shield,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  moderator: {
    label: 'Moderator',
    icon: User,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  manager: {
    label: 'Manager',
    icon: User,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  }
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color} ${config.bgColor} ${config.borderColor}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const AdminHeader = ({ 
  searchTerm, 
  onSearchChange, 
  profile: propProfile, 
  className = '' 
}) => {
  const [localProfile, setLocalProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Storage sync effect
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adminProfile') {
        try {
          const savedProfile = JSON.parse(e.newValue || '{}');
          setLocalProfile({
            fullName: savedProfile.fullName || 'AdminGuest',
            role: savedProfile.role || 'admin',
            avatarUrl: savedProfile.avatarUrl || null
          });
        } catch (err) {
          console.warn('Invalid adminProfile in localStorage:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch profile from backend if not provided and token exists
  useEffect(() => {
    const token = localStorage.getItem('parkingAuthToken');
    if (propProfile || localProfile || !token || loadingProfile) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const userData = await getMe();
        const user = userData?.user || userData;
        
        // Fetch admins to get role from database
        const adminsResponse = await getAdmins();
        const admins = adminsResponse?.admins || adminsResponse;
        
        let role = 'admin';
        let fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.name || 'Admin';
        
        if (admins && admins.length > 0 && user?.email) {
          const currentAdmin = admins.find(admin => admin.email.toLowerCase() === user.email.toLowerCase());
          if (currentAdmin) {
            role = currentAdmin.role || 'admin';
            fullName = `${currentAdmin.firstname || ''} ${currentAdmin.lastname || ''}`.trim() || currentAdmin.name || fullName;
          }
        }
        
        const newProfile = {
          fullName,
          role,
          avatarUrl: localProfile?.avatarUrl || null
        };

        setLocalProfile(newProfile);
        
        // Save to localStorage for persistence and sync
        localStorage.setItem('adminProfile', JSON.stringify(newProfile));
      } catch (error) {
        console.warn('Failed to fetch admin profile:', error);
        // Fallback to basic admin profile
        setLocalProfile({ fullName: 'Admin', role: 'admin', avatarUrl: null });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [propProfile, localProfile, loadingProfile]);

  const displayProfile = propProfile || localProfile || { fullName: loadingProfile ? 'Loading...' : 'AdminGuest', role: 'admin', avatarUrl: null };

  return (
    <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 ${className}`}>
      <div className="relative w-full md:w-1/3 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search your query..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white transition-all"
        />
      </div>
      <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
        <NotificationBox />
        <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm text-white leading-none">
              {displayProfile.fullName || 'Admin'}
            </p>
            <div className="mt-1.5">
              <RoleBadge role={displayProfile.role} />
            </div>
          </div>
          <img 
            src={displayProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.fullName || 'Admin'}`} 
            className="size-10 rounded-xl border border-white/10 shadow-lg object-cover" 
            alt="Profile" 
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
