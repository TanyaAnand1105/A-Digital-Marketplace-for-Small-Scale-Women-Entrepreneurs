const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */

app.use("/static", express.static(path.join(__dirname, "../frontend/static")));

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/templates/index.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/templates/signup.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/templates/login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/templates/dashboard.html"));
});

app.get("/seller_dashboard", (req, res) => {

    res.sendFile(path.join(__dirname,"../frontend/templates/seller_dashboard.html" ));
});

/* ================= LOGIN ================= */


app.post("/login", async (req, res) => {

    const { email, password } = req.body;
/* EMPTY CHECK */

    if (!email || !password) {

       return res.redirect("/login?error=empty");
    }

    const usersPath =
    path.join(__dirname, "../database/users.json");

    if (!fs.existsSync(usersPath)) {

        return res.send("No users found");

    }

    const data =
    fs.readFileSync(usersPath);

     const users =
    JSON.parse(
        fs.readFileSync(usersPath)
    );

    const user = users.find(
        u => u.email === email
    );

    if (!user) {

        return res.redirect("/login?error=email");
    }

    const isMatch =
    await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {

        return res.redirect("/login?error=password");

    }

   if(user.role === "seller"){

    res.redirect("/seller_dashboard");
}
else{
    res.redirect("/shop");
}
});
/* ================= SIGNUP ================= */

app.post("/signup", async (req, res) => {

   const {
 name,
 email,
 password,
 confirmPassword,
 role
} = req.body;

    /* EMPTY CHECK */

    if (!name || !email || !password || !role) {

        return res.send(`
    <h2 style="
    font-family:Poppins;
    text-align:center;
    margin-top:50px;
    color:red;
    ">
    Please fill all fields 😭
    </h2>

    <div style="text-align:center;">
    <a href="/login">
    Go Back
    </a>
    </div>
    `);

}

    const usersPath =
    path.join(__dirname, "../database/users.json");

    let users = [];

    /* READ OLD USERS */

    if (fs.existsSync(usersPath)) {

        users =
        JSON.parse(
            fs.readFileSync(usersPath)
        );

    }

    /* CHECK EXISTING EMAIL */

    const existingUser =
    users.find(
        u => u.email === email
    );

    if (existingUser) {

        return res.send(`
<h2 style="
font-family:Poppins;
text-align:center;
margin-top:50px;
color:red;
">
Email already exists 😭
</h2>

<div style="text-align:center;">
<a href="/signup">
Go Back
</a>
</div>
`);
    }

    console.log(password);
console.log(confirmPassword);

if (
    password.trim() !==
    confirmPassword.trim()
) {

    return res.send(`
    
    <h2 style="
    text-align:center;
    margin-top:50px;
    color:red;
    font-family:Poppins;
    ">
    
    Passwords do not match 😭
    
    </h2>

    <div style="text-align:center;">
    
    <a href="/signup">
    Go Back
    </a>

    </div>
    
    `);

}


    /* PASSWORD MATCH */

if (password !== confirmPassword) {

    return res.send(`
    
    <h2 style="
    font-family:Poppins;
    text-align:center;
    margin-top:50px;
    color:red;
    ">
    
    Passwords do not match 😭
    
    </h2>

    <div style="text-align:center;">
    
    <a href="/signup">
    Go Back
    </a>

    </div>

    `);

}
    /* PASSWORD LENGTH */

    if (password.length < 6) {

        return res.send(
            "Password must be at least 6 characters"
        );
    }
    /* HASH PASSWORD */

    const hashedPassword =
    await bcrypt.hash(password, 10);

    const newUser = {

    name,
    email,
    password: hashedPassword,
    role
};

    users.push(newUser);

    fs.writeFileSync(

        usersPath,

        JSON.stringify(users, null, 2)

    );

    /* SUCCESS */

   if(role === "seller"){

    res.redirect("/seller_dashboard");

}
else{

    res.redirect("/shop");

}

});

/* ================= DASHBOARD ================= */
app.get("/dashboard", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/templates/dashboard.html"
        )
    );

});
    
    /* ================= SHOP ================= */
    
    app.get("/shop", (req, res) => {
        res.sendFile(
            path.join(__dirname,
                "../frontend/templates/shop.html")
            );
        });
        
        /* ================= SELL ================= */
        
        app.get("/sell", (req, res) => {
            res.sendFile(
                path.join(__dirname,
                    "../frontend/templates/sell.html")
                );
            });
            
            /* ================= ACCOUNT ================= */
            
            app.get("/account", (req, res) => {
                res.sendFile(
                    path.join(__dirname,
                        "../frontend/templates/account.html")
                    );
});

app.get("/vase_product", (req, res) => {
    
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/templates/vase_product.html"
        )
    );
    
});

app.get("/art_piece", (req, res) => {
    
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/templates/art_piece.html"
        )
    );
    
});

app.get("/Craft_item", (req, res) => {
    
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/templates/Craft_item.html"
        )
    );
    
});
app.get("/wood_decor", (req, res) => {
    
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/templates/wood_decor.html"
        )
    );
    
});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})