import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
     const navigate = useNavigate();

     useEffect(() => {
          // Clear all auth-related storage
          localStorage.removeItem('parkingAuthToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('adminProfile');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userVehicles');
          localStorage.removeItem('currentBooking');
          localStorage.removeItem('bookingHistory');

          navigate('/Auth');
     }, [navigate]);

     return (
          <div className="flex items-center justify-center h-screen bg-[#080d0d] text-white">
               <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Logging out...</h2>
                    <p className="text-slate-400">You are being redirected to the login page.</p>
               </div>
          </div>
     );
};

export default Logout;
