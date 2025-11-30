// ===========================
// PARTICLE SYSTEM
// ===========================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;

        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#00ffff' : '#b600ff'
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    update() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Pulse effect
            particle.opacity += (Math.random() - 0.5) * 0.02;
            particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ===========================
// SMOOTH SCROLL
// ===========================
function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===========================
// SCROLL ANIMATIONS
// ===========================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('.section-title, .story-content, .character-card, .media-item').forEach(el => {
        observer.observe(el);
    });
}

// ===========================
// ACTIVE NAV LINK
// ===========================
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===========================
// GLITCH EFFECT
// ===========================
// ===========================
// GLITCH EFFECT
// ===========================
function initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch, .glitch-layer');

    glitchElements.forEach(element => {
        setInterval(() => {
            if (Math.random() > 0.95) {
                const color1 = Math.random() > 0.5 ? '#00f3ff' : '#bc13fe';
                const color2 = Math.random() > 0.5 ? '#ff0055' : '#00f3ff';

                element.style.textShadow = `
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px ${Math.random() * 10}px ${color1},
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px ${Math.random() * 10}px ${color2}
                `;

                setTimeout(() => {
                    element.style.textShadow = '';
                }, 100);
            }
        }, 100);
    });
}

// ===========================
// TECH SPECS TYPING
// ===========================
function initTechTyping() {
    const techSpecs = document.querySelectorAll('.logo-tech-specs span');

    techSpecs.forEach((spec, index) => {
        const text = spec.textContent;
        spec.textContent = '';
        spec.style.opacity = '1';

        setTimeout(() => {
            let i = 0;
            const typing = setInterval(() => {
                spec.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(typing);
                }
            }, 50);
        }, 1000 + (index * 500));
    });
}

// ===========================
// HERO IMAGE LOADER
// ===========================
function loadHeroImage() {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const heroImagePath = 'assets/hero_cyberpunk_city_new.jpg';

    // Create image element
    const img = new Image();
    img.src = heroImagePath;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.opacity = '0';
    img.style.transition = 'opacity 1s ease';

    img.onload = () => {
        // Remove scan line
        const scanLine = heroImageContainer.querySelector('.scan-line');
        if (scanLine) {
            scanLine.remove();
        }

        // Add image
        heroImageContainer.appendChild(img);
        setTimeout(() => {
            img.style.opacity = '0.9';
        }, 100);
    };

    img.onerror = () => {
        console.log('Hero image not found, keeping placeholder');
    };
}

// ===========================
// CHARACTER IMAGE LOADER
// ===========================
function loadCharacterImages() {
    const characterCards = document.querySelectorAll('.character-card');
    const characterImages = [
        'assets/character_protagonist_male.png',
        'assets/character_heroine_female.png'
    ];

    characterCards.forEach((card, index) => {
        const imagePlaceholder = card.querySelector('.image-placeholder');
        const img = new Image();
        img.src = characterImages[index];
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.opacity = '0';
        img.style.transition = 'opacity 1s ease';

        img.onload = () => {
            imagePlaceholder.innerHTML = '';
            imagePlaceholder.appendChild(img);
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        };

        img.onerror = () => {
            console.log(`Character image ${index} not found, keeping placeholder`);
        };
    });
}

// ===========================
// PARALLAX EFFECT
// ===========================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-section');

        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===========================
// CUSTOM CURSOR
// ===========================
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s ease;
        display: none;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.display = 'block';
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand cursor on hover
    document.querySelectorAll('a, button, .character-card, .media-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursor.style.borderColor = '#b600ff';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.borderColor = '#00ffff';
        });
    });
}

// ===========================
// LOADING ANIMATION
// ===========================
function initLoadingAnimation() {
    const loadingTexts = document.querySelectorAll('.loading-text');

    loadingTexts.forEach(text => {
        let dots = 0;
        setInterval(() => {
            dots = (dots + 1) % 4;
            text.textContent = 'LOADING' + '.'.repeat(dots);
        }, 500);
    });
}

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particles');
    if (canvas) {
        const particleSystem = new ParticleSystem(canvas);
        particleSystem.animate();
    }

    // Initialize all features
    initSmoothScroll();
    initScrollAnimations();
    initActiveNav();
    initGlitchEffect();
    // initParallax(); // Disabled to fix backward scroll UX issue
    initCustomCursor();
    initLoadingAnimation();
    initTechTyping();

    // Load images
    loadHeroImage();
    loadCharacterImages();

    // Add initial fade-in to body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
