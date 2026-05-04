import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Wallet, Check, Loader, AlertCircle } from 'lucide-react';
import './TopUpModal.css';
import { notifyWalletTopUp } from '../utils/notificationUtils';
import parkingApi from '../api/parkingApi';

let razorpayInstance = null;

const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const TopUpModal = ({ isOpen, onClose, currentBalance, onSuccess, initialAmount, processingFee = 0 }) => {
  const [selectedAmount, setSelectedAmount] = useState(initialAmount || null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const predefinedAmounts = [100, 200, 500, 1000];

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount && parseInt(customAmount) > 0) return parseInt(customAmount);
    return 0;
  };

  const handleRazorpayPayment = async (orderData) => {
    try {
      const Razorpay = await loadRazorpayScript();
      const { key } = orderData;

      razorpayInstance = new Razorpay({
        key,
        order_id: orderData.order.id,
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'Smart Parking System',
        description: 'Wallet Top-up',
        handler: async (response) => {
          try {
            const verification = await parkingApi.verifyPayment(
              orderData.order.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            const newBalance = verification.wallet?.balance ?? currentBalance + getFinalAmount();
            localStorage.setItem('availableBalance', newBalance.toString());
            notifyWalletTopUp({ amount: getFinalAmount(), newBalance });
            onSuccess(newBalance);
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              resetForm();
              onClose();
            }, 1500);
          } catch (err) {
            console.error('Payment verification failed:', err);
            setError('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          email: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')).email : undefined
        },
        theme: {
          color: '#00d1ff'
        }
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay initialization failed:', err);
      setError('Failed to load payment gateway. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = getFinalAmount();

    if (amount <= 0) {
      setError('Please select or enter a valid amount');
      return;
    }

    if (amount < 100) {
      setError('Minimum top-up amount is ₹100');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderData = await parkingApi.createPaymentOrder(amount);
      if (orderData.order) {
        await handleRazorpayPayment(orderData);
      } else {
        setError(orderData.error || 'Failed to create payment order');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setPaymentMethod('card');
    setShowSuccess(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="topup-modal-overlay" onClick={handleClose}>
      <div className="topup-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="topup-modal-header">
          <div className="header-content">
            <div className="wallet-icon">
              <Wallet size={24} />
            </div>
            <div>
              <h2>Top Up Wallet</h2>
              <p>Current Balance: ₹{currentBalance.toLocaleString()}</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {showSuccess ? (
          <div className="success-state">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h3>Payment Successful!</h3>
            <p>₹{getFinalAmount()} has been added to your wallet</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="topup-body-horizontal">

              {/* LEFT SIDE */}
              <div className="left-panel">

                {/* Amount Section */}
                <div className="amount-section">
                  <label className="section-label">Select Amount</label>
                  <div className="amount-grid">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`amount-btn ${selectedAmount === amount ? 'selected' : ''}`}
                        onClick={() => handleAmountClick(amount)}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>

                  <div className="custom-amount">
                    <label className="section-label">Custom Amount</label>
                    <div className="custom-amount-input">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="text"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="payment-section">
                  <label className="section-label">Payment Method</label>
                  <div className="payment-options">
                    <button
                      type="button"
                      className={`payment-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={20} />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      className={`payment-btn ${paymentMethod === 'upi' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <Smartphone size={20} />
                      <span>UPI</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="right-panel">

                <div className="summary-section">
                  <div className="summary-row">
                    <span>Top-up Amount</span>
                    <span className="amount">₹{getFinalAmount().toLocaleString()}</span>
                  </div>

                  <div className="summary-row">
                    <span>Processing Fee</span>
                    <span className="fee">₹{processingFee}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="total-amount">₹{(getFinalAmount() + processingFee).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isProcessing || getFinalAmount() <= 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={20} className="spinner" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${(getFinalAmount() + processingFee).toLocaleString()}`
                  )}
                </button>

              </div>

            </div>

            {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

            <div className="security-note">
              <Check size={14} />
              <span>Secure encrypted payment via Razorpay</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;
