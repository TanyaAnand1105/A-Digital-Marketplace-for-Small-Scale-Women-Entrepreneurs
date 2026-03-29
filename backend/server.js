const express = require("express");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";


// ---------- HELPER FUNCTIONS ----------
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync("users.json"));
  } catch {
    return {};
  }
}

function writeUsers(data) {
  fs.writeFileSync("users.json", JSON.stringify(data, null, 2));
}

// ---------- SIGNUP ----------
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  let users = readUsers();

  if (users[email]) {
    return res.json({ ok: false, error: "Email already exists" });
  }

  users[email] = {
    name,
    email,
    password,
    role,
    phone: "",
    joinedAt: new Date().toISOString()
  };

  writeUsers(users);

  const token = jwt.sign({ email }, SECRET);

  res.json({
    ok: true,
    token,
    account: users[email],
    msg: "Signup successful"
  });
});

// ---------- LOGIN ----------
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  let users = readUsers();

  if (!users[email] || users[email].password !== password) {
    return res.json({ ok: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ email }, SECRET);

  res.json({
    ok: true,
    token,
    account: users[email],
    msg: "Login successful"
  });
});

// ---------- AUTH MIDDLEWARE ----------
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ ok: false });

  try {
    const data = jwt.verify(token, SECRET);
    req.user = data;
    next();
  } catch {
    res.json({ ok: false });
  }
}

// ---------- GET PROFILE ----------
app.get("/api/auth/me", auth, (req, res) => {
  let users = readUsers();
  const user = users[req.user.email];

  res.json({ ok: true, account: user });
});

// ---------- UPDATE PROFILE ----------
app.put("/api/auth/me", auth, (req, res) => {
  let users = readUsers();
  let user = users[req.user.email];

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  users[req.user.email] = user;
  writeUsers(users);

  res.json({ ok: true, account: user });
});

// ---------- CHANGE PASSWORD ----------
app.put("/api/auth/change-password", auth, (req, res) => {
  let users = readUsers();
  let user = users[req.user.email];

  if (user.password !== req.body.oldPassword) {
    return res.json({ ok: false, error: "Wrong old password" });
  }

  user.password = req.body.newPassword;
  writeUsers(users);

  res.json({ ok: true, msg: "Password updated" });
});

// ---------- LOGOUT ----------
app.post("/api/auth/logout", (req, res) => {
  res.json({ ok: true });
});

// ---------- START ----------
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
