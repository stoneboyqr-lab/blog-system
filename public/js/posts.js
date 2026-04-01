(function(){
  const cursor=document.getElementById('cursor');
  const ring=document.getElementById('cursorRing');
  document.addEventListener('mousemove',(e)=>{
    if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}
    if(ring){ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';}
  });
})();

const BASE_URL = '';
const logoutBtn = document.getElementById('logoutBtn');

function formatDate(dateString) {
  const d = new Date(dateString);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderPosts(posts) {
  const table = document.querySelector('.posts-table');
  if (!table) return;

  table.innerHTML = `
    <div class="row head"><span>Title</span><span>Status</span><span>Category</span><span>Date</span><span>Action</span></div>
    ${posts.length ? posts.map(post => `
      <div class="row">
        <span>${post.title || 'Untitled'}</span>
        <span><em class="${post.published ? 'published' : 'draft'}">${post.published ? 'Published' : 'Draft'}</em></span>
        <span>${post.category?.name || '—'}</span>
        <span>${formatDate(post.createdAt)}</span>
        <span class="row-actions">
          <a href="create-post.html?id=${post._id}">Edit</a>
          <button onclick="deletePost('${post._id}', this)">Delete</button>
        </span>
      </div>
    `).join('') : `<div class="row"><span>No posts yet</span><span>—</span><span>—</span><span>—</span><span><a href="create-post.html">Create</a></span></div>`}
  `;
}

async function loadPosts() {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/admin/all`, { credentials: 'include' });
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
      throw new Error(data.message || 'Failed to load posts');
    }
    renderPosts(data);
  } catch (err) {
    console.error('Posts load error:', err);
  }
}

async function deletePost(id, btn) {
  if (!confirm('Delete this post?')) return;
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Delete failed');
    btn.closest('.row')?.remove();
  } catch (err) {
    console.error(err);
    alert('Delete failed');
  }
}
window.deletePost = deletePost;

logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
});

loadPosts();
