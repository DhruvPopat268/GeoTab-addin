import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Shield, Clock } from 'lucide-react';
import Navbar from './Navbar.jsx';
import { useToast } from '../hooks/use-toast.jsx';
import './componentStyles/LCCheckPlans.css';

const LCCheckPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 15,
      calls: 1000,
      duration: '1 month',
      features: [
        '1,000 API calls per month',
        'Basic support',
        'Standard response time',
        'Email notifications',
        'Basic analytics'
      ],
      colorClass: 'border-gray',
      isPopular: false,
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 35,
      calls: 5000,
      duration: '1 month',
      features: [
        '5,000 API calls per month',
        'Priority support',
        'Faster response time',
        'Real-time notifications',
        'Advanced analytics',
        'Custom webhooks'
      ],
      colorClass: 'border-blue',
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 75,
      calls: 15000,
      duration: '1 month',
      features: [
        '15,000 API calls per month',
        '24/7 dedicated support',
        'Fastest response time',
        'Multi-channel notifications',
        'Enterprise analytics',
        'Custom integrations',
        'SLA guarantee',
        'White-label options'
      ],
      colorClass: 'border-purple',
      isPopular: false,
    },
  ];

  const handlePurchase = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      localStorage.setItem('selectedPlan', JSON.stringify({
        apiId: 'lc-check',
        apiName: 'LC Check API',
        plan: plan,
      }));
      navigate('/payment');
      toast({
        title: "Plan Selected",
        description: `${plan.name} plan for LC Check API has been added to your cart.`,
      });
    }
  };

  return (
    <div className="lc-main">
      <Navbar />

      <div className="lc-container">
        <div className="lc-header">
          <h1>LC Check API Plans</h1>
          <p>
            Choose the perfect plan for your LC (Letter of Credit) verification needs.
            Our API provides comprehensive document validation and compliance checking.
          </p>
        </div>

        <div className="lc-grid">
          {plans.map(plan => {
            const pricePerCall = (plan.price / plan.calls).toFixed(3);
            return (
              <div key={plan.id} className={`lc-card ${plan.colorClass}`}>
                {plan.isPopular && (
                  <div className="lc-badge">
                    <Star size={12} className="icon" />
                    Most Popular
                  </div>
                )}

                <div className="lc-card-header">
                  <h2>{plan.name}</h2>
                  <div className="lc-pricing">
                    <div className="price">£{plan.price}</div>
                    <div className="per-call">£{pricePerCall} per call</div>
                    <div className="duration">Valid for {plan.duration}</div>
                  </div>
                </div>

                <div className="lc-card-content">
                  <div className="api-calls">
                    <Zap size={20} className="icon" />
                    {plan.calls.toLocaleString()} API calls
                  </div>

                  <ul className="features">
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <Check size={16} className="icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="highlight">
                    <Shield size={16} className="icon" />
                    Enterprise-grade security
                  </div>

                  <div className="highlight">
                    <Clock size={16} className="icon" />
                    Instant activation
                  </div>
                </div>

                <div className="lc-card-footer">
                  <button onClick={() => handlePurchase(plan.id)}>
                    Get {plan.name} Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lc-info-box">
          <h2>What is LC Check API?</h2>
          <p>
            Our LC Check API provides comprehensive Letter of Credit verification and validation services.
            It helps financial institutions, banks, and businesses verify the authenticity and compliance
            of trade documents in international commerce.
          </p>

          <div className="lc-info-grid">
            <div>
              <Shield size={32} className="icon" />
              <h3>Secure Verification</h3>
              <p>Bank-grade security for document validation</p>
            </div>
            <div>
              <Zap size={32} className="icon" />
              <h3>Real-time Processing</h3>
              <p>Instant API responses for time-critical operations</p>
            </div>
            <div>
              <Check size={32} className="icon" />
              <h3>Compliance Ready</h3>
              <p>Meets international trade compliance standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCCheckPlans;
