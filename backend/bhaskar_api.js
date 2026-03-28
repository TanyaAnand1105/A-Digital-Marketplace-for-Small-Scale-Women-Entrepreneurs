/*
 *  Central API configuration file.
 *  Every other JS file imports the BASE_URL and helper
 *  functions from here so the backend URL is set in one place.
 *
 *  HOW TO USE:
 *    - In development run:  node server.js   (port 3000)
 *    - Every fetch call uses apiPost() or apiGet() from this file
 */

// -------------------------------------------------------
// Change this ONE line to point to your backend server.
// During local development: http://localhost:3000
// After deployment: https://your-deployed-backend.com
// -------------------------------------------------------
const BASE_URL = 'http://localhost:3000';

// -------------------------------------------------------
// Token helpers — JWT is stored in localStorage
// -------------------------------------------------------

function saveToken(token) {
    localStorage.setItem('kk_token', token);
}

function getToken() {
    return localStorage.getItem('kk_token');
}

function clearToken() {
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_user');
}

function saveUser(userObj) {
    localStorage.setItem('kk_user', JSON.stringify(userObj));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('kk_user'));
    } catch {
        return null;
    }
}

function isLoggedIn() {
    return !!getToken();
}

// -------------------------------------------------------
// apiPost(path, body)
// Sends a POST request with JSON body.
// Returns parsed JSON response.
// -------------------------------------------------------
async function apiPost(path, body) {
    const token = getToken();

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${BASE_URL}${path}`, {
        method:  'POST',
        headers,
        body:    JSON.stringify(body)
    });

    return resp.json();
}

// -------------------------------------------------------
// apiGet(path)
// Sends a GET request, automatically attaches token.
// Returns parsed JSON response.
// -------------------------------------------------------
async function apiGet(path) {
    const token = getToken();

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers
    });

    return resp.json();
}

// -------------------------------------------------------
// apiPut(path, body)
// Sends a PUT request with JSON body + token.
// -------------------------------------------------------
async function apiPut(path, body) {
    const token = getToken();

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${BASE_URL}${path}`, {
        method:  'PUT',
        headers,
        body:    JSON.stringify(body)
    });

    return resp.json();
}

// -------------------------------------------------------
// showMessage(elementId, text, isError)
// Displays a message inside a <div id="..."> on the page.
// -------------------------------------------------------
function showMessage(elementId, text, isError = false) {
    const box = document.getElementById(elementId);
    if (!box) return;
    box.textContent  = text;
    box.style.color  = isError ? '#c0392b' : '#27ae60';
    box.style.display = 'block';
}
