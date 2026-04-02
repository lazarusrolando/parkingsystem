import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import Header from "./Header";
import Footer from "./Footer";
import parkingApi, { login, register, verifyOtp } from '../api/parkingApi';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailLower = email.toLowerCase();
    
    // Email domain validation based on login/register mode
    if (isLogin) {
      // Login mode - both admin (@sps.com) and user (@gmail.com) can login
      if (!emailLower.endsWith('@sps.com') && !emailLower.endsWith('@gmail.com')) {
        setError('Admin: use @sps.com | User: use @gmail.com');
        return;
      }
    } else {
      // Register mode - check which type based on email domain
      // Admin registration requires @sps.com
      // User registration requires @gmail.com
      if (!emailLower.endsWith('@sps.com') && !emailLower.endsWith('@gmail.com')) {
        setError('Admin: use @sps.com | User: use @gmail.com');
        return;
      }
    }

    try {
      setLoading(true);
      if (isLogin) {
        const result = await login(email, password);
        localStorage.setItem('parkingAuthToken', result.token);
        parkingApi.setToken(result.token);
        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
        
        // Determine role from email domain if not provided by backend
        const isAdmin = result.user.role === 'admin' || emailLower.endsWith('@sps.com');
        
        if (isAdmin) {
          const fullName = `${result.user.firstname || ''} ${result.user.lastname || ''}`.trim() || 
                          result.user.name ||
                          (result.user.email ? result.user.email.split('@')[0] : 'Admin');
          localStorage.setItem('adminProfile', JSON.stringify({
            fullName,
            email: result.user.email,
            phone: result.user.phone || '',
            staffId: result.user.id,
            firstname: result.user.firstname || '',
            lastname: result.user.lastname || '',
            role: 'admin'
          }));
          // Clear any user profile
          localStorage.removeItem('userProfile');
          navigate('/AdminDashboard');
        } else {
          // Regular user - set userProfile
          const userName = result.user.name || result.user.firstname || 
                          (result.user.email ? result.user.email.split('@')[0] : 'User');
          localStorage.setItem('userProfile', JSON.stringify({
            name: userName,
            role: 'user',
            ...result.user
          }));
          // Clear any admin profile
          localStorage.removeItem('adminProfile');
          navigate('/UserDashboard');
        }
      } else {
        // Registration
        const registerResult = await parkingApi.register(email, password, firstname, lastname, phone);
        if (registerResult.success) {
          setOtpMode(true);
          setOtpEmail(email);
          setError('OTP sent to backend console. Enter 6-digit code:');
          return;
        }
      }
    } catch (err) {
      console.error('Auth error', err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await verifyOtp(otpEmail, otp);
      localStorage.setItem('parkingAuthToken', result.token);
      parkingApi.setToken(result.token);
      localStorage.setItem('loggedInUser', JSON.stringify(result.user));
      
      // Determine role from email domain if not provided by backend
      const isAdmin = result.user.role === 'admin' || otpEmail.toLowerCase().endsWith('@sps.com');
      
      if (isAdmin) {
        const fullName = `${result.user.firstname || ''} ${result.user.lastname || ''}`.trim() || 
                        result.user.name ||
                        (result.user.email ? result.user.email.split('@')[0] : 'Admin');
        localStorage.setItem('adminProfile', JSON.stringify({
          fullName,
          email: result.user.email,
          phone: result.user.phone || '',
          staffId: result.user.id,
          firstname: result.user.firstname || '',
          lastname: result.user.lastname || '',
          role: 'admin'
        }));
        localStorage.removeItem('userProfile');
        navigate('/AdminDashboard');
      } else {
        // Regular user - set userProfile
        const userName = result.user.name || result.user.firstname || 
                        (result.user.email ? result.user.email.split('@')[0] : 'User');
        localStorage.setItem('userProfile', JSON.stringify({
          name: userName,
          role: 'user',
          ...result.user
        }));
        localStorage.removeItem('adminProfile');
        navigate('/UserDashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
  };

  if (otpMode) {
    return (
      <>
        <Header />
        <main className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(circle_at_2px_2px,rgba(6,224,249,0.05)_1px,transparent_0)] bg-[length:24px_24px] font-['Space_Grotesk']">
          <div className="w-full max-w-md bg-[#183235] rounded-xl p-8 shadow-2xl border border-[#2f646a]">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Verify OTP</h2>
            <p className="text-slate-400 text-sm mb-6 text-center">For {otpEmail}</p>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">OTP Code</label>
                <input
                  className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-4 pl-12 pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9]"
                  placeholder="123456"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm px-3 py-2 rounded-md bg-[#581c2c] border border-[#7b1f30]">
                  {error}
                </div>
              )}
              <button
                className="w-full bg-[#06e0f9] py-4 rounded-lg font-bold text-base text-[#0f2123] hover:shadow-[0_0_20px_rgba(6,224,249,0.4)] transition-all flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => {setOtpMode(false); setOtp(''); setError('');}}
                className="w-full text-[#06e0f9] py-2 text-sm hover:text-[#ccff00] transition-colors border-t border-[#2f646a] mt-4"
              >
                Back to Register
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(circle_at_2px_2px,rgba(6,224,249,0.05)_1px,transparent_0)] bg-[length:24px_24px] font-['Space_Grotesk']">

        {/* Abstract Background Glows - Adjusted for smaller viewports */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-[#06e0f9]/10 blur-[60px] md:blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-[#ccff00]/10 blur-[60px] md:blur-[120px] rounded-full -z-10"></div>

        {/* Central Card: Grid on desktop, Flex-col-reverse on mobile */}
        <div className="w-full max-w-[1000px] flex flex-col-reverse md:grid md:grid-cols-2 bg-[#183235] rounded-xl overflow-hidden shadow-2xl border border-[#2f646a] relative">

          {/* Visual Side (Bottom on Mobile) */}
          <div className="relative md:block overflow-hidden group border-t md:border-t-0 border-[#2f646a]">
            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-t from-[#0f2123] md:via-transparent via-[#0f2123]/80 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[#06e0f9]/10 mix-blend-overlay z-10"></div>

            <img
              alt="Smart Parking Facility"
              className="w-full h-40 md:h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-700"
              src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000"
            />

            {/* Visual Content */}
            <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10 z-20">
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <span className="p-1 md:p-1.5 bg-[#06e0f9]/20 rounded text-[#06e0f9]">
                  <span className="material-symbols-outlined text-xs md:text-sm">sensors</span>
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#06e0f9]">Live Optimization</span>
              </div>
              <h3 className="text-xl md:text-3xl font-bold text-slate-100 leading-tight">Advanced Infrastructure</h3>
              <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed max-w-xs hidden md:block">
                Real-time space detection, automated billing, and EV charging integration.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-12 flex flex-col justify-center">

            {/* Sliding Toggle Switch */}
            <div className="mb-6 md:mb-10 p-1 bg-[#0f2123]/50 border border-[#2f646a] rounded-xl flex items-center relative h-12 md:h-14">
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-[#06e0f9] rounded-lg shadow-lg z-0 transition-all duration-300 ease-in-out ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'}`}
              ></div>
              <button
                onClick={() => setIsLogin(true)}
                className={`relative z-10 flex-1 text-center font-bold text-xs md:text-sm transition-colors duration-300 ${isLogin ? 'text-[#0f2123]' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative z-10 flex-1 text-center font-bold text-xs md:text-sm transition-colors duration-300 ${!isLogin ? 'text-[#0f2123]' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-5 md:space-y-6">
              <div className="space-y-1 md:space-y-2 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-slate-100">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-slate-400 text-xs md:text-sm">
                  {isLogin ? 'Access dashboard securely.' : 'Join the advanced parking network.'}
                </p>
              </div>

              <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-1 md:space-y-2">
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">First Name</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-sm md:text-base text-[#2f646a] group-focus-within:text-[#06e0f9] transition-colors">person</span>
                        <input
                          className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] transition-all"
                          placeholder="John"
                          type="text"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-sm md:text-base text-[#2f646a] group-focus-within:text-[#06e0f9] transition-colors">person</span>
                        <input
                          className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] transition-all"
                          placeholder="Doe"
                          type="text"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-sm md:text-base text-[#2f646a] group-focus-within:text-[#06e0f9] transition-colors">phone</span>
                        <input
                          className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] transition-all"
                          placeholder="+91 1234567890"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 md:space-y-2">
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-sm md:text-base text-[#2f646a] group-focus-within:text-[#06e0f9] transition-colors">alternate_email</span>
                    <input
                      className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] transition-all"
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                    {isLogin && (
                      <Link
                        to="/ForgotPassword"
                        className="text-[10px] md:text-xs text-[#06e0f9] hover:text-[#ccff00] transition-colors"
                      >
                        Forgot?
                      </Link>
                    )}
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-sm md:text-base text-[#2f646a] group-focus-within:text-[#06e0f9] transition-colors">lock</span>
                    <input
                      className="w-full bg-[#0f2123] border border-[#2f646a] rounded-lg py-3 md:py-4 pl-10 md:pl-12 pr-3 md:pr-4 text-sm text-slate-100 focus:outline-none focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] transition-all"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm px-3 py-2 rounded-md bg-[#581c2c] border border-[#7b1f30]">
                    {error}
                  </div>
                )}

                <button
                  className="w-full bg-[#06e0f9] py-3 md:py-4 rounded-lg font-bold text-sm md:text-base text-[#0f2123] hover:shadow-[0_0_20px_rgba(6,224,249,0.4)] transition-all flex items-center justify-center gap-2"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? (isLogin ? 'Logging in...' : 'Registering...') : isLogin ? 'Login' : 'Register'}</span>
                  <span className="material-symbols-outlined text-sm md:text-base">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default LoginSignup;
