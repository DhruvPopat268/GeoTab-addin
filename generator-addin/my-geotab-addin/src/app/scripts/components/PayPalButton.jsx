import React, { useEffect, useRef } from 'react';
import { BASE_URL } from '../../../env.js';

const PayPalButton = ({ amount, userId, onSuccess }) => {
  const paypalRef = useRef(null);

  useEffect(() => {
    if (!window.paypal || !amount || !userId || !paypalRef.current) return;

    paypalRef.current.innerHTML = '';

    let isCancelled = false;

    // 🔍 Get userName from localStorage (replace key if your DB is different)
    const sessionDataRaw = localStorage.getItem("sTokens_ptcdemo1"); // Change to match your DB key
    console.log(sessionDataRaw)
    const sessionData = sessionDataRaw ? JSON.parse(sessionDataRaw) : null;
    console.log(sessionData)
    const userName = sessionData?.userName || "unknown@user.com";
    console.log(userName)

    const buttonInstance = window.paypal.Buttons({
      createOrder: (_, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: amount.toFixed(2) }
          }]
        });
      },
      onApprove: async (_, actions) => {
        const details = await actions.order.capture();

        const res = await fetch(`${BASE_URL}/api/UserWallet/deposit`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            userId:userName,
            amount,
            paypalId: details.id,
          }),
        });

        const data = await res.json();
        if (data.success) onSuccess(data);
        else alert('Payment was successful but saving failed');
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
