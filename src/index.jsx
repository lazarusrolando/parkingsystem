import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Disable service worker registration in Electron to prevent InvalidStateError
if (window.electronAPI || navigator.userAgent.includes('Electron')) {
  // Override navigator.serviceWorker to prevent registration attempts
  Object.defineProperty(navigator, 'serviceWorker', {
    value: undefined,
    writable: false
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
      <Snowfall />
    </div> */}
  </React.StrictMode>
);

reportWebVitals();
