const express = require("express");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET_KEY = "super_secure_key";

// -------- USER DATA --------
function loadUserData() {
  try {
    return JSON.parse(fs.readFileSync("users.json"));
  } catch {
    return {};
  }
}


function saveUserData(data) {
  fs.writeFileSync("users.json", JSON.stringify(data, null, 2));
}

// -------- AUTH MIDDLEWARE --------
function verifyUserToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.currentUser = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}

// -------- REGISTER --------
app.post("/api/users/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const db = loadUserData();

  if (db[email]) {
    return res.json({ success: false, message: "User already exists" });
  }

  db[email] = {
    name,
    email,
    password,
    role,
    phone: "",
    createdAt: new Date().toISOString()
  };

  saveUserData(db);

  const token = jwt.sign({ email }, JWT_SECRET_KEY);

  res.json({ success: true, token, user: db[email] });
});

// -------- LOGIN --------
app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;

  const db = loadUserData();
  const user = db[email];

  if (!user || user.password !== password) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ email }, JWT_SECRET_KEY);

  res.json({ success: true, token, user });
});

// -------- PROFILE --------
app.get("/api/users/profile", verifyUserToken, (req, res) => {
  const db = loadUserData();
  const user = db[req.currentUser.email];

  res.json({ success: true, user });
});

// -------- UPDATE PROFILE --------
app.put("/api/users/profile", verifyUserToken, (req, res) => {
  const db = loadUserData();
  const user = db[req.currentUser.email];

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;

  db[req.currentUser.email] = user;
  saveUserData(db);

  res.json({ success: true, user });
});

// -------- CHANGE PASSWORD --------
app.put("/api/users/update-password", verifyUserToken, (req, res) => {
  const db = loadUserData();
  const user = db[req.currentUser.email];

  if (user.password !== req.body.oldPassword) {
    return res.json({ success: false, message: "Wrong old password" });
  }

  user.password = req.body.newPassword;
  saveUserData(db);

  res.json({ success: true, message: "Password updated" });
});

// -------- LOGOUT --------
app.post("/api/users/logout", (req, res) => {
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
