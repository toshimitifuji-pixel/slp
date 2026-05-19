/* =========================
   bbj_header.js (shared) — FINAL
   - Drawer open/close (SP)  [aria-hidden]
   - Lang dropdown toggle    [data-lang-toggle / data-lang-panel]
   - Header "silk" on scroll [.is-silk] (CSS側が用意されている場合に効く)
   - Spacer sync             [--header-h]
   - Optional: [data-lang] buttons -> Google Translate
========================= */
(() => {
  const html = document.documentElement;
  const body = document.body;

  /* ---------- Drawer ---------- */
  const openDrawer = (drawer, openerBtn) => {
    if (!drawer) return;
    drawer.hidden = false;
    drawer.removeAttribute("hidden");
    drawer.setAttribute("aria-hidden", "false");
    openerBtn?.setAttribute("aria-expanded", "true");
    html.classList.add("is-drawer-open");
    body.classList.add("is-drawer-open");
  };

  const closeDrawer = (drawer, openerBtn) => {
    if (!drawer) return;
    drawer.setAttribute("aria-hidden", "true");
    openerBtn?.setAttribute("aria-expanded", "false");
    html.classList.remove("is-drawer-open");
    body.classList.remove("is-drawer-open");
  };

  // 初期：aria-hidden を統一（hidden属性は使わない運用だが、念のためremoveも）
  document.querySelectorAll(".drawer[id]").forEach((d) => {
    d.setAttribute("aria-hidden", "true");
    d.hidden = false;
    d.removeAttribute("hidden");
  });

  /* ---------- Lang dropdown ---------- */
  const openLang = (wrap, btn, panel) => {
    if (!wrap || !btn || !panel) return;
    wrap.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    panel.removeAttribute("hidden");
  };

  const closeLang = (wrap, btn, panel) => {
    if (!wrap || !btn || !panel) return;
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    panel.setAttribute("hidden", "");
  };

  const closeAllLang = () => {
    document.querySelectorAll(".lang").forEach((wrap) => {
      const btn = wrap.querySelector("[data-lang-toggle]");
      const panel = wrap.querySelector("[data-lang-panel]");
      if (btn && panel) closeLang(wrap, btn, panel);
    });
  };

  /* ---------- Header silk ---------- */
  const bar = document.querySelector(".site-header__bar");
  const mode = document.body?.getAttribute("data-header-silk") || "";

  // always: 常に白 / on-scroll: 動いたら白 / default: 150px超で白（必要なら）
  let THRESHOLD = 150;
  if (mode === "always") THRESHOLD = -1;
  if (mode === "on-scroll") THRESHOLD = 0;

  const onScroll = () => {
    if (!bar) return;
    bar.classList.toggle("is-silk", window.scrollY > THRESHOLD);
    syncHeaderH();
  };

  /* -------- Spacer sync -------- */
  const spacer = document.querySelector(".header-spacer");

  const getHeaderH = () => {
    if (!bar) return 0;
    return Math.round(bar.getBoundingClientRect().height);
  };

  // html(root) にのみ --header-h を同期（spacer直書きはしない）
  const syncHeaderH = () => {
    // TOPだけ：spacerが見える固定開始を遅らせる（白帯チラ見え潰し）
    const FIX_THRESHOLD = body.classList.contains("page-top") ? 160 : THRESHOLD;

    const isFixed = window.scrollY > FIX_THRESHOLD;
    body.classList.toggle("is-header-fixed", isFixed);

    const h = isFixed ? getHeaderH() : 0;
    html.style.setProperty("--header-h", `${h}px`);

    spacer?.style?.removeProperty("--header-h");
  };  // 初期実行
  
  requestAnimationFrame(() => {
    onScroll();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", syncHeaderH, { passive: true });

  /* ---------- Optional: Google Translate open ---------- */
  const openTranslate = (tl) => {
    const tlMap = { ja: "ja", en: "en", "zh-CN": "zh-CN", ko: "ko" };
    const target = tlMap[tl];
    if (!target) return;

    const sl = "ja";
    const u = encodeURIComponent(window.location.href);
    const url = `https://translate.google.com/translate?sl=${sl}&tl=${target}&u=${u}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ---------- Click delegation ---------- */
  document.addEventListener(
    "click",
    (e) => {
      // Drawer open
      const openBtn = e.target.closest("[data-drawer-open]");
      if (openBtn) {
        e.preventDefault();
        const id = openBtn.getAttribute("aria-controls") || "drawer";
        const drawer = document.getElementById(id);
        openDrawer(drawer, openBtn);
        return;
      }

      // Drawer close
      const closeBtn = e.target.closest("[data-drawer-close]");
      if (closeBtn) {
        e.preventDefault();
        const drawer = closeBtn.closest(".drawer") || document.getElementById("drawer");
        const opener = drawer?.id
          ? document.querySelector(`[data-drawer-open][aria-controls="${drawer.id}"]`)
          : document.querySelector("[data-drawer-open]");
        closeDrawer(drawer, opener);
        return;
      }

      // Lang toggle (PC)
      const langBtn = e.target.closest("[data-lang-toggle]");
      if (langBtn) {
        e.preventDefault();
        const wrap = langBtn.closest(".lang");
        const panel = wrap?.querySelector("[data-lang-panel]");
        if (!wrap || !panel) return;

        const isOpen = wrap.classList.contains("is-open");
        closeAllLang();
        if (!isOpen) openLang(wrap, langBtn, panel);
        return;
      }

      // Optional: lang buttons (drawer/panel) -> translate
      const langPick = e.target.closest("[data-lang]");
      if (langPick) {
        // 翻訳UIが“選択で外部翻訳を開く”運用の場合のみ意味がある（害はなし）
        const tl = langPick.getAttribute("data-lang");
        if (tl) openTranslate(tl);
        // 選択したら閉じる（開いてるものだけ）
        closeAllLang();
        const openedDrawer = document.querySelector('.drawer[aria-hidden="false"]');
        if (openedDrawer) {
          const opener = openedDrawer.id
            ? document.querySelector(`[data-drawer-open][aria-controls="${openedDrawer.id}"]`)
            : document.querySelector("[data-drawer-open]");
          closeDrawer(openedDrawer, opener);
        }
        return;
      }

      // 外側クリックで lang を閉じる（lang内クリックは閉じない）
      if (!e.target.closest(".lang")) closeAllLang();
    },
    { passive: false }
  );

  /* ---------- ESC ---------- */
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    // Drawer close (open one)
    const drawer = document.querySelector('.drawer[aria-hidden="false"]');
    if (drawer) {
      const opener = drawer.id
        ? document.querySelector(`[data-drawer-open][aria-controls="${drawer.id}"]`)
        : document.querySelector("[data-drawer-open]");
      closeDrawer(drawer, opener);
    }

    // Lang close
    closeAllLang();
  });
})();

