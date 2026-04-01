
const BASE_URL = '';
const postId = new URLSearchParams(window.location.search).get('id');
let tags = [];
let imageFile = null;

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

// QUILL
const quill = new Quill('#quillEditor', {
  theme: 'snow',
  placeholder: 'Write your post here...',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  }
});

// WORD COUNT
quill.on('text-change', () => {
  const text = quill.getText().trim();
  const words = text ? text.split(/\s+/).length : 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  document.getElementById('wordCount').textContent = `${words} words · ${mins} min read`;
  autoSlug();
});

// AUTO SLUG
document.getElementById('postTitle').addEventListener('input', autoSlug);
function autoSlug() {
  const title = document.getElementById('postTitle').value;
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  document.getElementById('postSlug').value = slug;
}

function showToast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.borderLeftColor = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// IMAGE PREVIEW
document.getElementById('imageInput').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)', 'var(--red)'); return; }
  imageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('imagePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('imageDropContent').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// TAGS
document.getElementById('addTagBtn').addEventListener('click', addTag);
document.getElementById('tagInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });

function addTag() {
  const val = document.getElementById('tagInput').value.trim();
  if (!val || tags.includes(val)) return;
  tags.push(val);
  document.getElementById('tagInput').value = '';
  renderTags();
}
function removeTag(tag) { tags = tags.filter(t => t !== tag); renderTags(); }
function renderTags() {
  document.getElementById('tagsDisplay').innerHTML = tags.map(t =>
    `<div class="tag-chip">${t}<button onclick="removeTag('${t}')">✕</button></div>`
  ).join('');
}
window.removeTag = removeTag;

// LOAD CATEGORIES
async function loadCategories() {
  try {
    const res = await fetch(`${BASE_URL}/api/categories`, { credentials: 'include' });
    const cats = await res.json();
    const sel = document.getElementById('postCategory');
    sel.innerHTML = '<option value="">Select category...</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('Categories unavailable', err);
  }
}

// LOAD POST FOR EDITING
async function loadPost() {
  if (!postId) return;
  document.getElementById('pageTitle').textContent = 'Edit Post';
  try {
    const res = await fetch(`${BASE_URL}/api/posts/admin/id/${postId}`, { credentials: 'include' });
    const post = await res.json();
    if (!res.ok) throw new Error(post.message || 'Post load failed');

    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postSlug').value = post.slug || '';
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('isPublished').checked = !!post.published;
    if (post.category) document.getElementById('postCategory').value = post.category._id || post.category;
    tags = Array.isArray(post.tags) ? post.tags : [];
    renderTags();
    if (post.content) quill.root.innerHTML = post.content;
    if (post.image) {
      const preview = document.getElementById('imagePreview');
      preview.src = post.image.startsWith('http') ? post.image : `/uploads/${post.image}`;
      preview.style.display = 'block';
      document.getElementById('imageDropContent').style.display = 'none';
    }
    updateStatus(post.published);
  } catch (err) {
    console.error('Post load failed', err);
  }
}

function updateStatus(published) {
  const el = document.getElementById('postStatus');
  el.textContent = published ? '● Live' : '● Draft';
  el.style.color = published ? 'var(--green)' : 'var(--smoke-3)';
}
document.getElementById('isPublished').addEventListener('change', function() { updateStatus(this.checked); });

// SUBMIT
async function submitPost(forcePublished) {
  const title = document.getElementById('postTitle').value.trim();
  const content = quill.root.innerHTML;
  const category = document.getElementById('postCategory').value;
  const slug = document.getElementById('postSlug').value.trim();
  const excerpt = document.getElementById('postExcerpt').value.trim();
  const isPublished = document.getElementById('isPublished').checked;
  const msgEl = document.getElementById('formMsg');
  msgEl.style.display = 'none';

  if (!title) { msgEl.textContent = 'Title is required.'; msgEl.style.display = 'block'; return; }
  if (!category) { msgEl.textContent = 'Please select a category.'; msgEl.style.display = 'block'; return; }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('category', category);
  formData.append('slug', slug);
  formData.append('excerpt', excerpt);
  formData.append('published', String(forcePublished !== undefined ? forcePublished : isPublished));
  formData.append('tags', JSON.stringify(tags));
  if (imageFile) formData.append('image', imageFile);

  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const url = postId ? `${BASE_URL}/api/posts/${postId}` : `${BASE_URL}/api/posts`;
    const method = postId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, credentials: 'include', body: formData });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      showToast(postId ? 'Post updated!' : 'Post created!');
      const savedPost = data.post || data;
      if (!postId && savedPost?._id) {
        setTimeout(() => { window.location.href = `create-post.html?id=${savedPost._id}`; }, 1000);
      }
      updateStatus(savedPost?.published ?? forcePublished ?? isPublished);
    } else {
      msgEl.textContent = data.message || 'Something went wrong.';
      msgEl.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = 'Network error. Try again.';
    msgEl.style.display = 'block';
  } finally {
    btn.textContent = 'Save Post →';
    btn.disabled = false;
  }
}

document.getElementById('submitBtn').addEventListener('click', () => submitPost());
document.getElementById('saveDraftBtn').addEventListener('click', () => {
  document.getElementById('isPublished').checked = false;
  updateStatus(false);
  submitPost(false);
});
document.getElementById('publishBtn').addEventListener('click', () => {
  document.getElementById('isPublished').checked = true;
  updateStatus(true);
  submitPost(true);
});
document.getElementById('previewBtn').addEventListener('click', () => {
  const slug = document.getElementById('postSlug').value;
  if (slug) window.open(`../post.html?slug=${slug}`, '_blank');
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await fetch(`/api/auth/logout`, { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    submitPost();
  }
});

loadCategories().then(loadPost);
