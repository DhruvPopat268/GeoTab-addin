import React , {useEffect,useContext } from 'react';
import { Activity, CreditCard, Zap, TrendingUp, Eye } from 'lucide-react';
import Navbar from './Navbar.jsx';
import './componentStyles/dashboard.css';
import { Link } from 'react-router-dom';
import GeotabContext from '../contexts/Geotab.js'

const Dashboard = () => {
  const userStats = {
    totalSpent: 65.0,
    totalCalls: 8750,
    activeApis: 3,
    walletBalance: 125.5,
  };

  const activeSubscriptions = [
    {
      id: '1',
      apiName: 'Weather API',
      plan: 'Pro',
      price: 25,
      creditsUsed: 2840,
      creditsTotal: 5000,
      validUntil: '2024-02-15',
      status: 'active',
    },
    {
      id: '2',
      apiName: 'Currency Exchange API',
      plan: 'Basic',
      price: 15,
      creditsUsed: 1650,
      creditsTotal: 2000,
      validUntil: '2024-02-10',
      status: 'active',
    },
    {
      id: '3',
      apiName: 'News API',
      plan: 'Starter',
      price: 12,
      creditsUsed: 1200,
      creditsTotal: 1500,
      validUntil: '2024-02-08',
      status: 'active',
    },
  ];

  const recentActivity = [
    { id: '1', action: 'API Call', api: 'Weather API', timestamp: '2 minutes ago' },
    { id: '2', action: 'API Call', api: 'Currency Exchange API', timestamp: '15 minutes ago' },
    { id: '3', action: 'Plan Purchase', api: 'News API - Starter', timestamp: '2 hours ago' },
    { id: '4', action: 'API Call', api: 'Weather API', timestamp: '3 hours ago' },
  ];

  const [context] = useContext(GeotabContext);
  const user = context?.loggedInUser;

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <h1>Welcome {user.name}</h1>
      <p>Email: {user.name}</p>
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
              <span>Total Spent</span>
              <TrendingUp className="icon blue" />
            </div>
            <div className="stat-value">£{userStats.totalSpent}</div>
            <p className="stat-description">This month</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>API Calls Made</span>
              <Activity className="icon purple" />
            </div>
            <div className="stat-value">{userStats.totalCalls.toLocaleString()}</div>
            <p className="stat-description">Total calls</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Active APIs</span>
              <Zap className="icon orange" />
            </div>
            <div className="stat-value">{userStats.activeApis}</div>
            <p className="stat-description">Subscriptions</p>
          </div>
        </div>

        <div className="dashboard-sections">
          {/* Subscriptions */}
          <div className="section">
            <h2 className="section-title">Active Subscriptions</h2>
            {activeSubscriptions.map(sub => {
              const usagePercentage = (sub.creditsUsed / sub.creditsTotal) * 100;
              const remaining = sub.creditsTotal - sub.creditsUsed;
              return (
                <div key={sub.id} className="subscription">
                  <div className="subscription-header">
                    <div>
                      <h3>{sub.apiName}</h3>
                      <p className="subscription-plan">
                        {sub.plan} Plan - £{sub.price}/month
                      </p>
                    </div>
                    <span className="subscription-badge">{sub.status}</span>
                  </div>

                  <div className="subscription-body">
                    <div className="subscription-usage">
                      <span>Usage</span>
                      <span>
                        {sub.creditsUsed.toLocaleString()} /{' '}
                        {sub.creditsTotal.toLocaleString()} calls
                      </span>
                    </div>
                    <progress max="100" value={usagePercentage}></progress>
                    <div className="subscription-footer">
                      <span>{remaining.toLocaleString()} calls remaining</span>
                      <span>Valid until {new Date(sub.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="button-container">
              <Link to="/">
                <button className="outline-btn">Browse More APIs</button>
              </Link>
            </div>
          </div>

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
