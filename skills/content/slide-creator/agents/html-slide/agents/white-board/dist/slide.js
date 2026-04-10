/* White-Board Slide — Navigation Engine */
(function(){
  const S=document.querySelectorAll('.slide'),T=S.length;
  let cur=0;
  const nd=document.getElementById('nd'),
        pf=document.getElementById('pf'),
        nc=document.getElementById('nc'),
        pb=document.getElementById('pb'),
        nb=document.getElementById('nb');

  for(let i=0;i<T;i++){
    const d=document.createElement('button');
    d.className='dot'+(i?'':' on');
    d.onclick=()=>go(i);
    nd.appendChild(d);
  }

  function go(i){
    if(i<0||i>=T||i===cur)return;
    S[cur].classList.remove('active');S[cur].style.display='none';
    cur=i;
    S[cur].classList.add('active');
    upd();
  }

  function upd(){
    nc.textContent=`${cur+1} / ${T}`;
    pf.style.width=`${((cur+1)/T)*100}%`;
    pb.disabled=cur===0;
    nb.disabled=cur===T-1;
    document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  }

  // Keyboard
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();go(cur+1)}
    if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}
  });

  // Touch
  let tx=0;
  document.addEventListener('touchstart',e=>tx=e.touches[0].clientX);
  document.addEventListener('touchend',e=>{
    const d=tx-e.changedTouches[0].clientX;
    if(Math.abs(d)>50){d>0?go(cur+1):go(cur-1)}
  });

  // Copy button
  window.cp=function(b){
    const c=b.closest('.prompt').cloneNode(true);
    c.querySelector('.copy-btn')?.remove();
    c.querySelector('.prompt-tag')?.remove();
    navigator.clipboard.writeText(c.textContent.trim()).then(()=>{
      b.textContent='Copied!';b.classList.add('ok');
      setTimeout(()=>{b.textContent='Copy';b.classList.remove('ok')},1500);
    });
  };

  // Public
  window.nextSlide=()=>go(cur+1);
  window.prevSlide=()=>go(cur-1);
  upd();
})();
