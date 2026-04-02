import React, { useState, useEffect } from 'react';
import { Car, Star, MapPin, Plus, X } from 'lucide-react';
import Navbar1 from './Navbar1';
import AdminHeader from './AdminHeader'
import { getSlots, getAvailableSlots, getMe, getAdmins } from '../api/parkingApi';

const ParkingSlots = () => {
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);
  const [profile, setProfile] = useState();

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
  const [spots, setSpots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const data = await getSlots();
        const allSlots = (data.slots || []).map((slot) => ({
          id: slot.id,
          title: slot.name || `Slot ${slot.id}`,
          price: slot.price ?? 200,
          address: slot.address || 'Chennai Central',
          tags: slot.tags ? slot.tags.split(',').map((t) => t.trim()).filter(Boolean) : ['General'],
          img: slot.img || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
          rating: slot.rating ?? 4.2,
          reviews: slot.reviews ?? 100,
          isBest: !!slot.is_best,
          status: slot.status || 'available',
        }));
        setSpots(allSlots);
        setAvailableSlotsCount(allSlots.filter(s => s.status === 'available').length);
      } catch (err) {
        console.error('Failed to fetch slots from API:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlots();
  }, []);

  const handleAddSpot = (newSpot) => {
    setSpots([newSpot, ...spots]);
    setIsModalOpen(false);
  };

  const filteredSpots = spots.filter(spot =>
    spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <Navbar1 />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-b from-[#0b1414] to-[#080d0d] custom-scrollbar">
        {/* Header */}
        <AdminHeader
          searchTerm={searchQuery} onSearchChange={setSearchQuery} profile={profile}
        />

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">Chennai Network</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">Active nodes: {filteredSpots.length} | Available: {availableSlotsCount || 0}</p>
            {isLoading && <p className="text-cyan-200 text-sm mt-1">Loading slots from API...</p>}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#090B0C] rounded-xl text-sm font-bold hover:bg-[#1FD1E5] transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
          >
            <Plus size={18} />
            Register Node
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in duration-500 pb-10">
          {filteredSpots.map(spot => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </main>

      {isModalOpen && <CreateSlotModal
        profile={profile}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSpot}
      />}
    </div>
  );
};

// --- MODAL COMPONENT ---
const CreateSlotModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ title: '', price: '', address: '', tags: 'General' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;

    const newEntry = {
      id: Date.now(),
      ...formData,
      price: parseInt(formData.price),
      tags: [formData.tags],
      rating: 5.0,
      img: `https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&sig=${Math.random()}`,
      isBest: false
    };
    onSubmit(newEntry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="bg-[#0F1315] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-cyan-500/10 to-transparent">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg"><Car size={20} className="text-cyan-400" /></div>
            Initialize Node
          </h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Node Designation</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#162a2d]/40 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/50 text-white"
              placeholder="e.g. Marina Beach North"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Hourly Rate (₹)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#162a2d]/40 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/50 text-white"
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Tag</label>
              <select
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-[#162a2d]/40 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/50 text-white appearance-none"
              >
                <option>Automated</option>
                <option>EV Charging</option>
                <option>Valet</option>
                <option>Covered</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Geographic Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#162a2d]/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-cyan-500/50 text-white"
                placeholder="Street name, Area"
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-white">Abort</button>
          <button type="submit" className="flex-1 py-4 bg-cyan-400 text-[#090B0C] rounded-2xl text-sm font-black uppercase tracking-tight hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
            Deploy Node
          </button>
        </div>
      </form>
    </div>
  );
};

// --- CARD COMPONENT ---
const SpotCard = ({ spot }) => (
  <div className="flex flex-col bg-[#0F1315] border border-[#232D31] rounded-2xl overflow-hidden hover:border-[#1FD1E5]/40 transition-all group hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
    <div className="h-48 overflow-hidden relative">
      <img src={spot.img} alt={spot.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-white/10">
        <Star size={12} className="fill-[#1FD1E5] text-[#1FD1E5] stroke-none" /> {spot.rating}
      </div>
      {spot.isBest && (
        <div className="absolute top-4 right-4 bg-[#1FD1E5] text-[#090B0C] text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Top Rated</div>
      )}
    </div>

    <div className="p-5 flex flex-col flex-1">
      <h3 className="font-bold text-lg mb-1 group-hover:text-[#1FD1E5] transition-colors line-clamp-1 text-white">{spot.title}</h3>
      <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-6 min-h-[1rem]"><MapPin size={12} /> {spot.address}</p>

      <div className="mt-auto pt-4 border-t border-[#232D31] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Pricing</span>
          <span className="text-[#E2E8F0] font-black text-lg">₹{spot.price}<span className="text-[10px] font-normal text-gray-500 ml-1">/hr</span></span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {spot.tags.slice(0, 1).map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-[#1FD1E5]/10 text-[#1FD1E5] text-[9px] rounded-lg font-black uppercase tracking-tighter border border-[#1FD1E5]/20">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ParkingSlots;
