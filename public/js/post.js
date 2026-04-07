(function () {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
    if (ring) {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    }
    requestAnimationFrame(animCursor);
  })();

  const bar = document.getElementById('progressBar');
  const pct = document.getElementById('scrollPct');
  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
    if (bar) bar.style.width = scrolled + '%';
    if (pct) pct.textContent = scrolled + '%';
  });

  function stripHtml(text = '') {
    const div = document.createElement('div');
    div.innerHTML = text;
    return (div.textContent || div.innerText || '').trim();
  }

  function readTime(text = '') {
    const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function formatDate(dateValue) {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  function initials(name = 'L') {
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0]?.toUpperCase() || '').join('') || 'L';
  }

  function imageUrl(image) {
    if (!image) return '';
    if (/^https?:\/\//i.test(image) || image.startsWith('/uploads/')) return image;
    return `/uploads/${image}`;
  }

  function generateTOC() {
    const body = document.getElementById('articleBody');
    const toc = document.getElementById('tocList') || document.querySelector('.toc-list') || document.getElementById('toc');
    if (!body || !toc) return;

    const headings = body.querySelectorAll('h2, h3');
    toc.innerHTML = '';

    headings.forEach((h, i) => {
      const id = `heading-${i}`;
      h.id = id;
      toc.innerHTML += `<li><a href="#${id}">${h.textContent}</a></li>`;
    });
  }

  window.copyCode = function (btn) {
    const code = btn.nextElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  };

  const slug = decodeURIComponent(
  window.location.pathname.split("/").pop() || ""
);

  async function loadPost() {
    if (!slug) return;
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
      const post = await res.json();
      if (!res.ok) throw new Error(post.message || 'Failed to load post');

      document.title = `${post.title} — Stone Boy Dev Blog`;
      const categoryName = post.category?.name || post.category || 'General';
      const authorName = post.author?.name || 'Livingstone';
      const hero = document.querySelector('.post-hero');
      const img = imageUrl(post.image);
      if (hero && img && !hero.querySelector('.dynamic-post-image')) {
        hero.insertAdjacentHTML('beforeend', `<div class="dynamic-post-image" style="margin-top:28px;border:1px solid rgba(240,237,232,.08);overflow:hidden;"><img src="${img}" alt="${post.title}" style="width:100%;max-height:420px;object-fit:cover;display:block;"></div>`);
      }

      const breadcrumbEnd = document.querySelector('.post-breadcrumb span:last-child');
      if (breadcrumbEnd) breadcrumbEnd.textContent = categoryName;
      const categoryEl = document.querySelector('.post-category');
      if (categoryEl) categoryEl.textContent = categoryName;
      const titleEl = document.querySelector('.post-title');
      if (titleEl) titleEl.textContent = post.title;
      const authorAvatar = document.querySelector('.author-avatar');
      if (authorAvatar) authorAvatar.textContent = initials(authorName);
      const authorNameEl = document.querySelector('.author-name');
      if (authorNameEl) authorNameEl.textContent = authorName;
      const publishedEl = document.querySelector('.meta-stat-val');
      if (publishedEl) publishedEl.textContent = formatDate(post.createdAt);
      const readTimeEl = document.getElementById('readTime');
      if (readTimeEl) readTimeEl.textContent = `${readTime(post.content)} min`;
      const body = document.getElementById('articleBody');
      if (body) body.innerHTML = post.content;

      const tagsWrap = document.querySelector('.post-tags');
      if (tagsWrap) {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        tagsWrap.innerHTML = tags.length ? tags.map(tag => `<a class="tag" href="/blog/${encodeURIComponent(tag)}">${tag}</a>`).join('') : '';
      }

      generateTOC();
      setupComments(post._id);
      setupRelated(post._id, categoryName, post.slug);
    } catch (err) {
      console.error('Failed to load post:', err);
      const body = document.getElementById('articleBody');
      if (body) body.innerHTML = '<p>Could not load this post right now.</p>';
    }
  }

  async function setupRelated(postId, categoryName, currentSlug) {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);
      const related = posts.filter(p => p.slug !== currentSlug).slice(0, 3);
      const relatedEls = document.querySelectorAll('.related-post');
      relatedEls.forEach((el, idx) => {
        const post = related[idx];
        if (!post) { el.style.display = 'none'; return; }
        el.href = `/post/${encodeURIComponent(post.slug)}`;
        const cat = el.querySelector('.related-cat');
        const title = el.querySelector('.related-title');
        if (cat) cat.textContent = post.category?.name || post.category || categoryName;
        if (title) title.textContent = post.title;
      });

      const idx = posts.findIndex(p => p.slug === currentSlug);
      const prev = idx > 0 ? posts[idx - 1] : null;
      const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;
      const prevEl = document.querySelector('.post-nav-item.prev');
      const nextEl = document.querySelector('.post-nav-item.next');
      if (prevEl && prev) {
        prevEl.href = `/post/${encodeURIComponent(prev.slug)}`;
        const t = prevEl.querySelector('.post-nav-title');
        if (t) t.textContent = prev.title;
      }
      if (nextEl && next) {
        nextEl.href = `/post/${encodeURIComponent(next.slug)}`;
        const t = nextEl.querySelector('.post-nav-title');
        if (t) t.textContent = next.title;
      }
    } catch (err) {
      console.error('Failed to load related posts:', err);
    }
  }

  function setupComments(postId) {
    const section = document.querySelector('.comments-section');
    if (!section) return;
    const form = section.querySelector('.comment-form');
    const list = section.querySelector('.comment-list');
    const inputs = form?.querySelectorAll('.form-input') || [];
    const nameInput = inputs[0];
    const emailInput = inputs[1];
    const messageInput = inputs[2];
    const submitBtn = form?.querySelector('.submit-btn');

    async function loadComments() {
      if (!list) return;
      try {
        const res = await fetch(`/api/comments/approved/${postId}`);
        const comments = await res.json();
        const items = Array.isArray(comments) ? comments : [];
        if (!items.length) {
          list.innerHTML = '<div class="comment-item"><p class="comment-text">No approved comments yet. Be the first to comment.</p></div>';
          return;
        }
        list.innerHTML = items.map(c => `
          <div class="comment-item">
            <div class="comment-header">
              <div class="comment-avatar">${(c.name || 'A').charAt(0).toUpperCase()}</div>
              <div>
                <div class="comment-name">${c.name || 'Anonymous'}</div>
                <div class="comment-date">${new Date(c.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>
              </div>
            </div>
            <p class="comment-text">${c.message || ''}</p>
          </div>
        `).join('');
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }

    if (submitBtn && nameInput && emailInput && messageInput) {
      submitBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        if (!name || !message) return alert('Please enter your name and comment.');
        try {
          const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, post: postId })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to submit comment');
          nameInput.value = ''; emailInput.value = ''; messageInput.value = '';
          alert(data.message || 'Comment submitted. Awaiting approval.');
        } catch (err) {
          console.error('Failed to submit comment:', err);
          alert('Could not submit comment right now.');
        }
      });
    }

    loadComments();
  }

  loadPost();
})();


document.title = `${post.title} | LVST Blog`;

const meta = document.querySelector('meta[name="description"]');
if (meta) {
  meta.setAttribute("content", post.excerpt || post.content.slice(0, 150));
}


const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
canonical.setAttribute("rel", "canonical");
canonical.setAttribute("href", `https://blog.lvstwebdev.com/post/${post.slug}`);
document.head.appendChild(canonical);


function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

setMeta("og:title", post.title);
setMeta("og:description", post.excerpt);
setMeta("og:url", `https://blog.lvstwebdev.com/post/${post.slug}`);
setMeta("og:type", "article");