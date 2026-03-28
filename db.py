import json
import os

class Database:

    def __init__(self):
        self.users_file = 'users.json'
        self.products_file = 'products.json'
        self.cart_file = 'cart.json'
        self._init_files()
    
    def _init_files(self):
        """Initialize JSON files if they don't exist"""
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump({}, f, indent=4)
        
        if not os.path.exists(self.products_file):
            with open(self.products_file, 'w') as f:
                json.dump([], f, indent=4)
        
        if not os.path.exists(self.cart_file):
            with open(self.cart_file, 'w') as f:
                json.dump({}, f, indent=4)

    def insert(self, name, email, password):
        """Register a new user"""
        try:
            with open(self.users_file, 'r') as rf:
                users = json.load(rf)

            if email in users:
                return 0
            else:
                users[email] = {"name": name, "password": password}

                with open(self.users_file, 'w') as wf:
                    json.dump(users, wf, indent=4)  
                return 1
        except:
            return 0

    def search(self, email, password):
        """Authenticate user login"""
        try:
            with open(self.users_file, 'r') as rf:
                users = json.load(rf)

            if email in users:
                # Handle both old and new format
                user_data = users[email]
                if isinstance(user_data, list):
                    stored_password = user_data[1]
                else:
                    stored_password = user_data.get('password')
                
                if stored_password == password:
                    return 1
                else:
                    return 0
            else:
                return 0
        except:
            return 0

    def add_product(self, name, price, desc):
        """Add a new product to the marketplace"""
        try:
            with open(self.products_file, 'r') as rf:
                products = json.load(rf)
        except (FileNotFoundError, json.JSONDecodeError):
            products = [] 

        new_product = {
            "name": name,
            "price": price,
            "description": desc
        }
        products.append(new_product)

        try:
            with open(self.products_file, 'w') as wf:
                json.dump(products, wf, indent=4)
            return 1
        except:
            return 0

    def get_all_products(self):
        """Get all products from marketplace"""
        try:
            with open(self.products_file, 'r') as rf:
                products = json.load(rf)
            return products if isinstance(products, list) else []
        except:
            return []

    def add_to_cart(self, email, product_name):
        """Add product to user's cart"""
        try:
            with open(self.cart_file, 'r') as rf:
                carts = json.load(rf)
            
            if email not in carts:
                carts[email] = []
            
            # Check if product already in cart
            for item in carts[email]:
                if item['name'] == product_name:
                    item['quantity'] += 1
                    with open(self.cart_file, 'w') as wf:
                        json.dump(carts, wf, indent=4)
                    return 1
            
            # Get product details
            product = self._get_product_by_name(product_name)
            if product:
                product['quantity'] = 1
                carts[email].append(product)
                with open(self.cart_file, 'w') as wf:
                    json.dump(carts, wf, indent=4)
                return 1
            return 0
        except:
            return 0

    def _get_product_by_name(self, product_name):
        """Find product by name"""
        try:
            with open(self.products_file, 'r') as rf:
                products = json.load(rf)
            
            for product in products:
                if product.get('name') == product_name:
                    return product
            return None
        except:
            return None

    def get_cart(self, email):
        """Get user's cart items"""
        try:
            with open(self.cart_file, 'r') as rf:
                carts = json.load(rf)
            
            return carts.get(email, [])
        except:
            return []

    def clear_cart(self, email):
        """Clear user's cart after checkout"""
        try:
            with open(self.cart_file, 'r') as rf:
                carts = json.load(rf)
            
            if email in carts:
                carts[email] = []
                with open(self.cart_file, 'w') as wf:
                    json.dump(carts, wf, indent=4)
                return 1
            return 0
        except:
            return 0            