import React, { useState } from 'react';
import {
  Plus, Minus, ArrowUpRight, ArrowDownLeft, CreditCard, CheckCircle
} from 'lucide-react';
import Navbar from './Navbar.jsx';

import './componentStyles/wallet.css';

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance] = useState(125.50);

  const transactions = [
    { id: '1', type: 'deposit', amount: 50.00, description: 'PayPal Deposit', date: '2024-01-15 14:30', status: 'completed' },
    { id: '2', type: 'purchase', amount: -25.00, description: 'Weather API - Pro Plan', date: '2024-01-14 09:15', status: 'completed' },
    { id: '3', type: 'deposit', amount: 100.00, description: 'PayPal Deposit', date: '2024-01-10 16:45', status: 'completed' },
    { id: '4', type: 'purchase', amount: -15.00, description: 'Currency Exchange API - Basic Plan', date: '2024-01-08 11:20', status: 'completed' },
  ];

  const handlePayPalDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount && amount > 0) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        alert(`£${amount} has been deposited via PayPal.`);
        setDepositAmount('');
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
                <div className="balance">£{balance.toFixed(2)}</div>
                <div className="small-text">Available for API purchases</div>
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

                <button
                  className="paypal-button"
                  onClick={handlePayPalDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isProcessing}
                >
                  {isProcessing ? (
                    <div className="spinner">Processing...</div>
                  ) : (
                    <div className="paypal-button-content">
                      <span className="method-icon white">PP</span>
                      <span>Pay with PayPal</span>
                    </div>
                  )}
                </button>

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
                    <button key={type}>{type}</button>
                  ))}
                </div>
                <div className="transactions">
                  {transactions.map(transaction => (
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
                          <div className="bold-text">{transaction.description}</div>
                          <div className="small-text">{formatDate(transaction.date)}</div>
                        </div>
                      </div>
                      <div className="transaction-right">
                        <div className={`amount ${transaction.amount > 0 ? 'green' : 'red'}`}>
                          {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <span className="badge">{transaction.status}</span>
                      </div>
                    </div>
                  ))}
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
