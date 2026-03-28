from flask import Flask, send_from_directory
import os

# ── App Setup ─────────────────────────────────────────────────────────────
# static_folder='frontend/static' means Flask automatically serves
# /static/... from frontend/static/ — so ../static/images/x.jpg works.
app = Flask(__name__, static_folder='frontend/static')
app.secret_key = 'kala_kriti_secret_2024'

BASE = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE, 'frontend', 'templates')
DATA_DIR      = os.path.join(BASE, 'frontend', 'data')

# ── Root → Signup (entry point) ────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory(TEMPLATES_DIR, 'signup.html')

# ── Seller Dashboard (explicit route for seller_dashboard.html links) ─────
@app.route('/seller_dashboard.html')
def seller_dashboard_html():
    return send_from_directory(TEMPLATES_DIR, 'seller_dashboard.html')

# ── Serve any HTML page by filename  e.g. /login.html  /shop.html ─────────
@app.route('/<page>.html')
def serve_page(page):
    filename = page + '.html'
    try:
        return send_from_directory(TEMPLATES_DIR, filename)
    except Exception:
        return send_from_directory(TEMPLATES_DIR, 'index.html'), 404

# ── Serve JSON data files (/data/products.json, /data/categories.json) ────
# Our JS does fetch('../data/x.json') from /shop.html → resolves to /data/x.json
@app.route('/data/<filename>')
def serve_data(filename):
    return send_from_directory(DATA_DIR, filename)

# ── Legacy clean-URL routes (backward compat + convenience) ───────────────
@app.route('/login')
def login():
    return send_from_directory(TEMPLATES_DIR, 'login.html')

@app.route('/signup')
def signup():
    return send_from_directory(TEMPLATES_DIR, 'signup.html')

@app.route('/home')
def home():
    return send_from_directory(TEMPLATES_DIR, 'index.html')

@app.route('/shop')
def shop():
    return send_from_directory(TEMPLATES_DIR, 'shop.html')

@app.route('/product')
def product():
    return send_from_directory(TEMPLATES_DIR, 'product.html')

@app.route('/cart')
def cart():
    return send_from_directory(TEMPLATES_DIR, 'cart.html')

@app.route('/wishlist')
def wishlist():
    return send_from_directory(TEMPLATES_DIR, 'wishlist.html')

@app.route('/add_product')
def add_product():
    return send_from_directory(TEMPLATES_DIR, 'add_product.html')

@app.route('/profile')
def profile():
    return send_from_directory(TEMPLATES_DIR, 'profile.html')

@app.route('/seller_dashboard')
def seller_dashboard():
    return send_from_directory(TEMPLATES_DIR, 'seller_dashboard.html')

@app.route('/seller-dashboard')
def seller_dashboard_alt():
    return send_from_directory(TEMPLATES_DIR, 'seller_dashboard.html')

# ── Run ────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)