import React, { useEffect, useRef } from 'react';
import { BASE_URL } from '../../../env.js';


const PayPalButton = ({ amount, userId, onSuccess }) => {
  const paypalRef = useRef(null);

  useEffect(() => {
    if (!window.paypal || !amount || !userId || !paypalRef.current) return;

    paypalRef.current.innerHTML = '';

    let isCancelled = false;

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

        const res = await fetch(`${BASE_URL}/api/payments/record`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' ,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            userId,
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