(function () {
  "use strict";

  if (window.__imageGuardInitialized) return;
  window.__imageGuardInitialized = true;

  const editableSelector =
    'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

  document.addEventListener("contextmenu", function (event) {
    const target = event.target;
    if (target instanceof Element && target.closest(editableSelector)) return;
    event.preventDefault();
  }, { capture: true });

  document.addEventListener("dragstart", function (event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(editableSelector)) return;
    const link = target.closest("a");
    if (target.closest("img, picture, video") ||
        (link && link.querySelector("img, picture, video"))) {
      event.preventDefault();
    }
  }, { capture: true });

  // Do not cancel touch, pointer, click or keyboard events: scrolling,
  // sliders, telephone links and reservation fields must remain usable.
})();
