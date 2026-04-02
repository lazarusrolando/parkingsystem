import React, { useState } from 'react';
import { Mail, Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import './ForgotPassword.css';
import Header from './Header';

const ForgotPassword = () => {
     const [identifier, setIdentifier] = useState('');
     const [isSubmitted, setIsSubmitted] = useState(false);

     const handleSubmit = (e) => {
          e.preventDefault();
          console.log("Recovery link requested for:", identifier);
          setIsSubmitted(true);
     };

     return (
          <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-['Space_Grotesk'] bg-[#0f2123] text-slate-100">
               <div
                    className="absolute inset-0 z-0 opacity-20"
                    style={{
                         backgroundImage: 'radial-gradient(circle at 2px 2px, #2f646a 1px, transparent 0)',
                         backgroundSize: '40px 40px'
                    }}
               />
               <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0f2123]/50 to-[#0f2123]" />

               <div className="relative z-10 flex h-full grow flex-col">
                    {/* Header */}
                    <Header />

                    {/* Main Content */}
                    <main className="flex-1 flex items-center justify-center px-4 py-12">
                         <div className="w-full max-w-[480px] bg-[#183235]/40 backdrop-blur-md border border-[#2f646a]/40 rounded-xl p-8 shadow-2xl">

                              {!isSubmitted ? (
                                   <>
                                        <div className="flex flex-col gap-2 mb-8 text-center">
                                             <div className="flex justify-center mb-4">
                                                  <div className="p-3 rounded-full bg-[#06e0f9]/10 border border-[#06e0f9]/20">
                                                       <ShieldAlert className="text-[#06e0f9]" size={36} />
                                                  </div>
                                             </div>
                                             <h1 className="text-slate-100 text-3xl font-bold leading-tight tracking-tight">Forgot Password</h1>
                                             <p className="text-slate-400 text-base font-normal">Enter your details to receive a password reset link.</p>
                                        </div>

                                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                                             <div className="flex flex-col gap-2">
                                                  <label className="text-slate-200 text-sm font-medium leading-normal px-1">Email Address or Phone Number</label>
                                                  <div className="relative group">
                                                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#06e0f9] transition-colors">
                                                            <Mail size={20} />
                                                       </div>
                                                       <input
                                                            required
                                                            className="w-full pl-11 rounded-lg text-slate-100 focus:ring-1 focus:ring-[#06e0f9] border border-[#2f646a] bg-[#0f2123]/60 h-14 placeholder:text-slate-600 outline-none transition-all"
                                                            placeholder="e.g. name@sps-platform.com"
                                                            type="text"
                                                            value={identifier}
                                                            onChange={(e) => setIdentifier(e.target.value)}
                                                       />
                                                  </div>
                                             </div>

                                             <button
                                                  className="w-full group relative overflow-hidden bg-[#06e0f9] hover:bg-[#06e0f9]/90 text-[#0f2123] font-bold py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(6,224,249,0.4)] flex items-center justify-center gap-2"
                                                  type="submit"
                                             >
                                                  <span>Send Recovery Link</span>
                                                  <Send size={18} className="transition-transform group-hover:translate-x-1" />
                                             </button>

                                             <div className="flex items-center justify-center pt-2">
                                                  {/* Inside ForgotPassword.jsx */}
                                                  <Link
                                                       to="/Auth"
                                                       className="flex items-center gap-2 text-[#06e0f9] hover:text-[#06e0f9]/80 text-sm font-medium transition-colors group"
                                                  >
                                                       <ArrowLeft size={16} />
                                                       <span className="underline underline-offset-4 decoration-[#06e0f9]/30 group-hover:decoration-[#06e0f9]">
                                                            Back to Login
                                                       </span>
                                                  </Link>
                                             </div>
                                        </form>
                                   </>
                              ) : (
                                   // Success State
                                   <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in duration-300">
                                        <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                                             <Send className="text-green-400" size={36} />
                                        </div>
                                        <h2 className="text-white text-2xl font-bold mb-2">Check your Inbox</h2>
                                        <p className="text-slate-400 mb-8">We've sent a recovery link to <br /><span className="text-[#06e0f9]">{identifier}</span></p>
                                        <button
                                             onClick={() => setIsSubmitted(false)}
                                             className="text-[#06e0f9] hover:text-[#06e0f9]/80 font-medium text-sm flex items-center gap-2"
                                        >
                                             <ArrowLeft size={16} /> Resend Link
                                        </button>
                                   </div>
                              )}
                         </div>
                    </main>

                    {/* Footer */}
                    <Footer />
               </div>
          </div>
     );
};

export default ForgotPassword;