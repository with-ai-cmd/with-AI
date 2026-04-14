// ====== STARS ======
(function(){
  const box = document.getElementById('stars');
  if(!box) return;
  for(let i=0;i<100;i++){
    const s = document.createElement('div');
    s.className='star';
    const size = Math.random()*2.5+0.5;
    s.style.cssText=`
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      --dur:${2+Math.random()*4}s;
      --o1:${.1+Math.random()*.3};
      --o2:${.5+Math.random()*.5};
    `;
    box.appendChild(s);
  }
})();

// ====== MOBILE NAV ======
document.getElementById('ham')?.addEventListener('click',()=>{
  document.getElementById('navLinks')?.classList.toggle('open');
});

// ====== CHARACTER FOLLOW CLICK ======
(function(){
  const scene = document.querySelector('.iso-scene');
  const chara = document.getElementById('chara');
  if(!scene||!chara) return;

  scene.addEventListener('click',(e)=>{
    if(e.target.closest('.building')) return;
    const rect = scene.getBoundingClientRect();
    const x = ((e.clientX - rect.left)/rect.width)*100;
    chara.style.left = x+'%';
  });
})();

// ====== SCROLL REVEAL ======
(function(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.1});

  document.querySelectorAll('.news-card').forEach((el,i)=>{
    el.style.opacity='0';
    el.style.transform='translateY(20px)';
    el.style.transition=`all .5s ${i*.1}s cubic-bezier(.22,1,.36,1)`;
    obs.observe(el);
  });
})();
