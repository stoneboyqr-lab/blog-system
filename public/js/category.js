
(function () {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    if (cursor) { cursor.style.left = mx + "px"; cursor.style.top = my + "px"; }
    if (ring) {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
    }
    requestAnimationFrame(animCursor);
  })();

  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => nav && nav.classList.toggle("scrolled", window.scrollY > 20));

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get("cat") || "javascript";

  function slugify(text = "") {
    return String(text).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  function formatLabel(text = "") {
    const clean = String(text).replace(/[-_]/g, " ").trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  function stripHtml(text = "") {
    const div = document.createElement("div");
    div.innerHTML = text;
    return (div.textContent || div.innerText || "").trim();
  }

  function excerpt(text = "", max = 120) {
    const clean = stripHtml(text);
    return clean.length > max ? clean.slice(0, max).trim() + "..." : clean;
  }

  const titleEl = document.getElementById("categoryName");
  if (titleEl) titleEl.textContent = formatLabel(catParam);

  const grid = document.getElementById("categoryPosts");

  async function loadCategoryPosts() {
    if (!grid) return;
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);
      const filtered = posts.filter((p) => slugify(p.category?.name || p.category || "") === slugify(catParam));

      if (!filtered.length) {
        grid.innerHTML = `
          <article class="post-card">
            <span class="post-tag">${formatLabel(catParam)}</span>
            <h2>No posts yet</h2>
            <p>There are no published posts in this category right now.</p>
            <a href="blog.html">Back to archive →</a>
          </article>
        `;
        return;
      }

      grid.innerHTML = filtered.map((post) => `
        <article class="post-card">
          ${post.image ? `<img src="/uploads/${post.image}" alt="${post.title}" style="width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:12px;">` : ""}
          <span class="post-tag">${post.category?.name || formatLabel(catParam)}</span>
          <h2>${post.title}</h2>
          <p>${post.excerpt || excerpt(post.content, 150)}</p>
          <a href="post.html?slug=${encodeURIComponent(post.slug)}">Read article →</a>
        </article>
      `).join("");
    } catch (err) {
      console.error("Failed to load category posts:", err);
      grid.innerHTML = `
        <article class="post-card">
          <span class="post-tag">${formatLabel(catParam)}</span>
          <h2>Could not load posts</h2>
          <p>Please check your backend connection and try again.</p>
          <a href="blog.html">Back to archive →</a>
        </article>
      `;
    }
  }

  loadCategoryPosts();
})();
