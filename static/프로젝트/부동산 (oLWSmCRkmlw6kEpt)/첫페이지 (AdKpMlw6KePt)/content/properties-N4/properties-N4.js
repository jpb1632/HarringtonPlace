(function() {
  const POPUP_HIDE_KEY = "patioforet_popup_hide_until_v2";

  function getTomorrowMidnight() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  }

  function isPopupHidden() {
    try {
      const value = Number(localStorage.getItem(POPUP_HIDE_KEY) || 0);
      return value > Date.now();
    } catch (_) {
      return false;
    }
  }

  function hidePopup($overlay) {
    $overlay.addClass("is-hidden");
  }

  $(function() {
    $(".properties-N4[id='pGmlW6KDwI']").each(function() {
      const $block = $(this);
      const $overlay = $block.find(".popup-overlay");
      const $popupArea = $block.find(".popup-area");
      const $popupTrack = $block.find(".popup-track");
      const $cards = $popupTrack.find(".popup-card");
      const $dots = $block.find(".popup-dots");
      const $prev = $block.find(".popup-prev");
      const $next = $block.find(".popup-next");
      const $close = $block.find(".popup-close-btn");
      const $dayoff = $block.find(".popup-dayoff-check");
      const MOBILE_POPUP_AUTOPLAY_MS = 3200;
      let currentIndex = 0;
      let touchStartX = 0;
      let touchStartY = 0;
      let autoplayTimer = null;
      let onVisibilityChange = null;

      $block.find(".popup-card img").attr("draggable", "false");

      function isMobilePopup() {
        return window.matchMedia("(max-width: 992px)").matches;
      }

      function normalizeIndex(index) {
        const len = $cards.length;
        if (!len) return 0;
        return (index + len) % len;
      }

      function renderPopupSlider() {
        if (!$cards.length) return;
        if (isMobilePopup()) {
          $popupTrack.css("transform", "translateX(-" + (currentIndex * 100) + "%)");
          $dots.find(".popup-dot").removeClass("is-active")
            .eq(currentIndex).addClass("is-active");
        } else {
          $popupTrack.css("transform", "");
        }
      }

      function goTo(index) {
        currentIndex = normalizeIndex(index);
        renderPopupSlider();
      }

      function stopAutoplay() {
        if (!autoplayTimer) return;
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }

      function startAutoplay() {
        stopAutoplay();
        if (!isMobilePopup() || $cards.length < 2 || $overlay.hasClass("is-hidden")) return;
        autoplayTimer = window.setInterval(function() {
          goTo(currentIndex + 1);
        }, MOBILE_POPUP_AUTOPLAY_MS);
      }

      function restartAutoplay() {
        startAutoplay();
      }

      function buildDots() {
        if (!$cards.length) return;
        $dots.empty();
        for (let i = 0; i < $cards.length; i += 1) {
          const $dot = $("<button/>", {
            type: "button",
            class: "popup-dot" + (i === 0 ? " is-active" : ""),
            "aria-label": "팝업 " + (i + 1) + "번 보기",
            "data-index": i
          });
          $dots.append($dot);
        }
      }

      buildDots();

      $prev.on("click", function() {
        if (!isMobilePopup()) return;
        goTo(currentIndex - 1);
        restartAutoplay();
      });

      $next.on("click", function() {
        if (!isMobilePopup()) return;
        goTo(currentIndex + 1);
        restartAutoplay();
      });

      $dots.on("click", ".popup-dot", function() {
        if (!isMobilePopup()) return;
        const index = Number($(this).data("index") || 0);
        goTo(index);
        restartAutoplay();
      });

      $popupArea.on("touchstart", function(event) {
        if (!isMobilePopup()) return;
        const touch = event.originalEvent.touches && event.originalEvent.touches[0];
        if (!touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      });

      $popupArea.on("touchend", function(event) {
        if (!isMobilePopup()) return;
        const touch = event.originalEvent.changedTouches && event.originalEvent.changedTouches[0];
        if (!touch) return;
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;
        if (Math.abs(diffX) < 40 || Math.abs(diffX) < Math.abs(diffY)) return;
        if (diffX < 0) {
          goTo(currentIndex + 1);
        } else {
          goTo(currentIndex - 1);
        }
        restartAutoplay();
      });

      $(window).on("resize orientationchange", function() {
        renderPopupSlider();
        startAutoplay();
      });

      if (isPopupHidden()) {
        stopAutoplay();
        hidePopup($overlay);
        return;
      }

      goTo(0);
      startAutoplay();

      onVisibilityChange = function() {
        if ($overlay.hasClass("is-hidden")) {
          stopAutoplay();
          return;
        }
        if (document.hidden) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      $close.on("click", function() {
        stopAutoplay();
        if (onVisibilityChange) {
          document.removeEventListener("visibilitychange", onVisibilityChange);
        }
        if ($dayoff.is(":checked")) {
          try {
            localStorage.setItem(POPUP_HIDE_KEY, String(getTomorrowMidnight()));
          } catch (_) {}
        }
        hidePopup($overlay);
      });
    });
  });
})();
