const BASE_URL = "";

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

function updateTime() {
  const el = document.getElementById('topbarTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
updateTime();
setInterval(updateTime, 1000);

function showToast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = '✓ ' + msg;
  t.style.borderLeftColor = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
window.openModal = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

function renderPosts(posts) {
  const tbody = document.getElementById('postsTableBody');
  if (!tbody) return;

  if (!posts.length) {
    tbody.innerHTML = `
      <div class="table-row">
        <div class="post-row-title" style="color:var(--smoke-3)">No posts yet. Create your first post.</div>
        <div class="post-row-cat">—</div>
        <div>—</div>
        <div></div>
      </div>`;
    return;
  }

  tbody.innerHTML = posts.slice(0, 6).map(p => `
    <div class="table-row">
      <div class="post-row-title">${p.title || 'Untitled'}</div>
      <div class="post-row-cat">${p.category?.name || '—'}</div>
      <div>
        <span class="post-row-status ${p.published ? 'pub' : 'draft'}">
          <span class="sdot"></span>${p.published ? 'Live' : 'Draft'}
        </span>
      </div>
      <div class="row-actions">
        <a href="create-post.html?id=${p._id}" class="row-btn">Edit</a>
        <button class="row-btn danger" onclick="deletePost('${p._id}', this)">Del</button>
      </div>
    </div>
  `).join('');
}

function renderCategories(categories, posts) {
  const catDash = document.getElementById('catListDash');
  if (!catDash) return;

  catDash.innerHTML = categories.length === 0
    ? '<div class="cat-row"><span class="cat-name" style="color:var(--smoke-3);font-family:var(--font-mono);font-size:.7rem">No categories yet.</span></div>'
    : categories.map(c => `
      <div class="cat-row">
        <span class="cat-name">${c.name}</span>
        <span class="cat-count">${posts.filter(p => String(p.category?._id || p.category) === String(c._id)).length} posts</span>
        <div class="cat-actions">
          <button class="row-btn danger" onclick="deleteCategory('${c._id}', this)">Del</button>
        </div>
      </div>
    `).join('');
}

function renderActivity(stats) {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;

  const items = [];
  (stats.recentPosts || []).forEach(post => {
    items.push(`
      <div class="activity-item">
        <div class="activity-dot red"></div>
        <div>
          <div class="activity-text"><strong>Post updated</strong> — ${post.title}</div>
          <div class="activity-time">${new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    `);
  });

  (stats.recentComments || []).forEach(comment => {
    items.push(`
      <div class="activity-item">
        <div class="activity-dot gold"></div>
        <div>
          <div class="activity-text"><strong>Comment received</strong> — ${comment.name || 'Anonymous'}</div>
          <div class="activity-time">${new Date(comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
    `);
  });

  activityList.innerHTML = items.length ? items.join('') : `
    <div class="activity-item">
      <div class="activity-dot blue"></div>
      <div>
        <div class="activity-text"><strong>No recent activity yet</strong></div>
        <div class="activity-time">Create posts or approve comments</div>
      </div>
    </div>
  `;
}

async function loadDashboard() {
  try {
    const [stats, posts, categories] = await Promise.all([
      fetchJson(`${BASE_URL}/api/dashboard`),
      fetchJson(`${BASE_URL}/api/posts/admin/all`),
      fetchJson(`${BASE_URL}/api/categories`)
    ]);

const postsThisMonthText = document.getElementById('postsThisMonthText');
if (postsThisMonthText) {
  postsThisMonthText.textContent = `↑ ${stats.postsThisMonth ?? 0} this month`;
}


    const pendingCount = (stats.pendingCount ?? 0);

const commentsBadge = document.getElementById('commentsBadge');
if (commentsBadge) commentsBadge.textContent = pendingCount;

const pendingCommentsText = document.getElementById('pendingCommentsText');
if (pendingCommentsText) {
  pendingCommentsText.textContent = `${pendingCount} pending approval`;
}

    document.getElementById('statPosts').textContent = stats.postCount ?? posts.length ?? 0;
    document.getElementById('statComments').textContent = stats.commentCount ?? 0;
    document.getElementById('statCategories').textContent = stats.categoryCount ?? categories.length ?? 0;
    document.getElementById('statPublished').textContent =
      stats.publishedCount ?? posts.filter(p => p.published).length ?? 0;

    renderPosts(posts);
    renderCategories(categories, posts);
    renderActivity(stats);
  } catch (err) {
    console.error('Dashboard load error:', err);
    if (err.status === 401 || err.status === 403) {
      window.location.href = 'login.html';
    }
  }
}

async function deletePost(id, btn) {
  if (!confirm('Delete this post?')) return;
  try {
    await fetchJson(`${BASE_URL}/api/posts/${id}`, { method: 'DELETE' });
    btn.closest('.table-row')?.remove();
    showToast('Post deleted');
    loadDashboard();
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Delete failed', 'var(--red)');
  }
}
window.deletePost = deletePost;

async function deleteCategory(id, btn) {
  if (!confirm('Delete this category?')) return;
  try {
    await fetchJson(`${BASE_URL}/api/categories/${id}`, { method: 'DELETE' });
    btn.closest('.cat-row')?.remove();
    showToast('Category deleted');
    loadDashboard();
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Delete failed', 'var(--red)');
  }
}
window.deleteCategory = deleteCategory;

const saveCatBtn = document.getElementById('saveCatBtn');
if (saveCatBtn) {
  saveCatBtn.addEventListener('click', async () => {
    const input = document.getElementById('newCatName');
    const name = input?.value.trim();
    if (!name) return;
    try {
      await fetchJson(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      closeModal('catModal');
      input.value = '';
      showToast('Category created!');
      loadDashboard();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create category', 'var(--red)');
    }
  });
}



const changePasswordBtn = document.getElementById('changePasswordBtn');

if (changePasswordBtn) {
  changePasswordBtn.addEventListener('click', async () => {
    const currentPassword = document.getElementById('currentPassword')?.value || '';
    const newPassword = document.getElementById('newPassword')?.value || '';
    const confirmNewPassword = document.getElementById('confirmNewPassword')?.value || '';

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('Fill all password fields', 'var(--red)');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'var(--red)');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Password update failed');
      }

      closeModal('passwordModal');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      showToast('Password updated!');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Password update failed', 'var(--red)');
    }
  });
}

loadDashboard();
