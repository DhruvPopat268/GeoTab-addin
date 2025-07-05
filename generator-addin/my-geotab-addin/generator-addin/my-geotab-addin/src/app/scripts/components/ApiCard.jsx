import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Zap, Clock } from 'lucide-react';
import './componentStyles/apiCard.css';

const ApiCard = ({ id, name, description, category, plans, isPopular }) => {
  const cheapestPlan = plans.reduce((min, plan) => (plan.price < min.price ? plan : min), plans[0]);

  return (
    <div className="api-card">
      <div className="api-card-header">
        <div className="api-card-header-content">
          <div>
            <h2 className="api-card-title">{name}</h2>
            <span className="badge secondary-badge">{category}</span>
            {isPopular && <span className="badge popular-badge">Popular</span>}
          </div>
          <ExternalLink size={16} className="external-icon" />
        </div>
      </div>

      <div className="api-card-content">
        <p className="description">{description}</p>

        <div className="info-section">
          <div className="info-row">
            <Zap size={16} className="icon green" />
            <span>{plans.length} pricing plans available</span>
          </div>
          <div className="info-row">
            <Clock size={16} className="icon blue" />
            <span>
              Starting from £{cheapestPlan.price} for {cheapestPlan.calls} calls
            </span>
          </div>
        </div>
      </div>

      <div className="api-card-footer">
        <Link to={`/api/${id}`} className="button-link">
          View Plans & Purchase
        </Link>
      </div>
    </div>
  );
};

export default ApiCard;
