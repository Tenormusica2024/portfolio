// Slide Navigation
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Navigation Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const navDots = document.getElementById('navDots');
const progressFill = document.getElementById('progressFill');

// Initialize
function init() {
    // Create navigation dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('nav-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        navDots.appendChild(dot);
    }

    // Update progress bar
    updateProgress();

    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyPress);

    // Add touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide();
        }
    }

    // Auto-animate chart bars on slide 4
    observeSlides();
}

// Navigation Functions
function goToSlide(index) {
    if (index === currentSlide) return;

    const direction = index > currentSlide ? 'next' : 'prev';

    slides[currentSlide].classList.remove('active');
    if (direction === 'prev') {
        slides[currentSlide].classList.add('prev-slide');
        setTimeout(() => {
            slides[currentSlide].classList.remove('prev-slide');
        }, 600);
    }

    currentSlide = index;
    slides[currentSlide].classList.add('active');

    updateDots();
    updateProgress();
    updateButtons();
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateProgress() {
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    progressFill.style.width = `${progress}%`;
}

function updateButtons() {
    prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
    prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
    nextBtn.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';
}

function handleKeyPress(e) {
    if (e.key === 'ArrowRight') {
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'Home') {
        goToSlide(0);
    } else if (e.key === 'End') {
        goToSlide(totalSlides - 1);
    }
}

// Event Listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Intersection Observer for animations
function observeSlides() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSlideContent(entry.target);
            }
        });
    }, { threshold: 0.5 });

    slides.forEach(slide => observer.observe(slide));
}

function animateSlideContent(slide) {
    const slideIndex = parseInt(slide.dataset.slide);

    // Animate different elements based on slide
    if (slideIndex === 1) {
        // Factor cards stagger animation
        const cards = slide.querySelectorAll('.factor-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100);
        });
    }

    if (slideIndex === 2) {
        // Stat cards pop-in animation
        const statCards = slide.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            }, index * 100);
        });
    }

    if (slideIndex === 3) {
        // Bar chart animation
        const bars = slide.querySelectorAll('.bar-fill');
        bars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 1s ease';
                bar.style.width = targetWidth;
            }, index * 200);
        });
    }

    if (slideIndex === 4) {
        // Tech cards fade in
        const techCards = slide.querySelectorAll('.tech-card');
        techCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0)';
                }, 50);
            }, index * 150);
        });
    }

    if (slideIndex === 5) {
        // Strategy items slide in
        const strategyItems = slide.querySelectorAll('.strategy-item');
        strategyItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.6s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 50);
            }, index * 100);
        });
    }
}

// Counter animation for numbers
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Particle background effect (optional enhancement)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '0';
    document.body.prepend(particlesContainer);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(6, 182, 212, ${Math.random() * 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particlesContainer.appendChild(particle);
    }

    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            50% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize on load
window.addEventListener('load', () => {
    init();
    createParticles();
    updateButtons();
});

// Prevent zoom on mobile
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});
