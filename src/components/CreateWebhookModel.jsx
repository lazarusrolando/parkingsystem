import React, { useState, useEffect } from 'react';
import { Link2, RefreshCw, Phone, Save, X } from 'lucide-react';

const CreateWebhookModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onTest,
  // Pass configuration as props to avoid hardcoding
  title = "Create New Webhook",
  description = "Register a new endpoint for system event triggers.",
  eventTypes = [] 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: []
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', url: '', secret: '', events: [] });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateSecret = () => {
    const newSecret = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({ ...prev, secret: newSecret }));
  };

  const toggleEvent = (id) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(id) 
        ? prev.events.filter(e => e !== id) 
        : [...prev.events, id]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2123]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f2123] border border-cyan-400/40 rounded-xl shadow-[0_0_50px_rgba(6,224,249,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-['Space_Grotesk']">
              <Link2 className="text-[#06e0f9] size-6" />
              {title}
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-['Space_Grotesk']">
              {description}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Webhook Name</label>
              <input 
                required
                className="bg-slate-900/50 border border-slate-700 rounded-lg py-3 px-4 focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] outline-none text-white transition-all"
                placeholder="e.g. Analytics Engine"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Payload URL</label>
              <input 
                required
                type="url"
                className="bg-slate-900/50 border border-slate-700 rounded-lg py-3 px-4 focus:border-[#06e0f9] focus:ring-1 focus:ring-[#06e0f9] outline-none text-white transition-all"
                placeholder="https://api.yourdomain.com/webhook"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Secret Key</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg py-3 px-4 outline-none text-white font-mono"
                readOnly
                placeholder="Click generate..."
                value={formData.secret}
              />
              <button 
                type="button"
                onClick={generateSecret}
                className="bg-[#06e0f9]/10 border border-[#06e0f9]/30 text-[#06e0f9] hover:bg-[#06e0f9]/20 px-4 rounded-lg flex items-center gap-2 transition-all font-bold text-sm"
              >
                <RefreshCw className="size-4" />
                Generate
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300">Event Subscriptions</label>
            <div className="grid grid-cols-2 gap-3">
              {eventTypes.map((event) => (
                <label 
                  key={event.id}
                  className={`flex items-start gap-3 bg-slate-900/30 border p-3 rounded-lg cursor-pointer transition-all group ${
                    event.fullWidth ? 'col-span-2' : 'col-span-2 sm:col-span-1'
                  } ${formData.events.includes(event.id) ? 'border-[#06e0f9]/50 bg-[#06e0f9]/5' : 'border-slate-800'}`}
                >
                  <input 
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-transparent text-[#06e0f9] focus:ring-[#06e0f9]"
                    checked={formData.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                  />
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${formData.events.includes(event.id) ? 'text-[#06e0f9]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {event.label}
                    </span>
                    {event.sublabel && <span className="text-[10px] text-slate-500 leading-tight">{event.sublabel}</span>}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer inside form to handle submit */}
          <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-white text-sm font-medium transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => onTest?.(formData)}
                className="flex-1 sm:flex-none border border-[#06e0f9]/40 text-[#06e0f9] hover:bg-[#06e0f9]/5 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="size-4" />
                Test
              </button>
              <button 
                type="submit"
                className="flex-1 sm:flex-none bg-[#06e0f9] hover:bg-[#06e0f9]/90 text-[#0f2123] px-8 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,224,249,0.3)]"
              >
                <Save className="size-4" />
                Save Webhook
              </button>
            </div>
          </div>
        </form>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#06e0f9] to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

export default CreateWebhookModal;