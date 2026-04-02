import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Search, Navigation } from 'lucide-react';
import Navbar from './Navbar';

// Error Boundary Component
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MapView Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full bg-[#080d0d] text-slate-300 font-sans overflow-hidden items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-red-500 text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-slate-400 mb-4">Unable to load the map. Please check your internet connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-4 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const CHENNAI_SPOTS = [
  {
    id: 1,
    title: "GCC Multilevel Parking",
    price: 200,
    address: "Pondy Bazaar, T. Nagar",
    tags: ['EV', 'Automated'],
    isBest: true,
    img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200",
    rating: 4.8,
    reviews: 1240,
    lat: 13.040262,
    lng: 80.239652
  },
  {
    id: 2,
    title: "Express Avenue Mall",
    price: 400,
    address: "Royapettah",
    tags: ['Valet', 'Covered'],
    img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200",
    rating: 4.5,
    reviews: 3100,
    lat: 13.058454,
    lng: 80.264184
  },
  {
    id: 3,
    title: "Spencer Plaza Lot",
    price: 300,
    address: "Anna Salai",
    tags: ['24/7'],
    img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200",
    rating: 3.9,
    reviews: 850,
    lat: 13.061406,
    lng: 80.261302
  },
  {
    id: 4,
    title: "Chennai Central CMRL",
    price: 250,
    address: "Park Town",
    tags: ['Metro', 'Security'],
    img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200",
    rating: 4.2,
    reviews: 520,
    lat: 13.081717,
    lng: 80.273681
  },
  {
    id: 5,
    title: "VR Chennai Parking",
    price: 400,
    address: "Anna Nagar West",
    tags: ['Luxury', 'EV'],
    img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200",
    rating: 4.7,
    reviews: 2100,
    lat: 13.080546,
    lng: 80.197132
  },
  {
    id: 6,
    title: "Tower Park Public Lot",
    price: 200,
    address: "Anna Nagar",
    tags: ['Open'],
    img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200",
    rating: 4.1,
    reviews: 430,
    lat: 13.086434,
    lng: 80.214702
  },
  {
    id: 7,
    title: "Phoenix Marketcity",
    price: 400,
    address: "Velachery Main Rd",
    tags: ['Valet', 'Covered'],
    img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200",
    rating: 4.6,
    reviews: 4500,
    lat: 12.993020,
    lng: 80.217909
  },
  {
    id: 8,
    title: "Grand Square Mall",
    price: 200,
    address: "Velachery-Tambaram Rd",
    tags: ['Budget'],
    img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200",
    rating: 4.3,
    reviews: 890,
    lat: 12.971972,
    lng: 80.220398
  },
  {
    id: 9,
    title: "Besant Nagar Beach Lot",
    price: 200,
    address: "Elliot's Beach",
    tags: ['Open'],
    img: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200",
    rating: 4.0,
    reviews: 2100,
    lat: 13.000388,
    lng: 80.271054
  },
  {
    id: 10,
    title: "Marina Mall OMR",
    price: 300,
    address: "Egattur",
    tags: ['CCTV'],
    img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200",
    rating: 4.4,
    reviews: 1200,
    lat: 12.835735,
    lng: 80.228920
  },
  {
    id: 11,
    title: "Tidel Park Parking",
    price: 300,
    address: "Tharamani",
    tags: ['Corporate'],
    img: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200",
    rating: 4.1,
    reviews: 670,
    lat: 12.989573,
    lng: 80.248598
  }
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



const Map = ({ map, spots, currentLocation, activeSpot, activeSpotData, onMarkerClick, mapCenter }) => {
  const polylinesRef = useRef([]);


  useEffect(() => {
    if (!map || !currentLocation || !activeSpotData) return;

    // Clear all previous routes
    polylinesRef.current.forEach(polyline => polyline?.setMap(null));
    polylinesRef.current = [];

    // Fetch route using JSONP to bypass CORS
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const callbackName = `jsonpCallback_${Date.now()}`;

    // Create a script tag for JSONP
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

const MapView = () => {
  const [activeSpot, setActiveSpot] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.0418, lng: 80.2341 });
  const [mapInstance, setMapInstance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter spots based on search query
  const filteredSpots = CHENNAI_SPOTS
    .filter(spot =>
      spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(spot => {
      let dynamicDistance = spot.distance;

      if (currentLocation) {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          spot.lat,
          spot.lng
        );

        dynamicDistance = `${distance.toFixed(2)} km`;
      }

      return { ...spot, distance: dynamicDistance };
    });

  const activeSpotData = filteredSpots.find(s => s.id === activeSpot);

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

  const handleMarkerClick = (marker) => {
    if (marker.spotId) {
      setActiveSpot(marker.spotId);
      setMapCenter(marker.position);
    }
  };

  // Use the new @react-google-maps/api library
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
    <div className="flex h-screen w-full bg-[#080d0d] text-slate-300 font-sans overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #162a2d; border-radius: 10px; }
      `}</style>

      <Navbar />

      {/* LISTING PANEL */}
      <div className="w-80 lg:w-[400px] border-r border-white/5 bg-[#0b1414] z-20 flex flex-col">
        <div className="p-6">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              placeholder="Where are you going?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162a2d]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600 text-white"
            />
          </div>

          <button
            onClick={handleLocateMe}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2.5 rounded-2xl transition-all mb-6"
          >
            📍 Locate Me
          </button>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold text-lg">Nearby Spots</h2>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {filteredSpots.map(spot => (
              <div
                key={spot.id}
                onClick={() => { setActiveSpot(spot.id); setMapCenter({ lat: spot.lat, lng: spot.lng }); }}
                className={`group flex gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${activeSpot === spot.id
                  ? 'bg-[#162a2d] border-cyan-500/40 shadow-lg'
                  : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.08]'
                  }`}
              >
                <img src={spot.img} className="size-16 rounded-xl object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold text-sm truncate">{spot.title}</h3>
                    <span className="text-cyan-400 font-black text-sm">₹{spot.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-1">{spot.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-400 uppercase font-bold tracking-tighter">
                      {spot.distance}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-bold">
                      ★ {spot.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 relative">
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

        {activeSpotData && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-[#0b1414]/80 backdrop-blur-xl border border-white/10 p-3 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between mb-2">
              <div>
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

            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-2.5 rounded-2xl transition-all shadow-[0_10px_20px_rgba(6,224,249,0.3)] flex items-center justify-center gap-2">
              BOOK THIS SPACE NOW
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default function MapViewWrapper(props) {
  return (
    <MapErrorBoundary>
      <MapView {...props} />
    </MapErrorBoundary>
  );
}
