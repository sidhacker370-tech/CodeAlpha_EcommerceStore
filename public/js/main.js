// CodeAlpha Store Central Controller & Router

// Global State
const SearchState = {
  keyword: '',
  category: 'All',
  sort: 'newest'
};

// Global Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <div class="toast-content">${message}</div>
    <i class="fa-solid fa-xmark toast-close"></i>
  `;

  container.appendChild(toast);

  // Close button click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('slide-out');
    toast.addEventListener('animationend', () => toast.remove());
  });

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('slide-out');
      toast.addEventListener('animationend', () => toast.remove());
    }
  }, 4000);
}

// Loader Utilities
function showLoader(show) {
  const loader = document.getElementById('loader');
  if (loader) {
    if (show) {
      loader.classList.remove('hide');
    } else {
      loader.classList.add('hide');
    }
  }
}

// Format Currency
function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Update Navbar based on Auth State
function syncNavbarAuth() {
  const guestGroup = document.getElementById('nav-guest-links');
  const memberGroup = document.getElementById('nav-member-links');
  const userNameEl = document.getElementById('nav-user-name');

  if (Auth.isAuthenticated()) {
    const user = Auth.getUser();
    if (userNameEl && user) {
      userNameEl.textContent = user.name.split(' ')[0]; // Show first name
    }
    guestGroup.classList.add('hide');
    memberGroup.classList.remove('hide');
  } else {
    guestGroup.classList.remove('hide');
    memberGroup.classList.add('hide');
  }
}

// Highlights active nav links
function updateNavActiveState(hash) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const route = link.getAttribute('data-route');
    if (hash === '#/' && route === 'home') {
      link.classList.add('active');
    } else if (hash.startsWith('#/products') && route === 'products') {
      link.classList.add('active');
    } else if (hash.startsWith('#/cart') && route === 'cart') {
      link.classList.add('active');
    } else if (hash.startsWith('#/orders') && route === 'orders') {
      link.classList.add('active');
    } else if ((hash.startsWith('#/login') || hash.startsWith('#/register') || hash.startsWith('#/profile')) && route === hash.replace('#/', '')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --- Route Rendering Functions --- */

// Render Home Page
async function renderHome() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="container hero-container">
        <div class="hero-text">
          <h1>Next-Gen Shopping Experience</h1>
          <p>Explore our premium collections crafted for peak performance and timeless styling. Join today and unlock special members-only pricing.</p>
          <a href="#/products" class="hero-cta">Shop Collections <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" alt="Featured Shoes">
        </div>
      </div>
    </section>

    <!-- Promo Showcase -->
    <div class="container">
      <section class="promo-showcase">
        <div class="promo-item">
          <i class="fa-solid fa-truck-fast"></i>
          <h4>Free Shipping</h4>
          <p>On all domestic orders over ₹5,000. Rapid delivery to your doorstep.</p>
        </div>
        <div class="promo-item">
          <i class="fa-solid fa-shield-halved"></i>
          <h4>Secure Payments</h4>
          <p>SSL secured transactions and flexible cash payment options.</p>
        </div>
        <div class="promo-item">
          <i class="fa-solid fa-rotate-left"></i>
          <h4>Easy Returns</h4>
          <p>30-day hassle-free return window on all unworn merchandise.</p>
        </div>
      </section>
    </div>

    <!-- Featured Categories -->
    <section class="featured-categories container">
      <h2 class="section-title">Shop by Category</h2>
      <div class="category-grid">
        <div class="category-card" onclick="selectCategory('Electronics')">
          <div class="category-icon"><i class="fa-solid fa-laptop"></i></div>
          <h3>Electronics</h3>
          <p>Computers, smart wearables & audio gear</p>
        </div>
        <div class="category-card" onclick="selectCategory('Apparel')">
          <div class="category-icon"><i class="fa-solid fa-shirt"></i></div>
          <h3>Apparel</h3>
          <p>Modern clothing and premium athletic wear</p>
        </div>
        <div class="category-card" onclick="selectCategory('Accessories')">
          <div class="category-icon"><i class="fa-solid fa-glasses"></i></div>
          <h3>Accessories</h3>
          <p>Backpacks, lights & everyday essentials</p>
        </div>
        <div class="category-card" onclick="selectCategory('Fitness')">
          <div class="category-icon"><i class="fa-solid fa-dumbbell"></i></div>
          <h3>Fitness</h3>
          <p>Water flasks, training gear & trackers</p>
        </div>
      </div>
    </section>

    <!-- Latest Arrivals -->
    <section class="container mb-4" style="padding-bottom: 4rem;">
      <h2 class="section-title">Featured Products</h2>
      <div id="featured-products-list" class="products-grid">
        <!-- Products will load dynamically -->
        <div class="text-center w-100" style="padding: 2rem;"><div class="spinner" style="margin: 0 auto; width: 40px; height: 40px;"></div></div>
      </div>
    </section>
  `;

  try {
    // Fetch products to show top 4 on home
    const response = await API.products.list();
    const featuredProductsEl = document.getElementById('featured-products-list');
    
    if (response.success && response.data.length > 0) {
      const topProducts = response.data.slice(0, 4);
      featuredProductsEl.innerHTML = topProducts.map(p => `
        <div class="product-card">
          <span class="product-tag">${p.category}</span>
          <div class="product-image-wrapper">
            <a href="#/product/${p._id}">
              <img src="${p.image}" alt="${p.name}">
            </a>
          </div>
          <div class="product-info">
            <a href="#/product/${p._id}">
              <h3>${p.name}</h3>
            </a>
            <p class="product-description-excerpt">${p.description}</p>
            <div class="product-footer">
              <span class="product-price">${formatPrice(p.price)}</span>
              <button class="btn-add-cart-icon" onclick="addToCartFromList('${p._id}')" aria-label="Add to cart">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      featuredProductsEl.innerHTML = '<p class="text-center w-100">No products found.</p>';
    }
  } catch (error) {
    document.getElementById('featured-products-list').innerHTML = '<p class="text-center w-100">Error loading products.</p>';
  }
}

// Redirect category card click to Shop Page
window.selectCategory = function(cat) {
  SearchState.category = cat;
  SearchState.keyword = '';
  window.location.hash = '#/products';
};

// Add to Cart helper from product lists
window.addToCartFromList = async function(id) {
  try {
    const response = await API.products.get(id);
    if (response.success) {
      Cart.addItem(response.data, 1);
    }
  } catch (e) {
    showToast('Failed to add product to cart', 'error');
  }
};

// Render Products Shop Page
async function renderProducts() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="container">
      <div class="shop-layout">
        <!-- Sidebar Filters -->
        <aside class="filter-sidebar">
          <div class="filter-group">
            <h3 class="filter-title">Categories</h3>
            <div id="category-filter-list" class="category-filter-list">
              <!-- Dynamically populated categories -->
              <span class="spinner" style="width: 25px; height: 25px; margin: 10px auto;"></span>
            </div>
          </div>
          
          <div class="filter-group">
            <h3 class="filter-title">Sort By</h3>
            <select id="sort-select" class="sort-select">
              <option value="newest" ${SearchState.sort === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
              <option value="price_asc" ${SearchState.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price_desc" ${SearchState.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
            </select>
          </div>
          
          <button id="reset-filters" class="btn-secondary w-100 mt-2" style="font-size: 0.85rem; height: 38px;">Reset Filters</button>
        </aside>

        <!-- Product Grid Content -->
        <section class="products-wrapper">
          <div class="shop-header">
            <div>
              <h1 style="font-family: var(--font-mono); font-size: 1.75rem;">Shop Products</h1>
              <span id="search-query-lbl" class="results-count"></span>
            </div>
            <span id="total-count-lbl" class="results-count">Showing 0 products</span>
          </div>

          <div id="shop-products-grid" class="products-grid">
            <!-- Loaded dynamically -->
            <div class="text-center w-100" style="padding: 5rem 0;"><div class="spinner" style="margin: 0 auto;"></div></div>
          </div>
        </section>
      </div>
    </div>
  `;

  // Bind sidebar events
  document.getElementById('sort-select').addEventListener('change', (e) => {
    SearchState.sort = e.target.value;
    loadFilteredProducts();
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    SearchState.keyword = '';
    SearchState.category = 'All';
    SearchState.sort = 'newest';
    document.getElementById('global-search-input').value = '';
    loadFilteredProducts();
  });

  // Initial load
  await loadFilteredProducts();
}

// Loads and filters shop products
async function loadFilteredProducts() {
  const productsGrid = document.getElementById('shop-products-grid');
  const totalCountLbl = document.getElementById('total-count-lbl');
  const searchQryLbl = document.getElementById('search-query-lbl');
  
  if (!productsGrid) return;

  try {
    const response = await API.products.list(SearchState);
    
    if (response.success) {
      // Render count labels
      totalCountLbl.textContent = `Showing ${response.data.length} product${response.data.length === 1 ? '' : 's'}`;
      
      if (SearchState.keyword) {
        searchQryLbl.innerHTML = `Search results for: <strong>"${SearchState.keyword}"</strong>`;
      } else if (SearchState.category !== 'All') {
        searchQryLbl.innerHTML = `Category: <strong>${SearchState.category}</strong>`;
      } else {
        searchQryLbl.innerHTML = '';
      }

      // Render category filter buttons
      const catListEl = document.getElementById('category-filter-list');
      if (catListEl) {
        catListEl.innerHTML = response.categories.map(c => `
          <button class="filter-btn ${SearchState.category === c ? 'active' : ''}" onclick="applyCategoryFilter('${c}')">
            ${c}
          </button>
        `).join('');
      }

      // Render products grid
      if (response.data.length > 0) {
        productsGrid.innerHTML = response.data.map(p => `
          <div class="product-card">
            <span class="product-tag">${p.category}</span>
            <div class="product-image-wrapper">
              <a href="#/product/${p._id}">
                <img src="${p.image}" alt="${p.name}">
              </a>
            </div>
            <div class="product-info">
              <a href="#/product/${p._id}">
                <h3>${p.name}</h3>
              </a>
              <p class="product-description-excerpt">${p.description}</p>
              <div class="product-footer">
                <span class="product-price">${formatPrice(p.price)}</span>
                <button class="btn-add-cart-icon" onclick="addToCartFromList('${p._id}')" aria-label="Add to cart">
                  <i class="fa-solid fa-cart-plus"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        productsGrid.innerHTML = `
          <div class="no-products w-100" style="grid-column: 1 / -1;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <h2>No Products Found</h2>
            <p class="mt-2">Try adjusting your filters or search keyword.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    productsGrid.innerHTML = `<p class="text-center w-100" style="grid-column: 1 / -1;">Error loading products: ${error.message}</p>`;
  }
}

window.applyCategoryFilter = function(cat) {
  SearchState.category = cat;
  loadFilteredProducts();
};

// Render Product Detail Page
async function renderProductDetail(id) {
  const mainContent = document.getElementById('main-content');
  showLoader(true);

  try {
    const response = await API.products.get(id);
    showLoader(false);

    if (response.success) {
      const p = response.data;
      mainContent.innerHTML = `
        <div class="container details-container">
          <a href="#/products" class="back-link"><i class="fa-solid fa-arrow-left"></i> Back to shop</a>
          
          <div class="details-layout">
            <div class="details-gallery">
              <img src="${p.image}" alt="${p.name}">
            </div>
            
            <div class="details-info">
              <span class="details-category">${p.category}</span>
              <h1 class="details-name">${p.name}</h1>
              <div class="details-price">${formatPrice(p.price)}</div>
              <p class="details-description">${p.description}</p>
              
              <div class="purchase-panel">
                <div class="quantity-selector">
                  <button id="qty-dec-btn" aria-label="Decrease quantity">-</button>
                  <span id="qty-val">1</span>
                  <button id="qty-inc-btn" aria-label="Increase quantity">+</button>
                </div>
                <button id="add-to-cart-detail-btn" class="btn-primary flex-grow"><i class="fa-solid fa-cart-shopping"></i> Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Bind detail quantity and cart events
      let currentQty = 1;
      const qtyValEl = document.getElementById('qty-val');
      const decBtn = document.getElementById('qty-dec-btn');
      const incBtn = document.getElementById('qty-inc-btn');
      const addBtn = document.getElementById('add-to-cart-detail-btn');

      decBtn.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          qtyValEl.textContent = currentQty;
        }
      });

      incBtn.addEventListener('click', () => {
        currentQty++;
        qtyValEl.textContent = currentQty;
      });

      addBtn.addEventListener('click', () => {
        Cart.addItem(p, currentQty);
      });
    }
  } catch (error) {
    showLoader(false);
    mainContent.innerHTML = `
      <div class="container text-center" style="padding: 5rem 1.5rem;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
        <h1>Product Not Found</h1>
        <p class="mt-2">${error.message}</p>
        <a href="#/products" class="btn-primary mt-4" style="display: inline-flex; width: fit-content; margin: 1.5rem auto 0;">Back to shop</a>
      </div>
    `;
  }
}

// Render Shopping Cart & Checkout
async function renderCart() {
  const mainContent = document.getElementById('main-content');
  const cartItems = Cart.getItems();

  if (cartItems.length === 0) {
    mainContent.innerHTML = `
      <div class="container" style="padding: 4rem 1.5rem;">
        <div class="empty-cart-view">
          <i class="fa-solid fa-cart-flatbed-suitcases"></i>
          <h1>Your Cart is Empty</h1>
          <p class="mt-2">Looks like you haven't added any products to your cart yet.</p>
          <a href="#/products" class="btn-primary mt-4" style="display: inline-flex; width: fit-content; margin: 1.5rem auto 0;">Start Shopping</a>
        </div>
      </div>
    `;
    return;
  }

  // Build Cart Rows
  const cartRowsHTML = cartItems.map(item => `
    <div class="cart-item-row" data-id="${item.productId}">
      <div class="cart-item-product">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <a href="#/product/${item.productId}" class="cart-item-name">${item.name}</a>
          <div class="cart-item-cat">${item.category}</div>
        </div>
      </div>
      <div class="cart-item-price">${formatPrice(item.price)}</div>
      <div>
        <div class="quantity-selector" style="height: 34px;">
          <button onclick="changeCartQty('${item.productId}', ${item.quantity - 1})" aria-label="Decrease">-</button>
          <span style="width: 30px;">${item.quantity}</span>
          <button onclick="changeCartQty('${item.productId}', ${item.quantity + 1})" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
      <div>
        <button class="btn-remove-cart" onclick="removeCartItem('${item.productId}')" aria-label="Delete item">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');

  const subtotal = Cart.getTotalAmount();
  const shipping = subtotal > 5000 ? 0 : 150;
  const tax = subtotal * 0.18; // 18% standard GST tax
  const total = subtotal + shipping + tax;

  mainContent.innerHTML = `
    <div class="container cart-layout">
      <!-- Items Panel -->
      <section class="cart-items-panel">
        <h1 style="font-family: var(--font-mono); font-size: 1.75rem; margin-bottom: 1.5rem;">Shopping Cart</h1>
        <div class="cart-table-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Total</span>
          <span></span>
        </div>
        <div class="cart-rows-container">
          ${cartRowsHTML}
        </div>
      </section>

      <!-- Summary & Checkout Panel -->
      <aside class="cart-summary-panel">
        <h2 class="cart-summary-title">Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
        <div class="summary-row">
          <span>Estimated GST (18%)</span>
          <span>${formatPrice(tax)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatPrice(total)}</span>
        </div>

        <!-- Checkout Address Block -->
        <div id="checkout-address-block">
          ${
            Auth.isAuthenticated() 
            ? `
              <h3 class="form-section-title">Shipping Details</h3>
              <form id="checkout-form" class="checkout-form">
                <div class="form-group">
                  <label class="form-label" for="ship-name">Full Name</label>
                  <input type="text" id="ship-name" class="form-input" value="${Auth.getUser().name}" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ship-addr">Street Address</label>
                  <input type="text" id="ship-addr" class="form-input" placeholder="123 Main St" required>
                </div>
                <div class="input-row">
                  <div class="form-group">
                    <label class="form-label" for="ship-city">City</label>
                    <input type="text" id="ship-city" class="form-input" placeholder="New York" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="ship-zip">Postal Code</label>
                    <input type="text" id="ship-zip" class="form-input" placeholder="10001" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ship-country">Country</label>
                  <input type="text" id="ship-country" class="form-input" value="United States" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="payment-method-select">Payment Method</label>
                  <select id="payment-method-select" class="sort-select" style="padding: 0.75rem 1rem;">
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="Online Payment">Online Payment (Card/UPI Sandbox)</option>
                  </select>
                </div>
                <button type="submit" id="checkout-submit-btn" class="btn-primary w-100 mt-2" style="height: 48px;">
                  Place Order (Cash on Delivery)
                </button>
              </form>
            `
            : `
              <div class="text-center mt-4" style="background: var(--gray-100); padding: 1.5rem; border-radius: var(--radius-md);">
                <p style="font-size: 0.9rem; font-weight: 500; margin-bottom: 1rem;">Please log in to complete checkout.</p>
                <a href="#/login" class="btn-primary w-100" style="height: 40px;">Log In to Checkout</a>
              </div>
            `
          }
        </div>
      </aside>
    </div>
  `;

  // Bind checkout form submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    // Listen to payment method select change to update button text
    const payMethodSelect = document.getElementById('payment-method-select');
    const submitBtn = document.getElementById('checkout-submit-btn');
    if (payMethodSelect && submitBtn) {
      payMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Online Payment') {
          submitBtn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Proceed to Pay ${formatPrice(total)}`;
        } else {
          submitBtn.textContent = 'Place Order (Cash on Delivery)';
        }
      });
    }

    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const orderProducts = Cart.getItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const shippingAddress = {
        fullName: document.getElementById('ship-name').value.trim(),
        address: document.getElementById('ship-addr').value.trim(),
        city: document.getElementById('ship-city').value.trim(),
        postalCode: document.getElementById('ship-zip').value.trim(),
        country: document.ProgrammaticAddressValue || document.getElementById('ship-country').value.trim(),
      };

      const selectedMethod = document.getElementById('payment-method-select').value;

      if (selectedMethod === 'Online Payment') {
        openPaymentGatewayModal(total, orderProducts, shippingAddress);
      } else {
        showLoader(true);
        try {
          const response = await API.orders.create({
            products: orderProducts,
            shippingAddress,
            paymentMethod: 'Cash on Delivery',
            paymentStatus: 'Pending',
          });
          showLoader(false);

          if (response.success) {
            Cart.clearCart();
            showToast('Order placed successfully!', 'success');
            // Redirect to orders history
            window.location.hash = '#/orders';
          }
        } catch (error) {
          showLoader(false);
          showToast(error.message, 'error');
        }
      }
    });
  }
}

window.changeCartQty = function(productId, newQty) {
  Cart.updateQuantity(productId, newQty);
  renderCart();
};

window.removeCartItem = function(productId) {
  Cart.removeItem(productId);
  renderCart();
};

// Render Login Page
async function renderLogin() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to check out and track your orders.</p>
        
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="name@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-primary w-100 mt-2" style="height: 46px;">Log In</button>
        </form>
        
        <div class="auth-redirect">
          Don't have an account? <a href="#/register">Create one now</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    showLoader(true);
    const result = await Auth.login(email, password);
    showLoader(false);

    if (result.success) {
      showToast('Logged in successfully!', 'success');
      window.location.hash = '#/';
    } else {
      showToast(result.message, 'error');
    }
  });
}

// Render Register Page
async function renderRegister() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Sign up to unlock order tracking and easy checkout.</p>
        
        <form id="register-form">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name</label>
            <input type="text" id="reg-name" class="form-input" placeholder="John Doe" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Email Address</label>
            <input type="email" id="reg-email" class="form-input" placeholder="name@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <input type="password" id="reg-password" class="form-input" placeholder="Min. 6 characters" required autocomplete="new-password" minlength="6">
          </div>
          <button type="submit" class="btn-primary w-100 mt-2" style="height: 46px;">Sign Up</button>
        </form>
        
        <div class="auth-redirect">
          Already have an account? <a href="#/login">Log in here</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    showLoader(true);
    const result = await Auth.register(name, email, password);
    showLoader(false);

    if (result.success) {
      showToast('Registration successful! Welcome.', 'success');
      window.location.hash = '#/';
    } else {
      showToast(result.message, 'error');
    }
  });
}

// Render Orders History Page
async function renderOrders(silent = false) {
  const mainContent = document.getElementById('main-content');
  if (!silent) showLoader(true);

  try {
    const response = await API.orders.list();
    if (!silent) showLoader(false);

    if (response.success) {
      // If user has navigated away from orders page while API call was pending, abort
      if (window.location.hash !== '#/orders') {
        if (window.ordersPollerInterval) {
          clearInterval(window.ordersPollerInterval);
          window.ordersPollerInterval = null;
        }
        return;
      }
      const orders = response.data;
      
      if (orders.length === 0) {
        mainContent.innerHTML = `
          <div class="container orders-container">
            <h1 style="font-family: var(--font-mono); font-size: 1.75rem;">Your Orders</h1>
            <div class="no-orders mt-4">
              <i class="fa-solid fa-receipt"></i>
              <h2>No Orders Found</h2>
              <p class="mt-2">You haven't placed any orders yet.</p>
              <a href="#/products" class="btn-primary mt-4" style="display: inline-flex; width: fit-content; margin: 1.5rem auto 0;">Start Shopping</a>
            </div>
          </div>
        `;
        return;
      }

      const orderCardsHTML = orders.map(order => {
        const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        
        let statusBadge = 'badge-pending';
        if (order.status === 'Processing') statusBadge = 'badge-info';
        if (order.status === 'Confirmed') statusBadge = 'badge-success';
        if (order.status === 'Shipped') statusBadge = 'badge-info';
        if (order.status === 'Delivered') statusBadge = 'badge-success';
        if (order.status === 'Cancelled') statusBadge = 'badge-danger';

        const productItemsHTML = order.products.map(item => `
          <div class="order-product-item">
            <span class="order-product-name">${item.name} <span class="order-product-qty">x ${item.quantity}</span></span>
            <span class="order-product-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('');

        return `
          <div class="order-card">
            <div class="order-card-header">
              <div class="order-id-group">
                <span class="order-id">Order #${order._id.substring(order._id.length - 8).toUpperCase()}</span>
                <span class="order-date">Placed on ${dateStr}</span>
              </div>
              <span class="badge ${statusBadge}">${order.status}</span>
            </div>
            
            <div class="order-card-products">
              ${productItemsHTML}
            </div>
            
            <div class="order-card-footer">
              <div>
                <div style="font-size: 0.8rem; color: var(--gray-400);">Address:</div>
                <div style="font-size: 0.85rem; color: var(--gray-600);">${order.shippingAddress.address}, ${order.shippingAddress.city}</div>
              </div>
              <div>
                <span class="order-total-lbl">Total Amount:</span>
                <span class="order-total-val">${formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      mainContent.innerHTML = `
        <div class="container orders-container">
          <h1 style="font-family: var(--font-mono); font-size: 1.75rem;">Your Orders</h1>
          <div class="orders-list">
            ${orderCardsHTML}
          </div>
        </div>
      `;

      // Auto-refresh orders status if there are any Processing orders
      const hasProcessing = orders.some(order => order.status === 'Processing');
      if (hasProcessing) {
        if (!window.ordersPollerInterval) {
          window.ordersPollerInterval = setInterval(() => {
            renderOrders(true);
          }, 3000);
        }
      } else {
        if (window.ordersPollerInterval) {
          clearInterval(window.ordersPollerInterval);
          window.ordersPollerInterval = null;
        }
      }
    }
  } catch (error) {
    if (!silent) showLoader(false);
    showToast(error.message, 'error');
  }
}

// Render User Profile Settings
async function renderProfile() {
  const mainContent = document.getElementById('main-content');
  const user = Auth.getUser();

  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  mainContent.innerHTML = `
    <div class="container">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-nav">
          <button class="profile-nav-item active"><i class="fa-regular fa-user"></i> Personal Info</button>
          <a href="#/orders" class="profile-nav-item"><i class="fa-solid fa-clock-rotate-left"></i> Order History</a>
          <button id="profile-logout-btn" class="profile-nav-item logout-action"><i class="fa-solid fa-power-off"></i> Log Out</button>
        </aside>

        <!-- Content Panel -->
        <section class="profile-content">
          <h1 class="profile-title">Account Profile</h1>
          
          <div class="user-avatar-section">
            <div class="profile-avatar-circle">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="profile-user-info">
              <h3>${user.name}</h3>
              <p>${user.email}</p>
            </div>
          </div>

          <div class="checkout-form" style="max-width: 500px;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" value="${user.name}" disabled style="background-color: var(--gray-100);">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" value="${user.email}" disabled style="background-color: var(--gray-100);">
            </div>
            <div class="form-group">
              <label class="form-label">Account Role</label>
              <input type="text" class="form-input" value="Verified Customer" disabled style="background-color: var(--gray-100);">
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  document.getElementById('profile-logout-btn').addEventListener('click', () => {
    Auth.logout();
    showToast('Logged out successfully', 'info');
  });
}

/* --- Router Engine --- */

const router = async () => {
  const path = window.location.hash || '#/';
  
  // Clear any existing orders poller if navigating away from orders
  if (path !== '#/orders' && window.ordersPollerInterval) {
    clearInterval(window.ordersPollerInterval);
    window.ordersPollerInterval = null;
  }
  
  // Close hamburger menu on mobile route change
  const navMenu = document.getElementById('nav-menu');
  if (navMenu) navMenu.classList.remove('show');

  // Highlight active navbar nav link
  updateNavActiveState(path);

  // Router matching
  if (path === '#/' || path === '') {
    await renderHome();
  } else if (path.startsWith('#/products')) {
    await renderProducts();
  } else if (path.startsWith('#/product/')) {
    const id = path.replace('#/product/', '');
    await renderProductDetail(id);
  } else if (path === '#/cart') {
    await renderCart();
  } else if (path === '#/login') {
    if (Auth.isAuthenticated()) {
      window.location.hash = '#/';
    } else {
      await renderLogin();
    }
  } else if (path === '#/register') {
    if (Auth.isAuthenticated()) {
      window.location.hash = '#/';
    } else {
      await renderRegister();
    }
  } else if (path === '#/orders') {
    if (!Auth.isAuthenticated()) {
      showToast('Please log in to view order history.', 'warning');
      window.location.hash = '#/login';
    } else {
      await renderOrders();
    }
  } else if (path === '#/profile') {
    if (!Auth.isAuthenticated()) {
      showToast('Please log in to view account settings.', 'warning');
      window.location.hash = '#/login';
    } else {
      await renderProfile();
    }
  } else {
    // 404 View
    document.getElementById('main-content').innerHTML = `
      <div class="container text-center" style="padding: 5rem 1.5rem;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 4rem; color: var(--danger); margin-bottom: 1rem;"></i>
        <h1 style="font-family: var(--font-mono); font-weight: 700;">Page Not Found</h1>
        <p class="mt-2">The route you requested could not be resolved.</p>
        <a href="#/" class="btn-primary mt-4" style="display: inline-flex; width: fit-content; margin: 1.5rem auto 0;">Return Home</a>
      </div>
    `;
  }
};

// Listeners & Initialization
window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  syncNavbarAuth();
  router();
});

// Listener for authentication changes (syncs navbar links)
window.addEventListener('auth-change', syncNavbarAuth);

// Bind layout event listeners after DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // Bind dropdown menu triggers on click (mobile support)
  const userBtn = document.getElementById('dropdown-user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Bind header global search submit
  const searchForm = document.getElementById('global-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('global-search-input').value.trim();
      SearchState.keyword = q;
      SearchState.category = 'All'; // Reset category on search
      window.location.hash = '#/products';
      
      // Force refresh if already on products page
      if (window.location.hash === '#/products') {
        loadFilteredProducts();
      }
    });
  }

  // Bind newsletter subscription form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterForm.reset();
      showToast('Thank you for subscribing to our newsletter!', 'success');
    });
  }

  // Bind global logout action triggers (outside profile views)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
      showToast('Logged out successfully.', 'info');
    });
  }
});

// ==========================================
// PAYMENT GATEWAY SANDBOX PROTOTYPE ENGINE
// ==========================================

function openPaymentGatewayModal(amount, products, shippingAddress) {
  const modal = document.getElementById('payment-sandbox-modal');
  const amountEl = document.getElementById('payment-modal-amount');
  if (!modal || !amountEl) return;

  amountEl.textContent = formatPrice(amount);
  modal.classList.remove('hide');

  // Reset Modal Status Overlays
  document.getElementById('payment-modal-loader').classList.add('hide');
  document.getElementById('payment-modal-success').classList.add('hide');

  // Reset forms and tabs
  const cardTabBtn = document.getElementById('tab-card-btn');
  const upiTabBtn = document.getElementById('tab-upi-btn');
  const cardView = document.getElementById('sandbox-card-form');
  const upiView = document.getElementById('sandbox-upi-view');

  cardTabBtn.classList.add('active');
  upiTabBtn.classList.remove('active');
  cardView.classList.add('active');
  upiView.classList.remove('active');

  // Clear Form Inputs
  cardView.reset();
  const upiInput = document.getElementById('pay-upi-id');
  if (upiInput) upiInput.value = '';

  // Reset Credit Card Mockup Visuals
  document.getElementById('visual-card-number').textContent = '•••• •••• •••• ••••';
  document.getElementById('visual-card-holder').textContent = 'YOUR NAME';
  document.getElementById('visual-card-expiry').textContent = 'MM/YY';
  document.getElementById('visual-card-logo').className = 'fa-brands fa-cc-visa card-logo';

  // Bind Tab Switching Click Events
  cardTabBtn.onclick = () => {
    cardTabBtn.classList.add('active');
    upiTabBtn.classList.remove('active');
    cardView.classList.add('active');
    upiView.classList.remove('active');
  };

  upiTabBtn.onclick = () => {
    upiTabBtn.classList.add('active');
    cardTabBtn.classList.remove('active');
    upiView.classList.add('active');
    cardView.classList.remove('active');
  };

  // Bind Close Button Click
  document.getElementById('close-payment-modal-btn').onclick = () => {
    modal.classList.add('hide');
  };

  // Credit Card typing formatting & visual mapping
  const cardNumInput = document.getElementById('pay-card-number');
  cardNumInput.oninput = (e) => {
    // Format input (insert spaces every 4 digits)
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    e.target.value = formatted;

    // Update mockup number
    document.getElementById('visual-card-number').textContent = formatted || '•••• •••• •••• ••••';

    // Update Card Logo based on first digit
    const logoEl = document.getElementById('visual-card-logo');
    if (value.startsWith('4')) {
      logoEl.className = 'fa-brands fa-cc-visa card-logo';
    } else if (value.startsWith('5')) {
      logoEl.className = 'fa-brands fa-cc-mastercard card-logo';
    } else if (value.startsWith('3')) {
      logoEl.className = 'fa-brands fa-cc-amex card-logo';
    } else {
      logoEl.className = 'fa-regular fa-credit-card card-logo';
    }
  };

  const cardNameInput = document.getElementById('pay-card-name');
  cardNameInput.oninput = (e) => {
    document.getElementById('visual-card-holder').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
  };

  const cardExpiryInput = document.getElementById('pay-card-expiry');
  cardExpiryInput.oninput = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = value;
    if (value.length > 2) {
      formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = formatted;
    document.getElementById('visual-card-expiry').textContent = formatted || 'MM/YY';
  };

  // Handle Card Payment Submit
  cardView.onsubmit = (e) => {
    e.preventDefault();
    processSimulatedPayment('Credit Card', products, shippingAddress);
  };

  // Handle UPI Payment Trigger
  document.getElementById('pay-upi-btn').onclick = () => {
    const upiId = document.getElementById('pay-upi-id').value.trim();
    if (!upiId && !document.getElementById('tab-upi-btn').classList.contains('active')) return;
    
    // Check if user entered an ID or is just scanning
    const methodDetails = upiId ? `UPI ID (${upiId})` : 'UPI Scan';
    processSimulatedPayment(methodDetails, products, shippingAddress);
  };
}

// Process Simulated Checkout Flow
function processSimulatedPayment(method, products, shippingAddress) {
  const loader = document.getElementById('payment-modal-loader');
  const successOverlay = document.getElementById('payment-modal-success');
  const txIdEl = document.getElementById('success-tx-id');

  // 1. Show processing status
  loader.classList.remove('hide');

  // Update loader text dynamically over the 35 seconds
  const loaderText = loader.querySelector('p');
  const loaderHeader = loader.querySelector('h3');
  
  if (loaderHeader) loaderHeader.textContent = "Authorizing Transaction";
  if (loaderText) loaderText.innerHTML = "Contacting secure payment gateway...<br><span style='font-size:0.75rem; color:var(--gray-400);'>Est. wait time: 35 seconds</span>";

  // Progress message intervals
  const steps = [
    { time: 5000, header: "Verifying Account Status", text: "Secure handshake initialized..." },
    { time: 12000, header: "Processing Bank Route", text: "Encrypting transaction parameters..." },
    { time: 20000, header: "Authorizing 3D Secure", text: "Waiting for automated gateway confirmation..." },
    { time: 28000, header: "Finalizing Ledger Entries", text: "Writing order invoice records..." }
  ];

  steps.forEach(step => {
    setTimeout(() => {
      if (!loader.classList.contains('hide')) {
        if (loaderHeader) loaderHeader.textContent = step.header;
        if (loaderText) loaderText.textContent = step.text;
      }
    }, step.time);
  });

  setTimeout(async () => {
    // 2. Hide loader and trigger checkmark success screen
    loader.classList.add('hide');
    
    const randomTxId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    if (txIdEl) txIdEl.textContent = randomTxId;
    successOverlay.classList.remove('hide');

    // 3. Make server call to save the order as Paid
    try {
      const response = await API.orders.create({
        products,
        shippingAddress,
        paymentMethod: method,
        paymentStatus: 'Paid'
      });

      setTimeout(() => {
        // 4. Close modal and redirect
        document.getElementById('payment-sandbox-modal').classList.add('hide');
        Cart.clearCart();
        showToast('Online Payment Successful!', 'success');
        window.location.hash = '#/orders';
      }, 2000);

    } catch (error) {
      document.getElementById('payment-sandbox-modal').classList.add('hide');
      showToast('Payment succeeded but failed to save order: ' + error.message, 'error');
    }
  }, 35000); // 35 second simulated banker latency
}
