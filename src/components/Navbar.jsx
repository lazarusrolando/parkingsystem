import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
     LayoutDashboard, Map as MapIcon, Wallet, History, Car,
     Settings, LogOut, Ticket
} from 'lucide-react';
import logo from '../sps.png'

export default function Navbar() {
     const location = useLocation();
     const navigate = useNavigate();

     const handleLogout = () => {
          localStorage.removeItem('parkingAuthToken');
          localStorage.removeItem('loggedInUser');
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
                    <Link to='/UserDashboard' style={{ textDecoration: 'none' }}><SidebarItem icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/UserDashboard'} /> </Link>
                    <Link to='/MapView' style={{ textDecoration: 'none' }}><SidebarItem icon={MapIcon} label="Map View" active={location.pathname === '/MapView'} /></Link>
                    <Link to='/Wallet' style={{ textDecoration: 'none' }}><SidebarItem icon={Wallet} label="My Wallet" active={location.pathname === '/Wallet'} /></Link>
                    <Link to='/History' style={{ textDecoration: 'none' }}><SidebarItem icon={History} label="History" active={location.pathname === '/History'} /></Link>
                    <Link to='/Vehicles' style={{ textDecoration: 'none' }}><SidebarItem icon={Car} label="My Vehicles" active={location.pathname === '/Vehicles'} /></Link>
                    <Link to='/SupportTicket' style={{ textDecoration: 'none' }}><SidebarItem icon={Ticket} label="Support Ticket" active={location.pathname === '/SupportTicket'} /></Link>
               </nav>

               <div className="pt-4 md:pt-6 border-t border-white/5 space-y-2 md:space-y-3">
                    <Link to="/Settings" style={{ textDecoration: 'none' }}><SidebarItem icon={Settings} label="Settings" active={location.pathname === '/Settings'} /></Link>
                    <div onClick={handleLogout} style={{ textDecoration: 'none' }}><SidebarItem icon={LogOut} label="Logout" isLogout={true} /></div>
               </div>
          </aside>
     )
}
