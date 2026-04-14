// ── Copy buttons ──
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.closest('.code-wrap').querySelector('pre').innerText;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });
});

// ── Sidebar active tracking ──
const sections = document.querySelectorAll('.section-anchor');
const links = document.querySelectorAll('.sb-link');

function updateActive() {
  let current = '';
  sections.forEach(s => {
    const rect = s.getBoundingClientRect();
    if (rect.top < 120) current = s.id;
  });
  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateActive, { passive: true });
updateActive();

// ── Mobile toggle ──
document.getElementById('sbToggle')?.addEventListener('click', () => {
  document.querySelector('.sidebar')?.classList.toggle('open');
});
document.querySelectorAll('.sb-link').forEach(l => {
  l.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.remove('open');
  });
});
