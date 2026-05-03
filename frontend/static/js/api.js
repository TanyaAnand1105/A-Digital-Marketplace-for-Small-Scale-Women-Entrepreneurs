const BASE_URL = "https://musical-guide-p79qpjx57gw39ppx-5000.app.github.dev";

// ================= TOKEN =================
function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function clearToken() {
  localStorage.removeItem("token");
}

function isLoggedIn() {
  return !!getToken();
}

// ================= USER =================
function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// ================= API =================
async function apiPost(endpoint, data) {
  const res = await fetch(BASE_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

async function apiGet(endpoint) {
  const res = await fetch(BASE_URL + endpoint, {
    headers: {
      "Authorization": "Bearer " + getToken()
    }
  });

  return res.json();
}

async function apiPut(endpoint, data) {
  const res = await fetch(BASE_URL + endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

// ================= UI =================
function showMessage(id, msg, isError) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display = "block";
  el.innerHTML =
    `<div class="alert ${isError ? "alert-danger" : "alert-success"}">${msg}</div>`;
}
