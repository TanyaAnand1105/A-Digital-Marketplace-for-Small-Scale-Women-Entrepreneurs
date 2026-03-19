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

function addToWishlist() {

  let heart = document.querySelector(".wishlist-heart");

  heart.classList.toggle("active");

  if (heart.classList.contains("active")) {
    heart.innerHTML = "❤️";
  } else {
    heart.innerHTML = "♡";
  }

  let product = {
    name: "Crochet Purse",
    price: 1200,
    image: "images/crochet purse.jpeg"
  };

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  wishlist.push(product);

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}


/* ================= IMAGE ================= */

function changeImage(element) {
  document.getElementById("productImg").src = element.src;
}

function zoomImage() {
  let img = document.getElementById("productImg").src;
  document.getElementById("zoomedImg").src = img;
  document.getElementById("imageModal").style.display = "flex";
}

function closeImage() {
  document.getElementById("imageModal").style.display = "none";
}


/* ================= QUANTITY ================= */

function changeQty(value) {
  let qtyInput = document.getElementById("qty");

  let current = parseInt(qtyInput.value);

  current += value;

  if (current < 1) current = 1;

  qtyInput.value = current;
}


/* ================= ADD TO CART ================= */

function addToCart() {

  let qty = document.getElementById("qty").value;

  let product = {
    name: "Crochet Purse",
    price: 1200,
    image: "images/crochet purse.jpeg",
    quantity: qty
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push(product);

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to Cart");

  // 🔥 redirect to cart page
  window.location.href = "cart.html";
}


/* ================= BUY NOW ================= */

function buyNow() {
  let qty = document.getElementById("qty").value;
  alert("Buying " + qty + " item(s)");
}


/* ================= CART COUNT ================= */

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let countElement = document.getElementById("cart-count");

  if (countElement) {
    countElement.innerText = cart.length;
  }
}

updateCartCount();