(function() {
    'use strict';

    function runWhenReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
            return;
        }
        fn();
    }

    function createNeuralCanvas(opacity) {
        const canvas = document.createElement('canvas');
        canvas.id = 'sheikha-neural-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = [
            'position:fixed',
            'inset:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            'z-index:1',
            'opacity:' + opacity
        ].join(';');

        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        const nodes = [];
        const particles = [];
        const nodeCount = 28;
        const particleCount = 22;
        let raf = null;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function resetNodes() {
            nodes.length = 0;
            for (let i = 0; i < nodeCount; i += 1) {
                nodes.push({
                    x: random(0, canvas.width),
                    y: random(0, canvas.height),
                    vx: random(-0.22, 0.22),
                    vy: random(-0.22, 0.22),
                    r: random(1.5, 3.2)
                });
            }
        }

        function resetParticles() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i += 1) {
                particles.push({
                    x: random(0, canvas.width),
                    y: random(canvas.height * 0.55, canvas.height),
                    vy: random(-0.7, -0.2),
                    vx: random(-0.25, 0.25),
                    size: random(1, 2.8),
                    alpha: random(0.18, 0.55),
                    hue: Math.random() > 0.65 ? 'rgba(16,185,129,' : 'rgba(212,175,55,'
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < nodes.length; i += 1) {
                const a = nodes[i];
                a.x += a.vx;
                a.y += a.vy;

                if (a.x < -10 || a.x > canvas.width + 10) a.vx *= -1;
                if (a.y < -10 || a.y > canvas.height + 10) a.vy *= -1;

                for (let j = i + 1; j < nodes.length; j += 1) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 170) {
                        const alpha = 0.22 * (1 - dist / 170);
                        ctx.strokeStyle = 'rgba(212,175,55,' + alpha.toFixed(4) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = 'rgba(212,175,55,0.92)';
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = 0; i < particles.length; i += 1) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < -12) {
                    p.y = canvas.height + 8;
                    p.x = random(0, canvas.width);
                }

                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.fillStyle = p.hue + p.alpha.toFixed(4) + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        }

        resize();
        resetNodes();
        resetParticles();
        draw();

        window.addEventListener('resize', () => {
            resize();
            resetNodes();
            resetParticles();
        });

        return function destroy() {
            if (raf) cancelAnimationFrame(raf);
            canvas.remove();
        };
    }

    function enableScrollReveal() {
        const targets = document.querySelectorAll('.section, .hero, .mkt, .cat, .found, .vis, .ec, .card, .kpi-card, .chart-card');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.style.transition = 'opacity .7s ease, transform .7s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        targets.forEach((el) => {
            if (!el.style.opacity) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(16px)';
            }
            observer.observe(el);
        });
    }

    function enableMagneticButtons() {
        const buttons = document.querySelectorAll('button, .btn, .cta, .nav-login');
        buttons.forEach((button) => {
            if (button.dataset.neuralMagnetic === '1') return;
            button.dataset.neuralMagnetic = '1';
            button.style.transition = (button.style.transition || '') + ', transform .18s ease';

            button.addEventListener('mousemove', (event) => {
                const rect = button.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                button.style.transform = 'translate(' + (x * 6).toFixed(2) + 'px,' + (y * 6).toFixed(2) + 'px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0,0)';
            });
        });
    }

    function enableSpotlightCards() {
        const cards = document.querySelectorAll('.card, .kpi-card, .chart-card, .mkt, .cat');
        cards.forEach((card) => {
            if (card.dataset.neuralSpotlight === '1') return;
            card.dataset.neuralSpotlight = '1';
            card.style.backgroundImage = card.style.backgroundImage || 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06), rgba(0,0,0,0))';
            card.style.backgroundBlendMode = 'screen';

            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                card.style.backgroundImage = 'radial-gradient(circle at ' + x.toFixed(2) + '% ' + y.toFixed(2) + '%, rgba(212,175,55,0.18), rgba(184,115,51,0.06) 34%, rgba(0,0,0,0) 70%)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.backgroundImage = 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06), rgba(0,0,0,0))';
            });
        });
    }

    function initNeural() {
        const opacity = Number(document.body.dataset.neuralOpacity || '0.18');
        createNeuralCanvas(Math.max(0.08, Math.min(0.45, opacity)));
        enableScrollReveal();
        enableMagneticButtons();
        enableSpotlightCards();
    }

    runWhenReady(initNeural);
})();
