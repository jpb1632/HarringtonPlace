(function () {
  function initLocationMagnifier() {
    var card = document.querySelector(".properties-N6 .n6-location-card");
    if (!card || card.dataset.locationMagnifierFallback === "true") return;

    var main = card.querySelector(".n6-location-main");
    var images = Array.prototype.slice.call(card.querySelectorAll(".n6-location-main > img"));
    if (!main || !images.length) return;

    var lens = card.querySelector(".n6-magnifier-lens");
    if (!lens) {
      lens = document.createElement("div");
      lens.className = "n6-magnifier-lens";
      card.appendChild(lens);
    }

    var zoom = 1.85;
    card.dataset.locationMagnifierFallback = "true";

    function isDesktop() {
      return window.innerWidth >= 993;
    }

    function hideLens() {
      card.classList.remove("is-magnifying");
    }

    function getActiveImage(clientX, clientY) {
      for (var i = 0; i < images.length; i += 1) {
        var rect = images[i].getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          return images[i];
        }
      }
      return null;
    }

    function syncLensImage(targetImg) {
      var src = targetImg.currentSrc || targetImg.src;
      if (src && lens.dataset.src !== src) {
        lens.style.backgroundImage = 'url("' + src + '")';
        lens.dataset.src = src;
      }
    }

    function moveLens(event) {
      if (!isDesktop()) {
        hideLens();
        return;
      }

      var activeImg = getActiveImage(event.clientX, event.clientY);
      if (!activeImg) {
        hideLens();
        return;
      }

      var cardRect = card.getBoundingClientRect();
      var imgRect = activeImg.getBoundingClientRect();
      var size = lens.offsetWidth || 310;
      var radius = size / 2;
      var x = event.clientX - cardRect.left;
      var y = event.clientY - cardRect.top;
      var clampedX = Math.max(radius, Math.min(cardRect.width - radius, x));
      var clampedY = Math.max(radius, Math.min(cardRect.height - radius, y));
      var imgX = Math.max(0, Math.min(imgRect.width, event.clientX - imgRect.left));
      var imgY = Math.max(0, Math.min(imgRect.height, event.clientY - imgRect.top));

      syncLensImage(activeImg);
      lens.style.left = clampedX + "px";
      lens.style.top = clampedY + "px";
      lens.style.backgroundSize = imgRect.width * zoom + "px " + imgRect.height * zoom + "px";
      lens.style.backgroundPosition =
        (-imgX * zoom + radius) + "px " + (-imgY * zoom + radius) + "px";
      card.classList.add("is-magnifying");
    }

    syncLensImage(images[0]);
    main.addEventListener("mouseenter", moveLens);
    main.addEventListener("mousemove", moveLens);
    main.addEventListener("mouseleave", hideLens);
    window.addEventListener("resize", hideLens);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLocationMagnifier);
  } else {
    initLocationMagnifier();
  }
}());
