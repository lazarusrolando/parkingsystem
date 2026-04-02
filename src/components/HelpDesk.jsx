import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, X, Send, CheckCircle } from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader'
import parkingApi, { getSlots, getAvailableSlots, getMe, getAdmins, getAdminContacts } from '../api/parkingApi';

const PriorityBadge = ({ level }) => {
    const styles = {
        High: 'bg-red-500/20 text-red-400 border-red-500/30',
        Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[level] || styles.Low}`}>
            {level}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Open': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Resolved': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap min-w-[90px] ${styles[status] || styles['Open']}`}>
            {status}
        </span>
    );
};

const CategoryBadge = ({ category }) => {
    const styles = {
        'Technical': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Billing': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        'General': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        'Complaint': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Feedback': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${styles[category] || styles['General']}`}>
            {category}
        </span>
    );
};

const HelpDesk = () => {
    // --- State Management ---
    const [tickets, setTickets] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState('All Tickets');
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState({ fullName: 'Admin' });
    const [replyText, setReplyText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

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

    // --- Data Fetching ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let supportData = [];
                let contactData = [];

                try {
                    const response = await parkingApi.getSupportTickets();
                    supportData = response?.tickets || [];
                } catch (e) {
                    console.warn('Support tickets fetch failed:', e);
                }

                try {
                    const response = await getAdminContacts();
                    contactData = response?.contacts || [];
                } catch (e) {
                    console.warn('Contacts fetch failed:', e);
                }

                // Map support tickets
                const mappedTickets = supportData.map(t => ({
                    id: t.ticket_id || `SPS-${t.id}`,
                    dbId: t.id,
                    user: t.firstname || t.lastname || t.email || `User ${t.user_id}`,
                    userId: t.user_id,
                    subject: t.subject,
                    category: t.category,
                    priority: t.priority || 'Low',
                    status: t.status || 'Open',
                    message: t.description,
                    adminReply: t.admin_reply,
                    date: t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    createdAt: t.created_at,
                    updatedAt: t.updated_at,
                    type: 'support'
                }));

                // Map contacts
                const mappedContacts = contactData.map(c => ({
                    id: c.ticket_id || `CONTACT-${c.id}`,
                    dbId: c.id,
                    user: c.name,
                    userId: null,
                    subject: c.subject,
                    category: 'Contact',
                    priority: 'Low',
                    status: c.status || 'new',
                    message: c.message,
                    adminReply: null,
                    date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    createdAt: c.created_at,
                    updatedAt: c.updated_at,
                    type: 'contact'
                }));

                setTickets(mappedTickets);
                setContacts(mappedContacts);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Failed to load tickets. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // --- Action Handlers ---
    const handleResolveTicket = async (ticket) => {
        try {
            setIsUpdating(true);

            // Call API to update ticket status
            await parkingApi.updateSupportTicket(ticket.id, 'Resolved');

            // Update local state
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Resolved' } : t));
            if (selectedTicket?.id === ticket.id) {
                setSelectedTicket(prev => ({ ...prev, status: 'Resolved' }));
            }
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update ticket status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendReply = async (ticket) => {
        if (!replyText.trim()) return;

        try {
            setIsUpdating(true);

            // Call API to send reply
            await parkingApi.updateSupportTicket(ticket.id, ticket.status, replyText);

            // Update local state
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, adminReply: replyText } : t));
            if (selectedTicket?.id === ticket.id) {
                setSelectedTicket(prev => ({ ...prev, adminReply: replyText }));
            }

            setReplyText('');
        } catch (err) {
            console.error("Reply failed:", err);
            alert("Failed to send reply. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusChange = async (ticket, newStatus) => {
        try {
            setIsUpdating(true);

            await parkingApi.updateSupportTicket(ticket.id, newStatus);

            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
            if (selectedTicket?.id === ticket.id) {
                setSelectedTicket(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error("Status update failed:", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Filtering Logic ---
const filteredTickets = useMemo(() => {
     const data = activeTab === 'Contacts' ? contacts : tickets;
     return data.filter(ticket => {
          const matchesTab = activeTab === 'All Tickets' || ticket.status === activeTab;
          const matchesSearch =
               !searchQuery ||
               ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
               ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
               ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesTab && matchesSearch;
     });
 }, [activeTab, tickets, contacts, searchQuery]);

    // Display data for current tab
    const displayData = useMemo(() => {
     if (activeTab === 'Contacts') {
          return contacts.map(c => ({
               ...c,
               priority: 'Low',
               category: 'Contact'
          }));
     }
     return tickets;
    }, [activeTab, tickets, contacts]);

    // Stats for summary
    const ticketStats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
    }), [tickets]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#0f2123] font-display text-slate-100">
            <Navbar1 />

            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1414] to-[#080d0d] p-6">
                {/* Search & Profile Header */}
                <AdminHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    profile={profile}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Ticket List Column */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar pr-2">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Help Desk</h1>
                            <p className="text-slate-400">Manage and resolve user inquiries</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex items-center border-b border-[#21464a] mb-6 gap-6 flex-shrink-0">
                            {['All Tickets', 'Open', 'In Progress', 'Resolved', 'Contacts'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setSearchQuery(''); // Clear search on tab change
                                    }}
                                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-[#06e0f9]' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#06e0f9]" />}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search tickets by ID, user or subject..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-[#183235]/50 border border-[#21464a] rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9]/20 transition-all text-slate-100"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 -m-1 rounded-full transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                                {filteredTickets.length} tickets
                            </span>
                        </div>

                        {/* Table Content */}
                        <div className="bg-[#183235]/30 rounded-xl border border-[#21464a] overflow-hidden">
                            {isLoading ? (
                                <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin mb-4" size={32} />
                                    <p className="text-sm font-medium">Fetching tickets from server...</p>
                                </div>
                            ) : error ? (
                                <div className="p-20 text-center text-red-400 font-medium">{error}</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#183235]/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <tr>
                                            <th className="px-6 py-4">Ticket ID</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Priority</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#21464a]">
                                        {filteredTickets.length > 0 ? (
                                            filteredTickets.map((ticket) => (
                                                <tr
                                                    key={ticket.id}
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className={`hover:bg-[#06e0f9]/5 cursor-pointer transition-colors group ${selectedTicket?.id === ticket.id ? 'bg-[#06e0f9]/10' : ''}`}
                                                >
                                                <td className={`px-6 py-4 text-sm font-bold ${selectedTicket?.id === ticket.id ? 'text-[#06e0f9]' : 'text-slate-400 group-hover:text-[#06e0f9]'}`}>
                                                        {ticket.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{ticket.user}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-300 truncate max-w-[200px]">{ticket.subject}</td>
                                                    <td className="px-6 py-4"><CategoryBadge category={ticket.category} /></td>
                                                    <td className="px-6 py-4"><PriorityBadge level={ticket.priority} /></td>
                                                    <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                                                    <td className="px-6 py-4 text-sm text-slate-500 text-right">{ticket.date}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="p-20 text-center text-slate-500">No tickets found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Preview Pane */}
                    {selectedTicket && (
                        <aside className="w-[450px] ml-6 flex-shrink-0 border border-[#21464a] rounded-2xl bg-[#183235]/40 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-6 border-b border-[#21464a]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-[#06e0f9] tracking-widest uppercase">Ticket Preview</span>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-white">{selectedTicket.subject}</h3>
                                <div className="mt-2"><StatusBadge status={selectedTicket.status} /></div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="bg-[#183235] rounded-xl p-4 border border-[#21464a]">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Message from {selectedTicket.user}:</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{selectedTicket.message}</p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#21464a] space-y-4">
                                <button
                                    onClick={() => handleResolveTicket(selectedTicket.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-[#183235] hover:bg-[#21464a] text-xs font-bold py-3 rounded-xl border border-[#21464a] transition-colors"
                                >
                                    <CheckCircle size={16} className={selectedTicket.status === 'Resolved' ? 'text-emerald-400' : 'text-slate-400'} />
                                    {selectedTicket.status === 'Resolved' ? 'Resolved' : 'Mark as Resolved'}
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 bg-[#06e0f9] hover:bg-[#06e0f9]/90 text-[#0f2123] py-3 rounded-xl text-sm font-bold transition-all">
                                    <Send size={16} />
                                    Send Reply
                                </button>
                            </div>
                        </aside>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HelpDesk;