/**
 * Utility to prevent pull-to-refresh in WebView
 * Only blocks overscroll at boundaries, allows normal scrolling
 */

let startY = 0;
let lastScrollTop = 0;

export function preventPullToRefresh() {
  // Remove existing listeners first
  removePullToRefreshPrevention();

  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
    lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate if we're trying to scroll beyond boundaries
    const isAtTop = scrollTop <= 1; // Small threshold for precision
    const isPullingDown = deltaY > 5; // Only if significant pull

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    const isPullingUp = deltaY < -5;

    // Only prevent if we're AT a boundary AND trying to go further
    // AND we haven't scrolled since touch started
    const scrolledDuringTouch = Math.abs(scrollTop - lastScrollTop) < 2;

    if (isAtTop && isPullingDown && scrolledDuringTouch) {
      // At top trying to pull down - prevent
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    if (isAtBottom && isPullingUp && scrolledDuringTouch) {
      // At bottom trying to pull up - prevent
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Otherwise allow normal scrolling
  };

  const handleTouchEnd = () => {
    startY = 0;
    lastScrollTop = 0;
  };

  // Use passive: false to allow preventDefault() when needed
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Store references for cleanup
  window.__pullToRefreshHandlers = {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove,
    touchend: handleTouchEnd
  };
}

export function removePullToRefreshPrevention() {
  if (window.__pullToRefreshHandlers) {
    document.removeEventListener('touchstart', window.__pullToRefreshHandlers.touchstart);
    document.removeEventListener('touchmove', window.__pullToRefreshHandlers.touchmove);
    document.removeEventListener('touchend', window.__pullToRefreshHandlers.touchend);
    delete window.__pullToRefreshHandlers;
  }
}
