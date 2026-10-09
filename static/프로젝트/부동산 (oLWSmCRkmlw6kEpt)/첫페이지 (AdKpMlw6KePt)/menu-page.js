(function () {
  const SITE_NAME = "의정부역 해링턴플레이스";
  const FIXED_CONTENT_TITLE = "의정부역 해링턴플레이스";
  const CONTENT_TITLE_LOGO_SRC = "../../../../new-assets/paragon/logo_on_p1.png";
  function initBasicContentGuard() {
    if (window.__basicContentGuardInitialized) return;
    window.__basicContentGuardInitialized = true;
    document.documentElement.classList.add("content-guard-on");

    const editableSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
    const isEditable = function(target) {
      return !!(target && target.closest && target.closest(editableSelector));
    };

    document.addEventListener(
      "contextmenu",
      function (event) {
        if (isEditable(event.target)) return;
        event.preventDefault();
      },
      { capture: true }
    );

    document.addEventListener(
      "selectstart",
      function (event) {
        if (isEditable(event.target)) return;
        event.preventDefault();
      },
      { capture: true }
    );

    document.addEventListener(
      "copy",
      function (event) {
        if (isEditable(event.target)) return;
        event.preventDefault();
      },
      { capture: true }
    );

    document.addEventListener(
      "cut",
      function (event) {
        if (isEditable(event.target)) return;
        event.preventDefault();
      },
      { capture: true }
    );

    document.addEventListener(
      "dragstart",
      function (event) {
        const target = event.target;
        if (!target) return;
        if (target.tagName === "IMG" || target.closest("img")) {
          event.preventDefault();
        }
      },
      { capture: true }
    );

    document.addEventListener(
      "keydown",
      function (event) {
        const key = String(event.key || "").toLowerCase();
        const ctrlOrMeta = event.ctrlKey || event.metaKey;

        if (key === "f12" || event.keyCode === 123) {
          event.preventDefault();
          return;
        }

        if (ctrlOrMeta && event.shiftKey && (key === "i" || key === "j" || key === "c" || key === "k")) {
          event.preventDefault();
          return;
        }

        if (ctrlOrMeta && (key === "u" || key === "s")) {
          event.preventDefault();
        }
      },
      { capture: true }
    );
  }

  const MENU_CONFIG = {
    business: {
      label: "사업안내",
      topIndex: 0,
      tabs: [
        { key: "overview", label: "사업개요" },
        { key: "location", label: "입지환경" },
        { key: "premium", label: "프리미엄" },
      ],
    },
    complex: {
      label: "단지안내",
      topIndex: 1,
      tabs: [
        { key: "siteplan", label: "단지배치도" },
        { key: "unitplan", label: "동호수배치도" },
        { key: "floors", label: "층별안내" },
      ],
    },
    type: {
      label: "타입안내",
      topIndex: 2,
      tabs: [
        { key: "type", label: "타입안내" },
      ],
    },
    route: {
      label: "층별안내",
      topIndex: 1,
      tabs: [{ key: "directions", label: "층별안내" }],
    },
  };

  const TAB_ALIASES = {
    complex: {
      concierge: "specialized",
    },
  };

  function normalizeTabKey(group, tab) {
    return (TAB_ALIASES[group] && TAB_ALIASES[group][tab]) || tab;
  }

  function ensureFloorGuideMenu() {
    document.querySelectorAll(".header-sublist, .fullmenu-sublist").forEach(function (list) {
      if (!list.querySelector('a[href*="group=complex"]') || list.querySelector('a[href*="tab=floors"]')) return;
      var full = list.classList.contains("fullmenu-sublist");
      var item = document.createElement("li");
      item.className = full ? "fullmenu-subitem" : "header-subitem";
      var link = document.createElement("a");
      link.className = full ? "p1 fullmenu-sublink" : "p2 header-sublink";
      link.href = "./menu-page.html?v=20261009-release&group=complex&tab=floors";
      var text = document.createElement("span");
      text.textContent = "층별안내";
      link.appendChild(text);
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function removeUnavailableMenuItems() {
    ensureFloorGuideMenu();
    Array.prototype.slice.call(document.querySelectorAll("a")).forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (!/[?&]tab=(community|specialized|concierge)(?:&|$)/.test(href)) return;
      var item = link.closest("li");
      if (item) item.remove();
      else link.remove();
    });
  }

  function watchUnavailableMenuItems() {
    removeUnavailableMenuItems();
    window.setTimeout(removeUnavailableMenuItems, 80);
    window.setTimeout(removeUnavailableMenuItems, 300);
    window.setTimeout(removeUnavailableMenuItems, 1000);

    if (!window.MutationObserver || !document.body) return;
    let pending = false;
    const observer = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        pending = false;
        removeUnavailableMenuItems();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  const TYPE_VARIANTS = {
    type: {
      groups: [
        {
          key: "floorplan",
          label: "타입",
          hidePrimary: true,
          items: [
            { key: "59", label: "59", image: "../../../../new-assets/paragon/59.png?v=F6835590" },
            { key: "77", label: "77", image: "../../../../new-assets/paragon/77.png?v=7BE93F2D" },
            { key: "84a", label: "84A", image: "../../../../new-assets/paragon/84a.png?v=0F90E2D8" },
            { key: "84b", label: "84B", image: "../../../../new-assets/paragon/84b.png?v=011E3EBB" },
            { key: "84c", label: "84C", image: "../../../../new-assets/paragon/84c.png?v=2AD3C819" },
            { key: "134p", label: "134P", image: "../../../../new-assets/paragon/134p.png?v=A0EBFA19" },
            { key: "136p", label: "136P", image: "../../../../new-assets/paragon/136p.png?v=67594A9A" },
          ],
        },
      ],
    },
  };

  function getTypeVariantGroups(tab) {
    const config = TYPE_VARIANTS[tab];
    if (!config || !Array.isArray(config.groups)) return [];
    return config.groups;
  }

  function getTypeVariantItems(tab) {
    return getTypeVariantGroups(tab).flatMap((group) => group.items || []);
  }

  function getDefaultTypeVariant(tab) {
    const groups = getTypeVariantGroups(tab);
    if (!groups.length) return "";
    const firstGroup = groups[0];
    const firstItem = Array.isArray(firstGroup.items) ? firstGroup.items[0] : null;
    return firstItem ? firstItem.key : "";
  }

  function getSelectedTypeVariant(tab, variantKey) {
    const items = getTypeVariantItems(tab);
    return items.find((item) => item.key === variantKey) || items[0] || null;
  }

  function getSelectedTypeVariantGroup(tab, variantKey) {
    const groups = getTypeVariantGroups(tab);
    if (!groups.length) return null;
    return (
      groups.find((group) =>
        Array.isArray(group.items) && group.items.some((item) => item.key === variantKey)
      ) || groups[0]
    );
  }

  let mobileLayoutGuardBound = false;

  const CONTENT_CONFIG = {
    business: {
      overview: {
        title: "의정부역 해링턴플레이스 사업개요",
        subtitle: "40층의 존재감, 새로운 주거의 시작",
        copy: "지하 2층부터 지상 40층까지, 총 150세대로 구성된 주상복합",
        copySub: "",
        image: "",
        canvasLayout: [
          {
            type: "image",
            src: "../../../../new-assets/paragon/main2_p1.png?v=4A380819",
          },
        ],
        specs: [
          ["사업명", "의정부시 의정부동 100-1, 2번지 주상복합 신축공사", "대지위치", "의정부시 의정부동 100-1, 100-2번지 일원"],
          ["건축규모", "지하2층, 지상40층 / 150세대", "대지면적", "1,834.00㎡ (554.79평)"],
          ["분양/준공", "24년06월 / 26년10월(예정)", "연면적", "28,560.39㎡ (8,639.51평)"],
          ["주차대수", "아파트: 184대(법정: 170대) / 근생: 18대(법정: 12.1대)"],
        ],
        notes: [
          "본 홍보물에 사용된 CG 및 일러스트는 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.",
          "상기 개발계획도, 지역도 상에 기재된 교통, 학교, 공원, 상업시설 등 각종 개발 계획은 사업 진행과정 및 관계기관의 사정에 따라 변동 또는 취소될 수 있으며 이는 당사와 무관합니다.",
          "단지 인근의 각종 개발계획 및 도로 등의 기반시설은 인·허가나 정부 시책에 따라 변경 및 취소 가능한 바, 해당 인·허가청 및 현장에서 확인하시기 바라며 시행사 및 시공사와 무관합니다.",
        ],
      },
      location: {
        title: "의정부역 해링턴플레이스 입지환경",
        subtitle: "의정부역 가까이, 생활의 중심을 누리다",
        copy: "의정부역과 신세계백화점, 생활·문화 인프라를 가까이 누리는 입지",
        copySub: "",
        image: "",
        canvasLayout: [
          {
            type: "location-card",
            mainImage: "../../../../new-assets/paragon/0.png?v=4D9DFE6E",
          },
        ],
        specs: [],
        notes: [
          "본 홍보물에 사용된 CG 및 일러스트는 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.",
          "상기 개발계획도, 지역도 상에 기재된 교통, 학교, 공원, 상업시설 등 각종 개발 계획은 사업 진행과정 및 관계기관의 사정에 따라 변동 또는 취소될 수 있으며 이는 당사와 무관합니다.",
          "단지 인근의 각종 개발계획 및 도로 등의 기반시설은 인·허가나 정부 시책에 따라 변경 및 취소 가능한 바, 해당 인·허가청 및 현장에서 확인하시기 바라며 시행사 및 시공사와 무관합니다.",
        ],
      },
      premium: {
        title: "의정부역 해링턴플레이스 프리미엄",
        subtitle: "가까운 일상에 더하는 여섯 가지 가치",
        copy: "교통부터 생활과 주거까지, 해링턴플레이스의 여섯 가지 프리미엄",
        copySub: "",
        image: "",
        canvasLayout: [
          {
            type: "row",
            columns: 2,
            className: "menupage-premium-grid",
            images: [
              "../../../../new-assets/paragon/premium_p1%20(1).png?v=103EBDA9",
              "../../../../new-assets/paragon/premium_p1%20(2).png?v=5616BF72",
              "../../../../new-assets/paragon/premium_p1%20(3).png?v=E2848E60",
              "../../../../new-assets/paragon/premium_p1%20(4).png?v=70FA6D52",
              "../../../../new-assets/paragon/premium_p1%20(5).png?v=A4AD644A",
              "../../../../new-assets/paragon/premium_p1%20(6).png?v=6BDB137A",
            ],
          },
        ],
        specs: [],
        notes: [
          "본 홍보물에 사용된 CG 및 일러스트는 소비자의 이해를 돕기 위한 것으로 실제와 다를 수 있습니다.",
        ],
      },
      default: {
        title: "의정부역 해링턴플레이스",
        subtitle: "프로젝트 정보",
        copy: "해당 메뉴의 상세 이미지를 이 영역에 배치합니다.",
        copySub: "",
        image: "",
        specs: [],
        notes: [],
      },
    },
    complex: {
      siteplan: {
        subtitle: "건물과 주변 공간을 한눈에",
        copy: "건물 배치부터 출입구와 옥상정원까지, 단지의 공간 구성을 확인하세요",
        copySub: "",
        image: "",
        canvasLayout: [
          { type: "image", src: "../../../../new-assets/paragon/Site%20Layout.png?v=E198248C" },
        ],
        notes: [
          "본 지면상의 단지배치도 및 CG 이미지는 소비자의 이해를 돕기 위해 제작한 것으로 실제와 차이가 있을 수 있으며, 향후 개발 계획 및 인·허가에 따라 변경될 수 있습니다.",
        ],
      },
      unitplan: {
        subtitle: "150세대, 나에게 맞는 위치를 찾다",
        copy: "층별·호수별 위치와 타입 구성을 한눈에 확인하는 배치 안내",
        copySub: "",
        image: "",
        canvasLayout: [
          { type: "image", src: "../../../../new-assets/paragon/Number%20of%20Rooms.png?v=036FB44E" },
        ],
        notes: [
          "본 지면 상의 동호 배치도 등은 소비자의 이해를 돕기 위한 이미지 컷으로 실제 시공 시 다소 차이가 있을 수 있으며, 향후 개발 계획 및 인·허가에 따라 변경될 수 있습니다.",
        ],
      },
      default: {
        title: "의정부역 해링턴플레이스",
        subtitle: "단지 안내",
        copy: "해당 메뉴의 상세 이미지를 이 영역에 배치합니다.",
        copySub: "",
        image: "",
        specs: [],
        notes: [],
      },
    },
    type: {
      type: {
        title: "의정부역 해링턴플레이스",
        subtitle: "취향과 생활에 맞춘 다양한 공간",
        copy: "다양한 면적과 평면 구성으로 나에게 어울리는 주거 공간을 만나보세요",
        copySub: "",
        image: "",
        specs: [],
        notes: [
          "본 평면도는 소비자의 이해를 돕기 위해 제작된 것으로 외곽라인, 내부 레이아웃, 인테리어 마감, 내부 디테일, 가구 디자인 등 세부사항은 변경될 수 있으니, 자세한 사항은 견본주택에 문의하시어 계약 등에 착오 없으시기 바랍니다.",
        ],
      },
      default: {
        title: "의정부역 해링턴플레이스",
        subtitle: "타입 안내",
        copy: "해당 메뉴의 상세 이미지를 이 영역에 배치합니다.",
        copySub: "",
        image: "",
        specs: [],
        notes: [],
      },
    },
    route: {
      default: {
        title: "의정부역 해링턴플레이스",
        subtitle: "40층까지 이어지는 건물의 공간 구성",
        copy: "근린생활시설과 주차장부터 주거 공간까지, 층별 구성을 확인하세요",
        copySub: "",
        image: "../../../../new-assets/paragon/5.png?v=006C37C9",
        specs: [],
        notes: [],
      },
    },
  };

  // 이전 route/directions 주소도 같은 층별안내 자료를 사용한다.
  CONTENT_CONFIG.complex.floors = CONTENT_CONFIG.route.default;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSpecs(specs) {
    const wrapEl = document.getElementById("menupage-spec");
    const bodyEl = document.getElementById("menupage-spec-body");
    if (!wrapEl || !bodyEl) return;

    if (!Array.isArray(specs) || specs.length === 0) {
      bodyEl.innerHTML = "";
      wrapEl.hidden = true;
      return;
    }

    bodyEl.innerHTML = specs
      .map((item) => {
        const key = Array.isArray(item) ? item[0] : "";
        const value = Array.isArray(item) ? item[1] : "";
        const subKey = Array.isArray(item) ? item[2] : "";
        const subValue = Array.isArray(item) ? item[3] : "";

        if (subKey || subValue) {
          return `<tr><th scope="row">${escapeHtml(key)}</th><td>${escapeHtml(value)}</td><th scope="row">${escapeHtml(subKey)}</th><td>${escapeHtml(subValue)}</td></tr>`;
        }

        return `<tr><th scope="row">${escapeHtml(key)}</th><td colspan="3">${escapeHtml(value)}</td></tr>`;
      })
      .join("");
    wrapEl.hidden = false;
  }

  function renderNotes(notes) {
    const wrapEl = document.getElementById("menupage-notes");
    const listEl = document.getElementById("menupage-notes-list");
    if (!wrapEl || !listEl) return;

    if (!Array.isArray(notes) || notes.length === 0) {
      listEl.innerHTML = "";
      wrapEl.hidden = true;
      return;
    }

    listEl.innerHTML = notes
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");
    wrapEl.hidden = false;
  }

  function getStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const group = params.get("group");
    const tab = normalizeTabKey(group, params.get("tab"));
    const variant = params.get("variant");

    if (!group || !MENU_CONFIG[group]) {
      return { group: "business", tab: "overview", variant: "" };
    }

    const hasTab = MENU_CONFIG[group].tabs.some((item) => item.key === tab);
    const resolvedTab = hasTab ? tab : MENU_CONFIG[group].tabs[0].key;
    const variants = getTypeVariantItems(resolvedTab);
    const defaultVariant = getDefaultTypeVariant(resolvedTab);
    const resolvedVariant =
      group === "type" && variants.some((item) => item.key === variant)
        ? variant
        : group === "type"
        ? defaultVariant
        : "";

    return {
      group,
      tab: resolvedTab,
      variant: resolvedVariant,
    };
  }

  function setHeaderActive(group) {
    const topIndex = MENU_CONFIG[group].topIndex;
    document
      .querySelectorAll(".properties-N1 .header-gnblist > .header-gnbitem")
      .forEach((item) => item.classList.remove("menu-current"));
    document
      .querySelectorAll(".properties-N1 .fullmenu-gnblist > .fullmenu-gnbitem")
      .forEach((item) => item.classList.remove("menu-current"));

    const headerItem = document.querySelectorAll(
      ".properties-N1 .header-gnblist > .header-gnbitem"
    )[topIndex];
    const fullMenuItem = document.querySelectorAll(
      ".properties-N1 .fullmenu-gnblist > .fullmenu-gnbitem"
    )[topIndex];

    if (headerItem) headerItem.classList.add("menu-current");
    if (fullMenuItem) fullMenuItem.classList.add("menu-current");
  }

  function renderTabs(group, tab, variant) {
    const wrap = document.getElementById("menupage-tabs");
    const tabs = MENU_CONFIG[group].tabs;

    wrap.innerHTML = tabs
      .map((item) => {
        const activeClass = item.key === tab ? "is-active" : "";
        const variants = getTypeVariantItems(item.key);
        const defaultVariant = getDefaultTypeVariant(item.key);
        const targetVariant =
          group === "type" && variants.some((entry) => entry.key === variant)
            ? variant
            : defaultVariant;
        const variantQuery =
          group === "type" && targetVariant
            ? `&variant=${encodeURIComponent(targetVariant)}`
            : "";
        return `<a class="menupage-tab ${activeClass}" href="./menu-page.html?v=20260703b&group=${group}&tab=${item.key}${variantQuery}">${item.label}</a>`;
      })
      .join("");
  }

  function renderHero(group, tab) {
    const tabInfo = MENU_CONFIG[group].tabs.find((item) => item.key === tab);
    const title = tabInfo ? tabInfo.label : MENU_CONFIG[group].label;
    const kicker = MENU_CONFIG[group].label;

    const kickerEl = document.getElementById("menupage-kicker");
    const titleEl = document.getElementById("menupage-title");
    const subtitleEl = document.getElementById("menupage-subtitle");

    if (kickerEl) kickerEl.textContent = kicker;
    titleEl.textContent = title;
    subtitleEl.textContent = SITE_NAME;
  }

  function createCanvasImg(src, imageAlt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = imageAlt;
    img.decoding = "async";
    img.loading = "lazy";
    img.addEventListener("error", function onError() {
      if (img.dataset.fallbackTried === "2") {
        img.removeEventListener("error", onError);
        img.remove();
        return;
      }
      if (/\.webp$/i.test(img.src)) {
        img.dataset.fallbackTried = "1";
        img.src = img.src.replace(/\.webp$/i, ".png");
        return;
      }
      if (img.dataset.fallbackTried === "1" && /\.png$/i.test(img.src)) {
        img.dataset.fallbackTried = "2";
        img.src = img.src.replace(/\.png$/i, ".jpg");
        return;
      }
      if (/\.png$/i.test(src)) {
        img.dataset.fallbackTried = "2";
        img.src = src.replace(/\.png$/i, ".jpg");
        return;
      }
      img.removeEventListener("error", onError);
      img.remove();
    });
    return img;
  }

  function createLayoutNode(entry, imageAlt) {
    if (!entry) return null;

    if (typeof entry === "string") {
      return createCanvasImg(entry, imageAlt);
    }

    if (entry.type === "image" && entry.src) {
      const block = document.createElement("div");
      block.className = "menupage-image-node";
      if (entry.className) entry.className.split(/\s+/).filter(Boolean).forEach(function(c) { block.classList.add(c); });
      block.appendChild(createCanvasImg(entry.src, imageAlt));
      return block;
    }

    if (entry.type === "stack") {
      const stack = document.createElement("div");
      stack.className = "menupage-image-stack-col";
      if (entry.className) entry.className.split(/\s+/).filter(Boolean).forEach(function(c) { stack.classList.add(c); });
      (Array.isArray(entry.images) ? entry.images : []).forEach((src) => {
        if (!src) return;
        stack.appendChild(createCanvasImg(src, imageAlt));
      });
      return stack;
    }

    return null;
  }

  function buildCanvasLayout(layout, imageAlt) {
    const wrap = document.createElement("div");
    wrap.className = "menupage-image-layout";

    layout.forEach((item) => {
      if (!item || typeof item !== "object") return;

      if (item.type === "gap") {
        const gap = document.createElement("div");
        gap.className = `menupage-layout-gap is-${item.size || "md"}`;
        wrap.appendChild(gap);
        return;
      }

      if (item.type === "row") {
        const row = document.createElement("div");
        row.className = "menupage-image-row";
        if (item.className) {
          item.className.split(/\s+/).filter(Boolean).forEach(function(c) { row.classList.add(c); });
        }
        if (item.columns) {
          row.style.setProperty("--row-columns", String(item.columns));
        }
        const rowItems = Array.isArray(item.items) ? item.items : (Array.isArray(item.images) ? item.images : []);
        rowItems.forEach((entry) => {
          const node = createLayoutNode(entry, imageAlt);
          if (node) row.appendChild(node);
        });
        wrap.appendChild(row);
        return;
      }

      if (item.type === "location-card") {
        const card = document.createElement("div");
        card.className = "menupage-location-card menupage-location-section";
        const main = document.createElement("div");
        main.className = "n6-location-main";
        if (item.mainImage) main.appendChild(createCanvasImg(item.mainImage, imageAlt));
        card.appendChild(main);
        if (item.subImage) {
          const sub = document.createElement("div");
          sub.className = "n6-location-sub-card";
          sub.appendChild(createCanvasImg(item.subImage, imageAlt));
          card.appendChild(sub);
        }
        wrap.appendChild(card);
        return;
      }

      if (item.type === "image" && item.src) {
        const node = createLayoutNode(item, imageAlt);
        if (node) wrap.appendChild(node);
        return;
      }

      if (item.type === "stack") {
        const node = createLayoutNode(item, imageAlt);
        if (node) wrap.appendChild(node);
      }
    });

    return wrap;
  }

  function setCanvasImage(canvasEl, imageEl, placeholderEl, imageSrc, imageAlt, imageSrcList, canvasLayout) {
    const oldStack = canvasEl.querySelector(".menupage-image-stack");
    if (oldStack) oldStack.remove();
    const oldLayout = canvasEl.querySelector(".menupage-image-layout");
    if (oldLayout) oldLayout.remove();

    const layoutItems = Array.isArray(canvasLayout) ? canvasLayout : [];
    if (layoutItems.length > 0) {
      imageEl.removeAttribute("src");
      imageEl.hidden = true;
      placeholderEl.hidden = true;
      canvasEl.classList.add("has-image");
      canvasEl.appendChild(buildCanvasLayout(layoutItems, imageAlt));
      return;
    }

    const stackSources = Array.isArray(imageSrcList)
      ? imageSrcList.filter((src) => typeof src === "string" && src.trim())
      : [];

    if (stackSources.length > 0) {
      imageEl.removeAttribute("src");
      imageEl.hidden = true;
      placeholderEl.hidden = true;
      canvasEl.classList.add("has-image");

      const stack = document.createElement("div");
      stack.className = "menupage-image-stack";
      stackSources.forEach((src) => {
        stack.appendChild(createCanvasImg(src, imageAlt));
      });
      canvasEl.appendChild(stack);
      return;
    }

    if (imageSrc) {
      imageEl.onerror = function onSingleError() {
        if (imageEl.dataset.fallbackTried === "1") {
          imageEl.onerror = null;
          return;
        }
        if (/\.png$/i.test(imageSrc)) {
          imageEl.dataset.fallbackTried = "1";
          imageEl.src = imageSrc.replace(/\.png$/i, ".jpg");
          return;
        }
        imageEl.onerror = null;
      };
      imageEl.dataset.fallbackTried = "0";
      imageEl.src = imageSrc;
      imageEl.alt = imageAlt;
      imageEl.hidden = false;
      placeholderEl.hidden = true;
      canvasEl.classList.add("has-image");
    } else {
      imageEl.removeAttribute("src");
      imageEl.hidden = true;
      placeholderEl.hidden = false;
      canvasEl.classList.remove("has-image");
    }
  }

  function playCanvasSwapAnimation(canvasEl) {
    if (!canvasEl) return;
    canvasEl.classList.remove("menupage-swap-up");
    void canvasEl.offsetWidth;
    canvasEl.classList.add("menupage-swap-up");
  }

  function initInteriorImageReveal(canvasEl) {
    if (!canvasEl || !canvasEl.classList.contains("is-interior-layout")) return;

    const images = Array.from(
      canvasEl.querySelectorAll(".menupage-image-stack img, .menupage-image-layout img")
    );
    if (!images.length) return;

    images.forEach((img, index) => {
      img.classList.remove("is-visible");
      img.style.transitionDelay = `${Math.min(index * 180, 240)}ms`;
    });

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      images.forEach((img) => img.classList.add("is-visible"));
      return;
    }

    const reveal = (img) => {
      window.requestAnimationFrame(() => {
        img.classList.add("is-visible");
      });
    };

    if (!("IntersectionObserver" in window)) {
      images.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    images.forEach((img) => observer.observe(img));
  }

  function swapVariantCanvas(canvasEl, imageEl, placeholderEl, nextVariant, title) {
    if (!canvasEl) return;
    canvasEl.classList.remove("menupage-swap-up", "menupage-swap-out");
    setCanvasImage(
      canvasEl,
      imageEl,
      placeholderEl,
      nextVariant.image,
      title,
      nextVariant.images || [],
      nextVariant.canvasLayout || []
    );

    if (canvasEl.classList.contains("is-interior-layout")) {
      initInteriorImageReveal(canvasEl);
      return;
    }

    playCanvasSwapAnimation(canvasEl);
  }

  function renderTypeVariantTabs(group, tab, variant, onVariantChange) {
    const canvasEl = document.getElementById("menupage-canvas");
    if (!canvasEl || !canvasEl.parentNode) return null;

    let wrap = document.getElementById("menupage-variant-tabs");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "menupage-variant-tabs";
      wrap.className = "menupage-variant-tabs";
      canvasEl.parentNode.insertBefore(wrap, canvasEl);
    }

    if (group !== "type") {
      wrap.hidden = true;
      wrap.innerHTML = "";
      wrap.onclick = null;
      return null;
    }

    const groups = getTypeVariantGroups(tab);
    const variants = getTypeVariantItems(tab);
    if (variants.length === 0 || groups.length === 0) {
      wrap.hidden = true;
      wrap.innerHTML = "";
      wrap.onclick = null;
      return null;
    }

    let selected = getSelectedTypeVariant(tab, variant);
    let selectedGroup = getSelectedTypeVariantGroup(tab, selected ? selected.key : "");

    wrap.hidden = false;
    const renderMarkup = () => {
      const hidePrimary = groups.length === 1 && groups[0].hidePrimary;
      const primary = hidePrimary
        ? ""
        : groups
        .map((groupItem) => {
          const activeClass = groupItem.key === selectedGroup.key ? "is-active" : "";
          return `<button type="button" class="menupage-variant-tab menupage-variant-tab-primary ${activeClass}" data-variant-group="${escapeHtml(
            groupItem.key
          )}">${escapeHtml(groupItem.label)}</button>`;
        })
        .join("");

      const secondary = (selectedGroup.items || [])
        .map((item) => {
          const activeClass = item.key === selected.key ? "is-active" : "";
          return `<button type="button" class="menupage-variant-tab menupage-variant-tab-secondary ${activeClass}" data-variant-key="${escapeHtml(
            item.key
          )}">${escapeHtml(item.label)}</button>`;
        })
        .join("");

      wrap.innerHTML = `
        ${hidePrimary ? "" : `<div class="menupage-variant-row menupage-variant-row-primary">${primary}</div>`}
        <div class="menupage-variant-row menupage-variant-row-secondary ${hidePrimary ? "menupage-variant-row-flat" : ""}">${secondary}</div>
      `;
    };

    renderMarkup();

    wrap.onclick = (event) => {
      const groupBtn = event.target.closest("[data-variant-group]");
      if (groupBtn && wrap.contains(groupBtn)) {
        const nextGroupKey = groupBtn.getAttribute("data-variant-group");
        const nextGroup = groups.find((item) => item.key === nextGroupKey);
        if (!nextGroup || nextGroup.key === selectedGroup.key) return;
        selectedGroup = nextGroup;
        selected = (selectedGroup.items || [])[0] || selected;
        renderMarkup();
        if (selected && typeof onVariantChange === "function") {
          onVariantChange(selected);
        }
        const groupUrl = new URL(window.location.href);
        groupUrl.searchParams.set("group", "type");
        groupUrl.searchParams.set("tab", tab);
        if (selected) {
          groupUrl.searchParams.set("variant", selected.key);
        } else {
          groupUrl.searchParams.delete("variant");
        }
        window.history.replaceState({}, "", `${groupUrl.pathname}?${groupUrl.searchParams.toString()}`);
        return;
      }

      const btn = event.target.closest("[data-variant-key]");
      if (!btn || !wrap.contains(btn)) return;

      const nextKey = btn.getAttribute("data-variant-key");
      if (!nextKey || (selected && nextKey === selected.key)) return;

      const next = variants.find((item) => item.key === nextKey);
      if (!next) return;

      selected = next;
      selectedGroup = getSelectedTypeVariantGroup(tab, selected.key);
      renderMarkup();

      if (typeof onVariantChange === "function") {
        onVariantChange(selected);
      }

      const url = new URL(window.location.href);
      url.searchParams.set("group", "type");
      url.searchParams.set("tab", tab);
      url.searchParams.set("variant", selected.key);
      window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
    };

    return selected;
  }

  function initMenuLocationMagnifier() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cards = document.querySelectorAll('#menupage-canvas .menupage-location-card');
    if (!cards.length) return;
    cards.forEach(function(card) {
      if (card.dataset.magnifierInit) return;
      card.dataset.magnifierInit = '1';
      var images = [].slice.call(card.querySelectorAll('.n6-location-main > img'));
      var excludedArea = card.querySelector('.n6-location-sub-card');
      if (!images.length) return;
      var lens = document.createElement('div');
      lens.className = 'n6-magnifier-lens';
      card.appendChild(lens);
      var zoom = 1.85;
      function getActiveImage(clientX, clientY) {
        for (var i = 0; i < images.length; i++) {
          var rect = images[i].getBoundingClientRect();
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return images[i];
        }
        return images[0];
      }
      function syncLensImage(targetImg) {
        var src = targetImg.currentSrc || targetImg.src;
        if (src && lens.dataset.src !== src) {
          lens.style.backgroundImage = 'url("' + src + '")';
          lens.dataset.src = src;
        }
      }
      function moveLens(event) {
        if (excludedArea) {
          var er = excludedArea.getBoundingClientRect();
          if (event.clientX >= er.left && event.clientX <= er.right && event.clientY >= er.top && event.clientY <= er.bottom) {
            card.classList.remove('is-magnifying');
            return;
          }
        }
        var cardRect = card.getBoundingClientRect();
        var size = lens.offsetWidth || 190;
        var radius = size / 2;
        var x = event.clientX - cardRect.left;
        var y = event.clientY - cardRect.top;
        var clampedX = Math.max(radius, Math.min(cardRect.width - radius, x));
        var clampedY = Math.max(radius, Math.min(cardRect.height - radius, y));
        var activeImg = getActiveImage(event.clientX, event.clientY);
        var imgRect = activeImg.getBoundingClientRect();
        var imgX = Math.max(0, Math.min(imgRect.width, event.clientX - imgRect.left));
        var imgY = Math.max(0, Math.min(imgRect.height, event.clientY - imgRect.top));
        syncLensImage(activeImg);
        lens.style.left = clampedX + 'px';
        lens.style.top = clampedY + 'px';
        lens.style.backgroundSize = imgRect.width * zoom + 'px ' + imgRect.height * zoom + 'px';
        lens.style.backgroundPosition = (-imgX * zoom + radius) + 'px ' + (-imgY * zoom + radius) + 'px';
      }
      syncLensImage(images[0]);
      card.addEventListener('mouseenter', function(event) { card.classList.add('is-magnifying'); moveLens(event); });
      card.addEventListener('mousemove', function(event) { card.classList.add('is-magnifying'); moveLens(event); });
      card.addEventListener('mouseleave', function() { card.classList.remove('is-magnifying'); });
    });
  }

  function renderContent(group, tab, variant) {
    const groupContent = CONTENT_CONFIG[group] || {};
    const content = groupContent[tab] || groupContent.default || {};

    const title = FIXED_CONTENT_TITLE;
    const subtitle = content.subtitle || "상세 정보";
    const copy =
      content.copy || "해당 메뉴의 상세 이미지를 이 영역에 배치합니다.";
    const copySub = content.copySub || "";
    const specs = content.specs || [];
    const notes = content.notes || [];

    const titleEl = document.getElementById("menupage-content-title");
    const subtitleEl = document.getElementById("menupage-content-subtitle");
    const copyEl = document.getElementById("menupage-content-copy");
    const copySubEl = document.getElementById("menupage-content-copy-sub");
    const canvasEl = document.getElementById("menupage-canvas");
    const imageEl = document.getElementById("menupage-image");
    const placeholderEl = document.getElementById("menupage-placeholder");
    const selectedVariant = renderTypeVariantTabs(group, tab, variant, (nextVariant) => {
      swapVariantCanvas(canvasEl, imageEl, placeholderEl, nextVariant, title);
    });
    const resolvedImage =
      group === "type" && selectedVariant && selectedVariant.image
        ? selectedVariant.image
        : content.image || "";
    const resolvedImages =
      group === "type" && selectedVariant && Array.isArray(selectedVariant.images)
        ? selectedVariant.images
        : content.images || [];
    const resolvedCanvasLayout =
      group === "type" && selectedVariant && Array.isArray(selectedVariant.canvasLayout)
        ? selectedVariant.canvasLayout
        : content.canvasLayout || [];
    canvasEl.classList.toggle("has-variant-tabs", group === "type" && !!selectedVariant);
    canvasEl.classList.toggle("is-location-layout", group === "business" && tab === "location");
    canvasEl.classList.toggle("is-interior-layout", group === "type" && tab === "interior");

    titleEl.textContent = "";
    const logoImg = document.createElement("img");
    logoImg.className = "menupage-content-title-logo";
    logoImg.src = CONTENT_TITLE_LOGO_SRC;
    logoImg.alt = FIXED_CONTENT_TITLE;
    logoImg.decoding = "async";
    logoImg.loading = "eager";
    titleEl.appendChild(logoImg);
    subtitleEl.textContent = subtitle;
    copyEl.textContent = copy;
    if (copySubEl) {
      if (copySub) {
        copySubEl.hidden = false;
        copySubEl.textContent = copySub;
      } else {
        copySubEl.hidden = true;
        copySubEl.textContent = "";
      }
    }

    setCanvasImage(
      canvasEl,
      imageEl,
      placeholderEl,
      resolvedImage,
      title,
      resolvedImages,
      resolvedCanvasLayout
    );

    if (canvasEl.classList.contains("is-interior-layout")) {
      initInteriorImageReveal(canvasEl);
    }

    renderSpecs(specs);
    renderNotes(notes);

    if (group === 'business' && tab === 'location') {
      initMenuLocationMagnifier();
    }
  }

  function initContentReveal() {
    const leftEl = document.querySelector(".menupage-content-title-wrap");
    const rightEl = document.querySelector(".menupage-content-lead");
    const upEl = document.querySelector(".menupage-canvas");
    const variantTabsEl = document.getElementById("menupage-variant-tabs");
    const triggerEl = document.querySelector(".menupage-content");

    if (!leftEl || !rightEl || !upEl || !triggerEl) return;

    const upTargets = [upEl];
    if (variantTabsEl && !variantTabsEl.hidden) {
      upTargets.push(variantTabsEl);
    }

    const revealClasses = ["menupage-reveal-left", "menupage-reveal-right", "menupage-reveal-up"];
    const prepClasses = ["menupage-pre-left", "menupage-pre-right", "menupage-pre-up"];
    const instantClass = "menupage-reveal-visible";

    leftEl.classList.remove(...revealClasses, ...prepClasses, instantClass);
    rightEl.classList.remove(...revealClasses, ...prepClasses, instantClass);
    upTargets.forEach((el) => el.classList.remove(...revealClasses, ...prepClasses, instantClass));

    leftEl.classList.add("menupage-pre-left");
    rightEl.classList.add("menupage-pre-right");
    upTargets.forEach((el) => el.classList.add("menupage-pre-up"));

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      leftEl.classList.remove("menupage-pre-left");
      rightEl.classList.remove("menupage-pre-right");
      upTargets.forEach((el) => el.classList.remove("menupage-pre-up"));
      [leftEl, rightEl, ...upTargets].forEach((el) => el.classList.add(instantClass));
      return;
    }

    const play = () => {
      leftEl.classList.remove("menupage-pre-left");
      rightEl.classList.remove("menupage-pre-right");
      upTargets.forEach((el) => el.classList.remove("menupage-pre-up"));
      leftEl.classList.add("menupage-reveal-left");
      rightEl.classList.add("menupage-reveal-right");
      upTargets.forEach((el) => el.classList.add("menupage-reveal-up"));
    };

    const replay = () => {
      void triggerEl.offsetHeight;
      play();
    };

    if (!("IntersectionObserver" in window)) {
      replay();
      return;
    }

    let played = false;
    let fallbackTimer = null;
    const playOnce = () => {
      if (played) return;
      played = true;
      replay();
      observer.disconnect();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          playOnce();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(triggerEl);

    fallbackTimer = setTimeout(playOnce, 500);
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 992px)").matches;
  }

  function hoistFixedConsultBar() {
    const fixedBar = document.querySelector(".menu-page-view .fixed-consult-bar.is-split");
    if (!fixedBar || fixedBar.dataset.fixedHoisted === "true") return;
    fixedBar.dataset.fixedHoisted = "true";
    document.body.appendChild(fixedBar);
  }

  function stabilizeMobileMenuLayout() {
    const header = document.querySelector(".menu-page-view .properties-N1");
    if (!header) return;

    hoistFixedConsultBar();

    const fixedBar = document.querySelector(".menu-page-view .fixed-consult-bar.is-split");

    // 메뉴 상세페이지 이동 후 남는 헤더/메뉴 상태를 정리한다.
    header.classList.remove("block-active");
    header.querySelectorAll(".header-gnbitem").forEach((item) => {
      item.classList.remove("item-active");
    });

    const fullMenu = header.querySelector(".header-fullmenu");
    if (fullMenu) {
      fullMenu.classList.remove("fullmenu-active");
    }

    header.querySelectorAll(".header-sublist").forEach((sublist) => {
      sublist.style.display = "";
      sublist.style.height = "";
      sublist.style.overflow = "";
    });

    if (isMobileViewport()) {
      document.documentElement.style.setProperty("overflow-x", "hidden");
      document.body.style.setProperty("overflow-x", "hidden");
    } else {
      document.documentElement.style.removeProperty("overflow-x");
      document.body.style.removeProperty("overflow-x");
    }

    if (fixedBar) {
      fixedBar.style.removeProperty("position");
      fixedBar.style.removeProperty("left");
      fixedBar.style.removeProperty("right");
      fixedBar.style.removeProperty("bottom");
      fixedBar.style.removeProperty("width");
      fixedBar.style.removeProperty("max-width");
      fixedBar.style.removeProperty("z-index");
      fixedBar.style.removeProperty("transform");
      fixedBar.style.removeProperty("-webkit-transform");
    }
  }

  function bindMobileLayoutGuard() {
    if (mobileLayoutGuardBound) return;
    mobileLayoutGuardBound = true;

    const run = () => {
      stabilizeMobileMenuLayout();
      window.requestAnimationFrame(stabilizeMobileMenuLayout);
      window.setTimeout(stabilizeMobileMenuLayout, 120);
    };

    window.addEventListener("pageshow", run);
    window.addEventListener("resize", run);
    window.addEventListener("orientationchange", run);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") run();
    });
  }

  function bindReserveLinkRouting() {
    document.querySelectorAll(".header-reserve-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        const isLocalPreview =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (!isLocalPreview) return;

        event.preventDefault();
        const localConsultationUrl = new URL(
          "./첫페이지 (AdKpMlw6KePt).html?consultation=1",
          window.location.href
        );
        window.top.location.href = localConsultationUrl.toString();
      });
    });
  }

  function closeMenuNavigationOverlay() {
    const header = document.querySelector(".menu-page-view .properties-N1");
    if (!header) return;

    header.classList.remove("block-active");
    header.querySelectorAll(".header-gnbitem").forEach((item) => {
      item.classList.remove("item-active");
    });

    const fullMenu = header.querySelector(".header-fullmenu");
    if (fullMenu) {
      fullMenu.classList.remove("fullmenu-active");
    }

    header.querySelectorAll(".header-sublist").forEach((sublist) => {
      sublist.style.display = "";
      sublist.style.height = "";
      sublist.style.overflow = "";
    });
  }

  function runPage(group, tab, variant) {
    setHeaderActive(group);
    renderHero(group, tab);
    renderTabs(group, tab, variant);
    renderContent(group, tab, variant);
    initContentReveal();
    bindReserveLinkRouting();
  }

  var NAV_FADE_MS = 160;

  function navigate(group, tab, variant) {
    tab = normalizeTabKey(group, tab);
    var url = new URL(window.location.href);
    url.searchParams.set("group", group);
    url.searchParams.set("tab", tab);
    if (variant) {
      url.searchParams.set("variant", variant);
    } else {
      url.searchParams.delete("variant");
    }
    history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());

    var main = document.querySelector(".menupage-main");
    if (main) main.classList.add("menupage-nav-fade");

    setTimeout(function () {
      runPage(group, tab, variant);
      if (main) {
        main.classList.remove("menupage-nav-fade");
      }
    }, NAV_FADE_MS);
  }

  function bindSpaNavigation() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href*=\"menu-page.html\"]");
      if (!link) return;
      if (e.defaultPrevented) return;
      e.preventDefault();
      var url = new URL(link.href, window.location.href);
      var g = url.searchParams.get("group") || "business";
      var t = normalizeTabKey(g, url.searchParams.get("tab") || "overview");
      var v = url.searchParams.get("variant") || "";
      if (link.closest(".properties-N1")) {
        closeMenuNavigationOverlay();
      }
      navigate(g, t, v);
    });

    window.addEventListener("popstate", function () {
      var state = getStateFromUrl();
      var main = document.querySelector(".menupage-main");
      if (main) main.classList.add("menupage-nav-fade");
      setTimeout(function () {
        runPage(state.group, state.tab, state.variant);
        if (main) main.classList.remove("menupage-nav-fade");
      }, NAV_FADE_MS);
    });
  }

  function initMenuPage() {
    initBasicContentGuard();
    watchUnavailableMenuItems();

    const { group, tab, variant } = getStateFromUrl();
    runPage(group, tab, variant);
    bindMobileLayoutGuard();
    stabilizeMobileMenuLayout();
    bindSpaNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenuPage);
  } else {
    initMenuPage();
  }
})();
