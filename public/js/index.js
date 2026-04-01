
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
  window.addEventListener("scroll", () => nav && nav.classList.toggle("scrolled", window.scrollY > 60));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });

  function observeReveals() {
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }
  observeReveals();

  function stripHtml(text = "") {
    const div = document.createElement("div");
    div.innerHTML = text;
    return (div.textContent || div.innerText || "").trim();
  }

  function excerpt(text = "", max = 150) {
    const clean = stripHtml(text);
    return clean.length > max ? clean.slice(0, max).trim() + "..." : clean;
  }

  function readTime(text = "") {
    const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function formatDate(dateValue) {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }

  function imageHtml(post) {
    if (!post.image) return "";
    return `<img src="/uploads/${post.image}" alt="${post.title}" style="width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:12px;">`;
  }

  function heroCard(post) {
    return `
      <a class="hero-featured-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
        ${post.image ? `<img src="/uploads/${post.image}" alt="${post.title}" style="width:100%;height:220px;object-fit:cover;border-radius:16px;margin-bottom:14px;">` : ""}
        <div class="card-tag"><span class="tag-dot"></span> ${post.category?.name || "General"}</div>
        <div class="card-title">${post.title}</div>
        <p class="card-excerpt">${post.excerpt || excerpt(post.content, 170)}</p>
        <div class="card-meta">
          <span>${post.author?.name || "Livingstone"} · ${formatDate(post.createdAt)}</span>
          <span class="read-arrow">${readTime(post.content)} min read →</span>
        </div>
      </a>
    `;
  }

  function postCard(post, i) {
    const variants = ["large", "medium", "small", "wide", "small", "medium"];
    const variant = variants[i] || "medium";
    return `
      <a class="post-card ${variant} reveal" href="post.html?slug=${encodeURIComponent(post.slug)}" style="${i ? `transition-delay:${0.05 * i}s` : ""}">
        ${imageHtml(post)}
        <div class="post-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="post-cat">${post.category?.name || "General"}</div>
        <div class="post-title">${post.title}</div>
        <p class="post-excerpt">${post.excerpt || excerpt(post.content, 150)}</p>
        <div class="post-footer">
          <span>${readTime(post.content)} min read · ${formatDate(post.createdAt)}</span>
          <span class="arrow">→</span>
        </div>
      </a>
    `;
  }

  async function loadHomepagePosts() {
    try {
      const res = await fetch("/api/posts");
      const posts = await res.json();
      const list = Array.isArray(posts) ? posts : (posts.posts || []);

      const hero = document.getElementById("heroFeatured");
      const grid = document.getElementById("homePosts");
      const count = document.getElementById("latestPostsCount");

      if (count) count.textContent = String(Math.min(list.length, 6)).padStart(2, "0");

      if (hero) {
        hero.innerHTML = list.length ? heroCard(list[0]) : "";
      }

      if (grid) {
        const latest = list.slice(0, 6);
        grid.innerHTML = latest.length
          ? latest.map((post, i) => postCard(post, i)).join("")
          : `<div class="post-card medium reveal"><div class="post-title">No published posts yet</div><p class="post-excerpt">Create and publish a post from your admin panel.</p></div>`;
      }

      observeReveals();
    } catch (err) {
      console.error("Homepage posts error:", err);
    }
  }

  loadHomepagePosts();
})();
