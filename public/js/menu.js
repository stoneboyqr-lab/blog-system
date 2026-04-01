
(function(){
  const nav = document.querySelector('nav');
  const toggle = document.querySelector('.nav-toggle');
  const backdrop = document.querySelector('.nav-backdrop');
  if(!nav || !toggle || !backdrop) return;

  function closeMenu(){
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded','false');
  }
  function openMenu(){
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded','true');
  }
  toggle.addEventListener('click', ()=>{
    if(document.body.classList.contains('nav-open')) closeMenu();
    else openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-links a').forEach(a=>{
    a.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 900) closeMenu();
  });
})();
