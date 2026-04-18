const SwipeGestureManager = (function() {
  const DEFAULT_CONFIG = {
    swipeThreshold: 150,
    velocityThreshold: 0.3,
    enabled: true
  };

  let config = {};
  let isEnabled = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;
  let swipeIndicator = null;

  function isTouchSupported() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function init(userConfig = {}) {
    if (!isTouchSupported()) {
      console.log('🛑 SwipeGestureManager: touch not supported, skipping init');
      return;
    }

    config = { ...DEFAULT_CONFIG, ...userConfig };

    const savedState = localStorage.getItem('swipeGestureEnabled');
    if (savedState !== null) {
      config.enabled = savedState === 'true';
    }

    createSwipeIndicator();

    if (config.enabled) {
      enable();
    }
  }

  function createSwipeIndicator() {
    swipeIndicator = document.createElement('div');
    swipeIndicator.id = 'swipe-indicator';
    swipeIndicator.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: linear-gradient(to right, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0));
      pointer-events: none;
      z-index: 9999;
      transition: width 0.1s ease-out;
      opacity: 0;
    `;
    document.body.appendChild(swipeIndicator);
  }

  function enable() {
    if (isEnabled) return;

    isEnabled = true;
    localStorage.setItem('swipeGestureEnabled', 'true');

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    console.log('✅ SwipeGestureManager enabled');
  }

  function disable() {
    if (!isEnabled) return;

    isEnabled = false;
    localStorage.setItem('swipeGestureEnabled', 'false');

    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    hideSwipeIndicator();
    console.log('SwipeGestureManager disabled');
  }

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
    isSwiping = false;
  }

  function handleTouchMove(event) {
    if (!event.touches || event.touches.length === 0) return;

    const touchCurrentX = event.touches[0].clientX;
    const touchCurrentY = event.touches[0].clientY;

    const deltaX = touchCurrentX - touchStartX;
    const deltaY = touchCurrentY - touchStartY;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (!isSwiping && absDeltaX > 10) {
      const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

      if (angle < 30 || angle > 150) {
        isSwiping = true;
      }
    }

    if (isSwiping && deltaX > 0) {
      event.preventDefault();

      const progress = Math.min(deltaX, config.swipeThreshold);
      showSwipeIndicator(progress);
    }
  }

  function handleTouchEnd(event) {
    if (!isSwiping) {
      hideSwipeIndicator();
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    const velocity = absDeltaX / deltaTime;

    if (deltaX > config.swipeThreshold &&
        velocity > config.velocityThreshold &&
        absDeltaX > absDeltaY) {

      triggerGoHome();
    }

    hideSwipeIndicator();
    isSwiping = false;
  }

  function showSwipeIndicator(progress) {
    if (!swipeIndicator) return;

    const width = (progress / config.swipeThreshold) * 100;
    swipeIndicator.style.width = `${Math.min(width, 30)}px`;
    swipeIndicator.style.opacity = '1';
  }

  function hideSwipeIndicator() {
    if (!swipeIndicator) return;

    swipeIndicator.style.width = '0';
    swipeIndicator.style.opacity = '0';
  }

  function triggerGoHome() {
    console.log('Swipe left detected - returning home');

    if (typeof closeNutritionModal === 'function') {
      closeNutritionModal();
    }

    if (typeof goHome === 'function') {
      const mockEvent = {
        stopPropagation: function() {}
      };
      goHome(mockEvent);
    } else {
      $('.page').hide();
      $('.home').show();
      if (typeof InactivityManager !== 'undefined') {
        InactivityManager.pause();
      }
    }
  }

  function toggle() {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  }

  function destroy() {
    disable();
    if (swipeIndicator && swipeIndicator.parentNode) {
      swipeIndicator.parentNode.removeChild(swipeIndicator);
    }
  }

  function getState() {
    return {
      enabled: isEnabled,
      config: config
    };
  }

  return {
    init,
    enable,
    disable,
    toggle,
    destroy,
    getState
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SwipeGestureManager;
}
