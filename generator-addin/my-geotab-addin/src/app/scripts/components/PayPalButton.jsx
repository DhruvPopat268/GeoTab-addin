import React, { useEffect, useRef } from 'react';
import { BASE_URL } from '../../../env.js';

const PayPalButton = ({ amount, userId, onSuccess }) => {
  const paypalRef = useRef(null);
  
  useEffect(() => {
    if (!window.paypal || !amount || !userId || !paypalRef.current) return;
    
    paypalRef.current.innerHTML = '';
    let isCancelled = false;
    
    // Get userName from localStorage
    const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1");
    console.log(sessionDataRaw);
    const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
    console.log(sessionData);
    const userName = sessionData?.userName || "unknown@user.com";
    console.log(userName);
    
    const buttonInstance = window.paypal.Buttons({
      createOrder: (_, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: amount.toFixed(2) }
          }]
        });
      },
      
      onApprove: async (_, actions) => {
        try {
          const details = await actions.order.capture();
          console.log('PayPal capture details:', details);
          
          const payload = {
            userId: userName,
            amount,
            paypalId: details.id,
          };
          console.log('Sending to backend:', payload);
          
          const res = await fetch(`${BASE_URL}/api/UserWallet/deposit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
          });
          
          const data = await res.json();
          console.log('Backend response:', data);
          console.log('Response status:', res.status);
          
          // Check for status code 200 instead of data.success
          if (res.status === 200) {
            onSuccess(data);
          } else {
            const errorMsg = data.message || `HTTP ${res.status}: ${res.statusText}`;
            console.error('Save failed:', errorMsg);
            alert(`Payment was successful but saving failed: ${errorMsg}`);
          }
          
        } catch (error) {
          console.error('Error in payment processing:', error);
          alert('Payment was successful but saving failed: ' + error.message);
        }
      }
    });
    
    if (!isCancelled) {
      buttonInstance.render(paypalRef.current).catch((err) => {
        if (!isCancelled) {
          console.error('PayPal button render error:', err);
        }
      });
    }
    
    return () => {
      isCancelled = true;
    };
  }, [amount, userId]);
  
  return <div ref={paypalRef} />;
};

export default PayPalButton;