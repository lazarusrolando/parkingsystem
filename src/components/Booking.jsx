import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation } from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Header from './Header';
import Footer from './Footer';
import { notifySlotBooked, notifyPaymentSuccessful, notifyPaymentDeclined } from '../utils/notificationUtils';

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

const MyBookings = () => {
  const navigate = useNavigate();
  const [activeSpot, setActiveSpot] = useState(CHENNAI_SPOTS[0]);
  const activeSpotData = CHENNAI_SPOTS.find(spot => spot.id === activeSpot);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 13.0418, lng: 80.2341 });
  const [mapInstance, setMapInstance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);


  const filteredSpots = useMemo(() =>
    CHENNAI_SPOTS.filter(spot =>
      spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const SpotCard = ({ spot }) => (
    <div
      onClick={() => setActiveSpot(spot.id)}
      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group 
        ${activeSpot.id === spot.id
          ? 'bg-gradient-to-r from-[#162a2d] to-[#102123] border-[#06e0f9]/40 shadow-[0_0_15px_rgba(6,224,249,0.1)]'
          : 'bg-[#102123] border-transparent hover:border-[#21464a] hover:bg-[#162a2d]'}`}
    >
      <div className="relative shrink-0">
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-14" style={{ backgroundImage: `url(${spot.img})` }} />
        {spot.isBest && (
          <div className="absolute -top-2 -left-2 bg-[#06e0f9] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className={`text-sm font-bold truncate ${activeSpot.id === spot.id ? 'text-[#06e0f9]' : 'text-white'}`}>{spot.title}</h3>
          <span className="text-[#06e0f9] font-bold text-sm">₹{spot.price}<span className="text-[10px] text-[#8ec6cc] font-normal">/hr</span></span>
        </div>
        <p className="text-[#8ec6cc] text-[10px] truncate">{spot.distance} • {spot.address}</p>
      </div>
    </div>
  );

  // Function to handle booking
  const handleBooking = () => {
    if (!activeSpotData) return;

    // Simulate payment processing with random success/failure (20% chance of failure)
    const paymentSuccess = Math.random() > 0.2;

    if (!paymentSuccess) {
      // Payment declined - notify user
      notifyPaymentDeclined({
        amount: activeSpotData.price * 2, // 2 hours default
        description: `Parking at ${activeSpotData.title}`
      });
      alert('Payment declined! Please try again or use a different payment method.');
      return;
    }

    // Generate a random zone and spot number for the booking
    const zone = `B${Math.floor(Math.random() * 3) + 1}`;
    const spotNumber = Math.floor(Math.random() * 500) + 100;
    const totalAmount = activeSpotData.price * 2; // 2 hours default

    // Create booking data object
    const bookingData = {
      id: Date.now(),
      spotId: activeSpotData.id,
      title: activeSpotData.title,
      address: activeSpotData.address,
      price: activeSpotData.price,
      zone: zone,
      spotNumber: spotNumber,
      bookedAt: new Date().toISOString(),
      duration: 2, // Default 2 hours
      amount: totalAmount,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    };

    // Save to localStorage
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));

    // Add to booking history as upcoming
    const historyEntry = {
      ...bookingData,
      status: 'Upcoming',
      completedAt: null
    };
    let history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    history.unshift(historyEntry); // Add to beginning
    localStorage.setItem('bookingHistory', JSON.stringify(history));

    // Notify slot booked
    notifySlotBooked(bookingData);

    // Notify payment successful
    notifyPaymentSuccessful({
      amount: totalAmount,
      type: 'deducted',
      description: `Parking at ${activeSpotData.title}`
    });

    // Navigate to dashboard
    navigate('/UserDashboard');
  };

const Map = ({ map, spots, currentLocation, activeSpot, activeSpotData, onMarkerClick, mapCenter }) => {
  const polylinesRef = useRef([]);


  useEffect(() => {
    if (!map || !currentLocation || !activeSpotData) return;

    // Clear all previous routes
    polylinesRef.current.forEach(polyline => polyline?.setMap(null));
    polylinesRef.current = [];

    // Fetch route using JSONP to bypass CORS
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const callbackName = `jsonpCallback_${Date.now()}`;

    const script = document.createElement('script');

    // Create global callback function
    window[callbackName] = (data) => {
      if (data.routes && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);

        const newPolyline = new window.google.maps.Polyline({
          path: points,
          geodesic: true,
          strokeColor: '#00e5ff',
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map: map,
        });
        polylinesRef.current.push(newPolyline);
        console.log('✅ Road route displayed successfully');
      }
      // Cleanup
      script.remove();
      delete window[callbackName];
    };

    script.onerror = () => {
      console.error('JSONP request failed');
      // Fallback to direct line
      const fallbackPolyline = new window.google.maps.Polyline({
        path: [currentLocation, { lat: activeSpotData.lat, lng: activeSpotData.lng }],
        geodesic: true,
        strokeColor: '#00e5ff',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: map,
      });
      polylinesRef.current.push(fallbackPolyline);
      script.remove();
      delete window[callbackName];
    };

    script.src = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.lat},${currentLocation.lng}&destination=${activeSpotData.lat},${activeSpotData.lng}&mode=driving&key=${apiKey}&callback=${callbackName}`;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      polylinesRef.current.forEach(polyline => polyline?.setMap(null));
      polylinesRef.current = [];
      if (script.parentNode) script.remove();
    };
  }, [map, currentLocation, activeSpotData]);

    // Decode Google's polyline format
    const decodePolyline = (encoded) => {
      const inv = 1.0 / 1e5;
      const decoded = [];
      let previous = [0, 0];
      let i = 0;

      while (i < encoded.length) {
        const ll = [0, 0];
        for (const j of [0, 1]) {
          let shift = 0;
          let result = 0;
          let byte;
          do {
            byte = encoded.charCodeAt(i++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
          } while (byte >= 0x20);
          ll[j] = previous[j] + (result & 1 ? ~(result >> 1) : result >> 1);
          previous[j] = ll[j];
        }
        decoded.push({ lat: ll[0] * inv, lng: ll[1] * inv });
      }
      return decoded;
    };

    useEffect(() => {
      if (map) {
        map.setCenter(mapCenter);
      }
    }, [mapCenter, map]);

    useEffect(() => {
      if (map) {
        const markers = [];

        if (currentLocation) {
          const currentMarker = new window.google.maps.Marker({
            position: currentLocation,
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#00ff00',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 8,
              anchor: new window.google.maps.Point(0, 0)
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
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: activeSpot === spot.id ? '#ff4d4d' : '#06e0f9',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 6,
              anchor: new window.google.maps.Point(0, 0)
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

        // Store markers for cleanup if needed
        return () => {
          markers.forEach(marker => marker.setMap(null));
        };
      }
    }, [map, spots, currentLocation, activeSpot, onMarkerClick]);

    return null;
  };

  const handleMarkerClick = (marker) => {
    if (marker.spotId) {
      setActiveSpot(marker.spotId);
      setMapCenter(marker.position);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      alert("Geolocation is not supported by this browser. Showing default location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCurrentLocation({ lat, lng });
        setMapCenter({ lat, lng });

        console.log("SUCCESS:", lat, lng);
      },
      err => {
        console.error("ERROR:", err.code, err.message);
        alert(`Geolocation failed: ${err.message}. Showing default location.`);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    handleLocateMe();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return <div>Error loading map</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }


  return (
    <>
      <Header />
      <div className="bg-[#081212] text-white font-['Manrope'] overflow-hidden h-screen flex">
        <main className="flex-1 flex overflow-hidden relative">
          {/* Sidebar */}
          <aside className="w-[380px] flex flex-col bg-[#0f2123] border-r border-[#21464a] z-10 shrink-0 shadow-2xl relative h-full">
            <div className="p-6 pb-2">
              <h2 className="text-white text-xl font-bold mb-4">Parking in Chennai</h2>
              <div className="relative w-full mb-4">
                <div className="flex w-full items-center rounded-full bg-[#162a2d] border border-[#21464a] focus-within:border-[#06e0f9]/50 transition-all h-10">
                  <Search size={16} className="text-[#8ec6cc] ml-4" />
                  <input
                    className="w-full bg-transparent border-none text-white placeholder:text-[#8ec6cc] focus:ring-0 px-3 text-sm"
                    placeholder="Search areas (e.g. T Nagar, Adyar)..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 custom-scrollbar">
              <p className="text-[10px] text-[#8ec6cc] uppercase tracking-wider font-bold px-2">{filteredSpots.length} spots found</p>
              {filteredSpots.map(spot => <SpotCard key={spot.id} spot={spot} />)}
            </div>
          </aside>

          {/* Map View */}
          <main className="flex-1 relative">
            <div className="h-full w-full bg-[#0f2123] flex items-center justify-center text-white">
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={mapCenter}
                zoom={13}
                onLoad={(map) => setMapInstance(map)}
                options={{
                  styles: darkMapStyles,
                  mapTypeId: 'roadmap',
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: true,
                  streetViewControl: true,
                  fullscreenControl: true,
                  backgroundColor: '#0b1414',
                  gestureHandling: 'greedy',
                }}
              >
                {mapInstance && (
                  <Map
                    map={mapInstance}
                    spots={filteredSpots}
                    currentLocation={currentLocation}
                    activeSpot={activeSpot}
                    activeSpotData={activeSpotData}
                    onMarkerClick={handleMarkerClick}
                    mapCenter={mapCenter}
                  />
                )}
              </GoogleMap>
            </div>

            {/* BOTTOM FLOATING ACTION CARD */}
            {activeSpotData && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-[#0b1414]/90 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-black text-base">{activeSpotData.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 italic">{activeSpotData.address}</p>
                </div>
                <div className="size-8 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Navigation size={18} />
                </div>
              </div>

                <div className="grid grid-cols-3 gap-1 mb-3">
                  <div className="bg-white/5 p-1.5 rounded-2xl text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Price</p>
                    <p className="text-white font-bold text-sm">₹{activeSpotData.price}/h</p>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-2xl text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Distance</p>
                    <p className="text-white font-bold text-sm">{activeSpotData.distance}</p>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-2xl text-center">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Rating</p>
                    <p className="text-white font-bold text-sm">{activeSpotData.rating} ★</p>
                  </div>
                </div>

                <button onClick={handleBooking} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-2.5 rounded-2xl transition-all shadow-[0_10px_20px_rgba(6,224,249,0.3)] flex items-center justify-center gap-2">
                  BOOK THIS SPACE NOW
                </button>
              </div>
            )}
          </main>
        </main>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #21464a; border-radius: 10px; }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

export default MyBookings;