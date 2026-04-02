import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, LayoutGrid, List, Ban, Mail, LockOpen,
    ChevronLeft, ChevronRight, UserPlus, X, User, Shield, RotateCcw, UserX
} from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader';

import parkingApi, { getAdmins } from '../api/parkingApi';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({ fullName: 'Loading...' });

    useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          
          // First try to get from localStorage (fastest)
          const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
          if (savedProfile.fullName) {
            setProfile({ fullName: savedProfile.fullName });
          }
          
          // Then fetch fresh data from backend database
          const userData = await parkingApi.getMe();
          const user = userData?.user || userData;
          
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

          // Fetch users from database
          const usersResponse = await parkingApi.getUsers();
          const usersData = usersResponse?.users || usersResponse;
          
          // Map database fields to display format
          const mappedUsers = (Array.isArray(usersData) ? usersData : []).map(u => ({
            id: `SPS-${u.id}`,
            dbId: u.id,
            name: `${u.firstname || ''} ${u.lastname || ''}`.trim() || u.name || u.email?.split('@')[0],
            email: u.email,
            firstname: u.firstname,
            lastname: u.lastname,
            phone: u.phone,
            role: 'user',
            vehicles: 0,
            parked: '0h',
            status: 'active',
            joinedAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
          }));
          
          setUsers(mappedUsers);
        } catch (err) {
          console.error('UserManagement load error:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []); 

    const [viewMode, setViewMode] = useState('cards');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRegisterUser = (newData) => {
        const newUser = {
            id: `SPS-${Math.floor(1000 + Math.random() * 9000)}`,
            name: newData.name,
            email: newData.email,
            role: newData.role,
            vehicles: 0,
            parked: '0h',
            status: 'active',
            joinedAt: new Date().toLocaleDateString()
        };
        setUsers(prev => [newUser, ...prev]);
    };

    const toggleUserStatus = (id) => {
        setUsers(prev => prev.map(user =>
            user.id === id
                ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
                : user
        ));
    };

    const handleDeleteUser = (id) => {
        if (window.confirm("Are you sure you want to remove this user?")) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleResetData = () => {
        if (window.confirm("Clear all registered users?")) {
            setUsers([]);
            localStorage.removeItem('parking_users');
        }
    };

    // --- Filter Logic ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'All' || user.status === filterStatus.toLowerCase();
            return matchesSearch && matchesFilter;
        });
    }, [users, searchQuery, filterStatus]);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[#0f2123] font-display text-slate-100">
            <Navbar1 />
            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1414] to-[#080d0d] p-4 md:p-6 overflow-y-auto">

                {/* Header */}
                <AdminHeader searchQuery={searchQuery}
                    onSearchChange={setSearchQuery} profile={profile} />


                {/* Title & View Switcher */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">User Management</h1>
                        <p className="text-slate-400 mt-1 text-sm md:text-base">Managing {users.length} registered smart parking profiles.</p>
                    </div>

                    {users.length > 0 && (
                        <div className="flex bg-[#21464a] p-1 rounded-xl shadow-inner">
                            <ToggleButton active={viewMode === 'table'} onClick={() => setViewMode('table')} icon={<List size={18} />} label="Table" />
                            <ToggleButton active={viewMode === 'cards'} onClick={() => setViewMode('cards')} icon={<LayoutGrid size={18} />} label="Cards" />
                        </div>
                    )}
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex gap-2">
                        {['All', 'Active', 'Blocked'].map(status => (
                            <Badge
                                key={status}
                                label={status}
                                active={filterStatus === status}
                                onClick={() => setFilterStatus(status)}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {users.length > 0 && (
                            <button
                                onClick={handleResetData}
                                className="px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <RotateCcw size={18} /> Reset All
                            </button>
                        )}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 md:flex-none bg-[#06e0f9] text-[#0f2123] px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,224,249,0.3)]"
                        >
                            <UserPlus size={20} /> Register User
                        </button>
                    </div>
                </div>

                {/* Main Content Conditional Logic */}
                {users.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#1a2e30]/20 border-2 border-dashed border-[#21464a] rounded-3xl p-12 text-center">
                        <div className="bg-[#21464a]/50 p-6 rounded-full mb-6 border border-white/5">
                            <UserX size={48} className="text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Registry is Empty</h2>
                        <p className="text-slate-400 max-w-sm mb-8 text-sm">
                            No profiles have been registered yet. Click the button below to add your first user to the system.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#06e0f9]/10 text-[#06e0f9] border border-[#06e0f9]/30 px-8 py-3 rounded-xl font-bold hover:bg-[#06e0f9] hover:text-[#0f2123] transition-all"
                        >
                            Register First User
                        </button>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
                        <Search size={48} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                        <button onClick={() => { setSearchQuery(''); setFilterStatus('All'); }} className="text-cyan-500 text-sm mt-2 underline">Clear all filters</button>
                    </div>
                ) : (
                    <>
                        {viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredUsers.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onToggleStatus={toggleUserStatus}
                                        onDelete={handleDeleteUser}
                                    />
                                ))}
                            </div>
                        ) : (
                            <UserTable
                                users={filteredUsers}
                                onToggleStatus={toggleUserStatus}
                                onDelete={handleDeleteUser}
                            />
                        )}

                        {/* Footer Pagination */}
                        <div className="mt-12 flex items-center justify-between border-t border-[#21464a] pt-6 pb-10">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                                Displaying {filteredUsers.length} of {users.length} Users
                            </p>
                            <div className="flex gap-2">
                                <IconButton icon={<ChevronLeft size={20} />} />
                                <button className="size-10 rounded-lg bg-[#06e0f9] text-[#0f2123] font-bold text-sm">1</button>
                                <IconButton icon={<ChevronRight size={20} />} />
                            </div>
                        </div>
                    </>
                )}

                <CreateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleRegisterUser}
                />
            </main>
        </div>
    );
};

// --- Sub-Components ---

const UserTable = ({ users, onToggleStatus, onDelete }) => {
    const navigate = useNavigate();
    return (
    <div className="bg-[#1a2e30] rounded-xl border border-[#21464a] overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#21464a]/50 text-[#06e0f9] text-[10px] uppercase font-black tracking-widest">
                <tr>
                    <th className="px-6 py-5">Profile</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Activity</th>
                    <th className="px-6 py-5">Joined</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#21464a]">
                {users.map(user => (
                    <tr key={user.id} className="group hover:bg-[#21464a]/30 transition-all cursor-pointer" onClick={() => navigate(`/UserDetailView?id=${user.dbId}`)}>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={`https://i.pravatar.cc/150?u=${user.id}`} className={`size-10 rounded-xl border-2 ${user.status === 'blocked' ? 'border-red-500/40 grayscale opacity-50' : 'border-white/10 group-hover:border-[#06e0f9]/50'}`} alt="" />
                                    <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-[#1a2e30] ${user.status === 'blocked' ? 'bg-red-500' : 'bg-green-400'}`} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-[#06e0f9] transition-colors">{user.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{user.id}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-[10px] uppercase font-black px-2.5 py-1 rounded-md border ${user.status === 'active' ? 'text-green-400 bg-green-400/5 border-green-400/20' : 'text-red-400 bg-red-400/5 border-red-400/20'}`}>{user.status}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-300 font-bold">{user.vehicles} Vehicles</span>
                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{user.parked} Total Time</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 tracking-wider">
                            {user.joinedAt}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); onToggleStatus(user.id); }} className={`p-2 rounded-lg transition-all ${user.status === 'blocked' ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}>
                                    {user.status === 'blocked' ? <LockOpen size={18} /> : <Ban size={18} />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(user.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10"><X size={18} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};

const UserCard = ({ user, onToggleStatus, onDelete }) => {
    const navigate = useNavigate();
    const isBlocked = user.status === 'blocked';
    return (
        <div 
            onClick={() => navigate(`/UserDetailView?id=${user.dbId}`)}
            className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${isBlocked ? 'bg-[#1a2e30]/50 border-red-500/30' : 'bg-[#1a2e30] border-[#21464a] hover:border-[#06e0f9]/40 shadow-xl'}`}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(user.id); }} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                    <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className={`size-20 rounded-2xl border-2 ${isBlocked ? 'border-red-500/40 grayscale' : 'border-[#21464a] group-hover:border-[#06e0f9]'}`} />
                    <div className={`absolute -bottom-2 -right-2 size-4 rounded-full border-4 border-[#1a2e30] ${isBlocked ? 'bg-red-500' : 'bg-green-400'}`} />
                </div>

                <div>
                    <h3 className="text-slate-100 font-bold text-lg leading-tight">{user.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 tracking-widest uppercase">{user.id}</p>
                </div>

                <div className="grid grid-cols-2 w-full gap-2 border-y border-[#21464a] py-4 my-2">
                    <Stat value={user.vehicles} label="Units" muted={isBlocked} />
                    <Stat value={user.parked} label="Parked" muted={isBlocked} border />
                </div>

                <div className="flex w-full gap-2 mt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus(user.id); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isBlocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-[#21464a] text-slate-200 hover:bg-red-500/20 hover:text-red-400'}`}
                    >
                        {isBlocked ? <LockOpen size={14} /> : <Ban size={14} />} {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button 
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-[#21464a] text-slate-300 hover:text-[#06e0f9] py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-[#06e0f9]/20"
                    >
                        <Mail size={14} /> Notify
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateUserModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ name: '', email: '', role: 'user' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#1a2f32] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#162a2d]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><UserPlus size={20} /></div>
                        <h3 className="text-xl font-bold text-white">Registry Entry</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Legal Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Alexander Pierce"
                                className="w-full bg-[#0f2123] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email for Notifications</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={18} />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                                className="w-full bg-[#0f2123] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System Privileges</label>
                        <div className="relative group">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={18} />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-[#0f2123] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white appearance-none cursor-pointer"
                            >
                                <option value="user">Standard Driver</option>
                                <option value="editor">Staff / Editor</option>
                                <option value="admin">System Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl border border-white/5 font-bold text-sm text-slate-400 hover:bg-white/5 transition-all">Discard</button>
                        <button type="submit" className="flex-2 bg-[#06e0f9] text-[#0f2123] px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(6,224,249,0.3)]">
                            Confirm Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Atomic UI Helpers ---
const Stat = ({ value, label, border, muted }) => (
    <div className={`flex flex-col ${border ? 'border-l border-white/5' : ''}`}>
        <span className={`text-xl font-bold ${muted ? 'text-slate-600' : 'text-[#06e0f9]'}`}>{value}</span>
        <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest">{label}</span>
    </div>
);

const IconButton = ({ icon }) => (
    <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-[#21464a] text-slate-100 hover:bg-[#06e0f9] hover:text-[#0f2123] transition-all shadow-lg border border-white/5">{icon}</button>
);

const ToggleButton = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-[#0f2123] text-[#06e0f9] shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{icon} <span className="hidden sm:inline">{label}</span></button>
);

const Badge = ({ label, active, onClick }) => (
    <span onClick={onClick} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all ${active ? 'bg-[#06e0f9]/10 text-[#06e0f9] border-[#06e0f9]/40 shadow-[0_0_15px_rgba(6,224,249,0.1)]' : 'bg-[#1a2e30] text-slate-500 border-white/5 hover:border-white/20'}`}>{label}</span>
);

export default UserManagement;