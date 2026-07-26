/* ==========================================================================
   Interactive CFD Particle Fluid Simulator (Velocity & Pressure Color Mapping)
   Designed for Prof. Dr. Saon Crispim Vieira - UNICAMP (Fluid Dynamics)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Canvas Resolution
  const width = 540;
  const height = 440;
  canvas.width = width;
  canvas.height = height;

  // Simulation Constants
  const PARTICLE_COUNT = 420;
  let colorMetric = 'speed'; // 'speed', 'pressure', or 'mixed'
  let viscosity = 0.96;
  const gravity = 0.08;

  // Spatial Grid Partitioning (Fast 60 FPS Collisions)
  const cellSize = 24;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  let grid = [];

  // Mouse / Touch Pointer
  const pointer = {
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    prevX: -1000,
    prevY: -1000,
    isDown: false,
    radius: 70
  };

  // CFD Particle Class
  class CFDParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.radius = 5.5;
      this.density = 0;  // Local fluid pressure/density
      this.speed = 0;    // Velocity magnitude
    }

    update() {
      // 1. Base Downward Gravity
      this.vy += gravity;

      // 2. Mouse Impeller / Stirring Force
      if (pointer.isDown || pointer.active) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pointer.radius && dist > 0) {
          const factor = (1 - dist / pointer.radius);
          // Transfer mouse velocity to fluid particles
          this.vx += pointer.vx * factor * 0.45 + (dx / dist) * factor * 1.8;
          this.vy += pointer.vy * factor * 0.45 + (dy / dist) * factor * 1.8;
        }
      }

      // 3. Velocity damping & position update
      this.vx *= viscosity;
      this.vy *= viscosity;
      this.x += this.vx;
      this.y += this.vy;

      // Speed magnitude
      this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

      // 4. Chamber Wall Collisions
      const margin = 12;
      if (this.x < margin + this.radius) {
        this.x = margin + this.radius;
        this.vx *= -0.5;
      }
      if (this.x > width - margin - this.radius) {
        this.x = width - margin - this.radius;
        this.vx *= -0.5;
      }
      if (this.y < margin + this.radius) {
        this.y = margin + this.radius;
        this.vy *= -0.5;
      }
      if (this.y > height - margin - this.radius) {
        this.y = height - margin - this.radius;
        this.vy *= -0.5;
      }
    }
  }

  // Initialize Particles
  let particles = [];
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = 30 + Math.random() * (width - 60);
      const y = 30 + Math.random() * (height - 60);
      particles.push(new CFDParticle(x, y));
    }
  }

  // Spatial Grid Update
  function updateGrid() {
    grid = Array.from({ length: cols * rows }, () => []);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const c = Math.floor(p.x / cellSize);
      const r = Math.floor(p.y / cellSize);
      if (c >= 0 && c < cols && r >= 0 && r < rows) {
        grid[r * cols + c].push(p);
      }
    }
  }

  // Fluid Particle Collisions & Pressure Field Calculation
  function applyCFDPhysics() {
    updateGrid();

    // Reset local density/pressure
    particles.forEach(p => p.density = 0);

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const c = Math.floor(p1.x / cellSize);
      const r = Math.floor(p1.y / cellSize);

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
            const cellParticles = grid[nr * cols + nc];
            for (let j = 0; j < cellParticles.length; j++) {
              const p2 = cellParticles[j];
              if (p1 === p2) continue;

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const targetDist = p1.radius + p2.radius;

              if (dist < targetDist * 2.0 && dist > 0) {
                // Compute density / hydrostatic pressure contribution
                p1.density += (1 - dist / (targetDist * 2.0));

                // Short-range elastic repulsion (Incompressible fluid force)
                if (dist < targetDist) {
                  const overlap = (targetDist - dist) * 0.45;
                  const nx = dx / dist;
                  const ny = dy / dist;

                  p1.x -= nx * overlap;
                  p1.y -= ny * overlap;
                  p1.vx -= nx * overlap * 0.3;
                  p1.vy -= ny * overlap * 0.3;
                }
              }
            }
          }
        }
      }
    }
  }

  // Compute Dynamic Color (HSL Hue Mapping: Blue -> Green -> Red)
  function getCFDColor(particle) {
    let normMetric = 0;

    if (colorMetric === 'speed') {
      // Speed 0 to 12 m/s mapped to 0 to 1
      normMetric = Math.min(1.0, particle.speed / 7.5);
    } else if (colorMetric === 'pressure') {
      // Pressure/Density 0 to 10 mapped to 0 to 1
      normMetric = Math.min(1.0, particle.density / 8.0);
    } else {
      // Mixed Metric (Speed + Pressure)
      normMetric = Math.min(1.0, (particle.speed / 6.0 + particle.density / 9.0) * 0.5);
    }

    // Hue Spectrum: 230 (Deep Blue) -> 160 (Cyan) -> 100 (Green) -> 45 (Yellow) -> 0 (Red)
    const hue = Math.floor(230 * (1 - normMetric));
    const saturation = 85 + Math.floor(15 * normMetric);
    const lightness = 45 + Math.floor(15 * normMetric);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Draw Chamber Boundary
  function drawChamber() {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, width - 16, height - 16, 14);
    ctx.stroke();
  }

  // Render CFD Particles with Motion Trails & Dynamic Colors
  function renderCFDFluid() {
    // Semi-transparent background for smooth motion velocity trails
    ctx.fillStyle = 'rgba(9, 13, 22, 0.4)';
    ctx.fillRect(0, 0, width, height);

    drawChamber();

    // Enable glowing additive blend mode for fluid particles
    ctx.globalCompositeOperation = 'screen';

    particles.forEach(p => {
      const color = getCFDColor(p);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    // Particle cores for crisp visualization
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    });

    // Draw Mouse Pointer Field Circle
    if (pointer.active || pointer.isDown) {
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Main 60 FPS Animation Loop
  function animate() {
    applyCFDPhysics();

    particles.forEach(p => {
      p.update();
    });

    renderCFDFluid();

    requestAnimationFrame(animate);
  }

  // Pointer Interaction Coordinates
  function updatePointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentX = (clientX - rect.left) * scaleX;
    const currentY = (clientY - rect.top) * scaleY;

    if (pointer.prevX !== -1000) {
      pointer.vx = currentX - pointer.prevX;
      pointer.vy = currentY - pointer.prevY;
    }

    pointer.x = currentX;
    pointer.y = currentY;
    pointer.prevX = currentX;
    pointer.prevY = currentY;
    pointer.active = true;
  }

  // Pressure Shockwave Blast (Click Event)
  function triggerShockwave(x, y) {
    particles.forEach(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const blastForce = (1 - dist / 120) * 12.0;
        p.vx += (dx / dist) * blastForce;
        p.vy += (dy / dist) * blastForce;
        p.speed = 15; // High speed spike (turns RED)
      }
    });
  }

  // Mouse & Touch Event Listeners
  canvas.addEventListener('mousemove', e => {
    updatePointerPos(e);
  });

  canvas.addEventListener('mousedown', e => {
    pointer.isDown = true;
    updatePointerPos(e);
    triggerShockwave(pointer.x, pointer.y);
  });

  window.addEventListener('mouseup', () => {
    pointer.isDown = false;
    pointer.vx = 0;
    pointer.vy = 0;
  });

  canvas.addEventListener('mouseleave', () => {
    pointer.active = false;
    pointer.isDown = false;
    pointer.prevX = -1000;
  });

  // Touch Support
  canvas.addEventListener('touchstart', e => {
    pointer.isDown = true;
    updatePointerPos(e);
    triggerShockwave(pointer.x, pointer.y);
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    updatePointerPos(e);
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    pointer.isDown = false;
    pointer.active = false;
    pointer.prevX = -1000;
  });

  // UI Controls
  const metricSelect = document.getElementById('metric-select');
  const viscSlider = document.getElementById('visc-slider');
  const blastBtn = document.getElementById('blast-btn');
  const resetBtn = document.getElementById('reset-btn');

  if (metricSelect) {
    metricSelect.addEventListener('change', e => {
      colorMetric = e.target.value;
    });
  }

  if (viscSlider) {
    viscSlider.addEventListener('input', e => {
      viscosity = parseFloat(e.target.value);
    });
  }

  if (blastBtn) {
    blastBtn.addEventListener('click', () => {
      triggerShockwave(width / 2, height / 2);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initParticles();
    });
  }

  // Start Simulation
  initParticles();
  animate();
});
