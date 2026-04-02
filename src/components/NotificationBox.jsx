import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from '../utils/notificationUtils';

const NotificationBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const storedNotifications = getNotifications();
      setNotifications(storedNotifications);
    };

    loadNotifications();

    // Refresh notifications when dropdown is opened
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDropdown = () => {
    if (!isOpen) {
      // Refresh notifications when opening
      const storedNotifications = getNotifications();
      setNotifications(storedNotifications);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
  };

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllNotifications();
      setNotifications([]);
    }
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors"
        onClick={toggleDropdown}
      >
        <Bell size={20} className="text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-[#080d0d]"></span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#121e1e] border border-white/5 rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={toggleDropdown}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group ${
                    !notification.read ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-slate-400 text-xs mb-2">
                        {notification.message}
                      </p>
                      <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/5 flex gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="flex-1 text-center text-cyan-400 text-xs font-bold uppercase tracking-widest hover:underline transition-all py-2"
                >
                  Mark All Read
                </button>
              )}
              <button 
                onClick={handleClearAll}
                className="flex-1 text-center text-red-400 text-xs font-bold uppercase tracking-widest hover:underline transition-all py-2 flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #162a2d; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NotificationBox;
