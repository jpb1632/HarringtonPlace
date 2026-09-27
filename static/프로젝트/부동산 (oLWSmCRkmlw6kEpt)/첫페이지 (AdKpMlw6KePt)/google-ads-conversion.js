(function () {
  "use strict";

  var CALL_CONVERSION_ID = "AW-18047512233/7l9-CIK79L4cEKnd3J1D";
  var CALL_VALUE = 1.0;
  var CALL_CURRENCY = "KRW";

  function getGtag() {
    try {
      if (window.parent && window.parent !== window && typeof window.parent.gtag === "function") {
        return window.parent.gtag;
      }
    } catch (error) {
      // Fall back to the current frame when parent access is blocked.
    }

    return typeof window.gtag === "function" ? window.gtag : null;
  }

  window.gtag_report_conversion = function (url) {
    var redirected = false;
    var gtag = getGtag();
    var callback = function () {
      if (redirected) return;
      redirected = true;
      if (typeof url !== "undefined" && url) {
        window.location = url;
      }
    };

    if (gtag) {
      window.setTimeout(callback, 800);
      gtag("event", "conversion", {
        send_to: CALL_CONVERSION_ID,
        value: CALL_VALUE,
        currency: CALL_CURRENCY,
        event_callback: callback
      });
      return false;
    }

    callback();
    return false;
  };

  function bindCallConversions() {
    var links = document.querySelectorAll('a[href^="tel:"]');
    Array.prototype.forEach.call(links, function (link) {
      if (link.dataset.adsCallConversionBound === "true") return;
      link.dataset.adsCallConversionBound = "true";

      link.addEventListener("click", function (event) {
        var url = link.getAttribute("href");
        if (!url) return;
        event.preventDefault();
        window.gtag_report_conversion(url);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCallConversions);
  } else {
    bindCallConversions();
  }
})();
