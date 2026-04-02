import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronLeft, ChevronRight, Database, UserX } from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader';
import { getSlots, getAvailableSlots, getMe, getAdmins } from '../api/parkingApi';

// --- NEON THEMED SUB-COMPONENTS ---

const FilterBar = ({ onFilterChange }) => (
    <div className="px-8 py-6 flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                Date Range
            </label>
            <div className="flex items-center bg-[#112325] rounded-xl px-3 py-1 border border-[#1a2e30] focus-within:border-cyan-500/50 transition-all">
                <input className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 cursor-pointer w-32 py-1.5" type="date" />
                <span className="text-slate-600 text-[10px] font-bold uppercase px-2 select-none">to</span>
                <input className="bg-transparent border-none text-xs text-slate-300 focus:ring-0 cursor-pointer w-32 py-1.5" type="date" />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Event Type</label>
            <select
                onChange={(e) => onFilterChange(e.target.value)}
                className="bg-[#112325] border-[#1a2e30] rounded-xl text-xs py-2.5 px-4 focus:ring-1 focus:ring-cyan-500/50 text-slate-300 min-w-[160px] outline-none cursor-pointer"
            >
                <option value="All">All Event Types</option>
                <option value="Booking">Booking</option>
                <option value="Payment">Payment</option>
                <option value="System">System</option>
            </select>
        </div>
        <button className="self-end p-2.5 bg-[#112325] text-cyan-400 rounded-xl hover:bg-cyan-500/10 border border-[#1a2e30] transition-all shadow-lg">
            <Filter size={20} />
        </button>
    </div>
);

const LogTable = ({ logs }) => (
    <div className="bg-[#112325]/40 border border-[#1a2e30] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[#112325] border-b border-[#1a2e30]">
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User / Device</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Log Details</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2e30]">
                {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-cyan-500/[0.03] transition-colors group">
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{log.time}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-slate-800 border border-[#1a2e30] flex items-center justify-center text-[10px] font-bold text-cyan-400">
                                    {log.user.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-200">{log.user}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter shadow-sm border ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                log.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {log.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 group-hover:text-slate-300">{log.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const SystemLogs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [profile, setProfile] = useState();

    useEffect(() => {
    const loadProfile = async () => {
      try {
        // First try localStorage for fast display
        const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        if (savedProfile.fullName) {
          setProfile({ fullName: savedProfile.fullName });
        }

        // Then fetch fresh from backend database
        const response = await getMe();
        const user = response?.user || response;
        
        // Fetch admins to get full name from database
        const adminsResponse = await getAdmins();
        const admins = adminsResponse?.admins || adminsResponse;
        
        if (admins && admins.length > 0 && user?.email) {
          const currentAdmin = admins.find(admin => admin.email.toLowerCase() === user.email.toLowerCase());
          if (currentAdmin) {
            const fullName = `${currentAdmin.firstname || ''} ${currentAdmin.lastname || ''}`.trim() || currentAdmin.name || 'Admin';
            const profileData = { fullName };
            setProfile(profileData);
            localStorage.setItem('adminProfile', JSON.stringify(profileData));
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        setProfile({ fullName: savedProfile.fullName || 'Admin' });
      }
    };
    loadProfile();
  }, []);


    // --- 1. Load users from registry ---
    useEffect(() => {
        const saved = localStorage.getItem('parking_users');
        if (saved) {
            setRegisteredUsers(JSON.parse(saved));
        }
    }, []);

    // --- 2. Generate logs dynamically based on registered users ---
    const dynamicLogs = useMemo(() => {
        if (registeredUsers.length === 0) return [];

        return registeredUsers.flatMap((user, index) => {
            // Create 2 unique logs for every user in the registry
            return [
                {
                    id: `${user.id}-1`,
                    time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    user: user.name,
                    status: user.status === 'active' ? 'Success' : 'Warning',
                    details: `User session initialized. Role: ${user.role.toUpperCase()}`,
                    type: 'System'
                },
                {
                    id: `${user.id}-2`,
                    time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    user: user.name,
                    status: 'Success',
                    details: `Parking activity recorded: ${user.vehicles} vehicles synced.`,
                    type: 'Booking'
                }
            ];
        });
    }, [registeredUsers]);

    // --- 3. Filter and Search Logic ---
    const filteredLogs = useMemo(() => {
        return dynamicLogs.filter(log => {
            const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.details.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || log.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [dynamicLogs, searchQuery, filterType]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0b1719] text-slate-100 font-['Space_Grotesk']">
            <Navbar1 />

            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1414] to-[#080d0d] p-6 overflow-y-auto">
                <AdminHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    profile={profile}
                />

                <div className="flex-1 overflow-auto">
                    {/* Search Input */}
                    <div className="px-8 py-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search logs by user or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full max-w-md bg-[#112325] border border-[#1a2e30] rounded-xl px-5 py-3.5 text-sm text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-lg backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    <FilterBar onFilterChange={setFilterType} />

                    <div className="px-8 pb-8">
                        {registeredUsers.length === 0 ? (
                            /* --- Empty State --- */
                            <div className="flex flex-col items-center justify-center py-32 bg-[#112325]/20 border-2 border-dashed border-[#1a2e30] rounded-3xl">
                                <div className="bg-[#1a2e30] p-6 rounded-full mb-4">
                                    <Database size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white">No System Logs Found</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-xs text-center">
                                    The system log is currently empty because there are no users registered in the system.
                                </p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            /* --- No Results Search --- */
                            <div className="text-center py-20">
                                <UserX size={48} className="mx-auto text-slate-700 mb-4" />
                                <p className="text-slate-500 font-medium">
                                    {searchQuery
                                        ? `No logs match "${searchQuery}"`
                                        : 'No logs match your filter criteria.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <LogTable logs={filteredLogs} />

                                <div className="mt-8 flex items-center justify-between px-2">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                                        Showing <span className="text-cyan-400">{filteredLogs.length}</span> of{' '}
                                        <span className="text-cyan-400">{dynamicLogs.length}</span> logs
                                        {searchQuery && ` (search: "${searchQuery}")`}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button className="p-2 rounded-lg bg-[#112325] text-slate-400 border border-[#1a2e30] hover:text-cyan-400">
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button className="px-4 py-2 rounded-lg bg-cyan-500 text-[#0b1719] text-xs font-black shadow-lg shadow-cyan-500/30">
                                            1
                                        </button>
                                        <button className="p-2 rounded-lg bg-[#112325] text-slate-400 border border-[#1a2e30] hover:text-cyan-400">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SystemLogs;