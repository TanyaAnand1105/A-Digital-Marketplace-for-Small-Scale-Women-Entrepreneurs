/*
 *  Frontend API connector for all authentication pages.
 *  This file handles:
 *    - Signup form   → POST /api/auth/signup
 *    - Login form    → POST /api/auth/login
 *    - Logout button → POST /api/auth/logout  (then clears token)
 *    - Profile page  → GET  /api/auth/me
 *    - Edit profile  → PUT  /api/auth/me
 *    - Change password → PUT /api/auth/change-password
 *
 *  Requires: api.js must be loaded before this file in the HTML.
 */

// ================================================================
//  SIGNUP PAGE  (signup.html)
//  Reads: username, email, password, role from the form
//  Calls: POST /api/auth/signup
// ================================================================
async function handleSignup(event) {
    event.preventDefault();   // stop the default form POST

    const name     = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const roleEl   = document.getElementById('role');
    const role     = roleEl ? roleEl.value : 'buyer';

    // --- simple front-end validation before hitting the server ---
    if (!name || !email || !password) {
        showMessage('msg', 'Please fill in all required fields.', true);
        return;
    }
    if (password.length < 6) {
        showMessage('msg', 'Password must be at least 6 characters.', true);
        return;
    }

    showMessage('msg', 'Creating your account...', false);

    try {
        const result = await apiPost('/api/auth/signup', { name, email, password, role });

        if (result.ok) {
            // Save token and user info for immediate use after signup
            saveToken(result.token);
            saveUser(result.account);
            showMessage('msg', result.msg, false);
            // Redirect to profile after 1 second
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showMessage('msg', result.error || 'Signup failed. Please try again.', true);
        }
    } catch (err) {
        showMessage('msg', 'Could not connect to server. Is the backend running?', true);
        console.error('Signup error:', err);
    }
}

// ================================================================
//  LOGIN PAGE  (login.html)
//  Reads: email, password from the form
//  Calls: POST /api/auth/login
// ================================================================
async function handleLogin(event) {
    event.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('msg', 'Please enter your email and password.', true);
        return;
    }

    showMessage('msg', 'Logging in...', false);

    try {
        const result = await apiPost('/api/auth/login', { email, password });

        if (result.ok) {
            saveToken(result.token);
            saveUser(result.account);
            showMessage('msg', result.msg, false);
            // Redirect based on role
            setTimeout(() => {
                if (result.account.role === 'seller') {
                    window.location.href = 'sell.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 800);
        } else {
            showMessage('msg', result.error || 'Incorrect email or password.', true);
        }
    } catch (err) {
        showMessage('msg', 'Could not connect to server. Is the backend running?', true);
        console.error('Login error:', err);
    }
}

// ================================================================
//  LOGOUT
//  Calls POST /api/auth/logout  (server-side confirmation),
//  then clears local storage and redirects to login page.
// ================================================================
async function handleLogout() {
    try {
        if (isLoggedIn()) {
            await apiPost('/api/auth/logout', {});
        }
    } catch {
        // Even if the server call fails, still log out locally
    } finally {
        clearToken();
        window.location.href = 'login.html';
    }
}

// ================================================================
//  PROFILE PAGE  (profile.html)
//  Calls: GET /api/auth/me  to load and display user details
// ================================================================
async function loadProfile() {
    if (!isLoggedIn()) {
        // User is not logged in — redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        const result = await apiGet('/api/auth/me');

        if (result.ok) {
            const u = result.account;
            // Fill in whatever fields exist on the profile page
            const setEl = (id, val) => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.value = val || '';
                    } else {
                        el.textContent = val || '';
                    }
                }
            };

            setEl('profile-name',  u.name);
            setEl('profile-email', u.email);
            setEl('profile-phone', u.phone || '');
            setEl('profile-role',  u.role);
            setEl('profile-joined', u.joinedAt ? u.joinedAt.split('T')[0] : '');
        } else {
            // Token invalid or expired
            clearToken();
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Could not load profile:', err);
    }
}

// ================================================================
//  EDIT PROFILE  (profile.html — inline edit form)
//  Calls: PUT /api/auth/me  with updated name / phone
// ================================================================
async function handleEditProfile(event) {
    event.preventDefault();

    const name  = document.getElementById('edit-name')?.value.trim();
    const phone = document.getElementById('edit-phone')?.value.trim();

    if (!name) {
        showMessage('profile-msg', 'Name cannot be empty.', true);
        return;
    }

    try {
        const result = await apiPut('/api/auth/me', { name, phone });

        if (result.ok) {
            saveUser(result.account);
            showMessage('profile-msg', 'Profile updated successfully!', false);
            loadProfile();   // refresh displayed values
        } else {
            showMessage('profile-msg', result.error || 'Update failed.', true);
        }
    } catch (err) {
        showMessage('profile-msg', 'Server error. Please try again.', true);
        console.error(err);
    }
}

// ================================================================
//  CHANGE PASSWORD  (profile.html — change password form)
//  Calls: PUT /api/auth/change-password
// ================================================================
async function handleChangePassword(event) {
    event.preventDefault();

    const oldPassword = document.getElementById('old-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmNew  = document.getElementById('confirm-password')?.value;

    if (!oldPassword || !newPassword || !confirmNew) {
        showMessage('pwd-msg', 'Please fill in all three password fields.', true);
        return;
    }

    if (newPassword !== confirmNew) {
        showMessage('pwd-msg', 'New password and confirm password do not match.', true);
        return;
    }

    if (newPassword.length < 6) {
        showMessage('pwd-msg', 'New password must be at least 6 characters.', true);
        return;
    }

    try {
        const result = await apiPut('/api/auth/change-password', { oldPassword, newPassword });

        if (result.ok) {
            showMessage('pwd-msg', result.msg, false);
            // Clear the form fields
            ['old-password', 'new-password', 'confirm-password'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        } else {
            showMessage('pwd-msg', result.error || 'Could not change password.', true);
        }
    } catch (err) {
        showMessage('pwd-msg', 'Server error. Please try again.', true);
        console.error(err);
    }
}

// ================================================================
//  AUTO-RUN on page load
//  Detects which page we are on and wires up the correct handler
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();

    // --- Signup page ---
    if (page === 'signup.html') {
        const form = document.getElementById('signup-form');
        if (form) form.addEventListener('submit', handleSignup);
    }

    // --- Login page ---
    if (page === 'login.html' || page === '') {
        const form = document.getElementById('login-form');
        if (form) form.addEventListener('submit', handleLogin);
    }

    // --- Profile page ---
    if (page === 'profile.html') {
        loadProfile();   // load user data from backend on page open

        const editForm = document.getElementById('edit-profile-form');
        if (editForm) editForm.addEventListener('submit', handleEditProfile);

        const pwdForm = document.getElementById('change-password-form');
        if (pwdForm) pwdForm.addEventListener('submit', handleChangePassword);
    }

    // --- Logout button (can be on any page) ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // --- Nav: show/hide login link based on login state ---
    const loginNav  = document.getElementById('nav-login');
    const logoutNav = document.getElementById('nav-logout');
    if (loginNav)  loginNav.style.display  = isLoggedIn() ? 'none'  : 'inline';
    if (logoutNav) logoutNav.style.display = isLoggedIn() ? 'inline' : 'none';
});
