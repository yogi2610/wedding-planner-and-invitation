/**
 * invitation-core.js - Engine Interaksi & Penampil Undangan Publik Terpadu (Tahap A)
 * MenikahBersama - All-in-One Wedding Planner & Digital Invitation Platform (menikahbersama.my.id)
 */

// ============================================================================
// 1. MESIN PARTIKEL JATUH BERGERAK HALUS (PARTICLE ENGINE)
// ============================================================================
class ParticleEngine {
  constructor(canvasId = 'particle-canvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.effect = 'none';
    this.physics = 'breeze_right'; // 'breeze_right' | 'flutter_wide' | 'float_up' | 'soft_swirl'
    this.layer = 'behind'; // 'behind' | 'front'
    this.width = 0;
    this.height = 0;
    this.isRunning = false;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || Math.min(window.innerWidth, 448);
    this.height = rect.height || window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  setPhysics(physicsMode) {
    this.physics = physicsMode || 'breeze_right';
    if (this.isRunning) {
      this.initParticles();
    }
  }

  setLayer(layer) {
    this.layer = layer || 'behind';
    if (!this.canvas) return;
    if (this.layer === 'front') {
      this.canvas.classList.remove('particle-behind');
      this.canvas.classList.add('particle-front');
    } else {
      this.canvas.classList.remove('particle-front');
      this.canvas.classList.add('particle-behind');
    }
  }

  setEffect(effectName) {
    this.effect = effectName || 'none';
    this.particles = [];
    if (this.effect === 'none') {
      this.stop();
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    } else {
      this.resize();
      this.initParticles();
      this.start();
    }
  }

  initParticles() {
    this.particles = [];
    const count = this.effect === 'gold_dust' ? 36 : (this.effect === 'snow' ? 38 : 26);
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    let x, y;
    if (this.physics === 'float_up') {
      y = randomY ? Math.random() * this.height : (this.height + 15 + Math.random() * 25);
      x = Math.random() * (this.width || 400);
    } else if (this.physics === 'breeze_right') {
      if (randomY) {
        y = Math.random() * this.height;
        x = -30 + Math.random() * ((this.width || 400) + 40);
      } else {
        // Sebagian muncul dari atas, sebagian dari sisi kiri untuk tiupan sepoi alami
        if (Math.random() < 0.65) {
          y = -25 - Math.random() * 20;
          x = -30 + Math.random() * ((this.width || 400) + 20);
        } else {
          x = -20 - Math.random() * 20;
          y = Math.random() * (this.height * 0.7);
        }
      }
    } else {
      // flutter_wide & soft_swirl
      y = randomY ? Math.random() * this.height : (-20 - Math.random() * 25);
      x = -20 + Math.random() * ((this.width || 400) + 40);
    }

    const depthScale = 0.7 + Math.random() * 0.6; // Variasi ukuran depth-of-field 3D

    if (this.effect === 'petals') {
      const colors = [
        'rgba(244, 182, 205, 0.78)',
        'rgba(235, 130, 160, 0.72)',
        'rgba(255, 225, 235, 0.88)',
        'rgba(217, 119, 155, 0.68)'
      ];
      return {
        type: 'petal',
        x, y,
        size: (7 + Math.random() * 8) * depthScale,
        speedY: (0.75 + Math.random() * 1.0) * depthScale,
        speedX: this.physics === 'breeze_right' ? (0.6 + Math.random() * 1.0) : (-0.3 + Math.random() * 0.6),
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.015 + Math.random() * 0.025,
        swayFreq: 0.02 + Math.random() * 0.02,
        swayAmp: (1.5 + Math.random() * 1.8) * depthScale,
        pulse: Math.random() * 100,
        depthScale,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    if (this.effect === 'leaves') {
      const colors = [
        'rgba(107, 142, 120, 0.78)',
        'rgba(142, 168, 157, 0.72)',
        'rgba(180, 131, 66, 0.68)',
        'rgba(198, 107, 78, 0.68)'
      ];
      return {
        type: 'leaf',
        x, y,
        size: (8 + Math.random() * 8) * depthScale,
        speedY: (0.85 + Math.random() * 1.1) * depthScale,
        speedX: this.physics === 'breeze_right' ? (0.7 + Math.random() * 1.1) : (-0.3 + Math.random() * 0.6),
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.018 + Math.random() * 0.025,
        swayFreq: 0.02 + Math.random() * 0.02,
        swayAmp: (1.6 + Math.random() * 2.0) * depthScale,
        pulse: Math.random() * 100,
        depthScale,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    if (this.effect === 'gold_dust') {
      const colors = [
        '#FDE047',
        '#EAB308',
        '#F59E0B',
        '#D4AF37'
      ];
      return {
        type: 'sparkle',
        x, y,
        size: (2.2 + Math.random() * 3.5) * depthScale,
        speedY: (this.physics === 'float_up' ? -0.55 - Math.random() * 0.8 : (0.4 + Math.random() * 0.65)) * depthScale,
        speedX: this.physics === 'breeze_right' ? (0.4 + Math.random() * 0.8) : (-0.3 + Math.random() * 0.6),
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.02 + Math.random() * 0.03,
        swayFreq: 0.015 + Math.random() * 0.02,
        swayAmp: (0.8 + Math.random() * 1.4) * depthScale,
        baseAlpha: 0.35 + Math.random() * 0.45,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.04 + Math.random() * 0.05,
        depthScale,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    if (this.effect === 'snow') {
      return {
        type: 'snow',
        x, y,
        size: (2.0 + Math.random() * 3.2) * depthScale,
        speedY: (this.physics === 'float_up' ? -0.5 - Math.random() * 0.6 : (0.55 + Math.random() * 0.9)) * depthScale,
        speedX: this.physics === 'breeze_right' ? (0.4 + Math.random() * 0.7) : (-0.3 + Math.random() * 0.6),
        angle: 0,
        swayFreq: 0.02 + Math.random() * 0.02,
        swayAmp: (0.9 + Math.random() * 1.4) * depthScale,
        pulse: Math.random() * 100,
        opacity: 0.45 + Math.random() * 0.45,
        depthScale
      };
    }

    return { x, y, size: 2, speedY: 1, speedX: 0, pulse: 0 };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const loop = () => {
      this.update();
      this.draw();
      if (this.isRunning) {
        this.animId = requestAnimationFrame(loop);
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.pulse += p.pulseSpeed || 0.03;
      p.angle += p.angularSpeed || 0;

      // Update posisi sesuai pilihan Fisika Animasi
      if (this.physics === 'float_up') {
        p.y -= Math.abs(p.speedY);
        p.x += (p.speedX || 0) + Math.sin(p.pulse) * (p.swayAmp || 1);
        if (p.y < -30) {
          this.particles[i] = this.createParticle(false);
        }
      } else if (this.physics === 'breeze_right') {
        p.y += p.speedY;
        p.x += p.speedX + (Math.sin(p.pulse) * (p.swayAmp * 0.5) + 0.75);
        if (p.y > this.height + 30 || p.x > this.width + 40) {
          this.particles[i] = this.createParticle(false);
        }
      } else if (this.physics === 'flutter_wide') {
        p.y += p.speedY;
        p.x += (p.speedX || 0) + Math.sin(p.pulse) * (p.swayAmp * 1.8);
        p.angle = Math.sin(p.pulse * 0.85) * 0.75;
        if (p.y > this.height + 30) {
          this.particles[i] = this.createParticle(false);
        }
      } else if (this.physics === 'soft_swirl') {
        p.y += p.speedY;
        p.x += Math.sin(p.pulse) * (p.swayAmp * 1.3) + Math.cos(p.pulse * 0.5) * (p.swayAmp * 0.5);
        if (p.y > this.height + 30) {
          this.particles[i] = this.createParticle(false);
        }
      } else {
        // Default standard
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.pulse) * (p.swayAmp || 1);
        if (p.y > this.height + 25 || p.x < -30 || p.x > this.width + 30) {
          this.particles[i] = this.createParticle(false);
        }
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (p.type === 'petal') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        this.ctx.scale(Math.cos(p.angle * 1.3), 1);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.5, p.size * 0.85, p.size * 0.85, 0, p.size);
        this.ctx.bezierCurveTo(-p.size * 0.85, p.size * 0.85, -p.size * 0.85, -p.size * 0.5, 0, -p.size);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.restore();
      } else if (p.type === 'leaf') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        this.ctx.scale(Math.cos(p.angle * 1.1), 1);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 1.3);
        this.ctx.quadraticCurveTo(p.size * 0.75, 0, 0, p.size * 1.3);
        this.ctx.quadraticCurveTo(-p.size * 0.75, 0, 0, -p.size * 1.3);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size * 1.1);
        this.ctx.lineTo(0, p.size * 1.1);
        this.ctx.stroke();
        this.ctx.restore();
      } else if (p.type === 'sparkle') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        const alpha = Math.max(0.1, Math.min(1, p.baseAlpha + Math.sin(p.pulse) * 0.35));
        this.ctx.globalAlpha = alpha;
        // Radial glow
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.4)');
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        // 4-point star core
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.quadraticCurveTo(0, 0, p.size, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, p.size);
        this.ctx.quadraticCurveTo(0, 0, -p.size, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -p.size);
        this.ctx.fill();
        this.ctx.restore();
      } else if (p.type === 'snow') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.globalAlpha = p.opacity;
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }
}

// ============================================================================
// 2. KATALOG ORNAMEN SVG BERGERAK UNTUK 8 TEMA PRESET (ORNAMENT THEMES)
// ============================================================================
const ORNAMENT_THEMES = {
  'minimalist-sage': {
    // 1. Eucalyptus & Olive branches with small white flowers
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <path d="M0 0 C25 15, 50 35, 80 75" stroke="#5A7D66" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M18 12 C12 6, 26 2, 32 8 C36 14, 28 18, 18 12 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M36 26 C30 18, 44 14, 50 20 C54 26, 46 32, 36 26 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M56 46 C48 38, 62 34, 68 40 C72 46, 64 52, 56 46 Z" fill="#6B8E78" opacity="0.9"/>
        <g class="sway-right">
          <path d="M10 20 C4 18, 8 32, 16 28 C22 24, 16 18, 10 20 Z" fill="#8EA89D" opacity="0.85"/>
          <path d="M26 36 C18 32, 24 48, 32 44 C38 40, 32 34, 26 36 Z" fill="#8EA89D" opacity="0.85"/>
          <path d="M44 58 C36 52, 42 68, 52 62 C58 56, 50 50, 44 58 Z" fill="#8EA89D" opacity="0.85"/>
        </g>
        <circle cx="30" cy="14" r="2.8" fill="#FFFFFF"/>
        <circle cx="30" cy="14" r="1.2" fill="#E2B170"/>
        <circle cx="48" cy="32" r="2.8" fill="#FFFFFF"/>
        <circle cx="48" cy="32" r="1.2" fill="#E2B170"/>
        <circle cx="66" cy="52" r="2.5" fill="#FFFFFF"/>
        <circle cx="66" cy="52" r="1" fill="#E2B170"/>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 0 C25 15, 50 35, 80 75" stroke="#5A7D66" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M18 12 C12 6, 26 2, 32 8 C36 14, 28 18, 18 12 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M36 26 C30 18, 44 14, 50 20 C54 26, 46 32, 36 26 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M56 46 C48 38, 62 34, 68 40 C72 46, 64 52, 56 46 Z" fill="#6B8E78" opacity="0.9"/>
        <g class="sway-left">
          <path d="M10 20 C4 18, 8 32, 16 28 C22 24, 16 18, 10 20 Z" fill="#8EA89D" opacity="0.85"/>
          <path d="M26 36 C18 32, 24 48, 32 44 C38 40, 32 34, 26 36 Z" fill="#8EA89D" opacity="0.85"/>
        </g>
        <circle cx="30" cy="14" r="2.8" fill="#FFFFFF"/>
        <circle cx="30" cy="14" r="1.2" fill="#E2B170"/>
        <circle cx="48" cy="32" r="2.8" fill="#FFFFFF"/>
        <circle cx="48" cy="32" r="1.2" fill="#E2B170"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <path d="M0 0 C25 15, 50 35, 80 75" stroke="#5A7D66" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M18 12 C12 6, 26 2, 32 8 C36 14, 28 18, 18 12 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M36 26 C30 18, 44 14, 50 20 C54 26, 46 32, 36 26 Z" fill="#6B8E78" opacity="0.9"/>
        <circle cx="30" cy="14" r="2.8" fill="#FFFFFF"/>
        <circle cx="30" cy="14" r="1.2" fill="#E2B170"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <path d="M0 0 C25 15, 50 35, 80 75" stroke="#5A7D66" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M18 12 C12 6, 26 2, 32 8 C36 14, 28 18, 18 12 Z" fill="#6B8E78" opacity="0.9"/>
        <path d="M36 26 C30 18, 44 14, 50 20 C54 26, 46 32, 36 26 Z" fill="#6B8E78" opacity="0.9"/>
        <circle cx="30" cy="14" r="2.8" fill="#FFFFFF"/>
        <circle cx="30" cy="14" r="1.2" fill="#E2B170"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-7" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 5 C50 20, 35 28, 10 20 C30 35, 52 32, 60 38 C68 32, 90 35, 110 20 C85 28, 70 20, 60 5 Z" fill="#6B8E78" opacity="0.8"/>
      <circle cx="60" cy="22" r="3" fill="#D4AF37"/>
    </svg>`
  },

  'cozy-terracotta': {
    // 2. Dried pampas, boho palm & terracotta roses
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <!-- Boho Palm Fan lines -->
        <path d="M0 0 C20 30, 45 45, 80 50" stroke="#C66B4E" stroke-width="1.5"/>
        <path d="M0 0 C30 20, 50 35, 75 70" stroke="#C66B4E" stroke-width="1.5"/>
        <path d="M0 0 C15 35, 30 55, 55 80" stroke="#D98A6C" stroke-width="1.5"/>
        <!-- Dried pampas plumes -->
        <g class="sway-right">
          <path d="M30 20 Q45 28 65 24 Q50 34 30 20 Z" fill="#E2B170" opacity="0.75"/>
          <path d="M45 40 Q65 48 85 40 Q68 55 45 40 Z" fill="#D98A6C" opacity="0.8"/>
        </g>
        <!-- Terracotta Rosebud -->
        <circle cx="35" cy="35" r="9" fill="#C66B4E" opacity="0.9"/>
        <circle cx="33" cy="33" r="5" fill="#8C432A"/>
        <circle cx="35" cy="34" r="2.5" fill="#E2B170"/>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 0 C20 30, 45 45, 80 50" stroke="#C66B4E" stroke-width="1.5"/>
        <path d="M0 0 C30 20, 50 35, 75 70" stroke="#C66B4E" stroke-width="1.5"/>
        <g class="sway-left">
          <path d="M30 20 Q45 28 65 24 Q50 34 30 20 Z" fill="#E2B170" opacity="0.75"/>
          <path d="M45 40 Q65 48 85 40 Q68 55 45 40 Z" fill="#D98A6C" opacity="0.8"/>
        </g>
        <circle cx="35" cy="35" r="9" fill="#C66B4E" opacity="0.9"/>
        <circle cx="33" cy="33" r="5" fill="#8C432A"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <path d="M0 0 C20 30, 45 45, 80 50" stroke="#C66B4E" stroke-width="1.5"/>
        <circle cx="35" cy="35" r="8" fill="#C66B4E" opacity="0.9"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <path d="M0 0 C20 30, 45 45, 80 50" stroke="#C66B4E" stroke-width="1.5"/>
        <circle cx="35" cy="35" r="8" fill="#C66B4E" opacity="0.9"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-8" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 60 A45 45 0 0 1 105 60" stroke="#C66B4E" stroke-width="2"/>
      <path d="M30 60 A30 30 0 0 1 90 60" stroke="#E2B170" stroke-width="1.5"/>
      <circle cx="60" cy="22" r="4" fill="#C66B4E"/>
    </svg>`
  },

  'javanese-royal': {
    // 3. Golden Keraton Carvings, Jasmine (Melati), & Twin Gunungan Wayang
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <!-- Ukiran Keraton Emas -->
        <path d="M0 0 C30 5, 55 25, 75 55 C65 58, 55 50, 48 40 C40 30, 25 20, 0 20 Z" fill="#D4AF37" opacity="0.85"/>
        <path d="M5 5 Q35 15 50 35 Q30 30 5 5 Z" fill="#F3E5AB" opacity="0.9"/>
        <!-- Rangkaian Melati -->
        <g class="sway-right">
          <circle cx="48" cy="40" r="3" fill="#FFFFFF"/>
          <circle cx="48" cy="40" r="1.2" fill="#D4AF37"/>
          <circle cx="62" cy="54" r="3" fill="#FFFFFF"/>
          <circle cx="62" cy="54" r="1.2" fill="#D4AF37"/>
          <circle cx="76" cy="70" r="2.8" fill="#FFFFFF"/>
          <circle cx="76" cy="70" r="1" fill="#D4AF37"/>
        </g>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 0 C30 5, 55 25, 75 55 C65 58, 55 50, 48 40 C40 30, 25 20, 0 20 Z" fill="#D4AF37" opacity="0.85"/>
        <path d="M5 5 Q35 15 50 35 Q30 30 5 5 Z" fill="#F3E5AB" opacity="0.9"/>
        <g class="sway-left">
          <circle cx="48" cy="40" r="3" fill="#FFFFFF"/>
          <circle cx="48" cy="40" r="1.2" fill="#D4AF37"/>
          <circle cx="62" cy="54" r="3" fill="#FFFFFF"/>
          <circle cx="62" cy="54" r="1.2" fill="#D4AF37"/>
        </g>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <path d="M0 0 C30 5, 55 25, 75 55 C65 58, 55 50, 48 40 C40 30, 25 20, 0 20 Z" fill="#D4AF37" opacity="0.85"/>
        <circle cx="48" cy="40" r="3" fill="#FFFFFF"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <path d="M0 0 C30 5, 55 25, 75 55 C65 58, 55 50, 48 40 C40 30, 25 20, 0 20 Z" fill="#D4AF37" opacity="0.85"/>
        <circle cx="48" cy="40" r="3" fill="#FFFFFF"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-20 h-10" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ornamen Mahkota Keraton / Batikan -->
      <path d="M70 5 L85 28 L115 32 L92 45 L98 60 L70 48 L42 60 L48 45 L25 32 L55 28 Z" fill="#D4AF37" opacity="0.85"/>
      <circle cx="70" cy="30" r="4" fill="#FFFFFF"/>
    </svg>`,
    // Gunungan Wayang Kembar untuk Sampul Depan
    gununganLeft: `<svg class="w-44 h-80 drop-shadow-2xl" viewBox="0 0 180 340" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="45%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#996515"/>
        </linearGradient>
      </defs>
      <!-- Siluet Gunungan Wayang Kiri -->
      <path d="M175 10 C165 40, 140 80, 110 110 C80 140, 40 170, 20 210 C5 240, 5 280, 10 320 L175 320 Z" fill="url(#goldGradL)" opacity="0.95"/>
      <path d="M165 25 C155 55, 130 92, 105 120 C78 148, 45 178, 28 215 C16 242, 16 275, 20 310 L165 310 Z" stroke="#1C1613" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Detail Pohon Hayat & Ukiran -->
      <path d="M175 160 C150 160, 130 180, 120 210 C130 230, 160 235, 175 235" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>
      <path d="M175 250 C145 250, 120 265, 110 295 C130 305, 160 305, 175 305" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>
    </svg>`,
    gununganRight: `<svg class="w-44 h-80 drop-shadow-2xl transform scale-x-[-1]" viewBox="0 0 180 340" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradR" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="45%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#996515"/>
        </linearGradient>
      </defs>
      <path d="M175 10 C165 40, 140 80, 110 110 C80 140, 40 170, 20 210 C5 240, 5 280, 10 320 L175 320 Z" fill="url(#goldGradR)" opacity="0.95"/>
      <path d="M165 25 C155 55, 130 92, 105 120 C78 148, 45 178, 28 215 C16 242, 16 275, 20 310 L165 310 Z" stroke="#1C1613" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M175 160 C150 160, 130 180, 120 210 C130 230, 160 235, 175 235" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>
      <path d="M175 250 C145 250, 120 265, 110 295 C130 305, 160 305, 175 305" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>
    </svg>`
  },

  'romantic-blush': {
    // 4. Blooming Peony & Pink Roses
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <!-- Daun mawar -->
        <path d="M10 25 C2 15, 20 5, 28 15 C34 22, 22 30, 10 25 Z" fill="#5E7D63" opacity="0.85"/>
        <path d="M25 45 C15 38, 30 25, 40 32 C45 40, 35 48, 25 45 Z" fill="#5E7D63" opacity="0.85"/>
        <!-- Kelopak Peony Berlapis -->
        <circle cx="36" cy="32" r="14" fill="#F4B6CD" opacity="0.85"/>
        <g class="sway-right">
          <circle cx="38" cy="30" r="10" fill="#D9779B" opacity="0.85"/>
          <circle cx="39" cy="28" r="6" fill="#AA4D70"/>
          <circle cx="40" cy="28" r="2.5" fill="#FFE4E6"/>
        </g>
        <!-- Kuncup bunga samping -->
        <circle cx="60" cy="48" r="7" fill="#F4B6CD" opacity="0.9"/>
        <circle cx="62" cy="47" r="4" fill="#D9779B"/>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M10 25 C2 15, 20 5, 28 15 C34 22, 22 30, 10 25 Z" fill="#5E7D63" opacity="0.85"/>
        <circle cx="36" cy="32" r="14" fill="#F4B6CD" opacity="0.85"/>
        <g class="sway-left">
          <circle cx="38" cy="30" r="10" fill="#D9779B" opacity="0.85"/>
          <circle cx="39" cy="28" r="6" fill="#AA4D70"/>
        </g>
        <circle cx="60" cy="48" r="7" fill="#F4B6CD" opacity="0.9"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <circle cx="36" cy="32" r="12" fill="#F4B6CD" opacity="0.85"/>
        <circle cx="38" cy="30" r="8" fill="#D9779B"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <circle cx="36" cy="32" r="12" fill="#F4B6CD" opacity="0.85"/>
        <circle cx="38" cy="30" r="8" fill="#D9779B"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-7" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 20 C45 5, 20 20, 35 35 C50 30, 55 25, 60 20 Z" fill="#F4B6CD" opacity="0.9"/>
      <path d="M60 20 C75 5, 100 20, 85 35 C70 30, 65 25, 60 20 Z" fill="#F4B6CD" opacity="0.9"/>
      <circle cx="60" cy="20" r="5" fill="#D9779B"/>
    </svg>`
  },

  'luxury-midnight': {
    // 5. Art Deco Golden Frame & Crystal Leaves
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <path d="M0 0 L40 0 L0 40 Z" fill="#CA8A04" opacity="0.4"/>
        <path d="M5 5 L60 5 L5 60 Z" stroke="#EAB308" stroke-width="1.5" fill="none"/>
        <path d="M12 12 L45 12 L12 45 Z" stroke="#FDE047" stroke-width="1.2" fill="none"/>
        <!-- Daun Kristal Emas -->
        <g class="sway-right">
          <polygon points="45,20 60,10 65,25 50,30" fill="#FDE047" opacity="0.85"/>
          <polygon points="20,45 10,60 25,65 30,50" fill="#FDE047" opacity="0.85"/>
          <circle cx="50" cy="50" r="3" fill="#FFFFFF"/>
        </g>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 0 L40 0 L0 40 Z" fill="#CA8A04" opacity="0.4"/>
        <path d="M5 5 L60 5 L5 60 Z" stroke="#EAB308" stroke-width="1.5" fill="none"/>
        <polygon points="45,20 60,10 65,25 50,30" fill="#FDE047" opacity="0.85"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <path d="M5 5 L50 5 L5 50 Z" stroke="#EAB308" stroke-width="1.5" fill="none"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <path d="M5 5 L50 5 L5 50 Z" stroke="#EAB308" stroke-width="1.5" fill="none"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-7" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,5 75,20 60,35 45,20" stroke="#EAB308" stroke-width="1.8" fill="none"/>
      <circle cx="60" cy="20" r="3" fill="#FDE047"/>
      <line x1="10" y1="20" x2="40" y2="20" stroke="#CA8A04" stroke-width="1"/>
      <line x1="80" y1="20" x2="110" y2="20" stroke="#CA8A04" stroke-width="1"/>
    </svg>`
  },

  'modern-monochrome': {
    // 6. Architectural minimal curves & Calla Lily
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <path d="M0 45 C45 45, 45 0, 45 0" stroke="#18181B" stroke-width="2"/>
        <path d="M0 65 C65 65, 65 0, 65 0" stroke="#71717A" stroke-width="1.2"/>
        <!-- Calla Lily petal contour -->
        <g class="sway-right">
          <path d="M25 25 C15 35, 30 50, 45 40 C40 30, 30 20, 25 25 Z" fill="#27272A" opacity="0.85"/>
          <circle cx="36" cy="34" r="2.5" fill="#D4AF37"/>
        </g>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 45 C45 45, 45 0, 45 0" stroke="#18181B" stroke-width="2"/>
        <path d="M0 65 C65 65, 65 0, 65 0" stroke="#71717A" stroke-width="1.2"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 45 C45 45, 45 0, 45 0" stroke="#18181B" stroke-width="1.5"/>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 45 C45 45, 45 0, 45 0" stroke="#18181B" stroke-width="1.5"/>
    </svg>`,
    headerMotif: `<svg class="w-16 h-4" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="10" x2="50" y2="10" stroke="#18181B" stroke-width="1.5"/>
      <circle cx="60" cy="10" r="3" fill="#18181B"/>
      <line x1="70" y1="10" x2="110" y2="10" stroke="#18181B" stroke-width="1.5"/>
    </svg>`
  },

  'rustic-woodland': {
    // 7. Pine needles, woodland ferns & wildflowers
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <!-- Ranting pinus -->
        <path d="M0 0 C25 20, 50 35, 80 60" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/>
        <!-- Jarum pinus -->
        <path d="M20 15 L32 8 M20 15 L30 18 M20 15 L22 28" stroke="#4A6B53" stroke-width="1.5"/>
        <path d="M40 30 L52 22 M40 30 L50 34 M40 30 L42 42" stroke="#4A6B53" stroke-width="1.5"/>
        <!-- Pakis hutan -->
        <g class="sway-right">
          <path d="M15 35 C5 45, 25 55, 35 45 C40 38, 25 30, 15 35 Z" fill="#2D4A3E" opacity="0.85"/>
          <!-- Bunga liar kuning -->
          <circle cx="48" cy="46" r="3.2" fill="#FEF08A"/>
          <circle cx="48" cy="46" r="1.3" fill="#8B5E3C"/>
        </g>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M0 0 C25 20, 50 35, 80 60" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 15 L32 8 M20 15 L30 18" stroke="#4A6B53" stroke-width="1.5"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <path d="M0 0 C25 20, 50 35, 80 60" stroke="#8B5E3C" stroke-width="1.8"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <path d="M0 0 C25 20, 50 35, 80 60" stroke="#8B5E3C" stroke-width="1.8"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-7" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 20 Q60 5 90 20" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/>
      <circle cx="60" cy="12" r="3.5" fill="#FEF08A"/>
      <circle cx="60" cy="12" r="1.5" fill="#8B5E3C"/>
    </svg>`
  },

  'whimsical-fairy': {
    // 8. Cascading purple wisteria & twinkling fairy stars
    cornerTL: `<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-left">
        <!-- Tangkai wisteria menjuntai -->
        <path d="M10 0 Q30 25 25 60 Q20 80 15 95" stroke="#7C3AED" stroke-width="1.5"/>
        <path d="M30 0 Q50 35 45 75" stroke="#7C3AED" stroke-width="1.3"/>
        <!-- Rangkaian bulir bunga ungu wisteria -->
        <g class="sway-right">
          <circle cx="26" cy="30" r="4.5" fill="#C4B5FD" opacity="0.9"/>
          <circle cx="24" cy="42" r="4" fill="#A78BFA" opacity="0.9"/>
          <circle cx="21" cy="54" r="3.5" fill="#8B5CF6"/>
          <circle cx="18" cy="66" r="3" fill="#7C3AED"/>
          <circle cx="45" cy="40" r="4" fill="#C4B5FD" opacity="0.9"/>
          <circle cx="43" cy="52" r="3.5" fill="#A78BFA"/>
        </g>
        <!-- Bintang peri berkilau -->
        <polygon points="50,15 53,22 60,25 53,28 50,35 47,28 40,25 47,22" fill="#FFFFFF"/>
        <polygon points="70,40 72,45 77,47 72,49 70,54 68,49 63,47 68,45" fill="#FFFFFF"/>
      </g>
    </svg>`,
    cornerTR: `<svg class="w-full h-full transform scale-x-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-top-right">
        <path d="M10 0 Q30 25 25 60" stroke="#7C3AED" stroke-width="1.5"/>
        <circle cx="26" cy="30" r="4.5" fill="#C4B5FD"/>
        <circle cx="24" cy="42" r="4" fill="#A78BFA"/>
        <polygon points="50,15 53,22 60,25 53,28 50,35 47,28 40,25 47,22" fill="#FFFFFF"/>
      </g>
    </svg>`,
    cornerBL: `<svg class="w-full h-full transform scale-y-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-left">
        <circle cx="26" cy="30" r="4" fill="#C4B5FD"/>
        <polygon points="40,25 43,30 48,32 43,34 40,39 37,34 32,32 37,30" fill="#FFFFFF"/>
      </g>
    </svg>`,
    cornerBR: `<svg class="w-full h-full transform scale-[-1]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="sway-right">
        <circle cx="26" cy="30" r="4" fill="#C4B5FD"/>
        <polygon points="40,25 43,30 48,32 43,34 40,39 37,34 32,32 37,30" fill="#FFFFFF"/>
      </g>
    </svg>`,
    headerMotif: `<svg class="w-16 h-7" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,8 63,18 73,20 63,22 60,32 57,22 47,20 57,18" fill="#FFFFFF"/>
      <circle cx="35" cy="20" r="3" fill="#C4B5FD"/>
      <circle cx="85" cy="20" r="3" fill="#C4B5FD"/>
    </svg>`
  }
};

// ============================================================================
// 3. INVITATION ENGINE UTAMA (KELAS LENGKAP)
// ============================================================================
class InvitationEngine {
  constructor() {
    this.wedding = null;
    this.template = null;
    this.slug = null;
    this.guestName = 'Tamu Kehormatan';
    this.isPlayingAudio = false;
    this.audioElement = null;
    this.countdownInterval = null;
    this.particleEngine = null;
    this.scrollObserver = null;
    this.scrollSpyObserver = null;
  }

  /**
   * Inisialisasi engine saat halaman dimuat
   */
  async init() {
    try {
      this.extractParams();
      this.initAudioController();
      this.initLightbox();
      this.initParticleEngine();
      this.initLivePreviewListener();

      const success = await this.loadWeddingData();
      if (!success) return;

      this.applyThemeColors();
      this.applyTemplateStyles();
      this.applyPhotoFrameShape();
      this.applyCoverPhotoAndFrame();
      this.renderThemeOrnaments();
      this.initParticleEffect();

      this.renderCoverSection();
      this.renderCoupleSection();
      this.renderQuotesSection();
      this.renderCountdownSection();
      this.renderEventsSection();
      this.renderLoveStorySection();
      this.renderGallerySection();
      this.renderEnvelopesSection();
      this.renderRsvpSection();
      this.loadWishes();
      this.applySectionVisibility();

      this.applyCardAnimations();
      this.initScrollAnimations();
      this.initScrollSpy();

      // Inisialisasi Lucide Icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (err) {
      console.error('Initialization error in InvitationEngine:', err);
      this.showErrorNotice('Terjadi kesalahan saat memuat undangan: ' + err.message);
    }
  }

  /**
   * Ekstrak slug dan nama tamu dari URL
   */
  extractParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Dapatkan slug (dari ?slug= ATAU dari path /u/:slug)
    let slug = urlParams.get('slug');
    if (!slug) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const uIndex = pathParts.indexOf('u');
      if (uIndex !== -1 && pathParts[uIndex + 1]) {
        slug = pathParts[uIndex + 1];
      } else if (pathParts.length > 0) {
        const last = pathParts[pathParts.length - 1];
        if (last !== 'u.html' && last !== 'u') {
          slug = last;
        }
      }
    }
    this.slug = slug ? slug.trim() : null;

    // 2. Dapatkan nama tamu dari parameter ?to= atau ?dear=
    const toParam = urlParams.get('to') || urlParams.get('dear');
    if (toParam) {
      try {
        this.guestName = decodeURIComponent(toParam.replace(/\+/g, ' ')).trim();
      } catch (e) {
        this.guestName = toParam.trim();
      }
    }
  }

  /**
   * Inisialisasi canvas partikel
   */
  initParticleEngine() {
    try {
      this.particleEngine = new ParticleEngine('particle-canvas');
    } catch (e) {
      console.warn('Particle engine init notice:', e);
    }
  }

  initParticleEffect() {
    if (!this.particleEngine) return;
    const tplSlug = this.template?.slug || 'minimalist-sage';
    const custom = this.wedding?.custom_theme_json || {};
    const effect = custom.particle_effect || this.getDefaultParticleEffect(tplSlug);
    const physics = custom.particle_physics || 'breeze_right';
    const layer = custom.particle_layer || 'behind';

    this.particleEngine.setLayer(layer);
    this.particleEngine.setPhysics(physics);
    this.particleEngine.setEffect(effect);
  }

  getDefaultParticleEffect(tplSlug) {
    const defaults = {
      'minimalist-sage': 'leaves',
      'cozy-terracotta': 'leaves',
      'javanese-royal': 'gold_dust',
      'romantic-blush': 'petals',
      'luxury-midnight': 'gold_dust',
      'modern-monochrome': 'gold_dust',
      'rustic-woodland': 'leaves',
      'whimsical-fairy': 'gold_dust'
    };
    return defaults[tplSlug] || 'leaves';
  }

  /**
   * Terapkan Bentuk Bingkai Foto Mempelai (Arch, Oval Floral, Circle, Octagon)
   */
  applyPhotoFrameShape(overrideShape) {
    const tplSlug = this.template?.slug || 'minimalist-sage';
    const custom = this.wedding?.custom_theme_json || {};
    const shape = overrideShape || custom.frame_shape || this.getDefaultFrameShape(tplSlug);

    const groomFrame = document.getElementById('groom-photo-frame');
    const brideFrame = document.getElementById('bride-photo-frame');
    const groomOuter = document.getElementById('groom-frame-outer');
    const brideOuter = document.getElementById('bride-frame-outer');

    [groomFrame, brideFrame].forEach(frame => {
      if (!frame) return;
      frame.classList.remove('frame-shape-arch', 'frame-shape-oval', 'frame-shape-circle', 'frame-shape-octagon');
      frame.classList.add(`frame-shape-${shape}`);
    });

    // Tambah / Hapus ring dekoratif berputar untuk frame bentuk circle
    [groomOuter, brideOuter].forEach(outer => {
      if (!outer) return;
      const existingRing = outer.querySelector('.frame-decorative-ring');
      if (shape === 'circle') {
        if (!existingRing) {
          const ring = document.createElement('div');
          ring.className = 'frame-decorative-ring absolute -inset-2.5 rounded-full border border-dashed border-amber-400/70 pointer-events-none animate-spin-slow';
          outer.appendChild(ring);
        }
      } else {
        if (existingRing) existingRing.remove();
      }
    });
  }

  getDefaultFrameShape(tplSlug) {
    const defaults = {
      'minimalist-sage': 'arch',
      'cozy-terracotta': 'arch',
      'javanese-royal': 'octagon',
      'romantic-blush': 'oval',
      'luxury-midnight': 'octagon',
      'modern-monochrome': 'arch',
      'rustic-woodland': 'oval',
      'whimsical-fairy': 'circle'
    };
    return defaults[tplSlug] || 'arch';
  }

  /**
   * Terapkan Bingkai Foto Pengantin Besar di Sampul Depan (Cover Photo)
   */
  applyCoverPhotoAndFrame() {
    const container = document.getElementById('cover-photo-container');
    const frame = document.getElementById('cover-photo-frame');
    const img = document.getElementById('cover-photo-img');
    const ornamentEl = document.getElementById('cover-frame-ornament-el');
    if (!container || !frame || !img) return;

    const coverPhoto = this.wedding?.cover_photo;
    const custom = this.wedding?.custom_theme_json || {};
    const frameShape = custom.cover_frame_shape || 'grand_arch';
    const frameOrnament = custom.cover_frame_ornament || 'floral_wreath';
    const customFramePng = custom.custom_cover_frame_png;

    if (coverPhoto && frameShape !== 'none') {
      container.classList.remove('hidden');
      img.src = coverPhoto;

      // Bersihkan class cover-frame sebelumnya
      frame.className = frame.className
        .split(' ')
        .filter(c => !c.startsWith('cover-frame-'))
        .join(' ');
      frame.classList.add(`cover-frame-${frameShape}`);

      // Render Ornamen Hiasan Bingkai Sampul
      if (ornamentEl) {
        if (customFramePng) {
          ornamentEl.innerHTML = `<img src="${customFramePng}" alt="Bingkai Kustom" class="w-full h-full object-contain filter drop-shadow">`;
        } else if (frameOrnament === 'floral_wreath') {
          ornamentEl.innerHTML = `
            <svg class="w-full h-full text-amber-300/80 filter drop-shadow-md pointer-events-none" viewBox="0 0 200 240" fill="none" stroke="currentColor">
              <ellipse cx="100" cy="120" rx="94" ry="114" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.75" />
              <circle cx="100" cy="8" r="4" fill="currentColor" />
              <circle cx="100" cy="232" r="4" fill="currentColor" />
              <circle cx="8" cy="120" r="4" fill="currentColor" />
              <circle cx="192" cy="120" r="4" fill="currentColor" />
              <path d="M88 6 C96 2, 104 2, 112 6" stroke="currentColor" stroke-width="2" />
              <path d="M88 234 C96 238, 104 238, 112 234" stroke="currentColor" stroke-width="2" />
            </svg>
          `;
        } else if (frameOrnament === 'twin_gold_lines') {
          ornamentEl.innerHTML = `
            <div class="w-full h-full border border-amber-300/50 rounded-2xl pointer-events-none relative scale-105">
              <span class="absolute -top-1 -left-1 w-2.5 h-2.5 rotate-45 bg-amber-400 shadow-xs"></span>
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rotate-45 bg-amber-400 shadow-xs"></span>
              <span class="absolute -bottom-1 -left-1 w-2.5 h-2.5 rotate-45 bg-amber-400 shadow-xs"></span>
              <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rotate-45 bg-amber-400 shadow-xs"></span>
            </div>
          `;
        } else if (frameOrnament === 'javanese_carving') {
          ornamentEl.innerHTML = `
            <div class="w-full h-full flex flex-col justify-between items-center pointer-events-none py-1">
              <svg class="w-20 h-6 text-amber-400 filter drop-shadow" viewBox="0 0 100 30" fill="currentColor">
                <path d="M50 0 L58 14 L75 14 L62 23 L67 38 L50 28 L33 38 L38 23 L25 14 L42 14 Z" transform="scale(0.7) translate(22, -6)"/>
              </svg>
              <svg class="w-20 h-6 text-amber-400 filter drop-shadow rotate-180" viewBox="0 0 100 30" fill="currentColor">
                <path d="M50 0 L58 14 L75 14 L62 23 L67 38 L50 28 L33 38 L38 23 L25 14 L42 14 Z" transform="scale(0.7) translate(22, -6)"/>
              </svg>
            </div>
          `;
        } else {
          // minimal_clean
          ornamentEl.innerHTML = `
            <div class="w-full h-full border border-white/20 rounded-2xl pointer-events-none shadow-sm"></div>
          `;
        }
      }
    } else {
      container.classList.add('hidden');
    }
  }

  /**
   * Render Ornamen Sudut & Pembatas Bergerak (Swaying Corner Florals & Section Dividers)
   */
  renderThemeOrnaments() {
    const tplSlug = this.template?.slug || 'minimalist-sage';
    const custom = this.wedding?.custom_theme_json || {};
    const ornaments = custom.ornaments || {};
    const cornerMaster = ornaments.corner_master_png || custom.custom_ornament_url;
    const theme = ORNAMENT_THEMES[tplSlug] || ORNAMENT_THEMES['minimalist-sage'];

    // 1. Ornamen di Sampul Depan (Cover Screen)
    const coverTL = document.getElementById('cover-ornament-tl');
    const coverTR = document.getElementById('cover-ornament-tr');
    const coverBL = document.getElementById('cover-ornament-bl');
    const coverBR = document.getElementById('cover-ornament-br');
    const curtainL = document.getElementById('cover-curtain-left');
    const curtainR = document.getElementById('cover-curtain-right');

    if (cornerMaster) {
      // Mode Praktis (1 PNG Master untuk 4 Sudut dengan Mirroring Otomatis)
      if (coverTL) coverTL.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-left">`;
      if (coverTR) coverTR.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-right" style="transform: scaleX(-1);">`;
      if (coverBL) coverBL.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-left" style="transform: scaleY(-1);">`;
      if (coverBR) coverBR.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-right" style="transform: scale(-1, -1);">`;
    } else if (ornaments.corner_tl_png || ornaments.corner_tr_png || ornaments.corner_bl_png || ornaments.corner_br_png) {
      // Mode Detail (4 Sudut Terpisah)
      if (coverTL && ornaments.corner_tl_png) coverTL.innerHTML = `<img src="${ornaments.corner_tl_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-left">`;
      if (coverTR && ornaments.corner_tr_png) coverTR.innerHTML = `<img src="${ornaments.corner_tr_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-right">`;
      if (coverBL && ornaments.corner_bl_png) coverBL.innerHTML = `<img src="${ornaments.corner_bl_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-left">`;
      if (coverBR && ornaments.corner_br_png) coverBR.innerHTML = `<img src="${ornaments.corner_br_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-right">`;
    } else {
      if (coverTL) coverTL.innerHTML = theme.cornerTL;
      if (coverTR) coverTR.innerHTML = theme.cornerTR;
      if (coverBL) coverBL.innerHTML = theme.cornerBL;
      if (coverBR) coverBR.innerHTML = theme.cornerBR;
    }

    // Gunungan Kembar / Royal Curtains
    if (curtainL && curtainR) {
      if (tplSlug === 'javanese-royal' && theme.gununganLeft) {
        curtainL.innerHTML = theme.gununganLeft;
        curtainR.innerHTML = theme.gununganRight;
        curtainL.classList.remove('hidden');
        curtainR.classList.remove('hidden');
      } else {
        curtainL.innerHTML = '';
        curtainR.innerHTML = '';
        curtainL.classList.add('hidden');
        curtainR.classList.add('hidden');
      }
    }

    // 2. Motif Header / Section Divider di Atas Judul Seksi
    const dividerPng = ornaments.section_divider_png;
    const quoteHeader = document.getElementById('quote-header-ornament');
    const sectionHeaders = document.querySelectorAll('.theme-ornament-header');

    if (dividerPng) {
      sectionHeaders.forEach(hdr => {
        hdr.innerHTML = `<img src="${dividerPng}" alt="Pembatas Seksi" class="max-h-7 sm:max-h-8 object-contain mx-auto filter drop-shadow float-breathing my-1">`;
      });
    } else {
      if (quoteHeader) quoteHeader.innerHTML = theme.headerMotif || '';
    }

    // 3. Ornamen Sudut Kartu-Kartu Undangan (.card-corner-slot)
    const cardSlots = document.querySelectorAll('.card-corner-slot');
    cardSlots.forEach(slot => {
      const slotType = slot.getAttribute('data-slot');
      if (cornerMaster) {
        if (slotType === 'tl') {
          slot.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-left">`;
        } else if (slotType === 'tr') {
          slot.innerHTML = `<img src="${cornerMaster}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-right" style="transform: scaleX(-1);">`;
        }
      } else if (ornaments.corner_tl_png || ornaments.corner_tr_png) {
        if (slotType === 'tl' && ornaments.corner_tl_png) {
          slot.innerHTML = `<img src="${ornaments.corner_tl_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-left">`;
        } else if (slotType === 'tr' && ornaments.corner_tr_png) {
          slot.innerHTML = `<img src="${ornaments.corner_tr_png}" alt="Ornamen" class="w-full h-full object-contain filter drop-shadow sway-top-right">`;
        }
      } else if (slotType === 'tl') {
        slot.innerHTML = theme.cornerTL;
      } else if (slotType === 'tr') {
        slot.innerHTML = theme.cornerTR;
      }
    });
  }

  /**
   * Terapkan Gaya & Arah Animasi Card Saat Di-Scroll (7 Pilihan Animasi)
   */
  applyCardAnimations(overrideAnim) {
    const custom = this.wedding?.custom_theme_json || {};
    const animStyle = overrideAnim || custom.card_animation || 'fade-up';

    const cards = document.querySelectorAll('.wedding-card, #card-event-akad, #card-event-resepsi');
    cards.forEach((card, idx) => {
      if (animStyle === 'alternate-lr') {
        const altType = idx % 2 === 0 ? 'alt-left' : 'alt-right';
        card.setAttribute('data-animate', altType);
      } else {
        card.setAttribute('data-animate', animStyle);
      }
    });

    if (this.scrollObserver) {
      this.initScrollAnimations();
    }
  }

  /**
   * Animasi Interaktif Scroll-Reveal (IntersectionObserver)
   */
  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (!animatedElements.length) return;

    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.10,
      rootMargin: '0px 0px -25px 0px'
    });

    animatedElements.forEach(el => this.scrollObserver.observe(el));
  }

  /**
   * Floating Bottom Navigation Dock & ScrollSpy
   */
  initScrollSpy() {
    const sectionIds = ['section-couple', 'section-events', 'section-gallery', 'section-envelopes', 'section-rsvp'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if (this.scrollSpyObserver) {
      this.scrollSpyObserver.disconnect();
    }

    this.scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;
          document.querySelectorAll('#bottom-dock .dock-btn').forEach(btn => {
            if (btn.getAttribute('data-nav') === activeId) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
      });
    }, {
      threshold: 0.35
    });

    sections.forEach(sec => this.scrollSpyObserver.observe(sec));
  }

  scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Live Preview Listener via postMessage (Studio Integration Ala Canva & Katsudoto)
   */
  initLivePreviewListener() {
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg) return;

      // Quick Actions dari Toolbar Studio
      if (msg.action === 'OPEN_INVITATION') {
        this.openInvitation();
        return;
      }
      if (msg.action === 'RESET_COVER') {
        this.resetCover();
        return;
      }

      // Live Updates data kustomisasi
      if (msg.type === 'LIVE_PREVIEW_UPDATE' || msg.type === 'MB_PREVIEW_UPDATE' || msg.type === 'PREVIEW_DATA') {
        const payload = msg.payload || msg.data || msg;
        this.handleLivePreviewUpdate(payload);
      }
    });

    // Beri sinyal ke parent window / opener bahwa iframe siap
    const target = window.opener || (window.parent !== window ? window.parent : null);
    if (target) {
      try {
        target.postMessage({ type: 'MB_PREVIEW_READY' }, '*');
      } catch (e) {}
    }
  }

  resetCover() {
    const cover = document.getElementById('cover-screen');
    const curtainLeft = document.getElementById('cover-curtain-left');
    const curtainRight = document.getElementById('cover-curtain-right');
    const dock = document.getElementById('bottom-dock');

    if (cover) {
      cover.style.display = 'flex';
      cover.style.pointerEvents = 'auto';
      setTimeout(() => {
        cover.style.transform = 'translateY(0)';
        cover.style.opacity = '1';
      }, 30);
    }

    if (curtainLeft) {
      curtainLeft.style.transform = 'translateX(0) scale(1)';
      curtainLeft.style.opacity = '0.95';
    }
    if (curtainRight) {
      curtainRight.style.transform = 'translateX(0) scale(1)';
      curtainRight.style.opacity = '0.95';
    }

    if (dock) {
      dock.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
      dock.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
    }

    const app = document.getElementById('invitation-app-container');
    if (app) app.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  applySectionVisibility() {
    const custom = this.wedding?.custom_theme_json || {};
    const sec = custom.sections || {};

    // 1. Kutipan
    const quoteEl = document.getElementById('section-quote');
    if (quoteEl) {
      if (sec.show_quote === false) quoteEl.classList.add('hidden');
      else quoteEl.classList.remove('hidden');
    }

    // 2. Countdown
    const countEl = document.getElementById('section-countdown');
    if (countEl) {
      if (sec.show_countdown === false) countEl.classList.add('hidden');
      else countEl.classList.remove('hidden');
    }

    // 3. Resepsi
    const resepsiEl = document.getElementById('card-event-resepsi');
    if (resepsiEl) {
      if (sec.show_resepsi === false) resepsiEl.classList.add('hidden');
      else resepsiEl.classList.remove('hidden');
    }

    // 4. Kisah Cinta
    const storyEl = document.getElementById('section-love-story');
    if (storyEl) {
      const hasStory = Array.isArray(this.wedding?.love_story_json) && this.wedding.love_story_json.length > 0;
      if (sec.show_story === false || !hasStory) storyEl.classList.add('hidden');
      else storyEl.classList.remove('hidden');
    }

    // 5. Galeri
    const galleryEl = document.getElementById('section-gallery');
    if (galleryEl) {
      const hasPhotos = Array.isArray(this.wedding?.gallery_json) && this.wedding.gallery_json.length > 0;
      if (sec.show_gallery === false || !hasPhotos) galleryEl.classList.add('hidden');
      else galleryEl.classList.remove('hidden');
    }

    // 6. Amplop
    const envelopeEl = document.getElementById('section-envelopes');
    if (envelopeEl) {
      const hasEnv = Array.isArray(this.wedding?.envelopes_json) && this.wedding.envelopes_json.length > 0;
      const hasAddr = Boolean(custom.gift_address && custom.gift_address.trim() !== '');
      if (sec.show_gift === false || (!hasEnv && !hasAddr)) envelopeEl.classList.add('hidden');
      else envelopeEl.classList.remove('hidden');
    }

    // 7. Musik
    const audioBtn = document.getElementById('audio-control');
    if (audioBtn) {
      if (sec.show_music === false) {
        audioBtn.classList.add('hidden');
        if (this.audioElement) this.audioElement.pause();
      } else {
        audioBtn.classList.remove('hidden');
      }
    }
  }

  handleLivePreviewUpdate(data) {
    if (!data) return;

    // Merge wedding properties
    if (data.wedding) {
      this.wedding = { ...this.wedding, ...data.wedding };
    } else {
      this.wedding = { ...this.wedding, ...data };
    }

    const tplSlug = data.presetSlug || data.template_slug || this.wedding?.template_slug || this.template?.slug || 'minimalist-sage';
    this.template = { ...(this.template || {}), slug: tplSlug };

    this.applyTemplateStyles();
    this.applyThemeColors();
    this.renderThemeOrnaments();

    const customTheme = data.custom_theme_json || this.wedding?.custom_theme_json || {};

    const frameShape = customTheme.frame_shape || this.wedding?.custom_theme_json?.frame_shape;
    this.applyPhotoFrameShape(frameShape);

    this.applyCoverPhotoAndFrame();

    const particleEffect = customTheme.particle_effect || this.wedding?.custom_theme_json?.particle_effect || this.getDefaultParticleEffect(tplSlug);
    const particlePhysics = customTheme.particle_physics || 'breeze_right';
    const particleLayer = customTheme.particle_layer || 'behind';

    if (this.particleEngine) {
      this.particleEngine.setLayer(particleLayer);
      this.particleEngine.setPhysics(particlePhysics);
      this.particleEngine.setEffect(particleEffect);
    }

    this.applyCardAnimations(customTheme.card_animation);

    this.renderCoverSection();
    this.renderCoupleSection();
    this.renderQuotesSection();
    this.renderCountdownSection();
    this.renderEventsSection();
    this.renderLoveStorySection();
    this.renderGallerySection();
    this.renderEnvelopesSection();
    this.applySectionVisibility();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Load data wedding dan template dari Supabase
   */
  async loadWeddingData() {
    const client = window.supabaseClient;
    if (!client) {
      this.showErrorNotice('Supabase client tidak siap. Silakan refresh halaman.');
      return false;
    }

    if (!this.slug) {
      this.showNotFoundNotice('Slug tautan undangan tidak ditemukan pada URL.');
      return false;
    }

    // Query wedding berdasarkan slug
    const { data: wedding, error } = await client
      .from('weddings')
      .select('*')
      .eq('slug', this.slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wedding by slug:', error);
      this.showErrorNotice('Gagal mengakses database undangan.');
      return false;
    }

    if (!wedding) {
      this.showNotFoundNotice(`Undangan dengan alamat "/u/${this.slug}" tidak ditemukan.`);
      return false;
    }

    this.wedding = wedding;

    // Cek status publikasi
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';

    if (wedding.is_published === false && !isPreview) {
      this.showUnpublishedNotice();
      return false;
    }

    // Ambil data user pemilik acara (untuk wedding_date fallback jika belum diatur di wedding)
    if (wedding.user_id) {
      try {
        const { data: userRow } = await client
          .from('users')
          .select('wedding_date, name')
          .eq('id', wedding.user_id)
          .maybeSingle();
        if (userRow) {
          this.weddingUser = userRow;
        }
      } catch (e) {
        console.warn('Could not fetch wedding owner user data:', e);
      }
    }

    // Ambil data template
    if (wedding.template_id) {
      const { data: tpl } = await client
        .from('templates')
        .select('*')
        .eq('id', wedding.template_id)
        .maybeSingle();
      this.template = tpl;
    }

    return true;
  }

  /**
   * Terapkan palet warna dinamis ke CSS Variables & Background
   */
  applyThemeColors() {
    const custom = this.wedding.custom_theme_json || {};
    const tplColors = this.template?.default_colors_json || {};

    const bg = custom.bg || tplColors.bg || '#FCFBF9';
    const card = custom.card || tplColors.card || '#FFFFFF';
    const text = custom.text || tplColors.text || '#2C352E';
    const accent = custom.accent || tplColors.accent || '#D4AF37';
    const secondary = custom.secondary || tplColors.secondary || '#E2B170';

    const root = document.documentElement;
    root.style.setProperty('--bg-main', bg);
    root.style.setProperty('--bg-card', card);
    root.style.setProperty('--text-main', text);
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--accent-secondary', secondary);

    // Kustomisasi Typography (Google Fonts Selection)
    const typography = custom.typography || {};
    const fontHeading = typography.font_heading || "'Cormorant Garamond', Georgia, serif";
    const fontBody = typography.font_body || "'Plus Jakarta Sans', system-ui, sans-serif";
    root.style.setProperty('--font-heading', fontHeading);
    root.style.setProperty('--font-body', fontBody);

    // Ubah background app container
    const app = document.getElementById('invitation-app-container');
    if (app) {
      app.style.backgroundColor = bg;
      app.style.color = text;
    }

    // Tampilkan Custom BG Image ATAU Lava Lamp Blobs Default
    const customBg = custom.bg_image_url;
    const bgImgEl = document.getElementById('custom-bg-image');
    const lavaEl = document.getElementById('lava-lamp-container');

    if (customBg && bgImgEl) {
      bgImgEl.style.backgroundImage = `url('${customBg}')`;
      bgImgEl.classList.remove('hidden');
      if (lavaEl) lavaEl.classList.add('hidden');
    } else {
      if (bgImgEl) bgImgEl.classList.add('hidden');
      if (lavaEl) lavaEl.classList.remove('hidden');
    }
  }

  /**
   * Terapkan ornamen visual dan class berdasarkan template.slug (8 Preset Tema)
   */
  applyTemplateStyles() {
    const tplSlug = this.template?.slug || 'minimalist-sage';
    const container = document.getElementById('invitation-app-container');
    if (!container) return;

    // Bersihkan class theme sebelumnya
    container.className = container.className
      .split(' ')
      .filter(c => !c.startsWith('theme-') && !c.startsWith('style-'))
      .join(' ');

    // Tambahkan class theme aktif
    container.classList.add(`theme-${tplSlug}`);
  }

  /**
   * 1. Layar Sampul Depan (Cover Screen)
   */
  renderCoverSection() {
    const groom = this.wedding.groom_nickname || 'Pria';
    const bride = this.wedding.bride_nickname || 'Wanita';
    const couple = `${groom} & ${bride}`;

    document.title = `Undangan Pernikahan ${couple} — MenikahBersama | Wedding Planner & Undangan Digital`;

    const coverCouple = document.getElementById('cover-couple-name');
    const coverGuest = document.getElementById('cover-guest-name');
    const coverDate = document.getElementById('cover-wedding-date');

    if (coverCouple) coverCouple.textContent = couple;
    if (coverGuest) coverGuest.textContent = this.guestName;
    if (coverDate) {
      const cDate = this.wedding.akad_date || this.wedding.resepsi_date || this.weddingUser?.wedding_date;
      coverDate.textContent = cDate ? formatDateIndo(cDate) : 'Menuju Hari Bahagia';
    }

    // Tombol Buka Undangan
    const openBtn = document.getElementById('btn-open-invitation');
    if (openBtn) {
      openBtn.onclick = () => this.openInvitation();
    }
  }

  /**
   * 2. Buka Sampul, Tirai Membuka & Putar Musik
   */
  openInvitation() {
    const cover = document.getElementById('cover-screen');
    const curtainLeft = document.getElementById('cover-curtain-left');
    const curtainRight = document.getElementById('cover-curtain-right');
    const dock = document.getElementById('bottom-dock');

    // Efek Membuka Tirai Gunungan Wayang Kembar ke Kiri & Kanan
    if (curtainLeft) {
      curtainLeft.style.transform = 'translateX(-125%) scale(0.95)';
      curtainLeft.style.opacity = '0';
    }
    if (curtainRight) {
      curtainRight.style.transform = 'translateX(125%) scale(0.95)';
      curtainRight.style.opacity = '0';
    }

    // Angkat Sampul Depan ke Atas
    if (cover) {
      cover.style.transform = 'translateY(-100%)';
      cover.style.opacity = '0';
      cover.style.pointerEvents = 'none';
      setTimeout(() => {
        cover.style.display = 'none';
      }, 850);
    }

    // Buka lock scroll body & container
    document.body.classList.remove('overflow-hidden');
    document.getElementById('invitation-app-container')?.classList.remove('overflow-hidden');

    // Tampilkan Floating Bottom Dock Navigasi
    if (dock) {
      dock.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
      dock.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    }

    // Pemicu reveal animasi seksi pertama
    setTimeout(() => {
      document.querySelectorAll('#section-quote [data-animate], #section-couple [data-animate]').forEach(el => {
        el.classList.add('is-revealed');
      });
    }, 250);

    // Putar musik latar
    this.playAudio();
  }

  /**
   * Audio Controller
   */
  initAudioController() {
    this.audioElement = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('audio-control');

    if (audioBtn) {
      audioBtn.onclick = () => this.toggleAudio();
    }

    if (this.audioElement) {
      this.audioElement.addEventListener('ended', () => {
        this.isPlayingAudio = false;
        this.updateAudioButtonState();
      });
      this.audioElement.addEventListener('pause', () => {
        if (!this.audioElement.seeking) {
          this.isPlayingAudio = false;
          this.updateAudioButtonState();
        }
      });
      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio failed to load, falling back to local track-1.mp3', e);
        if (this.audioElement.src && !this.audioElement.src.includes('/assets/audio/track-1.mp3')) {
          this.audioElement.src = '/assets/audio/track-1.mp3';
          this.audioElement.load();
          this.audioElement.play().then(() => {
            this.isPlayingAudio = true;
            this.updateAudioButtonState();
          }).catch(() => {});
        }
      });
    }
  }

  playAudio() {
    if (!this.audioElement) return;
    
    const sourceUrl = this.wedding?.audio_url || '/assets/audio/track-1.mp3';
    if (!this.audioElement.src || !this.audioElement.src.endsWith(sourceUrl)) {
      this.audioElement.src = sourceUrl;
    }

    this.audioElement.play().then(() => {
      this.isPlayingAudio = true;
      this.updateAudioButtonState();
    }).catch(e => {
      console.warn('Autoplay audio blocked by browser policy:', e);
      this.isPlayingAudio = false;
      this.updateAudioButtonState();
    });
  }

  toggleAudio() {
    if (!this.audioElement) return;

    if (this.isPlayingAudio) {
      this.audioElement.pause();
      this.isPlayingAudio = false;
    } else {
      this.audioElement.play().then(() => {
        this.isPlayingAudio = true;
      }).catch(e => console.warn('Play audio failed:', e));
    }
    this.updateAudioButtonState();
  }

  updateAudioButtonState() {
    const btn = document.getElementById('audio-control');
    if (!btn) return;

    const AUDIO_SPIN_SVG = `<svg class="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`;
    const AUDIO_STOP_SVG = `<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

    if (this.isPlayingAudio) {
      btn.innerHTML = AUDIO_SPIN_SVG;
      btn.setAttribute('title', 'Hentikan Musik');
    } else {
      btn.innerHTML = AUDIO_STOP_SVG;
      btn.setAttribute('title', 'Putar Musik');
    }
  }

  /**
   * 3. Kutipan Suci / Ayat Pernikahan
   */
  renderQuotesSection() {
    const textEl = document.getElementById('quote-text');
    const sourceEl = document.getElementById('quote-source');

    const quote = this.wedding.quote_text || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram di sampingnya.';
    const source = this.wedding.quote_source || '(QS. Ar-Rum: 21)';

    if (textEl) textEl.textContent = `"${quote}"`;
    if (sourceEl) sourceEl.textContent = source;
  }

  /**
   * 4. Profil Mempelai Pria & Wanita
   */
  renderCoupleSection() {
    const w = this.wedding;
    const groom = w.groom_nickname || 'Yogi';
    const bride = w.bride_nickname || 'Rina';

    const coupleTitle = document.getElementById('main-couple-name');
    if (coupleTitle) coupleTitle.textContent = `${groom} & ${bride}`;

    // Mempelai Pria (CPP)
    const groomName = document.getElementById('groom-name');
    const groomParents = document.getElementById('groom-parents');
    const groomImg = document.getElementById('groom-photo-img');
    const groomAvatar = document.getElementById('groom-avatar');
    const groomIgLink = document.getElementById('groom-ig-link');
    const groomIgText = document.getElementById('groom-ig-text');

    if (groomName) groomName.textContent = w.groom_fullname || groom;
    if (groomParents) groomParents.textContent = w.groom_parents || 'Putra dari Keluarga Besar';

    if (w.groom_photo && groomImg && groomAvatar) {
      groomImg.src = w.groom_photo;
      groomImg.classList.remove('hidden');
      groomAvatar.classList.add('hidden');
    } else if (groomAvatar) {
      groomAvatar.textContent = groom.charAt(0);
    }

    if (w.groom_ig && groomIgLink && groomIgText) {
      const cleanIg = w.groom_ig.replace(/^@/, '');
      groomIgLink.href = `https://instagram.com/${cleanIg}`;
      groomIgText.textContent = `@${cleanIg}`;
      groomIgLink.classList.remove('hidden');
    }

    // Mempelai Wanita (CPW)
    const brideName = document.getElementById('bride-name');
    const brideParents = document.getElementById('bride-parents');
    const brideImg = document.getElementById('bride-photo-img');
    const brideAvatar = document.getElementById('bride-avatar');
    const brideIgLink = document.getElementById('bride-ig-link');
    const brideIgText = document.getElementById('bride-ig-text');

    if (brideName) brideName.textContent = w.bride_fullname || bride;
    if (brideParents) brideParents.textContent = w.bride_parents || 'Putri dari Keluarga Besar';

    if (w.bride_photo && brideImg && brideAvatar) {
      brideImg.src = w.bride_photo;
      brideImg.classList.remove('hidden');
      brideAvatar.classList.add('hidden');
    } else if (brideAvatar) {
      brideAvatar.textContent = bride.charAt(0);
    }

    if (w.bride_ig && brideIgLink && brideIgText) {
      const cleanIg = w.bride_ig.replace(/^@/, '');
      brideIgLink.href = `https://instagram.com/${cleanIg}`;
      brideIgText.textContent = `@${cleanIg}`;
      brideIgLink.classList.remove('hidden');
    }
  }

  /**
   * 5. Hitung Mundur Detik demi Detik & Simpan ke Kalender
   */
  renderCountdownSection() {
    const rawDate = this.wedding.akad_date || this.wedding.resepsi_date || this.weddingUser?.wedding_date || '2027-12-31';

    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-minutes');
    const secsEl = document.getElementById('countdown-seconds');

    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const dateStr = String(rawDate).split('T')[0].trim();
    const parts = dateStr.split('-');
    let year = 2027, month = 12, day = 31;
    if (parts.length === 3) {
      year = parseInt(parts[0], 10) || 2027;
      month = parseInt(parts[1], 10) || 12;
      day = parseInt(parts[2], 10) || 31;
    }

    let hh = 8, mm = 0, ss = 0;
    if (this.wedding.akad_time) {
      const tMatch = String(this.wedding.akad_time).match(/(\d{1,2})[:.](\d{1,2})/);
      if (tMatch) {
        hh = parseInt(tMatch[1], 10);
        mm = parseInt(tMatch[2], 10);
      }
    }

    const targetDateObj = new Date(year, month - 1, day, hh, mm, ss);
    const targetTimestamp = targetDateObj.getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetTimestamp - now;

      if (isNaN(targetTimestamp) || diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);

    const calBtn = document.getElementById('btn-add-to-calendar');
    if (calBtn) {
      calBtn.href = this.generateGoogleCalendarUrl();
    }
  }

  generateGoogleCalendarUrl() {
    const w = this.wedding;
    const groom = w.groom_nickname || 'Pria';
    const bride = w.bride_nickname || 'Wanita';
    const title = encodeURIComponent(`The Wedding of ${groom} & ${bride}`);
    const details = encodeURIComponent(`Pernikahan bahagia ${w.groom_fullname || groom} & ${w.bride_fullname || bride}.\n\nInfo lengkap & konfirmasi kehadiran: ${window.location.href}`);
    const location = encodeURIComponent(`${w.akad_venue || w.resepsi_venue || 'Lokasi Acara'}, ${w.akad_address || w.resepsi_address || ''}`);

    const rawDate = w.akad_date || w.resepsi_date || this.weddingUser?.wedding_date || '2027-12-31';
    const dateStr = String(rawDate).split('T')[0].replace(/-/g, '');
    const start = `${dateStr}T080000`;
    const end = `${dateStr}T140000`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  }

  /**
   * 6. Detail Acara Akad & Resepsi
   */
  renderEventsSection() {
    const w = this.wedding;

    // Akad
    const akadDateEl = document.getElementById('akad-date');
    const akadTimeEl = document.getElementById('akad-time');
    const akadVenueEl = document.getElementById('akad-venue');
    const akadAddressEl = document.getElementById('akad-address');
    const akadMapsBtn = document.getElementById('akad-maps-btn');

    if (akadDateEl) akadDateEl.textContent = formatDateIndo(w.akad_date);
    if (akadTimeEl && w.akad_time) akadTimeEl.textContent = w.akad_time;
    if (akadVenueEl && w.akad_venue) akadVenueEl.textContent = w.akad_venue;
    if (akadAddressEl && w.akad_address) akadAddressEl.textContent = w.akad_address;

    if (w.akad_maps_url && akadMapsBtn) {
      akadMapsBtn.href = w.akad_maps_url;
      akadMapsBtn.classList.remove('hidden');
    }

    // Resepsi
    const resepsiDateEl = document.getElementById('resepsi-date');
    const resepsiTimeEl = document.getElementById('resepsi-time');
    const resepsiVenueEl = document.getElementById('resepsi-venue');
    const resepsiAddressEl = document.getElementById('resepsi-address');
    const resepsiMapsBtn = document.getElementById('resepsi-maps-btn');

    if (resepsiDateEl) resepsiDateEl.textContent = formatDateIndo(w.resepsi_date || w.akad_date);
    if (resepsiTimeEl && w.resepsi_time) resepsiTimeEl.textContent = w.resepsi_time;
    if (resepsiVenueEl && w.resepsi_venue) resepsiVenueEl.textContent = w.resepsi_venue;
    if (resepsiAddressEl && w.resepsi_address) resepsiAddressEl.textContent = w.resepsi_address;

    if (w.resepsi_maps_url && resepsiMapsBtn) {
      resepsiMapsBtn.href = w.resepsi_maps_url;
      resepsiMapsBtn.classList.remove('hidden');
    }
  }

  /**
   * 7. Kisah Cinta & Galeri Prewedding
   */
  renderLoveStorySection() {
    const stories = this.wedding.love_story_json;
    const section = document.getElementById('section-love-story');
    const container = document.getElementById('love-story-container');

    if (!section || !container) return;

    if (!Array.isArray(stories) || stories.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = stories.map(s => `
      <div class="wedding-card backdrop-blur-md p-4 rounded-2xl bg-[var(--bg-card,#ffffff)]/85 border border-stone-200/80 shadow-2xs space-y-1 relative pl-5 border-l-4 border-l-[var(--accent-color,#b48342)]" data-animate="fade-up">
        <span class="text-[10px] font-bold font-mono text-[var(--accent-color,#b48342)] uppercase tracking-wider">${escapeHtml(s.year || '')}</span>
        <h4 class="font-serif text-base font-bold text-slate-900">${escapeHtml(s.title || '')}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(s.story || '')}</p>
      </div>
    `).join('');
  }

  renderGallerySection() {
    const photos = this.wedding.gallery_json;
    const section = document.getElementById('section-gallery');
    const container = document.getElementById('gallery-container');

    if (!section || !container) return;

    if (!Array.isArray(photos) || photos.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = photos.map((url, idx) => `
      <div 
        onclick="window.invitationEngine.openLightbox('${url}')" 
        class="rounded-2xl overflow-hidden aspect-square border border-stone-200/80 shadow-2xs group relative bg-stone-100 cursor-pointer"
      >
        <img src="${url}" alt="Foto Prewedding ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <i data-lucide="maximize-2" class="w-5 h-5 text-white drop-shadow"></i>
        </div>
      </div>
    `).join('');
  }

  initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-modal' || e.target.closest('#lightbox-close')) {
        this.closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
    });
  }

  openLightbox(url) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (!modal || !img) return;

    img.src = url;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  /**
   * 8. Amplop Digital (Cashless Gift)
   */
  renderEnvelopesSection() {
    const envelopes = this.wedding.envelopes_json;
    const custom = this.wedding.custom_theme_json || {};
    const section = document.getElementById('section-envelopes');
    const container = document.getElementById('envelopes-cards-container');

    if (!section || !container) return;

    const hasEnvelopes = Array.isArray(envelopes) && envelopes.length > 0;
    const hasAddress = Boolean(custom.gift_address && custom.gift_address.trim() !== '');

    if (!hasEnvelopes && !hasAddress) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');

    if (hasEnvelopes) {
      container.innerHTML = envelopes.map(env => `
        <div class="wedding-card backdrop-blur-md p-4 rounded-2xl bg-[var(--bg-card,#ffffff)]/85 border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3 relative overflow-hidden" data-animate="fade-up">
          <div class="card-corner-slot top-0 left-0" data-slot="tl"></div>
          <div class="card-corner-slot top-0 right-0" data-slot="tr"></div>
          <div class="relative z-10">
            <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70">
              ${escapeHtml(env.bank || 'Bank')}
            </span>
            <div class="font-mono font-bold text-sm text-slate-900 mt-1">${escapeHtml(env.number || '')}</div>
            <div class="text-[11px] text-slate-500">a.n ${escapeHtml(env.holder || '')}</div>
          </div>
          <button 
            type="button" 
            onclick="window.invitationEngine.copyAccountNumber('${escapeHtml(env.number)}', this)" 
            class="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 relative z-10"
          >
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Salin</span>
          </button>
        </div>
      `).join('');
    } else {
      container.innerHTML = '';
    }

    // Alamat Kado Fisik
    const physContainer = document.getElementById('physical-gift-container');
    const physText = document.getElementById('physical-gift-text');
    if (hasAddress && physContainer && physText) {
      physText.textContent = custom.gift_address;
      physContainer.classList.remove('hidden');
    }
  }

  copyAccountNumber(num, btn) {
    navigator.clipboard.writeText(num).then(() => {
      showToast('Nomor rekening disalin ke clipboard!', 'success');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i><span>Berhasil Disalin!</span>`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }, 2500);
    }).catch(() => {
      prompt('Salin nomor rekening manual:', num);
    });
  }

  /**
   * Smart RSVP & Real-Time Wishes Wall
   */
  renderRsvpSection() {
    const nameInput = document.getElementById('guest_name_input');
    if (nameInput && this.guestName && this.guestName !== 'Tamu Kehormatan') {
      nameInput.value = this.guestName;
    }

    const form = document.getElementById('rsvp-form');
    if (form) {
      form.onsubmit = (e) => this.handleRsvpSubmit(e);
    }
  }

  async handleRsvpSubmit(e) {
    e.preventDefault();

    const guestName = document.getElementById('guest_name_input')?.value.trim();
    const status = document.querySelector('input[name="rsvp_status"]:checked')?.value || 'hadir';
    const pax = status === 'hadir' 
      ? (parseInt(document.getElementById('confirmed_pax_input')?.value, 10) || 2) 
      : 0;
    const wish = document.getElementById('wish_message_input')?.value.trim() || null;
    const submitBtn = document.getElementById('btn-rsvp-submit');

    if (!guestName) {
      showToast('Mohon masukkan nama Anda', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Mengirim...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const client = window.supabaseClient;
      if (!client) throw new Error('Supabase client tidak siap');

      const now = new Date().toISOString();

      // 1. SMART MATCHING: Cek apakah tamu sudah ada di database tabel guests
      const { data: existingGuest } = await client
        .from('guests')
        .select('id, name')
        .eq('wedding_id', this.wedding.id)
        .ilike('name', guestName)
        .maybeSingle();

      if (existingGuest?.id) {
        const { error: updateError } = await client
          .from('guests')
          .update({
            rsvp_status: status,
            confirmed_pax: Number(pax),
            wish_message: wish,
            rsvp_submitted_at: now
          })
          .eq('id', existingGuest.id);

        if (updateError) checkRlsError(updateError);
      } else {
        const { error: insertError } = await client
          .from('guests')
          .insert([{
            user_id: this.wedding.user_id,
            wedding_id: this.wedding.id,
            name: guestName,
            group_category: 'Teman Pria',
            invitation_type: 'digital',
            estimated_pax: 2,
            confirmed_pax: Number(pax),
            rsvp_status: status,
            wish_message: wish,
            is_link_sent: true,
            rsvp_submitted_at: now
          }]);

        if (insertError) checkRlsError(insertError);
      }

      showToast(`Terima kasih ${guestName}, konfirmasi (${status === 'hadir' ? 'Hadir' : 'Berhalangan'}) dan doa restu berhasil dikirim!`, 'success', 4000);
      submitBtn.innerHTML = `<i data-lucide="check-check" class="w-4 h-4 text-emerald-400"></i><span>Terkirim</span>`;
      if (window.lucide) window.lucide.createIcons();

      // REAL-TIME WISHES WALL: Tambahkan seketika ke urutan teratas tanpa reload halaman
      if (wish) {
        this.prependWishToWall({
          name: guestName,
          rsvp_status: status,
          confirmed_pax: pax,
          wish_message: wish,
          rsvp_submitted_at: now
        });
      }

    } catch (err) {
      console.error('RSVP submission error:', err);
      showToast('Terima kasih, konfirmasi kehadiran Anda telah tercatat!', 'info');
    }
  }

  async loadWishes() {
    const container = document.getElementById('wishes-list');
    const countLabel = document.getElementById('wishes-count-label');
    if (!container) return;

    try {
      const client = window.supabaseClient;
      if (!client || !this.wedding?.id) return;

      const { data: wishes, error } = await client
        .from('guests')
        .select('id, name, wish_message, rsvp_status, confirmed_pax, rsvp_submitted_at, created_at')
        .eq('wedding_id', this.wedding.id)
        .not('wish_message', 'is', null)
        .order('rsvp_submitted_at', { ascending: false })
        .limit(30);

      if (error || !wishes || !wishes.length) {
        if (countLabel) countLabel.textContent = 'Jadilah yang pertama memberikan doa restu!';
        container.innerHTML = `
          <div class="p-6 bg-[var(--bg-card,#ffffff)] rounded-2xl border border-stone-200 text-center text-xs text-stone-400">
            Belum ada ucapan doa. Tuliskan ucapan dan doa restu terbaik Anda di formulir atas.
          </div>
        `;
        return;
      }

      if (countLabel) countLabel.textContent = `${wishes.length} doa restu dari para tamu`;

      container.innerHTML = wishes.map(w => this.renderWishCardHtml(w)).join('');
      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      console.warn('Load wishes err:', err);
    }
  }

  prependWishToWall(item) {
    const container = document.getElementById('wishes-list');
    if (!container) return;

    const emptyBox = container.querySelector('.text-stone-400');
    if (emptyBox) container.innerHTML = '';

    const newCard = document.createElement('div');
    newCard.innerHTML = this.renderWishCardHtml(item);
    container.prepend(newCard.firstElementChild);

    if (window.lucide) window.lucide.createIcons();
  }

  renderWishCardHtml(w) {
    const initials = (w.name || 'Tamu').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '✨';
    const hadirBadge = w.rsvp_status === 'hadir'
      ? `<span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">Hadir (${w.confirmed_pax || 2} Pax)</span>`
      : `<span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600">Berhalangan</span>`;

    return `
      <div class="wedding-card backdrop-blur-md bg-[var(--bg-card,#ffffff)]/85 p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 animate-in fade-in duration-300">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center font-serif">
              ${initials}
            </div>
            <span class="font-bold text-xs text-slate-800">${escapeHtml(w.name)}</span>
          </div>
          ${hadirBadge}
        </div>
        <p class="text-xs text-slate-600 italic leading-relaxed pl-1">
          "${escapeHtml(w.wish_message)}"
        </p>
      </div>
    `;
  }

  /**
   * Layar Pemberitahuan (Error, Not Found, Unpublished)
   */
  showNotFoundNotice(msg) {
    this.renderNoticeScreen(
      'alert-circle',
      'Undangan Tidak Ditemukan',
      msg || 'Alamat tautan undangan yang Anda buka tidak terdaftar di sistem MenikahBersama (menikahbersama.my.id).',
      'Kembali ke Beranda',
      '/'
    );
  }

  showUnpublishedNotice() {
    const groom = this.wedding?.groom_nickname || 'Mempelai';
    const bride = this.wedding?.bride_nickname || 'Mempelai';
    this.renderNoticeScreen(
      'clock',
      'Undangan Sedang Dalam Mode Draft',
      `Undangan pernikahan ${groom} & ${bride} belum dipublikasikan oleh kedua mempelai. Silakan hubungi pengantin untuk informasi lebih lanjut.`,
      'Buka Dashboard Pengantin',
      '/login.html'
    );
  }

  showErrorNotice(msg) {
    this.renderNoticeScreen(
      'shield-alert',
      'Terjadi Gangguan Akses',
      msg,
      'Muat Ulang Halaman',
      window.location.href
    );
  }

  renderNoticeScreen(icon, title, message, btnText, btnUrl) {
    const app = document.getElementById('invitation-app-container');
    if (!app) return;

    app.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
          <i data-lucide="${icon}" class="w-8 h-8"></i>
        </div>
        <h2 class="font-serif text-2xl font-bold text-slate-900">${title}</h2>
        <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">${message}</p>
        <a 
          href="${btnUrl}" 
          class="mt-4 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          ${btnText}
        </a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

// Inisialisasi global
window.InvitationEngine = InvitationEngine;
window.invitationEngine = new InvitationEngine();
