(function () {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

  (function animCursor() {
    if (cursor) { cursor.style.left = mx + "px"; cursor.style.top = my + "px"; }
    if (ring) {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
    }
    requestAnimationFrame(animCursor);
  })();

  window.addEventListener("scroll", () => {
    const nav = document.getElementById("nav");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  function observeReveals() {
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
  }
  observeReveals();

  const featuredRow = document.getElementById("featuredPosts");
  const postList = document.getElementById("postList");
  const postCount = document.getElementById("postCount");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const filterBar = document.getElementById("blogFilterBar");

  let allPosts = [];
  let allCategories = [];
  let visible = 6;
  let activeCat = "all";

  function stripHtml(text = "") {
    const div = document.createElement("div");
    div.innerHTML = text;
    return (div.textContent || div.innerText || "").trim();
  }

  function excerpt(text = "", max = 140) {
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

  function slugify(text = "") {
    return String(text).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  function categorySlug(post) {
    const cat = post.category?.name || post.category || "general";
    return slugify(cat);
  }

  function postUrl(post) {
    return `post.html?slug=${encodeURIComponent(post.slug)}`;
  }

  function imageHtml(post, height=180) {
    if (!post.image) return "";
    return `<img src="/uploads/${post.image}" alt="${post.title}" style="width:100%;height:${height}px;object-fit:cover;border-radius:14px;margin-bottom:12px;">`;
  }

  function featuredCard(post) {
    const catName = post.category?.name || post.category || "General";
    return `
      <a class="card-featured reveal" data-cat="${categorySlug(post)}" href="${postUrl(post)}">
        ${imageHtml(post, 220)}
        <div class="card-f-tag">★ Featured · ${catName}</div>
        <div class="card-f-title">${post.title}</div>
        <p class="card-f-excerpt">${post.excerpt || excerpt(post.content, 180)}</p>
        <div class="card-f-meta">
          <span>${post.author?.name || "Livingstone"} · ${formatDate(post.createdAt)}</span>
          <span>${readTime(post.content)} min read →</span>
        </div>
      </a>
    `;
  }

  function listCard(post, index) {
    const catName = post.category?.name || post.category || "General";
    return `
      <a class="list-post reveal" data-cat="${categorySlug(post)}" href="${postUrl(post)}">
        <div class="list-num">${String(index + 1).padStart(2, "0")}</div>
        <div class="list-content">
          <div class="list-cat">${catName}</div>
          <div class="list-title">${post.title}</div>
          <p class="list-excerpt">${post.excerpt || excerpt(post.content, 170)}</p>
          <div class="list-meta">
            <span>${formatDate(post.createdAt)}</span>
            <span class="dot"></span>
            <span>${readTime(post.content)} min read</span>
            <span class="dot"></span>
            <span>${catName}</span>
          </div>
        </div>
        <div class="list-arrow">→</div>
      </a>
    `;
  }

  function buildFilters() {
    if (!filterBar) return;
    const buttons = ['<button class="filter-btn active" data-cat="all">All Posts</button>'];
    allCategories.forEach(cat => {
      buttons.push(`<button class="filter-btn" data-cat="${slugify(cat.name)}">${cat.name}</button>`);
    });
    filterBar.innerHTML = buttons.join("");
    filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeCat = btn.dataset.cat;
        visible = 6;
        applyFilter();
      });
    });

    const matchBtn = filterBar.querySelector(`[data-cat="${activeCat}"]`);
    if (matchBtn) {
      filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      matchBtn.classList.add("active");
    }
  }

  function updateStats(filtered) {
    if (postCount) postCount.textContent = filtered.length;
    const statPublished = document.getElementById("statPublished");
    const statCategories = document.getElementById("statCategories");
    const statWords = document.getElementById("statWords");
    if (statPublished) statPublished.innerHTML = `${filtered.length}<span>+</span>`;
    if (statCategories) statCategories.innerHTML = `${allCategories.length}<span>+</span>`;
    
    if (statWords) {
      const words = filtered.reduce((sum, p) => { return sum + stripHtml(p.content).split(/\s+/).filter(Boolean).length; }, 0);

      if (words >= 1000){
        statWords.innerHTML = `${(words / 1000).toFixed(1).replace('.0', '')}<span>k</span>`;
      } else {
        statWords.innerHTML = `${words}<span>w</span>`;
      }
    }
  }

  function applyFilter() {
    let filtered = allPosts;
    if (activeCat !== "all") {
      filtered = allPosts.filter((post) => categorySlug(post) === activeCat);
    }

    updateStats(filtered);

    const featuredPosts = filtered.slice(0, 2);
    const listPosts = filtered.slice(2, visible + 2);

    if (featuredRow) featuredRow.innerHTML = featuredPosts.length ? featuredPosts.map(featuredCard).join("") : "";
    if (postList) {
      postList.innerHTML = listPosts.length
        ? listPosts.map((post, index) => listCard(post, index)).join("")
        : '<div class="list-post reveal"><div class="list-content"><div class="list-title">No posts found</div><p class="list-excerpt">There are no published posts in this category yet.</p></div></div>';
    }

    observeReveals();

    if (loadMoreBtn) {
      const hiddenCount = Math.max(0, filtered.slice(2).length - listPosts.length);
      loadMoreBtn.disabled = hiddenCount === 0;
      const label = loadMoreBtn.querySelector("span");
      if (label) label.textContent = hiddenCount > 0 ? "Load More Posts" : "All Posts Loaded";
      loadMoreBtn.style.opacity = hiddenCount > 0 ? "1" : "0.4";
    }
  }

  async function loadData() {
    try {
      const [postRes, catRes] = await Promise.all([fetch("/api/posts"), fetch("/api/categories")]);
      const postData = await postRes.json();
      const catData = await catRes.json();
      allPosts = Array.isArray(postData) ? postData : (postData.posts || []);
      allCategories = Array.isArray(catData) ? catData : [];
      buildFilters();
      applyFilter();
    } catch (err) {
      console.error("Failed to load posts/categories:", err);
      if (postList) {
        postList.innerHTML = '<div class="list-post reveal"><div class="list-content"><div class="list-title">Could not load posts</div><p class="list-excerpt">Check your backend connection and try again.</p></div></div>';
      }
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      visible += 6;
      applyFilter();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initCat = params.get("cat");
  if (initCat) {
    activeCat = slugify(initCat);
  }

  loadData();
})();
