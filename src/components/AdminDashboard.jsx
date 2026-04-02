import React, { useState, useEffect } from 'react';
import { Car, Users, Wallet, BarChart3, ChevronDown, FileText } from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader';
import { getMe } from '../api/parkingApi.js';
import parkingApi from '../api/parkingApi';
import { jsPDF } from "jspdf";
import sps from '../sps.png';

const INITIAL_STATS = {
  revenue: { value: 0, trend: '0%', isNegative: false },
  activeBookings: { value: 0, trend: 'Stable', isNegative: false },
  occupancy: { value: 0, trend: '0%', isNegative: true },
  newRegistrations: { value: 0, trend: '0%', isNegative: false }
};

const INITIAL_CAPACITY = {
  totalSlots: 0,
  occupiedPercent: 0,
  available: 0
};

const INITIAL_REVENUE_DATA = [];

const INITIAL_BOOKINGS = [];

const StatCard = ({ title, value, icon: Icon, trend, isNegative = false }) => (
  <div className="bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl hover:border-cyan-500/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-0"></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
        <Icon size={24} />
      </div>
      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${isNegative
        ? 'text-red-400 bg-red-500/10 border-red-500/20'
        : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
        }`}>
        {trend}
      </span>
    </div>
    <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
  </div>
);

export default function AdminDashboard({ initialData = { profile: {} },
}) {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [capacity, setCapacity] = useState(INITIAL_CAPACITY);
  const [revenueChartData, setRevenueChartData] = useState(INITIAL_REVENUE_DATA);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [timePeriod, setTimePeriod] = useState('7days');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    staffId: null,
    avatarUrl: null,
    role: 'admin'
  });

  // Time period options
  const timePeriods = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '4weeks', label: 'Last 4 Weeks' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 1 Year' }
  ];

  const loadStats = React.useCallback(async () => {
    try {
      // Load profile from localStorage first
      const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');

      // Check for auth token and fetch from backend
      const token = localStorage.getItem('parkingAuthToken');
      let mergedProfile = {
        fullName: savedProfile.fullName,
        avatarUrl: savedProfile.avatarUrl || null
      };

      if (token) {
        try {
          // Get current user session
          const backendData = await getMe();
          const userData = backendData?.user || backendData;
          
          // Fetch all admins to get full profile from database
          const adminsResponse = await parkingApi.getAdmins();
          const admins = adminsResponse?.admins || adminsResponse;
          
          if (admins && admins.length > 0 && userData?.email) {
            const currentAdmin = admins.find(admin => admin.email.toLowerCase() === userData.email.toLowerCase());
            if (currentAdmin) {
              const backendFullName = `${currentAdmin.firstname || ''} ${currentAdmin.lastname || ''}`.trim();
              mergedProfile = {
                fullName: backendFullName || currentAdmin.name || userData.email.split('@')[0],
                email: currentAdmin.email,
                phone: currentAdmin.phone || '',
                staffId: currentAdmin.id,
                avatarUrl: mergedProfile.avatarUrl,
                role: 'admin'
              };
              // Save merged profile back to localStorage
              localStorage.setItem('adminProfile', JSON.stringify(mergedProfile));
            }
          }
        } catch (fetchErr) {
          console.warn('Failed to fetch admin profile from backend:', fetchErr);
        }
      }

      setProfile(mergedProfile);
    } catch (err) {
      console.error('Profile load error:', err);
      const savedProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
      setProfile({
        fullName: savedProfile.fullName || 'Admin',
        avatarUrl: savedProfile.avatarUrl || null
      });
    }

    // Load booking history for revenue and stats
    const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || 'null');
    const userVehicles = JSON.parse(localStorage.getItem('userVehicles') || '[]');

    // Calculate total revenue from completed bookings
    const totalRevenue = bookingHistory.reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);

    // Calculate active bookings - count current booking and non-expired bookings from history
    const now = new Date().getTime();
    const activeFromHistory = bookingHistory.filter(booking => {
      if (!booking.expiresAt) return false;
      return new Date(booking.expiresAt).getTime() > now;
    }).length;

    const activeBookingsCount = currentBooking ? 1 + activeFromHistory : activeFromHistory;

    // Calculate new registrations (number of vehicles added)
    const newRegistrationsCount = userVehicles.length;

    const totalSlots = 100; // Default total slots
    const occupiedSlots = activeBookingsCount;
    const occupancyPercent = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // Update stats with real data
    setStats({
      revenue: {
        value: totalRevenue,
        trend: totalRevenue > 0 ? '+12%' : '0%',
        isNegative: false
      },
      activeBookings: {
        value: activeBookingsCount,
        trend: activeBookingsCount > 0 ? 'Active' : 'Stable',
        isNegative: false
      },
      occupancy: {
        value: occupancyPercent,
        trend: `${occupancyPercent}%`,
        isNegative: occupancyPercent > 80
      },
      newRegistrations: {
        value: newRegistrationsCount,
        trend: newRegistrationsCount > 0 ? '+5%' : '0%',
        isNegative: false
      }
    });

    // Update capacity
    setCapacity({
      totalSlots: totalSlots,
      occupiedPercent: occupancyPercent,
      available: totalSlots - occupiedSlots
    });

    // Update revenue chart data based on selected time period
    const revenueData = generateRevenueData(bookingHistory, timePeriod);
    setRevenueChartData(revenueData);

    // Update recent bookings with actual data
    if (bookingHistory.length > 0) {
      const recentBookings = bookingHistory.slice(-3).map((booking, index) => ({
        id: Date.now() + index,
        name: 'User',
        vehicle: booking.vehicle || 'TN-01-AB-1234',
        slot: booking.spot || 'A-101',
        time: new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Parked',
        img: `https://i.pravatar.cc/150?u=${index + 10}`
      }));
      if (recentBookings.length > 0) {
        setBookings(recentBookings);
      }
    }
  }, [timePeriod]);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Poll for real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadStats]);

  // Helper function to generate revenue data based on time period
  const generateRevenueData = (bookingHistory, period) => {
    const data = [];
    const today = new Date();
    let periods = 7;
    let maxRevenue = 500;

    switch (period) {
      case '7days':
        periods = 7;
        maxRevenue = 500;
        break;
      case '4weeks':
        periods = 4;
        maxRevenue = 3500;
        break;
      case '6months':
        periods = 6;
        maxRevenue = 15000;
        break;
      case '1year':
        periods = 12;
        maxRevenue = 30000;
        break;
      default:
        periods = 7;
        maxRevenue = 500;
    }

    for (let i = periods - 1; i >= 0; i--) {
      let dateStr;
      let periodRevenue = 0;

      if (period === '7days') {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dateStr = date.toISOString().split('T')[0];
        periodRevenue = bookingHistory
          .filter(booking => booking.createdAt && booking.createdAt.startsWith(dateStr))
          .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
      } else if (period === '4weeks') {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        periodRevenue = bookingHistory
          .filter(booking => {
            if (!booking.createdAt) return false;
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
          })
          .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
      } else if (period === '6months') {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        periodRevenue = bookingHistory
          .filter(booking => {
            if (!booking.createdAt) return false;
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
          })
          .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
      } else if (period === '1year') {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        periodRevenue = bookingHistory
          .filter(booking => {
            if (!booking.createdAt) return false;
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
          })
          .reduce((sum, booking) => sum + (parseFloat(booking.amount) || 0), 0);
      }

      // Normalize to percentage (max 100)
      data.push(Math.min((periodRevenue / maxRevenue) * 100, 100));
    }

    return data;
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    const colLeft = margin + 5;
    const colRight = pageWidth - margin - 5;

    let y = 15;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    try {
      // --- 1. BACKGROUND ---
      doc.setFillColor(11, 15, 18);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // --- 2. HEADER ---
      doc.setFillColor(0, 229, 255);
      doc.roundedRect(margin, y, contentWidth, 45, 4, 4, 'F');
      doc.setFillColor(0, 255, 157);
      doc.rect(margin, y + 43, contentWidth, 2, 'F');

      doc.setTextColor(11, 15, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SPS | SMART PARKING SYSTEM", margin + 10, y + 18);

      doc.setFontSize(10);
      doc.text(`ADMIN INTELLIGENCE REPORT`, margin + 10, y + 28);
      doc.setFont("helvetica", "normal");
      doc.text(`OPERATOR: ${profile.fullName || 'AdminGuest'}`, margin + 10, y + 36);

      try {
        const logo = await loadImage(sps);
        doc.addImage(logo, 'PNG', pageWidth - margin - 35, y + 7, 25, 25);
      } catch (e) {
        doc.setDrawColor(11, 15, 18);
        doc.circle(pageWidth - margin - 20, y + 22, 10, 'S');
      }

      y += 60;

      // --- 3. NEON STATS CARDS ---
      const cardGap = 10;
      const cardWidth = (contentWidth - cardGap) / 2;
      const drawNeonCard = (x, ypos, title, value, unit = "") => {
        doc.setFillColor(21, 26, 30);
        doc.roundedRect(x, ypos, cardWidth, 35, 3, 3, 'F');
        doc.setFillColor(0, 229, 255);
        doc.rect(x, ypos + 5, 1.5, 25, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 255, 157);
        doc.text(title.toUpperCase(), x + 8, ypos + 12);
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(`${unit}${value}`, x + 8, ypos + 25);
      };

      drawNeonCard(margin, y, "Revenue (INR)", stats.revenue.value.toLocaleString(), "Rs. ");
      drawNeonCard(margin + cardWidth + cardGap, y, "Active Bookings", stats.activeBookings.value);

      y += 45;

      // --- 4. SLIM PROGRESS BAR ---
      const barBoxHeight = 25; // Reduced from 40
      doc.setFillColor(21, 26, 30);
      doc.roundedRect(margin, y, contentWidth, barBoxHeight, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10); // Slightly smaller font for slim look
      doc.text("SYSTEM CAPACITY UTILIZATION", margin + 10, y + 10);

      const barMaxWidth = contentWidth - 60;
      const progress = Math.min(stats.occupancy.value, 100);
      const fillWidth = (progress / 100) * barMaxWidth;

      // Slimmer bar (from 4mm to 2.5mm)
      doc.setFillColor(40, 45, 50);
      doc.roundedRect(margin + 10, y + 15, barMaxWidth, 2.5, 1.25, 1.25, 'F');
      doc.setFillColor(0, 229, 255);
      doc.roundedRect(margin + 10, y + 15, fillWidth, 2.5, 1.25, 1.25, 'F');

      doc.setFontSize(14);
      doc.setTextColor(0, 255, 157);
      doc.text(`${progress}%`, colRight, y + 18, { align: 'right' });

      y += barBoxHeight + 15;

      // --- 5. TECHNICAL SUMMARY ---
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Technical Summary", margin, y);
      y += 12;

      const details = [
        ["Report Timestamp", new Date().toLocaleString()],
        ["New Registrations", `${stats.newRegistrations.value} Users`],
        ["Total Lot Capacity", `${capacity.totalSlots} Slots`],
        ["Security Protocol", "AES-256 Encrypted Export"]
      ];

      details.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 155, 160);
        doc.text(label, colLeft, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 229, 255);
        doc.text(val, colRight, y, { align: 'right' });
        y += 10;
      });

      y += 5;

      // --- 6. FIXED DISCLAIMER BOX ---
      const disclaimerText = "This report is an automated intelligence export. Figures represent real-time sensor data synced via SPS Cloud Nodes. Unauthorized distribution or reproduction of this encrypted document is strictly prohibited under SPS Security Protocols.";

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 10);
      const disclaimerHeight = (splitDisclaimer.length * 4) + 6;

      // Positioning the box near the bottom
      const disclaimerY = pageHeight - 35;
      doc.setFillColor(21, 26, 30);
      doc.roundedRect(margin, disclaimerY, contentWidth, disclaimerHeight, 2, 2, 'F');
      doc.setDrawColor(40, 45, 50);
      doc.rect(margin, disclaimerY, 1, disclaimerHeight, 'F'); // Cyberpunk accent line

      doc.setTextColor(100, 105, 110);
      doc.text(splitDisclaimer, margin + 5, disclaimerY + 6);

      // --- 7. FOOTER ---
      doc.setFontSize(8);
      doc.setTextColor(60, 65, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`SPS-TID: ${Math.random().toString(36).toUpperCase().substr(2, 9)}`, margin, pageHeight - 10);
      doc.text("CONFIDENTIAL ADMIN EXPORT", colRight, pageHeight - 10, { align: 'right' });

      const now = new Date();
      const istDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // 03-03-2026
      const istTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(':', '-'); // 22-00

      doc.save(`SPS_Report_${istDate}_${istTime}.pdf`);
    } catch (error) {
      console.error("PDF Generation Failed", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <Navbar1 />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">
        <AdminHeader
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          profile={profile}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Welcome back, {profile.fullName.split(' ')[0] || 'Admin'}</h2>
            <p className="text-slate-500 text-sm font-medium">Here's an overview of your parking system's performance.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full md:w-auto bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_10px_20px_rgba(6,224,249,0.2)] active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={20} className={`group-hover:rotate-12 transition-transform ${isGeneratingReport ? 'animate-spin' : ''}`} />
              <span>{isGeneratingReport ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Revenue (INR)" value={`₹ ${stats.revenue.value.toLocaleString()}`} icon={Wallet} trend={stats.revenue.trend} />
            <StatCard title="Active Bookings" value={stats.activeBookings.value.toLocaleString()} icon={Car} trend={stats.activeBookings.trend} />
            <StatCard title="Occupancy" value={`${stats.occupancy.value}%`} icon={BarChart3} trend={stats.occupancy.trend} isNegative={stats.occupancy.isNegative} />
            <StatCard title="New Registrations" value={stats.newRegistrations.value.toLocaleString()} icon={Users} trend={stats.newRegistrations.trend} />
          </div>

          <div className="bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-0"></div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Live Capacity</span>
              <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400"><BarChart3 size={20} /></div>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle cx="88" cy="88" r="76" stroke="#1e293b" strokeWidth="12" fill="none" />
                <circle cx="88" cy="88" r="76" stroke="#00E0C6" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 76}`} strokeDashoffset={`${2 * Math.PI * 76 * (1 - capacity.occupiedPercent / 100)}`} className="transition-all duration-500 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">{capacity.occupiedPercent}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Occupied</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Total Slots</span><span className="text-white font-black">{capacity.totalSlots.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Available</span><span className="text-cyan-400 font-black">{capacity.available.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 bg-[#121e1e] rounded-[2.5rem] p-8 md:p-10 border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -z-0"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Wallet size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revenue Trends</span>
              </div>
              <div className="relative">
                <button
                  className="text-xs flex items-center gap-2 bg-[#0B0E14] px-3 py-1.5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {timePeriods.find(p => p.value === timePeriod)?.label || 'Select'} <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#162a2d] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                    {timePeriods.map((period) => (
                      <button
                        key={period.value}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${timePeriod === period.value
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        onClick={() => {
                          setTimePeriod(period.value);
                          setShowDropdown(false);
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {stats.revenue.value > 0 ? (
              <div className="h-64 w-full flex items-end justify-between px-2 relative">
                {revenueChartData.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full group">
                    <div className="w-8 bg-gradient-to-t from-cyan-500/20 to-cyan-400 rounded-t-lg transition-all duration-500 group-hover:from-cyan-400 group-hover:to-cyan-300 shadow-lg shadow-cyan-500/10" style={{ height: `${h}%` }}></div>
                    <span className="text-[10px] text-slate-500 font-medium">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-800/30 rounded-full mb-4">
                  <Wallet size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium text-sm">No revenue data available yet</p>
                <p className="text-slate-600 text-xs mt-1">Revenue from bookings will appear here</p>
              </div>
            )}
          </div>

          <div className="bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-0" ></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">
                Recent Activity</span>
              <button className="text-cyan-400 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {bookings && bookings.length > 0 ? (
                bookings.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-white/[0.02] border-white/5"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.img || "https://i.pravatar.cc/150?u=default"}
                        className="w-10 h-10 rounded-full border border-white/10"
                        alt="User"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {item.vehicle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-cyan-400">
                        {item.slot}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${item.status === "Parked"
                          ? "text-green-400 bg-green-500/10"
                          : "text-cyan-400 bg-cyan-500/10"
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-500">
                    No recent activity to show.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
