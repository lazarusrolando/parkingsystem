import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import './CreditCardForm.css';

const CreditCardForm = ({ onClose, onSubmit, initialData }) => {
  const [cardData, setCardData] = useState(initialData || {
    cardType: '',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Cardholder name validation
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Expiry month validation
    if (!cardData.expiryMonth || cardData.expiryMonth < 1 || cardData.expiryMonth > 12) {
      newErrors.expiryMonth = 'Invalid month (01-12)';
    }

    // Expiry year validation
    const currentYear = new Date().getFullYear();
    if (!cardData.expiryYear || cardData.expiryYear < currentYear) {
      newErrors.expiryYear = `Year must be ${currentYear} or later`;
    }

    // CVV validation
    const cvvClean = cardData.cvv.replace(/\s/g, '');
    if (!cvvClean || cvvClean.length < 3 || cvvClean.length > 4) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, cardNumber: value });
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, cvv: value });
  };

  const handleExpiryMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setCardData({ ...cardData, expiryMonth: value });
  };

  const handleExpiryYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, expiryYear: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(cardData);
      setCardData({
        cardType: 'visa',
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false,
      });
      setErrors({});
    }
  };

  return (
    <div className="credit-card-form-overlay">
      <div className="credit-card-form-container">
        <div className="credit-card-form-header">
          <h2>{initialData ? 'Edit Credit Card' : 'Add Credit Card'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card Type Selection */}
          <div className="card-type-section">
            <label className="form-label">Card Type</label>
            <div className="card-type-options">
              <label className="card-type-option">
                <input
                  type="radio"
                  name="cardType"
                  value="visa"
                  checked={cardData.cardType === 'visa'}
                  onChange={(e) => setCardData({ ...cardData, cardType: e.target.value })}
                />
                <span className="card-type-label">
                  <CreditCard size={20} />
                  Visa
                </span>
              </label>
              <label className="card-type-option">
                <input
                  type="radio"
                  name="cardType"
                  value="rupay"
                  checked={cardData.cardType === 'rupay'}
                  onChange={(e) => setCardData({ ...cardData, cardType: e.target.value })}
                />
                <span className="card-type-label">
                  <CreditCard size={20} />
                  RuPay
                </span>
              </label>
            </div>
          </div>

          {/* Card Number */}
          <div className="form-group">
            <label htmlFor="cardNumber" className="form-label">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength="19"
              className={`form-input ${errors.cardNumber ? 'error' : ''}`}
            />
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>

          {/* Cardholder Name */}
          <div className="form-group">
            <label htmlFor="cardholderName" className="form-label">
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardholderName"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
              className={`form-input ${errors.cardholderName ? 'error' : ''}`}
            />
            {errors.cardholderName && (
              <span className="error-message">{errors.cardholderName}</span>
            )}
          </div>

          {/* Expiry and CVV Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryMonth" className="form-label">
                Expiry Month
              </label>
              <input
                type="text"
                id="expiryMonth"
                placeholder="MM"
                value={cardData.expiryMonth}
                onChange={handleExpiryMonthChange}
                maxLength="2"
                className={`form-input expiry-input ${errors.expiryMonth ? 'error' : ''}`}
              />
              {errors.expiryMonth && (
                <span className="error-message">{errors.expiryMonth}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expiryYear" className="form-label">
                Expiry Year
              </label>
              <input
                type="text"
                id="expiryYear"
                placeholder="YYYY"
                value={cardData.expiryYear}
                onChange={handleExpiryYearChange}
                maxLength="4"
                className={`form-input expiry-input ${errors.expiryYear ? 'error' : ''}`}
              />
              {errors.expiryYear && (
                <span className="error-message">{errors.expiryYear}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cvv" className="form-label">
                CVV
              </label>
              <input
                type="password"
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={handleCVVChange}
                maxLength="4"
                className={`form-input cvv-input ${errors.cvv ? 'error' : ''}`}
              />
              {errors.cvv && <span className="error-message">{errors.cvv}</span>}
            </div>
          </div>

          {/* Make Default Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={cardData.isDefault}
                onChange={(e) => setCardData({ ...cardData, isDefault: e.target.checked })}
              />
              <span>Make this my default payment method</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn">
            {initialData ? 'Update Card' : 'Add Card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;
