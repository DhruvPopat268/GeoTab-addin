import React, { useEffect, useState } from 'react';
import {
  Plus, Minus, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle
} from 'lucide-react';
import Navbar from './Navbar.jsx';
import './componentStyles/wallet.css';
import PayPalButton from './PayPalButton.jsx';
import { BASE_URL } from '../../../env.js';
import axios from 'axios';

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const userId = 'AdzFLx8B3bT4BvapWjPUh-G4dXzdrvWCkXXmrW0Z6rjMAav5WfrcAMMxxmya4JSB_T-CKiuX_ADEDapn';

  const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";

  // Fetch wallet data from API
  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/api/UserWallet/wallet` , {userId:userName});
      setWalletData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Combine and sort transactions
  const getAllTransactions = () => {
    if (!walletData) return [];

    const payments = walletData.payments.map(payment => ({
      id: payment._id,
      type: 'deposit',
      amount: payment.amount,
      description: 'PayPal Deposit',
      date: payment.date,
      status: 'completed',
      paypalId: payment.paypalId
    }));

    const purchases = walletData.purchases.map(purchase => ({
      id: purchase._id,
      type: 'purchase',
      amount: -purchase.amount,
      name: `${purchase.name} Plan`,
      date: purchase.date,
      status: 'completed',
      credits: purchase.credits
    }));

    return [...payments, ...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    const allTransactions = getAllTransactions();
    
    switch (activeTab) {
      case 'deposits':
        return allTransactions.filter(t => t.type === 'deposit');
      case 'purchases':
        return allTransactions.filter(t => t.type === 'purchase');
      default:
        return allTransactions;
    }
  };

  const handlePayPalDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount && amount > 0) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        alert(`£${amount} has been deposited via PayPal.`);
        setDepositAmount('');
        // Refresh wallet data after successful deposit
        fetchWalletData();
      }, 2000);
    } else {
      alert('Please enter a valid deposit amount.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  

  if (loading) {
    return (
      <div className="wallet">
        <Navbar />
        <div className="wallet-container">
          <div className="loading">Loading wallet data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet">
        <Navbar />
        <div className="wallet-container">
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchWalletData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet">
      <Navbar />

      <div className="wallet-container">
        <h1 className="wallet-title">My Wallet</h1>
        <p className="wallet-subtitle">Manage your account balance and transaction history</p>

        <div className="wallet-grid">
          <div className="wallet-left">
            <div className="card">
              <div className="card-header">
                <CreditCard className="icon-green" />
                <span>Account Balance</span>
              </div>
              <div className="card-content">
                <div className="balance">£{walletData?.balance?.toFixed(2) || '0.00'}</div>
                <div className="small-text">Available for API purchases</div>
                {walletData?.credits && (
                  <div className="credits-info">
                    <div className="small-text">Credits: {walletData.credits}</div>
                  </div>
                )}
                {walletData?.currentPlan && (
                  <div className="current-plan">
                    <div className="small-text">Current Plan: {walletData.currentPlan.description}</div>
                    <div className="small-text">Expires: {formatDate(walletData.currentPlan.expiryDate)}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <Plus className="icon-blue" />
                <span>Add Funds</span>
              </div>
              <div className="card-content">
                <label>Payment Method</label>
                <div className={`method-box ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod('paypal')}>
                  <div className="method-flex">
                    <div className="method-icon">PP</div>
                    <div>
                      <div className="bold-text">PayPal</div>
                      <div className="small-text">Secure online payments</div>
                    </div>
                    {selectedPaymentMethod === 'paypal' && <CheckCircle className="icon-blue" />}
                  </div>
                </div>

                <label>Deposit Amount (£)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                />

                <label>Quick Select</label>
                <div className="quick-buttons">
                  {[10, 25, 50, 100].map(amount => (
                    <button key={amount} onClick={() => setDepositAmount(amount.toString())}>£{amount}</button>
                  ))}
                </div>

                {selectedPaymentMethod === 'paypal' && depositAmount > 0 && (
                  <div className="paypal-button">
                    <PayPalButton
                      amount={parseFloat(depositAmount)}
                      userId={userId}
                      onSuccess={(data) => {
                        alert(`£${depositAmount} deposited successfully!`);
                        setDepositAmount('');
                        setIsProcessing(false);
                        // Refresh wallet data after successful deposit
                        fetchWalletData();
                      }}
                    />
                  </div>
                )}

                <div className="secure-box">
                  <CheckCircle className="icon-green" size={16} />
                  <span>Secure Payment</span>
                  <p>Your payment is encrypted and secure via PayPal.</p>
                </div>

                <div className="limits">
                  <p>Minimum deposit: £1.00</p>
                  <p>Maximum deposit: £1,000.00</p>
                  <p>Processing time: Instant</p>
                </div>
              </div>
            </div>
          </div>

          <div className="wallet-right">
            <div className="card">
              <div className="card-header">Transaction History</div>
              <div className="card-content">
                <div className="tabs">
                  {['all', 'deposits', 'purchases'].map(type => (
                    <button 
                      key={type}
                      className={activeTab === type ? 'active' : ''}
                      onClick={() => setActiveTab(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="transactions">
                  {getFilteredTransactions().length === 0 ? (
                    <div className="no-transactions">
                      <p>No {activeTab === 'all' ? '' : activeTab} transactions found.</p>
                    </div>
                  ) : (
                    getFilteredTransactions().map(transaction => (
                      <div key={transaction.id} className="transaction">
                        <div className="transaction-left">
                          <div className={`circle-icon ${transaction.type}`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownLeft className="icon-green" />
                            ) : (
                              <ArrowUpRight className="icon-red" />
                            )}
                          </div>
                          <div>
                            <div className="bold-text">{transaction.name}</div>
                            <div className="small-text">{formatDate(transaction.date)}</div>
                            {transaction.paypalId && (
                              <div className="small-text">PayPal ID: {transaction.paypalId}</div>
                            )}
                            {transaction.credits && (
                              <div className="small-text">Credits: {transaction.credits}</div>
                            )}
                          </div>
                        </div>
                        <div className="transaction-right">
                          <div className={`amount ${transaction.amount > 0 ? 'green' : 'red'}`}>
                            {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <span className="badge">{transaction.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;