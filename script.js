/* ==========================================================================
   2D Multiphase Fluid Simulator Engine (Lava Lamp / Hourglass Interactive)
   Designed for Prof. Dr. Saon Crispim Vieira - UNICAMP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Resize canvas canvas crisp resolution
  const width = 480;
  const height = 480;
  canvas.width = width;
  canvas.height = height;

  // Simulation Parameters
  let currentMode = 'lavalamp'; // 'lavalamp' or 'hourglass'
  let heatPower = 1.0;
  let viscosity = 0.96;
  const particleCount = 180;

  // Mouse & Touch Tracking
  let mouse = { x: -1000, y: -1000, active: false, radius: 60 };

  // Particles
  class Particle {
    constructor(x, y, isLava) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.radius = isLava ? Math.random() * 12 + 10 : Math.random() * 6 + 4;
      this.isLava = isLava;
      this.temp = isLava ? Math.random() * 0.4 : 0; // 0 (cold) to 1 (hot)
    }

    update() {
      // 1. Gravity & Buoyancy Physics
      if (currentMode === 'lavalamp') {
        if (this.isLava) {
          // Heat source at bottom (y > 420)
          if (this.y > 400) {
            this.temp += 0.02 * heatPower;
          }
          // Cooling source at top (y < 80)
          if (this.y < 80) {
            this.temp -= 0.015;
          }
          this.temp = Math.max(0, Math.min(1, this.temp));

          // Buoyancy force proportional to temperature
          const buoyancy = (this.temp - 0.45) * 0.15 * heatPower;
          this.vy -= buoyancy;
        } else {
          // Ambient liquid (slight downward gravity)
          this.vy += 0.03;
        }
      } else if (currentMode === 'hourglass') {
        // Hourglass downward gravity
        this.vy += 0.15;

        // Funnel boundary constraint (throat at y=240, width=50)
        if (this.y > 140 && this.y < 340) {
          const distFromCenter = this.x - width / 2;
          const funnelWidth = 25 + Math.abs(this.y - 240) * 0.45;
          if (Math.abs(distFromCenter) > funnelWidth) {
            const pushDir = distFromCenter > 0 ? -1 : 1;
            this.vx += pushDir * 0.3;
            this.x = width / 2 + pushDir * funnelWidth;
          }
        }
      }

      // 2. Mouse Stirring Interaction
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 2.5;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      // 3. Apply Velocity & Viscosity
      this.vx *= viscosity;
      this.vy *= viscosity;
      this.x += this.vx;
      this.y += this.vy;

      // 4. Boundary Collisions (Cylindrical container)
      const margin = 20;
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

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      if (this.isLava) {
        // Color shifts from glowing orange/red (hot) to deep amber/purple (cool)
        const r = Math.floor(230 + 25 * this.temp);
        const g = Math.floor(100 + 80 * this.temp);
        const b = Math.floor(30 + 40 * (1 - this.temp));
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 12 * this.temp + 4;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      } else {
        // Water/ambient fluid particle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Initialize Particles
  let particles = [];
  function initParticles() {
    particles = [];
    // Lava Blobs (Phase 2)
    for (let i = 0; i < 40; i++) {
      const p = new Particle(
        width / 2 + (Math.random() - 0.5) * 160,
        height - 60 - Math.random() * 100,
        true
      );
      particles.push(p);
    }
    // Water Particles (Phase 1)
    for (let i = 0; i < 140; i++) {
      const p = new Particle(
        marginRandom(width),
        marginRandom(height),
        false
      );
      particles.push(p);
    }
  }

  function marginRandom(max) {
    return 40 + Math.random() * (max - 80);
  }

  // Inter-particle Cohesion / Surface Tension
  function applyCohesion() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        if (p1.isLava && p2.isLava) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p1.radius + p2.radius;

          if (dist < minDist * 1.8 && dist > 0) {
            // Attraction / surface tension force to merge blobs
            const force = (minDist * 1.8 - dist) * 0.008;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            p1.vx += fx;
            p1.vy += fy;
            p2.vx -= fx;
            p2.vy -= fy;
          }

          // Hard repulsion if overlapping
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.4;
            p1.x -= (dx / dist) * overlap;
            p1.y -= (dy / dist) * overlap;
            p2.x += (dx / dist) * overlap;
            p2.y += (dy / dist) * overlap;
          }
        }
      }
    }
  }

  // Render Glass Container & Boundaries
  function drawChamber() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;

    if (currentMode === 'lavalamp') {
      // Cylinder chamber
      ctx.beginPath();
      ctx.roundRect(15, 15, width - 30, height - 30, 24);
      ctx.stroke();

      // Heating element at bottom
      ctx.fillStyle = `rgba(249, 115, 22, ${0.15 * heatPower})`;
      ctx.fillRect(20, height - 35, width - 40, 15);
    } else if (currentMode === 'hourglass') {
      // Hourglass glass walls
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(width - 20, 20);
      ctx.lineTo(width / 2 + 25, height / 2);
      ctx.lineTo(width - 20, height - 20);
      ctx.lineTo(20, height - 20);
      ctx.lineTo(width / 2 - 25, height / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Main Loop 60 FPS
  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawChamber();
    applyCohesion();

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw Mouse Force Ripple
    if (mouse.active) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }

  // Event Listeners for Interaction
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

  canvas.addEventListener('mousemove', e => {
    const pos = getCanvasCoords(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  canvas.addEventListener('touchstart', e => {
    const pos = getCanvasCoords(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.active = true;
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    const pos = getCanvasCoords(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.active = true;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // UI Control Panel Event Listeners
  const modeBtn = document.getElementById('mode-toggle-btn');
  const resetBtn = document.getElementById('reset-sim-btn');
  const heatSlider = document.getElementById('heat-slider');
  const viscSlider = document.getElementById('visc-slider');

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      currentMode = currentMode === 'lavalamp' ? 'hourglass' : 'lavalamp';
      modeBtn.textContent = currentMode === 'lavalamp' ? 'Modo: Lava Lamp' : 'Modo: Ampulheta';
      initParticles();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Stir/Agitate particles violently
      particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * 8;
        p.vy = (Math.random() - 0.5) * 8;
      });
    });
  }

  if (heatSlider) {
    heatSlider.addEventListener('input', e => {
      heatPower = parseFloat(e.target.value);
    });
  }

  if (viscSlider) {
    viscSlider.addEventListener('input', e => {
      viscosity = parseFloat(e.target.value);
    });
  }

  // Start Simulation
  initParticles();
  animate();
});
