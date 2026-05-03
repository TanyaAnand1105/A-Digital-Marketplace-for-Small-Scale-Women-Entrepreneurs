// -------- SIGNUP --------
async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role")?.value || "buyer";

    if (!name || !email || !password) {
        displayMessage("msg", "All fields are required", true);
        return;
    }

    if (password.length < 6) {
        displayMessage("msg", "Password must be at least 6 characters", true);
        return;
    }

    const result = await API.register({ name, email, password, role });

    if (result.success) {
        storeToken(result.token);
        storeUser(result.user);
        displayMessage("msg", "Account created!");

        setTimeout(() => window.location.href = "profile.html", 1000);
    } else {
        displayMessage("msg", result.message, true);
    }
}

// -------- LOGIN --------
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        displayMessage("msg", "Enter email and password", true);
        return;
    }

    const result = await API.login({ email, password });

    if (result.success) {
        storeToken(result.token);
        storeUser(result.user);

        setTimeout(() => {
            window.location.href =
                result.user.role === "seller" ? "sell.html" : "index.html";
        }, 800);
    } else {
        displayMessage("msg", result.message, true);
    }
}

// -------- LOGOUT --------
async function logoutUser() {
    await API.logout();
    removeSession();
    window.location.href = "login.html";
}

// -------- LOAD PROFILE --------
async function fetchProfile() {
    if (!checkLoginStatus()) {
        window.location.href = "login.html";
        return;
    }

    const result = await API.getProfile();

    if (!result.success) {
        removeSession();
        window.location.href = "login.html";
        return;
    }

    const user = result.user;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (el.tagName === "INPUT") el.value = val || "";
        else el.textContent = val || "";
    };

    set("profile-name", user.name);
    set("profile-email", user.email);
    set("profile-phone", user.phone);
    set("profile-role", user.role);
    set("profile-joined", user.createdAt?.split("T")[0]);
}

// -------- UPDATE PROFILE --------
async function updateProfile(event) {
    event.preventDefault();

    const name = document.getElementById("edit-name").value.trim();
    const phone = document.getElementById("edit-phone").value.trim();

    const result = await API.updateProfile({ name, phone });

    if (result.success) {
        storeUser(result.user);
        displayMessage("profile-msg", "Updated successfully");
        fetchProfile();
    } else {
        displayMessage("profile-msg", result.message, true);
    }
}

// -------- CHANGE PASSWORD --------
async function updatePassword(event) {
    event.preventDefault();

    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (newPassword !== confirm) {
        displayMessage("pwd-msg", "Passwords do not match", true);
        return;
    }

    const result = await API.changePassword({ oldPassword, newPassword });

    if (result.success) {
        displayMessage("pwd-msg", "Password updated");
    } else {
        displayMessage("pwd-msg", result.message, true);
    }
}

// -------- AUTO INIT --------
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop();

    if (page === "signup.html") {
        document.getElementById("signup-form")?.addEventListener("submit", registerUser);
    }

    if (page === "login.html" || page === "") {
        document.getElementById("login-form")?.addEventListener("submit", loginUser);
    }

    if (page === "profile.html") {
        fetchProfile();
        document.getElementById("edit-profile-form")?.addEventListener("submit", updateProfile);
        document.getElementById("change-password-form")?.addEventListener("submit", updatePassword);
    }

    document.getElementById("logout-btn")?.addEventListener("click", logoutUser);
});
