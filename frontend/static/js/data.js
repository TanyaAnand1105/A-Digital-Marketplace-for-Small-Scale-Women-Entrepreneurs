// ── Config ──
const IMG = '../static/images/';
const DATA = '../data/';

// ── Products ──
async function loadProducts() {
  try { const r = await fetch(DATA + 'products.json'); return await r.json(); }
  catch(e) { console.error('Products load failed', e); return []; }
}
async function loadCategories() {
  try { const r = await fetch(DATA + 'categories.json'); return await r.json(); }
  catch(e) { return []; }
}
function imgSrc(filename) { return IMG + filename; }

// ── Cart ──
function getCart() { return JSON.parse(localStorage.getItem('kk_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('kk_cart', JSON.stringify(cart)); updateCartBadge(); }
function addToCart(product, qty = 1) {
  const cart = getCart();
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty += qty; else cart.push({ ...product, qty });
  saveCart(cart); showToast('Added to cart! 🛒');
}
function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }
function updateCartQty(id, qty) {
  const cart = getCart(); const item = cart.find(i => i.id === id);
  if (item) { item.qty = qty; if (item.qty <= 0) removeFromCart(id); else saveCart(cart); }
}
function getCartTotal() { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }
function clearCart() { localStorage.removeItem('kk_cart'); updateCartBadge(); }
function updateCartBadge() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'inline' : 'none';
  });
}

// ── Wishlist ──
function getWishlist() { return JSON.parse(localStorage.getItem('kk_wishlist') || '[]'); }
function toggleWishlist(id) {
  const wl = getWishlist(); const idx = wl.indexOf(id);
  if (idx === -1) { wl.push(id); showToast('Added to wishlist ❤'); }
  else { wl.splice(idx, 1); showToast('Removed from wishlist'); }
  localStorage.setItem('kk_wishlist', JSON.stringify(wl));
  return idx === -1;
}
function isWishlisted(id) { return getWishlist().includes(id); }

// ── Auth ──
function getCurrentUser() { return JSON.parse(localStorage.getItem('kk_user') || 'null'); }
function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('kk_users') || '{}');
  const user = users[email];
  if (user && user.password === password) {
    const u = { name: user.name, email, role: user.role || 'buyer' };
    localStorage.setItem('kk_user', JSON.stringify(u)); return { success: true, user: u };
  }
  return { success: false, msg: 'Invalid email or password' };
}
function registerUser(name, email, password, role) {
  const users = JSON.parse(localStorage.getItem('kk_users') || '{}');
  if (users[email]) return { success: false, msg: 'Email already registered' };
  users[email] = { name, password, role };
  localStorage.setItem('kk_users', JSON.stringify(users)); return { success: true };
}
function logoutUser() { localStorage.removeItem('kk_user'); window.location.href = 'login.html'; }
function requireAuth() { if (!getCurrentUser()) { window.location.href = 'login.html'; return false; } return true; }
function requireSeller() {
  const u = getCurrentUser();
  if (!u || u.role !== 'seller') { window.location.href = 'index.html'; return false; } return true;
}

// ── Seller Products ──
function getSellerProducts(sellerId) {
  const all = JSON.parse(localStorage.getItem('kk_seller_products') || '[]');
  return sellerId ? all.filter(p => p.sellerId === sellerId) : all;
}
function saveSellerProduct(p) {
  const all = JSON.parse(localStorage.getItem('kk_seller_products') || '[]');
  const user = getCurrentUser();
  p.id = 'sp_' + Date.now(); p.sellerId = user.email; p.seller = user.name;
  p.rating = 0; p.reviews = 0; p.stock = parseInt(p.stock) || 10;
  p.price = parseInt(p.price); p.originalPrice = p.price;
  all.push(p); localStorage.setItem('kk_seller_products', JSON.stringify(all)); return p;
}

// ── UI Helpers ──
function showToast(msg, type = 'success') {
  let box = document.getElementById('toast-box');
  if (!box) {
    box = document.createElement('div'); box.id = 'toast-box';
    box.style.cssText = 'position:fixed;bottom:22px;right:22px;z-index:9999;display:flex;flex-direction:column;gap:10px';
    document.body.appendChild(box);
  }
  const t = document.createElement('div'); t.className = 'kk-toast';
  t.style.cssText = `background:${type==='error'?'#c62828':'#e91e8c'};color:#fff;padding:13px 20px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:.85rem;box-shadow:0 6px 20px rgba(233,30,140,.35);max-width:280px;cursor:pointer`;
  t.textContent = msg; box.appendChild(t);
  t.onclick = () => t.remove();
  setTimeout(() => { t.style.animation = 'toastOut .3s forwards'; setTimeout(() => t.remove(), 300); }, 3000);
}
function renderStars(r) {
  const full = Math.floor(r), half = r % 1 >= .5 ? 1 : 0, emp = 5 - full - half;
  return '<span style="color:#ffc107">' + '★'.repeat(full) + (half?'½':'') + '<span style="color:#ddd">' + '☆'.repeat(emp) + '</span></span>';
}
function formatPrice(p) { return '₹' + Number(p).toLocaleString('en-IN'); }
function getDiscount(price, orig) { return orig > price ? Math.round((orig - price) / orig * 100) : 0; }

// ── Product Card HTML ──
function productCardHTML(p, allImages = false) {
  const disc = getDiscount(p.price, p.originalPrice);
  const wl = isWishlisted(p.id);
  return `
  <div class="product-card">
    <div class="product-img-wrap">
      <img class="product-img" src="${imgSrc(p.image)}" alt="${p.name}" loading="lazy" onerror="this.src='../static/images/banner.jpg'">
      ${p.featured ? '<span class="badge-featured">Featured</span>' : (disc > 0 ? `<span class="badge-discount">${disc}% OFF</span>` : '')}
      <button class="wl-btn ${wl ? 'active' : ''}" onclick="handleWishlist('${p.id}', this)" title="Wishlist">${wl ? '❤' : '🤍'}</button>
    </div>
    <div class="product-body">
      <div class="product-cat">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-rating">${renderStars(p.rating)} <span>(${p.reviews})</span></div>
      <div class="price-row">
        <span class="price-now">${formatPrice(p.price)}</span>
        ${p.originalPrice > p.price ? `<span class="price-old">${formatPrice(p.originalPrice)}</span>` : ''}
      </div>
      <a href="product.html?id=${p.id}" class="btn-pink btn-pink-sm" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px">🛍 View Details</a>
    </div>
  </div>`;
}

function handleWishlist(id, btn) {
  if (!getCurrentUser()) { window.location.href = 'login.html'; return; }
  const added = toggleWishlist(id);
  btn.textContent = added ? '❤' : '🤍';
  btn.classList.toggle('active', added);
}

// ── Combined Products (JSON + localStorage seller products) ──
async function getAllProducts() {
  const base = await loadProducts();
  const seller = getSellerProducts();
  return [...base, ...seller];
}

document.addEventListener('DOMContentLoaded', () => { 