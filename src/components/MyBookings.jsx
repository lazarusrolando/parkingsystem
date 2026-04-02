import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map, Wallet, History, Car, 
  Settings, LogOut, Search, Navigation 
} from 'lucide-react';
import { getSlots, bookSlot } from '../api/parkingApi';
import logo from '../sps.png'; // Ensure this path is correct

const CHENNAI_SPOTS = [
  { id: 1, title: "GCC Multilevel Parking", price: 200, distance: "0.1 km", address: "Pondy Bazaar, T. Nagar", tags: ['EV', 'Automated'], isBest: true, img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200", rating: 4.8, reviews: 1240, lat: 13.0418, lng: 80.2341 },
  { id: 2, title: "Express Avenue Mall", price: 400, distance: "1.2 km", address: "Royapettah", tags: ['Valet', 'Covered'], img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200", rating: 4.5, reviews: 3100, lat: 13.0569, lng: 80.2586 },
  { id: 3, title: "Spencer Plaza Lot", price: 300, distance: "1.5 km", address: "Anna Salai", tags: ['24/7'], img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200", rating: 3.9, reviews: 850, lat: 13.0604, lng: 80.2503 },
  { id: 4, title: "Chennai Central CMRL", price: 250, distance: "2.8 km", address: "Park Town", tags: ['Metro', 'Security'], img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200", rating: 4.2, reviews: 520, lat: 13.0827, lng: 80.2752 },
  { id: 5, title: "VR Chennai Parking", price: 400, distance: "4.2 km", address: "Anna Nagar West", tags: ['Luxury', 'EV'], img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200", rating: 4.7, reviews: 2100, lat: 13.0850, lng: 80.2101 },
  { id: 6, title: "Tower Park Public Lot", price: 200, distance: "4.5 km", address: "Anna Nagar", tags: ['Open'], img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200", rating: 4.1, reviews: 430, lat: 13.0845, lng: 80.2100 },
  { id: 7, title: "Phoenix Marketcity", price: 400, distance: "6.1 km", address: "Velachery Main Rd", tags: ['Valet', 'Covered'], img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200", rating: 4.6, reviews: 4500, lat: 12.9758, lng: 80.2212 },
  { id: 8, title: "Grand Square Mall", price: 200, distance: "6.5 km", address: "Velachery-Tambaram Rd", tags: ['Budget'], img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200", rating: 4.3, reviews: 890, lat: 12.9556, lng: 80.2072 },
  { id: 9, title: "Besant Nagar Beach Lot", price: 200, distance: "7.2 km", address: "Elliot's Beach", tags: ['Open'], img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200", rating: 4.0, reviews: 2100, lat: 13.0005, lng: 80.2717 },
  { id: 10, title: "Marina Mall OMR", price: 300, distance: "12.5 km", address: "Egattur", tags: ['CCTV'], img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200", rating: 4.4, reviews: 1200, lat: 12.9791, lng: 80.2511 },
  { id: 11, title: "Tidel Park Parking", price: 300, distance: "8.1 km", address: "Tharamani", tags: ['Corporate'], img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200", rating: 4.1, reviews: 670, lat: 12.9863, lng: 80.2485 },
];

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('Map View');
  const [slots, setSlots] = useState(CHENNAI_SPOTS);
  const [activeSpotId, setActiveSpotId] = useState(CHENNAI_SPOTS[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const data = await getSlots();
        if (data && data.slots && data.slots.length > 0) {
          setSlots(data.slots.map((slot) => ({
            ...slot,
            title: slot.name || `Slot-${slot.id}`,
            price: slot.price || 100,
            address: slot.name || `Slot ${slot.id}`,
            distance: '0.5 km',
            img: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
          })));
          setActiveSpotId(data.slots[0].id);
        }
      } catch (err) {
        console.error('Failed to load slots from backend', err);
      }
    };

    loadSlots();
  }, []);

  const filteredSpots = slots.filter(spot =>
    spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSpotData = slots.find((slot) => slot.id === activeSpotId) || CHENNAI_SPOTS[0] || {};

  const handleBooking = async () => {
    if (!activeSpotData?.id) {
      alert('No spot selected');
      return;
    }
    try {
      const result = await bookSlot(activeSpotData.id, activeSpotData.price || 0);
      console.log('Booking result', result);
      alert(`Booking successful for slot ${activeSpotData.title || activeSpotData.name || activeSpotData.id}`);
      // reload slots and active selection
      const fresh = await getSlots();
      setSlots(fresh.slots || []);
      setActiveSpotId(fresh.slots?.[0]?.id || activeSpotId);
    } catch (error) {
      console.error('Booking failed', error);
      alert(`Booking failed: ${error.message}`);
    }
  };

  // --- Helper Sub-components (Render Functions) ---

  const renderSidebarItem = (Icon, label) => {
    const isActive = activeTab === label;
    return (
      <button 
        onClick={() => setActiveTab(label)}
        className={`w-full flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all ${
          isActive ? 'bg-cyan-900/30 text-cyan-400' : 'text-gray-400 hover:bg-gray-800'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const SpotCard = ({ id, title, price, distance, address, tags, isBest = false, img }) => (
    <div
      onClick={() => setActiveSpotId(id)}
      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group 
        ${activeSpotId === id
          ? 'bg-gradient-to-r from-[#162a2d] to-[#102123] border-[#06e0f9]/40 shadow-[0_0_15px_rgba(6,224,249,0.1)]'
          : 'bg-[#102123] border-transparent hover:border-[#21464a] hover:bg-[#162a2d]'}`}
    >
      <div className="relative shrink-0">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16"
          style={{ backgroundImage: `url(${img})` }}
        ></div>
        {isBest && (
          <div className="absolute -top-2 -right-2 bg-[#06e0f9] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            BEST
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className={`text-sm font-bold truncate transition-colors ${activeSpotId === id ? 'text-[#06e0f9]' : 'text-white'}`}>
            {title}
          </h3>
          <span className="text-[#06e0f9] font-bold text-sm">
            ${price}<span className="text-[10px] text-[#8ec6cc] font-normal">/hr</span>
          </span>
        </div>
        <p className="text-[#8ec6cc] text-[10px] truncate">{distance} • {address}</p>
        <div className="flex gap-2 mt-2">
          {tags.map(tag => (
            <span key={tag} className="bg-[#21464a] text-[#8ec6cc] text-[9px] px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#081212] text-white font-['Manrope'] overflow-hidden h-screen flex">
      
      {/* 1. Main Sidebar Navigation */}
      <aside className="w-64 flex flex-col justify-between p-6 border-r border-gray-800/50 bg-[#081212] shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-10 px-2">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-circle" />
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">SPS</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Online Parking</p>
            </div>
          </div>

          <nav className="space-y-2">
            {renderSidebarItem(LayoutDashboard, "Dashboard")}
            {renderSidebarItem(Map, "Map View")}
            {renderSidebarItem(Wallet, "Wallet")}
            {renderSidebarItem(History, "History")}
            {renderSidebarItem(Car, "My Vehicles")}
          </nav>
        </div>

        <div className="space-y-2">
          {renderSidebarItem(Settings, "Settings")}
          {renderSidebarItem(LogOut, "Logout")}
        </div>
      </aside>

      {/* 2. Map View Panel (Search + Map) */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Search & List */}
        <aside className="w-[380px] flex flex-col bg-[#0f2123] border-r border-[#21464a] z-10 shrink-0 shadow-2xl relative h-full">
          <div className="p-6 pb-2">
            <h2 className="text-white text-2xl font-bold mb-4">Find a Spot</h2>
            
            {/* Search Bar */}
            <div className="relative w-full mb-4">
              <div className="flex w-full items-center rounded-full bg-[#162a2d] border border-[#21464a] focus-within:border-[#06e0f9]/50 transition-all h-11 shadow-lg">
                <Search size={18} className="text-[#8ec6cc] ml-4" />
                <input
                  className="w-full bg-transparent border-none text-white placeholder:text-[#8ec6cc] focus:ring-0 px-3 text-sm"
                  placeholder="Enter address or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              <button className="flex h-8 shrink-0 items-center gap-x-2 rounded-full bg-[#06e0f9] text-black font-bold px-4 text-xs shadow-[0_0_10px_rgba(6,224,249,0.2)]">
                EV Charging
              </button>
              <button className="flex h-8 shrink-0 items-center gap-x-2 rounded-full bg-[#21464a] text-white px-4 text-xs border border-transparent hover:border-gray-600">
                Covered
              </button>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#21464a] to-transparent w-full"></div>

          {/* List of Spots */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
            {filteredSpots.length === 0 ? (
              <p className="text-slate-500 text-sm">No parking spots available.</p>
            ) : (
              filteredSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  id={spot.id}
                  title={spot.title}
                  price={spot.price}
                  distance={spot.distance}
                  address={spot.address}
                  tags={spot.tags || ['Standard']}
                  img={spot.img}
                  isBest={spot.isBest}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right Panel: Map Interaction */}
        <div className="flex-1 relative bg-[#0f2123] overflow-hidden">
          {/* Abstract Grid Background */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(#1a3336 2px, transparent 2px), linear-gradient(90deg, #1a3336 2px, transparent 2px)`,
              backgroundSize: '80px 80px'
            }}
          ></div>

          {/* Active Pin */}
          <div className="absolute top-[40%] left-[45%] flex flex-col items-center gap-1 z-20 transition-transform hover:scale-110 cursor-pointer">
            <div className="bg-[#06e0f9] text-black font-bold px-3 py-1 rounded-full shadow-[0_0_20px_rgba(6,224,249,0.6)] border-2 border-white flex items-center gap-1">
              <Navigation size={12} fill="black" />
              <span className="text-sm">$5</span>
            </div>
            <div className="w-2 h-2 bg-[#06e0f9] rounded-full shadow-[0_0_10px_#06e0f9]"></div>
          </div>

          {/* User Location Pulse */}
          <div className="absolute top-[55%] left-[52%] flex items-center justify-center">
            <div className="w-12 h-12 bg-[#06e0f9]/20 rounded-full animate-ping absolute"></div>
            <div className="w-4 h-4 bg-[#06e0f9] border-2 border-white rounded-full shadow-[0_0_15px_rgba(6,224,249,0.8)] z-10"></div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            {['+', '−', '⊙'].map((control) => (
              <button key={control} className="size-10 bg-[#162a2d] rounded-full border border-[#21464a] flex items-center justify-center hover:text-[#06e0f9] font-bold shadow-xl transition-colors">
                {control}
              </button>
            ))}
          </div>

          {/* Floating Detail Card */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[300px] bg-[#162a2d]/95 backdrop-blur-md rounded-2xl p-4 border border-[#21464a] shadow-2xl z-30 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-800 bg-cover" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=200)` }}></div>
              <div className="flex flex-col justify-center">
                <h4 className="text-white font-bold text-sm">{activeSpotData.title || activeSpotData.name || 'Selected Spot'}</h4>
                <div className="flex items-center gap-1 text-[#06e0f9]">
                  <span className="text-xs font-bold">4.8 ★</span>
                  <span className="text-[#8ec6cc] text-[10px]">(128 reviews)</span>
                </div>
              </div>
            </div>
            <button onClick={handleBooking} className="w-full bg-[#06e0f9] hover:bg-cyan-400 text-black font-bold py-2 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(6,224,249,0.3)]">
              Reserve Spot
            </button>
          </div>
        </div>
      </main>

      {/* Internal Scrollbar Styling */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #21464a; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MyBookings;
