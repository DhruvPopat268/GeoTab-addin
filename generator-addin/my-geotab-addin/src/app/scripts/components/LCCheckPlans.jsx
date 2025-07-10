import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Shield, Clock, CreditCard, X } from 'lucide-react';
import Navbar from './Navbar.jsx';

import axios from 'axios';
import './componentStyles/LCCheckPlans.css';
import { API_URL, BASE_URL } from '../../../env.js';
import { toast } from 'react-toastify';


const LCCheckPlans = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/plans`);
      console.log(res);
      const formatted = res.data.map((plan) => ({
        ...plan,
        duration: '1 month',
        features: [
          `${plan.includedCalls.toLocaleString()} API calls per month`,
          'Basic support',
          'Standard response time',
          'Email notifications',
        ],
        isPopular: plan.name === 'Standard',
        colorClass:
          plan.name === 'Enterprise'
            ? 'border-purple'
            : plan.name === 'Standard'
              ? 'border-blue'
              : 'border-gray',
      }));
      setPlans(formatted);
    } catch (err) {
      toast.error({ title: 'Error fetching plans', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePurchase = (planId) => {
    const plan = plans.find(p => p._id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowConfirmation(true);
    }
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;

    setPurchasing(true);
    try {
      const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
      const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
      const userName = sessionData?.userName || "unknown@user.com";

      const response = await axios.post(`${BASE_URL}/api/UserWallet/purchase`, {
        userId: userName,
        planId: selectedPlan._id,
        planDetails: {
          price: selectedPlan.price,
          includedCalls: selectedPlan.includedCalls,
          name: selectedPlan.name
        }
      });

      if (response.status === 200) {
        toast.success(`${selectedPlan.name} plan has been purchased successfully.`);
        setShowConfirmation(false);
        setSelectedPlan(null);
      }
    } catch (err) {
      // toast({
      //   title: 'Purchase Failed',
      //   description: err.response?.data?.message || err.message
      // });
      toast.error(err.response?.data?.message);
    } finally {
      setPurchasing(false);
    }
  };

  const cancelPurchase = () => {
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
  console.log(sessionDataRaw);
  const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
  console.log(sessionData);
  const userName = sessionData?.userName || "unknown@user.com";
  console.log(userName);

  return (
    <div className="lc-main">
      <Navbar />

      <div className="lc-header-section">
        <div className="lc-header-container">
          <div className="lc-header-content">
            <h1
              className="text-[28px] font-light leading-[36px] not-italic tracking-[0] normal-case"
              style={{ fontFamily: "var(--main-font)" }}
            >
              LC Check API Plans
            </h1>

            <p className="lc-main-description">
              {/* Simplify Your LC Check Verifications – Choose the Perfect Plan Today */}
              {/* Choose the perfect plan for your LC Check verification needs. */}
              {/* Our API provides comprehensive document validation and compliance checking. */}
            </p>
          </div>
        </div>
      </div>

      <div className="lc-container">
        {loading ? (
          <div className="lc-loading">
                <div className="spinner-container">
                  <div className="spinner" />
                </div>
          </div>
        ) : (
          <div className="lc-grid">
            {plans.map(plan => {
              const pricePerCall = (plan.price / plan.includedCalls).toFixed(3);
              return (
                <div
                  key={plan._id}
                  className={`lc-card ${plan.isPopular ? 'lc-card-popular' : ''}`}
                >
                  <div className="lc-card-content">
                    <div className="lc-plan-header">
                      <h2 className="lc-plan-name">{plan.name}</h2>
                      <div className="lc-pricing">
                        <span className="lc-price">£{plan.price}</span>
                        <span className="lc-price-period">/month</span>
                      </div>
                      <div className="lc-price-details">
                        <p className="lc-price-per-call">£{pricePerCall} per call</p>
                        <p className="lc-validity">Valid for {plan.duration}</p>
                      </div>
                    </div>

                    <div className="lc-api-calls-highlight">
                      <div className="lc-api-calls-content">
                        <Zap size={20} className="lc-zap-icon" />
                        <span className="lc-api-calls-text">
                          {plan.includedCalls.toLocaleString()} API calls
                        </span>
                      </div>
                    </div>

                    <ul className="lc-features-list">
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} className="lc-feature-item">
                          <Check size={16} className="lc-check-icon" />
                          <span className="lc-feature-text">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="lc-highlights">
                      <div className="lc-highlight-item">
                        <Shield size={16} className="lc-shield-icon" />
                        <span>Enterprise-grade security</span>
                      </div>
                      <div className="lc-highlight-item">
                        <Clock size={16} className="lc-clock-icon" />
                        <span>Instant activation</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(plan._id)}
                      className={`lc-purchase-btn ${plan.isPopular ? 'lc-purchase-btn-popular' : ''}`}
                    >
                      <CreditCard size={16} className="lc-btn-icon" />
                      Get {plan.name} Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* <div className="lc-info-section">
          <div className="lc-info-header">
            <h2 className="lc-info-title">What is LC Check API?</h2>
            <p className="lc-info-description">
              Our LC Check API provides comprehensive LC Check verification and validation services.
              It helps financial institutions, banks, and businesses verify the authenticity and compliance
              of trade documents in international commerce.
            </p>
          </div>

          <div className="lc-info-grid">
            <div className="lc-info-item">
              <div className="lc-info-icon lc-info-icon-blue">
                <Shield size={32} />
              </div>
              <h3 className="lc-info-item-title">Secure Verification</h3>
              <p className="lc-info-item-text">
                Bank-grade security for document validation
              </p>
            </div>

            <div className="lc-info-item">
              <div className="lc-info-icon lc-info-icon-green">
                <Zap size={32} />
              </div>
              <h3 className="lc-info-item-title">Real-time Processing</h3>
              <p className="lc-info-item-text">
                Instant API responses for time-critical operations
              </p>
            </div>

            <div className="lc-info-item">
              <div className="lc-info-icon lc-info-icon-purple">
                <Check size={32} />
              </div>
              <h3 className="lc-info-item-title">Compliance Ready</h3>
              <p className="lc-info-item-text">
                Meets international trade compliance standards
              </p>
            </div>
          </div>
        </div>

        <div className="lc-trust-section">
          <div className="lc-trust-content">
            <p className="lc-trust-text">Trusted by financial institutions worldwide</p>
            <div className="lc-trust-indicators">
              <div className="lc-trust-item">
                <Shield size={16} />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="lc-trust-item">
                <Check size={16} />
                <span>99.9% Uptime</span>
              </div>
              <div className="lc-trust-item">
                <Clock size={16} />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="lc-modal-overlay">
          <div className="lc-modal">
            <div className="lc-modal-header">
              <h3 className="lc-modal-title">Confirm Purchase</h3>
              <button
                onClick={cancelPurchase}
                className="lc-modal-close"
                disabled={purchasing}
              >
                <X size={20} />
              </button>
            </div>

            <div className="lc-modal-body">
              <p className="lc-modal-text">
                Do you want to purchase the <strong>{selectedPlan?.name}</strong> plan?
              </p>
              <div className="lc-modal-plan-details">
                <div className="lc-modal-detail">
                  <span className="lc-modal-detail-label">Price:</span>
                  <span className="lc-modal-detail-value">£{selectedPlan?.price}/month</span>
                </div>
                <div className="lc-modal-detail">
                  <span className="lc-modal-detail-label">API Calls:</span>
                  <span className="lc-modal-detail-value">
                    {selectedPlan?.includedCalls.toLocaleString()} calls
                  </span>
                </div>
              </div>
            </div>

            <div className="lc-modal-footer">
              <button
                onClick={cancelPurchase}
                className="lc-modal-btn lc-modal-btn-cancel"
                disabled={purchasing}
              >
                No, Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="lc-modal-btn lc-modal-btn-confirm"
                disabled={purchasing}
              >
                {purchasing ? 'Processing...' : 'Yes, Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LCCheckPlans;