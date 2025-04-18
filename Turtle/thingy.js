document.addEventListener('DOMContentLoaded', function () {
    // Check if the viewport width is 768px or less
    if (window.innerWidth <= 768) {
        var newsPanel = document.getElementById('news-panel');
        if (newsPanel) {
            // Ensure the news panel is visible
            newsPanel.style.display = 'block'; // Adjust as necessary based on your HTML/CSS

            // Set a high z-index to ensure it's above other elements
            newsPanel.style.zIndex = '10001';

            // If there's specific positioning or additional styling needed to "open" the panel, add it here
            // For example, if the panel is off-screen initially, adjust its position to be visible.
            newsPanel.style.right = '0'; // Example to ensure it's visible, adjust based on your setup
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const buttonGrid = document.querySelector(".buttonGrid");

    if (!buttonGrid) return;

    const adjustButtonPositions = () => {
        const children = Array.from(buttonGrid.children);
        let lastRightEdge = 0;

        children.forEach((child, index) => {
            const rect = child.getBoundingClientRect();

            if (rect.left < lastRightEdge) {
                // Force item to break into a new row
                child.style.gridColumnStart = "1";
            }

            // Update the last known right edge
            lastRightEdge = rect.right;
        });
    };

    // Run the function initially
    adjustButtonPositions();

    // Observe for dynamically added buttons
    const observer = new MutationObserver(() => {
        adjustButtonPositions();
    });

    observer.observe(buttonGrid, { childList: true, subtree: false });

    // Re-run on resize
    window.addEventListener("resize", adjustButtonPositions);
});