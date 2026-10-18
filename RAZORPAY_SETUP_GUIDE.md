# 💳 Razorpay Setup Guide for Forge 3D Print Store

This document explains everything you need to know to set up **Razorpay Payments** for your 3D printing store, test it in sandbox mode, and transition to live payments.

---

## 🚀 Quick Summary
Your website already includes:
1. **Official Razorpay Checkout Integration** (`checkout.js` Standard Checkout).
2. **Built-in Sandbox Simulator**: Allows you or customers to test the complete purchase and download unlock flow with 1 click even before setting up Razorpay credentials!
3. **In-App Key ID Configurator**: A convenient settings modal where you can paste your `rzp_test_...` key.
4. **Gated Downloads**: STL and GLB 3D files remain locked 🔒 until a payment is completed. Once paid, the files immediately unlock for download and stay available in the **"My Files"** library.

---

## 🛠️ Step 1: Create a Free Razorpay Account
1. Visit [https://razorpay.com](https://razorpay.com) and click **Sign Up Now**.
2. Complete the standard registration with your email and business/individual details.
3. Razorpay gives you instant access to **Test Mode (Sandbox)** without waiting for bank or KYC approvals.

---

## 🔑 Step 2: Switch to Test Mode & Generate API Keys
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Look at the top navigation bar. Toggle the switch to **Test Mode** (it will show an orange or dark badge indicating Test Mode).
3. On the left sidebar, navigate to:
   **Account & Settings** ➔ **API Keys** (under *Website and app settings*).
4. Click **Generate Test Key**.
5. You will see two credentials:
   - **Key ID**: Starts with `rzp_test_...` (e.g., `rzp_test_1DP5mmOlF5G5ag`)
   - **Key Secret**: A secret hash string.
6. **Copy the Key ID**. (You do *not* need to share the Secret Key on the frontend).

---

## 💻 Step 3: Configure Your Key ID in the Web Application

### Option A: Via the Website UI (Easiest)
1. Open the website in your browser (`http://localhost:3000`).
2. Click **"Setup Guide & Key Settings"** on the top notification banner, or in the footer link.
3. Paste your `rzp_test_...` Key ID into the input box and click **Save Key**.
4. That's it! All checkouts will now open your real Razorpay test checkout window.

### Option B: In Code (`app.js`)
If you want to hardcode your test key as the default fallback:
Open [app.js](file:///m:/antigravity%20ide/website%20to%20showcase%203d%20print%20produt%20and%20price/app.js) and locate:
```javascript
let razorpayKeyId = localStorage.getItem('forge3d_razorpay_key') || 'YOUR_RZP_TEST_KEY_HERE';
```
Replace `'YOUR_RZP_TEST_KEY_HERE'` with your actual Key ID.

---

## 🧪 Step 4: Testing Payments in Test Mode

When you click **Proceed to Razorpay Checkout**, Razorpay opens its payment window:

### 1. Test UPI (Google Pay, PhonePe, Paytm, BHIM)
- Select **UPI / QR**.
- Enter the test VPA: `success@razorpay`
- Click **Pay**. The transaction will immediately succeed and unlock your 3D models!
- If you enter `failure@razorpay`, it tests how the app handles a failed payment.

### 2. Test Cards (Visa / Mastercard)
Razorpay provides standard test card numbers:
- **Card Number**: `4111 1111 1111 1111` or `4012 0000 0000 0002`
- **Expiry Date**: Any future month/year (e.g. `12/28`)
- **CVV**: `123`
- **OTP**: Enter any 4 or 6 digit number (e.g. `123456`) on the mock bank authentication screen.

---

## 🔒 Step 5: Going Live (For Real Money)

When you are ready to accept real money from buyers:
1. Complete your KYC on the Razorpay Dashboard (Business proof, bank account for settlements).
2. Toggle your Dashboard from **Test Mode** to **Live Mode**.
3. Go to **Settings ➔ API Keys** and generate **Live Keys** (`rzp_live_...`).
4. Paste the Live Key ID into the settings or your production environment configuration.

---

## 🛡️ Production Best Practices & Webhook Architecture

For a full-scale commercial deployment, consider implementing:

```
[Customer Browser] 
      │ 1. Cart Checkout
      ▼
[Your Backend Server] 
      │ 2. Calls Razorpay API: POST /v1/orders with Key Secret
      ▼
[Razorpay Orders API] 
      │ 3. Returns unique order_id
      ▼
[Customer Browser]
      │ 4. Opens Razorpay Modal with order_id
      ▼
[Razorpay Payment Processed]
      │ 5. Webhook: payment.captured event
      ▼
[Your Backend Webhook Handler]
      │ 6. Verifies HMAC-SHA256 signature
      ▼
[Automated S3 / Cloud Presigned Download Link Dispatched]
```

1. **Server-Side Order Creation**: Generate an official `order_id` on the server with `razorpay.orders.create({ amount, currency: "INR", receipt })`.
2. **Cryptographic Signature Verification**:
   ```javascript
   const crypto = require('crypto');
   const generated_signature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(order_id + "|" + razorpay_payment_id)
     .digest('hex');
   
   if (generated_signature === razorpay_signature) {
     // Payment is authentic & untampered
   }
   ```
3. **Expiring Download Links**: Store your large `.STL` and `.GLB` files on cloud object storage (AWS S3, Cloudflare R2, Google Cloud Storage) and issue 24-hour expiring pre-signed URLs upon verified payment.
