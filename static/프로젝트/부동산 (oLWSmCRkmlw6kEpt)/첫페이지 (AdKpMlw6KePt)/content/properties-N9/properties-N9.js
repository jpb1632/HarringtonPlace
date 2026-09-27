(function() {
  $(function() {
    $(".properties-N9[id='vzMlw6KehW']").each(function() {
      const $block = $(this);
      const $checksetWrap = $block.find(".checkset-wrap");
      const NAME_PATTERN = /^[A-Za-z\uAC00-\uD7A3]+$/;
      const PHONE_PATTERN = /^010\d{8}$/;
      const sanitizeName = (value) => String(value || "").replace(/[^A-Za-z\uAC00-\uD7A3]/g, "");
      const sanitizePhone = (value) => String(value || "").replace(/\D/g, "").slice(0, 11);

      if ($checksetWrap.length) {
        const $validator = $("<input>", {
          type: "text",
          required: true,
          style: "position: absolute; opacity: 0; pointer-events: none;",
          tabindex: -1
        }).insertBefore($checksetWrap.find(".checkset-input").first());

        const $groupChecks = $checksetWrap.find(".checkset-input");
        $groupChecks.prop("required", false);

        $groupChecks.on("change", function() {
          if ($groupChecks.is(":checked")) {
            $validator.val("checked");
            $validator[0].setCustomValidity("");
          } else {
            $validator.val("");
            $validator[0].setCustomValidity("\uBAA9\uC801\uC740 \uCD5C\uC18C \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
          }
        });

        $validator.val("");
        $validator[0].setCustomValidity("\uBAA9\uC801\uC740 \uCD5C\uC18C \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
      }

      const $form = $block.find(".form-group form").first();
      const $nameInput = $form.find("#properties-N9-inputset-a-1, input[name='성함'], input[type='text']").first();
      const $privacyCheck = $block.find(".contents-agree .checkset-input[type='checkbox']").first();
      const $phoneInput = $form.find("#properties-N9-inputset-a-2, input[type='tel']").first();

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

      if ($form.length && $privacyCheck.length) {
        $privacyCheck.prop("required", false);
        $form.off("submit.privacyConsentGuard").on("submit.privacyConsentGuard", function(event) {
          if ($nameInput.length) {
            const name = sanitizeName($nameInput.val());
            $nameInput.val(name);
            if (!name) {
              event.preventDefault();
              alert("\uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
              $nameInput.trigger("focus");
              return false;
            }
            if (!NAME_PATTERN.test(name)) {
              event.preventDefault();
              alert("\uC774\uB984\uC740 \uD55C\uAE00 \uB610\uB294 \uC601\uC5B4\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
              $nameInput.trigger("focus");
              return false;
            }
          }

          if ($phoneInput.length) {
            const phone = sanitizePhone($phoneInput.val());
            $phoneInput.val(phone);
            if (!PHONE_PATTERN.test(phone)) {
              event.preventDefault();
              alert("\uD734\uB300\uD3F0 \uBC88\uD638\uB294 010\uC73C\uB85C \uC2DC\uC791\uD558\uB294 11\uC790\uB9AC \uC22B\uC790\uB9CC \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
              $phoneInput.trigger("focus");
              return false;
            }
          }

          if (!$privacyCheck.is(":checked")) {
            event.preventDefault();
            alert("\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1/\uC774\uC6A9\uB3D9\uC758\uC5D0 \uCCB4\uD06C\uD574 \uC8FC\uC138\uC694.");
            $privacyCheck.trigger("focus");
            return false;
          }

          return true;
        });
      }
    });
  });
})();