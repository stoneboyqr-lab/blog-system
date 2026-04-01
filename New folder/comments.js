
const BASE_URL = '';
let allComments = [];
let currentFilter = 'all';

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

function showToast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.borderLeftColor = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function renderComments(filter = 'all') {
  const list = document.getElementById('commentsList');
  const filtered = filter === 'all' ? allComments : allComments.filter(c => filter === 'pending' ? !c.approved : c.approved);

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">◎</div><div class="empty-text">No ${filter === 'all' ? '' : filter} comments yet.</div></div>`;
    return;
  }

  list.innerHTML = filtered.map(c => `
    <div class="comment-card ${c.approved ? 'approved' : 'pending'}" id="comment-${c._id}">
      <div>
        <div class="comment-header">
          <div class="comment-avatar">${c.name ? c.name[0].toUpperCase() : '?'}</div>
          <div class="comment-meta">
            <div class="comment-name">${c.name || 'Anonymous'}</div>
            <div class="comment-email">${c.email || ''}</div>
          </div>
          <span class="comment-badge ${c.approved ? 'approved' : 'pending'}">${c.approved ? 'Approved' : 'Pending'}</span>
        </div>
        <div class="comment-post-ref">${c.post?.title || 'Unknown post'}</div>
        <div class="comment-text">${c.message}</div>
        <div class="comment-date">${new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      <div class="comment-actions">
        ${!c.approved ? `<button class="action-btn approve" onclick="approveComment('${c._id}', this)">Approve</button>` : `<button class="action-btn approve" disabled>✓ Live</button>`}
        <button class="action-btn delete" onclick="deleteComment('${c._id}', this)">Delete</button>
      </div>
    </div>
  `).join('');
}

async function loadComments() {
  try {
    const res = await fetch(`${BASE_URL}/api/comments`, { credentials: 'include' });
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
      throw new Error(data.message || 'Failed to load comments');
    }
    allComments = data;
    const pending = allComments.filter(c => !c.approved).length;
    document.getElementById('statTotal').textContent = allComments.length;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statApproved').textContent = allComments.filter(c => c.approved).length;
    document.getElementById('pendingBadge').textContent = pending;
    renderComments(currentFilter);
  } catch (err) {
    console.error(err);
  }
}

async function approveComment(id, btn) {
  btn.disabled = true;
  try {
    const res = await fetch(`${BASE_URL}/api/comments/${id}`, { method: 'PUT', credentials: 'include' });
    if (!res.ok) throw new Error('Approve failed');
    const c = allComments.find(c => c._id === id);
    if (c) c.approved = true;
    renderComments(currentFilter);
    showToast('Comment approved!');
  } catch (err) {
    console.error(err);
    showToast('Approve failed', 'var(--red)');
    btn.disabled = false;
  }
}

async function deleteComment(id, btn) {
  if (!confirm('Delete this comment permanently?')) return;
  btn.disabled = true;
  try {
    const res = await fetch(`${BASE_URL}/api/comments/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Delete failed');
    allComments = allComments.filter(c => c._id !== id);
    renderComments(currentFilter);
    showToast('Comment deleted');
  } catch (err) {
    console.error(err);
    showToast('Delete failed', 'var(--red)');
    btn.disabled = false;
  }
}

window.approveComment = approveComment;
window.deleteComment = deleteComment;

document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderComments(currentFilter);
  });
});



loadComments();
