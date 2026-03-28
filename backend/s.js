"""Backend: Authentication System + Seller Portal"""

from flask import (
    Flask, render_template, request,
    redirect, url_for, session, jsonify
)
from functools import wraps
from db import Database

app = Flask(
    __name__,
    template_folder='frontend/templates',
    static_folder='frontend/static'
)

# Secret key required for Flask session encryption
# Change this to a long random string before deploying
app.secret_key = 'kalakriti_secret_key_iitpatna_2024'

dbo = Database()


# ═══════════════════════════════════════════════════════
#  DECORATOR: login_required
#  Protects any route that needs authentication.
#  Usage: @login_required above any route function.
# ═══════════════════════════════════════════════════════
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function


# ───────────────────────────────────────────────────────
# ROUTE 1: Login Page
# GET /
# ───────────────────────────────────────────────────────
@app.route('/')
def index():
    # Already logged in? Go to dashboard
    if 'user_email' in session:
        return redirect(url_for('profile'))
    return render_template('login.html')


# ───────────────────────────────────────────────────────
# ROUTE 2: Signup Page
# GET /signup
# ───────────────────────────────────────────────────────
@app.route('/signup')
def signup():
    if 'user_email' in session:
        return redirect(url_for('profile'))
    return render_template('signup.html')


# ───────────────────────────────────────────────────────
# ROUTE 3: Process Signup Form
# POST /perform_signup
# Form fields: username, email, password
# ───────────────────────────────────────────────────────
@app.route('/perform_signup', methods=['POST'])
def perform_signup():
    name     = request.form.get('username', '').strip()
    email    = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    # Server-side validation
    if not name or not email or not password:
        return render_template('signup.html',
                               message='All fields are required.')
    if len(password) < 6:
        return render_template('signup.html',
                               message='Password must be at least 6 characters.')

    response = dbo.insert(name, email, password)

    if response:
        return render_template('login.html',
                               message='Registration Successful. Kindly login to proceed.')
    else:
        return render_template('signup.html',
                               message='Email already exists. Please use a different email.')


# ───────────────────────────────────────────────────────
# ROUTE 4: Process Login Form
# POST /perform_login
# Form fields: email, password
# On success: stores user_email + user_name in session
# ───────────────────────────────────────────────────────
@app.route('/perform_login', methods=['POST'])
def perform_login():
    email    = request.form.get('email', '').strip().lower()
    password = request.form.get('password', '')

    if not email or not password:
        return render_template('login.html',
                               message='Please enter both email and password.')

    user_data = dbo.search(email, password)

    if user_data:
        # ✅ Save user info in session
        session['user_email'] = email
        session['user_name']  = user_data.get('name', email)
        return redirect(url_for('profile'))
    else:
        return render_template('login.html',
                               message='Incorrect email or password.')


# ───────────────────────────────────────────────────────
# ROUTE 5: Seller Dashboard
# GET /profile
# Protected route – must be logged in
# Passes: user_name, user_email, my_products, product_count
# ───────────────────────────────────────────────────────
@app.route('/profile')
@login_required
def profile():
    user_name   = session.get('user_name', 'Seller')
    user_email  = session.get('user_email', '')

    all_products  = dbo.get_all_products()
    my_products   = [p for p in all_products
                     if p.get('seller_email') == user_email]

    return render_template('profile.html',
                           user_name     = user_name,
                           user_email    = user_email,
                           my_products   = my_products,
                           product_count = len(my_products))


# ───────────────────────────────────────────────────────
# ROUTE 6: Add Product Page
# GET /add_product
# Protected route – must be logged in
# ───────────────────────────────────────────────────────
@app.route('/add_product')
@login_required
def add_product():
    return render_template('add_product.html',
                           user_name=session.get('user_name'))


# ───────────────────────────────────────────────────────
# ROUTE 7: Process Add Product Form
# POST /perform_add_product
# Form fields: p_name, p_price, p_desc, p_category
# Saves to products.json via Database class
# ───────────────────────────────────────────────────────
@app.route('/perform_add_product', methods=['POST'])
@login_required
def perform_add_product():
    p_name  = request.form.get('p_name', '').strip()
    p_price = request.form.get('p_price', '').strip()
    p_desc  = request.form.get('p_desc', '').strip()
    p_cat   = request.form.get('p_category', 'Other').strip()

    # Server-side validation
    if not p_name or not p_price or not p_desc:
        return render_template('add_product.html',
                               message='All fields are required.',
                               user_name=session.get('user_name'))
    try:
        if float(p_price) <= 0:
            raise ValueError
    except ValueError:
        return render_template('add_product.html',
                               message='Enter a valid price greater than zero.',
                               user_name=session.get('user_name'))

    result = dbo.add_product(
        name         = p_name,
        price        = p_price,
        desc         = p_desc,
        category     = p_cat,
        seller_email = session.get('user_email', ''),
        seller_name  = session.get('user_name', '')
    )

    if result:
        return render_template('add_product.html',
                               success=f'"{p_name}" listed successfully! '
                                       f'<a href="/marketplace">View in Marketplace →</a>',
                               user_name=session.get('user_name'))
    else:
        return render_template('add_product.html',
                               message='Something went wrong. Please try again.',
                               user_name=session.get('user_name'))


# ───────────────────────────────────────────────────────
# ROUTE 8: Logout
# GET /logout  – clears session, redirects to login
# ───────────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


# ───────────────────────────────────────────────────────
# ROUTE 9: Marketplace
# GET /marketplace
# Optional query params: ?search=xyz  &category=abc
# Passes: products, search_query, category, user_name
# ───────────────────────────────────────────────────────
@app.route('/marketplace')
def marketplace():
    all_products = dbo.get_all_products()
    search_query = request.args.get('search', '').strip().lower()
    category     = request.args.get('category', '').strip()

    if search_query:
        all_products = [p for p in all_products
                        if search_query in p.get('name', '').lower()
                        or search_query in p.get('description', '').lower()]

    if category:
        all_products = [p for p in all_products
                        if p.get('category', '').lower() == category.lower()]

    return render_template('marketplace.html',
                           products     = all_products,
                           search_query = search_query,
                           category     = category,
                           user_name    = session.get('user_name'))


# ───────────────────────────────────────────────────────
# ROUTE 10: Add to Cart
# POST /add_to_cart
# Form fields: product_name, product_price
# Stores cart in session
# ───────────────────────────────────────────────────────
@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_name  = request.form.get('product_name', '')
    product_price = request.form.get('product_price', '0')

    if 'cart' not in session:
        session['cart'] = []

    session['cart'].append({'name': product_name, 'price': product_price})
    session.modified = True

    all_products = dbo.get_all_products()
    cart_count   = len(session['cart'])

    return render_template('marketplace.html',
                           products   = all_products,
                           message    = f'"{product_name}" added to cart! '
                                        f'({cart_count} item{"s" if cart_count > 1 else ""} in cart)',
                           user_name  = session.get('user_name'))


# ───────────────────────────────────────────────────────
# ROUTE 11: Delete a Product (Seller only)
# POST /delete_product
# Form field: product_index
# ───────────────────────────────────────────────────────
@app.route('/delete_product', methods=['POST'])
@login_required
def delete_product():
    try:
        idx = int(request.form.get('product_index', -1))
        dbo.delete_product(idx, session.get('user_email'))
    except Exception:
        pass
    return redirect(url_for('profile'))


# ═══════════════════════════════════════════════════════
#  API ROUTES – Return JSON (for JS fetch calls)
# ═══════════════════════════════════════════════════════

# GET /api/products  – All products as JSON
@app.route('/api/products')
def api_products():
    q    = request.args.get('search', '').lower()
    cat  = request.args.get('category', '').lower()
    data = dbo.get_all_products()
    if q:
        data = [p for p in data
                if q in p.get('name','').lower()
                or q in p.get('description','').lower()]
    if cat:
        data = [p for p in data
                if p.get('category','').lower() == cat]
    return jsonify(data)


# GET /api/session  – Current login status as JSON
@app.route('/api/session')
def api_session_status():
    if 'user_email' in session:
        return jsonify({'logged_in': True,
                        'name': session.get('user_name'),
                        'email': session.get('user_email')})
    return jsonify({'logged_in': False})


# GET /api/my_products  – Products listed by logged-in seller
@app.route('/api/my_products')
@login_required
def api_my_products():
    email    = session.get('user_email')
    products = [p for p in dbo.get_all_products()
                if p.get('seller_email') == email]
    return jsonify(products)


# ───────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)
