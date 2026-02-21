import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <form data-test-id="login-form" style={styles.form}>
      <h2>Merchant Login</h2>

      <input
        data-test-id="email-input"
        type="email"
        placeholder="Email"
        style={styles.input}
      />

      <input
        data-test-id="password-input"
        type="password"
        placeholder="Password"
        style={styles.input}
      />

      <button
        data-test-id="login-button"
        style={styles.button}
        onClick={(e) => {
          e.preventDefault();
          navigate('/dashboard');
        }}
      >
        Login
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    margin: "auto",
    gap: "12px",
    marginTop: "120px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default Login;