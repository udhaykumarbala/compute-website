/**
 * 0G Compute - Feature Showcase Navigation
 * Handles vertical navigation with auto-rotation for the "Built for High-Performance AI Workloads" section
 */

function initFeatureShowcase() {
    const navItems = document.querySelectorAll('.feature-nav-item');

    if (!navItems.length) return;

    let currentIndex = 0;
    let autoRotateTimer = null;
    const ROTATION_INTERVAL = 2000; // 2 seconds

    function setActiveItem(index) {
        // Remove active from all items
        navItems.forEach(navItem => navItem.classList.remove('active'));

        // Add active to selected item
        navItems[index].classList.add('active');
        currentIndex = index;
    }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateTimer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % navItems.length;
            setActiveItem(nextIndex);
            startAutoRotate();
        }, ROTATION_INTERVAL);
    }

    function stopAutoRotate() {
        if (autoRotateTimer) {
            clearTimeout(autoRotateTimer);
            autoRotateTimer = null;
        }
    }

    // Click handler
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            setActiveItem(index);
            // Restart auto-rotation after click
            startAutoRotate();
        });
    });

    // Start auto-rotation
    startAutoRotate();

    // Pause on hover
    const showcase = document.querySelector('.feature-showcase');
    if (showcase) {
        showcase.addEventListener('mouseenter', stopAutoRotate);
        showcase.addEventListener('mouseleave', startAutoRotate);
    }
}

document.addEventListener('DOMContentLoaded', initFeatureShowcase);
