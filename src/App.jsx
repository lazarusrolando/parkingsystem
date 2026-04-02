import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router';

import './App.css';
import { ToastProvider } from './components/Toast';
import { sendChat } from './api/parkingApi';
import Hero from './components/Hero'
import About from './components/About'
import Contact from './components/Contact'
import HowItWorks from './components/HowItWorks'
import Booking from './components/Booking'
import Features from './components/Features'
import FAQ from './components/FAQ'
import Pricing from './components/Pricing'
import AdminDashboard from './components/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import MyBookings from './components/MyBookings'
import Auth from './components/Auth'
import ForgotPassword from './components/ForgotPassword'
import Blog from './components/Blog'
import MapView from './components/MapView'
import WalletView from './components/Wallet';
import ParkingHistory from './components/History';
import Vehicles from './components/Vehicles'
import SettingsPage from './components/Settings';
import Logout from './components/Logout';
import SmartParkingDashboard from './components/ParkingSlots';
import SupportTicket from './components/SupportTicket';
import HelpDesk from './components/HelpDesk';
import UserManagement from './components/UserManagement';
import UserDetailView from './components/UserDetailView';
import SettingsHub from './components/SettingsHub';
import Revenue from './components/Revenue';
import SystemLogs from './components/SystemLogs';
import Analytics from './components/Analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#080d0d',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>An error occurred while loading this page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#06e0f9',
              color: '#000',
              fontWeight: 'bold',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isSpsOpen, setIsSpsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);

  const toggleSpsBox = () => {
    setIsSpsOpen((prev) => !prev);
  };

  const handleSendMessage = async () => {
    const question = chatInput.trim();
    if (!question) {
      return;
    }

    setIsSending(true);
    setChatError(null);

    try {
      const res = await sendChat(question);
      const answer = res.answer || 'Sorry, I could not get a response.';
      setChatHistory((prev) => [...prev, { role: 'user', text: question }, { role: 'sps', text: answer }]);
      setChatInput('');
    } catch (err) {
      setChatError(err.message || 'Chat service error');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider />
        <div className="App">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/HowItWorks" element={<HowItWorks />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Booking" element={<Booking />} />
            <Route path="/Pricing" element={<Pricing />} />
            <Route path="/Features" element={<Features />} />
            <Route path='/Auth' element={<Auth />} />

            <Route path='/ForgotPassword' element={<ForgotPassword />} />
            <Route path='/AdminDashboard' element={<AdminDashboard />} />
            <Route path='/UserDashboard' element={<UserDashboard />} />
            <Route path='/MyBookings' element={<MyBookings />} />
            <Route path="/FAQ" element={<FAQ />} />
            <Route path="/Blog" element={<Blog />} />
            <Route path='/MapView' element={<MapView />} />
            <Route path="/Wallet" element={<WalletView />} />
            <Route path='/History' element={<ParkingHistory />} />
            <Route path='/SmartParkingDashboard' element={<SmartParkingDashboard />} />
            <Route path='/ParkingSlots' element={<SmartParkingDashboard />} />
            <Route path='/SupportTicket' element={<SupportTicket />} />
            <Route path='/HelpDesk' element={<HelpDesk />} />
            <Route path='/UserManagement' element={<UserManagement />} />
            <Route path='/UserDetailView' element={<UserDetailView />} />
            <Route path='/Vehicles' element={<Vehicles />} />
            <Route path="/Settings" element={<SettingsPage />} />
            <Route path='/SettingsHub' element={<SettingsHub />} />
            <Route path='/Revenue' element={<Revenue />} />
            <Route path='/SystemLogs' element={<SystemLogs />} />
            <Route path="/Logout" element={<Logout />} />
            <Route path="/Analytics" element={<Analytics />} />
          </Routes>

          <div className={`ask-sps-chat-box ${isSpsOpen ? 'open' : ''}`} role="dialog" aria-label="Ask SPS Chat">
            <div className="ask-sps-chat-header">
              <img src="/sps.png" alt="SPS" className="ask-sps-logo" />
              <div>
                <strong>Ask SPS</strong>
              </div>
              <button className="ask-sps-close" onClick={toggleSpsBox}>×</button>
            </div>
            <div className="ask-sps-chat-content">
              <div className="ask-sps-history">
                {chatHistory.length === 0 ? (
                  <p className="ask-sps-hint">Ask any question about the parking system.</p>
                ) : (
                  chatHistory.map((item, index) => (
                    <div key={index} className={`ask-sps-message ask-sps-message-${item.role}`}>
                      <strong>{item.role === 'user' ? 'You' : 'SPS'}</strong>
                      <p>{item.text}</p>
                    </div>
                  ))
                )}
              </div>
              {chatError && <p className="ask-sps-error">{chatError}</p>}
              <textarea
                className="ask-sps-textarea"
                rows="4"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="ask-sps-send-button" onClick={handleSendMessage} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          <button className="ask-sps-button" onClick={toggleSpsBox}>
            <img src="/sps.png" alt="SPS Icon" />
            <span>Ask <span className='t'>SPS</span></span>
          </button>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;