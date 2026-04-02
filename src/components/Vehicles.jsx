import React, { useState, useEffect } from 'react';
import {
  Car, Plus, MoreVertical, Trash2, Truck, Zap, ArrowRight, History, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationBox from './NotificationBox';
import { notifyVehicleRegistered } from '../utils/notificationUtils';
import parkingApi, { getVehicles, addVehicle } from '../api/parkingApi';

const VehicleCard = ({ name, type, plate, status, image, icon: VehicleIcon }) => {
  const isParked = status === 'Parked';

  return (
    <article className="group relative flex flex-col bg-[#121e1e] rounded-[2.5rem] p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-colors"></div>

      <div className="relative w-full aspect-[16/9] rounded-3xl mb-6 overflow-hidden border border-white/5 bg-[#0d1616]">
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isParked
            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            : 'bg-slate-800/80 text-slate-400 border-transparent'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isParked ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
            {status}
          </span>
        </div>
        <div
          className="w-full h-full bg-center bg-cover transform group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{type}</span>
              {type.includes('Electric') && <Zap size={12} className="text-yellow-500" />}
            </div>
          </div>
          <button className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="bg-[#0d1616] border border-white/5 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Registration</span>
            <span className="font-mono font-bold text-white text-lg tracking-wider">{plate}</span>
          </div>
          <div className={`p-2.5 rounded-xl ${isParked ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800/50 text-slate-500'}`}>
            <VehicleIcon size={20} />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_48px] gap-3">
          <button className={`py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 ${isParked
            ? 'bg-white text-black hover:bg-slate-200'
            : 'bg-[#1a2b2b] text-white hover:bg-[#233a3a] border border-white/5'
            }`}>
            {isParked ? 'View Location' : 'Set as Primary'}
          </button>
          <button className="flex items-center justify-center rounded-2xl bg-red-500/5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

const GarageApp = () => {
// Load vehicles from DB
  const [vehicles, setVehicles] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setLoggedInUser(user);
      getVehicles().then(({vehicles: v}) => setVehicles(v)).catch(console.error);
    }
  }, []);

  // Fetch fresh user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) return;
        
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
        console.warn('Vehicles: Failed to fetch user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await addVehicle(newVehicle.name, newVehicle.plate);
      setVehicles([...vehicles, result.vehicle]);
      notifyVehicleRegistered({
        name: newVehicle.name,
        plate: newVehicle.plate
      });
      setNewVehicle({ name: '', type: '', plate: '', image: null });
      setIsAdding(false);
    } catch (err) {
      alert('Failed to add vehicle: ' + err.message);
    }
  };

  // Get the primary vehicle (the one marked as isDefault)
  const primaryVehicle = vehicles.find(v => v.isDefault) || vehicles[0];

  // Get username for display
  const userName = loggedInUser?.name || 
    `${loggedInUser?.firstname || ''} ${loggedInUser?.lastname || ''}`.trim() ||
    (loggedInUser?.email ? loggedInUser.email.split('@')[0] : null) ||
    "Guest";

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

  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', type: '', plate: '', image: null });

  // Original handleSubmit removed - DB version already in place above

  return (
    <div className="flex h-screen bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search your vehicles..."
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

        {/* SECTION HEADER: Title & Add Button */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">Vehicle Management</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">My Vehicle</h2>
            <p className="text-slate-500 text-sm font-medium">
              You have <span className="text-white font-bold">{vehicles.length} vehicles</span> registered in your profile.
            </p>
          </div>

          <button onClick={() => setIsAdding(true)} className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-cyan-400 transition-all shadow-[0_10px_30px_rgba(6,224,249,0.2)] active:scale-95 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs uppercase tracking-widest">Add New Vehicle</span>
          </button>
        </header>

        {isAdding && (
          <div className="mb-10 bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">Add New Vehicle</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle Name</label>
                  <input
                    type="text"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    className="w-full bg-[#0d1616] border border-white/5 rounded-2xl py-3 px-4 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                    placeholder="e.g. Tesla Model 3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle Type</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full bg-[#0d1616] border border-white/5 rounded-2xl py-3 px-4 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Electric Sedan">Electric Sedan</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="Electric Sport">Electric Sport</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">License Plate</label>
                  <input
                    type="text"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    className="w-full bg-[#0d1616] border border-white/5 rounded-2xl py-3 px-4 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all font-mono"
                    placeholder="e.g. TS • 09 • HG • 4421"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewVehicle({ ...newVehicle, image: e.target.files[0] })}
                    className="w-full bg-[#0d1616] border border-white/5 rounded-2xl py-3 px-4 text-white focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-800 text-white hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_10px_30px_rgba(6,224,249,0.2)]"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VEHICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}

          <button className="group relative flex flex-col items-center justify-center min-h-[400px] bg-[#0d1616]/50 border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-500">
            <div className="w-16 h-16 rounded-2xl bg-[#121e1e] flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-black text-cyan-400 transition-all shadow-xl">
              <Plus size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Register Vehicle</h3>
            <p className="text-xs text-slate-500 text-center max-w-[200px] leading-relaxed uppercase tracking-tighter font-bold">
              Add another vehicle to your digital keychain for seamless parking access.
            </p>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 bg-[#121e1e] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 flex items-center gap-5 border-b md:border-b-0 md:border-r border-white/5 relative group">
            <div className="absolute top-0 left-0 w-1 h-0 bg-cyan-400 group-hover:h-full transition-all duration-500" />
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Total Garage</p>
              <div className="flex items-baseline gap-2">
                <p className="text-white font-black text-3xl tracking-tighter">{vehicles.length}</p>
                <span className="text-slate-600 text-[10px] font-bold uppercase">Units</span>
              </div>
            </div>
          </div>

<div className="p-8 flex items-center gap-5 border-b md:border-b-0 md:border-r border-white/5 group">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Live Sessions</p>
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-3xl tracking-tighter">
                  {vehicles.filter(v => v.status === 'Parked').length}
                </p>
                {vehicles.filter(v => v.status === 'Parked').length > 0 ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[8px] font-black text-green-400 uppercase">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-500/10 border border-slate-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-[8px] font-black text-slate-400 uppercase">Idle</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 flex items-center gap-5 border-b md:border-b-0 md:border-r border-white/5 group">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Primary Vessel</p>
              <p className="text-white font-black text-xl tracking-tight group-hover:text-cyan-400 transition-colors">
                {primaryVehicle ? primaryVehicle.name : "No vehicle selected"}
              </p>
              <p className="text-[9px] text-cyan-500/60 font-bold uppercase tracking-widest">{primaryVehicle ? "Selected" : "Not Selected"}</p>
            </div>
          </div>

          <Link to="/History" className="p-8 flex text-decoration-none items-center justify-between cursor-pointer transition-all duration-500 group bg-cyan-500/[0.02] hover:bg-cyan-500/10 block w-full">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Archive</p>
              <p className="flex items-center gap-3 font-black text-xl text-white group-hover:text-cyan-400 transition-all">
                History
                <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-2 transition-all duration-300" />
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-slate-500 group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <History size={20} />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default GarageApp;