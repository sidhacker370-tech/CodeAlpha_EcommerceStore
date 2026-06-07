// CodeAlpha Store Cart Controller
const Cart = {
  items: [],

  // Initialize cart from localStorage
  init() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.items = JSON.parse(savedCart);
      } catch (e) {
        this.items = [];
      }
    }
    this.syncBadge();
  },

  // Save cart to localStorage
  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.syncBadge();
    window.dispatchEvent(new Event('cart-change'));
  },

  // Get all items
  getItems() {
    return this.items;
  },

  // Add item to cart
  addItem(product, quantity = 1) {
    const qty = parseInt(quantity) || 1;
    const existingItem = this.items.find((item) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      this.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: qty,
      });
    }
    this.save();
    showToast(`Added ${product.name} to cart!`, 'success');
  },

  // Update quantity of an item
  updateQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    const item = this.items.find((item) => item.productId === productId);

    if (item) {
      if (qty <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = qty;
        this.save();
      }
    }
  },

  // Remove item from cart
  removeItem(productId) {
    const item = this.items.find((i) => i.productId === productId);
    this.items = this.items.filter((item) => item.productId !== productId);
    this.save();
    if (item) {
      showToast(`Removed ${item.name} from cart`, 'info');
    }
  },

  // Clear cart
  clearCart() {
    this.items = [];
    this.save();
  },

  // Get total count of all items
  getTotalItemsCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  // Get total amount
  getTotalAmount() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Sync cart icon badge in navigation header
  syncBadge() {
    const badgeEl = document.getElementById('cart-badge-count');
    if (badgeEl) {
      const count = this.getTotalItemsCount();
      if (count > 0) {
        badgeEl.textContent = count;
        badgeEl.classList.remove('hide');
        
        // Add subtle scale pop animation
        badgeEl.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)' },
          { transform: 'scale(1)' }
        ], {
          duration: 200,
          iterations: 1
        });
      } else {
        badgeEl.classList.add('hide');
      }
    }
  },
};

// Initialize Cart immediately on load
Cart.init();
