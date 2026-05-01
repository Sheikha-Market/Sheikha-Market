/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║        SHEIKHA NEURAL DESIGN ENGINE — محرك الشبكة العصبية للتصميم          ║
 * ║                  خلية الهوية الحية — Living Identity Cell                   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  كل نبضة تحمل معنى — كل حركة تروي قصة — كل عقدة تحمل حكمة                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function SheikhaNeural() {
  'use strict';

  /* ══════════════════════════════════════════════════════
     الهوية الأساسية — Core Identity Manifest
     ══════════════════════════════════════════════════════ */
  const IDENTITY = {
    name:    'شيخة',
    latin:   'SHEIKHA',
    version: '3.0-NEURAL',
    soul:    'من سوق المدينة المنورة إلى السوق الرقمي العالمي',
    values:  ['الأمانة', 'الشفافية', 'البركة', 'الإتقان', 'الحلال'],
    palette: {
      gold:    '#D4AF37',
      goldL:   '#F5D76E',
      goldD:   '#A8882B',
      green:   '#006c35',
      void:    '#020308',
      silver:  '#C8D6E0',
    },
  };

  /* ══════════════════════════════════════════════════════
     1. الشبكة العصبية المرئية — Visual Neural Network
     ══════════════════════════════════════════════════════ */
  class NeuralCanvas {
    constructor(container) {
      this.container = container;
      this.canvas    = document.createElement('canvas');
      this.ctx       = this.canvas.getContext('2d');
      this.nodes     = [];
      this.mouse     = { x: 0, y: 0 };
      this.animId    = null;

      Object.assign(this.canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '0',
      });

      container.style.position = 'relative';
      container.appendChild(this.canvas);
      this._resize();
      this._initNodes();
      this._bindEvents();
      this._loop();
    }

    _resize() {
      const r = this.container.getBoundingClientRect();
      this.canvas.width  = r.width  * window.devicePixelRatio;
      this.canvas.height = r.height * window.devicePixelRatio;
      this.canvas.style.width  = r.width  + 'px';
      this.canvas.style.height = r.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.W = r.width;
      this.H = r.height;
    }

    _initNodes(count = 28) {
      this.nodes = Array.from({ length: count }, () => ({
        x:  Math.random() * this.W,
        y:  Math.random() * this.H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
      }));
    }

    _bindEvents() {
      window.addEventListener('resize', () => {
        this._resize();
        this._initNodes();
      });

      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
    }

    _loop() {
      this._draw();
      this.animId = requestAnimationFrame(() => this._loop());
    }

    _draw() {
      const { ctx, W, H, nodes, mouse } = this;
      ctx.clearRect(0, 0, W, H);

      const CONNECT_DIST = 140;
      const MOUSE_DIST   = 180;

      // تحديث مواضع العقد
      nodes.forEach(n => {
        n.pulse += n.speed;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      // رسم الاتصالات
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CONNECT_DIST) continue;

          const alpha = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // رسم خطوط الماوس
      nodes.forEach(n => {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MOUSE_DIST) return;

        const alpha = (1 - dist / MOUSE_DIST) * 0.35;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // رسم العقد
      nodes.forEach(n => {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const r = n.r + glow * 1.5;
        const alpha = 0.4 + glow * 0.5;

        // هالة
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        grad.addColorStop(0, `rgba(212,175,55,${alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // النواة
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${alpha})`;
        ctx.fill();
      });
    }

    destroy() {
      cancelAnimationFrame(this.animId);
      this.canvas.remove();
    }
  }

  /* ══════════════════════════════════════════════════════
     2. الكتابة الحية — Living Typewriter
     ══════════════════════════════════════════════════════ */
  class NeuralTypewriter {
    constructor(el, phrases, { speed = 80, pause = 2400, cursor = '|' } = {}) {
      this.el      = el;
      this.phrases = phrases;
      this.speed   = speed;
      this.pause   = pause;
      this.cursor  = cursor;
      this.idx     = 0;
      this.charIdx = 0;
      this.deleting= false;
      this._tick();
    }

    _tick() {
      const phrase = this.phrases[this.idx];
      const shown  = this.deleting
        ? phrase.slice(0, this.charIdx--)
        : phrase.slice(0, this.charIdx++);

      this.el.innerHTML = shown + `<span class="n-cursor" style="color:var(--n-gold-core,#D4AF37);animation:blink 1s step-end infinite">${this.cursor}</span>`;

      let delay = this.deleting ? this.speed * 0.5 : this.speed;

      if (!this.deleting && this.charIdx > phrase.length) {
        delay = this.pause;
        this.deleting = true;
      } else if (this.deleting && this.charIdx < 0) {
        this.deleting = false;
        this.charIdx  = 0;
        this.idx = (this.idx + 1) % this.phrases.length;
        delay = 500;
      }

      setTimeout(() => this._tick(), delay);
    }
  }

  /* ══════════════════════════════════════════════════════
     3. كاشف التمرير — Scroll Reveal Engine
     ══════════════════════════════════════════════════════ */
  class ScrollReveal {
    constructor() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('n-visible');
              this.observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
    }

    watch(selector = '.n-reveal') {
      document.querySelectorAll(selector).forEach(el => this.observer.observe(el));
    }
  }

  /* ══════════════════════════════════════════════════════
     4. عداد الأرقام الحي — Live Number Counter
     ══════════════════════════════════════════════════════ */
  class NeuralCounter {
    constructor(el, target, { duration = 2200, suffix = '', prefix = '' } = {}) {
      this.el       = el;
      this.target   = target;
      this.duration = duration;
      this.suffix   = suffix;
      this.prefix   = prefix;
      this.start    = null;
      this._started = false;

      // تفعيل عند الظهور
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !this._started) {
          this._started = true;
          this._animate();
          obs.disconnect();
        }
      }, { threshold: 0.5 });

      obs.observe(el);
    }

    _animate(ts) {
      if (!this.start) this.start = ts || performance.now();
      const progress = Math.min((performance.now() - this.start) / this.duration, 1);
      const eased    = this._easeOut(progress);
      const value    = Math.round(eased * this.target);

      this.el.textContent = this.prefix + value.toLocaleString('ar') + this.suffix;

      if (progress < 1) requestAnimationFrame((t) => this._animate(t));
    }

    _easeOut(x) {
      return 1 - Math.pow(1 - x, 3);
    }
  }

  /* ══════════════════════════════════════════════════════
     5. مُتتبع الماوس — Magnetic Mouse Tracker
     ══════════════════════════════════════════════════════ */
  class MagneticEffect {
    constructor(els) {
      Array.from(els).forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect   = el.getBoundingClientRect();
          const cx     = rect.left + rect.width  / 2;
          const cy     = rect.top  + rect.height / 2;
          const dx     = (e.clientX - cx) * 0.18;
          const dy     = (e.clientY - cy) * 0.18;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        el.addEventListener('mouseleave', () => {
          el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
          el.style.transform  = 'translate(0,0)';
          setTimeout(() => { el.style.transition = ''; }, 500);
        });
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     6. تأثير الضوء المتتبع — Spotlight Effect
     ══════════════════════════════════════════════════════ */
  class SpotlightCards {
    constructor(els) {
      Array.from(els).forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width)  * 100;
          const y = ((e.clientY - rect.top)  / rect.height) * 100;
          el.style.setProperty('--mx', x + '%');
          el.style.setProperty('--my', y + '%');
        });
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     7. نظام الجسيمات — Particle System
     ══════════════════════════════════════════════════════ */
  class GoldParticles {
    constructor(container, count = 20) {
      this.container = container;
      this.particles = [];
      for (let i = 0; i < count; i++) this._spawn();
    }

    _spawn() {
      const p = document.createElement('span');
      p.className = 'n-particle';

      const size  = Math.random() * 4 + 2;
      const left  = Math.random() * 100;
      const delay = Math.random() * 8;
      const dur   = Math.random() * 6 + 8;
      const gold  = Math.random() > 0.3 ? '#D4AF37' : '#006c35';

      Object.assign(p.style, {
        position:     'absolute',
        width:        size + 'px',
        height:       size + 'px',
        borderRadius: '50%',
        background:   gold,
        left:         left + '%',
        bottom:       '-10px',
        opacity:      '0',
        pointerEvents:'none',
        zIndex:       '0',
        boxShadow:    `0 0 ${size * 2}px ${gold}`,
        animation:    `n-particle-rise ${dur}s ${delay}s ease-in infinite`,
      });

      this.container.appendChild(p);
      this.particles.push(p);
    }
  }

  /* ══════════════════════════════════════════════════════
     8. مُدير الهوية — Identity Manager
     ══════════════════════════════════════════════════════ */
  class SheikhaIdentityEngine {
    constructor() {
      this._injectStyles();
      this._init();
    }

    _injectStyles() {
      if (document.getElementById('n-engine-styles')) return;
      const style = document.createElement('style');
      style.id = 'n-engine-styles';
      style.textContent = `
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes n-particle-rise {
          0%   { transform:translateY(0) scale(1);   opacity:0; }
          10%  { opacity:.8; }
          90%  { opacity:.3; }
          100% { transform:translateY(-100vh) scale(0); opacity:0; }
        }
        .n-cursor { display:inline-block; }
      `;
      document.head.appendChild(style);
    }

    _init() {
      document.addEventListener('DOMContentLoaded', () => this._activate());
      if (document.readyState !== 'loading') this._activate();
    }

    _activate() {
      // الشبكة العصبية
      document.querySelectorAll('[data-neural-canvas]').forEach(el => {
        new NeuralCanvas(el);
      });

      // الكتابة الحية
      document.querySelectorAll('[data-typewriter]').forEach(el => {
        const raw     = el.dataset.typewriter;
        const phrases = raw.split('|').map(s => s.trim()).filter(Boolean);
        if (phrases.length) new NeuralTypewriter(el, phrases);
      });

      // الكاشف
      new ScrollReveal().watch('.n-reveal');

      // عداد الأرقام
      document.querySelectorAll('[data-counter]').forEach(el => {
        const target  = parseFloat(el.dataset.counter) || 0;
        const suffix  = el.dataset.suffix  || '';
        const prefix  = el.dataset.prefix  || '';
        const duration= parseInt(el.dataset.duration) || 2200;
        new NeuralCounter(el, target, { duration, suffix, prefix });
      });

      // التأثير المغناطيسي
      new MagneticEffect(document.querySelectorAll('[data-magnetic]'));

      // الضوء المتتبع
      new SpotlightCards(document.querySelectorAll('.n-identity-cell, .n-card'));

      // الجسيمات
      document.querySelectorAll('[data-particles]').forEach(el => {
        new GoldParticles(el, parseInt(el.dataset.particles) || 20);
      });

      // شريط التنقل الذكي
      this._smartNav();

      // تتبع الهوية
      this._identityTrace();

      // تحديث التاريخ
      this._updateDate();
    }

    _smartNav() {
      const nav = document.querySelector('.n-nav');
      if (!nav) return;

      let lastY = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) {
          nav.style.background = 'rgba(2,3,8,0.96)';
          nav.style.borderBottomColor = 'rgba(212,175,55,0.1)';
        } else {
          nav.style.background = 'rgba(2,3,8,0.82)';
          nav.style.borderBottomColor = 'rgba(212,175,55,0.06)';
        }
        lastY = y;
      }, { passive: true });
    }

    _identityTrace() {
      // تسجيل تفعيل الخلية في console
      const s = [
        '%c╔══════════════════════════════════════════╗',
        '%c║   SHEIKHA NEURAL IDENTITY ENGINE v3.0   ║',
        '%c║   خلية الشبكة العصبية للتصميم والهوية   ║',
        '%c╚══════════════════════════════════════════╝',
      ];
      const gs = 'color:#D4AF37;font-family:monospace;font-size:12px';
      console.log(s[0], gs);
      console.log(s[1], gs);
      console.log(s[2], gs);
      console.log(s[3], gs);
      console.log('%cالهوية: %c' + IDENTITY.soul, 'color:#5d7082', 'color:#D4AF37');
      console.log('%cالقيم: ' + IDENTITY.values.join(' · '), 'color:#5d7082');
    }

    _updateDate() {
      document.querySelectorAll('[data-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     تصدير عام — Public API
     ══════════════════════════════════════════════════════ */
  window.SheikhaNeural = {
    NeuralCanvas,
    NeuralTypewriter,
    ScrollReveal,
    NeuralCounter,
    MagneticEffect,
    SpotlightCards,
    GoldParticles,
    IDENTITY,
  };

  // تفعيل تلقائي
  new SheikhaIdentityEngine();

})();
