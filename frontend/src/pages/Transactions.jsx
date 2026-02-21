import React from 'react';

function Transactions() {
  return (
    <table data-test-id="transactions-table" style={styles.table}>
      <thead>
        <tr>
          <th>Payment ID</th>
          <th>Order ID</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr data-test-id="transaction-row" data-payment-id="pay_123">
          <td data-test-id="payment-id">pay_123</td>
          <td data-test-id="order-id">order_456</td>
          <td data-test-id="amount">50000</td>
          <td data-test-id="method">upi</td>
          <td data-test-id="status">success</td>
          <td data-test-id="created-at">2024-01-15</td>
        </tr>
      </tbody>
    </table>
  );
}

const styles = {
  table: {
    width: '100%',
    background: 'white',
    marginTop: '20px',
    borderRadius: '12px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
  }
};

export default Transactions;
