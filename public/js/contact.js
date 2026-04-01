
(function(){
  const cursor=document.getElementById('cursor');
  const ring=document.getElementById('cursorRing');
  document.addEventListener('mousemove',(e)=>{
    if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}
    if(ring){ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';}
  });
  const nav=document.getElementById('nav');
  window.addEventListener('scroll',()=>{ if(nav){ nav.classList.toggle('scrolled', window.scrollY>20); }});
  const form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',(e)=>{ e.preventDefault(); alert('Connect this form to your backend route.'); });
  }
})();
