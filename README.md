# 💳 Payment Gateway with Multi-Method Processing & Hosted Checkout

## 📌 Project Overview

This project implements a mini payment gateway system similar to Razorpay/Stripe. It allows merchants to create payment orders via API and customers to complete payments through a hosted checkout page supporting UPI and Card payments.

The system is fully dockerized, follows REST API standards, and implements payment lifecycle state management, validation logic, and frontend dashboards.

---

## 🧱 Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL
- Docker
- REST APIs

### Frontend
- React (Dashboard)
- React (Hosted Checkout Page)
- Nginx (Static hosting)

### Tools
- Docker & Docker Compose
- Postman / Thunder Client
- Git & GitHub

---

## 📁 Project Structure

```
payment-gateway/
├── docker-compose.yml
├── README.md
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── src/
│   └── package.json
│
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   └── package.json
│
└── checkout-page/
    ├── Dockerfile
    ├── nginx.conf
    ├── src/
    └── package.json
```

---

## 🚀 How to Run the Project

### 1️⃣ Prerequisites
- Docker
- Docker Compose

### 2️⃣ Start All Services
From root folder:

```bash
docker-compose up -d --build
```

### 3️⃣ Services & Ports

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| Merchant Dashboard | http://localhost:3000 |
| Checkout Page | http://localhost:3001 |

---

## 🩺 Health Check

### Endpoint
```
GET /health
```

### Response
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-05T10:30:00Z"
}
```

---

## 🧪 Test Merchant (Auto-Seeded)

The application auto-seeds a test merchant on startup.

```json
{
  "email": "test@example.com",
  "api_key": "key_test_abc123",
  "api_secret": "secret_test_xyz789"
}
```

---

## 🔐 Authentication

All protected APIs require:

```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

---

## 📦 Orders API

### Create Order

```
POST /api/v1/orders
```

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "customer_name": "John Doe"
  }
}
```

---

## 💰 Payments API

### Create Payment (UPI)

```
POST /api/v1/payments
```

**Request Body:**
```json
{
  "order_id": "order_N5yrsmqWFw1lENAQ",
  "method": "upi",
  "vpa": "user@paytm"
}
```

### Create Payment (Card)

**Request Body:**
```json
{
  "order_id": "order_N5yrsmqWFw1lENAQ",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2026",
    "cvv": "123",
    "holder_name": "John Doe"
  }
}
```

---

## 🔁 Payment Lifecycle

```
processing → success / failed
```

- **UPI success rate:** 90%
- **Card success rate:** 95%
- **Processing delay:** 5–10 seconds

---

## 🌐 Hosted Checkout Page

### URL Format
```
http://localhost:3001/checkout?order_id=order_N5yrsmqWFw1lENAQ
```

### Features
- Fetches order details
- Payment method selection (UPI / Card)
- Shows processing state
- Polls payment status every 2 seconds
- Displays success or failure UI

---

## 📊 Merchant Dashboard (Frontend)

### Login Page
```
/login
```
Uses test merchant email (password not validated for Deliverable 1).

### Dashboard
- Shows API Key & Secret
- Displays:
  - Total transactions
  - Total amount
  - Success rate

### Transactions Page
- Lists all payments with status

---

## 🗄️ Database Tables

- `merchants`
- `orders`
- `payments`

All relationships and indexes implemented as per specification.

---

---

## 🔗 Important Links

- **Backend API:** http://localhost:8000
- 
- **Frontend:** http://localhost:3000/login
- **Login:** http://localhost:3000/login
- **dashboard:** http://localhost:3000/dashboard
- **transactions:** http://localhost:3000/dashboard/transactions
- 
- **Checkout:** http://localhost:3001
- 
- **Health:** http://localhost:8000/health

---

