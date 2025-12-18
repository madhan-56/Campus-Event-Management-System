const API = location.origin + '/api';

// --- Generic helpers for pages that may or may not exist ---
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMsg = document.getElementById('loginMsg');
const regMsg = document.getElementById('regMsg');

// --- Login page role toggle (if present) ---
const btnAdmin = document.getElementById('roleAdmin');
const btnStudent = document.getElementById('roleStudent');
const slider = document.querySelector('.role-toggle .slider');
let activeRole = 'admin';

function setRole(role) {
  activeRole = role;
  if (btnAdmin && btnStudent && slider) {
    btnAdmin.classList.toggle('active', role === 'admin');
    btnStudent.classList.toggle('active', role === 'student');
    slider.style.left = role === 'admin' ? '6px' : 'calc(50% + 6px)';
  }
}
if (btnAdmin) btnAdmin.addEventListener('click', () => setRole('admin'));
if (btnStudent) btnStudent.addEventListener('click', () => setRole('student'));
if (btnAdmin || btnStudent) setRole('admin');

// --- Login handler ---
async function login(e) {
  e?.preventDefault();
  if (loginMsg) loginMsg.textContent = '';

  const username = document.getElementById('username')?.value?.trim();
  const password = document.getElementById('password')?.value;

  if (!username || !password) {
    if (loginMsg) loginMsg.textContent = 'Enter username and password.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      if (loginMsg) loginMsg.textContent = data.message || 'Login failed';
      return;
    }

    // if toggle exists, make sure selected role matches account role
    if ((btnAdmin || btnStudent) && activeRole && data.user && data.user.role !== activeRole) {
      if (loginMsg) loginMsg.textContent = 'Selected role does not match account role';
      return;
    }

    // store token and user for frontend checks
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || null));

    location.href = (data.user?.role === 'admin') ? 'admin.html' : 'dashboard.html';
  } catch (err) {
    console.error(err);
    if (loginMsg) loginMsg.textContent = 'Network error — check server';
  }
}

// --- Register handler ---
async function register(e) {
  e?.preventDefault();
  if (regMsg) regMsg.textContent = '';

  const name = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const username = document.getElementById('regUsername')?.value?.trim();
  const password = document.getElementById('regPassword')?.value;
  const confirm = document.getElementById('regConfirm')?.value;

  if (!name || !email || !username || !password) {
    if (regMsg) regMsg.textContent = 'Please fill all fields';
    return;
  }
  if (password !== confirm) {
    if (regMsg) regMsg.textContent = 'Passwords do not match';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      if (regMsg) regMsg.textContent = data.message || 'Registration failed';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user || null));
    location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    if (regMsg) regMsg.textContent = 'Network error — check server';
  }
}

// attach listeners
if (loginForm) loginForm.addEventListener('submit', login);
if (registerForm) registerForm.addEventListener('submit', register);