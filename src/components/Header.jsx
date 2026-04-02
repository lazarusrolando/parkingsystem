import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../sps.png';
import './Header.css';

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Load user data from localStorage on mount and listen for storage changes
    useEffect(() => {
      const loadUser = () => {
        try {
          const adminProfile = localStorage.getItem('adminProfile');
          const userProfile = localStorage.getItem('userProfile');
          const loggedInUser = localStorage.getItem('loggedInUser');
          
          // Priority: adminProfile > userProfile > loggedInUser
          if (adminProfile) {
            const parsedAdmin = JSON.parse(adminProfile);
            setUser(parsedAdmin);
            setIsAdmin(true);
            setDisplayName(parsedAdmin.fullName || parsedAdmin.name || 'Admin');
            console.log('Loaded admin profile:', parsedAdmin);
          } else if (userProfile) {
            const parsedUser = JSON.parse(userProfile);
            setUser(parsedUser);
            setIsAdmin(false);
            setDisplayName(parsedUser.name || 'User');
            console.log('Loaded user profile:', parsedUser);
          } else if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            // Determine if admin based on email domain
            const isAdmin = parsedUser.email?.endsWith('@sps.com') || parsedUser.role === 'admin';
            setUser(parsedUser);
            setIsAdmin(isAdmin);
            const name = parsedUser.firstname 
              ? `${parsedUser.firstname} ${parsedUser.lastname || ''}`.trim()
              : parsedUser.name || parsedUser.email?.split('@')[0] || 'User';
            setDisplayName(name);
            console.log('Loaded logged in user:', parsedUser);
          } else {
            setUser(null);
            setIsAdmin(false);
            setDisplayName('');
            console.log('No user/admin in localStorage');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
          setIsAdmin(false);
          setDisplayName('');
        } finally {
          setLoading(false);
        }
      };

      loadUser();

      // Listen for storage changes (e.g., login in another tab)
      const handleStorageChange = (e) => {
        if (e.key === 'adminProfile' || e.key === 'userProfile' || e.key === 'loggedInUser') {
          loadUser();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isDropdownOpen]);

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    
    const handleLogout = () => {
        setIsDropdownOpen(false);
        // Clear all auth-related storage
        localStorage.removeItem('parkingAuthToken');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('adminProfile');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userVehicles');    
        localStorage.removeItem('currentBooking');
        localStorage.removeItem('bookingHistory');
        setUser(null);
        setIsAdmin(false);
        setDisplayName('');
        navigate('/Auth');
    };

    return (
        <header className="appHeader">
            {/* Left Navigation */}
            <nav className="left-nav">
                <ul className="navbar-nav">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/Booking">Booking</Link></li>
                    <li><Link to="/HowItWorks">How it works</Link></li>
                    <li><Link to="/Features">Features</Link></li>
                </ul>
            </nav>

            {/* Logo Section */}
            <div className="logoContainer">
                <Link to="/">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
                <span className="full-text">Smart Parking System</span>
                <span className="short-text">SPS</span>
            </div>

            {/* Right Navigation */}
            <nav className="right-nav">
                <ul className="navbar-nav">
                    <li><Link to="/Pricing">Pricing</Link></li>
                    <li><Link to="/About">About</Link></li>
                    <li><Link to="/Contact">Contact</Link></li>
                    
                    {loading ? (
                        <li className="nav-loading">...</li>
                    ) : user ? (
                        <li className="profile-container" ref={dropdownRef}>
                            <div 
                                className="profile-trigger" 
                                onClick={toggleDropdown}
                                onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
                                role="button"
                                tabIndex={0}
                            >
                                <span className="user-name">{displayName}</span>
                                <img 
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=1e293b&color=00e5ff&size=236`} 
                                    alt="User Avatar" 
                                    className="avatar"
                                    onError={(e) => {
                                        console.log('Avatar load failed:', e.target.src);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxOSIgY3k9IjE5IiByPSIxOCIgZmlsbD0iI0U1RTdFQiIgc3Ryb2tlPSIjRDFEMTVEQiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGVsbGlwc2UgY3g9IjE5IiBjeT0iMTMiIHJ4PSI2IiByeT0iNyIgZmlsbD0iIzZCNzI4MCIvPjxwYXRoIGQ9Ik0xMiAyNEMxMiAyMS4yIDE1IDIwIDE5IDIwQzIzIDIwIDI2IDIxLjIgMjYgMjRDMjYgMjguNSAyMi41IDI5IDE5IDI5QzE1LjUgMjkgMTIgMjguNSAxMiAyNFoiIGZpbGw9IiM2QjcyODAiLz48L3N2Zz4=';
                                    }}
                                />
                            </div>
                            
                            {isDropdownOpen && (
                                <div className="dropdown-box">
                                    <div className="dropdown-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0, 229, 255, 0.2)' }}>
                                        <span style={{ fontSize: '0.7rem', color: isAdmin ? '#00e5ff' : '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {isAdmin ? '⚡ Admin' : '👤 User'}
                                        </span>
                                    </div>
                                    <ul className="navbar-nav">
                                        <li><Link to={isAdmin ? "/AdminDashboard" : "/UserDashboard"} onClick={() => setIsDropdownOpen(false)}>{isAdmin ? "Admin Dashboard" : "User Dashboard"}</Link></li>
                                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                                    </ul>
                                </div>
                            )}
                        </li>
                    ) : (
                        <li><Link to="/Auth" className="auth-link">Auth</Link></li>
                    )}
                </ul>
            </nav>

            {/* Mobile Nav Logic */}
            <nav className={`mobile-nav ${isOpen ? 'open' : ''}`}>
                 <ul className="mobile-navbar-nav">
                    <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
                    {user ? (
                        <>
                            <li><Link to={isAdmin ? "/AdminDashboard" : "/UserDashboard"} onClick={toggleMenu}>{isAdmin ? "Admin Dashboard" : "User Dashboard"}</Link></li>
                            <li><button onClick={handleLogout} className="mobile-logout">Logout</button></li>
                        </>
                    ) : (
                        <li><Link to="/Auth" onClick={toggleMenu}>Auth</Link></li>
                    )}
                 </ul>
            </nav>

            <button className="hamburger" onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </button>
        </header>
    );
}

export default Header;