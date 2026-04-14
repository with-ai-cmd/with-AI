// Mobile nav toggle
document.getElementById('mobileToggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('open');
  });
});
