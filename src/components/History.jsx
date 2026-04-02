import React, { useState, useEffect } from 'react';
import {
  MapPin, Car, Download, Search, Calendar, Filter,
  RefreshCw, Timer, Store, ChevronLeft, ChevronRight, FileText, Eye,
  Plus, RotateCcw, MoreVertical
} from 'lucide-react';
import Navbar from './Navbar';
import NotificationBox from './NotificationBox';

const ParkingHistory = () => {
  const [activeTab, setActiveTab] = useState('Bookings');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Get logged in user from localStorage - same pattern as UserDashboard.js
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const userProfile = localStorage.getItem('userProfile');
    const saved = localStorage.getItem('loggedInUser');
    return userProfile ? JSON.parse(userProfile) : saved ? JSON.parse(saved) : null;
  });

  // Fetch fresh user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) return;
        
        const parkingApi = (await import('../api/parkingApi.js')).default;
        const meResponse = await parkingApi.me();
        const user = meResponse?.user || meResponse;
        
        if (user) {
          const userData = {
            id: user.id,
            email: user.email,
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            name: user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email?.split('@')[0],
            phone: user.phone || '',
            plan: user.plan || 'basic',
            role: 'user'
          };
          setLoggedInUser(userData);
          localStorage.setItem('userProfile', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('History: Failed to fetch user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  // Get username for display
  const userName = loggedInUser?.name || 
    `${loggedInUser?.firstname || ''} ${loggedInUser?.lastname || ''}`.trim() ||
    (loggedInUser?.email ? loggedInUser.email.split('@')[0] : null) ||
    "Guest";

  // Get user's membership plan
  const userPlan = loggedInUser?.plan || "basic";

  // Get plan display info
  const getPlanInfo = (plan) => {
    const plans = {
      basic: { name: "Free Plan", color: "text-slate-400" },
      pro: { name: "Pro Member", color: "text-cyan-400" },
      max: { name: "Max Member", color: "text-purple-400" }
    };
    return plans[plan] || plans.basic;
  };

  const planInfo = getPlanInfo(userPlan);

  // Mock data - replace with API calls
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalSpent: 0,
    activeBookings: 0
  });

  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Load from localStorage + backend fallback
  useEffect(() => {
    const loadHistoryData = () => {
      setLoading(true);
      try {
        // First try localStorage (primary for now)
        const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
        const bookings = history.map(entry => ({
          id: entry.id,
          location: entry.title,
          sub: `Zone ${entry.zone} • Spot ${entry.spotNumber}`,
          date: new Date(entry.createdAt).toLocaleDateString(),
          time: new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          vehicle: 'Default Vehicle', // Link to vehicles later
          duration: `${entry.duration}h`,
          cost: entry.amount,
          status: entry.status || (entry.completedAt ? 'Completed' : 'Upcoming'),
          icon: 'map'
        }));
        
        setBookings(bookings);
        setStats({
          totalSessions: bookings.length,
          totalSpent: bookings.reduce((sum, b) => sum + b.cost, 0),
          activeBookings: bookings.filter(b => b.status === 'Upcoming' || b.status === 'Active').length
        });
        setTransactions([]); // Wallet tx later
      } catch (error) {
        console.error("Error loading history:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistoryData();
  }, []);

  // Filter data based on search
  const filteredBookings = bookings.filter(booking =>
    booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx =>
    tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 transition-all duration-300 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
            <NotificationBox />
            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-white leading-none mb-1">{userName}</p>
                <p className={`text-xs font-bold leading-none ${planInfo.color}`}>{planInfo.name}</p>
              </div>
              <img src={loggedInUser?.avatar || "https://i.pravatar.cc/150?u=alex"} className="size-10 rounded-xl border border-white/10 shadow-lg" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Title & Styled Export Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase">Activity History</h2>
            <p className="text-slate-500 text-sm font-medium">Review your past parking sessions and <span className="text-cyan-400">wallet transactions</span>.</p>
          </div>

          <button
            onClick={() => {
              // Export functionality - replace with actual export
              const csvContent = activeTab === 'Bookings'
                ? convertToCSV(filteredBookings)
                : convertToCSV(filteredTransactions);
              downloadCSV(csvContent, `parking_${activeTab.toLowerCase()}_${Date.now()}.csv`);
            }}
            className="w-full md:w-auto border-2 border-cyan-400/50 text-cyan-400 px-8 py-3.5 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 group"
          >
            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="uppercase text-xs tracking-[0.2em]">Export CSV</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <StatCard
                label="Total Sessions"
                value={stats.totalSessions.toString()}
                trend={stats.totalSessions > 0 ? "+2%" : null}
              />
              <StatCard
                label="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                trend={stats.totalSpent > 0 ? "+15%" : null}
              />
              <StatCard
                label="Active Bookings"
                value={stats.activeBookings.toString().padStart(2, '0')}
                specialTag={stats.activeBookings > 0 ? "Live Now" : null}
              />
            </div>

            <div className="bg-[#121e1e] rounded-[2.5rem] p-2 border border-white/5 shadow-2xl relative overflow-hidden">
              {/* Tabs */}
              <div className="flex gap-4 p-6 overflow-x-auto border-b border-white/5">
                {['Bookings', 'Wallet Transactions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-500 hover:text-white'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row gap-4 p-6 items-center justify-between">
                <div className="flex gap-3 w-full lg:w-auto">
                  <FilterButton icon={<Calendar size={16} />} label="Last 30 Days" />
                  <FilterButton icon={<Filter size={16} />} label="Status" />
                </div>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-cyan-400 transition-all">
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="overflow-x-auto px-2 pb-6">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {activeTab === 'Bookings' ? (
                        <>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Vehicle</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4 text-right">Cost</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Transaction Type</th>
                          <th className="px-6 py-4">Transaction ID</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </>
                      )}
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {activeTab === 'Bookings' ? (
                      filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <TableRow
                            key={booking.id}
                            isActive={booking.status === 'Active'}
                            location={booking.location}
                            sub={booking.sub}
                            date={booking.date}
                            time={booking.time}
                            vehicle={booking.vehicle}
                            duration={booking.duration}
                            cost={`₹${booking.cost}`}
                            status={booking.status}
                            icon={booking.icon === 'map' ? <MapPin size={20} /> : <Store size={20} />}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                            No bookings found
                          </td>
                        </tr>
                      )
                    ) : (
                      filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                          <TransactionRow
                            key={tx.id}
                            date={tx.date}
                            time={tx.time}
                            type={tx.type}
                            id={tx.id}
                            amount={tx.isCredit ? `+ ₹${tx.amount}` : tx.amount === 0 ? '₹0' : `- ₹${tx.amount}`}
                            status={tx.status}
                            icon={tx.isCredit ? <Plus size={14} /> : tx.status === 'Failed' ? <RotateCcw size={14} /> : <Plus size={14} className="rotate-45" />}
                            iconBg={tx.isCredit ? 'bg-cyan-500/10 text-cyan-400' : tx.status === 'Failed' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-500'}
                            openDropdown={openDropdown}
                            setOpenDropdown={setOpenDropdown}
                            transactionData={tx}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                            No transactions found
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-8 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Showing <span className="text-white">1-{activeTab === 'Bookings' ? filteredBookings.length : filteredTransactions.length}</span> of {activeTab === 'Bookings' ? stats.totalSessions : transactions.length}
                </p>
                <div className="flex gap-2">
                  <PaginationBtn icon={<ChevronLeft size={16} />} disabled />
                  <PaginationBtn label="1" active />
                  <PaginationBtn label="2" />
                  <PaginationBtn icon={<ChevronRight size={16} />} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// CSV Export helper functions
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(header => obj[header]).join(','));
  return [headers.join(','), ...rows].join('\n');
};

const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// NEW: Component for Wallet Transactions (from image_607a04.png)
const TransactionRow = ({ date, time, type, id, amount, status, icon, iconBg, openDropdown, setOpenDropdown, setSelectedTransaction, transactionData }) => {
  const statusStyles = {
    Completed: 'bg-green-500/10 text-green-400 border-green-500/20 dot-green-400',
    Failed: 'bg-red-500/10 text-red-400 border-red-500/20 dot-red-400',
    Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dot-yellow-500'
  };

  const handleDropdownToggle = () => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleAction = (action) => {
    if (action === 'View Details') {
      setSelectedTransaction(transactionData);
    } else {
      console.log(`${action} for transaction ${id}`);
    }
    setOpenDropdown(null);
  };

  return (
    <tr className="group hover:bg-white/5 transition-all relative">
      <td className="px-6 py-5 rounded-l-2xl">
        <p className="text-white font-bold">{date}</p>
        <p className="text-[10px] text-slate-500 font-medium">{time}</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${iconBg}`}>
            {icon}
          </div>
          <span className="text-white font-medium">{type}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-slate-500 font-mono text-xs">
        {id}
      </td>
      <td className="px-6 py-5 text-center">
        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${statusStyles[status] || ''}`}>
          <div className={`size-1.5 rounded-full ${status === 'Completed' ? 'bg-green-400' : status === 'Failed' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
          {status}
        </div>
      </td>
      <td className={`px-6 py-5 text-right font-black ${amount.includes('+') ? 'text-cyan-400' : 'text-white'}`}>
        {amount}
      </td>
      <td className="px-6 py-5 rounded-r-2xl text-right relative">
        <button
          onClick={handleDropdownToggle}
          className="p-2 text-slate-600 hover:text-white transition-colors"
        >
          <MoreVertical size={18} />
        </button>
        {openDropdown === id && (
          <div className="absolute right-0 top-full mt-2 bg-[#162a2d] border border-white/10 rounded-xl shadow-xl z-10 min-w-[160px]">
            <button
              onClick={() => handleAction('View Details')}
              className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors rounded-t-xl"
            >
              View Details
            </button>
            <button
              onClick={() => handleAction('Download Receipt')}
              className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Download Receipt
            </button>
            <button
              onClick={() => handleAction('Report Issue')}
              className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors rounded-b-xl"
            >
              Report Issue
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

const StatCard = ({ label, value, trend, specialTag }) => (
  <div className="bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl transition-all group-hover:bg-cyan-500/10"></div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
      {trend && (
        <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
          {trend}
        </span>
      )}
      {specialTag && (
        <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 animate-pulse">
          {specialTag}
        </span>
      )}
    </div>
  </div>
);

const FilterButton = ({ icon, label }) => (
  <button className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#162a2d]/40 border border-white/5 text-slate-400 text-xs font-bold hover:text-white hover:border-white/10 transition-all whitespace-nowrap">
    {icon}
    <span className="uppercase tracking-widest">{label}</span>
  </button>
);

const TableRow = ({ location, sub, date, time, vehicle, duration, cost, status, icon, isActive }) => (
  <tr className={`group transition-all ${isActive ? 'bg-cyan-500/5' : 'hover:bg-white/5'}`}>
    <td className="px-6 py-5 rounded-l-2xl">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-500'}`}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-white">{location}</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{sub}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-5">
      <p className="text-white font-medium">{date}</p>
      <p className="text-[10px] text-slate-500">{time}</p>
    </td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-2 text-slate-300">
        <Car size={14} className="text-cyan-400" />
        <span className="text-xs font-bold">{vehicle}</span>
      </div>
    </td>
    <td className="px-6 py-5">
      <div className={`flex items-center gap-2 font-mono text-xs ${isActive ? 'text-cyan-400 font-bold' : ''}`}>
        {isActive && <Timer size={14} className="animate-pulse" />} {duration}
      </div>
    </td>
    <td className="px-6 py-5 text-right font-black text-white">{cost}</td>
    <td className="px-6 py-5 text-center">
      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${status === 'Active'
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : 'bg-slate-800/50 text-slate-500 border-white/5'
        }`}>
        {status}
      </span>
    </td>
    <td className="px-6 py-5 rounded-r-2xl text-right">
      <button className="p-2 text-slate-600 hover:text-cyan-400 transition-colors">
        {status === 'Active' ? <Eye size={18} /> : <FileText size={18} />}
      </button>
    </td>
  </tr>
);

const PaginationBtn = ({ label, icon, active, disabled }) => (
  <button
    disabled={disabled}
    className={`flex items-center justify-center size-10 rounded-xl border transition-all text-xs font-black ${active
      ? 'bg-cyan-500 text-black border-cyan-500'
      : 'border-white/5 text-slate-500 hover:border-white/20 hover:text-white'
      } ${disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-90'}`}
  >
    {label || icon}
  </button>
);

export default ParkingHistory;