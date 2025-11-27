// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// GSAP Setup
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
    gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
    });
});

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        follower.classList.add('active');
        gsap.to(follower, {
            scale: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'transparent'
        });
    });
    link.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        follower.classList.remove('active');
        gsap.to(follower, {
            scale: 1,
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.5)'
        });
    });
});

// Hero Animations
const tl = gsap.timeline({ delay: 0.5 });

tl.from('.logo', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
})
.from('.nav-link', {
    y: -50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out'
}, '-=0.8')
.from('.menu-trigger', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
}, '-=0.8')
.from('.hero-title .reveal-text', {
    y: 150,
    duration: 1.5,
    stagger: 0.2,
    ease: 'power4.out'
}, '-=0.5')
.from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
}, '-=1')
.from('.vertical-text span', {
    y: 20,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out'
}, '-=1')
.from('.scroll-indicator', {
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
}, '-=0.5')
.from('.gradient-orb', {
    scale: 0,
    opacity: 0,
    duration: 2,
    ease: 'power2.out'
}, '-=2');


// Horizontal Scroll for Work Section
const workSection = document.querySelector('.work');
const workContainer = document.querySelector('.work-container');

if (workSection && workContainer) {
    gsap.to(workContainer, {
        x: () => -(workContainer.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
            trigger: workSection,
            pin: true,
            scrub: 1,
            end: () => '+=' + workContainer.scrollWidth,
            invalidateOnRefresh: true
        }
    });
}

// Parallax Effect for Work Images
gsap.utils.toArray('.work-image').forEach(image => {
    gsap.to(image, {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
            trigger: image,
            containerAnimation: gsap.getTweensOf(workContainer)[0], // Link to horizontal scroll
            start: 'left right',
            end: 'right left',
            scrub: true
        }
    });
});

// About Page Animations
const bioText = document.querySelectorAll('.bio-text-vertical span');
if (bioText.length > 0) {
    gsap.from(bioText, {
        scrollTrigger: {
            trigger: '.bio-text-vertical',
            start: 'top 80%',
        },
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: 'power3.out'
    });
}

gsap.utils.toArray('.philosophy-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: i * 0.1
    });
});

// Works Page Animations
gsap.utils.toArray('.work-grid-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
    });
});
