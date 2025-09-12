import React, { useState, useEffect } from 'react';
import { Activity, CreditCard, Zap, TrendingUp, Eye } from 'lucide-react';
import Navbar from './Navbar.jsx';
import './componentStyles/dashboard.css';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../../env.js';
import axios from 'axios';

const Dashboard = () => {
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const key = Object.keys(localStorage).find(k => k.startsWith("sTokens_"));

const sessionDataRaw = key ? localStorage.getItem(key) : null;

console.log("Key:", key);
console.log("Value:", sessionDataRaw);

  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  const userName = sessionData?.userName || "unknown@user.com";
  const database = sessionData?.database || "unknown_database";

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/UserWallet/wallet`, {
          userId: userName,
          database
        });

        setWalletData(response.data); // response.data holds the returned JSON
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Calculate dynamic stats based on API data
  const calculateUserStats = () => {
    if (!walletData) return { walletBalance: 0, totalCredits: 0, creditsUsed: 0, creditsLeft: 0 };

    const walletBalance = walletData.balance || 0;
    const totalCredits = walletData.currentPlan?.credits || 0;
    const creditsUsed = walletData.credits || 0;
    const creditsLeft = totalCredits - creditsUsed;

    return {
      walletBalance,
      totalCredits,
      creditsUsed,
      creditsLeft: Math.max(0, creditsLeft) // Ensure non-negative
    };
  };

  const userStats = calculateUserStats();

  const recentActivity = [
    { id: '1', action: 'API Call', api: 'Weather API', timestamp: '2 minutes ago' },
    { id: '2', action: 'API Call', api: 'Currency Exchange API', timestamp: '15 minutes ago' },
    { id: '3', action: 'Plan Purchase', api: 'News API - Starter', timestamp: '2 hours ago' },
    { id: '4', action: 'API Call', api: 'Weather API', timestamp: '3 hours ago' },
  ];

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case" style={{ fontFamily: "var(--main-font)" }}>
              Dashboard
            </h1>
            <div className="spinner-container">
              <div className="spinner" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case" style={{ fontFamily: "var(--main-font)" }}>
              Dashboard
            </h1>
            <p className="dashboard-subtitle">Error loading data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case" style={{ fontFamily: "var(--main-font)" }}>
            Dashboard
          </h1>
          <p className="dashboard-subtitle">Overview of your API usage and account activity</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Wallet Balance</span>
              <CreditCard className="icon green" />
            </div>
            <div className="stat-value green">£{walletData.balance || 0} </div>
            <p className="stat-description">Available for purchases</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Total Credits</span>
              <TrendingUp className="icon blue" />
            </div>
            <div className="stat-value">{walletData.credits || 0}</div>
            <div className="stat-note">
              <p>
                **plan will Expire at {new Date(walletData.currentPlan?.expiryDate).toLocaleDateString('en-GB')}
              </p>

              <p>**if you will not use credits till expiry date credits will 0</p>
            </div>
          </div>

        </div>

        <div className="dashboard-sections">

          {/* Active Subscription */}
          {walletData?.currentPlan && (
            <div className="section">
              <h2
                className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
                style={{ fontFamily: "var(--main-font)" }}
              >
                Active Subscription
              </h2>

              <div className="subscription">
                <div className="subscription-header">
                  <div>
                    <h3>{walletData.currentPlan.name} Plan</h3>
                    <p className="subscription-plan">
                      £{walletData.currentPlan.amount} - {walletData.currentPlan.credits} credits
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Show message if no active plan */}
          {!walletData?.currentPlan && (
            <div className="section">
              <h2
                className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
                style={{ fontFamily: "var(--main-font)" }}
              >
                Active Subscription
              </h2>

              <div className="subscription">
                <div className="subscription-header">
                  <div>
                    <h3>No Active Plan</h3>
                    <p className="subscription-plan">
                      Subscribe to a plan to start using our APIs
                    </p>
                  </div>
                  <span className="subscription-badge inactive">inactive</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;