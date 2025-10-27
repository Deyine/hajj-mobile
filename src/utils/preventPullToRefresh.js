/**
 * Utility to prevent pull-to-refresh in WebView
 * Blocks overscroll at the top of the page that triggers parent app refresh
 */

let startY = 0;
let isScrollable = false;

export function preventPullToRefresh() {
  // Remove existing listeners first
  removePullToRefreshPrevention();

  const handleTouchStart = (e) => {
    startY = e.touches[0].pageY;
    // Check if page is scrollable and at the top
    isScrollable = document.documentElement.scrollHeight > window.innerHeight;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].pageY;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // If at the top of the page and trying to pull down
    if (scrollTop === 0 && currentY > startY) {
      // Prevent the pull-to-refresh gesture
      e.preventDefault();
    }
  };

  // Use passive: false to allow preventDefault()
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  // Store references for cleanup
  window.__pullToRefreshHandlers = {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove
  };
}

export function removePullToRefreshPrevention() {
  if (window.__pullToRefreshHandlers) {
    document.removeEventListener('touchstart', window.__pullToRefreshHandlers.touchstart);
    document.removeEventListener('touchmove', window.__pullToRefreshHandlers.touchmove);
    delete window.__pullToRefreshHandlers;
  }
}
