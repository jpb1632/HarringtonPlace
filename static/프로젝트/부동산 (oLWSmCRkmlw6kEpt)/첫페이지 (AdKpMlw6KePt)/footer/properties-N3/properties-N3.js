(function() {
  $(function() {
    var NAME_PATTERN = /^[A-Za-z\uAC00-\uD7A3]+$/;
    var PHONE_PATTERN = /^010\d{8}$/;

    function sanitizeName(value) {
      return String(value || "").replace(/[^A-Za-z\uAC00-\uD7A3]/g, "");
    }

    function sanitizePhone(value) {
      return String(value || "").replace(/\D/g, "").slice(0, 11);
    }

    $(".fixed-consult-bar.is-split").each(function() {
      const $block = $(this);
      const $nameInput = $block.find(".consult-form input[type='text']").first();
      const $phoneInput = $block.find(".consult-form input[type='tel']").first();
      const $privacyCheck = $block.find(".consult-privacy-check").first();
      const $submitBtn = $block.find(".consult-submit").first();

      if ($nameInput.length) {
        let isComposing = false;
        $nameInput.attr({ pattern: "[A-Za-z가-힣]+" });
        $nameInput.off("compositionstart.nameSanitize compositionend.nameSanitize input.nameSanitize");

        $nameInput.on("compositionstart.nameSanitize", function() {
          isComposing = true;
        });

        $nameInput.on("compositionend.nameSanitize", function() {
          isComposing = false;
          const normalized = sanitizeName($(this).val());
          if ($(this).val() !== normalized) {
            $(this).val(normalized);
          }
        });

        $nameInput.on("input.nameSanitize", function(event) {
          if (isComposing || (event.originalEvent && event.originalEvent.isComposing)) return;
          const normalized = sanitizeName($(this).val());
          if ($(this).val() !== normalized) {
            $(this).val(normalized);
          }
        });
      }

      if ($phoneInput.length) {
        $phoneInput.attr({
          inputmode: "numeric",
          maxlength: "11",
          pattern: "010[0-9]{8}"
        });

        $phoneInput.off("input.phoneSanitize").on("input.phoneSanitize", function() {
          const normalized = sanitizePhone($(this).val());
          if ($(this).val() !== normalized) {
            $(this).val(normalized);
          }
        });
      }

      if (!$privacyCheck.length || !$submitBtn.length) return;

      $submitBtn.off("click.privacyConsentGuard").on("click.privacyConsentGuard", function(event) {
        if ($nameInput.length) {
          const name = sanitizeName($nameInput.val());
          $nameInput.val(name);
          if (!name) {
            event.preventDefault();
            alert("\uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
            $nameInput.trigger("focus");
            return;
          }
          if (!NAME_PATTERN.test(name)) {
            event.preventDefault();
            alert("\uC774\uB984\uC740 \uD55C\uAE00 \uB610\uB294 \uC601\uC5B4\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
            $nameInput.trigger("focus");
            return;
          }
        }

        if ($phoneInput.length) {
          const phone = sanitizePhone($phoneInput.val());
          $phoneInput.val(phone);
          if (!PHONE_PATTERN.test(phone)) {
            event.preventDefault();
            alert("\uD734\uB300\uD3F0 \uBC88\uD638\uB294 010\uC73C\uB85C \uC2DC\uC791\uD558\uB294 11\uC790\uB9AC \uC22B\uC790\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
            $phoneInput.trigger("focus");
            return;
          }
        }

        if ($privacyCheck.is(":checked")) return;
        event.preventDefault();
        alert("\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1/\uC774\uC6A9\uB3D9\uC758\uC5D0 \uCCB4\uD06C\uD574 \uC8FC\uC138\uC694.");
        $privacyCheck.trigger("focus");
      });
    });
  });
})();