// Pixel art map renderer
(function() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PS = 4; // pixel size

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.floor(rect.width / PS) * PS;
    canvas.height = Math.floor(rect.height / PS) * PS;
    draw();
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PS, y * PS, (w || 1) * PS, (h || 1) * PS);
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PS, y * PS, w * PS, h * PS);
  }

  // Draw pixel art scene
  function draw() {
    const cols = Math.floor(canvas.width / PS);
    const rows = Math.floor(canvas.height / PS);

    // Sky gradient (dark to lighter)
    for (let y = 0; y < rows; y++) {
      const t = y / rows;
      const r = Math.floor(15 + t * 10);
      const g = Math.floor(15 + t * 15);
      const b = Math.floor(26 + t * 20);
      rect(0, y, cols, 1, `rgb(${r},${g},${b})`);
    }

    // Stars
    const starSeed = 42;
    for (let i = 0; i < 40; i++) {
      const sx = ((starSeed * (i + 1) * 7) % cols);
      const sy = ((starSeed * (i + 1) * 13) % Math.floor(rows * 0.4));
      const brightness = 150 + ((i * 37) % 100);
      px(sx, sy, 1, 1, `rgb(${brightness},${brightness},${brightness + 30})`);
    }

    // Floor / ground
    const groundY = Math.floor(rows * 0.6);
    rect(0, groundY, cols, rows - groundY, '#111827');

    // Grid pattern on floor
    for (let x = 0; x < cols; x += 8) {
      for (let y = groundY; y < rows; y += 4) {
        px(x, y, 1, 1, '#22223a');
      }
    }

    // Buildings (background)
    const buildings = [
      { x: 0.05, w: 0.12, h: 0.35, color: '#1e293b', accent: '#3b82f6' },
      { x: 0.2, w: 0.08, h: 0.25, color: '#1a2744', accent: '#60a5fa' },
      { x: 0.32, w: 0.15, h: 0.4, color: '#1e293b', accent: '#818cf8' },
      { x: 0.55, w: 0.1, h: 0.3, color: '#1a2744', accent: '#a78bfa' },
      { x: 0.68, w: 0.14, h: 0.38, color: '#1e293b', accent: '#6366f1' },
      { x: 0.85, w: 0.12, h: 0.28, color: '#1a2744', accent: '#38bdf8' },
    ];

    buildings.forEach(b => {
      const bx = Math.floor(b.x * cols);
      const bw = Math.floor(b.w * cols);
      const bh = Math.floor(b.h * rows);
      const by = groundY - bh;

      // Building body
      rect(bx, by, bw, bh, b.color);

      // Roof accent
      rect(bx, by, bw, 2, b.accent);

      // Windows
      for (let wy = by + 4; wy < groundY - 4; wy += 5) {
        for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
          const lit = ((wx + wy) * 17 + starSeed) % 3 !== 0;
          px(wx, wy, 2, 3, lit ? b.accent + '80' : '#0f0f1a');
        }
      }
    });

    // Desk areas (where icons are)
    const desks = [
      { x: 0.10, color: '#3b82f6' },
      { x: 0.35, color: '#6366f1' },
      { x: 0.60, color: '#818cf8' },
      { x: 0.85, color: '#a78bfa' },
    ];

    desks.forEach(d => {
      const dx = Math.floor(d.x * cols);
      const dy = groundY + 4;
      // Desk
      rect(dx - 4, dy, 8, 3, d.color);
      rect(dx - 3, dy + 3, 2, 3, d.color);
      rect(dx + 1, dy + 3, 2, 3, d.color);
    });

    // Decorative elements
    // Plant
    const plantX = Math.floor(0.48 * cols);
    const plantY = groundY + 2;
    px(plantX, plantY - 3, 1, 1, '#4ade80');
    px(plantX - 1, plantY - 2, 3, 1, '#4ade80');
    px(plantX, plantY - 1, 1, 2, '#92400e');
    rect(plantX - 1, plantY + 1, 3, 2, '#92400e');

    // with-AI sign
    const signX = Math.floor(0.48 * cols) - 6;
    const signY = Math.floor(rows * 0.15);
    rect(signX, signY, 14, 6, '#3b82f6');
    rect(signX + 1, signY + 1, 12, 4, '#0a0e1a');
    // "AI" text simplified
    px(signX + 4, signY + 2, 2, 2, '#60a5fa');
    px(signX + 7, signY + 2, 2, 2, '#60a5fa');
  }

  // Character movement on click
  const character = document.getElementById('character');
  const mapContainer = canvas.parentElement;

  mapContainer.addEventListener('click', (e) => {
    if (e.target.closest('.hotspot')) return;
    const rect = mapContainer.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    character.style.left = xPercent + '%';
  });

  window.addEventListener('resize', resize);
  resize();
})();
