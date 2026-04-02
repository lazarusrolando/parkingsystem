// Notification utility functions for managing notifications in localStorage

const NOTIFICATIONS_KEY = 'userNotifications';

// Get notifications from localStorage
export const getNotifications = () => {
  try {
    const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Add a new notification to localStorage
export const addNotification = (notification) => {
  try {
    const notifications = getNotifications();
    
    const newNotification = {
      id: Date.now(),
      title: notification.title,
      message: notification.message,
      time: 'Just now',
      read: false,
      timestamp: new Date().toISOString()
    };
    
    // Add new notification at the beginning
    notifications.unshift(newNotification);
    
    // Keep only the last 50 notifications
    const trimmedNotifications = notifications.slice(0, 50);
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmedNotifications));
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
};

// Mark a notification as read
export const markNotificationAsRead = (notificationId) => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
  try {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Clear all notifications
export const clearAllNotifications = () => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Get unread notifications count
export const getUnreadCount = () => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

// Notification helper functions for specific events

// 1. Profile Updated Notification
export const notifyProfileUpdated = (profile) => {
  return addNotification({
    title: 'Profile Updated',
    message: `Your profile has been successfully updated.${profile?.firstName ? ` Welcome, ${profile.firstName}!` : ''}`
  });
};

// 2. Slot Booked Notification
export const notifySlotBooked = (booking) => {
  return addNotification({
    title: 'Spot Reserved',
    message: `Your reservation at ${booking?.title || 'the parking spot'} is confirmed. Zone ${booking?.zone || 'N/A'}, Spot ${booking?.spotNumber || 'N/A'}.`
  });
};

// 3. Payment Successful Notification
export const notifyPaymentSuccessful = (paymentDetails) => {
  return addNotification({
    title: 'Payment Successful',
    message: `₹${paymentDetails?.amount || 0} has been ${paymentDetails?.type === 'deducted' ? 'dedicated' : 'paid'} for ${paymentDetails?.description || 'parking'}.`
  });
};

// 4. Payment Declined Notification
export const notifyPaymentDeclined = (paymentDetails) => {
  return addNotification({
    title: 'Payment Declined',
    message: `Your payment of ₹${paymentDetails?.amount || 0} was declined. Please try again or use a different payment method.`
  });
};

// 5. Wallet Top-up Notification
export const notifyWalletTopUp = (topUpDetails) => {
  return addNotification({
    title: 'Wallet Top-up Successful',
    message: `₹${topUpDetails?.amount || 0} has been added to your wallet. New balance: ₹${topUpDetails?.newBalance || 0}.`
  });
};

// 6. Vehicle Registered Notification
export const notifyVehicleRegistered = (vehicle) => {
  return addNotification({
    title: 'Vehicle Registered',
    message: `Your vehicle "${vehicle?.name || 'New Vehicle'}" (${vehicle?.plate || 'N/A'}) has been successfully registered.`
  });
};

// 7. User Registered Notification
export const notifyUserRegistered = (user) => {
  return addNotification({
    title: 'Welcome to SPS Parking!',
    message: `Hello ${user?.username || 'User'}! Your account has been created successfully. Start booking parking spots now!`
  });
};

// 8. Booking Expiring Notification
export const notifyBookingExpiring = (booking) => {
  return addNotification({
    title: 'Booking Expiring Soon',
    message: `Your parking at ${booking?.title || 'the parking spot'} expires in 15 minutes. Please extend or complete your session.`
  });
};

// 9. Booking Expired Notification
export const notifyBookingExpired = (booking) => {
  return addNotification({
    title: 'Booking Expired',
    message: `Your parking session at ${booking?.title || 'the parking spot'} has expired. Thank you for using SPS Parking!`
  });
};

// 10. Low Balance Notification
export const notifyLowBalance = (balance) => {
  return addNotification({
    title: 'Low Wallet Balance',
    message: `Your wallet balance is low (₹${balance || 0}). Top up to continue parking seamlessly.`
  });
};

// 11. Booking Cancelled Notification
export const notifyBookingCancelled = (booking) => {
  return addNotification({
    title: 'Booking Cancelled',
    message: `Your reservation at ${booking?.title || 'the parking spot'} has been cancelled. Amount will be refunded to your wallet.`
  });
};

// 12. Vehicle Deleted Notification
export const notifyVehicleDeleted = (vehicle) => {
  return addNotification({
    title: 'Vehicle Removed',
    message: `Your vehicle "${vehicle?.name || 'Vehicle'}" has been removed from your profile.`
  });
};
