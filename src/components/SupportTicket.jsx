import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Upload,
  Send,
  History,
  Clock,
  MessageSquare,
  ExternalLink,
  Search,
  Loader2,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import NotificationBox from "./NotificationBox";
import parkingApi from "../api/parkingApi.js";

const SmartParkingSupport = () => {

  // Form State
  const [formData, setFormData] = useState({
    category: "Technical Issue",
    priority: "Low",
    subject: "",
    description: ""
  });

  // Dynamic Data
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Logged in user
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const userProfile = localStorage.getItem('userProfile');
    const saved = localStorage.getItem('loggedInUser');
    return userProfile ? JSON.parse(userProfile) : saved ? JSON.parse(saved) : null;
  });

  // Fetch fresh user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('parkingAuthToken');
        if (!token) return;
        
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
            plan: user.plan || 'basic',
            role: 'user'
          };
          setLoggedInUser(userData);
          localStorage.setItem('userProfile', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('SupportTicket: Failed to fetch user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  // Get username for display
  const userName = loggedInUser?.name || 
    `${loggedInUser?.firstname || ''} ${loggedInUser?.lastname || ''}`.trim() ||
    (loggedInUser?.email ? loggedInUser.email.split('@')[0] : null) ||
    "Guest";
  useEffect(() => {
    try {
      const storedTickets =
        JSON.parse(localStorage.getItem("supportTickets")) || [];

      const storedResources =
        JSON.parse(localStorage.getItem("supportResources")) || [];

      setTickets(storedTickets);
      setResources(storedResources);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load support data:", error);
      setIsLoading(false);
    }
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit ticket
  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: "SPS-" + Math.floor(10000 + Math.random() * 90000),
      status: "OPEN",
      title: formData.subject,
      time: "Just now",
      replies: 0
    };

    const storedTickets =
      JSON.parse(localStorage.getItem("supportTickets")) || [];

    const updatedTickets = [newTicket, ...storedTickets];

    localStorage.setItem("supportTickets", JSON.stringify(updatedTickets));

    setTickets(updatedTickets);

    setFormData({
      category: "Technical Issue",
      priority: "Low",
      subject: "",
      description: ""
    });

    alert("Ticket submitted successfully!");
  };

  // Clear localStorage data
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all localStorage data?")) {
      localStorage.removeItem("supportTickets");
      localStorage.removeItem("supportResources");
      localStorage.removeItem("loggedInUser");
      setTickets([]);
      setResources([]);
      alert("LocalStorage data deleted successfully!");
    }
  };

  const userPlan = loggedInUser?.plan || "basic";

  const getPlanInfo = (plan) => {
    const plans = {
      basic: { name: "Free Plan", color: "text-slate-400" },
      pro: { name: "Pro Member", color: "text-cyan-400" },
      max: { name: "Max Member", color: "text-purple-400" }
    };
    return plans[plan] || plans.basic;
  };

  const planInfo = getPlanInfo(userPlan);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f2123] text-slate-900 dark:text-slate-100 font-sans">

      <Navbar />

      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 bg-gradient-to-b from-[#0b1414] to-[#080d0d] custom-scrollbar">

        {/* HEADER */}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">

          <div className="relative w-full md:w-1/3 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />

            <input
              type="text"
              placeholder="Search for parking..."
              className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white"
            />
          </div>

          <div className="flex items-center space-x-6 w-full md:w-auto justify-end">

            <NotificationBox />

            <div className="flex items-center space-x-3 pl-4 border-l border-white/10">

              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-white mb-1">{userName}</p>
                <p className={`text-xs font-bold ${planInfo.color}`}>
                  {planInfo.name}
                </p>
              </div>

              <img
                src={
                  loggedInUser?.avatar ||
                  "https://i.pravatar.cc/150?u=alex"
                }
                className="size-10 rounded-xl border border-white/10"
                alt="profile"
              />

            </div>
          </div>

        </header>

        {/* MAIN GRID */}

        <div className="grid grid-cols-12 gap-8">

          {/* NEW TICKET */}

          <div className="col-span-12 lg:col-span-7">

            <div className="dark:bg-[#152a2d] rounded-xl border border-slate-200 dark:border-[#1e3a3e] p-8 shadow-sm">

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PlusCircle className="text-cyan-400" size={22} />
                Raise a New Ticket
              </h3>

              <form className="space-y-5" onSubmit={handleSubmit}>

                <div className="grid grid-cols-2 gap-5">

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-[#0f2123] border border-[#1e3a3e]"
                  >
                    <option>Technical Issue</option>
                    <option>Billing & Payment</option>
                    <option>Account Access</option>
                  </select>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-lg bg-[#0f2123] border border-[#1e3a3e]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High (Urgent)</option>
                  </select>

                </div>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Briefly describe the issue"
                  className="w-full h-12 px-4 rounded-lg bg-[#0f2123] border border-[#1e3a3e]"
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Please provide details..."
                  className="w-full p-4 rounded-lg bg-[#0f2123] border border-[#1e3a3e]"
                />

                <div className="border-2 border-dashed border-[#1e3a3e] rounded-xl p-8 flex flex-col items-center text-slate-400">
                  <Upload className="mb-2 text-cyan-400/60" size={32} />
                  <p className="text-sm">Click to upload</p>
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-cyan-400 text-[#0f2123] font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  SUBMIT TICKET
                </button>

              </form>

            </div>
          </div>

          {/* TICKET HISTORY */}

          <div className="col-span-12 lg:col-span-5">

            <div className="dark:bg-[#152a2d] rounded-xl border border-[#1e3a3e] p-6 flex flex-col h-full">

              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="text-emerald-400" size={22} />
                Ticket History
                <button
                  onClick={handleClearData}
                  className="ml-auto p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete localStorage data"
                >
                  <Trash2 size={18} />
                </button>
              </h3>

              <div className="space-y-4 flex-1 overflow-y-auto">

                {isLoading ? (
                  <div className="flex flex-col items-center text-slate-400">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    Loading tickets...
                  </div>
                ) : tickets.length > 0 ? (
                  tickets.map((ticket, index) => (
                    <TicketCard key={index} {...ticket} />
                  ))
                ) : (
                  <p className="text-slate-400 text-center">
                    No support tickets found
                  </p>
                )}

              </div>

              {/* RESOURCES */}

              <div className="mt-8 pt-6 border-t border-[#1e3a3e]">

                <h4 className="text-xs text-cyan-400 mb-4 uppercase">
                  Popular Resources
                </h4>

                <div className="space-y-3">

                  {resources.map((resource) => (
                    <ResourceLink key={resource.id} {...resource} />
                  ))}

                </div>

              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const TicketCard = ({ id, status, title, time, replies }) => (
  <div className="p-4 rounded-lg bg-[#0f2123] border border-[#1e3a3e]">

    <div className="flex justify-between mb-2">
      <span className="text-xs text-slate-400">#{id}</span>

      <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded">
        {status}
      </span>
    </div>

    <h4 className="text-sm font-bold text-white">{title}</h4>

    <div className="flex gap-3 mt-3 text-xs text-slate-400">
      <div className="flex items-center gap-1">
        <Clock size={12} /> {time}
      </div>

      <div className="flex items-center gap-1">
        <MessageSquare size={12} /> {replies} replies
      </div>
    </div>

  </div>
);

const ResourceLink = ({ label, link }) => (
  <Link
    to={link}
    className="flex justify-between items-center p-3 bg-cyan-400/5 rounded hover:bg-cyan-400/10"
  >
    <span>{label}</span>
    <ExternalLink size={14} />
  </Link>
);

export default SmartParkingSupport;
