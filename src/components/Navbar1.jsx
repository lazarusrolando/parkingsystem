import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
     LayoutDashboard, ParkingMeter, UsersRoundIcon, History, TrendingUp, Wallet, Settings, LogOut,
     Ticket
} from 'lucide-react';
import logo from '../sps.png'

export default function Navbar1() {
     const location = useLocation();
     const navigate = useNavigate();

     const handleLogout = () => {
          localStorage.removeItem('parkingAuthToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('adminProfile');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userVehicles');
          localStorage.removeItem('currentBooking');
          localStorage.removeItem('bookingHistory');
          navigate('/Auth');
     };

     const SidebarItem = ({ icon: Icon, label, active = false, isLogout = false, onClick }) => (
          <div
               onClick={onClick}
               className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,224,249,0.1)]'
                    : isLogout ? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    }`}>
               <Icon size={20} />
               <span className="hidden lg:block text-sm font-semibold">{label}</span>
          </div>
     );
     return (
          <aside className="w-16 md:w-20 lg:w-64 border-r border-white/5 flex flex-col p-2 md:p-4 lg:p-6 z-30 bg-[#080d0d]">
               <div className="flex items-center gap-2 mt-4 md:mb-10 lg:mb-12">
                    <Link
                         to="/"
                         className="transition-all duration-200 hover:opacity-80 active:scale-95 block w-fit"
                    >
                         <img
                              src={logo}
                              className="w-6 md:w-8 lg:w-12 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,224,249,0.2)]"
                              alt="SPS"
                         />
                    </Link>
                    <div className="hidden lg:block">
                         <h1 className="text-white font-black tracking-tighter text-xl leading-none">SPS</h1>
                         <span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">Smart Solutions</span>
                    </div>
               </div>

               <nav className="flex-1 space-y-2">
                    <Link to='/AdminDashboard' style={{ textDecoration: 'none' }}><SidebarItem icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/AdminDashboard'} /> </Link>
                    <Link to='/ParkingSlots' style={{ textDecoration: 'none' }}><SidebarItem icon={ParkingMeter} label="Parking Slots" active={location.pathname === '/ParkingSlots'} /></Link>
                    <Link to='/UserManagement' style={{ textDecoration: 'none' }}><SidebarItem icon={UsersRoundIcon} label="User Management" active={location.pathname === '/UserManagement'} /></Link>
                    <Link to='/Revenue' style={{ textDecoration: 'none' }}><SidebarItem icon={Wallet} label="Revenue" active={location.pathname === '/Revenue'} /></Link>
                    <Link to='/SystemLogs' style={{ textDecoration: 'none' }}><SidebarItem icon={History} label="System Logs" active={location.pathname === '/SystemLogs'} /></Link>
                    <Link to='/Analytics' style={{ textDecoration: 'none' }}><SidebarItem icon={TrendingUp} label="Analytics" active={location.pathname === '/Analytics'} /></Link>
                    <Link to='/HelpDesk' style={{ textDecoration: 'none' }}><SidebarItem icon={Ticket} label="Help Desk" active={location.pathname === '/HelpDesk'} /></Link>
               </nav>

               <div className="pt-4 md:pt-6 border-t border-white/5 space-y-2 md:space-y-3">
                    <Link to="/SettingsHub" style={{ textDecoration: 'none' }}><SidebarItem icon={Settings} label="Settings" active={location.pathname === '/SettingsHub'} /></Link>
                    <div onClick={handleLogout} style={{ textDecoration: 'none' }}><SidebarItem icon={LogOut} label="Logout" isLogout={true} /></div>
               </div>
          </aside>
     )
}
