
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function animCursor() {
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
    window.addEventListener('scroll', () => { document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60); });
    const obs = new IntersectionObserver(e => { e.forEach(el => { if (el.isIntersecting) { el.target.classList.add('visible'); obs.unobserve(el.target); } }); }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  