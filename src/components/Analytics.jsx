import React, {useEffect, useState} from 'react';
import {
    TrendingUp, Wallet, BarChart3, Zap, Sparkles, Clock, Wrench, ChevronRight
} from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader';
import { getMe, getAdmins } from '../api/parkingApi';

const SuggestionItem = ({ icon: Icon, title, desc, color, bgColor }) => (
    <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
        <div className={`size-10 rounded-lg ${bgColor} ${color} flex items-center justify-center shrink-0 shadow-lg`}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
        </div>
        <button className="self-center px-3 py-1.5 bg-white/5 hover:bg-cyan-500 hover:text-[#0f2123] text-[10px] font-bold rounded-md transition-all text-slate-400 flex items-center gap-1">
            APPLY <ChevronRight size={12} />
        </button>
    </div>
);

const HeatmapCard = () => (
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 bg-slate-800/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Peak Usage Analysis</h3>
            <div className="flex gap-2">
                <div className="flex items-center gap-1">
                    <div className="size-2 bg-slate-800 rounded-sm"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Low</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="size-2 bg-cyan-500 rounded-sm"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">High</span>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-12 gap-1.5 opacity-40">
            {[...Array(24)].map((_, i) => (
                <div
                    key={i}
                    className="h-12 rounded-md bg-slate-800/40 border border-white/5 transition-all"
                />
            ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-bold px-1 uppercase tracking-widest">
            <span>08 AM</span>
            <span>12 PM</span>
            <span>04 PM</span>
            <span>08 PM</span>
        </div>
    </div>
);

const AnalyticsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
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
                        setProfile({ fullName });
                        localStorage.setItem('adminProfile', JSON.stringify({ fullName }));
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

    return (
        <div className="flex h-screen bg-[#0f2123] text-slate-100 font-sans overflow-hidden">
            <Navbar1 />

            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1414] to-[#080d0d] p-6 overflow-y-auto custom-scrollbar">
                <AdminHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    profile={profile}
                />

                <div className="p-8">
                    <section className="mb-8">
                        <h1 className="text-3xl font-bold text-white tracking-tight">System Analytics & Insights</h1>
                        <p className="text-slate-400 mt-2">Real-time monitoring and predictive occupancy data for all levels.</p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <MetricCard title="Total Revenue" value="₹0" trend="0%" trendLabel="" icon={<Wallet size={20} />} color="text-cyan-400" />
                        <MetricCard title="Avg Occupancy" value="0%" trend="0%" trendLabel="" icon={<BarChart3 size={20} />} color="text-emerald-400" />
                        <MetricCard title="System Uptime" value="0%" trend="Stable" trendLabel="" icon={<Zap size={20} />} color="text-cyan-400" highlight />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/50 bg-slate-800/10 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Occupancy Trends by Zone</h3>
                                    <p className="text-sm text-slate-500 font-medium">Live monitoring across Zones A, B, and C</p>
                                </div>
                                <select className="bg-slate-800 border-none text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer">
                                    <option>Last 24 Hours</option>
                                    <option>Last 7 Days</option>
                                </select>
                            </div>
                            <div className="h-64 w-full relative">
                                <OccupancyChart />
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 bg-slate-800/10 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white mb-2">Payment Methods</h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">Transaction volume by type</p>
                            <div className="space-y-6">
                                <ProgressBar label="UPI Payments" percent={0} color="bg-cyan-500" />
                                <ProgressBar label="Card Transactions" percent={0} color="bg-emerald-500" />
                                <ProgressBar label="Digital Wallet" percent={0} color="bg-slate-500" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <HeatmapCard />
                        <AIInsightsCard />
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- HELPER UI COMPONENTS ---

const MetricCard = ({ title, value, trend, trendLabel, icon, color, highlight = false }) => (
    <div className={`p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md transition-all hover:border-cyan-500/30 ${highlight ? 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]' : 'bg-slate-800/10'}`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <span className={color}>{icon}</span>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-emerald-400 text-sm font-bold flex items-center">
                {trend !== 'Stable' && <TrendingUp size={14} className="mr-1" />} {trend}
            </span>
            <span className="text-slate-500 text-xs">{trendLabel}</span>
        </div>
    </div>
);

const ProgressBar = ({ label, percent, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium">{label}</span>
            <span className="text-white font-bold">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full shadow-[0_0_8px_rgba(0,229,255,0.2)]`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

const OccupancyChart = () => (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-20 transition-all duration-700">
        <defs>
            <linearGradient id="gradientA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Flat Path A (Green) - All Y coordinates moved to 195 */}
        <path
            d="M0 195 C50 195, 100 195, 150 195 C200 195, 250 195, 300 195 C350 195, 400 195, 450 195"
            stroke="#10b981"
            strokeWidth="2"
            fill="url(#gradientA)"
            strokeLinecap="round"
        />

        {/* Flat Path B (Cyan) - All Y coordinates moved to 195 */}
        <path
            d="M0 195 C80 195, 150 195, 220 195 C290 195, 350 195, 400 195"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
        />

        {/* Optional: X-Axis baseline for cleaner look */}
        <line x1="0" y1="195" x2="400" y2="195" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
    </svg>
);

const AIInsightsCard = () => (
    <div className="p-6 rounded-2xl border border-emerald-500/20 bg-slate-800/10 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold text-white">AI Optimization Suggestions</h3>
        </div>
        <div className="space-y-4">
            <SuggestionItem icon={Clock} title="Peak Hour Adjustment" desc="High traffic detected 17:00-19:00. Suggested dynamic pricing: +15% Zone A." color="text-emerald-400" bgColor="bg-emerald-400/20" />
            <SuggestionItem icon={Zap} title="EV Station Optimization" desc="Zone B chargers are underutilized. Consider 10% discount for EV slots." color="text-cyan-400" bgColor="bg-cyan-400/20" />
            <SuggestionItem icon={Wrench} title="Predictive Maintenance" desc="Sensor #G12-B in Zone A shows intermittent connectivity. Maintenance ticket suggested." color="text-amber-400" bgColor="bg-amber-400/20" />
        </div>
    </div>
);

export default AnalyticsDashboard;