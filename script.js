/* ==========================================================================
   Sebastian Lague / The Coding Train Inspired Gas-Liquid Interface Simulator
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
  const interfaceHeight = 220; // Equilibrium free surface level
  let surfaceTension = 0.08;
  const damping = 0.95;

  // Mouse / Touch Tracking
  const mouse = {
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    prevX: -1000,
    prevY: -1000,
    isDown: false,
    radius: 65
  };

  // Particle Classes
  class InterfaceParticle {
    constructor(x, y, isLiquid = true) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.0;
      this.vy = (Math.random() - 0.5) * 1.0;
      this.radius = isLiquid ? 6.5 : 4.5;
      this.isLiquid = isLiquid; // true = Liquid (Blue), false = Gas (Sky Blue/White)
    }

    update() {
      // 1. Phase-specific Forces
      if (this.isLiquid) {
        // Downward Liquid Gravity towards liquid bed
        this.vy += 0.12;

        // Restore toward equilibrium interface height if pushed up
        if (this.y < interfaceHeight - 40) {
          this.vy += 0.25;
        }
      } else {
        // Upward Gas Buoyancy towards gas layer
        this.vy -= 0.10;

        // Restore toward gas layer if forced down into liquid
        if (this.y > interfaceHeight + 20) {
          this.vy -= 0.22;
        }
      }

      // 2. Mouse Wave & Ripple Interaction
      if (mouse.active || mouse.isDown) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const factor = (1 - dist / mouse.radius);
          this.vx += mouse.vx * factor * 0.4 + (dx / dist) * factor * 1.6;
          this.vy += mouse.vy * factor * 0.4 + (dy / dist) * factor * 1.6;
        }
      }

      // 3. Apply Damping & Velocity Update
      this.vx *= damping;
      this.vy *= damping;
      this.x += this.vx;
      this.y += this.vy;

      // 4. Chamber Boundary Collisions
      const margin = 15;
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

  // Generate Initial Liquid & Gas Particle Layers
  let particles = [];
  function initSimulation() {
    particles = [];

    // Liquid Phase (Bottom) - 240 particles
    for (let i = 0; i < 240; i++) {
      const x = 30 + Math.random() * (width - 60);
      const y = interfaceHeight + Math.random() * (height - interfaceHeight - 40);
      particles.push(new InterfaceParticle(x, y, true));
    }

    // Gas Phase (Top) - 120 particles
    for (let i = 0; i < 120; i++) {
      const x = 30 + Math.random() * (width - 60);
      const y = 30 + Math.random() * (interfaceHeight - 50);
      particles.push(new InterfaceParticle(x, y, false));
    }
  }

  // Inter-particle Cohesion & Interfacial Wave Physics
  function applyParticlePhysics() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist * 2.2 && dist > 0) {
          // Same phase cohesion (Liquid-Liquid or Gas-Gas)
          if (p1.isLiquid === p2.isLiquid) {
            const attract = (minDist * 2.2 - dist) * surfaceTension;
            p1.vx += (dx / dist) * attract;
            p1.vy += (dy / dist) * attract;
            p2.vx -= (dx / dist) * attract;
            p2.vy -= (dy / dist) * attract;
          }

          // Elastic repulsion when overlapping
          if (dist < minDist) {
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

  // Inject Gas Bubble into Liquid Bed (Click Action)
  function injectBubble(clickX, clickY) {
    const bubbleY = Math.max(interfaceHeight + 60, clickY);
    for (let i = 0; i < 15; i++) {
      const p = new InterfaceParticle(
        clickX + (Math.random() - 0.5) * 25,
        bubbleY + (Math.random() - 0.5) * 25,
        false // Gas particle
      );
      p.vy = -3.5 - Math.random() * 2.0; // High upward buoyancy blast
      particles.push(p);
    }
  }

  // Generate Wave Splash on Free Surface
  function createSplash(splashX) {
    particles.forEach(p => {
      if (p.isLiquid) {
        const dx = p.x - splashX;
        const dist = Math.abs(dx);
        if (dist < 80) {
          const waveForce = (1 - dist / 80) * 8.0;
          p.vy -= waveForce;
          p.vx += (dx > 0 ? 1 : -1) * waveForce * 0.5;
        }
      }
    });
  }

  // Render Gas-Liquid Interface Surface Line
  function drawInterfaceLine() {
    // Sort liquid particles by X near the free surface to draw a smooth wavy line
    const surfaceParticles = particles
      .filter(p => p.isLiquid && Math.abs(p.y - interfaceHeight) < 60)
      .sort((a, b) => a.x - b.x);

    if (surfaceParticles.length > 2) {
      ctx.beginPath();
      ctx.moveTo(surfaceParticles[0].x, surfaceParticles[0].y);
      for (let i = 1; i < surfaceParticles.length - 1; i++) {
        const xc = (surfaceParticles[i].x + surfaceParticles[i + 1].x) / 2;
        const yc = (surfaceParticles[i].y + surfaceParticles[i + 1].y) / 2;
        ctx.quadraticCurveTo(surfaceParticles[i].x, surfaceParticles[i].y, xc, yc);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  // Render Chamber & Particles
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Chamber outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, 16);
    ctx.stroke();

    // Gas Phase Ambient Tint (Top)
    ctx.fillStyle = 'rgba(224, 242, 254, 0.03)';
    ctx.fillRect(12, 12, width - 24, interfaceHeight - 12);

    // Liquid Phase Ambient Tint (Bottom)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
    ctx.fillRect(12, interfaceHeight, width - 24, height - interfaceHeight - 12);

    // Render Particles
    ctx.globalCompositeOperation = 'screen';
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 1.4, 0, Math.PI * 2);

      if (p.isLiquid) {
        // Deep Liquid Cyan/Blue (#0284c7)
        ctx.fillStyle = 'rgba(2, 132, 199, 0.75)';
      } else {
        // Translucent Sky-Blue Gas (#e0f2fe)
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      }
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    // Particle cores for crisp Sebastian Lague visual feel
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = p.isLiquid ? '#38bdf8' : '#ffffff';
      ctx.fill();
    });

    // Draw Interface Wave Line
    drawInterfaceLine();

    // Draw Mouse Ripple Circle
    if (mouse.active || mouse.isDown) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  // 60 FPS Loop
  function animate() {
    applyParticlePhysics();

    particles.forEach(p => {
      p.update();
    });

    render();

    requestAnimationFrame(animate);
  }

  // Mouse & Touch Coordinates
  function updateMouseCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currX = (clientX - rect.left) * scaleX;
    const currY = (clientY - rect.top) * scaleY;

    if (mouse.prevX !== -1000) {
      mouse.vx = currX - mouse.prevX;
      mouse.vy = currY - mouse.prevY;
    }

    mouse.x = currX;
    mouse.y = currY;
    mouse.prevX = currX;
    mouse.prevY = currY;
    mouse.active = true;
  }

  // Event Listeners
  canvas.addEventListener('mousemove', e => {
    updateMouseCoords(e);
  });

  canvas.addEventListener('mousedown', e => {
    mouse.isDown = true;
    updateMouseCoords(e);
    // Inject Gas Bubble on Click
    injectBubble(mouse.x, mouse.y);
  });

  window.addEventListener('mouseup', () => {
    mouse.isDown = false;
    mouse.vx = 0;
    mouse.vy = 0;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.isDown = false;
    mouse.prevX = -1000;
  });

  // Touch Support
  canvas.addEventListener('touchstart', e => {
    mouse.isDown = true;
    updateMouseCoords(e);
    injectBubble(mouse.x, mouse.y);
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    updateMouseCoords(e);
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.isDown = false;
    mouse.active = false;
  });

  // UI Control Panel Event Listeners
  const bubbleBtn = document.getElementById('bubble-btn');
  const splashBtn = document.getElementById('splash-btn');
  const tensionSlider = document.getElementById('tension-slider');
  const resetBtn = document.getElementById('reset-btn');

  if (bubbleBtn) {
    bubbleBtn.addEventListener('click', () => {
      injectBubble(width / 2, height - 60);
    });
  }

  if (splashBtn) {
    splashBtn.addEventListener('click', () => {
      createSplash(width / 2);
    });
  }

  if (tensionSlider) {
    tensionSlider.addEventListener('input', e => {
      surfaceTension = parseFloat(e.target.value);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initSimulation();
    });
  }

  // Start Simulation
  initSimulation();
  animate();
});
