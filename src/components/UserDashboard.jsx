import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import {
  Map as MapIcon, Wallet, History, Car, Search, Navigation, Clock
} from 'lucide-react';
import Navbar from './Navbar';
import NotificationBox from './NotificationBox';
import TopUpModal from './TopUpModal';
import Chatbot from './Chatbot';

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

const darkMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'all', elementType: 'geometry.fill', stylers: [{ color: '#17263c' }] },
  { featureType: 'all', elementType: 'geometry.stroke', stylers: [{ color: '#0a1128' }] },
  { featureType: 'all', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#7c92b2' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }, { weight: 5.25 }] },
  { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0a1128' }] },
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#0a1128' }] },
  { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#0a1128' }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry.fill', stylers: [{ color: '#0a1128' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#0a1128' }] },
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0a1128' }] },
  { featureType: 'poi', elementType: 'geometry.fill', stylers: [{ color: '#0a1128' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#213555' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#213555' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0a1128' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a4575' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#2a4575' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#7c92b2' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1a2d52' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#1a2d52' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#7c92b2' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#17263c' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#7c92b2' }] },
  { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#0a1128' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#0a1128' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#546c82' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'off' }] }
];

const Map = ({ center, zoom, spots, currentLocation, activeSpot, onMarkerClick }) => {
  const ref = useRef();
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: darkMapStyles,
        backgroundColor: '#0b1414',
      });
      setMap(newMap);
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
    }
  }, [center, map]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      // Note: In a real app, manage markers properly

      // eslint-disable-next-line no-unused-vars
      const markers = [];

      // Add current location marker
      if (currentLocation) {
        const currentMarker = new window.google.maps.Marker({
          position: currentLocation,
          map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" fill="#00ff00" stroke="#fff" stroke-width="3"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 10)
          },
        });
        const currentInfoWindow = new window.google.maps.InfoWindow({
          content: '<div style="color: green; font-weight: bold;">Your Location</div><div style="color: #666;">Current position</div>',
        });
        currentMarker.addListener('click', () => {
          currentInfoWindow.open(map, currentMarker);
        });
        markers.push(currentMarker);
      }

      // Add spot markers
      spots.forEach(spot => {
        const spotMarker = new window.google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6" fill="${activeSpot === spot.id ? '#ff4d4d' : '#06e0f9'}" stroke="#fff" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(14, 14),
            anchor: new window.google.maps.Point(7, 7)
          },
        });
        const spotInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="color: #06e0f9; font-weight: bold;">${spot.title}</div><div style="color: #666;">₹${spot.price}/hour</div>`,
        });
        spotMarker.addListener('click', () => {
          spotInfoWindow.open(map, spotMarker);
          if (onMarkerClick) onMarkerClick(spot);
        });
        markers.push(spotMarker);
      });

      return () => {
        markers.forEach(marker => marker.setMap(null));
      };
    }
  }, [map, spots, currentLocation, activeSpot, onMarkerClick]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSpot, setActiveSpot] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 13.0418, lng: 80.2341 });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(() => {
    const saved = localStorage.getItem('availableBalance');
    return saved ? parseFloat(saved) : 0;
  });

  // Auto Top-up State
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(() => {
    const saved = localStorage.getItem('autoTopUpEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });

  // Toggle Auto Top-up
  const toggleAutoTopUp = () => {
    const newValue = !autoTopUpEnabled;
    setAutoTopUpEnabled(newValue);
    localStorage.setItem('autoTopUpEnabled', JSON.stringify(newValue));
  };

  // Top Up Modal state
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const timerIntervalRef = useRef(null);

  // Handlers for Top Up Modal
  const handleOpenTopUpModal = () => {
    setIsTopUpModalOpen(true);
  };

  const handleCloseTopUpModal = () => {
    setIsTopUpModalOpen(false);
  };

  const handleTopUpSuccess = (newBalance) => {
    setAvailableBalance(newBalance);
  };

  // Load current booking from localStorage
  const [currentBooking, setCurrentBooking] = useState(null);
  const [remainingTime, setRemainingTime] = useState({ hours: '00', minutes: '00', seconds: '00' });

  // Load vehicles from localStorage with fallback to default vehicles
  const [vehicles] = useState(() => {
    const saved = localStorage.getItem('userVehicles');
    return saved ? JSON.parse(saved) : [];
  });

  // Get logged in user from localStorage (check userProfile first, then loggedInUser)
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const userProfile = localStorage.getItem('userProfile');
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    
    if (userProfile) {
      return JSON.parse(userProfile);
    }
    if (loggedInUserStr) {
      return JSON.parse(loggedInUserStr);
    }
    return null;
  });

  // Fetch fresh user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) return;
        
        // Import parkingApi dynamically to avoid circular dependency
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
            avatar: user.avatar || '',
            role: 'user'
          };
          setLoggedInUser(userData);
          localStorage.setItem('userProfile', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('Failed to fetch user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  // Load booking history from localStorage
  const [bookingHistory, setBookingHistory] = useState(() => {
    const saved = localStorage.getItem('bookingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Get username for display
  const userName = loggedInUser?.name || 
    `${loggedInUser?.firstname || ''} ${loggedInUser?.lastname || ''}`.trim() ||
    (loggedInUser?.email ? loggedInUser.email.split('@')[0] : null) ||
    "UserGuest";

  // Redirect to auth when no user is logged in
  useEffect(() => {
    if (!loggedInUser) {
      navigate('/Auth');
    }
  }, [loggedInUser, navigate]);

  // Get user's membership plan
  const userPlan = loggedInUser?.plan || "basic";

  // Get plan display info
  const getPlanInfo = (plan) => {
    const plans = {
      basic: { name: "Free Plan", color: "text-slate-400", bgColor: "bg-slate-800" },
      pro: { name: "Pro Member", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
      max: { name: "Max Member", color: "text-purple-400", bgColor: "bg-purple-500/20" }
    };
    return plans[plan] || plans.basic;
  };

  const planInfo = getPlanInfo(userPlan);

  const defaultVehicle = vehicles.find(v => v.isDefault);

  useEffect(() => {
    const savedBooking = localStorage.getItem('currentBooking');
    if (savedBooking) {
      setCurrentBooking(JSON.parse(savedBooking));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userVehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (!currentBooking || !currentBooking.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(currentBooking.expiresAt).getTime();
      const difference = expiresAt - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setRemainingTime({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
        });

      } else {
        // Timer expired
        setRemainingTime({ hours: '00', minutes: '00', seconds: '00' });

        const completedBooking = {
          id: Date.now(),
          title: currentBooking.title,
          zone: currentBooking.zone,
          spot: currentBooking.spot,
          amount: currentBooking.amount,
          duration: currentBooking.duration,
          createdAt: new Date().toISOString(),
        };

        const updatedHistory = [...bookingHistory, completedBooking];

        localStorage.setItem("bookingHistory", JSON.stringify(updatedHistory));
        setBookingHistory(updatedHistory);

        localStorage.removeItem("currentBooking");
        setCurrentBooking(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    timerIntervalRef.current = interval;

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };

  }, [currentBooking, bookingHistory]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          setMapCenter({ lat, lng });
        },
        (error) => {
          console.error('Location Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const handleMarkerClick = (spot) => {
    setActiveSpot(spot.id);
    setMapCenter({ lat: spot.lat, lng: spot.lng });
  };

  // Use the new @react-google-maps/api library
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const renderTimeBlock = (value, unit, highlight = false) => (
    <div className="text-center">
      <div className={`text-2xl md:text-4xl font-bold w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full border-2 transition-all ${highlight ? 'border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-800 text-slate-500'}`}>
        {value}
      </div>
      <p className="text-[8px] md:text-[10px] text-slate-500 mt-3 tracking-widest font-bold">{unit}</p>
    </div>
  );

  const renderVehicleRow = (name, plate, active = false) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl mb-3 border transition-all ${active ? 'bg-cyan-900/10 border-cyan-500/30 shadow-[0_5px_15px_rgba(0,0,0,0.2)]' : 'bg-[#0d1616] border-white/5'}`}>
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-slate-800/50 rounded-lg"><Car size={20} className={active ? "text-cyan-400" : "text-gray-300"} /></div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-slate-500 font-mono tracking-tighter">{plate}</p>
        </div>
      </div>
      {active && <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></div>}
    </div>
  );

  const renderBookingRow = (location, time, price) => (
    <div className="flex items-center justify-between mb-6 group cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors"><History size={18} /></div>
        <div>
          <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{location}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>
      <span className="font-bold text-sm text-cyan-400">{price}</span>
    </div>
  );

  const isSessionActive =
    currentBooking &&
    currentBooking.expiresAt &&
    new Date(currentBooking.expiresAt).getTime() > Date.now();

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (currentBooking) {
      // Complete booking as expired
      const completedBooking = {
        id: Date.now(),
        title: currentBooking.title,
        zone: currentBooking.zone,
        spotNumber: currentBooking.spotNumber,
        amount: currentBooking.amount,
        duration: currentBooking.duration,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [...bookingHistory, completedBooking];
      localStorage.setItem("bookingHistory", JSON.stringify(updatedHistory));
      setBookingHistory(updatedHistory);

      // Clear current booking
      localStorage.removeItem("currentBooking");
      setCurrentBooking(null);
      setRemainingTime({ hours: '00', minutes: '00', seconds: '00' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 transition-all duration-300 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search for parking..."
              className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
            <NotificationBox />
            <div 
              className="flex items-center space-x-3 pl-4 border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-xl p-2 -m-2 transition-all"
              onClick={() => navigate('/UserDetailView')}
            >
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-white leading-none mb-1">{userName}</p>
                <p className={`text-xs font-bold leading-none ${planInfo.color}`}>{planInfo.name}</p>
              </div>
              <img src={loggedInUser?.avatar || "https://i.pravatar.cc/150?u=alex"} className="size-10 rounded-xl border border-white/10 shadow-lg" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Welcome Text */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Welcome back, {userName}</h2>
            <p className="text-slate-500 text-sm font-medium">
              {defaultVehicle
                ? <>Your {defaultVehicle.name} is currently parked in <span className="text-cyan-400">
                  {currentBooking ? `Zone ${currentBooking.zone}` : "No Active Zone"}
                </span>.</>
                : "No default vehicle selected."}
            </p>
          </div>
          <button onClick={() => navigate('/MapView')} className="w-full md:w-auto bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center space-x-3 hover:bg-cyan-400 transition-all shadow-[0_10px_20px_rgba(6,224,249,0.2)] active:scale-95 group">
            <MapIcon size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Find New Parking</span>
          </button>
        </div>

        {/* TOP GRID: Session & Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Active Session Card */}
          <div className="lg:col-span-2 bg-[#121e1e] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Decorative Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -z-0"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Clock size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Session</span>
              </div>
              {isSessionActive && (
                <span className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Active Now</span>
                </span>
              )}
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-between gap-10 relative z-10">
              <div className="flex space-x-4 md:space-x-8 items-center">
                {renderTimeBlock(remainingTime.hours, "HOURS")}
                <span className="text-3xl text-slate-800 font-light">:</span>
                {renderTimeBlock(remainingTime.minutes, "MINUTES")}
                <span className="text-3xl text-slate-800 font-light">:</span>
                {renderTimeBlock(remainingTime.seconds, "SECONDS", true)}

              </div>

              <div className="text-center xl:text-left w-full xl:w-1/3">
                <h3 className="text-xl font-black text-white mb-2">
                  {currentBooking?.title || "No Active Parking"}
                </h3>

                <p className="text-slate-400 text-sm mb-8 flex items-center justify-center xl:justify-start gap-2">
                  <Navigation size={16} className="text-cyan-400" />
                  {currentBooking
                    ? `Zone ${currentBooking.zone}, Spot ${currentBooking.spot}`
                    : "No active session"}
                </p>

                <div className="flex space-x-3 mb-3">
                  <button
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                    onClick={() => {
                      if (currentBooking && currentBooking.lat && currentBooking.lng) {
                        const destination = `${currentBooking.lat},${currentBooking.lng}`;
                        const currentLoc = currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : null;
                        const url = currentLoc
                          ? `https://www.google.com/maps/dir/?api=1&origin=${currentLoc}&destination=${destination}`
                          : `https://www.google.com/maps/search/?api=1&query=${destination}`;
                        window.open(url, '_blank');
                      } else {
                        alert('No active booking location available for directions.');
                      }
                    }}
                  >
                    Directions
                  </button>
                  <button
                    className="flex-1 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 px-6 py-3 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                    onClick={() => {
                      if (currentBooking) {
                        const hours = prompt('Enter additional hours (1-12):', '1');
                        if (hours && !isNaN(hours) && hours > 0 && hours <= 12) {
                          const currentExpiresAt = new Date(currentBooking.expiresAt).getTime();
                          const newExpiresAt = new Date(currentExpiresAt + (hours * 60 * 60 * 1000));
                          const updatedBooking = {
                            ...currentBooking,
                            expiresAt: newExpiresAt.toISOString(),
                            extendedHours: (currentBooking.extendedHours || 0) + parseInt(hours)
                          };
                          localStorage.setItem('currentBooking', JSON.stringify(updatedBooking));
                          setCurrentBooking(updatedBooking);
                          alert(`Parking extended by ${hours} hour(s)!`);
                        } else if (hours) {
                          alert('Please enter a valid number between 1 and 12 hours.');
                        }
                      } else {
                        alert('No active parking session to extend.');
                      }
                    }}
                  >
                    Extend
                  </button>
                </div>
                {isSessionActive && (
                  <button
                    onClick={stopTimer}
                    className="w-full bg-red-500/90 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-[0_5px_15px_rgba(239,68,68,0.3)] active:scale-95 uppercase text-xs tracking-widest"
                  >
                    End Session Early
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-[#121e1e] rounded-[2.5rem] p-8 md:p-10 border border-white/5 flex flex-col justify-between group shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-0"></div>

            <div className="flex justify-between items-center relative z-10">
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Available Balance</span>
              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:text-cyan-400 transition-colors">
                <Wallet size={20} />
              </div>
            </div>
            <div className="my-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">₹{availableBalance.toLocaleString()}</h2>
            </div>

            {/* Auto Top-up Toggle Section */}
            <div className="mb-8 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">Automatic Top-up</p>
                <button
                  onClick={toggleAutoTopUp}
                  className={`w-14 h-7 rounded-full transition-colors relative flex-shrink-0 ${autoTopUpEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${autoTopUpEnabled ? 'translate-x-7' : ''}`} />
                </button>
              </div>
            </div>

            <button
              className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95 shadow-xl relative z-10 uppercase text-xs tracking-widest"
              onClick={handleOpenTopUpModal}
            >
              + Top Up Wallet
            </button>
          </div>
        </div>

        {/* BOTTOM GRID: Vehicles & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#121e1e] rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-white text-lg tracking-tight">My Vehicles</h3>
              <button className="text-cyan-400 text-xs font-black uppercase tracking-widest hover:underline transition-all">Add New</button>
            </div>
            <div className="custom-scrollbar">
              {vehicles.map(vehicle => renderVehicleRow(vehicle.name, vehicle.plate, vehicle.status === 'Parked'))}
              {vehicles.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  <p className="mb-4">No vehicles added yet.</p>
                  <button onClick={() => navigate('/Vehicles')} className="bg-cyan-500 text-black px-6 py-3 rounded-2xl font-bold hover:bg-cyan-400 transition-all uppercase tracking-widest">
                    Add Sample Vehicles
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#121e1e] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-xl flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-white text-lg tracking-tight">Recent Activity</h3>
                <div
                  className="p-2 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => navigate('/History')}
                >
                  <Navigation size={14} className="rotate-90 text-slate-500" />
                </div>
              </div>
              <div className="space-y-2">
                {bookingHistory && bookingHistory.length > 0 ? (
                  bookingHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((booking, index) =>
                      renderBookingRow(
                        booking.title || "Parking",
                        `${formatDate(booking.createdAt)}, ${booking.duration || ""}`,
                        `- ₹${booking.amount || 0}`
                      )
                    )
                ) : (
                  <div className="text-center text-slate-500 py-6">
                    <p className="text-sm">No recent activity yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Map Preview Widget */}
            <div className="w-full md:w-[45%] h-64 md:h-full bg-[#0d1616] rounded-3xl relative overflow-hidden border border-cyan-500/20 group cursor-crosshair shadow-inner">
              {loadError ? (
                <div className="flex items-center justify-center h-full text-slate-500">Error loading map</div>
              ) : !isLoaded ? (
                <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ height: '100%', width: '100%' }}
                  center={mapCenter}
                  zoom={13}
                  options={{
                    styles: darkMapStyles,
                    disableDefaultUI: true,
                    zoomControl: false,
                    streetViewControl: false,
                    backgroundColor: '#0b1414',
                  }}
                >
                  <Map center={mapCenter} zoom={13} spots={CHENNAI_SPOTS} currentLocation={currentLocation} activeSpot={activeSpot} onMarkerClick={handleMarkerClick} />
                </GoogleMap>
              )}
            </div>
          </div>
        </div>

        {/* Custom Internal Scrollbar Styling */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #162a2d; border-radius: 10px; }
        `}</style>
      </main>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={handleCloseTopUpModal}
        currentBalance={availableBalance}
        onSuccess={handleTopUpSuccess}
      />

      {/* OpenClaw Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;
