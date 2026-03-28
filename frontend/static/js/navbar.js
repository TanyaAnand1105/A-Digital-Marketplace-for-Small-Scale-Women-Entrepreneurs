function renderNavbar(activePage) {
  const user = getCurrentUser();
  const cartCount = getCart().reduce((s, i) => s + i.qty, 0);
  const badge = cartCount > 0 ? `<span class="cart-count cart-badge-pill">${cartCount}</span>` : `<span class="cart-count cart-badge-pill" style="display:none">0</span>`;

  let links = '';
  if (user) {
    if (user.role === 'seller') {
      links = `
        <li class="nav-item"><a class="nav-link ${activePage==='home'?'active':''}" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='shop'?'active':''}" href="shop.html">Shop</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='dashboard'?'active':''}" href="seller_dashboard.html">📊 Dashboard</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='sell'?'active':''}" href="add_product.html">➕ Sell</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='profile'?'active':''}" href="profile.html">👤 ${user.name.split(' ')[0]}</a></li>
        <li class="nav-item"><a class="nav-link" href="#" onclick="logoutUser();return false" style="color:#e91e8c!important;font-weight:600">Logout</a></li>`;
    } else {
      links = `
        <li class="nav-item"><a class="nav-link ${activePage==='home'?'active':''}" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='shop'?'active':''}" href="shop.html">Shop</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='wishlist'?'active':''}" href="wishlist.html">❤ Wishlist</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='cart'?'active':''}" href="cart.html">🛒 Cart${badge}</a></li>
        <li class="nav-item"><a class="nav-link ${activePage==='profile'?'active':''}" href="profile.html">👤 ${user.name.split(' ')[0]}</a></li>
        <li class="nav-item"><a class="nav-link" href="#" onclick="logoutUser();return false" style="color:#e91e8c!important;font-weight:600">Logout</a></li>`;
    }
  } else {
    links = `
      <li class="nav-item"><a class="nav-link ${activePage==='home'?'active':''}" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link ${activePage==='shop'?'active':''}" href="shop.html">Shop</a></li>
      <li class="nav-item ms-2"><a class="nav-link btn-nav-login" href="login.html">Login</a></li>
      <li class="nav-item ms-1"><a class="nav-link btn-nav-signup" href="signup.html">Sign Up</a></li>`;
  }

  const html = `
  <nav class="navbar navbar-expand-lg kk-navbar sticky-top" id="mainNav">
    <div class="container">
      <a class="navbar-brand kk-brand" href="index.html"><span class="brand-k">Kala</span><span class="brand-k2">Kriti</span></a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-expanded="false">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto align-items-center gap-1">${links}</ul>
      </div>
    </div>
  </nav>`;

  const el = document.getElementById('navbar');
  if (el) el.innerHTML = html;

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}