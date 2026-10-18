/**
 * FORGE 3D // APPLICATION CORE JAVASCRIPT
 * Features:
 *  - Interactive 3D Model Viewer with Smooth Left/Right Rotation controls
 *  - Dynamic 3D Printable Product Catalog with Print Specs
 *  - Cart State Management with LocalStorage persistence
 *  - Razorpay Payment Gateway Integration + Sandbox Simulator
 *  - Gated Digital Downloads Unlock System
 *  - Currency Switching (INR / USD) & Instant Filter/Search
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. PRODUCT CATALOG DATA
  // --------------------------------------------------------------------------
  const PRODUCTS = [
    {
      id: 'mclaren-f1',
      title: 'McLaren F1 GTR Supercar Scale Model',
      category: 'automotive',
      categoryLabel: 'Supercars & Automotive',
      priceINR: 1499,
      priceUSD: 18.99,
      rating: 4.9,
      reviewsCount: 128,
      difficulty: 'Intermediate',
      printTime: '12h 45m',
      weight: '148g PLA+ / Resin',
      layerHeight: '0.12 - 0.16 mm',
      dimensions: '243 × 108 × 64 mm',
      formats: ['.GLB', '.STL', '.3MF'],
      image: 'assets/images/mclaren_f1.jpg',
      modelUrl: './models/Mclaren_f1.glb',
      downloadUrl: 'assets/downloads/Mclaren_F1_Supercar_Print_Package.zip',
      featured: true,
      has3DModel: true,
      description: 'Ultra-detailed collector-grade replica of the legendary McLaren F1 supercar. Digitally sculpted with precision aerodynamic contours, authentic dihedral door seams, racing rear wing, and optimized slicer tolerance geometry.'
    },
    {
      id: 'cyber-skull',
      title: 'Cyberpunk Mechanical Cyber Skull',
      category: 'figures',
      categoryLabel: 'Articulated Figures',
      priceINR: 899,
      priceUSD: 11.49,
      rating: 4.8,
      reviewsCount: 94,
      difficulty: 'Advanced',
      printTime: '16h 20m',
      weight: '210g PLA / PETG',
      layerHeight: '0.16 mm',
      dimensions: '160 × 120 × 140 mm',
      formats: ['.STL', '.OBJ', '.STEP'],
      image: 'assets/images/cyber_skull.jpg',
      downloadUrl: 'assets/downloads/Cyber_Skull_Mechanical_Print_Pack.zip',
      featured: false,
      has3DModel: false,
      description: 'Multi-component articulated mechanical skull featuring functional gear pivots, removable cranial plate, and dual-tone filament optimization.'
    },
    {
      id: 'crystal-dragon',
      title: 'Articulated Oriental Crystal Dragon',
      category: 'figures',
      categoryLabel: 'Articulated Figures',
      priceINR: 649,
      priceUSD: 8.29,
      rating: 5.0,
      reviewsCount: 210,
      difficulty: 'Beginner',
      printTime: '9h 10m',
      weight: '115g Silk PLA',
      layerHeight: '0.16 mm',
      dimensions: '450 × 40 × 35 mm (Extended)',
      formats: ['.STL', '.3MF'],
      image: 'assets/images/crystal_dragon.jpg',
      downloadUrl: 'assets/downloads/Crystal_Dragon_Articulated_Pack.zip',
      featured: false,
      has3DModel: false,
      description: 'Famous print-in-place flexi dragon with 42 interlocking ball-and-socket spine segments. Zero assembly or support structures required.'
    },
    {
      id: 'planetary-gear',
      title: 'Planetary Gearbox Precision Fidget',
      category: 'engineering',
      categoryLabel: 'Engineering & Fidgets',
      priceINR: 499,
      priceUSD: 6.39,
      rating: 4.9,
      reviewsCount: 77,
      difficulty: 'Intermediate',
      printTime: '4h 30m',
      weight: '72g Engineering PLA',
      layerHeight: '0.12 mm',
      dimensions: '95 × 95 × 22 mm',
      formats: ['.STL', '.STEP', '.3MF'],
      image: 'assets/images/planetary_gear.jpg',
      downloadUrl: 'assets/downloads/Planetary_Gearbox_Fidget_Pack.zip',
      featured: false,
      has3DModel: false,
      description: 'High-precision 5-gear planetary transmission with 0.25mm print-in-place clearance and ultra-smooth tactile mechanical rotation.'
    },
    {
      id: 'voronoi-lamp',
      title: 'Voronoi Ambient Architectural Lamp',
      category: 'decor',
      categoryLabel: 'Home & Decor',
      priceINR: 799,
      priceUSD: 9.99,
      rating: 4.7,
      reviewsCount: 53,
      difficulty: 'Beginner',
      printTime: '14h 00m',
      weight: '180g PETG / Translucent PLA',
      layerHeight: '0.20 mm',
      dimensions: '180 × 180 × 260 mm',
      formats: ['.STL', '.3MF'],
      image: 'assets/images/voronoi_lamp.jpg',
      downloadUrl: 'assets/downloads/Voronoi_Lattice_Lamp_Pack.zip',
      featured: false,
      has3DModel: false,
      description: 'Algorithmic Voronoi cellular shell engineered for warm incandescent LED lighting diffusion. Compatible with standard E27 socket fixtures.'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. APP STATE
  // --------------------------------------------------------------------------
  let currentCurrency = localStorage.getItem('forge3d_currency') || 'INR';
  let activeCategory = 'all';
  let currentSort = 'featured';
  let searchQuery = '';
  let activeDiscountPercent = 0; // applied coupon discount

  // Persistent Cart & Purchases
  let cart = [];
  try {
    const savedCart = localStorage.getItem('forge3d_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    cart = [];
  }

  let purchasedProductIds = [];
  try {
    const savedPurchases = localStorage.getItem('forge3d_purchased');
    purchasedProductIds = savedPurchases ? JSON.parse(savedPurchases) : [];
  } catch (e) {
    purchasedProductIds = [];
  }

  // Razorpay Key Configuration
  let razorpayKeyId = localStorage.getItem('forge3d_razorpay_key') || '';

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENTS
  // --------------------------------------------------------------------------
  const viewer = document.getElementById('mclaren-viewer');
  const modelLoader = document.getElementById('model-loader');
  const btnRotateLeft = document.getElementById('ctrl-rotate-left');
  const btnRotateRight = document.getElementById('ctrl-rotate-right');
  const btnToggleAutospin = document.getElementById('ctrl-toggle-autospin');
  const autospinLabel = document.getElementById('autospin-label');
  const btnResetView = document.getElementById('ctrl-reset-view');
  const btnZoomIn = document.getElementById('ctrl-zoom-in');
  const btnZoomOut = document.getElementById('ctrl-zoom-out');

  // Hero elements
  const heroPriceEl = document.getElementById('hero-price');
  const heroPriceOrigEl = document.getElementById('hero-price-original');
  const heroCurrencySymbolEl = document.getElementById('hero-currency-symbol');
  const heroAddToCartBtn = document.getElementById('hero-add-to-cart-btn');
  const heroBuyNowBtn = document.getElementById('hero-buy-now-btn');
  const heroDownloadStatusCard = document.getElementById('hero-download-status-card');
  const heroStatusIcon = document.getElementById('hero-status-icon');
  const heroStatusHeadline = document.getElementById('hero-status-headline');
  const heroStatusSubtext = document.getElementById('hero-status-subtext');
  const heroDownloadActionBtn = document.getElementById('hero-download-action-btn');
  const heroDownloadBtnText = document.getElementById('hero-download-btn-text');

  // Navigation & Catalog
  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('catalog-search-input');
  const categoryTabs = document.getElementById('category-tabs');
  const sortDropdown = document.getElementById('sort-dropdown');
  const currencyBtns = document.querySelectorAll('.currency-btn');
  const cartBadge = document.getElementById('cart-badge');
  const purchasedCountBadge = document.getElementById('purchased-count-badge');
  const cartDrawerToggle = document.getElementById('cart-drawer-toggle');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartBtn = document.getElementById('close-cart-btn');

  // Cart Drawer
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartItemsCounter = document.getElementById('cart-items-counter');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDiscountRow = document.getElementById('cart-discount-row');
  const cartDiscountEl = document.getElementById('cart-discount');
  const cartTotalEl = document.getElementById('cart-total');
  const couponInput = document.getElementById('coupon-input');
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  const razorpayCheckoutBtn = document.getElementById('razorpay-checkout-btn');
  const simulatorCheckoutBtn = document.getElementById('simulator-checkout-btn');

  // Modals
  const libraryModal = document.getElementById('library-modal');
  const libraryContent = document.getElementById('library-content');
  const openLibraryBtn = document.getElementById('open-library-btn');
  const razorpayGuideModal = document.getElementById('razorpay-guide-modal');
  const openRazorpayGuideBtn = document.getElementById('open-razorpay-guide-btn');
  const footerRazorpayLink = document.getElementById('footer-razorpay-link');
  const footerLibraryLink = document.getElementById('footer-library-link');
  const razorpayKeyInput = document.getElementById('razorpay-key-input');
  const saveRazorpayKeyBtn = document.getElementById('save-razorpay-key-btn');
  const keyStatusMsg = document.getElementById('key-status-msg');

  // Success Modal
  const successModal = document.getElementById('success-modal');
  const receiptPaymentId = document.getElementById('receipt-payment-id');
  const receiptDate = document.getElementById('receipt-date');
  const receiptAmount = document.getElementById('receipt-amount');
  const unlockedItemsList = document.getElementById('unlocked-items-list');
  const doneSuccessBtn = document.getElementById('done-success-btn');

  // Quick View Modal
  const quickViewModal = document.getElementById('quick-view-modal');
  const qvTitle = document.getElementById('qv-title');
  const qvBody = document.getElementById('qv-body');

  const toastContainer = document.getElementById('toast-container');

  // --------------------------------------------------------------------------
  // 4. 3D MODEL VIEWER & ROTATION CONTROLS (MCLAREN F1 GLB)
  // --------------------------------------------------------------------------
  let isRotatingLeft = false;
  let isRotatingRight = false;
  let rotationInterval = null;

  // Hide loader once 3D model is loaded
  if (viewer) {
    viewer.addEventListener('load', () => {
      if (modelLoader) {
        modelLoader.style.opacity = '0';
        setTimeout(() => {
          modelLoader.style.display = 'none';
        }, 500);
      }
    });

    viewer.addEventListener('error', (err) => {
      console.warn('Model viewer notice:', err);
      if (modelLoader) {
        modelLoader.innerHTML = '<span style="color:#ff7a00;">Interactive 3D Preview Ready</span>';
        setTimeout(() => { modelLoader.style.display = 'none'; }, 1000);
      }
    });
  }

  /**
   * Adjust camera azimuth theta by deltaDegrees (positive or negative)
   */
  function rotateModelBy(deltaDegrees) {
    if (!viewer) return;
    try {
      const orbit = viewer.getCameraOrbit();
      if (!orbit) return;
      
      // Convert current theta from radians to degrees
      const currentThetaDeg = (orbit.theta * 180) / Math.PI;
      const currentPhiDeg = (orbit.phi * 180) / Math.PI;
      const currentRadiusM = orbit.radius;

      const newThetaDeg = currentThetaDeg + deltaDegrees;
      viewer.cameraOrbit = `${newThetaDeg}deg ${currentPhiDeg}deg ${currentRadiusM}m`;
    } catch (e) {
      console.warn('Error rotating camera orbit:', e);
    }
  }

  // Left Rotation Button (Click + Hold)
  if (btnRotateLeft) {
    // Single step on click
    btnRotateLeft.addEventListener('click', () => {
      // Pause auto-spin during manual rotation for crisp control
      viewer.autoRotate = false;
      updateAutospinUI(false);
      rotateModelBy(-20);
    });

    // Continuous smooth rotation on hold
    const startRotateLeft = () => {
      viewer.autoRotate = false;
      updateAutospinUI(false);
      if (rotationInterval) clearInterval(rotationInterval);
      rotationInterval = setInterval(() => {
        rotateModelBy(-3);
      }, 20);
    };

    const stopRotateLeft = () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
      }
    };

    btnRotateLeft.addEventListener('mousedown', startRotateLeft);
    btnRotateLeft.addEventListener('mouseup', stopRotateLeft);
    btnRotateLeft.addEventListener('mouseleave', stopRotateLeft);
    btnRotateLeft.addEventListener('touchstart', (e) => { e.preventDefault(); startRotateLeft(); });
    btnRotateLeft.addEventListener('touchend', stopRotateLeft);
  }

  // Right Rotation Button (Click + Hold)
  if (btnRotateRight) {
    btnRotateRight.addEventListener('click', () => {
      viewer.autoRotate = false;
      updateAutospinUI(false);
      rotateModelBy(20);
    });

    const startRotateRight = () => {
      viewer.autoRotate = false;
      updateAutospinUI(false);
      if (rotationInterval) clearInterval(rotationInterval);
      rotationInterval = setInterval(() => {
        rotateModelBy(3);
      }, 20);
    };

    const stopRotateRight = () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
      }
    };

    btnRotateRight.addEventListener('mousedown', startRotateRight);
    btnRotateRight.addEventListener('mouseup', stopRotateRight);
    btnRotateRight.addEventListener('mouseleave', stopRotateRight);
    btnRotateRight.addEventListener('touchstart', (e) => { e.preventDefault(); startRotateRight(); });
    btnRotateRight.addEventListener('touchend', stopRotateRight);
  }

  // Auto-Spin Toggle
  function updateAutospinUI(isActive) {
    if (!btnToggleAutospin || !autospinLabel) return;
    if (isActive) {
      btnToggleAutospin.classList.add('active');
      autospinLabel.textContent = 'Auto Spin: ON';
    } else {
      btnToggleAutospin.classList.remove('active');
      autospinLabel.textContent = 'Auto Spin: OFF';
    }
  }

  if (btnToggleAutospin) {
    btnToggleAutospin.addEventListener('click', () => {
      if (!viewer) return;
      viewer.autoRotate = !viewer.autoRotate;
      updateAutospinUI(viewer.autoRotate);
    });
  }

  // Reset Camera View
  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      if (!viewer) return;
      viewer.cameraOrbit = '45deg 75deg auto';
      viewer.fieldOfView = '35deg';
      showToast('Camera angle reset to default view', 'info');
    });
  }

  // Zoom Controls
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      if (!viewer) return;
      try {
        const orbit = viewer.getCameraOrbit();
        const newRadius = Math.max(1.5, orbit.radius * 0.85);
        const thetaDeg = (orbit.theta * 180) / Math.PI;
        const phiDeg = (orbit.phi * 180) / Math.PI;
        viewer.cameraOrbit = `${thetaDeg}deg ${phiDeg}deg ${newRadius}m`;
      } catch (e) {
        console.warn(e);
      }
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      if (!viewer) return;
      try {
        const orbit = viewer.getCameraOrbit();
        const newRadius = Math.min(6.5, orbit.radius * 1.2);
        const thetaDeg = (orbit.theta * 180) / Math.PI;
        const phiDeg = (orbit.phi * 180) / Math.PI;
        viewer.cameraOrbit = `${thetaDeg}deg ${phiDeg}deg ${newRadius}m`;
      } catch (e) {
        console.warn(e);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. CURRENCY & FORMATTING HELPERS
  // --------------------------------------------------------------------------
  function formatPrice(inrAmount, usdAmount) {
    if (currentCurrency === 'USD') {
      return `$${usdAmount.toFixed(2)}`;
    }
    return `₹${inrAmount.toLocaleString('en-IN')}`;
  }

  function getActivePriceValue(item) {
    return currentCurrency === 'USD' ? item.priceUSD : item.priceINR;
  }

  function updateCurrency(newCurrency) {
    currentCurrency = newCurrency;
    localStorage.setItem('forge3d_currency', newCurrency);

    // Update active toggle buttons
    currencyBtns.forEach(btn => {
      if (btn.dataset.currency === newCurrency) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update hero pricing
    const mclaren = PRODUCTS.find(p => p.id === 'mclaren-f1');
    if (mclaren) {
      if (currentCurrency === 'USD') {
        heroCurrencySymbolEl.textContent = '$';
        heroPriceEl.textContent = mclaren.priceUSD.toFixed(2);
        heroPriceOrigEl.textContent = '$29.99';
      } else {
        heroCurrencySymbolEl.textContent = '₹';
        heroPriceEl.textContent = mclaren.priceINR.toLocaleString('en-IN');
        heroPriceOrigEl.textContent = '₹2,499';
      }
    }

    // Re-render Catalog & Cart
    renderCatalog();
    renderCart();
  }

  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateCurrency(btn.dataset.currency);
    });
  });

  // --------------------------------------------------------------------------
  // 6. GATED DOWNLOAD STATUS & PURCHASES
  // --------------------------------------------------------------------------
  function isProductPurchased(productId) {
    return purchasedProductIds.includes(productId);
  }

  function updateHeroDownloadGating() {
    const isPurchased = isProductPurchased('mclaren-f1');
    const mclaren = PRODUCTS.find(p => p.id === 'mclaren-f1');

    if (isPurchased) {
      heroDownloadStatusCard.classList.add('unlocked');
      heroStatusIcon.className = 'status-icon-wrapper unlocked';
      heroStatusIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      heroStatusHeadline.textContent = '✓ Digital Files Unlocked & Ready';
      heroStatusSubtext.textContent = 'Your license is verified. Download includes Mclaren_F1_Supercar_Print_Package.zip (.GLB, .STL, and Bambu/Cura 3MF slicer config).';
      
      heroDownloadActionBtn.classList.remove('locked');
      heroDownloadActionBtn.classList.add('unlocked');
      heroDownloadActionBtn.removeAttribute('disabled');
      heroDownloadBtnText.textContent = 'Download Files (.ZIP / .GLB)';

      heroDownloadActionBtn.onclick = () => {
        triggerDownload(mclaren.downloadUrl, 'Mclaren_F1_Supercar_Print_Package.zip');
      };
    } else {
      heroDownloadStatusCard.classList.remove('unlocked');
      heroStatusIcon.className = 'status-icon-wrapper locked';
      heroStatusIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
      heroStatusHeadline.textContent = 'Download Locked (Purchase Required)';
      heroStatusSubtext.textContent = 'Complete checkout via Razorpay to immediately unlock verified .STL and .GLB archive files.';
      
      heroDownloadActionBtn.classList.add('locked');
      heroDownloadActionBtn.classList.remove('unlocked');
      heroDownloadActionBtn.setAttribute('disabled', 'true');
      heroDownloadBtnText.textContent = 'Locked 🔒';
      heroDownloadActionBtn.onclick = null;
    }

    // Update navbar badge
    if (purchasedCountBadge) {
      purchasedCountBadge.textContent = purchasedProductIds.length;
    }
  }

  function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || '3d_model_package.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${filename || 'package'}...`, 'success');
  }

  // --------------------------------------------------------------------------
  // 7. CATALOG RENDERING & FILTERING
  // --------------------------------------------------------------------------
  function renderCatalog() {
    if (!productsGrid) return;

    // Filter by category
    let filtered = PRODUCTS.filter(product => {
      const matchCat = activeCategory === 'all' || product.category === activeCategory;
      const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.formats.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    // Sort
    if (currentSort === 'price-asc') {
      filtered.sort((a, b) => getActivePriceValue(a) - getActivePriceValue(b));
    } else if (currentSort === 'price-desc') {
      filtered.sort((a, b) => getActivePriceValue(b) - getActivePriceValue(a));
    } else if (currentSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>No matching 3D models found</h3>
          <p>Try searching for other keywords like "McLaren", "Dragon", or "Gear".</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(item => {
      const purchased = isProductPurchased(item.id);
      const inCart = cart.some(ci => ci.id === item.id);
      const priceText = formatPrice(item.priceINR, item.priceUSD);

      return `
        <article class="product-card" data-id="${item.id}">
          <div class="product-image-container">
            <img src="${item.image}" alt="${item.title}" class="product-image" loading="lazy">
            <div class="product-card-badges">
              ${item.featured ? '<span class="card-badge badge-featured">FEATURED</span>' : ''}
              ${item.has3DModel ? '<span class="card-badge badge-3d">3D GLB VIEW</span>' : ''}
            </div>
            <button class="quick-view-overlay-btn" data-id="${item.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              Quick Specs
            </button>
          </div>

          <div class="product-card-body">
            <div class="product-category-row">
              <span class="product-cat-name">${item.categoryLabel}</span>
              <span class="product-rating">★ ${item.rating} (${item.reviewsCount})</span>
            </div>

            <h3 class="product-title">${item.title}</h3>
            <p class="product-excerpt">${item.description}</p>

            <div class="product-specs-chips">
              <span class="spec-chip">⏱ ${item.printTime}</span>
              <span class="spec-chip">⚖ ${item.weight}</span>
              <span class="spec-chip">📁 ${item.formats.join(', ')}</span>
            </div>

            <div class="product-card-footer">
              <div class="product-price-block">
                <span class="card-price-label">Cost</span>
                <span class="card-price-val">${priceText}</span>
              </div>

              <div class="card-actions">
                ${purchased ? `
                  <button class="btn-card-download unlocked" data-id="${item.id}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>Download</span>
                  </button>
                ` : inCart ? `
                  <button class="btn-card-cart in-cart" data-id="${item.id}" style="background: rgba(255, 122, 0, 0.2); border-color: var(--mclaren-orange);">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>In Cart</span>
                  </button>
                ` : `
                  <button class="btn-card-cart add-to-cart-trigger" data-id="${item.id}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span>Add to Cart</span>
                  </button>
                `}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach event listeners to card buttons
    attachCardListeners();
  }

  function attachCardListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        addToCart(id);
      });
    });

    // In Cart / View Cart
    document.querySelectorAll('.btn-card-cart.in-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCartDrawer();
      });
    });

    // Download buttons for unlocked cards
    document.querySelectorAll('.btn-card-download.unlocked').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const product = PRODUCTS.find(p => p.id === id);
        if (product) {
          triggerDownload(product.downloadUrl, `${product.id}_package.zip`);
        }
      });
    });

    // Quick View Buttons
    document.querySelectorAll('.quick-view-overlay-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openQuickView(id);
      });
    });
  }

  // Filter category buttons
  if (categoryTabs) {
    categoryTabs.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.category;
        renderCatalog();
      });
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderCatalog();
    });
  }

  // Sort dropdown
  if (sortDropdown) {
    sortDropdown.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }

  // --------------------------------------------------------------------------
  // 8. CART DRAWER & STATE LOGIC
  // --------------------------------------------------------------------------
  function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (isProductPurchased(productId)) {
      showToast(`You have already purchased "${product.title}"! Check your library.`, 'info');
      return;
    }

    if (!cart.some(item => item.id === productId)) {
      cart.push({ ...product, quantity: 1 });
      saveCart();
      renderCart();
      renderCatalog();
      showToast(`Added "${product.title}" to Cart`, 'success');
      openCartDrawer();
    } else {
      showToast(`"${product.title}" is already in your cart`, 'info');
      openCartDrawer();
    }
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    renderCatalog();
    showToast('Item removed from cart', 'info');
  }

  function saveCart() {
    localStorage.setItem('forge3d_cart', JSON.stringify(cart));
    updateCartBadges();
  }

  function updateCartBadges() {
    const totalCount = cart.length;
    if (cartBadge) cartBadge.textContent = totalCount;
    if (cartItemsCounter) cartItemsCounter.textContent = `(${totalCount} item${totalCount === 1 ? '' : 's'})`;
  }

  function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + getActivePriceValue(item), 0);
    const discount = subtotal * (activeDiscountPercent / 100);
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  }

  function renderCart() {
    if (!cartItemsContainer) return;
    updateCartBadges();

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <h4>Your Cart is Empty</h4>
          <p>Add the McLaren F1 or any of our tested 3D models to proceed with Razorpay checkout.</p>
        </div>
      `;
      cartSubtotalEl.textContent = formatPrice(0, 0);
      cartTotalEl.textContent = formatPrice(0, 0);
      cartDiscountRow.style.display = 'none';
      razorpayCheckoutBtn.disabled = true;
      razorpayCheckoutBtn.style.opacity = '0.5';
      simulatorCheckoutBtn.disabled = true;
      simulatorCheckoutBtn.style.opacity = '0.5';
      return;
    }

    razorpayCheckoutBtn.disabled = false;
    razorpayCheckoutBtn.style.opacity = '1';
    simulatorCheckoutBtn.disabled = false;
    simulatorCheckoutBtn.style.opacity = '1';

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-formats">${item.formats.join(' · ')}</div>
          </div>
          <div class="cart-item-bottom">
            <span class="cart-item-price">${formatPrice(item.priceINR, item.priceUSD)}</span>
            <button class="cart-item-remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach remove handlers
    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.id);
      });
    });

    // Update totals
    const { subtotal, discount, total } = calculateCartTotals();
    const isUSD = currentCurrency === 'USD';

    cartSubtotalEl.textContent = isUSD ? `$${subtotal.toFixed(2)}` : `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
    if (activeDiscountPercent > 0) {
      cartDiscountRow.style.display = 'flex';
      cartDiscountEl.textContent = isUSD ? `-$${discount.toFixed(2)} (${activeDiscountPercent}%)` : `-₹${Math.round(discount).toLocaleString('en-IN')} (${activeDiscountPercent}%)`;
    } else {
      cartDiscountRow.style.display = 'none';
    }
    cartTotalEl.textContent = isUSD ? `$${total.toFixed(2)}` : `₹${Math.round(total).toLocaleString('en-IN')}`;
  }

  function openCartDrawer() {
    renderCart();
    cartDrawerOverlay.classList.add('open');
  }

  function closeCartDrawer() {
    cartDrawerOverlay.classList.remove('open');
  }

  if (cartDrawerToggle) cartDrawerToggle.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) closeCartDrawer();
    });
  }

  // Hero Add to Cart button
  if (heroAddToCartBtn) {
    heroAddToCartBtn.addEventListener('click', () => {
      addToCart('mclaren-f1');
    });
  }

  // Hero Direct Buy Now
  if (heroBuyNowBtn) {
    heroBuyNowBtn.addEventListener('click', () => {
      if (!cart.some(item => item.id === 'mclaren-f1') && !isProductPurchased('mclaren-f1')) {
        addToCart('mclaren-f1');
      }
      openCartDrawer();
    });
  }

  // Apply Coupon code
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'PRINT3D' || code === 'FORGE15') {
        activeDiscountPercent = 15;
        renderCart();
        showToast('Coupon "PRINT3D" applied! 15% discount granted.', 'success');
      } else if (code === 'MAKER50') {
        activeDiscountPercent = 50;
        renderCart();
        showToast('Super Maker Coupon applied! 50% discount.', 'success');
      } else if (code) {
        showToast('Invalid promo code. Try "PRINT3D"', 'warning');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. RAZORPAY PAYMENT GATEWAY & SIMULATOR INTEGRATION
  // --------------------------------------------------------------------------
  
  /**
   * Finalizes the order, marks items as purchased, clears cart, triggers confetti
   */
  function handleSuccessfulCheckout(paymentId) {
    if (cart.length === 0) return;

    // Collect IDs of purchased products
    const purchasedNow = cart.map(item => item.id);
    const orderItems = [...cart];
    const { total } = calculateCartTotals();
    const isUSD = currentCurrency === 'USD';
    const totalFormatted = isUSD ? `$${total.toFixed(2)}` : `₹${Math.round(total).toLocaleString('en-IN')}`;

    // Add to persisted purchases list
    purchasedNow.forEach(id => {
      if (!purchasedProductIds.includes(id)) {
        purchasedProductIds.push(id);
      }
    });
    localStorage.setItem('forge3d_purchased', JSON.stringify(purchasedProductIds));

    // Clear cart
    cart = [];
    saveCart();
    renderCart();
    renderCatalog();
    updateHeroDownloadGating();
    closeCartDrawer();

    // Trigger celebration confetti
    triggerConfetti();

    // Show celebration receipt modal
    showSuccessReceiptModal(paymentId, totalFormatted, orderItems);
  }

  /**
   * Trigger Razorpay Standard Checkout Popup
   */
  function initiateRazorpayCheckout() {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    const { total } = calculateCartTotals();
    // Razorpay operates in INR (in paise)
    // Convert to INR if in USD
    const totalINR = currentCurrency === 'USD' ? Math.round(total * 83) : Math.round(total);
    const amountInPaise = totalINR * 100;

    const itemsSummary = cart.map(i => i.title).join(', ');
    const activeKey = razorpayKeyId || 'rzp_test_placeholder';

    // Verify if Razorpay SDK is loaded
    if (typeof window.Razorpay === 'undefined') {
      showToast('Razorpay script is loading. You can also use the Sandbox Simulator!', 'warning');
      return;
    }

    // If using dummy key, warn and prompt or allow fallback to sandbox simulator
    if (!razorpayKeyId || razorpayKeyId === 'rzp_test_placeholder') {
      const proceed = confirm(
        'Notice: You have not configured your own Razorpay Key ID yet.\n\n' +
        'Would you like to:\n' +
        '• Click "OK" to use the Instant Sandbox Simulator (tests download unlock instantly!)\n' +
        '• Click "Cancel" to open the Razorpay Setup Guide to enter your Key ID.'
      );
      if (proceed) {
        handleSandboxCheckout();
      } else {
        openRazorpayGuide();
      }
      return;
    }

    // Configure standard Razorpay options
    const options = {
      key: activeKey,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Forge 3D Print Studio',
      description: `Purchase of ${cart.length} 3D Printable Asset(s)`,
      image: 'https://cdn-icons-png.flaticon.com/512/3242/3242257.png',
      handler: function (response) {
        const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substr(2, 9)}`;
        handleSuccessfulCheckout(paymentId);
      },
      prefill: {
        name: 'Makerspace Engineer',
        email: 'maker@forge3d.io',
        contact: '9999999999'
      },
      notes: {
        items: itemsSummary.substring(0, 150)
      },
      theme: {
        color: '#ff7a00' // McLaren Papaya Orange
      },
      modal: {
        ondismiss: function () {
          showToast('Razorpay checkout window closed.', 'info');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showToast(`Payment failed: ${response.error.description}`, 'warning');
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      showToast('Error opening Razorpay gateway. Check your Key ID or use Sandbox Simulator.', 'warning');
    }
  }

  /**
   * Fast Sandbox simulator (no internet / no account needed to test full unlock flow!)
   */
  function handleSandboxCheckout() {
    if (cart.length === 0) return;
    const dummyPaymentId = `pay_demo_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    showToast('Processing Sandbox payment simulation...', 'info');
    setTimeout(() => {
      handleSuccessfulCheckout(dummyPaymentId);
    }, 400);
  }

  if (razorpayCheckoutBtn) {
    razorpayCheckoutBtn.addEventListener('click', initiateRazorpayCheckout);
  }

  if (simulatorCheckoutBtn) {
    simulatorCheckoutBtn.addEventListener('click', handleSandboxCheckout);
  }

  // --------------------------------------------------------------------------
  // 10. CELEBRATION & RECEIPT MODAL
  // --------------------------------------------------------------------------
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff7a00', '#00f2fe', '#8b5cf6', '#10b981']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff7a00', '#00f2fe']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#10b981']
        });
      }, 250);
    }
  }

  function showSuccessReceiptModal(paymentId, amountPaid, items) {
    if (!successModal) return;

    receiptPaymentId.textContent = paymentId;
    receiptDate.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    receiptAmount.textContent = amountPaid;

    unlockedItemsList.innerHTML = items.map(item => `
      <div class="unlocked-download-row">
        <div class="unlocked-item-meta">
          <span class="unlocked-title">${item.title}</span>
          <span class="unlocked-formats">Includes: ${item.formats.join(', ')}</span>
        </div>
        <button class="btn-instant-dl" data-url="${item.downloadUrl}" data-name="${item.id}_package.zip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Package
        </button>
      </div>
    `).join('');

    unlockedItemsList.querySelectorAll('.btn-instant-dl').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerDownload(btn.dataset.url, btn.dataset.name);
      });
    });

    successModal.classList.add('open');
  }

  if (doneSuccessBtn) {
    doneSuccessBtn.addEventListener('click', () => {
      successModal.classList.remove('open');
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 11. MY PURCHASED LIBRARY MODAL
  // --------------------------------------------------------------------------
  function openLibraryModal() {
    if (!libraryModal || !libraryContent) return;

    if (purchasedProductIds.length === 0) {
      libraryContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.5;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <h4 style="color:#fff; margin-bottom:8px;">No Purchased Files Yet</h4>
          <p style="font-size:0.9rem;">Once you purchase the McLaren F1 or any model via Razorpay, they will appear here forever with unlimited downloads.</p>
        </div>
      `;
    } else {
      const purchasedItems = PRODUCTS.filter(p => purchasedProductIds.includes(p.id));
      libraryContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${purchasedItems.map(item => `
            <div class="unlocked-download-row">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${item.image}" alt="${item.title}" style="width:54px; height:54px; object-fit:cover; border-radius:6px;">
                <div class="unlocked-item-meta">
                  <span class="unlocked-title">${item.title}</span>
                  <span class="unlocked-formats">✓ Verified License · ${item.formats.join(', ')}</span>
                </div>
              </div>
              <button class="btn-instant-dl" data-url="${item.downloadUrl}" data-name="${item.id}_package.zip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download
              </button>
            </div>
          `).join('')}
        </div>
      `;

      libraryContent.querySelectorAll('.btn-instant-dl').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerDownload(btn.dataset.url, btn.dataset.name);
        });
      });
    }

    libraryModal.classList.add('open');
  }

  if (openLibraryBtn) openLibraryBtn.addEventListener('click', openLibraryModal);
  if (footerLibraryLink) {
    footerLibraryLink.addEventListener('click', (e) => {
      e.preventDefault();
      openLibraryModal();
    });
  }

  // --------------------------------------------------------------------------
  // 12. RAZORPAY SETUP GUIDE MODAL
  // --------------------------------------------------------------------------
  function openRazorpayGuide() {
    if (!razorpayGuideModal) return;
    if (razorpayKeyInput) {
      razorpayKeyInput.value = razorpayKeyId;
    }
    if (keyStatusMsg) {
      keyStatusMsg.textContent = razorpayKeyId
        ? `Active Key: ${razorpayKeyId.substring(0, 12)}...`
        : 'No custom key configured. (Running with Sandbox Simulator fallback)';
      keyStatusMsg.className = razorpayKeyId ? 'key-status-msg success' : 'key-status-msg';
    }
    razorpayGuideModal.classList.add('open');
  }

  if (openRazorpayGuideBtn) openRazorpayGuideBtn.addEventListener('click', openRazorpayGuide);
  if (footerRazorpayLink) {
    footerRazorpayLink.addEventListener('click', (e) => {
      e.preventDefault();
      openRazorpayGuide();
    });
  }

  if (saveRazorpayKeyBtn && razorpayKeyInput) {
    saveRazorpayKeyBtn.addEventListener('click', () => {
      const key = razorpayKeyInput.value.trim();
      razorpayKeyId = key;
      localStorage.setItem('forge3d_razorpay_key', key);
      if (key) {
        keyStatusMsg.textContent = `✓ Key ID saved! Razorpay checkout will now authenticate using your credentials.`;
        keyStatusMsg.className = 'key-status-msg success';
        showToast('Razorpay Key ID successfully saved', 'success');
      } else {
        keyStatusMsg.textContent = `Key cleared. Using Sandbox Simulator fallback.`;
        keyStatusMsg.className = 'key-status-msg';
        showToast('Key cleared. Sandbox Simulator active.', 'info');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 13. QUICK VIEW & 3D SPECS MODAL
  // --------------------------------------------------------------------------
  function openQuickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product || !quickViewModal || !qvBody || !qvTitle) return;

    qvTitle.textContent = product.title;
    const isPurchased = isProductPurchased(product.id);
    const inCart = cart.some(ci => ci.id === product.id);

    qvBody.innerHTML = `
      <div>
        <img src="${product.image}" alt="${product.title}" class="qv-image">
      </div>
      <div class="qv-details">
        <span class="spec-pill pill-cyan" style="align-self:flex-start; margin-bottom:12px;">${product.categoryLabel}</span>
        <div style="font-size:1.6rem; font-weight:800; color:#fff; font-family:var(--font-display); margin-bottom:8px;">
          ${formatPrice(product.priceINR, product.priceUSD)}
        </div>
        <p style="color:var(--text-muted); font-size:0.92rem; line-height:1.55; margin-bottom:18px;">
          ${product.description}
        </p>

        <div class="specs-grid" style="margin-bottom:20px;">
          <div class="spec-item">
            <span class="spec-label">Print Time</span>
            <span class="spec-value">${product.printTime}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Layer Height</span>
            <span class="spec-value">${product.layerHeight}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Filament Mass</span>
            <span class="spec-value">${product.weight}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Dimensions</span>
            <span class="spec-value">${product.dimensions}</span>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-top:auto;">
          ${isPurchased ? `
            <button class="btn-primary" id="qv-download-btn" style="flex:1;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download Files</span>
            </button>
          ` : inCart ? `
            <button class="btn-primary" id="qv-cart-btn" style="flex:1;">
              <span>View in Cart</span>
            </button>
          ` : `
            <button class="btn-primary" id="qv-cart-btn" style="flex:1;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span>Add to Cart</span>
            </button>
          `}
          ${product.has3DModel ? `
            <button class="btn-secondary" id="qv-view3d-btn" style="flex:1;">
              <span>Inspect in 3D</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Attach CTA listeners inside quick view
    const qvCartBtn = document.getElementById('qv-cart-btn');
    if (qvCartBtn) {
      qvCartBtn.addEventListener('click', () => {
        quickViewModal.classList.remove('open');
        addToCart(product.id);
      });
    }

    const qvDlBtn = document.getElementById('qv-download-btn');
    if (qvDlBtn) {
      qvDlBtn.addEventListener('click', () => {
        triggerDownload(product.downloadUrl, `${product.id}_package.zip`);
      });
    }

    const qv3dBtn = document.getElementById('qv-view3d-btn');
    if (qv3dBtn) {
      qv3dBtn.addEventListener('click', () => {
        quickViewModal.classList.remove('open');
        const heroStage = document.getElementById('hero-3d-stage');
        if (heroStage) heroStage.scrollIntoView({ behavior: 'smooth' });
      });
    }

    quickViewModal.classList.add('open');
  }

  // Generic modal closer
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // ESC key closes drawers/modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    }
  });

  // --------------------------------------------------------------------------
  // 14. TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7a00" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // --------------------------------------------------------------------------
  // 15. INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    updateCurrency(currentCurrency);
    updateHeroDownloadGating();
    updateCartBadges();
    renderCatalog();
    console.log('Forge 3D Print Studio loaded successfully with Razorpay & Realtime GLB 3D Inspector.');
  }

  init();

})();
