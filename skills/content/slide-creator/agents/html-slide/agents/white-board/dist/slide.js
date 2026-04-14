/* White-Board Slide — Navigation Engine v3 */

// Fix mobile viewport height (address bar対策)
function setVH(){document.documentElement.style.setProperty('--vh',window.innerHeight+'px')}
setVH();
window.addEventListener('resize',setVH);

(function(){
  const S=document.querySelectorAll('.slide'),T=S.length;
  // var for global access from inline onclick
  window.cur=0;

  const nd=document.getElementById('nd');
  for(let i=0;i<T;i++){
    const d=document.createElement('button');
    d.className='dot'+(i?'':' on');
    d.onclick=()=>go(i);
    nd.appendChild(d);
  }

  function go(i){
    if(i<0||i>=T||i===window.cur)return;
    S[window.cur].classList.remove('active');
    window.cur=i;
    S[window.cur].style.display='';
    S[window.cur].classList.add('active');
    S[window.cur].scrollTop=0;
    upd();
  }
  // Expose to inline onclick
  window.go=go;

  function upd(){
    document.getElementById('nc').textContent=`${window.cur+1} / ${T}`;
    document.getElementById('pf').style.width=`${((window.cur+1)/T)*100}%`;
    document.getElementById('pb').disabled=window.cur===0;
    document.getElementById('nb').disabled=window.cur===T-1;
    document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===window.cur));
  }

  // Keyboard
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();go(window.cur+1)}
    if(e.key==='ArrowLeft'){e.preventDefault();go(window.cur-1)}
  });

  // Touch swipe
  let tx=0;
  document.addEventListener('touchstart',e=>tx=e.touches[0].clientX);
  document.addEventListener('touchend',e=>{
    const d=tx-e.changedTouches[0].clientX;
    if(Math.abs(d)>50){d>0?go(window.cur+1):go(window.cur-1)}
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

  upd();
})();
