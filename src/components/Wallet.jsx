import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal } from 'react-bootstrap';
import logo from '../sps.png'
import {
    PlusCircle, TrendingUp, Download, HelpCircle, History, ParkingCircle,
    Wallet, Search, Copy, Check, QrCode, CreditCard, Landmark, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import NotificationBox from './NotificationBox';
import CreditCardForm from './CreditCardForm';
import DebitCardForm from './DebitCardForm';
import UPILinkForm from './UPILinkForm';
import TopUpModal from './TopUpModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import './Wallet.css';

const WalletView = () => {
    // Modal States
    const [showQR, setShowQR] = useState(false);
    const [showAddMethod, setShowAddMethod] = useState(false);
    const [showCreditCardForm, setShowCreditCardForm] = useState(false);
    const [showDebitCardForm, setShowDebitCardForm] = useState(false);
    const [showUPILinkForm, setShowUPILinkForm] = useState(false);
    const [showStatement, setShowStatement] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [selectedTopUpAmount, setSelectedTopUpAmount] = useState(null);
    const [copied, setCopied] = useState(false);

    // Payment Methods State
    const [creditCards, setCreditCards] = useState([]);
    const [debitCards, setDebitCards] = useState([]);
    const [upiLinks, setUpiLinks] = useState([]);

    // Edit States
    const [editingCreditCard, setEditingCreditCard] = useState(null);
    const [editingDebitCard, setEditingDebitCard] = useState(null);
    const [editingUPILink, setEditingUPILink] = useState(null);

    // User Data
    const [walletAddress, setWalletAddress] = useState("");
    const [upiLink, setUpiLink] = useState("");
    const [userBalance, setUserBalance] = useState("0");

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
                
                const parkingApi = (await import('../api/parkingApi.js')).default;
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
                console.warn('Wallet: Failed to fetch user data:', err);
            }
        };
        
        fetchUserData();
    }, []);

    // Get username for display - using the same pattern as UserDashboard.js
    const userName = loggedInUser?.name || 
        `${loggedInUser?.firstname || ''} ${loggedInUser?.lastname || ''}`.trim() ||
        (loggedInUser?.email ? loggedInUser.email.split('@')[0] : null) ||
        "Guest";

    // Get user's membership plan
    const userPlan = loggedInUser?.plan || "basic";

    // Get plan display info
    const getPlanInfo = (plan) => {
        const plans = {
            basic: { name: "Free Plan", color: "text-slate-400" },
            pro: { name: "Pro Member", color: "text-cyan-400" },
            max: { name: "Max Member", color: "text-purple-400" }
        };
        return plans[plan] || plans.basic;
    };

    const planInfo = getPlanInfo(userPlan);

    // Get discount percentage based on user plan
    const getDiscountPercentage = (plan) => {
        const discounts = {
            basic: 0,
            pro: 15,
            max: 30
        };
        return discounts[plan] || 0
    };

    const discountPercentage = getDiscountPercentage(userPlan);

    React.useEffect(() => {
        const loggedInUserData = localStorage.getItem('loggedInUser');
        if (loggedInUserData) {
            const user = JSON.parse(loggedInUserData);
            setWalletAddress(user.walletAddress || user.email || "");
            setUpiLink(user.upiId || user.email || "");
            setUserBalance(user.balance || "0");
        } else {
            const userData = localStorage.getItem('userProfile');
            if (userData) {
                const user = JSON.parse(userData);
                setWalletAddress(user.walletAddress || user.email || "");
                setUpiLink(user.upiId || user.email || "");
                setUserBalance(user.balance || "0");
            } else {
                setUserBalance("0");
            }
        }
    }, []);

    const handleShowQR = () => setShowQR(true);
    const handleCloseQR = () => setShowQR(false);

    const handleShowAddMethod = () => setShowAddMethod(true);
    const handleCloseAddMethod = () => setShowAddMethod(false);

    const handleShowCreditCardForm = () => {
        setShowAddMethod(false);
        setShowCreditCardForm(true);
    };

    const handleCloseCreditCardForm = () => {
        setShowCreditCardForm(false);
        setEditingCreditCard(null);
    };

    const handleAddCreditCard = (cardData) => {
        console.log('Credit card added:', cardData);
        if (editingCreditCard) {
            const updatedCards = creditCards.map(card =>
                card.id === editingCreditCard.id
                    ? { ...card, ...cardData }
                    : card
            );
            setCreditCards(updatedCards);
            setEditingCreditCard(null);
            alert('Credit card updated successfully!');
        } else {
            const newCard = {
                id: creditCards.length + 1,
                ...cardData,
            };
            setCreditCards([...creditCards, newCard]);
            alert('Credit card added successfully!');
        }
        handleCloseCreditCardForm();
    };

    const handleEditCreditCard = (card) => {
        setEditingCreditCard(card);
        setShowCreditCardForm(true);
    };

    const handleDeleteCreditCard = (id) => {
        if (window.confirm('Are you sure you want to delete this credit card?')) {
            setCreditCards(creditCards.filter(card => card.id !== id));
            alert('Credit card deleted successfully!');
        }
    };

    const handleShowDebitCardForm = () => {
        setShowAddMethod(false);
        setShowDebitCardForm(true);
    };

    const handleCloseDebitCardForm = () => {
        setShowDebitCardForm(false);
        setEditingDebitCard(null);
    };

    const handleAddDebitCard = (cardData) => {
        console.log('Debit card added:', cardData);
        if (editingDebitCard) {
            const updatedCards = debitCards.map(card =>
                card.id === editingDebitCard.id
                    ? { ...card, ...cardData }
                    : card
            );
            setDebitCards(updatedCards);
            setEditingDebitCard(null);
            alert('Debit card updated successfully!');
        } else {
            const newCard = {
                id: debitCards.length + 1,
                ...cardData,
            };
            setDebitCards([...debitCards, newCard]);
            alert('Debit card added successfully!');
        }
        handleCloseDebitCardForm();
    };

    const handleEditDebitCard = (card) => {
        setEditingDebitCard(card);
        setShowDebitCardForm(true);
    };

    const handleDeleteDebitCard = (id) => {
        if (window.confirm('Are you sure you want to delete this debit card?')) {
            setDebitCards(debitCards.filter(card => card.id !== id));
            alert('Debit card deleted successfully!');
        }
    };

    const handleShowUPILinkForm = () => {
        setShowAddMethod(false);
        setShowUPILinkForm(true);
    };

    const handleCloseUPILinkForm = () => {
        setShowUPILinkForm(false);
        setEditingUPILink(null);
    };

    const handleAddUPILink = (upiData) => {
        console.log('UPI link added:', upiData);
        if (editingUPILink) {
            const updatedUPIs = upiLinks.map(upi =>
                upi.id === editingUPILink.id
                    ? { ...upi, ...upiData }
                    : upi
            );
            setUpiLinks(updatedUPIs);
            setEditingUPILink(null);
            alert('UPI link updated successfully!');
        } else {
            const newUPI = {
                id: upiLinks.length + 1,
                ...upiData,
            };
            setUpiLinks([...upiLinks, newUPI]);
            alert('UPI link added successfully!');
        }
        handleCloseUPILinkForm();
    };

    const handleEditUPILink = (upi) => {
        setEditingUPILink(upi);
        setShowUPILinkForm(true);
    };

    const handleDeleteUPILink = (id) => {
        if (window.confirm('Are you sure you want to delete this UPI link?')) {
            setUpiLinks(upiLinks.filter(upi => upi.id !== id));
            alert('UPI link deleted successfully!');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(upiLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShowStatement = () => setShowStatement(true);
    const handleCloseStatement = () => setShowStatement(false);

    const handleShowSupport = () => setShowSupport(true);
    const handleCloseSupport = () => setShowSupport(false);

    const handleDownloadStatement = () => {
        // Get dynamic user data
        const currentYear = new Date().getFullYear();
        const accountId = loggedInUser?.id ? `SPS-${currentYear}-${loggedInUser.id.toString().padStart(6, '0')}` : `SPS-${currentYear}-000000`;
        const balance = parseFloat(userBalance) || 0;
        
        // Create dynamic statement data
        const statementData = `
PARKING SYSTEM - WALLET STATEMENT
=====================================
User: ${userName}
Account ID: ${accountId}
Generated: ${new Date().toLocaleString()}

TRANSACTION HISTORY
-------------------
Date          | Description           | Amount    | Status
-------------------------------------------------------------------
No transactions yet

SUMMARY
-------
Total Spent: ₹0
Available Balance: ₹${balance}
Total Top-ups: ₹0

This is an auto-generated statement.
        `;

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(statementData));
        element.setAttribute('download', `Parking_Statement_${new Date().toISOString().split('T')[0]}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // TopUp Modal Handlers
    const handleOpenTopUpModal = (amount = null) => {
        setSelectedTopUpAmount(amount);
        setShowTopUpModal(true);
    };

    const handleCloseTopUpModal = () => {
        setShowTopUpModal(false);
        setSelectedTopUpAmount(null);
    };

    const handleTopUpSuccess = (newBalance) => {
        setUserBalance(newBalance.toString());
        // Also update in localStorage
        const loggedInUserData = localStorage.getItem('loggedInUser');
        if (loggedInUserData) {
            const user = JSON.parse(loggedInUserData);
            user.balance = newBalance.toString();
            localStorage.setItem('loggedInUser', JSON.stringify(user));
        }
    };

    return (
        <div className="d-flex vh-100 overflow-hidden">
            <Navbar />
            <main className="flex-grow-1 overflow-auto p-4 p-lg-5 no-scrollbar p-6 md:p-10 transition-all duration-300 bg-gradient-to-b from-[#0b1414] to-[#080d0d]">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="relative w-full md:w-1/3 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search for parking..."
                            className="w-full bg-[#162a2d]/40 border border-white/5 rounded-2xl py-3.5 pl-12 text-sm focus:ring-1 focus:ring-cyan-500/50 outline-none text-white transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
                        <NotificationBox />
                        <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-sm text-white leading-none mb-1">{userName}</p>
                                <p className={`text-xs font-bold leading-none ${planInfo.color}`}>{planInfo.name}</p>
                            </div>
                            <img src={loggedInUser?.avatar || "https://i.pravatar.cc/150?u=alex"} className="size-10 rounded-xl border border-white/10 shadow-lg" alt="Profile" />
                        </div>
                    </div>
                </header>

                <Container fluid className="max-width-xl mx-auto">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-5">
                        <div>
                            <h1 className="display-4 fw-black text-white mb-2 tracking-tighter">My Wallet</h1>
                            <p className="text-info opacity-75 fs-5">Manage your parking funds and payment methods</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="outline-light" className="rounded-pill px-4 py-2 border-opacity-10 fw-bold d-flex align-items-center gap-2 small" onClick={handleShowStatement}>
                                <Download size={18} /> Statement
                            </Button>
                            <Button variant="dark" className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 small" style={{ backgroundColor: '#1f3b3e', border: 'none' }} onClick={handleShowSupport}>
                                <HelpCircle size={18} /> Support
                            </Button>
                        </div>
                    </div>

                    <Row className="g-4">
                        <Col lg={7}>
                            <Card className="rounded-5 p-4 mb-4 position-relative overflow-hidden shadow-lg" style={{ backgroundColor: '#162a2d', minHeight: '260px', border: '1px solid white' }}>
                                <div className="position-absolute top-0 end-0 opacity-10 rounded-circle blur-3xl" style={{ width: '300px', height: '300px', transform: 'translate(30%, -30%)', border: '1px solid white' }}></div>
                                <div className="d-flex justify-content-between position-relative z-1" >
                                    <div>
                                        <p className="text-secondary fw-medium mb-2 d-flex align-items-center gap-2">
                                            <Wallet size={18} className="text-info" /> Available Balance
                                        </p>
                                        <h1 className="display-2 fw-bold text-white tracking-tighter">₹{userBalance}</h1>
                                    </div>
                                    {discountPercentage > 0 && (
                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill d-flex align-items-center px-3 py-2" style={{ height: 'fit-content' }}>
                                            <TrendingUp size={14} className="me-1" /> +{discountPercentage}%
                                        </Badge>
                                    )}
                                </div>

                                    <div className="mt-auto position-relative pt-4">
                                    <p className="text-secondary small fw-bold mb-3 opacity-50 text-uppercase tracking-widest">Quick Top-Up</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        {[100, 200, 500].map(amt => (
                                            <Button 
                                                key={amt} 
                                                variant="outline-light" 
                                                className="rounded-pill px-4 border-opacity-10 hover-info-bg fw-bold text-sm"
                                                onClick={() => handleOpenTopUpModal(amt)}
                                            >
                                                +₹{amt}.00
                                            </Button>
                                        ))}
                                        <Button 
                                            variant="info" 
                                            className="ms-md-3 rounded-pill px-3 fw-black text-dark text-sm shadow-info"
                                            onClick={() => handleOpenTopUpModal()}
                                        >
                                            Add Funds
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h4 className="fw-bold text-white mb-0">Payment Methods</h4>
                                    <Button variant="link" className="text-info text-decoration-none fw-bold p-0 d-flex align-items-center gap-1" onClick={handleShowAddMethod}>
                                        <PlusCircle size={18} /> Add New
                                    </Button>
                                </div>
                                <div className="text-secondary small mb-4" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                    Note: Minimum spend is ₹100
                                </div>

                                <div className="d-flex gap-4 align-items-start flex-column flex-md-row">
                                    {/* Credit Cards - Left Side */}
                                    <div className="flex-grow-1 w-100">
                                        <h6 className="text-white mb-3 fw-bold">Credit Cards</h6>
                                        <div className="d-flex flex-column gap-4">
                                            {creditCards.map((card) => (
                                                <div key={card.id}>
                                                    <div className="card-flipper">
                                                        <div className="card-front p-3 d-flex flex-column justify-content-between">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="card-icon">
                                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D1FF" strokeWidth="1.5">
                                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                                        <circle cx="12" cy="11" r="3" />
                                                                    </svg>
                                                                </div>
                                                                <span className="platinum-text fw-bold">{card.cardType.toUpperCase()}</span>
                                                            </div>

                                                            <div className="mt-2">
                                                                <div className="chip mb-2 d-flex align-items-center justify-content-center">
                                                                    <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
                                                                        <path d="M0 14H38M12 0V28M26 0V28M0 8H12M26 8H38M0 20H12M26 20H38" stroke="black" strokeWidth="0.5" />
                                                                        <rect x="14" y="10" width="10" height="8" rx="1" stroke="black" strokeWidth="0.5" />
                                                                    </svg>
                                                                </div>
                                                                <div className="card-number d-flex justify-content-between align-items-center">
                                                                    <span className="dots fw-bold font-monospace">•••• •••• •••• {card.cardNumber.slice(-4)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex justify-content-between align-items-end mt-2">
                                                                <div>
                                                                    <div className="label text-uppercase opacity-50">Card Holder</div>
                                                                    <div className="name fw-bold">{card.cardholderName}</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="label text-uppercase opacity-50">Expires</div>
                                                                    <div className="expiry fw-bold">{card.expiryMonth} / {card.expiryYear}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-back">
                                                            <div className="card-back-content">
                                                                <div className="strip"></div>
                                                                <div className="back-info">
                                                                    <div>
                                                                        <div className='label'>Authorised Signature</div>
                                                                        <div className='signature'>{card.cardholderName}</div>
                                                                    </div>
                                                                    <div className='cvv'>{card.cvv}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 mt-2">
                                                        <Button variant="outline-info" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleEditCreditCard(card)}>
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleDeleteCreditCard(card.id)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Debit Cards - Right Side */}
                                    <div className="flex-grow-1 w-100">
                                        <h6 className="text-white mb-3 fw-bold">Debit Cards</h6>
                                        <div className="d-flex flex-column gap-4">
                                            {debitCards.map((card) => (
                                                <div key={card.id}>
                                                    <div className="card-flipper">
                                                        <div className="card-front p-3 d-flex flex-column justify-content-between">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="card-icon">
                                                                    <CreditCard size={28} color="#00D1FF" strokeWidth={1.5} />
                                                                </div>
                                                                <span className="platinum-text fw-bold">Debit</span>
                                                            </div>
                                                            <div className="mt-2">
                                                                <div className="chip mb-2 d-flex align-items-center justify-content-center">
                                                                    <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
                                                                        <path d="M0 14H38M12 0V28M26 0V28M0 8H12M26 8H38M0 20H12M26 20H38" stroke="black" strokeWidth="0.5" />
                                                                        <rect x="14" y="10" width="10" height="8" rx="1" stroke="black" strokeWidth="0.5" />
                                                                    </svg>
                                                                </div>
                                                                <div className="card-number d-flex justify-content-between align-items-center">
                                                                    <span className="dots fw-bold font-monospace">•••• •••• •••• {card.cardNumber.slice(-4)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-end mt-2">
                                                                <div>
                                                                    <div className="label text-uppercase opacity-50">Card Holder</div>
                                                                    <div className="name fw-bold">{card.cardholderName}</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="label text-uppercase opacity-50">Expires</div>
                                                                    <div className="expiry fw-bold">{card.expiryMonth} / {card.expiryYear}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-back">
                                                            <div className="card-back-content">
                                                                <div className="strip"></div>
                                                                <div className="back-info">
                                                                    <div>
                                                                        <div className='label'>Authorised Signature</div>
                                                                        <div className='signature'>{card.cardholderName}</div>
                                                                    </div>
                                                                    <div className='cvv'>{card.cvv}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 mt-2">
                                                        <Button variant="outline-info" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleEditDebitCard(card)}>
                                                            Edit
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleDeleteDebitCard(card.id)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* UPI Links UI */}
                                <div className="d-flex flex-column gap-3 mt-4">
                                    {upiLinks.map((upi) => (
                                        <div key={upi.id}>
                                            <div className="card border-0 p-3" style={{ backgroundColor: '#0a1d1d', borderRadius: '15px', border: '2px solid #1a3a3a' }}>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="p-1">
                                                            <img src={logo} alt="UPI" style={{ width: '50px', borderRadius: '50%' }} />
                                                        </div>
                                                        <div className="ms-3">
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <h6 className="text-white mb-0">{upi.upiId}</h6>
                                                                {upi.isDefault && <Badge bg="info" className="text-dark small">PRIMARY</Badge>}
                                                            </div>
                                                            <p className="text-secondary mb-0 small">{upi.upiProvider}</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <Button variant="link" className="p-0 text-decoration-none" onClick={handleShowQR}>
                                                            <QrCode size={18} className="text-light" />
                                                        </Button>

                                                        <Button variant="link" className="p-0 text-decoration-none d-flex align-items-center gap-1" onClick={handleCopy}>
                                                            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} className="text-light" />}
                                                            <small className={copied ? "text-success" : "text-light"}>{copied ? "Copied!" : "Copy"}</small>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2 mt-2">
                                                <Button variant="outline-info" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleEditUPILink(upi)}>
                                                    Edit
                                                </Button>
                                                <Button variant="outline-danger" size="sm" className="flex-grow-1 rounded-3" onClick={() => handleDeleteUPILink(upi.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Col>

                        <Col lg={5}>
                            <Card className="rounded-5 p-3 mb-4" style={{ backgroundColor: '#162a2d', border: '1px solid white' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-secondary small fw-bold mb-1">Total Spent</p>
                                        <h3 className="fw-black text-white">₹0</h3>
                                    </div>
                                    <svg width="120" height="40" viewBox="0 0 120 40">
                                        <rect x="5" y="25" width="8" height="15" rx="2" fill="#4a5568" />
                                        <rect x="18" y="18" width="8" height="22" rx="2" fill="#4a5568" />
                                        <rect x="31" y="5" width="8" height="35" rx="2" fill="#00d1ff" />
                                        <rect x="44" y="18" width="8" height="22" rx="2" fill="#4a5568" />
                                        <rect x="57" y="25" width="8" height="15" rx="2" fill="#4a5568" />
                                        <rect x="70" y="28" width="8" height="12" rx="2" fill="#4a5568" />
                                    </svg>
                                </div>
                            </Card>

                            <Card className="rounded-5 overflow-hidden flex-grow-1" style={{ backgroundColor: '#162a2d', border: '1px solid white', minHeight: '450px' }}>
                                <div className="p-4 border-bottom border-white border-opacity-5 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0 text-white">Recent Activity</h5>
                                    <History size={18} className="text-secondary" />
                                </div>
                                <Table borderless hover className="mb-0 custom-dark-table">
                                    <thead>
                                        <tr>
                                            <th className="bg-transparent text-secondary small fw-bold px-4 py-3 uppercase">Transaction</th>
                                            <th className="bg-transparent text-secondary small fw-bold px-4 py-3 text-end uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <TransactionRow title="No transactions yet" meta="" amount="₹0" status="" />
                                    </tbody>
                                </Table>
                                <div className="p-4 mt-auto border-top border-white border-opacity-5 text-center">
                                    <Button variant="link" className="text-info fw-bold text-decoration-none small p-0">View History</Button>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                {/* --- ADD NEW PAYMENT METHOD MODAL --- */}
                <Modal
                    show={showAddMethod}
                    onHide={handleCloseAddMethod}
                    centered
                    dialogClassName="payment-method-modal"
                    contentClassName="payment-modal-content"
                >
                    <Modal.Body className="payment-modal-body position-relative">

                        {/* Close Button */}
                        <button className="btn-close-payment" onClick={handleCloseAddMethod}>
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="text-center payment-header">
                            <div className="payment-header-icon">
                                <div className="icon-main-glow">
                                    <CreditCard size={24} className="text-info" />
                                    <div className="plus-badge-mini">
                                        <PlusCircle size={10} fill="currentColor" />
                                    </div>
                                </div>
                            </div>

                            <h4 className="fw-bold text-white mt-3 mb-1">
                                Add New Payment Method
                            </h4>
                            <p className="text-secondary small mb-0">
                                Choose how you want to pay for parking
                            </p>
                        </div>

                        {/* Options */}
                        <div className="payment-options">

                            {/* Credit Card */}
                            <div
                                className="payment-option-item"
                                onClick={handleShowCreditCardForm}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="pay-icon-box bg-primary bg-opacity-10 text-primary">
                                        <CreditCard size={22} />
                                    </div>

                                    <div className="option-text">
                                        <h6 className="text-white mb-0 fw-bold">
                                            Credit Card
                                        </h6>
                                        <small className="text-secondary">
                                            Visa, Rupay
                                        </small>
                                    </div>
                                </div>

                                <ChevronRight size={20} className="text-secondary" />
                            </div>

                            {/* Debit Card */}
                            <div
                                className="payment-option-item"
                                onClick={handleShowDebitCardForm}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="pay-icon-box bg-success bg-opacity-10 text-success">
                                        <Landmark size={22} />
                                    </div>

                                    <div className="option-text">
                                        <h6 className="text-white mb-0 fw-bold">
                                            Debit Card
                                        </h6>
                                        <small className="text-secondary">
                                            Visa, Rupay
                                        </small>
                                    </div>
                                </div>

                                <ChevronRight size={20} className="text-secondary" />
                            </div>

                            {/* UPI */}
                            <div
                                className="payment-option-item"
                                onClick={handleShowUPILinkForm}
                            >
                                <div className="d-flex align-items-center">
                                    <div
                                        className="pay-icon-box"
                                        style={{
                                            background: "rgba(167,139,250,0.1)",
                                            color: "#a78bfa"
                                        }}
                                    >
                                        <QrCode size={22} />
                                    </div>

                                    <div className="option-text">
                                        <h6 className="text-white mb-0 fw-bold">
                                            UPI Link
                                        </h6>
                                        <small className="text-secondary">
                                            Google Pay, PhonePe, Paytm
                                        </small>
                                    </div>
                                </div>

                                <ChevronRight size={20} className="text-secondary" />
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="payment-footer">
                            <ShieldCheck size={14} className="text-info" />
                            <span>Your payment info is stored securely</span>
                        </div>

                    </Modal.Body>
                </Modal>

                {/* QR Code Modal */}
                <Modal show={showQR} onHide={handleCloseQR} centered contentClassName="border-0 shadow">
                    <Modal.Body className="text-center p-4" style={{ width: '320px', margin: '0 auto', backgroundColor: 'transparent', borderRadius: '15px', border: '1px solid #1c3a40' }}>
                        <div className="d-flex justify-content-center align-items-center mb-3 position-relative">
                            <div className="text-center"><h5 className="mb-0 fw-bold">Wallet QRCode</h5></div>
                            <button type="button" className="btn-close position-absolute end-0 top-0" onClick={handleCloseQR}></button>
                        </div>
                        <hr className="mb-4" />
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`} alt="Wallet QR" className="img-fluid mb-3 mx-auto d-block" style={{ width: '180px', height: '180px' }} />
                        <div className="mt-2 mb-4 text-center">
                            <div className="text-muted small">UPI ID:</div>
                            <div className="fw-medium text-muted mt-1" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{walletAddress}</div>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* Credit Card Form */}
                {showCreditCardForm && (
                    <CreditCardForm
                        onClose={handleCloseCreditCardForm}
                        onSubmit={handleAddCreditCard}
                        initialData={editingCreditCard}
                    />
                )}

                {/* Debit Card Form */}
                {showDebitCardForm && (
                    <DebitCardForm
                        onClose={handleCloseDebitCardForm}
                        onSubmit={handleAddDebitCard}
                        initialData={editingDebitCard}
                    />
                )}

                {/* UPI Link Form */}
                {showUPILinkForm && (
                    <UPILinkForm
                        onClose={handleCloseUPILinkForm}
                        onSubmit={handleAddUPILink}
                        initialData={editingUPILink}
                    />
                )}

                {/* TopUp Modal */}
                <TopUpModal
                    isOpen={showTopUpModal}
                    onClose={handleCloseTopUpModal}
                    currentBalance={parseFloat(userBalance) || 0}
                    onSuccess={handleTopUpSuccess}
                    initialAmount={selectedTopUpAmount}
                />

                {/* Statement Modal */}
                <Modal show={showStatement} onHide={handleCloseStatement} centered
                    size="lg"
                    dialogClassName="support-modal"
                    backdropClassName="support-backdrop" className="p-5" style={{ backgroundColor: '#09191f', borderRadius: '15px', border: '1px solid #1c3a40' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-white mb-0 mr-4">Wallet Statement</h4>
                        <button type="button" className="btn-close ml-4 btn-close-white" onClick={handleCloseStatement}></button>
                    </div>

                    <div
                        className="mb-4 p-4 rounded-3"
                        style={{ backgroundColor: "#162a2d", border: "1px solid #1c3a40" }}
                    >
                        <div className="row text-center align-items-center">

                            <div className="col-md-4 mb-3 mb-md-0">
                                <p className="text-secondary small mb-1">Available Balance</p>
                                <h5 className="text-white fw-bold mb-0">₹{userBalance}</h5>
                            </div>

                            <div className="col-md-4 mb-3 mb-md-0">
                                <p className="text-secondary small mb-1">Total Spent</p>
                                <h5 className="text-white fw-bold mb-0">₹0</h5>
                            </div>

                            <div className="col-md-4">
                                <p className="text-secondary small mb-1">Total Top-ups</p>
                                <h5 className="text-white fw-bold mb-0">₹0</h5>
                            </div>
                        </div>
                    </div>


                    <h6 className="text-white fw-bold mb-3">Recent Transactions</h6>
                    <div className="table-responsive">
                        <Table borderless hover className="custom-dark-table" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th className="bg-transparent text-secondary small fw-bold py-2 text-start">Date</th>
                                    <th className="bg-transparent text-secondary small fw-bold py-2 text-start">Description</th>
                                    <th className="bg-transparent text-secondary small fw-bold py-2 text-end">Amount</th>
                                    <th className="bg-transparent text-secondary small fw-bold py-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-3 text-secondary small text-start">-</td>
                                    <td className="py-3 text-white small text-start">No transactions yet</td>
                                    <td className="py-3 text-white fw-bold text-end">₹0</td>
                                    <td className="py-3 text-center">-</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    <div className="mt-4 d-flex gap-2 justify-content-between align-items-center">
                        <Button
                            variant="outline-light"
                            className="flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleDownloadStatement}
                        >
                            <Download size={16} />
                            <span>Download Statement</span>
                        </Button>
                    </div>

                </Modal>

                <Modal show={showSupport}
                    onHide={handleCloseSupport}
                    centered
                    size="lg"
                    dialogClassName="support-modal"
                    backdropClassName="support-backdrop" className="p-4" style={{ backgroundColor: '#09191f', borderRadius: '15px', border: '1px solid #1c3a40' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-white mb-0 mr-4">Support Center</h4>
                        <button type="button" className="btn-close ml-4 btn-close-white" onClick={handleCloseSupport}></button>
                    </div>

                    <div className="mb-4">
                        <h6 className="text-white fw-bold mb-3">How can we help?</h6>
                        <div className="d-flex flex-column gap-3">
                            <div className="p-3 rounded-3" style={{ backgroundColor: '#162a2d', border: '1px solid #1c3a40', cursor: 'pointer' }} onClick={() => alert('Redirecting to FAQ page...')}>
                                <h6 className="text-white fw-bold mb-1">Frequently Asked Questions</h6>
                                <p className="text-secondary small mb-0">Find answers to common questions about our parking system</p>
                            </div>

                            <div className="p-3 rounded-3" style={{ backgroundColor: '#162a2d', border: '1px solid #1c3a40', cursor: 'pointer' }} onClick={() => alert('Opening live chat...')}>
                                <h6 className="text-white fw-bold mb-1">Live Chat Support</h6>
                                <p className="text-secondary small mb-0">Chat with our support team available 24/7</p>
                            </div>

                            <div className="p-3 rounded-3" style={{ backgroundColor: '#162a2d', border: '1px solid #1c3a40', cursor: 'pointer' }} onClick={() => alert('Opening email form...')}>
                                <h6 className="text-white fw-bold mb-1">Email Support</h6>
                                <p className="text-secondary small mb-0">Email us at support@parkingsystem.com</p>
                            </div>

                            <div className="p-3 rounded-3" style={{ backgroundColor: '#162a2d', border: '1px solid #1c3a40', cursor: 'pointer' }} onClick={() => alert('Phone: +91-1234-5678-90')} >
                                <h6 className="text-white fw-bold mb-1">Phone Support</h6>
                                <p className="text-secondary small mb-0">Call us: +91-1234-5678-90 (Mon-Fri: 9AM-6PM)</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#162a2d', border: '1px solid #1c3a40' }}>
                        <h6 className="text-white fw-bold mb-2">Quick Links</h6>
                        <div className="d-flex flex-wrap gap-2">
                            <Button variant="outline-info" size="sm" className="rounded-2" onClick={() => alert('Viewing terms...')}>
                                Terms & Conditions
                            </Button>
                            <Button variant="outline-info" size="sm" className="rounded-2" onClick={() => alert('Viewing privacy policy...')}>
                                Privacy Policy
                            </Button>
                            <Button variant="outline-info" size="sm" className="rounded-2" onClick={() => alert('Submitting feedback...')}>
                                Submit Feedback
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 d-flex gap-2 justify-content-between align-items-center">
                        <Button variant="info" className="flex-grow-1 rounded-3 fw-bold">Contact Support</Button>
                    </div>
                </Modal>
            </main>
        </div>
    );
};

const TransactionRow = ({ title, meta, amount, status, isCredit = false }) => (
    <tr>
        <td className="px-4 py-3">
            <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center p-2" style={{ backgroundColor: isCredit ? 'rgba(255,255,255,0.05)' : 'rgba(6, 224, 249, 0.1)' }}>
                    {isCredit ? <PlusCircle size={18} className="text-white" /> : <ParkingCircle size={18} className="text-info" />}
                </div>
                <div>
                    <p className="mb-0 fw-bold text-white small">{title}</p>
                    <p className="mb-0 text-secondary" style={{ fontSize: '11px' }}>{meta}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3 text-end">
            <p className={`mb-0 fw-bold small ${isCredit ? 'text-success' : 'text-white'}`}>{amount}</p>
            <p className="mb-0 text-success fw-bold text-uppercase" style={{ fontSize: '10px' }}>{status}</p>
        </td>
    </tr>
);

export default WalletView;
