/**
 * Utility to prevent pull-to-refresh in WebView
 * Aggressively blocks overscroll that triggers parent app refresh
 */

let startY = 0;

export function preventPullToRefresh() {
  // Remove existing listeners first
  removePullToRefreshPrevention();

  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Prevent pull-down when at the top
    if (scrollTop <= 0 && deltaY > 0) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent pull-up when at the bottom
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight && deltaY < 0) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleTouchEnd = () => {
    startY = 0;
  };

  // Prevent default scroll behavior on body
  const preventBodyScroll = (e) => {
    if (e.target === document.body) {
      e.preventDefault();
    }
  };

  // Use passive: false to allow preventDefault()
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  document.body.addEventListener('touchmove', preventBodyScroll, { passive: false });

  // Also prevent mousewheel overscroll
  document.addEventListener('wheel', (e) => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if ((scrollTop <= 0 && e.deltaY < 0) ||
        (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Store references for cleanup
  window.__pullToRefreshHandlers = {
    touchstart: handleTouchStart,
    touchmove: handleTouchMove,
    touchend: handleTouchEnd,
    bodytouchmove: preventBodyScroll
  };
}

export function removePullToRefreshPrevention() {
  if (window.__pullToRefreshHandlers) {
    document.removeEventListener('touchstart', window.__pullToRefreshHandlers.touchstart);
    document.removeEventListener('touchmove', window.__pullToRefreshHandlers.touchmove);
    document.removeEventListener('touchend', window.__pullToRefreshHandlers.touchend);
    document.body.removeEventListener('touchmove', window.__pullToRefreshHandlers.bodytouchmove);
    delete window.__pullToRefreshHandlers;
  }
}
