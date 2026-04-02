import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Calendar, ShieldCheck, Wallet, Edit3, Ban, Search, UserMinus, ArrowLeft, Car, Clock, AlertCircle
} from 'lucide-react';

import Navbar1 from './Navbar1';
import NotificationBox from './NotificationBox';
import parkingApi from '../api/parkingApi';

const UserDetailView = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('id');
    
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [activeTab, setActiveTab] = useState('Profile Overview');
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Require a user ID to view profile
                if (!userId) {
                    setError('No user ID provided. Please select a user from User Management.');
                    setLoading(false);
                    return;
                }
                
                try {
                    const usersResponse = await parkingApi.getUsers();
                    const usersData = usersResponse?.users || [];
                    const targetUser = usersData.find(u => String(u.id) === String(userId));
                    
                    if (targetUser) {
                        setUser({
                            id: `SPS-${targetUser.id}`,
                            dbId: targetUser.id,
                            name: `${targetUser.firstname || ''} ${targetUser.lastname || ''}`.trim() || targetUser.email?.split('@')[0],
                            email: targetUser.email,
                            phone: targetUser.phone || 'N/A',
                            joined: targetUser.created_at ? new Date(targetUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                            status: 'Active',
                            isBlocked: false,
                            balance: 'N/A',
                            subscription: 'basic',
                            location: '',
                            stats: {
                                bookings: '0',
                                growth: 'N/A',
                                active: '0',
                                location: 'No active parking',
                                success: '0%',
                                spent: '₹0'
                            }
                        });
                        
                        try {
                            const vehiclesResponse = await parkingApi.getVehicles();
                            const vehiclesData = vehiclesResponse?.vehicles || [];
                            setVehicles(vehiclesData);
                        } catch (e) {
                            console.warn('Could not fetch vehicles:', e);
                        }
                        
                        try {
                            const walletResponse = await parkingApi.getWallet();
                            setWallet(walletResponse?.wallet);
                        } catch (e) {
                            console.warn('Could not fetch wallet:', e);
                        }
                        
                        try {
                            const historyResponse = await parkingApi.getHistory();
                            const historyData = historyResponse?.history || [];
                            setBookings(historyData);
                        } catch (e) {
                            console.warn('Could not fetch history:', e);
                        }
                    } else {
                        setError(`User with ID "${userId}" not found.`);
                    }
                } catch (e) {
                    console.error('Could not fetch user:', e);
                    setError('Failed to load user data. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [userId]);

    const handleBlockToggle = () => {
        if (!user) return;
        const action = user.isBlocked ? 'unblock' : 'block';
        const confirmed = window.confirm(`Are you sure you want to ${action} ${user.name}?`);

        if (confirmed) {
            setUser(prev => ({ ...prev, isBlocked: !prev.isBlocked }));
            console.log(`User ${user.id} status updated to: ${!user.isBlocked ? 'Blocked' : 'Active'}`);
        }
    };

    const showSubscription = user?.subscription === 'pro' || user?.subscription === 'max';
    const subscriptionLabel = user?.subscription === 'max' ? 'Max Plan' : 'Pro Plan';

    const renderTabContent = () => {
        if (!user) return null;
        
        switch (activeTab) {
            case 'Profile Overview': return <ProfileOverview user={user} />;
            case 'Activity History': return <ActivityHistory bookings={bookings} />;
            case 'Vehicle Garage': return <VehicleGarage vehicles={vehicles} />;
            case 'Wallet Transactions': return <WalletTransactions wallet={wallet} />;
            default: return <ProfileOverview user={user} />;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full bg-[#051113] font-['Manrope'] text-slate-300 overflow-hidden items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full bg-[#051113] font-['Manrope'] text-slate-300 overflow-hidden">
                <Navbar1 />
                <main className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center">
                        <AlertCircle className="size-16 text-amber-500 mb-4 mx-auto" />
                        <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Profile</h2>
                        <p className="text-slate-500 mb-6">{error}</p>
                        <button 
                            onClick={() => navigate('/UserManagement')}
                            className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all"
                        >
                            Back to User Management
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#051113] font-['Manrope'] text-slate-300 overflow-hidden">
            <Navbar1 />

            <main className="flex-1 flex flex-col overflow-y-auto p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="relative w-full md:w-1/3 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
                        <NotificationBox />
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="mb-8 flex justify-between items-end">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => navigate('/UserManagement')}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-slate-400" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">User Profile</h1>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Account: {user.id} • {user.email}
                                    </p>
                                </div>
                            </div>
                            {user.isBlocked && (
                                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                                    <UserMinus className="text-red-500" size={16} />
                                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Account Restricted</span>
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-8 border-b border-white/5 mb-8">
                            {['Profile Overview', 'Activity History', 'Vehicle Garage', 'Wallet Transactions'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]" />}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                            <StatCard label="Total Bookings" value={user.stats.bookings} sub={user.stats.growth} subColor="text-emerald-400" />
                            <StatCard label="Active Now" value={user.stats.active} sub={user.stats.location} />
                            <StatCard label="Status" value={user.isBlocked ? "Blocked" : "Verified"} sub={user.isBlocked ? "Restricted" : "Good Standing"} subColor={user.isBlocked ? "text-red-400" : "text-emerald-400"} />
                            <StatCard label="Total Spent" value={user.stats.spent} sub="Tier: Gold" />
                        </div>

                        {renderTabContent()}
                    </div>

                    <aside className="w-full lg:w-80 bg-[#08181a] border border-white/5 rounded-3xl p-8 shrink-0 h-fit sticky top-0">
                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="relative mb-6">
                                <div className={`size-24 rounded-full p-1 bg-gradient-to-tr ${user.isBlocked ? 'from-red-500 to-orange-500' : 'from-cyan-400 to-emerald-400'}`}>
                                    <img src={`https://i.pravatar.cc/150?u=${user.id}`} className="rounded-full border-4 border-[#08181a]" alt="User" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                            {showSubscription && (
                                <span className="px-4 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-400/20">
                                    {subscriptionLabel}
                                </span>
                            )}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <SidebarInfo icon={<Calendar size={18} />} label="Member Since" value={user.joined} />
                            <SidebarInfo
                                icon={<ShieldCheck size={18} />}
                                label="System Status"
                                value={user.isBlocked ? "Suspended" : "Active"}
                                valColor={user.isBlocked ? "text-red-500" : "text-emerald-400"}
                            />
                            <SidebarInfo icon={<Wallet size={18} />} label="Wallet" value={wallet?.balance ? `₹${wallet.balance}` : user.balance} />

                            <div className="pt-4 flex flex-col gap-2">
                                <ActionButton icon={<Edit3 size={14} />} label="Edit Profile" theme="primary" />

                                <ActionButton
                                    icon={<Ban size={14} />}
                                    label={user.isBlocked ? "Unblock User" : "Block User"}
                                    theme={user.isBlocked ? "success" : "danger"}
                                    onClick={handleBlockToggle}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

/* --- Helper Components --- */

const StatCard = ({ label, value, sub, subColor = "text-slate-500" }) => (
    <div className="bg-[#0c1e20] border border-white/5 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className={`text-[9px] font-bold ${subColor}`}>{sub}</p>
    </div>
);

const ActionButton = ({ icon, label, theme, onClick }) => {
    const styles = {
        primary: "bg-cyan-400 text-black hover:bg-cyan-300",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
        success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
    };
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${styles[theme]}`}
        >
            {icon} {label}
        </button>
    );
};

const ProfileOverview = ({ user }) => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-[#0c1e20] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Account Bio</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
                {user.name} is a registered Smart Parking System user based in {user.location}.
                Current account status is <span className={user.isBlocked ? 'text-red-500' : 'text-cyan-400'}>{user.isBlocked ? 'RESTRICTED' : 'NORMAL'}</span>.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Email</p>
                    <p className="text-sm text-white">{user.email}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Phone</p>
                    <p className="text-sm text-white">{user.phone}</p>
                </div>
            </div>
        </div>
    </div>
);

const ActivityHistory = ({ bookings }) => {
    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-slate-500 text-sm italic p-10 border border-dashed border-white/10 rounded-2xl text-center">
                <Clock size={32} className="mx-auto mb-3 opacity-30" />
                <p>No recent parking activity.</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-4 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5 animate-in fade-in duration-300">
            {bookings.slice(0, 10).map((booking, idx) => (
                <ActivityItem
                    key={booking.id || idx}
                    title={booking.title || booking.slot_name || `Slot #${booking.slot_id}` || 'Parking Session'}
                    status={booking.status || 'Completed'}
                    statusClass={booking.status === 'active' ? 'bg-cyan-400 text-black' : 'bg-slate-600 text-white'}
                    dotClass={booking.status === 'active' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-500'}
                    data={[
                        { label: 'Date', val: booking.booked_at ? new Date(booking.booked_at).toLocaleDateString() : 'N/A' },
                        { label: 'Duration', val: booking.duration || 'N/A' },
                        { label: 'Amount', val: `₹${booking.amount || 0}`, valClass: 'text-cyan-400' }
                    ]}
                />
            ))}
        </div>
    );
};

const ActivityItem = ({ title, status, statusClass, dotClass, data }) => (
    <div className="relative pl-8 group">
        <div className={`absolute left-0 top-6 size-3 rounded-full border-2 border-[#051113] z-10 ${dotClass}`} />
        <div className="bg-[#0c1e20] border border-white/5 rounded-xl p-5 flex justify-between items-center group-hover:border-cyan-400/20 transition-all">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${statusClass}`}>{status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.map((item, idx) => (
                        <div key={idx}>
                            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">{item.label}</p>
                            <p className={`text-[11px] font-bold ${item.valClass || 'text-slate-300'}`}>{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SidebarInfo = ({ icon, label, value, valColor = "text-slate-200" }) => (
    <div className="flex items-center gap-3">
        <div className="text-cyan-400/40">{icon}</div>
        <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`text-[13px] font-bold ${valColor}`}>{value}</p>
        </div>
    </div>
);

const VehicleGarage = ({ vehicles }) => {
    if (!vehicles || vehicles.length === 0) {
        return (
            <div className="text-slate-500 text-sm italic p-10 border border-dashed border-white/10 rounded-2xl text-center">
                <Car size={32} className="mx-auto mb-3 opacity-30" />
                <p>No vehicles registered yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {vehicles.map((vehicle, idx) => (
                <VehicleCard key={vehicle.id || idx} vehicle={vehicle} />
            ))}
        </div>
    );
};

const VehicleCard = ({ vehicle }) => {
    const isDefault = vehicle.is_default || vehicle.isDefault;
    return (
        <div className="bg-[#0c1e20] border border-white/5 rounded-2xl overflow-hidden group hover:border-cyan-400/30 transition-all">
            <div className="h-24 bg-gradient-to-r from-[#162a2d] to-[#0c1e20] relative p-4">
                {isDefault && (
                    <span className="px-2 py-0.5 bg-cyan-400 text-black text-[8px] font-black uppercase rounded">Default</span>
                )}
                <h4 className="text-white font-bold mt-1">{vehicle.name}</h4>
                <p className="text-xs text-slate-400">{vehicle.plate}</p>
            </div>
            <div className="p-4 flex justify-between items-center border-t border-white/5">
                <p className="text-xs font-mono font-bold text-cyan-400">{vehicle.plate}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                    {isDefault ? 'Active Vehicle' : 'Registered'}
                </p>
            </div>
        </div>
    );
};

const WalletTransactions = ({ wallet }) => {
    if (!wallet) {
        return (
            <div className="text-slate-500 text-sm italic p-10 border border-dashed border-white/10 rounded-2xl text-center">
                <Wallet size={32} className="mx-auto mb-3 opacity-30" />
                <p>No wallet data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0c1e20] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Wallet Balance</h3>
            <p className="text-3xl font-bold text-cyan-400">₹{wallet.balance || 0}</p>
            <p className="text-slate-500 text-sm mt-2">Last updated: {wallet.updated_at ? new Date(wallet.updated_at).toLocaleString() : 'N/A'}</p>
        </div>
    );
};

export default UserDetailView;