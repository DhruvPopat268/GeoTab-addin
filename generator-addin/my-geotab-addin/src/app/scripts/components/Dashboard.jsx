import React, { useState, useEffect } from 'react';
import { Activity, CreditCard, Zap, TrendingUp, Eye } from 'lucide-react';
import Navbar from './Navbar.jsx';
import './componentStyles/dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'YOUR_BASE_URL'}/api/UserWallet/wallet`);
        if (!response.ok) {
          throw new Error('Failed to fetch wallet data');
        }
        const data = await response.json();
        setWalletData(data);
      } catch (err) {
        setError(err.message);
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
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Loading your account data...</p>
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
            <h1 className="dashboard-title">Dashboard</h1>
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
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your API usage and account activity</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Wallet Balance</span>
              <CreditCard className="icon green" />
            </div>
            <div className="stat-value green">£{userStats.walletBalance}</div>
            <p className="stat-description">Available for purchases</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Total Credits</span>
              <TrendingUp className="icon blue" />
            </div>
            <div className="stat-value">{userStats.totalCredits}</div>
            <p className="stat-description">
              {walletData?.currentPlan?.description || 'Current'} Plan
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Credits Used</span>
              <Activity className="icon purple" />
            </div>
            <div className="stat-value">{userStats.creditsUsed}</div>
            <p className="stat-description">From current plan</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Credits Left</span>
              <Zap className="icon orange" />
            </div>
            <div className="stat-value">{userStats.creditsLeft}</div>
            <p className="stat-description">Remaining credits</p>
          </div>
        </div>

        <div className="dashboard-sections">
          {/* Current Plan Info */}
          {walletData?.currentPlan && (
            <div className="section">
              <h2 className="section-title">Current Plan</h2>
              <div className="subscription">
                <div className="subscription-header">
                  <div>
                    <h3>{walletData.currentPlan.description} Plan</h3>
                    <p className="subscription-plan">
                      £{walletData.currentPlan.amount} - {walletData.currentPlan.credits} credits
                    </p>
                  </div>
                  <span className="subscription-badge">active</span>
                </div>
                <div className="subscription-body">
                  <div className="subscription-usage">
                    <span>Usage</span>
                    <span>
                      {walletData.credits} / {walletData.currentPlan.credits} credits
                    </span>
                  </div>
                  <progress 
                    max="100" 
                    value={(walletData.credits / walletData.currentPlan.credits) * 100}
                  ></progress>
                  <div className="subscription-footer">
                    <span>{Math.max(0, walletData.currentPlan.credits - walletData.credits)} credits remaining</span>
                    <span>Valid until {new Date(walletData.currentPlan.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Subscription */}
          {walletData?.currentPlan && (
            <div className="section">
              <h2 className="section-title">Active Subscription</h2>
              <div className="subscription">
                <div className="subscription-header">
                  <div>
                    <h3>{walletData.currentPlan.description} Plan</h3>
                    <p className="subscription-plan">
                      £{walletData.currentPlan.amount} - {walletData.currentPlan.credits} credits
                    </p>
                  </div>
                  <span className="subscription-badge">active</span>
                </div>
                <div className="subscription-body">
                  <div className="subscription-usage">
                    <span>Usage</span>
                    <span>
                      {walletData.credits} / {walletData.currentPlan.credits} credits
                    </span>
                  </div>
                  <progress
                    max="100"
                    value={(walletData.credits / walletData.currentPlan.credits) * 100}
                  ></progress>
                  <div className="subscription-footer">
                    <span>{Math.max(0, walletData.currentPlan.credits - walletData.credits)} credits remaining</span>
                    <span>Valid until {new Date(walletData.currentPlan.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="button-container">
                <Link to="/">
                  <button className="outline-btn">Browse More Plans</button>
                </Link>
              </div>
            </div>
          )}

          {/* Show message if no active plan */}
          {!walletData?.currentPlan && (
            <div className="section">
              <h2 className="section-title">Active Subscription</h2>
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
              <div className="button-container">
                <Link to="/">
                  <button className="outline-btn">Browse Plans</button>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Purchases */}
          {walletData?.purchases && walletData.purchases.length > 0 && (
            <div className="section">
              <h2 className="section-title">Recent Purchases</h2>
              {walletData.purchases.slice(-3).reverse().map((purchase, index) => (
                <div key={purchase._id || index} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-info">
                    <div className="activity-action">
                      <span>Plan Purchase</span>
                      <CreditCard size={14} className="eye-icon" />
                    </div>
                    <div className="activity-api">
                      {purchase.description} Plan - £{purchase.amount} ({purchase.credits} credits)
                    </div>
                  </div>
                  <div className="activity-time">
                    {new Date(purchase.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity */}
          <div className="section">
            <h2 className="section-title">Recent Activity</h2>
            {recentActivity.map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-info">
                  <div className="activity-action">
                    <span>{item.action}</span>
                    {item.action === 'API Call' && <Eye size={14} className="eye-icon" />}
                  </div>
                  <div className="activity-api">{item.api}</div>
                </div>
                <div className="activity-time">{item.timestamp}</div>
              </div>
            ))}
            <div className="button-container">
              <button className="outline-btn">View All Activity</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;