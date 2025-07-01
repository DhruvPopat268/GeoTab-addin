import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, ShoppingCart, User, Home, CreditCard , CheckCircle , Package , Activity } from 'lucide-react';
import './componentStyles/navbar.css';

const Navbar = () => {
  const location = useLocation();

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/lc-check', label: 'LC Check', icon: CheckCircle },
  { path: '/lc-check-usage', label: 'API Usage', icon: Activity },

  { path: '/lc-check-api-plans', label: 'LC Check API Plans', icon: Package },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
];


  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              API Hub
            </Link>
          </div>

          <div className="navbar-links">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`navbar-link ${location.pathname === path ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-right">
            <div className="navbar-balance">
              <CreditCard size={16} className="balance-icon" />
              <span className="balance-text">£125.50</span>
            </div>
            <div className="navbar-user-icon">
              <User size={18} className="user-icon" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
