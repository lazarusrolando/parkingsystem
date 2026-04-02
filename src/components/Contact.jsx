import React, { useState } from 'react';
import { Mail, Phone, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Header from './Header';
import parkingApi from '../api/parkingApi';

const ParkAppSupport = () => {
     const [formData, setFormData] = useState({
          full_name: '',
          email_address: '',
          subject: 'technical', // Added default
          message: ''
     });

const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

const handleSubmit = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);
     setSubmitStatus(null);
     try {
         await parkingApi.submitContact(
             formData.full_name,
             formData.email_address,
             formData.subject,
             formData.message
         );
         setSubmitStatus('success');
         setFormData({ full_name: '', email_address: '', subject: 'technical', message: '' });
     } catch (error) {
         console.error('Submit error:', error);
         setSubmitStatus('error');
     } finally {
         setIsSubmitting(false);
     }
};

     return (
          <div className="flex min-h-screen w-full text-slate-200 font-sans relative">

               {/* Main Content Area */}
               <main className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto">
                    <Header />

                    {/* Content Container */}
                    <div className="flex-1 px-6 py-12 md:px-12 lg:px-20 relative">
                         {/* Decorative Blur */}
                         <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e5ff10] blur-[120px] rounded-full pointer-events-none" />

                         <div className="max-w-6xl mx-auto">
                              <header className="mb-12 text-center">
                                   <h1 className="text-4xl text-[#00e5ff] md:text-5xl font-bold tracking-tight mb-4">
                                        Contact Support
                                   </h1>
                                   <p className="text-gray-400 leading-relaxed">
                                        Need assistance with your smart parking spot or payment issues?
                                        Our technical support team is available 24/7.
                                   </p>
                              </header>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                   {/* Info Panel */}
                                   <div className="lg:col-span-1 space-y-4">
                                        <ContactCard
                                             icon={<Mail className="text-[#00e5ff]" size={20} />}
                                             title="Email Support"
                                             value="support@parkapp.com"
                                             color="cyan"
                                        />
                                        <ContactCard
                                             icon={<Phone className="text-[#00ff9d]" size={20} />}
                                             title="Phone"
                                             value="+91 98765 43210"
                                             color="green"
                                        />
                                   </div>

                                   {/* Form Panel */}
                                   <div className="lg:col-span-2">
                                        <div className="bg-[#111820] p-8 md:p-10 rounded-3xl border border-white/5 relative shadow-2xl">
                                             <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                       <InputField
                                                            label="Full Name"
                                                            placeholder="John Doe"
                                                            value={formData.full_name}
                                                            onChange={(val) => setFormData({ ...formData, full_name: val })}
                                                       />
                                                       <InputField
                                                            label="Email Address"
                                                            type="email"
                                                            placeholder="john@example.com"
                                                            value={formData.email_address}
                                                            onChange={(val) => setFormData({ ...formData, email_address: val })}
                                                       />
                                                  </div>

                                                  <div className="space-y-2">
                                                       <label className="block text-sm font-medium text-gray-400 ml-1">Subject</label>
                                                       <select
                                                            className="w-full px-4 py-3 bg-[#0a0f14] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#00e5ff] outline-none text-white transition-all cursor-pointer"
                                                            value={formData.subject}
                                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                       >
                                                            <option value="technical">Technical Support</option>
                                                            <option value="billing">Billing & Payments</option>
                                                            <option value="parking">Parking Reservation Issue</option>
                                                       </select>
                                                  </div>

                                                  <div className="space-y-2">
                                                       <label className="block text-sm font-medium text-gray-400 ml-1">Your Message</label>
                                                       <textarea
                                                            rows="5"
                                                            className="w-full px-4 py-3 bg-[#0a0f14] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#00e5ff] outline-none text-white transition-all resize-none"
                                                            placeholder="Describe your issue..."
                                                            value={formData.message}
                                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                       />
                                                  </div>

     {submitStatus === 'success' && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-3 text-emerald-400">
               <CheckCircle size={20} />
               <span className="font-medium">Message sent successfully! We'll respond soon.</span>
          </div>
     )}
     {submitStatus === 'error' && (
          <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-2xl flex items-center gap-3 text-red-400">
               <AlertCircle size={20} />
               <span className="font-medium">Failed to send. Please try again.</span>
          </div>
     )}
     <button
          type="submit"
          disabled={isSubmitting}
          className="group w-full md:w-auto px-10 py-4 bg-gradient-to-r from-[#00e5ff] to-[#00ff9d] rounded-xl font-bold text-[#0a0f14] hover:shadow-[0_0_30px_-5px_rgba(0,229,255,0.5)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
     >
          {isSubmitting ? (
               <>
                    <Loader2 className="ml-2 w-5 h-5 group-hover:animate-spin transition-transform" />
                    Sending...
               </>
          ) : (
               <>
                    SEND MESSAGE
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </>
          )}
     </button>
                                             </form>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </main>
          </div>
     );
};

const ContactCard = ({ icon, title, value, color }) => {
     const borderColor = color === 'cyan' ? 'hover:border-[#00e5ff80]' : 'hover:border-[#00ff9d80]';
     const bgColor = color === 'cyan' ? 'bg-[#00e5ff10]' : 'bg-[#00ff9d10]';
     const labelColor = color === 'cyan' ? 'text-[#00e5ff]' : 'text-[#00ff9d]';

     return (
          <div className={`bg-[#111820] p-6 rounded-2xl border border-white/5 ${borderColor} transition-all duration-300 group`}>
               <div className="flex items-center space-x-4">
                    <div className={`p-3 ${bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                         {icon}
                    </div>
                    <div>
                         <h3 className={`text-xs font-mono ${labelColor} uppercase tracking-widest mb-1`}>{title}</h3>
                         <p className="text-md font-semibold text-white">{value}</p>
                    </div>
               </div>
          </div>
     );
};

const InputField = ({ label, type = "text", placeholder, value, onChange }) => (
     <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400 ml-1">{label}</label>
          <input
               type={type}
               value={value}
               placeholder={placeholder}
               onChange={(e) => onChange(e.target.value)}
               className="w-full px-4 py-3 bg-[#0a0f14] border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#00e5ff] focus:border-transparent outline-none text-white transition-all duration-300 placeholder:text-gray-600"
          />
     </div>
);

export default ParkAppSupport;