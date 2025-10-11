/* Modern cart + search + small animations (vanilla JS) */

const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const toastEl = document.getElementById('toast');
const searchInput = document.getElementById('search');

let cart = [];

// Utilities
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('show');
  toastEl.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    toastEl.classList.remove('show');
    toastEl.setAttribute('aria-hidden', 'true');
  }, 1400);
}

function formatPrice(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function updateCartUI() {
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="meta">
        <h4>${item.name}</h4>
        <small>${item.qty} × $${formatPrice(item.price)}</small>
      </div>
      <div>
        <button class="remove" data-index="${index}">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.textContent = formatPrice(total);
  cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// Fly image animation (visual feedback)
function flyToCart(imgEl) {
  const rect = imgEl.getBoundingClientRect();
  const clone = imgEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.transition = 'all 0.85s cubic-bezier(.2,.9,.2,1)';
  clone.style.zIndex = 9999;
  document.body.appendChild(clone);

  const destRect = cartToggle.getBoundingClientRect();
  requestAnimationFrame(() => {
    clone.style.left = `${destRect.left + destRect.width / 2 - 20}px`;
    clone.style.top = `${destRect.top + destRect.height / 2 - 20}px`;
    clone.style.width = '36px';
    clone.style.height = '36px';
    clone.style.opacity = '0.6';
    clone.style.transform = 'rotate(-10deg) scale(.6)';
  });

  setTimeout(() => clone.remove(), 900);
}

// Add product handler
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const qtyInput = card.querySelector('.qty');
    const qty = Math.max(1, parseInt(qtyInput.value) || 1);
    const img = card.querySelector('img').src;

    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ name, price, qty, img });
    }

    updateCartUI();
    flyToCart(card.querySelector('img'));
    showToast(`${name} added (${qty})`);
  });
});

// Remove item (delegated)
cartItemsEl.addEventListener('click', (e) => {
  if (e.target.matches('.remove')) {
    const idx = Number(e.target.dataset.index);
    if (!isNaN(idx)) {
      cart.splice(idx, 1);
      updateCartUI();
      showToast('Item removed');
    }
  }
});

// Cart drawer toggle
cartToggle.addEventListener('click', () => {
  const isOpen = cartDrawer.classList.toggle('open');
  cartToggle.setAttribute('aria-expanded', String(isOpen));
  cartDrawer.setAttribute('aria-hidden', String(!isOpen));
});

// Close cart
closeCartBtn.addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  cartToggle.setAttribute('aria-expanded', 'false');
  cartDrawer.setAttribute('aria-hidden', 'true');
});

// Clear cart
document.getElementById('clear-cart').addEventListener('click', () => {
  cart = [];
  updateCartUI();
  showToast('Cart cleared');
});

// Checkout (demo)
document.getElementById('checkout').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Cart is empty');
    return;
  }
  cart = [];
  updateCartUI();
  cartDrawer.classList.remove('open');
  showToast('Thank you — order placed');
});

// Search filter with smooth transitions (opacity + transform)
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.dataset.name.toLowerCase();
    if (!q || name.includes(q)) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
      card.style.pointerEvents = 'auto';
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(8px) scale(.98)';
      card.style.pointerEvents = 'none';
    }
  });
});

// Theme toggle (persist)
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(value) {
  if (value === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  localStorage.setItem('theme', value);
}
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeToggle.setAttribute('aria-pressed', String(isDark));
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
// restore
applyTheme(localStorage.getItem('theme') || 'light');

// initial UI
updateCartUI();
