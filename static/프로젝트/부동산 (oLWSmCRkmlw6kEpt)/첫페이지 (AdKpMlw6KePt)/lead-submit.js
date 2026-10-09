(function () {
  "use strict";

  var DEFAULT_GAS_WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbyQgRVQi1EwbyY1QwKHV7J7jh_T-8zgDiR1_AaTardaOm53evbB7uj90jL1FGBI_7JH9A/exec";

  function getWebhookUrl() {
    if (window.__LEAD_WEBHOOK_URL__) {
      return String(window.__LEAD_WEBHOOK_URL__).trim();
    }

    var meta = document.querySelector("meta[name='gas-webhook-url']");
    if (meta && meta.content) {
      return String(meta.content).trim();
    }

    return DEFAULT_GAS_WEBHOOK_URL;
  }

  function isValidWebhookUrl(url) {
    try {
      var parsed = new URL(url, window.location.href);
      return parsed.protocol === "https:" && parsed.hostname === "script.google.com";
    } catch (_) {
      return false;
    }
  }

  var GAS_WEBHOOK_URL = getWebhookUrl();

  var SUCCESS_MESSAGE = "상담신청이 접수되었습니다. 곧 연락드리겠습니다.";
  var FAILURE_MESSAGE = "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  var URL_REQUIRED_MESSAGE = "상담 접수 URL이 설정되지 않았습니다.";
  var URL_INVALID_MESSAGE = "상담 접수 URL 형식이 올바르지 않습니다.";

  var NAME_PATTERN = /^[A-Za-z\uAC00-\uD7A3]+$/;
  var PHONE_PATTERN = /^010\d{8}$/;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function sanitizeName(value) {
    return String(value || "").replace(/[^A-Za-z\uAC00-\uD7A3]/g, "").trim();
  }

  function sanitizePhone(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 11);
  }

  function getTodayString() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var date = String(now.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + date;
  }

  function setLoading(button, loading, mode) {
    if (!button) return;
    if (loading) {
      if (!button.dataset.defaultText) button.dataset.defaultText = button.innerHTML;
      button.disabled = true;
      if (mode === "spinner") {
        button.classList.add("is-loading");
        button.innerHTML =
          '<span class="consult-submit-spinner" aria-hidden="true"></span>' +
          '<span class="visually-hidden">전송중</span>';
      } else {
        button.classList.remove("is-loading");
        button.innerHTML = "전송중...";
      }
    } else {
      button.disabled = false;
      button.classList.remove("is-loading");
      if (button.dataset.defaultText) button.innerHTML = button.dataset.defaultText;
    }
  }

  function focusField(field) {
    if (!field) return;
    var customTrigger = field.parentElement && qs(".n9-select-trigger", field.parentElement);
    if (customTrigger && window.getComputedStyle(field).display === "none") {
      customTrigger.focus();
    } else if (typeof field.focus === "function") {
      field.focus();
    }
  }

  function enhanceMobileSelect(select) {
    if (!select || !select.parentElement) return;

    var inputset = select.parentElement;
    var label = qs("label[for='" + select.id + "']");
    var choices = Array.prototype.slice.call(select.options).filter(function (option) {
      return !option.disabled && option.value;
    });
    var root = document.createElement("div");
    var trigger = document.createElement("button");
    var list = document.createElement("div");
    var items = [];

    root.className = "n9-custom-select";
    trigger.type = "button";
    trigger.className = "n9-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", select.id + "-options");
    list.className = "n9-select-options";
    list.id = select.id + "-options";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", label ? label.textContent.trim() : select.name);
    list.hidden = true;

    function sync() {
      var selected = select.options[select.selectedIndex];
      var text = selected ? selected.textContent : "선택해 주세요";
      trigger.textContent = text;
      trigger.classList.toggle("is-placeholder", !select.value);
      trigger.setAttribute("aria-label", (label ? label.textContent.trim() : select.name) + ": " + text);
      items.forEach(function (item) {
        item.setAttribute("aria-selected", item.dataset.value === select.value ? "true" : "false");
      });
    }

    function close(focusTrigger) {
      list.hidden = true;
      root.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (focusTrigger) trigger.focus();
    }

    function focusOption(index) {
      if (items.length) items[Math.max(0, Math.min(index, items.length - 1))].focus();
    }

    function open() {
      list.hidden = false;
      root.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      var selectedIndex = choices.findIndex(function (option) { return option.value === select.value; });
      focusOption(selectedIndex < 0 ? 0 : selectedIndex);
    }

    function choose(item) {
      select.value = item.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close(true);
    }

    choices.forEach(function (option) {
      var item = document.createElement("div");
      item.className = "n9-select-option";
      item.setAttribute("role", "option");
      item.setAttribute("tabindex", "-1");
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.addEventListener("click", function () { choose(item); });
      list.appendChild(item);
      items.push(item);
    });

    trigger.addEventListener("click", function () {
      if (list.hidden) open();
      else close(false);
    });
    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !list.hidden) {
        event.preventDefault();
        close(true);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        if (list.hidden) {
          open();
        } else {
          var index = items.indexOf(document.activeElement);
          if (event.key === "Home") focusOption(0);
          else if (event.key === "End") focusOption(items.length - 1);
          else focusOption(index + (event.key === "ArrowDown" ? 1 : -1));
        }
      } else if ((event.key === "Enter" || event.key === " ") && items.indexOf(document.activeElement) !== -1) {
        event.preventDefault();
        choose(document.activeElement);
      } else if (event.key === "Tab") {
        close(false);
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (!root.contains(event.target)) close(false);
    });
    window.addEventListener("resize", function () {
      if (!window.matchMedia("(max-width: 992px)").matches) close(false);
    });
    select.addEventListener("change", sync);
    if (select.form) select.form.addEventListener("reset", function () { window.setTimeout(sync, 0); });

    root.appendChild(trigger);
    root.appendChild(list);
    inputset.appendChild(root);
    inputset.classList.add("n9-select-enhanced");
    sync();
  }

  function mapServerMessage(code) {
    var map = {
      source_required: "유입폼 정보가 없습니다.",
      name_required: "이름을 입력해 주세요.",
      name_invalid: "이름은 한글 또는 영문만 입력해 주세요.",
      phone_invalid: "휴대폰 번호는 010으로 시작하는 11자리 숫자만 입력해 주세요.",
      agree_required: "개인정보 수집/이용동의에 체크해 주세요.",
      purpose_required: "목적은 최소 하나 이상 선택해 주세요.",
      spam_blocked: "비정상 요청으로 차단되었습니다.",
      rate_limited: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      duplicate_request: "동일한 요청이 이미 접수되었습니다. 잠시 후 다시 시도해 주세요.",
      mail_quota_exceeded: "메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
    };
    if (map[code]) return map[code];
    if (code && typeof code === "string") return "서버 응답: " + code;
    return FAILURE_MESSAGE;
  }

  function validateCommon(payload) {
    if (!payload.name) return { ok: false, message: "이름을 입력해 주세요.", key: "name" };
    if (!NAME_PATTERN.test(payload.name)) return { ok: false, message: "이름은 한글 또는 영문만 입력해 주세요.", key: "name" };
    if (!PHONE_PATTERN.test(payload.phone)) return { ok: false, message: "휴대폰 번호는 010으로 시작하는 11자리 숫자만 입력해 주세요.", key: "phone" };
    if (!payload.agree) return { ok: false, message: "개인정보 수집/이용동의에 체크해 주세요.", key: "agree" };
    return { ok: true };
  }

  function validateConsultation(payload) {
    var common = validateCommon(payload);
    if (!common.ok) return common;
    if (!payload.visitDate) {
      return { ok: false, message: "방문날짜를 선택해 주세요.", key: "visitDate" };
    }
    if (payload.visitDate < getTodayString()) {
      return { ok: false, message: "방문날짜는 오늘 이후로 선택해 주세요.", key: "visitDate" };
    }
    if (!payload.visitTime) {
      return { ok: false, message: "방문시간을 선택해 주세요.", key: "visitTime" };
    }
    if (!payload.visitors) {
      return { ok: false, message: "방문인원을 선택해 주세요.", key: "visitors" };
    }
    return { ok: true };
  }

  async function sendToGAS(payload) {
    if (!GAS_WEBHOOK_URL) {
      throw new Error(URL_REQUIRED_MESSAGE);
    }
    if (!isValidWebhookUrl(GAS_WEBHOOK_URL)) {
      throw new Error(URL_INVALID_MESSAGE);
    }

    var params = new URLSearchParams();
    params.set("payload", JSON.stringify(payload));

    var response = await fetch(GAS_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      body: params
    });

    if (!response.ok) {
      throw new Error(FAILURE_MESSAGE);
    }

    var data;
    try {
      data = await response.json();
    } catch (_) {
      throw new Error(FAILURE_MESSAGE);
    }

    if (!data || data.result !== "success") {
      throw new Error(mapServerMessage(data && data.message));
    }

    return data;
  }

  function wireConsultationForm() {
    var section = qs(".properties-N9[id='vzMlw6KehW']");
    if (!section) return;

    var form = qs(".form-group form", section);
    if (!form) return;

    form.setAttribute("action", "javascript:void(0);");
    form.setAttribute("target", "_self");
    form.setAttribute("novalidate", "novalidate");

    var nameInput = qs("#properties-N9-inputset-a-1", form);
    var phoneInput = qs("#properties-N9-inputset-a-2", form);
    var visitDateInput = qs("#properties-N9-inputset-a-3", form);
    var visitTimeInput = qs("#properties-N9-inputset-a-4", form);
    var visitorsInput = qs("#properties-N9-inputset-a-5", form);
    var agreeInput = qs("#checkset-properties-N9-b-1", form);
    var submitBtn = qs("button[type='submit']", form);
    var honeypotInput = qs("#consult-honeypot");

    enhanceMobileSelect(visitTimeInput);
    enhanceMobileSelect(visitorsInput);

    if (nameInput) {
      var composing = false;
      nameInput.addEventListener("compositionstart", function () {
        composing = true;
      });
      nameInput.addEventListener("compositionend", function () {
        composing = false;
        nameInput.value = sanitizeName(nameInput.value);
      });
      nameInput.addEventListener("input", function (event) {
        if (composing || (event && event.isComposing)) return;
        nameInput.value = sanitizeName(nameInput.value);
      });
    }

    if (phoneInput) {
      phoneInput.setAttribute("inputmode", "numeric");
      phoneInput.setAttribute("maxlength", "11");
      phoneInput.addEventListener("input", function () {
        phoneInput.value = sanitizePhone(phoneInput.value);
      });
    }

    if (visitDateInput) {
      visitDateInput.setAttribute("min", getTodayString());
    }

    document.addEventListener(
      "submit",
      async function (event) {
        if (!event.target || event.target !== form) return;
        event.preventDefault();
        event.stopPropagation();

        var payload = {
          source: "consultation",
          name: sanitizeName(nameInput ? nameInput.value : ""),
          phone: sanitizePhone(phoneInput ? phoneInput.value : ""),
          purpose: ["방문예약"],
          visitDate: String(visitDateInput && visitDateInput.value ? visitDateInput.value : "").trim(),
          visitTime: String(visitTimeInput && visitTimeInput.value ? visitTimeInput.value : "").trim(),
          visitors: String(visitorsInput && visitorsInput.value ? visitorsInput.value : "").trim(),
          region: "",
          message: "",
          agree: !!(agreeInput && agreeInput.checked),
          honeypot: honeypotInput ? String(honeypotInput.value || "").trim() : ""
        };
        payload.message =
          "방문날짜: " +
          payload.visitDate +
          " / 방문시간: " +
          payload.visitTime +
          " / 방문인원: " +
          payload.visitors;

        if (nameInput) nameInput.value = payload.name;
        if (phoneInput) phoneInput.value = payload.phone;

        var check = validateConsultation(payload);
        if (!check.ok) {
          alert(check.message);
          if (check.key === "name") focusField(nameInput);
          if (check.key === "phone") focusField(phoneInput);
          if (check.key === "visitDate") focusField(visitDateInput);
          if (check.key === "visitTime") focusField(visitTimeInput);
          if (check.key === "visitors") focusField(visitorsInput);
          if (check.key === "agree") focusField(agreeInput);
          return;
        }

        setLoading(submitBtn, true);
        try {
          await sendToGAS(payload);
          alert(SUCCESS_MESSAGE);
          form.reset();
        } catch (error) {
          alert(error && error.message ? error.message : FAILURE_MESSAGE);
        } finally {
          setLoading(submitBtn, false);
        }
      },
      true
    );
  }

  function wireQuickBarForm() {
    var bar = qs(".fixed-consult-bar.is-split");
    if (!bar) return;

    var nameInput = qs(".consult-form input[type='text']", bar);
    var phoneInput = qs(".consult-form input[type='tel']", bar);
    var agreeInput = qs(".consult-privacy-check", bar);
    var submitBtn = qs(".consult-submit", bar);
    var honeypotInput = qs("#quick-honeypot", bar);

    if (!submitBtn) return;

    if (nameInput) {
      var composing = false;
      nameInput.addEventListener("compositionstart", function () {
        composing = true;
      });
      nameInput.addEventListener("compositionend", function () {
        composing = false;
        nameInput.value = sanitizeName(nameInput.value);
      });
      nameInput.addEventListener("input", function (event) {
        if (composing || (event && event.isComposing)) return;
        nameInput.value = sanitizeName(nameInput.value);
      });
    }

    if (phoneInput) {
      phoneInput.setAttribute("inputmode", "numeric");
      phoneInput.setAttribute("maxlength", "11");
      phoneInput.addEventListener("input", function () {
        phoneInput.value = sanitizePhone(phoneInput.value);
      });
    }

    document.addEventListener(
      "click",
      async function (event) {
        var button = event.target && event.target.closest ? event.target.closest(".consult-submit") : null;
        if (!button || button !== submitBtn) return;

        event.preventDefault();
        event.stopPropagation();

        var payload = {
          source: "quick_bar",
          name: sanitizeName(nameInput ? nameInput.value : ""),
          phone: sanitizePhone(phoneInput ? phoneInput.value : ""),
          agree: !!(agreeInput && agreeInput.checked),
          honeypot: honeypotInput ? String(honeypotInput.value || "").trim() : ""
        };

        if (nameInput) nameInput.value = payload.name;
        if (phoneInput) phoneInput.value = payload.phone;

        var check = validateCommon(payload);
        if (!check.ok) {
          alert(check.message);
          if (check.key === "name") focusField(nameInput);
          if (check.key === "phone") focusField(phoneInput);
          if (check.key === "agree") focusField(agreeInput);
          return;
        }

        setLoading(submitBtn, true, "spinner");
        try {
          await sendToGAS(payload);
          alert(SUCCESS_MESSAGE);
          if (nameInput) nameInput.value = "";
          if (phoneInput) phoneInput.value = "";
          if (agreeInput) agreeInput.checked = false;
          if (honeypotInput) honeypotInput.value = "";
        } catch (error) {
          alert(error && error.message ? error.message : FAILURE_MESSAGE);
        } finally {
          setLoading(submitBtn, false, "spinner");
        }
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      wireConsultationForm();
      wireQuickBarForm();
    });
  } else {
    wireConsultationForm();
    wireQuickBarForm();
  }
})();

