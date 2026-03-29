/* ================= LOGIN CHECK ================= */

function checkLogin(){
  const token = localStorage.getItem("token");

  if(!token){
    window.location.href = "login.html";
    return false;
  }
  return true;
}


/* ================= CURSOR GLOW ================= */

const glow = document.querySelector(".cursor-glow");

if (glow) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.pageX + "px";
    glow.style.top = e.pageY + "px";
  });
}


/* ================= CARD HOVER EFFECT ================= */

const cards = document.querySelectorAll(".product-card");

cards.forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    card.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0) scale(1)";
  });
});


/* ================= WISHLIST ================= */

function addToWishlist(){

  if(!checkLogin()) return;

  let product = {
    name: document.getElementById("product-name")?.innerText || "Product",
    price: parseInt(
      document.getElementById("product-price")?.innerText.replace("₹","")
    ) || 0,
    image: document.getElementById("product-image")?.src || ""
  };

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  wishlist.push(product);

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  alert("Added to Wishlist ❤️");
}


/* ================= IMAGE ================= */

function changeImage(element) {
  document.getElementById("product-image").src = element.src;
}

function zoomImage() {
  let img = document.getElementById("product-image")?.src;
  let zoom = document.getElementById("zoomedImg");

  if(zoom){
    zoom.src = img;
    document.getElementById("imageModal").style.display = "flex";
  }
}

function closeImage() {
  let modal = document.getElementById("imageModal");
  if(modal){
    modal.style.display = "none";
  }
}


/* ================= QUANTITY ================= */

function changeQty(value) {
  let qtyInput = document.getElementById("qty");

  if(!qtyInput) return;

  let current = parseInt(qtyInput.value);
  current += value;

  if (current < 1) current = 1;

  qtyInput.value = current;
}


/* ================= ADD TO CART ================= */

function addToCart(){

  if(!checkLogin()) return;

  let qtyInput = document.getElementById("qty");
  let qty = qtyInput ? qtyInput.value : 1;

  let name = document.getElementById("product-name")?.innerText || "Product";
  let priceText = document.getElementById("product-price")?.innerText || "₹0";
  let price = parseInt(priceText.replace("₹","")) || 0;
  let image = document.getElementById("product-image")?.src || "";

  let product = {
    name: name,
    price: price,
    image: image,
    quantity: qty
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let existing = cart.find(p => p.name === name);

  if(existing){
    existing.quantity += parseInt(qty);
  }else{
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to Cart 🛒");

  window.location.href = "cart.html";
}


/* ================= BUY NOW ================= */

function buyNow(){

  if(!checkLogin()) return;

  let qty = document.getElementById("qty")?.value || 1;

  alert("Buying " + qty + " item(s) 🚀");
}


/* ================= LOGOUT ================= */

function logout(){
  localStorage.removeItem("token");
  window.location.href = "index.html";
}


/* ================= CART COUNT ================= */

function updateCartCount(){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let countElement = document.getElementById("cart-count");

  if(countElement){
    countElement.innerText = cart.length;
  }
}

updateCartCount();


/* ================= REDIRECT CHECK ================= */

function checkLoginRedirect(event){
  const token = localStorage.getItem("token");

  if(!token){
    event.preventDefault();
    window.location.href = "login.html";
  }
}
