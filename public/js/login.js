
const BASE_URL = '';

// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(animCursor);
})();

// TOGGLE PASSWORD
const togglePwd = document.getElementById('togglePwd');
if (togglePwd) {
  togglePwd.addEventListener('click', () => {
    const pwd = document.getElementById('password');
    if (pwd) pwd.type = pwd.type === 'password' ? 'text' : 'password';
  });
}

// SUBMIT
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const errorEl = document.getElementById('formError');

    errorEl?.classList.remove('show');
    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please fill in all fields.';
        errorEl.classList.add('show');
      }
      return;
    }

    loginBtn.classList.add('loading');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.location.href = 'dashboard.html';
      } else {
        if (errorEl) {
          errorEl.textContent = data.message || 'Invalid credentials.';
          errorEl.classList.add('show');
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Network error. Check your connection.';
        errorEl.classList.add('show');
      }
    } finally {
      loginBtn.classList.remove('loading');
    }
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginBtn')?.click();
});
