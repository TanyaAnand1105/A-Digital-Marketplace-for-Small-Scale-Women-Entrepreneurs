const API_BASE = "http://localhost:5000";

// -------- STORAGE HELPERS --------
function storeToken(token) {
    localStorage.setItem("auth_token", token);
}

function retrieveToken() {
    return localStorage.getItem("auth_token");
}

function removeSession() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
}

function storeUser(user) {
    localStorage.setItem("current_user", JSON.stringify(user));
}

function retrieveUser() {
    try {
        return JSON.parse(localStorage.getItem("current_user"));
    } catch {
        return null;
    }
}

function checkLoginStatus() {
    return !!retrieveToken();
}

// -------- GENERIC REQUEST HANDLER --------
async function sendRequest(path, method = "GET", body = null) {
    const token = retrieveToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    return response.json();
}

// -------- API METHODS --------
const API = {
    register: (data) => sendRequest("/api/users/register", "POST", data),
    login: (data) => sendRequest("/api/users/login", "POST", data),
    getProfile: () => sendRequest("/api/users/profile"),
    updateProfile: (data) => sendRequest("/api/users/profile", "PUT", data),
    changePassword: (data) => sendRequest("/api/users/update-password", "PUT", data),
    logout: () => sendRequest("/api/users/logout", "POST")
};

// -------- UI MESSAGE --------
function displayMessage(id, text, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;

    el.textContent = text;
    el.style.color = isError ? "red" : "green";
    el.style.display = "block";
}
