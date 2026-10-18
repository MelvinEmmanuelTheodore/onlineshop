# 🏎️ Forge 3D // Premium 3D Print Model Store & Realtime 3D Showcase

A high-performance, dark-themed e-commerce storefront for **3D printable digital assets (.STL, .GLB, .3MF)** featuring an **interactive 3D model inspector**, **Razorpay payments integration**, and a **gated digital download unlock system**.

---

## ✨ Features Implemented

1. **Interactive Realtime 3D Model Viewer (`Mclaren_f1.glb`)**:
   - WebGL powered by `<model-viewer>` with PBR lighting and soft contact shadows.
   - **Dedicated Rotate Left & Rotate Right controls** (step click and smooth hold-to-spin).
   - **Auto-Spin toggle** with speed controls.
   - **Full 360° orbit touch/drag navigation** and zoom in/out.
   - Framing reset to default perspective.

2. **3D Printable Product Catalog**:
   - **McLaren F1 GTR Supercar** (1:18 Scale Print-Ready Package with actual GLB & STL).
   - **Cyberpunk Mechanical Cyber Skull** (Articulated jaw, multi-part assembly).
   - **Articulated Oriental Crystal Dragon** (Print-in-place flexi joints, no supports).
   - **Planetary Gearbox Precision Fidget** (0.25mm engineering tolerances).
   - **Voronoi Ambient Architectural Lamp** (Translucent PETG diffusion).
   - Technical print specs displayed for each model: print time, layer height, filament mass, dimensions, and included formats.

3. **Shopping Cart & Checkout Flow**:
   - Slide-out cart drawer with item removal, subtotal, and tax calculation.
   - Promo coupon code system (try `PRINT3D` for 15% discount).
   - Persistent cart state in `localStorage`.
   - Dual currency support: **₹ INR** and **$ USD** with live conversion.

4. **Razorpay Payments & Gated File Downloads**:
   - Official Razorpay SDK integration (`checkout.js`).
   - In-app **Razorpay Setup Guide & Key Configurator** modal where you can paste your `rzp_test_...` or `rzp_live_...` key.
   - **Instant Sandbox Simulator Mode**: Test the checkout and download unlock flow with 1 click even without an active Razorpay account.
   - **Gated Downloads**: Download buttons remain locked 🔒 until purchase. Upon successful checkout, verified packages (`.zip` containing `.STL`, `.GLB`, and slicer configs) are immediately unlocked!
   - **"My Files" Library**: Re-download all purchased 3D print assets anytime.

---

## 🚀 How to Run Locally

### Option 1: Double-Click Launcher (Windows)
Simply double click [`start_server.bat`](file:///m:/antigravity%20ide/website%20to%20showcase%203d%20print%20produt%20and%20price/start_server.bat). It starts the built-in HTTP server and serves the website at:
```
http://localhost:3000
```

### Option 2: PowerShell
Run the included PowerShell server directly:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 3000
```

---

## 💳 Razorpay Setup Instructions

Read the complete guide in [`RAZORPAY_SETUP_GUIDE.md`](file:///m:/antigravity%20ide/website%20to%20showcase%203d%20print%20produt%20and%20price/RAZORPAY_SETUP_GUIDE.md) or click **"Setup Guide & Key Settings"** on the top notification bar in the website:
1. Sign up for free at [razorpay.com](https://razorpay.com).
2. Toggle to **Test Mode** in your Razorpay Dashboard.
3. Go to **Settings ➔ API Keys ➔ Generate Key**.
4. Copy your **Key ID** (`rzp_test_...`) and paste it into the website's Key Settings dialog.
5. Use test UPI (`success@razorpay`) or test cards to test instant checkouts.
