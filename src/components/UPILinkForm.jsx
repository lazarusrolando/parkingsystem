import React, { useState } from 'react';
import { X, QrCode, Copy, Check } from 'lucide-react';
import './UPILinkForm.css';

const UPILinkForm = ({ onClose, onSubmit, initialData }) => {
  const [upiData, setUpiData] = useState(initialData || {
    upiProvider: 'googlePay',
    upiId: '',
    mobileNumber: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // UPI ID validation (basic format: name@bank)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiData.upiId.trim() || !upiRegex.test(upiData.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format (example: name@paytm)';
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!upiData.mobileNumber.replace(/\D/g, '').match(mobileRegex)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setUpiData({ ...upiData, mobileNumber: value });
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiData.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(upiData);
      setUpiData({
        upiProvider: 'googlePay',
        upiId: '',
        mobileNumber: '',
        isDefault: false,
      });
      setErrors({});
    }
  };

  return (
    <div className="upi-form-overlay">
      <div className="upi-form-container">
        <div className="upi-form-header">
          <h2>{initialData ? 'Edit UPI Link' : 'Add UPI Link'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* UPI Provider Selection */}
          <div className="upi-provider-section">
            <label className="form-label">Payment Provider</label>
            <div className="upi-provider-options">
              <label className="upi-provider-option">
                <input
                  type="radio"
                  name="upiProvider"
                  value="googlePay"
                  checked={upiData.upiProvider === 'googlePay'}
                  onChange={(e) => setUpiData({ ...upiData, upiProvider: e.target.value })}
                />
                <span className="upi-provider-label">
                  <QrCode size={20} />
                  Google Pay
                </span>
              </label>
              <label className="upi-provider-option">
                <input
                  type="radio"
                  name="upiProvider"
                  value="phonePe"
                  checked={upiData.upiProvider === 'phonePe'}
                  onChange={(e) => setUpiData({ ...upiData, upiProvider: e.target.value })}
                />
                <span className="upi-provider-label">
                  <QrCode size={20} />
                  PhonePe
                </span>
              </label>
              <label className="upi-provider-option">
                <input
                  type="radio"
                  name="upiProvider"
                  value="paytm"
                  checked={upiData.upiProvider === 'paytm'}
                  onChange={(e) => setUpiData({ ...upiData, upiProvider: e.target.value })}
                />
                <span className="upi-provider-label">
                  <QrCode size={20} />
                  Paytm
                </span>
              </label>
            </div>
          </div>

          {/* UPI ID */}
          <div className="form-group">
            <label htmlFor="upiId" className="form-label">
              UPI ID
            </label>
            <div className="upi-id-input-wrapper">
              <input
                type="text"
                id="upiId"
                placeholder="yourname@paytm"
                value={upiData.upiId}
                onChange={(e) => setUpiData({ ...upiData, upiId: e.target.value })}
                className={`form-input ${errors.upiId ? 'error' : ''}`}
              />
              {upiData.upiId && (
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyUPI}
                  title="Copy UPI ID"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              )}
            </div>
            {errors.upiId && <span className="error-message">{errors.upiId}</span>}
            <small className="hint-text">Format: name@bank (e.g., john.doe@paytm)</small>
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobileNumber" className="form-label">
              Mobile Number
            </label>
            <div className="mobile-input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                id="mobileNumber"
                placeholder="9876543210"
                value={upiData.mobileNumber}
                onChange={handleMobileChange}
                maxLength="10"
                className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
              />
            </div>
            {errors.mobileNumber && (
              <span className="error-message">{errors.mobileNumber}</span>
            )}
          </div>

          {/* Info Box */}
          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-text">
              <p>Your UPI ID will be linked to your parking account</p>
            </div>
          </div>

          {/* Make Default Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={upiData.isDefault}
                onChange={(e) => setUpiData({ ...upiData, isDefault: e.target.checked })}
              />
              <span>Make this my default payment method</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            {initialData ? 'Update UPI Link' : 'Add UPI Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UPILinkForm;
