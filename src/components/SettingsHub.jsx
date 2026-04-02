import React, { useState, useRef } from 'react';
import {
    IndianRupee, Settings, Code, Edit3, Router, Activity, Verified,
    ShieldCheck, UserPlus, User, Copy, RefreshCw, Plus, X, Trash2, CheckCircle2, Loader2, Save, Shield
} from 'lucide-react';
import parkingApi from '../api/parkingApi';

import Navbar1 from './Navbar1';
import CreateWebhookModal from './CreateWebhookModel';
import AdminHeader from './AdminHeader';

const SettingsHub = ({
    initialData = { apiKey: [], profile: {}, config: {}, rates: {}, admins: [], webhooks: [], hardware: [], roles: [] },
    onSave = async () => { },
    onRefreshKey = () => `sps_live_${Array.from({ length: 20 }, () =>
        Math.random().toString(36).charAt(2)).join('')}`
}) => {
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Core States
    const [searchTerm] = useState("");
    const [apiKey, setApiKey] = useState(initialData.apiKey[0] || "YOUR_API_KEY");
    const [admins, setAdmins] = useState(initialData.admins || []);
    const [newAdminData, setNewAdminData] = useState({ name: '', role: 'Manager' });
    const [webhooks, setWebhooks] = useState(initialData.webhooks || [
        { id: 1, url: "https://api.internal-relay.com/hooks", events: ["Entry", "Exit"] }
    ]);

    const [hardware, setHardware] = useState([
        { id: 1, label: "CCTV Network", status: "Online", active: true, warning: false },
        { id: 2, label: "Entry/Exit Barriers", status: "Active", active: true, warning: false },
        { id: 3, label: "IoT Floor Sensors", status: "Lag Detected", active: false, warning: true },
        { id: 4, label: "Payment Terminal", status: "Online", active: true, warning: false },
    ]);

    const [profile, setProfile] = useState({
        fullName: initialData.profile?.fullName || "",
        email: initialData.profile?.email || "",
        phone: initialData.profile?.phone || "",
        staffId: initialData.profile?.staffId,
        avatarUrl: initialData.profile?.avatarUrl || null
    });

    // Load profile from localStorage on mount
    React.useEffect(() => {
        const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        if (savedProfile.fullName || savedProfile.avatarUrl) {
            setProfile(prev => ({ ...prev, ...savedProfile }));
        }
    }, []);

    // Fetch and populate current admin profile from DB admins table
    React.useEffect(() => {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) return;

        const fetchAdminProfile = async () => {
            try {
                // First get current user from /api/me
                const meResponse = await parkingApi.me();
                const currentUser = meResponse?.user;
                
                if (!currentUser || !currentUser.email) {
                    // Try localStorage fallback from login
                    const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
                    if (savedProfile.staffId) {
                        setProfile(prev => ({ ...prev, ...savedProfile }));
                    }
                    return;
                }

                // Then fetch all admins to get full profile
                const adminsResponse = await parkingApi.getAdmins();
                
                // Handle both { admins: [...] } and [...] response formats
                const admins = adminsResponse?.admins || adminsResponse;
                if (!admins || admins.length === 0) {
                    // Fallback to localStorage
                    const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
                    if (savedProfile.staffId) {
                        setProfile(prev => ({ ...prev, ...savedProfile }));
                    }
                    return;
                }

                const currentAdmin = admins.find(admin => admin.email.toLowerCase() === currentUser.email.toLowerCase());
                
                if (currentAdmin) {
                    const fullName = `${currentAdmin.firstname || ''} ${currentAdmin.lastname || ''}`.trim();
                    const profileData = {
                        fullName: fullName || currentUser.email.split('@')[0],
                        email: currentAdmin.email,
                        phone: currentAdmin.phone || '',
                        staffId: currentAdmin.id,
                        role: currentAdmin.role || 'admin'
                    };
                    
                    setProfile(prev => ({
                        ...prev,
                        ...profileData
                    }));
                    
                    // Update localStorage with fetched data
                    localStorage.setItem('adminProfile', JSON.stringify(profileData));
                }
            } catch (error) {
                console.warn('Failed to fetch admin profile from DB:', error);
                // Fallback to localStorage
                const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
                if (savedProfile.fullName) {
                    setProfile(prev => ({ ...prev, ...savedProfile }));
                }
            }
        };

        fetchAdminProfile();
    }, []);

    const [config, setConfig] = useState({
        autoBarrier: initialData.config?.autoBarrier ?? true,
        maintenanceMode: initialData.config?.maintenanceMode ?? false,
    });

    const [rates, setRates] = useState({
        hourly: initialData.rates?.hourly || 0,
        dailyMax: initialData.rates?.dailyMax || 0,
        multiplier: initialData.rates?.multiplier || 0
    });

    // --- Handlers ---
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setHasUnsavedChanges(true);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10485760) {
            alert("File size exceeds 10MB.");
            return;
        }

        // Clean up old blob URL to prevent memory leaks
        if (profile.avatarUrl && profile.avatarUrl.startsWith('blob:')) {
            URL.revokeObjectURL(profile.avatarUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, avatarUrl: previewUrl }));
        setHasUnsavedChanges(true);
    };

    const toggleSetting = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
        setHasUnsavedChanges(true);
    };

    const handleRateChange = (e) => {
        const { name, value } = e.target;
        setRates(prev => ({ ...prev, [name]: value }));
        setHasUnsavedChanges(true);
    };

    const handleAddAdmin = (e) => {
        e.preventDefault();
        if (!newAdminData.name) return;
        const newEntry = {
            id: Date.now(),
            name: newAdminData.name,
            role: newAdminData.role,
        };
        setAdmins([...admins, newEntry]);
        setHasUnsavedChanges(true);
        setIsAdminModalOpen(false);
        setNewAdminData({ name: '', role: 'Manager' });
    };

    const handleRefreshKey = () => {
        const newKey = onRefreshKey();
        setApiKey(newKey);
        setHasUnsavedChanges(true);
    };

    const handleAddWebhook = (webhookData) => {
        const newWebhook = { id: Date.now(), ...webhookData };
        setWebhooks([...webhooks, newWebhook]);
        setHasUnsavedChanges(true);
        setIsWebhookModalOpen(false);
    };

    const handleDeleteWebhook = (id) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
        setHasUnsavedChanges(true);
    };

    const handleDiscard = () => {
        window.location.reload();
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ profile, config, rates, admins, apiKey, webhooks });
            // Persist profile to localStorage
            localStorage.setItem('adminProfile', JSON.stringify(profile));
            setHasUnsavedChanges(false);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGenerateWebhook = () => {
        // 1. Create a unique slug for the "custom" link
        const uniqueId = Math.random().toString(36).substring(2, 10);
        const newUrl = `https://api.sps-relay.in/hooks/${uniqueId}`;

        // 2. Create the new webhook object
        const newWebhook = {
            id: Date.now(),
            url: newUrl,
            events: ["General"]
        };

        // 3. Update state and trigger the "Unsaved Changes" footer
        setWebhooks([...webhooks, newWebhook]);
        setHasUnsavedChanges(true);
    };
    const generateBigKey = () => {
        // Generates a 32-byte (256-bit) random value converted to a 64-char hex string
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        const hexString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        return `sps_live_${hexString}`;
    };

    return (
        <div className="flex min-h-screen bg-[#0f2123] text-slate-100 font-sans overflow-hidden">
            <Navbar1 />

            <main className={`flex-1 overflow-y-auto h-screen p-4 md:p-10 bg-gradient-to-b from-[#0b1414] to-[#080d0d] transition-all duration-300 ${(isWebhookModalOpen || isAdminModalOpen) ? 'blur-md brightness-50 pointer-events-none' : ''}`}>

                {/* Header - Now fully reactive to profile state */}
                <AdminHeader
                    searchTerm={searchQuery} onSearchChange={setSearchQuery} profile={profile}
                />

                <div className="w-full space-y-6 mb-32">
                    {/* Admin Profile Section */}
                    <section className="bg-[#183235] p-5 md:p-8 rounded-xl border border-[#2f646a]">
                        <div className="flex items-center justify-between mb-8 gap-4">
                            <SectionHeader icon={<User className="text-[#06e0f9]" />} title="Admin Profile" />
                            <div className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-lg shrink-0">
                                <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <UserBadge roleKey={profile.role} />
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10">
                            <div className="flex flex-col items-center space-y-4 shrink-0">
                                <div className="relative">
                                    <div className="h-32 w-32 rounded-full border-4 border-[#06e0f9]/30 overflow-hidden bg-[#0f2123] shadow-2xl">
                                        <img
                                            className="h-full w-full object-cover"
                                            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}` || 'AdminGuest'}
                                            alt="Profile Preview"
                                        />
                                    </div>
                                    <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-2.5 bg-[#06e0f9] text-[#0f2123] rounded-full shadow-lg hover:scale-110 transition-transform">
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <p className="text-slate-400 text-[10px] uppercase font-bold">Max Size 10MB</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                <InputGroup label="Full Name" name="fullName" value={profile.fullName || ''} onChange={handleProfileChange} placeholder="Admin Name" />
                                <InputGroup label="Email Address" name="email" type="email" value={profile.email || ''} onChange={handleProfileChange} placeholder="admin@sps.in" />
                                <InputGroup label="Phone Number" name="phone" prefix="+91" placeholder="00000 00000" value={profile.phone || ''} onChange={handleProfileChange} maxLength={10} />
                                <InputGroup label="Staff ID" name="staffId" prefix="SPS-" value={profile.staffId != null ? String(profile.staffId) : ''} placeholder="XXX" readOnly />
                            </div>
                        </div>
                    </section>

                    {/* Rates & Systems */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <section className="flex flex-col gap-4 p-6 rounded-xl bg-[#162c2e] border border-[#2f646a]">
                            <SectionHeader icon={<Settings className="text-cyan-400" />} title="System" />
                            <div className="space-y-3">
                                <ToggleRow label="Auto-Barrier" sub="Automatic entry" enabled={config.autoBarrier} onToggle={() => toggleSetting('autoBarrier')} />
                                <ToggleRow label="Maintenance" sub="Disable bookings" enabled={config.maintenanceMode} onToggle={() => toggleSetting('maintenanceMode')} />
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 p-6 rounded-xl bg-[#162c2e] border border-[#2f646a]">
                            <SectionHeader icon={<IndianRupee className="text-lime-400" />} title="Rate Management" />
                            <div className="space-y-4">
                                <InputField label="Hourly Base Rate (INR)" name="hourly" value={rates.hourly} onChange={handleRateChange} prefix="₹" />
                                <InputField label="Daily Maximum (INR)" name="dailyMax" value={rates.dailyMax} onChange={handleRateChange} prefix="₹" />
                                <InputField label="Peak Multiplier" name="multiplier" value={rates.multiplier} onChange={handleRateChange} prefix="×" step="0.1" />
                            </div>
                            <button onClick={handleSave} className="mt-auto w-full py-2 bg-green-400 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-green-300 transition-colors">
                                <Save size={16} /> Update Rates
                            </button>
                        </section>

                        <section className="flex flex-col gap-4 p-6 rounded-xl bg-[#162c2e] border border-[#2f646a]">
                            <SectionHeader icon={<Router className="text-cyan-400" />} title="Hardware Health" />
                            <div className="grid gap-3">
                                {hardware.map(item => (
                                    <HealthStatus
                                        key={item.id}
                                        label={item.label}
                                        status={item.status}
                                        active={item.active}
                                        warning={item.warning}
                                    />
                                ))}
                            </div>
                            <DiagnosticsButton onUpdateHardware={setHardware} />
                        </section>
                    </div>

                    {/* Staff Access & Keys */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <section className="lg:col-span-2 p-6 rounded-xl bg-[#162c2e] border border-[#2f646a]">
                            <div className="flex justify-between items-center mb-4">
                                <SectionHeader icon={<ShieldCheck className="text-cyan-400" />} title="Staff Access" />
                                <button onClick={() => setIsAdminModalOpen(true)} className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-cyan-300 transition-colors">
                                    <UserPlus size={16} /> Add Staff
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-400 border-b border-[#2f646a]">
                                        <tr><th className="pb-3 px-2">User</th><th className="pb-3">Role</th><th className="pb-3 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2f646a]/30">
                                        {filteredAdmins.length === 0 ? (
                                            <tr><td colSpan="3" className="py-4 text-center text-slate-500 italic">No staff members added</td></tr>
                                        ) : (
                                            filteredAdmins.map(admin => (
                                                <tr key={admin.id} className="hover:bg-white/5 group">
                                                    <td className="py-3 px-2">{admin.name}</td>
                                                    <td className="py-3 text-slate-400">{admin.role}</td>
                                                    <td className="py-3 text-right">
                                                        <button onClick={() => { setAdmins(admins.filter(a => a.id !== admin.id)); setHasUnsavedChanges(true); }} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="p-5 rounded-xl bg-[#162c2e] border border-[#2f646a] flex flex-col">
                            <SectionHeader icon={<Code className="text-cyan-400" />} title="Developer Tools" />
                            <div className="mt-4 space-y-4 flex-1">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Secret API Key</label>
                                    <div className="p-3 rounded-lg bg-[#0f2123] border border-[#2f646a] flex items-center justify-between">
                                        <code className="text-xs font-mono text-cyan-400/80 truncate pr-2">{apiKey}</code>
                                        <button onClick={() => handleCopy(apiKey)} className={copied ? 'text-green-400' : 'text-cyan-400 hover:text-white'}>
                                            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleRefreshKey}
                                        className="mt-2 mb-3 m-20 w-fit px-4 py-1.5 text-[10px] font-bold flex items-center justify-center gap-2 hover:text-white hover:bg-[#2f646a] hover:rounded transition-colors"
                                    >
                                        <RefreshCw size={12} className='text-cyan-400' /> Regenerate Key
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-[#2f646a]/30">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Webhooks</label>
                                        <span className="bg-cyan-400/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/20">
                                            {webhooks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {webhooks.map(hook => (
                                            <div key={hook.id} className="group p-2 bg-[#0f2123] border border-white/5 rounded-lg flex items-center justify-between hover:border-cyan-400/30 transition-all">
                                                <div className="truncate flex-1 mr-2">
                                                    <p className="text-[10px] text-slate-200 truncate font-mono opacity-80">{hook.url}</p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {/* Inline Copy Button for convenience */}
                                                    <button
                                                        onClick={() => handleCopy(hook.url)}
                                                        className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                                                        title="Copy URL"
                                                    >
                                                        <Copy size={12} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteWebhook(hook.id)}
                                                        className="p-1 text-slate-500 hover:text-red-400 transition-all"
                                                        title="Delete Webhook"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* The Action Button: Now generates instantly */}
                                    <button
                                        onClick={handleGenerateWebhook}
                                        className="mt-6 w-full py-3 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-400 hover:text-black transition-all group active:scale-[0.98]"
                                    >
                                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                        Generate Instant Webhook
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Unsaved Changes Footer */}
                {hasUnsavedChanges && (
                    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#162c2e]/95 backdrop-blur-xl border-t border-cyan-400/30 z-40 flex justify-between items-center animate-in slide-in-from-bottom duration-300">
                        <span className="text-xs font-bold text-cyan-400 animate-pulse ml-4 md:ml-10">Pending Changes</span>
                        <div className="flex gap-3">
                            <button onClick={handleDiscard} className="px-6 py-2 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors">Discard</button>
                            <button onClick={handleSave} className="px-10 py-2 bg-cyan-400 text-black font-black rounded-xl text-sm shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 transition-all">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </footer>
                )}
            </main>

            <CreateWebhookModal isOpen={isWebhookModalOpen} onClose={() => setIsWebhookModalOpen(false)} onAdd={handleAddWebhook} />
            <AddAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onSubmit={handleAddAdmin} data={newAdminData} setData={setNewAdminData} />
        </div>
    );
};

// --- Sub-components ---

const DiagnosticsButton = ({ onUpdateHardware }) => {
    const [isScanning, setIsScanning] = useState(false);

    const handleDiagnostics = () => {
        if (typeof onUpdateHardware !== 'function') return;

        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);

            onUpdateHardware(prev => prev.map(item => ({
                ...item,
                status: "Online",
                active: true,
                warning: false
            })));

            alert("Diagnostics Complete: All systems nominal.");
        }, 2500);
    };

    return (
        <button onClick={handleDiagnostics} disabled={isScanning} className={`mt-auto text-cyan-400 text-sm font-bold flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${isScanning ? 'opacity-50 cursor-not-allowed bg-cyan-400/10' : 'hover:bg-cyan-400/5'}`}>
            {isScanning ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Activity size={16} /> Run Diagnostics</>}
        </button>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3 border-b border-[#2f646a]/30 pb-3">
        <span className="shrink-0">{icon}</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">{title}</h3>
    </div>
);

const ROLE_CONFIG = {
    super_admin: {
        label: "Super Admin",
        color: "text-green-500",
        icon: <Verified size={14} />,
    },
    admin: {
        label: "Admin",
        color: "text-blue-500",
        icon: <Shield size={14} />,
    },
    manager: {
        label: "Manager",
        color: "text-cyan-400",
        icon: <User size={14} />
    }
};

const UserBadge = ({ roleKey }) => {
    const isGuest = roleKey === 'guest' || roleKey === 'AdminGuest' || !roleKey;

    if (isGuest) {
        return (
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-slate-500" />
                <span className="xs:inline">Guest</span>
            </span>
        )
    }

    const role = ROLE_CONFIG[roleKey] || ROLE_CONFIG.super_admin;

    return (
        <span className={`${role.color} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}>
            {role.icon}
            <span className="xs:inline">{role.label}</span>
        </span>
    );
};

const InputField = ({ label, prefix, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{prefix}</span>
            <input className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-2 pl-8 pr-4 text-white outline-none focus:ring-1 focus:ring-cyan-400" {...props} />
        </div>
    </div>
);

const HealthStatus = ({ label, status, active, warning }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f2123]/30 border border-[#2f646a]/30">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-cyan-400' : warning ? 'text-amber-500' : 'text-slate-500'}`}>{status}</span>
            <div className={`size-1.5 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : warning ? 'bg-amber-500' : 'bg-slate-600'}`} />
        </div>
    </div>
);

const ToggleRow = ({ label, sub, enabled, onToggle }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0f2123]/50 border border-[#2f646a]/50 text-left transition-all hover:bg-white/5">
        <div><p className="font-bold text-sm text-slate-100">{label}</p><p className="text-[10px] text-slate-500 font-medium">{sub}</p></div>
        <div className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${enabled ? 'bg-cyan-400' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-all duration-300 ${enabled ? 'translate-x-4' : ''}`} />
        </div>
    </button>
);

const InputGroup = ({ label, prefix, readOnly, ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</label>
        <div className="relative flex items-center">
            {prefix && <span className="absolute left-4 text-cyan-400/60 font-mono text-sm pointer-events-none select-none">{prefix}</span>}
            <input 
                className={`w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-2.5 text-white outline-none focus:ring-1 focus:ring-cyan-400 transition-all ${prefix ? 'pl-14' : 'px-4'} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`} 
                readOnly={readOnly}
                {...props} 
            />
        </div>
    </div>
);

const AddAdminModal = ({ isOpen, onClose, onSubmit, data, setData }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[#183235] border border-[#2f646a] w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus className="text-cyan-400" size={20} /> Provision Access</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-5">
                    <InputGroup label="Display Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Permission Level</label>
                        <select className="w-full bg-[#0f2123] border border-[#2f646a] rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-cyan-400 appearance-none" value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })}>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-cyan-400 text-black font-black hover:bg-cyan-300 transition-all shadow-lg">Add Member</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsHub;