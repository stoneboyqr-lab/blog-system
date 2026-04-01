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

const BASE_URL = '';
const CATEGORY_API = `${BASE_URL}/api/categories`;

const form = document.getElementById('categoryForm');
const categoryId = document.getElementById('categoryId');
const categoryName = document.getElementById('categoryName');
const categorySlug = document.getElementById('categorySlug');
const categoryDescription = document.getElementById('categoryDescription');
const categoryColor = document.getElementById('categoryColor');
const tableBody = document.getElementById('categoriesTableBody');
const countEl = document.getElementById('categoryCount');
const topEl = document.getElementById('mostUsedCategory');
const refreshBtn = document.getElementById('refreshCategoriesBtn');
const resetBtn = document.getElementById('resetCategoryBtn');
const saveBtn = document.getElementById('saveCategoryBtn');
const logoutBtn = document.getElementById('logoutBtn');

let categories = [];

function slugify(text) {
  return String(text || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function resetForm() {
  categoryId.value = '';
  form.reset();
  categoryColor.value = '#e63b2e';
  categorySlug.dataset.touched = '';
  saveBtn.textContent = 'Save Category';
}

function renderStats() {
  countEl.textContent = categories.length;
  topEl.textContent = categories.length ? (categories[0].name || '—') : '—';
}

function renderCategories() {
  if (!categories.length) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No categories found yet.</td></tr>`;
    renderStats();
    return;
  }

  tableBody.innerHTML = categories.map(cat => {
    const id = cat._id || cat.id;
    const safeName = cat.name || '';
    const safeSlug = cat.slug || '';
    const safeDescription = cat.description || '—';
    const color = cat.color || '#e63b2e';
    return `
      <tr>
        <td>${safeName}</td>
        <td class="muted">${safeSlug}</td>
        <td class="muted">${safeDescription}</td>
        <td>
          <span class="category-chip">
            <span class="chip-dot" style="background:${color}"></span>
            ${safeName}
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="action-btn" data-edit="${id}">Edit</button>
            <button class="action-btn delete" data-delete="${id}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  renderStats();
}

async function fetchCategories() {
  try {
    const res = await fetch(CATEGORY_API, { credentials: 'include' });
    const data = await res.json().catch(() => ([]));
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) window.location.href = 'login.html';
      throw new Error(data.message || 'Failed to fetch categories');
    }
    categories = Array.isArray(data) ? data : (data.categories || []);
    renderCategories();
  } catch (err) {
    console.error('Error loading categories:', err);
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Failed to load categories.</td></tr>`;
  }
}

function populateForm(cat) {
  categoryId.value = cat._id || cat.id || '';
  categoryName.value = cat.name || '';
  categorySlug.value = cat.slug || '';
  categorySlug.dataset.touched = 'true';
  categoryDescription.value = cat.description || '';
  categoryColor.value = cat.color || '#e63b2e';
  saveBtn.textContent = 'Update Category';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteCategory(id) {
  const confirmed = window.confirm('Delete this category?');
  if (!confirmed) return;
  try {
    const res = await fetch(`${CATEGORY_API}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Delete failed');
    categories = categories.filter(c => (c._id || c.id) != id);
    renderCategories();
  } catch (err) {
    console.error(err);
    alert('Could not delete category.');
  }
}

tableBody?.addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit');
  const deleteId = e.target.getAttribute('data-delete');
  if (editId) {
    const cat = categories.find(c => String(c._id || c.id) === String(editId));
    if (cat) populateForm(cat);
  }
  if (deleteId) deleteCategory(deleteId);
});

categoryName?.addEventListener('input', () => {
  if (!categorySlug.dataset.touched) categorySlug.value = slugify(categoryName.value);
});
categorySlug?.addEventListener('input', () => {
  categorySlug.dataset.touched = categorySlug.value ? 'true' : '';
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: categoryName.value.trim(),
    slug: categorySlug.value.trim() || slugify(categoryName.value),
    description: categoryDescription.value.trim(),
    color: categoryColor.value
  };
  const id = categoryId.value.trim();
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${CATEGORY_API}/${id}` : CATEGORY_API;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');
    await fetchCategories();
    resetForm();
  } catch (err) {
    console.error(err);
    alert('Could not save category.');
  }
});

refreshBtn?.addEventListener('click', fetchCategories);
resetBtn?.addEventListener('click', resetForm);
logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
});

fetchCategories();
