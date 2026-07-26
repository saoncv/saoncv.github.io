/* ==========================================================================
   Continuous Multiphase Lava Lamp Fluid Engine (60 FPS Game-Accelerated)
   Designed for Prof. Dr. Saon Crispim Vieira - UNICAMP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Canvas Resolution
  const width = 480;
  const height = 520;
  canvas.width = width;
  canvas.height = height;

  // Simulation Constants
  const PARTICLE_COUNT = 380; // High density for fluid look
  let heatPower = 1.2;
  let viscosity = 0.95;
  
  // Spatial Grid for Fast 60FPS Physics
  const cellSize = 28;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  let grid = [];

  // Mouse & Touch Tracking
  const mouse = { x: -1000, y: -1000, isDown: false, radius: 50 };

  // Fluid Particle Definition
  class FluidParticle {
    constructor(x, y, clusterId = 0) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.radius = 9; // Render radius for metaball liquid feel
      this.temp = Math.random() * 0.3; // 0 (cool/heavy) to 1 (hot/buoyant)
      this.clusterId = clusterId;
    }

    update() {
      // 1. Heating at bottom (y > 440)
      if (this.y > 420) {
        this.temp += 0.025 * heatPower;
      }
      // Cooling at top (y < 90)
      if (this.y < 90) {
        this.temp -= 0.018;
      }
      this.temp = Math.max(0, Math.min(1, this.temp));

      // 2. Thermal Buoyancy Force
      const buoyancy = (this.temp - 0.45) * 0.22 * heatPower;
      this.vy -= buoyancy;

      // Slight downward base gravity for cool oil
      this.vy += 0.04;

      // 3. Mouse Drag / Stir Force
      if (mouse.isDown) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 3.0;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      // 4. Velocity damping & position update
      this.vx *= viscosity;
      this.vy *= viscosity;
      this.x += this.vx;
      this.y += this.vy;

      // 5. Chamber Boundaries (Lamp Glass Vessel)
      const margin = 25;
      if (this.x < margin + this.radius) {
        this.x = margin + this.radius;
        this.vx *= -0.4;
      }
      if (this.x > width - margin - this.radius) {
        this.x = width - margin - this.radius;
        this.vx *= -0.4;
      }
      if (this.y < margin + this.radius) {
        this.y = margin + this.radius;
        this.vy *= -0.4;
      }
      if (this.y > height - margin - this.radius) {
        this.y = height - margin - this.radius;
        this.vy *= -0.4;
      }
    }
  }

  // Create Initial Oil Fluid Reservoir & Floating Blobs
  let particles = [];
  function initFluid() {
    particles = [];
    
    // Bottom Oil Reservoir (Dense fluid base)
    for (let i = 0; i < 240; i++) {
      const x = 40 + Math.random() * (width - 80);
      const y = height - 40 - Math.random() * 80;
      particles.push(new FluidParticle(x, y, 1));
    }

    // Ascending Blobs
    for (let b = 0; b < 4; b++) {
      const bx = 80 + Math.random() * (width - 160);
      const by = 150 + Math.random() * 200;
      for (let i = 0; i < 35; i++) {
        const x = bx + (Math.random() - 0.5) * 45;
        const y = by + (Math.random() - 0.5) * 45;
        const p = new FluidParticle(x, y, b + 2);
        p.temp = 0.7 + Math.random() * 0.3; // Hot rising blob
        particles.push(p);
      }
    }
  }

  // Spatial Grid Optimization
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

  // Fluid Cohesion & Short-range Repulsion (SPH-like Fluid behavior)
  function applyFluidPhysics() {
    updateGrid();

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const c = Math.floor(p1.x / cellSize);
      const r = Math.floor(p1.y / cellSize);

      // Check 3x3 neighboring grid cells
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

              if (dist < targetDist * 2.2 && dist > 0) {
                // Surface tension / attraction (makes particles form liquid blobs)
                const attractForce = (targetDist * 2.2 - dist) * 0.007;
                p1.vx += (dx / dist) * attractForce;
                p1.vy += (dy / dist) * attractForce;

                // Repulsion when overlapping too closely (prevents collapse)
                if (dist < targetDist) {
                  const overlap = (targetDist - dist) * 0.25;
                  p1.x -= (dx / dist) * overlap;
                  p1.y -= (dy / dist) * overlap;
                }
              }
            }
          }
        }
      }
    }
  }

  // BREAKUP MECHANIC: Click directly on oil blob to shatter/split it!
  function handleBreakup(clickX, clickY) {
    let hitCount = 0;
    particles.forEach(p => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If clicked within 45px of fluid particles
      if (dist < 55) {
        hitCount++;
        // Impart outward explosive velocity to shatter the blob into sub-droplets
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
        const blastSpeed = 4.5 + Math.random() * 5.0;
        p.vx = Math.cos(angle) * blastSpeed;
        p.vy = Math.sin(angle) * blastSpeed;
        p.temp = Math.min(1, p.temp + 0.2); // Thermal spike on breakup
      }
    });

    return hitCount > 0;
  }

  // Draw Glowing Lava Lamp Glass Vessel & Heater
  function drawLampVessel() {
    // Glass boundary glow
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(20, 20, width - 40, height - 40, 28);
    ctx.stroke();

    // Bottom Heat Source Coils
    const heatGlow = Math.min(0.6, 0.2 * heatPower);
    ctx.fillStyle = `rgba(249, 115, 22, ${heatGlow})`;
    ctx.fillRect(25, height - 38, width - 50, 16);

    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
    ctx.font = '11px Outfit, sans-serif';
    ctx.fillText('HEATER COIL', width / 2 - 35, height - 26);
  }

  // Fluid Rendering with Glowing Blob Blend
  function renderFluid() {
    // Render ambient fluid background
    ctx.fillStyle = 'rgba(11, 15, 25, 0.35)';
    ctx.fillRect(0, 0, width, height);

    drawLampVessel();

    // Use additive blending for rich glowing liquid feel
    ctx.globalCompositeOperation = 'screen';

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);

      // Color transition: Cool oil (deep purple/amber) -> Hot ascending lava (glowing orange/yellow)
      const r = Math.floor(220 + 35 * p.temp);
      const g = Math.floor(80 + 120 * p.temp);
      const b = Math.floor(20 + 40 * (1 - p.temp));
      const alpha = 0.45 + 0.35 * p.temp;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    });

    // Reset blending mode
    ctx.globalCompositeOperation = 'source-over';

    // Second pass for crisp inner core highlights
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 2, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + 0.35 * p.temp})`;
      ctx.fill();
    });
  }

  // Main 60 FPS Loop
  function animate() {
    applyFluidPhysics();

    particles.forEach(p => {
      p.update();
    });

    renderFluid();

    requestAnimationFrame(animate);
  }

  // Canvas Event Coordinates
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // Click Event -> Shatter/Break Up Oil Droplets!
  canvas.addEventListener('click', e => {
    const pos = getCanvasCoords(e);
    handleBreakup(pos.x, pos.y);
  });

  // Mouse Drag / Stir
  canvas.addEventListener('mousedown', e => {
    mouse.isDown = true;
    const pos = getCanvasCoords(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
  });

  canvas.addEventListener('mousemove', e => {
    if (mouse.isDown) {
      const pos = getCanvasCoords(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    }
  });

  window.addEventListener('mouseup', () => {
    mouse.isDown = false;
  });

  // Touch Support
  canvas.addEventListener('touchstart', e => {
    mouse.isDown = true;
    const pos = getCanvasCoords(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    handleBreakup(pos.x, pos.y);
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (mouse.isDown) {
      const pos = getCanvasCoords(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.isDown = false;
  });

  // Control Panel Listeners
  const heatSlider = document.getElementById('heat-slider');
  const spawnBtn = document.getElementById('spawn-blob-btn');
  const stirBtn = document.getElementById('stir-fluid-btn');

  if (heatSlider) {
    heatSlider.addEventListener('input', e => {
      heatPower = parseFloat(e.target.value);
    });
  }

  if (spawnBtn) {
    spawnBtn.addEventListener('click', () => {
      // Spawn a new hot rising oil blob at the bottom
      const bx = 100 + Math.random() * (width - 200);
      for (let i = 0; i < 25; i++) {
        const p = new FluidParticle(
          bx + (Math.random() - 0.5) * 35,
          height - 50 + (Math.random() - 0.5) * 20,
          99
        );
        p.temp = 0.95; // Hot buoyant blob
        p.vy = -2.5 - Math.random() * 1.5;
        particles.push(p);
      }
    });
  }

  if (stirBtn) {
    stirBtn.addEventListener('click', () => {
      particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * 7.5;
        p.vy = (Math.random() - 0.5) * 7.5;
      });
    });
  }

  // Start Simulation
  initFluid();
  animate();
});
