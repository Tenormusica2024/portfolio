document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Custom Cursor Movement
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Cursor Hover Effect
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });

        // 3D Tilt Effect
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const xTilt = (0.5 - yPct) * 20; // Max tilt 10deg
            const yTilt = (xPct - 0.5) * 20;

            item.style.transform = `perspective(1000px) rotateX(${xTilt}deg) rotateY(${yTilt}deg) scale(1.05)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
});
