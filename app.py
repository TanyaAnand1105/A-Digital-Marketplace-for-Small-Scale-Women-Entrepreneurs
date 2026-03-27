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
@app.route('/logout')
def logout():
    return redirect(url_for('index'))

@app.route('/add_product')
def add_product():
    return "<h1>Add New Product Page</h1><p>Feature coming soon!</p><a href='/profile'>Back to Dashboard</a>"

@app.route('/my_orders')
def my_orders():
    return "<h1>My Orders Page</h1><p>Feature coming soon!</p><a href='/profile'>Back to Dashboard</a>"

@app.route('/messages')
def messages():
    return "<h1>Customer Messages Page</h1><p>Feature coming soon!</p><a href='/profile'>Back to Dashboard</a>"

if  __name__ == "__main__": 
    app.run(debug=True)
       