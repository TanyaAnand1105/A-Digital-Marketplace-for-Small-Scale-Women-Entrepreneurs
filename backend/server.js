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
/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const usersPath =
    path.join(__dirname, "../database/users.json");

    if (!fs.existsSync(usersPath)) {
        return res.send("No users found");
    }

    const data =
    fs.readFileSync(usersPath);

    const users = JSON.parse(data);

    const user = users.find(
        u => u.email === email
    );

    if (!user) {
        return res.send("User not found");
    }

    const isMatch =
    await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        return res.send("Wrong password");
    }

    res.redirect("/dashboard");

});

app.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;

    const hashedPassword =
    await bcrypt.hash(password, 10);

    const newUser = {
        name,
        email,
        password: hashedPassword
    };

    const usersPath =
    path.join(__dirname, "../database/users.json");

    let users = [];

    if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    }

    users.push(newUser);

    fs.writeFileSync(
        usersPath,
        JSON.stringify(users, null, 2)
    );

    res.redirect("/login");
});

/* ================= SERVER ================= */

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
