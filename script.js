const STORAGE_KEYS = {
  PRODUCTS: 'neonbyte_products',
  CART: 'neonbyte_cart',
  ADMIN_AUTH: 'neonbyte_admin_logged_in'
};

const defaultProducts = [
  {
    id: 'pc-phantom',
    name: 'Phantom RIG X9',
    price: 55900,
    category: 'Desktop',
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'pc-nebula',
    name: 'Nebula Core i7',
    price: 44900,
    category: 'Desktop',
    image: 'https://images.unsplash.com/photo-1555617981-dac3880c38ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'gpu-nova',
    name: 'Nova RTX 5090',
    price: 59990,
    category: 'Graphic Card',
    image: 'https://images.unsplash.com/photo-1610465299996-31c59131622f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'monitor-aether',
    name: 'Aether 34" Ultrawide',
    price: 21900,
    category: 'Monitor',
    image: 'https://images.unsplash.com/photo-1618005198900-89d1b2cc0d79?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'keyboard-zen',
    name: 'ZenKey Optical Pro',
    price: 6590,
    category: 'Keyboard',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'headset-void',
    name: 'VoidPulse 7.1',
    price: 4990,
    category: 'Headset',
    image: 'https://images.unsplash.com/photo-1580906852146-e72807efe7a6?auto=format&fit=crop&w=900&q=80'
  }
];

function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse products from storage', error);
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  return [...defaultProducts];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getCart() {
  const saved = localStorage.getItem(STORAGE_KEYS.CART);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to parse cart', error);
    }
  }
  return [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function addToCart(productId) {
  const products = getProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  showToast('เพิ่มสินค้าในตะกร้าเรียบร้อย!');
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateQuantity(productId, delta) {
  const cart = getCart();
  const target = cart.find((item) => item.id === productId);
  if (!target) return;

  target.quantity = Math.max(1, target.quantity + delta);
  saveCart(cart);
  renderCart();
}

function calculateCartSummary(cart, products) {
  let subtotal = 0;
  const detailed = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return null;
    const total = product.price * item.quantity;
    subtotal += total;
    return { ...product, quantity: item.quantity, total };
  }).filter(Boolean);

  const vat = subtotal * 0.07;
  const grandTotal = subtotal + vat;
  return {
    items: detailed,
    subtotal,
    vat,
    grandTotal
  };
}

function formatPrice(amount) {
  return amount.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  const products = getProducts();

  // Render products on homepage
  const productGrid = document.querySelector('.product-grid');
  if (productGrid) {
    productGrid.innerHTML = products.map((product) => `
      <article class="product-card">
        <span class="badge">${product.category}</span>
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn-primary" data-add="${product.id}">เพิ่มลงตะกร้า</button>
      </article>
    `).join('');

    productGrid.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-add]');
      if (!button) return;
      addToCart(button.dataset.add);
    });
  }

  // Login simulation
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('เข้าสู่ระบบสำเร็จ! กำลังพากลับไปหน้าหลัก');
      setTimeout(() => window.location.href = 'index.html', 1200);
    });
  }

  const registerForm = document.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('สมัครสมาชิกเรียบร้อย! ลองเข้าสู่ระบบได้เลย');
      setTimeout(() => window.location.href = 'login.html', 1200);
    });
  }

  // Cart page
  if (document.querySelector('.cart-wrapper')) {
    renderCart();
  }

  // Billing page
  if (document.querySelector('.billing-wrapper')) {
    const cart = getCart();
    const summary = calculateCartSummary(cart, products);
    const summaryContainer = document.querySelector('.order-summary');

    if (summaryContainer) {
      if (!summary.items.length) {
        summaryContainer.innerHTML = '<p>ยังไม่มีสินค้าในตะกร้า</p>';
      } else {
        summaryContainer.innerHTML = summary.items.map((item) => `
          <div class="order-line">
            <div>
              <strong>${item.name}</strong>
              <p class="text-muted">x${item.quantity}</p>
            </div>
            <span>${formatPrice(item.total)}</span>
          </div>
        `).join('') + `
          <hr>
          <div class="order-total">
            <span>ยอดรวมสินค้า</span>
            <strong>${formatPrice(summary.subtotal)}</strong>
          </div>
          <div class="order-total">
            <span>ภาษี (7%)</span>
            <strong>${formatPrice(summary.vat)}</strong>
          </div>
          <div class="order-total">
            <span>ยอดสุทธิ</span>
            <strong>${formatPrice(summary.grandTotal)}</strong>
          </div>
        `;
      }
    }

    const billingForm = document.querySelector('#billing-form');
    if (billingForm) {
      billingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        showToast('ยืนยันคำสั่งซื้อเรียบร้อย! ขอบคุณที่เลือก NeonByte.');
        saveCart([]);
        setTimeout(() => window.location.href = 'index.html', 1500);
      });
    }
  }

  // Admin page
  const adminLoginForm = document.querySelector('#admin-login-form');
  const adminDashboard = document.querySelector('.admin-dashboard');
  const adminLogoutBtn = document.querySelector('#admin-logout');

  if (adminLoginForm && adminDashboard) {
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    toggleAdminView(isLoggedIn);

    adminLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = event.target.email.value;
      const password = event.target.password.value;

      if (email === 'admin@neonbyte.com' && password === 'admin1234') {
        showToast('เข้าสู่ระบบผู้ดูแลระบบสำเร็จ');
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        toggleAdminView(true);
      } else {
        showToast('ข้อมูลไม่ถูกต้อง ลองใหม่อีกครั้ง');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'false');
      toggleAdminView(false);
    });
  }

  const productForm = document.querySelector('#product-form');
  if (productForm) {
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(productForm);
      const product = Object.fromEntries(formData.entries());
      const currentProducts = getProducts();

      if (product.id && currentProducts.some((item) => item.id === product.id)) {
        const updated = currentProducts.map((item) => item.id === product.id ? {
          ...item,
          name: product.name,
          price: Number(product.price),
          category: product.category,
          image: product.image
        } : item);
        saveProducts(updated);
        showToast('อัปเดตสินค้าเรียบร้อย');
      } else {
        const newProduct = {
          id: product.id || `custom-${Date.now()}`,
          name: product.name,
          price: Number(product.price),
          category: product.category,
          image: product.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'
        };
        saveProducts([...currentProducts, newProduct]);
        showToast('เพิ่มสินค้าใหม่สำเร็จ');
      }

      productForm.reset();
      renderAdminTable();
    });
  }

  renderAdminTable();
});

function renderCart() {
  const cartContainer = document.querySelector('.cart-items');
  const summaryContainer = document.querySelector('.cart-summary');
  if (!cartContainer || !summaryContainer) return;

  const cart = getCart();
  const products = getProducts();
  const summary = calculateCartSummary(cart, products);

  if (!summary.items.length) {
    cartContainer.innerHTML = '<p>ยังไม่มีสินค้าในตะกร้า</p>';
    summaryContainer.innerHTML = '';
    return;
  }

  cartContainer.innerHTML = summary.items.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p class="price">${formatPrice(item.price)}</p>
        <div class="quantity-control">
          <button data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <div>
        <p>${formatPrice(item.total)}</p>
        <button class="btn-secondary" data-action="remove" data-id="${item.id}">ลบ</button>
      </div>
    </div>
  `).join('');

  summaryContainer.innerHTML = `
    <div><span>ยอดรวมสินค้า</span><span>${formatPrice(summary.subtotal)}</span></div>
    <div><span>ภาษี (7%)</span><span>${formatPrice(summary.vat)}</span></div>
    <div class="total"><span>ยอดสุทธิ</span><span>${formatPrice(summary.grandTotal)}</span></div>
  `;

  cartContainer.onclick = (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;

    if (action === 'remove') {
      removeFromCart(id);
    }
    if (action === 'increase') {
      updateQuantity(id, 1);
    }
    if (action === 'decrease') {
      updateQuantity(id, -1);
    }
  };
}

function toggleAdminView(isLoggedIn) {
  const adminLoginSection = document.querySelector('.admin-login');
  const adminDashboard = document.querySelector('.admin-dashboard');
  if (isLoggedIn) {
    adminLoginSection?.classList.add('hidden');
    adminDashboard?.classList.add('active');
  } else {
    adminLoginSection?.classList.remove('hidden');
    adminDashboard?.classList.remove('active');
  }
  renderAdminTable();
}

function renderAdminTable() {
  const tableBody = document.querySelector('#product-table-body');
  if (!tableBody) return;
  const products = getProducts();

  tableBody.innerHTML = products.map((product) => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatPrice(product.price)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-secondary" data-edit="${product.id}">แก้ไข</button>
          <button class="btn-secondary" data-delete="${product.id}">ลบ</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.onclick = (event) => {
    const editButton = event.target.closest('button[data-edit]');
    const deleteButton = event.target.closest('button[data-delete]');
    const productForm = document.querySelector('#product-form');
    if (editButton && productForm) {
      const product = products.find((item) => item.id === editButton.dataset.edit);
      if (!product) return;
      const { elements } = productForm;
      elements.namedItem('id').value = product.id;
      elements.namedItem('name').value = product.name;
      elements.namedItem('price').value = product.price;
      elements.namedItem('category').value = product.category;
      elements.namedItem('image').value = product.image;
      showToast('โหลดข้อมูลสินค้าเพื่อแก้ไข');
    }

    if (deleteButton) {
      const filtered = products.filter((item) => item.id !== deleteButton.dataset.delete);
      saveProducts(filtered);
      showToast('ลบสินค้าเรียบร้อย');
      renderAdminTable();
    }
  };
}

// Toast styling
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(48, 242, 242, 0.15);
  border: 1px solid rgba(48, 242, 242, 0.4);
  color: var(--text-primary);
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 200;
}
.toast.visible {
  opacity: 1;
  transform: translateY(0);
}
`;
document.head.appendChild(toastStyles);
