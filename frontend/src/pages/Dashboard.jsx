import React from 'react';

function Dashboard() {
  return (
    <div data-test-id="dashboard" style={styles.container}>
      <h2>Merchant Dashboard</h2>

      <div data-test-id="api-credentials" style={styles.card}>
        <div>
          <label>API Key</label><br />
          <span data-test-id="api-key">key_test_abc123</span>
        </div>
        <div>
          <label>API Secret</label><br />
          <span data-test-id="api-secret">secret_test_xyz789</span>
        </div>
      </div>

      <div data-test-id="stats-container" style={styles.stats}>
        <div style={styles.stat}>
          <div data-test-id="total-transactions">0</div>
          <span>Total Transactions</span>
        </div>
        <div style={styles.stat}>
          <div data-test-id="total-amount">₹0</div>
          <span>Total Amount</span>
        </div>
        <div style={styles.stat}>
          <div data-test-id="success-rate">0%</div>
          <span>Success Rate</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px' },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '24px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px'
  },
  stat: {
    background: 'white',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
  }
};

export default Dashboard;
