from flask import Flask,render_template,request,redirect,url_for
from db import Database

app =  Flask(__name__,template_folder='frontend/templates' ,static_folder='frontend/static' )

dbo = Database()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/perform_signup',methods=['POST'])
def perform_signup():
    name = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
   
    response = dbo.insert(name, email, password)
   
    if response: 
        return render_template('login.html',message="Registration Successful. kindly login to proceed")
    else:
        return render_template('signup.html',message="Email already exists")       

@app.route('/perform_login',methods=['POST'])
def perform_login():
    email = request.form.get('email')
    password = request.form.get('password')
    
    response = dbo.search(email, password)

    if response:
        return redirect(url_for('profile'))
    else:    
        return render_template('login.html', message="Incorrect email or password") 

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/add_product')
def add_product():
    return render_template('add_product.html')

@app.route('/perform_add_product', methods=['POST'])
def perform_add_product():
    import json
    p_name = request.form.get('p_name')
    p_price = request.form.get('p_price')
    p_desc = request.form.get('p_desc')

    new_item = {"name": p_name, "price": p_price, "description": p_desc}

    try:
        with open('products.json', 'r') as f:
            all_products = json.load(f)
    except:
        all_products = []

    all_products.append(new_item)

    with open('products.json', 'w') as f:
        json.dump(all_products, f, indent=4)

    return f"<h1>Success!</h1><p>{p_name} add ho gaya hai.</p><a href='/marketplace'>Shop Dekhein</a>"
@app.route('/logout')
def logout():
    return redirect(url_for('index'))

@app.route('/my_orders')
def my_orders():
    return "<h1>My Orders Page</h1><p>Feature coming soon!</p><a href='/profile'>Back to Dashboard</a>"

@app.route('/messages')
def messages():
    return "<h1>Customer Messages Page</h1><p>Feature coming soon!</p><a href='/profile'>Back to Dashboard</a>"
@app.route('/marketplace')
def marketplace():
    import json
    try:
        with open('products.json', 'r') as f:
            all_products = json.load(f)
    except:
        all_products = [] 
    
    return render_template('marketplace.html', products=all_products)
if  __name__ == "__main__": 
    app.run(debug=True)
       