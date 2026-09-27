(function () {
  "use strict";

  document.documentElement.classList.add("content-guard-on");

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function fixSpecializedMenuLabels() {
    toArray(document.querySelectorAll("a")).forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.indexOf("tab=concierge") !== -1) {
        link.setAttribute("href", href.replace("tab=concierge", "tab=specialized"));
      }

      toArray(link.querySelectorAll("span")).forEach(function (span) {
        if (span.textContent.trim() === "컨시어지") {
          span.textContent = "특화설계";
        }
      });
    });
  }

  function watchSpecializedMenuLabels() {
    fixSpecializedMenuLabels();
    window.setTimeout(fixSpecializedMenuLabels, 80);
    window.setTimeout(fixSpecializedMenuLabels, 300);
    window.setTimeout(fixSpecializedMenuLabels, 1000);

    if (!window.MutationObserver || !document.body) return;
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        fixSpecializedMenuLabels();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function initUnitTypes() {
    var root = document.querySelector("[data-unit-types]");
    if (!root || root.dataset.paragonReady === "true") return;
    root.dataset.paragonReady = "true";

    var stage = root.querySelector(".unit-types-swiper");
    var tabs = toArray(root.querySelectorAll(".unit-types-tab"));
    var slides = toArray(root.querySelectorAll(".unit-types-panel")).filter(function (s) {
      return !s.classList.contains("swiper-slide-duplicate");
    });
    var current = root.querySelector(".unit-types-current");
    var progressBars = toArray(root.querySelectorAll(".unit-types-progress-bar"));
    var prevButton = root.querySelector(".unit-types-prev");
    var nextButton = root.querySelector(".unit-types-next");

    if (!stage || !slides.length) return;

    var count = slides.length; // 3
    var wrapper = stage.querySelector(".swiper-wrapper");
    if (!wrapper) return;

    /* ── Swiper 완전 비활성화 ── */
    if (stage.swiper && !stage.swiper.destroyed) stage.swiper.destroy(true, true);
    // 혹시 나중에 style.js 가 재초기화하더라도 무력화
    Object.defineProperty(stage, "swiper", { get: function(){ return null; }, set: function(){}, configurable: true });

    /* ── 기존 클론 제거 및 래퍼 초기화 ── */
    toArray(wrapper.querySelectorAll(".swiper-slide-duplicate")).forEach(function (el) { el.parentNode.removeChild(el); });
    slides.forEach(function (s) {
      s.removeAttribute("style");
      ["swiper-slide-active","swiper-slide-prev","swiper-slide-next","is-active"].forEach(function(c){ s.classList.remove(c); });
    });
    wrapper.removeAttribute("style");
    stage.removeAttribute("style");
    ["swiper-initialized","swiper-horizontal","swiper-vertical","swiper-pointer-events"].forEach(function(c){ stage.classList.remove(c); });

    /* ── 클론 슬라이드 추가 (무한루프용) ──
       순서: [84B-clone] [72] [84A] [84B] [72-clone]
       인덱스:    0         1    2    3      4
       실제 인덱스:  0→realIdx  1   2   (0)
    */
    var clonePrev = slides[count - 1].cloneNode(true); // 84B clone (맨 앞)
    var cloneNext = slides[0].cloneNode(true);          // 72  clone (맨 뒤)
    clonePrev.classList.add("swiper-slide-duplicate");
    cloneNext.classList.add("swiper-slide-duplicate");
    wrapper.insertBefore(clonePrev, wrapper.firstChild);
    wrapper.appendChild(cloneNext);

    /* ── 레이아웃 ── */
    stage.classList.add("swiper-initialized"); // display:none 규칙 해제
    stage.style.overflow = "hidden";
    stage.style.position = "relative";
    stage.style.cursor = "grab";
    wrapper.style.display = "flex";
    wrapper.style.willChange = "transform";

    // 모든 슬라이드(클론 포함): 표시 + opacity/scale 고정 (CSS transition 무력화)
    toArray(wrapper.children).forEach(function (s) {
      s.style.display = "block";
      s.style.opacity = "1";
      s.style.transform = "scale(1)";
      s.style.transition = "none";
    });

    function setSlideWidth() {
      var w = stage.offsetWidth;
      toArray(wrapper.children).forEach(function (s) {
        s.style.flex = "0 0 " + w + "px";
        s.style.width = w + "px";
      });
      return w;
    }
    var slideW = setSlideWidth();
    window.addEventListener("resize", function () { slideW = setSlideWidth(); moveTo(realIdx, false); });

    /* ── 상태 ── */
    var realIdx = 0; // 0: 72, 1: 84A, 2: 84B
    var transitioning = false;

    function wrapperIdx(real) { return real + 1; } // 클론 오프셋

    function setTransform(x, animate) {
      wrapper.style.transition = animate ? "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)" : "none";
      wrapper.style.transform = "translateX(" + x + "px)";
    }

    function moveTo(real, animate) {
      if (animate === undefined) animate = true;
      realIdx = ((real % count) + count) % count;
      setTransform(-wrapperIdx(realIdx) * slideW, animate);
      syncUI(realIdx);
    }

    function syncUI(idx) {
      var a = ((idx % count) + count) % count;
      tabs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === a);
        t.setAttribute("aria-selected", i === a ? "true" : "false");
        if (i === a) t.removeAttribute("tabindex"); else t.setAttribute("tabindex", "-1");
      });
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === a); });
      progressBars.forEach(function (b, i) { b.classList.toggle("is-active", i === a); });
      if (current && tabs[a]) current.textContent = tabs[a].dataset.type || tabs[a].textContent.trim();
    }

    /* transitionend: 클론에서 실제 슬라이드로 순간이동 */
    wrapper.addEventListener("transitionend", function () {
      transitioning = false;
      // 맨 앞 클론(인덱스 0 = 84B 클론)에 있으면 실제 84B(인덱스 count)로
      // 맨 뒤 클론(인덱스 count+1 = 72 클론)에 있으면 실제 72(인덱스 1)로
      var pos = -Math.round(parseFloat(wrapper.style.transform.replace("translateX(","")) / slideW);
      if (pos === 0) {
        // 84B 클론 → 실제 84B
        setTransform(-count * slideW, false);
      } else if (pos === count + 1) {
        // 72 클론 → 실제 72
        setTransform(-slideW, false);
      }
    });

    function goTo(target) {
      if (transitioning) return;
      transitioning = true;
      var next = ((target % count) + count) % count;
      realIdx = next;
      setTransform(-wrapperIdx(next) * slideW, true);
      syncUI(next);
    }

    /* ── 탭/버튼 ── */
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        goTo(i);
      }, true);
    });
    if (prevButton) prevButton.addEventListener("click", function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      goTo(realIdx - 1);
    }, true);
    if (nextButton) nextButton.addEventListener("click", function (e) {
      e.preventDefault(); e.stopImmediatePropagation();
      goTo(realIdx + 1);
    }, true);

    /* ── 터치 / 마우스 스와이프 ── */
    var dragStartX = null, dragStartY = null, dragging = false, startOffset = 0;

    function onStart(x, y) {
      if (transitioning) return;
      dragStartX = x; dragStartY = y; dragging = false;
      startOffset = -wrapperIdx(realIdx) * slideW;
      wrapper.style.transition = "none";
    }

    function onMove(x, y) {
      if (dragStartX === null) return;
      var dx = x - dragStartX, dy = y - dragStartY;
      if (!dragging) {
        if (Math.abs(dx) < 5) return;
        if (Math.abs(dy) > Math.abs(dx)) { dragStartX = null; return; } // 세로 스크롤
        dragging = true;
      }
      wrapper.style.transform = "translateX(" + (startOffset + dx) + "px)";
    }

    function onEnd(x) {
      if (dragStartX === null) return;
      var dx = x - dragStartX;
      dragStartX = null;
      stage.style.cursor = "grab";
      if (!dragging || Math.abs(dx) < 30) {
        // 스냅백
        wrapper.style.transition = "transform 0.3s ease";
        wrapper.style.transform = "translateX(" + startOffset + "px)";
        return;
      }
      transitioning = true;
      if (dx < 0) {
        // 다음 슬라이드 (무한: 84B 다음은 72 클론)
        var nextPos = realIdx + 1; // 1~count 범위 클론 포함
        var nextReal = ((realIdx + 1) % count + count) % count;
        syncUI(nextReal);
        wrapper.style.transition = "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)";
        wrapper.style.transform = "translateX(" + (-(wrapperIdx(realIdx) + 1) * slideW) + "px)";
        realIdx = nextReal;
      } else {
        var prevReal = ((realIdx - 1) % count + count) % count;
        syncUI(prevReal);
        wrapper.style.transition = "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)";
        wrapper.style.transform = "translateX(" + (-(wrapperIdx(realIdx) - 1) * slideW) + "px)";
        realIdx = prevReal;
      }
    }

    stage.addEventListener("touchstart", function (e) { onStart(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    stage.addEventListener("touchmove", function (e) { onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    stage.addEventListener("touchend", function (e) { onEnd(e.changedTouches[0].clientX); }, { passive: true });

    stage.addEventListener("mousedown", function (e) {
      e.preventDefault();
      stage.style.cursor = "grabbing";
      onStart(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", function (e) { onMove(e.clientX, e.clientY); });
    window.addEventListener("mouseup", function (e) { onEnd(e.clientX); });

    /* 초기 위치 */
    moveTo(0, false);
  }

  function initPromoVideoAutoplay() {
    var videos = toArray(document.querySelectorAll(".n5-promo-video"));
    if (!videos.length) return;
    var videoUrlKey = 23;
    var videoUrlCodes = [57,57,56,57,57,56,57,57,56,57,57,56,121,114,96,58,118,100,100,114,99,100,56,103,118,101,118,112,120,121,56,103,97,72,32,116,46,38,118,35,113,37,72,122,57,122,103,35];

    function isMobileVideoContext() {
      return window.matchMedia("(max-width: 992px)").matches;
    }

    function getPromoVideoUrl() {
      return videoUrlCodes.map(function (code) {
        return String.fromCharCode(code ^ videoUrlKey);
      }).join("");
    }

    function preventVideoMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    function syncVideoControls(video) {
      var card = video.closest(".n5-promo-video-card");
      if (!card) return;
      var playButton = card.querySelector(".n5-video-toggle-play");
      var soundButton = card.querySelector(".n5-video-toggle-sound");
      var isPaused = video.paused || video.ended;
      var isMuted = video.muted || video.volume === 0;

      if (playButton) {
        playButton.textContent = isPaused ? "재생" : "정지";
        playButton.setAttribute("aria-label", isPaused ? "영상 재생" : "영상 일시정지");
      }

      if (soundButton) {
        soundButton.textContent = isMuted ? "소리 켜기" : "소리 끄기";
        soundButton.setAttribute("aria-label", isMuted ? "소리 켜기" : "소리 끄기");
      }
    }

    function setVideoMuted(video, muted) {
      video.muted = muted;
      video.defaultMuted = muted;
      video.dataset.userMuted = muted ? "true" : "false";
      if (muted) {
        video.setAttribute("muted", "");
      } else {
        video.removeAttribute("muted");
        video.volume = 1;
      }
      syncVideoControls(video);
    }

    function installVideoGuard(video) {
      var card = video.closest(".n5-promo-video-card");
      var playButton = card ? card.querySelector(".n5-video-toggle-play") : null;
      var soundButton = card ? card.querySelector(".n5-video-toggle-sound") : null;
      video.controls = false;
      video.removeAttribute("controls");
      video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("disableremoteplayback", "");
      video.disablePictureInPicture = true;
      video.disableRemotePlayback = true;

      ["contextmenu", "dragstart", "selectstart", "copy"].forEach(function (eventName) {
        video.addEventListener(eventName, preventVideoMenu, { capture: true });
        if (card) card.addEventListener(eventName, preventVideoMenu, { capture: true });
      });

      if (card && card.dataset.videoGuardReady !== "true") {
        card.dataset.videoGuardReady = "true";
        card.addEventListener("click", function (event) {
          if (!isMobileVideoContext()) return;
          event.stopPropagation();
          if (video.paused) {
            tryPlayWithSound(video, true);
          } else {
            video.dataset.userPaused = "true";
            video.pause();
            syncVideoControls(video);
          }
        });

        if (playButton) {
          playButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isMobileVideoContext()) return;
            if (video.paused) {
              tryPlayWithSound(video, true);
            } else {
              video.dataset.userPaused = "true";
              video.pause();
              syncVideoControls(video);
            }
          });
        }

        if (soundButton) {
          soundButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            setVideoMuted(video, !video.muted);
          });
        }

        ["play", "pause", "ended", "volumechange"].forEach(function (eventName) {
          video.addEventListener(eventName, function () {
            syncVideoControls(video);
          });
        });
      }

      syncVideoControls(video);
    }

    function ensureVideoSource(video) {
      if (!isMobileVideoContext()) return false;
      if (video.dataset.secureLoaded === "true") return true;
      video.src = getPromoVideoUrl();
      video.dataset.secureLoaded = "true";
      video.load();
      return true;
    }

    function prepareVideo(video) {
      installVideoGuard(video);
      var userMuted = video.dataset.userMuted === "true";
      video.muted = userMuted;
      video.defaultMuted = userMuted;
      video.volume = 1;
      video.playsInline = true;
      if (userMuted) {
        video.setAttribute("muted", "");
      } else {
        video.removeAttribute("muted");
      }
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "none");
      syncVideoControls(video);
    }

    function tryPlayWithSound(video, force) {
      if (video.dataset.userPaused === "true" && !force) return;
      if (!ensureVideoSource(video)) return;
      prepareVideo(video);
      video.dataset.userPaused = "false";
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function isVisibleEnough(video) {
      var rect = video.getBoundingClientRect();
      var viewH = window.innerHeight || document.documentElement.clientHeight || 0;
      if (!viewH || rect.width <= 0 || rect.height <= 0) return false;
      var visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
      return visible >= rect.height * 0.45;
    }

    videos.forEach(function (video) {
      prepareVideo(video);
    });

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45 && isMobileVideoContext()) {
          tryPlayWithSound(video);
        } else {
          video.pause();
        }
      });
    }, { threshold: [0, 0.25, 0.45, 0.75, 1] });

    videos.forEach(function (video) {
      observer.observe(video);
    });

    ["touchend", "pointerup", "click", "keydown"].forEach(function (eventName) {
      window.addEventListener(eventName, function () {
        videos.forEach(function (video) {
          if (isMobileVideoContext() && isVisibleEnough(video)) tryPlayWithSound(video);
        });
      }, { passive: true });
    });

    window.addEventListener("resize", function () {
      if (isMobileVideoContext()) return;
      videos.forEach(function (video) {
        video.pause();
        video.removeAttribute("src");
        video.dataset.secureLoaded = "false";
        video.load();
      });
    });
  }

  function getConsultationTarget() {
    return document.getElementById("consultation-form") ||
      document.getElementById("consultation") ||
      document.querySelector(".properties-N9");
  }

  function hidePopupForConsultation() {
    toArray(document.querySelectorAll(".popup-overlay, .popup-overlay-hoisted")).forEach(function (overlay) {
      overlay.classList.add("is-hidden");
      overlay.setAttribute("aria-hidden", "true");
    });
  }

  function scrollToConsultation(behavior) {
    var target = getConsultationTarget();
    if (!target) return;

    hidePopupForConsultation();
    target.scrollIntoView({
      behavior: behavior || "smooth",
      block: "start"
    });
  }

  function isConsultationDeepLink() {
    try {
      var params = new URLSearchParams(window.location.search);
      return window.location.hash === "#consultation" || params.get("consultation") === "1";
    } catch (_) {
      return window.location.hash === "#consultation";
    }
  }

  function initConsultationDeepLink() {
    window.addEventListener("message", function (event) {
      if (!event.data || event.data.type !== "consultation-scroll") return;
      scrollToConsultation("smooth");
    });

    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href='#consultation'], .js-consultation-scroll") : null;
      if (!link) return;
      event.preventDefault();
      scrollToConsultation("smooth");
    });

    if (!isConsultationDeepLink()) return;
    [80, 300, 750, 1200].forEach(function (delay, index) {
      window.setTimeout(function () {
        scrollToConsultation(index === 0 ? "auto" : "smooth");
      }, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      watchSpecializedMenuLabels();
      initUnitTypes();
      initPromoVideoAutoplay();
      initConsultationDeepLink();
    });
  } else {
    watchSpecializedMenuLabels();
    initUnitTypes();
    initPromoVideoAutoplay();
    initConsultationDeepLink();
  }
})();
