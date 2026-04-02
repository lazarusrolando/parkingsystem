import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Search,
    QrCode, CreditCard, Wallet, Loader2, Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader';
import { getMe, getAdmins } from '../api/parkingApi';

const MetricCard = ({ title, value, change, isPositive, isLoading }) => {
    const hasChange = change !== "0%" && change !== 0 && change !== "0";

    return (
        <div className="bg-[#1a2f32] p-6 rounded-xl border border-slate-800 min-h-[110px] flex flex-col justify-center">
            {isLoading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-3 w-20 bg-slate-700 rounded"></div>
                    <div className="h-6 w-32 bg-slate-700 rounded"></div>
                </div>
            ) : (
                <>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
                        {hasChange && (
                            <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-orange-500'}`}>
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {change}
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const EmptyState = ({ message = "No data available", type = "default" }) => {
    const renderIcon = () => {
        switch (type) {
            case 'payment':
                return (
                    <div className="flex gap-3 mb-3 opacity-20">
                        <QrCode size={32} />
                        <CreditCard size={32} />
                        <Wallet size={32} />
                    </div>
                );
            case 'search':
                return <Search size={40} className="mb-3 opacity-20" />;
            default:
                return <Database size={40} className="mb-3 opacity-20" />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500 text-center">
            {renderIcon()}
            <p className="text-sm font-medium tracking-wide">{message}</p>
        </div>
    );
};

const RevenueDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [revenueHistory, setRevenueHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [profile, setProfile] = useState(null);

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
                        setProfile({ fullName: fullName });
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                // Arrays remain empty to trigger the EmptyStates
                setRevenueHistory([]);
                setTransactions([]);
            } catch (err) {
                setError("Failed to sync financial data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const metrics = useMemo(() => {
        const parseAmount = (str) => {
            if (typeof str !== 'string') return 0;
            return parseFloat(str.replace(/[₹,]/g, '')) || 0;
        };
        const successfulTxns = transactions.filter(t => t.status === 'Success');
        const totalRevenue = successfulTxns.reduce((acc, curr) => acc + parseAmount(curr.amount), 0);
        return {
            totalRevenue: `₹${totalRevenue.toLocaleString()}`,
            avgTransaction: `₹0.00`,
            totalRefunds: `₹0`,
            growth: "0%"
        };
    }, [transactions]);

    const dynamicPieData = useMemo(() => {
        if (transactions.length === 0) return [];
        const counts = transactions.reduce((acc, txn) => {
            acc[txn.method] = (acc[txn.method] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, count]) => ({
            name,
            value: count,
            color: '#06e0f9'
        }));
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn =>
            txn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    return (
        <div className="flex h-screen bg-[#0f2123] text-slate-100 font-sans overflow-hidden">
            <Navbar1 />
            <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0b1414] to-[#080d0d] p-6 overflow-y-auto custom-scrollbar">
                <AdminHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    profile={profile}
                />

                {error ? (
                    <div className="text-red-400 p-8 text-center">{error}</div>
                ) : (
                    <div className="p-2 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard title="Total Revenue" value={metrics.totalRevenue} change={metrics.growth} isPositive isLoading={isLoading} />
                            <MetricCard title="Monthly Growth" value={metrics.growth} change="0%" isPositive isLoading={isLoading} />
                            <MetricCard title="Avg Transaction" value={metrics.avgTransaction} change="0%" isPositive={false} isLoading={isLoading} />
                            <MetricCard title="Refunds" value={metrics.totalRefunds} change="0%" isPositive={false} isLoading={isLoading} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-[#1a2f32] p-6 rounded-xl border border-slate-800 min-h-[350px] flex flex-col">
                                <h4 className="text-lg font-bold mb-6">Revenue Trends</h4>
                                <div className="flex-1">
                                    {isLoading ? (
                                        <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cyan-400" /></div>
                                    ) : revenueHistory.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueHistory}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06e0f9" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06e0f9" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a2f32', border: 'none' }} />
                                                <Area type="monotone" dataKey="amount" stroke="#06e0f9" fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState message="No revenue trends to display yet." type="default" />
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#1a2f32] p-6 rounded-xl border border-slate-800 flex flex-col min-h-[350px]">
                                <h4 className="text-lg font-bold mb-6">Payment Distribution</h4>
                                <div className="flex-1 flex flex-col">
                                    {isLoading ? (
                                        <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-cyan-400" /></div>
                                    ) : dynamicPieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={dynamicPieData} innerRadius={50} outerRadius={70} dataKey="value">
                                                    {dynamicPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState message="No UPI, Card, or Wallet data found." type="payment" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2f32] rounded-xl border border-slate-800 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#0f2123]/50">
                                    <tr>
                                        {['ID', 'User', 'Amount', 'Method', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center">
                                                <Loader2 className="animate-spin text-cyan-400 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((txn, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-mono text-cyan-400">{txn.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium">{txn.user}</td>
                                                <td className="px-6 py-4 text-sm font-bold">{txn.amount}</td>
                                                <td className="px-6 py-4 text-xs text-slate-400">{txn.method}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded bg-green-500/20 text-green-400">
                                                        {txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <EmptyState message="No transactions found." type="search" />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RevenueDashboard;

