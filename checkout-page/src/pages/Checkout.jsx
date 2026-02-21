import React, { useEffect, useRef, useState } from 'react';
import './Checkout.css';

function Checkout() {
  // const API_BASE = "http://localhost:8000";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [method, setMethod] = useState(null);
  const [screen, setScreen] = useState('select');
  const [paymentId, setPaymentId] = useState(null);

  const pollingRef = useRef(null);
 
  // ---------------- FETCH ORDER ----------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    if (!orderId) {
      setError('Order ID missing in URL');
      setLoading(false);
      return;
    }

fetch(`/api/v1/orders/${orderId}/public`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to fetch order');
        setLoading(false);
      });
  }, []);

  // ---------------- POLLING ----------------
  function startPolling(id) {
    pollingRef.current = setInterval(() => {
fetch(`/api/v1/payments/${id}/public`)
        .then(res => res.json())
        .then(data => {
  console.log("POLL STATUS:", data);
  if (data.status === 'success') {
    clearInterval(pollingRef.current);
    setScreen('success');
  }
  if (data.status === 'failed') {
    clearInterval(pollingRef.current);
    setScreen('error');
  }
});

    }, 2000);
  }

  // ---------------- CREATE PAYMENT ----------------
  function createPayment(e, payload) {
    e.preventDefault();
    setScreen('processing');

fetch(`/api/v1/payments/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setPaymentId(data.id);
        startPolling(data.id);
      })
      .catch(() => {
        setScreen('error');
      });
  }

  if (loading) {
    return <div className="checkout-container center">Loading...</div>;
  }

  if (error) {
    return <div className="checkout-container center error">{error}</div>;
  }

  const amount = (order.amount / 100).toFixed(2);

  return (
    <div data-test-id="checkout-container" className="checkout-container">

      <div className="checkout-header">
        <h1>Secure Payment</h1>
        <p>Powered by Payment Gateway</p>
      </div>

      {screen === 'select' && (
        <>
          <div data-test-id="order-summary" className="card">
            <h2>Complete Payment</h2>
            <div className="summary-row">
              <span>Amount</span>
              <span data-test-id="order-amount">₹{amount}</span>
            </div>
            <div className="summary-row">
              <span>Order ID</span>
              <span data-test-id="order-id">{order.id}</span>
            </div>
          </div>

          <div data-test-id="payment-methods" className="card method-card">
            <button data-test-id="method-upi" onClick={() => setMethod('upi')}>
              Pay via UPI
            </button>
            <button data-test-id="method-card" onClick={() => setMethod('card')}>
              Pay via Card
            </button>
          </div>
        </>
      )}

      {method === 'upi' && screen === 'select' && (
        <form
          data-test-id="upi-form"
          className="card"
          onSubmit={e =>
            createPayment(e, {
              order_id: order.id,
              method: 'upi',
              vpa: e.target[0].value
            })
          }
        >
          <input data-test-id="vpa-input" placeholder="username@bank" />
          <button data-test-id="pay-button">Pay ₹{amount}</button>
        </form>
      )}

      {method === 'card' && screen === 'select' && (
        <form
          data-test-id="card-form"
          className="card"
          onSubmit={e =>
            createPayment(e, {
              order_id: order.id,
              method: 'card',
              card: {
                number: e.target[0].value,
                expiry_month: e.target[1].value.split('/')[0],
                expiry_year: e.target[1].value.split('/')[1],
                cvv: e.target[2].value,
                holder_name: e.target[3].value
              }
            })
          }
        >
          <input data-test-id="card-number-input" placeholder="Card Number" />
          <input data-test-id="expiry-input" placeholder="MM/YY" />
          <input data-test-id="cvv-input" placeholder="CVV" />
          <input data-test-id="cardholder-name-input" placeholder="Name on Card" />
          <button data-test-id="pay-button">Pay ₹{amount}</button>
        </form>
      )}

      {screen === 'processing' && (
        <div data-test-id="processing-state" className="card center">
          <div className="spinner"></div>
          <span data-test-id="processing-message">Processing payment...</span>
        </div>
      )}

      {screen === 'success' && (
        <div data-test-id="success-state" className="card center success">
          <h2>Payment Successful!</h2>
          <div>
            Payment ID:
            <span data-test-id="payment-id">{paymentId}</span>
          </div>
          <span data-test-id="success-message">
            Your payment has been processed successfully
          </span>
        </div>
      )}

      {screen === 'error' && (
        <div data-test-id="error-state" className="card center error">
          <h2>Payment Failed</h2>
          <span data-test-id="error-message">
            Payment could not be processed
          </span>
          <button data-test-id="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

    </div>
  );
}

export default Checkout;
