import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet, Check, Loader } from 'lucide-react';
import './TopUpModal.css';
import { notifyWalletTopUp } from '../utils/notificationUtils';

const TopUpModal = ({ isOpen, onClose, currentBalance, onSuccess, initialAmount, processingFee = 0 }) => {
  const [selectedAmount, setSelectedAmount] = useState(initialAmount || null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = getFinalAmount();

    if (amount <= 0) {
      alert('Please select or enter a valid amount');
      return;
    }

    if (amount < 100) {
      alert('Minimum top-up amount is ₹100');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate new balance
    const newBalance = currentBalance + amount;

    // Save to localStorage
    localStorage.setItem('availableBalance', newBalance.toString());

    // Create transaction record
    const transactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
    const newTransaction = {
      id: Date.now(),
      type: 'credit',
      amount: amount,
      method: paymentMethod,
      date: new Date().toISOString(),
      description: 'Wallet Top-up'
    };
transactions.unshift(newTransaction);
    localStorage.setItem('walletTransactions', JSON.stringify(transactions));

    // Notify wallet top-up
    notifyWalletTopUp({
      amount: amount,
      newBalance: newBalance
    });

    setIsProcessing(false);
    setShowSuccess(true);

    // Call success callback after showing success message
    setTimeout(() => {
      onSuccess(newBalance);
      setShowSuccess(false);
      resetForm();
      onClose();
    }, 1500);
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setPaymentMethod('card');
    setShowSuccess(false);
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

            <div className="security-note">
              <Check size={14} />
              <span>Secure encrypted payment</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TopUpModal;
