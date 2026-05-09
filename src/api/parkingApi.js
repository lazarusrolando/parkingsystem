const BASE_URL = import.meta.env.VITE_PARKING_API_URL || '';

let _authToken = null;

const _getAuthToken = () => _authToken || localStorage.getItem('parkingAuthToken');

const setToken = (token) => {
  _authToken = token;
};

const _request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const token = _getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers, credentials: 'omit' });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
};

export const getSlots = () => _request('/api/slots');
export const getAvailableSlots = () => _request('/api/slots/available');
export const getBookedSlots = () => _request('/api/slots/booked');
export const getSlot = (id) => _request(`/api/slots/${id}`);

export const getBookings = (activeOnly = false) => {
  const path = activeOnly ? '/api/bookings?active=true' : '/api/bookings';
  return _request(path);
};

export const getHistory = async () => _request('/api/history');

export const getVehicles = () => _request('/api/vehicles');
export const addVehicle = (name, plate) => _request('/api/vehicles', {
  method: 'POST',
  body: JSON.stringify({ name, plate }),
});
export const setDefaultVehicle = (vehicleId) => _request('/api/vehicles/default', {
  method: 'POST',
  body: JSON.stringify({ vehicle_id: vehicleId }),
});

export const getWallet = () => _request('/api/wallet');
export const updateWallet = (delta, options = {}) => _request('/api/wallet', {
  method: 'POST',
  body: JSON.stringify({ delta, ...options }),
});

export const getPaymentKey = () => _request('/api/payment/key');
export const createPaymentOrder = (amount) => _request('/api/payment/create-order', {
  method: 'POST',
  body: JSON.stringify({ amount }),
});
export const verifyPayment = (orderId, paymentId, signature) => _request('/api/payment/verify', {
  method: 'POST',
  body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
});
export const getPayments = () => _request('/api/payments');

export const bookSlot = (slotId, amount = 0) =>
  _request('/api/book', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId, amount }),
  });

export const releaseSlot = (slotId) =>
  _request('/api/release', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  });

export const createSlot = (name) =>
  _request('/api/create-slot', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const updateSlot = (slot) =>
  _request('/api/update-slot', {
    method: 'POST',
    body: JSON.stringify(slot),
  });

export const cancelBooking = (bookingId) =>
  _request('/api/cancel-booking', {
    method: 'POST',
    body: JSON.stringify({ booking_id: bookingId }),
  });

export const register = (email, password, firstname, lastname, phone) =>
  _request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstname, lastname, phone }),
  });

export const verifyOtp = (email, otp) =>
  _request('/api/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const login = (email, password) =>
  _request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const logout = () =>
  _request('/api/logout', {
    method: 'POST',
  });

export const me = () => _request('/me');
export const getMe = me;
export { setToken };

export const getUsers = () => _request('/api/users');
export const getAdmins = () => _request('/api/admins');
export const getAdminStats = () => _request('/api/admin-stats');

export const sendChat = (question) =>
  _request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });

export const getSupportTickets = () => _request('/api/support-tickets');
export const getSupportTicket = (ticketId) => _request(`/api/support-tickets/${ticketId}`);
export const createSupportTicket = (category, priority, subject, description) =>
  _request('/api/support-tickets', {
    method: 'POST',
    body: JSON.stringify({ category, priority, subject, description }),
  });
export const updateSupportTicket = (ticketId, status, admin_reply) =>
  _request(`/api/support-tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, admin_reply }),
  });
export const deleteSupportTicket = (ticketId) =>
  _request(`/api/support-tickets/${ticketId}`, {
    method: 'DELETE',
  });

export const updateProfile = (data) =>
  _request('/update-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const submitContact = (full_name, email_address, subject, message) =>
  _request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({ full_name, email_address, subject, message }),
  });

export const getAdminContacts = () =>
  _request('/api/admin/contacts');

const parkingApi = {
  setToken,
  getMe,
  me,
  getSlots,
  getAvailableSlots,
  getBookedSlots,
  getSlot,
  getBookings,
  getHistory,
  getVehicles,
  addVehicle,
  setDefaultVehicle,
  getWallet,
  updateWallet,
  getPaymentKey,
  createPaymentOrder,
  verifyPayment,
  getPayments,
  getUsers,
  getAdmins,
  getAdminStats,
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  updateProfile,
  bookSlot,
  releaseSlot,
  createSlot,
  updateSlot,
  cancelBooking,
  register,
  login,
  logout,
  sendChat,
  submitContact,
  getAdminContacts,
};

export default parkingApi;

