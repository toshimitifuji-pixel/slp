/* bbj_features.js
   - defs only (no auto-run)
   - page-level features (CV etc.)
*/

(() => {
  const NS = (window.BBJ = window.BBJ || {});
  const _once = (NS._once = NS._once || Object.create(null));
  const once = (key, fn) => { if (_once[key]) return; _once[key] = true; fn(); };

  /* =========================
     Floating CTA: defs only
  ========================= */

  NS.initFloatingCtaStopAtFooter = (opts = {}) => once("floatingCtaStopAtFooter", () => {
    const sel = (opts.selector || ".footer-cta-slot, .work-sp-cta, .js-floating-cta");
    const cands = Array.from(document.querySelectorAll(sel));
    const cta = cands.find(el => {
      const r = el.getBoundingClientRect();
      return r && r.height > 0 && r.width > 0;
    }) || cands[0] || null;
    if (!cta) return;

    const showClass = opts.showClass || "is-visible";
    const threshold = Number(opts.threshold ?? 220);

    const dockSel = (opts.dockSelector || "").trim();
    const slotSel = (opts.slotSelector || "").trim();
    const dockArea = dockSel ? document.querySelector(dockSel) : null;
    const slot = slotSel ? document.querySelector(slotSel) : null;

    const home = document.createComment("cta-home");
    cta.parentNode.insertBefore(home, cta);

    const dock = () => {
      if (slot && cta.parentNode !== slot) {

        // --- SSOT PATCH: TOP never dock into footer-cta-slot ---
        if (document.body.classList.contains("page-top")) return;

        slot.appendChild(cta);
        cta.classList.add("is-docked");
      }
    };
    const undock = () => {
      if (cta.parentNode !== home.parentNode) {
        home.parentNode.insertBefore(cta, home.nextSibling);
        cta.classList.remove("is-docked");
      }
    };

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;

      const show = y > threshold;
      cta.classList.toggle(showClass, show);
      if (!show) {
        undock();
        return;
      }

      if (dockArea && slot) {
        const r = dockArea.getBoundingClientRect();
        const inDockZone = r.top < window.innerHeight && r.bottom > 0;

        // --- SSOT PATCH: TOP stop-at-footer without re-parent (no slot docking) ---
        if (document.body.classList.contains("page-top")) {

          const ctaRect = cta.getBoundingClientRect();
          const GAP = 16;

          // 本当の衝突判定
          const shouldLift = ctaRect.bottom > (r.top - GAP);

          if (shouldLift) {
            const dy = (r.top - GAP) - ctaRect.bottom;
            cta.style.transform = `translateY(${dy}px)`;
          } else {
            cta.style.transform = "";
          }

          return;
        } if (inDockZone) dock();
        else undock();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });

  /* =========================
     Bottom-right Seat: defs only
     - CTAの高さに追従して toTop を押し上げる
     - CTAの幅に追従して toTop を左に逃がす（--cta-float-w）
  ========================= */
  NS.initBottomSeat = (opts = {}) => once("bottomSeat", () => {
    const isSP = window.matchMedia("(max-width: 899px)").matches;

    const ctaSel =
      opts.ctaSelector ||
      (isSP
        ? ".work-sp-cta, .js-float-cta, .js-floating-cta, .floating-cta"
        : ".js-float-cta, .js-floating-cta, .floating-cta");

    const toTopSel = opts.toTopSelector || "[data-to-top]";
    const root = document.documentElement;
    const toTop = document.querySelector(toTopSel);
    if (!toTop) return;
    const GAP = Number(opts.gap ?? 16);

    // --- SSOT PATCH: put toTop into bottom-seat (inline with CTA) ---
    let seat = document.querySelector(".bottom-seat");
    if (!seat) {
      seat = document.createElement("div");
      seat.className = "bottom-seat";
      document.body.appendChild(seat);
    }
    if (toTop.parentNode !== seat) seat.appendChild(toTop);

    // ===== SSOT PATCH: seat footer CTA on SP (WORK含めて確実に出す) =====
    const ensureFooterSlot = () => {
      if (!isSP) return;

      // TOP/TOWA: .footer-cta-slot / WORK: .work-float-cta
      const footerSlotSel =
        opts.footerSlotSelector || ".footer-cta-slot, .work-float-cta";

      let footerSlot = document.querySelector(footerSlotSel);

      // WorkなどでDOMに無い場合だけ作る（最終保険）
      if (!footerSlot) {
        footerSlot = document.createElement("div");
        footerSlot.className = "footer-cta-slot";
        footerSlot.setAttribute("aria-label", "登録・相談CTA");
        footerSlot.innerHTML = `
      <a class="footer-cta__btn is-primary" href="#start">今すぐ登録</a>
      <a class="footer-cta__btn is-secondary" href="https://service.baby-j.site/contact">まずは相談する</a>
    `;
      } else {
        // WORKのCTAが pc-only で殺されてる対策（SP時だけ解除）
        footerSlot.classList.remove("pc-only");

        // 共通CSSは .footer-cta-slot を見てるので、WORK側にも付与して統一
        footerSlot.classList.add("footer-cta-slot");
      }

      // CTAは toTop より左（=先頭）に置く
      if (footerSlot.parentNode !== seat) {
        seat.insertBefore(footerSlot, seat.firstChild);
      } else if (seat.firstChild !== footerSlot) {
        seat.insertBefore(footerSlot, seat.firstChild);
      }
    };

    // --- SSOT PATCH: seat footer CTA slot into bottom-seat (SP fixed CTA revive) ---
    const FOOTER_SLOT_SEL = ".footer-cta-slot";

    const seatFooterSlot = () => {
      const slot = document.querySelector(FOOTER_SLOT_SEL);
      if (!slot) return;

      // already seated
      if (seat.contains(slot)) return;

      seat.appendChild(slot);
    };

    // init: try once
    seatFooterSlot();

    // ===== PATCH: TOP fixed CTA hard bind (click stealing stop) =====
    const patchTopSeatRoleGate = () => {
      if (!document.body.classList.contains("page-top")) return;

      const fixedBtn = document.querySelector(
        '.floating-cta__btn--accent[data-role-gate="1"]'
      );
      if (!fixedBtn) return;

      // 右下固定ボタン自身には一度だけバインド
      if (fixedBtn.dataset.rgHardBound === "1") return;
      fixedBtn.dataset.rgHardBound = "1";

      const fixedRow = fixedBtn.closest(".floating-cta__row");

      const openViaHeader = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }

        // 右下固定ボタン以外の、動作実績がある登録導線を探す
        const candidates = Array.from(
          document.querySelectorAll('[data-role-gate="1"]')
        ).filter((el) => el !== fixedBtn && !fixedBtn.contains(el));

        // まずヘッダー/ドロワー寄りを優先
        const proxy =
          candidates.find((el) => el.closest('.site-header')) ||
          candidates.find((el) => el.closest('.drawer-nav')) ||
          candidates[0];

        if (!proxy) return;

        proxy.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      };

      fixedBtn.addEventListener("click", openViaHeader, true);

      if (fixedRow && fixedRow.dataset.rgRowBound !== "1") {
        fixedRow.dataset.rgRowBound = "1";
        fixedRow.style.cursor = "pointer";
        fixedRow.addEventListener("click", openViaHeader, true);
      }
    };
    let raf = 0;

    const pickVisibleCTA = () => {
      const list = Array.from(document.querySelectorAll(ctaSel));
      for (const el of list) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (!isSP && (cs.opacity === "0" || cs.pointerEvents === "none")) continue;
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) continue;
        if (r.bottom <= 0) continue;
        return el;
      }
      return null;
    };

    const measure = () => {
      patchTopSeatRoleGate();
      seatFooterSlot();

      const cta = pickVisibleCTA(); const visible = !!cta;

      const h = visible ? Math.round(cta.getBoundingClientRect().height) : 0;

      if (toTop) toTop.style.setProperty("--seat-bottom", `${h + GAP}px`);
      root.style.setProperty("--bbj-seat-h", `${h}px`);
      root.style.setProperty("--bbj-seat-pad", h ? `${h + 24}px` : "0px");

      const w = visible ? Math.ceil(cta.getBoundingClientRect().width) : 0;
      root.style.setProperty("--cta-float-w", `${w}px`);
    };


    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true }); // 追加：表示/非表示追従
  });


  /* =========================
     BackToTop: defs only
  ========================= */
  NS.initBackToTop = (opts = {}) => once("backToTop", () => {
    const btn = document.querySelector(opts.selector || "[data-to-top]");
    if (!btn) return;

    const THRESHOLD = Number(opts.threshold ?? 600);
    const showClass = opts.showClass || "is-show";

    const toggle = () => btn.classList.toggle(showClass, window.scrollY > THRESHOLD);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* =========================
   SP Fixed CTA (show after scroll): defs only
   - .work-sp-cta に is-show を付けるだけ
   - SP判定は 899px（headerと同じ境界）
========================= */
  NS.initSpFixedCta = (opts = {}) => once("spFixedCta", () => {
    const el = document.querySelector(opts.selector || ".work-sp-cta");
    if (!el) return;

    const showClass = opts.showClass || "is-show";
    const THRESHOLD = Number(opts.threshold ?? 420); // 出始め。好みで調整OK
    const mq = window.matchMedia("(max-width: 899px)");

    const apply = () => {
      // PCでは強制的に消す（事故防止）
      if (!mq.matches) {
        el.classList.remove(showClass);
        return;
      }
      el.classList.toggle(showClass, window.scrollY > THRESHOLD);
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
  });


  /* =========================================================
 Income Examples SSOT (render)
 - defs only (no auto-run)
 - guarded by once("incomeExamples")
========================================================= */
  NS.initIncomeExamples = (opts = {}) => once("incomeExamples", () => {
    const DATA = window.BBJ_DATA?.incomeExamples;
    const SETTINGS = window.BBJ_DATA?.settings || {};
    if (!DATA) return;

    const cards = document.querySelectorAll(opts.cardSelector || ".js-income-card");
    if (!cards.length) return;

    const feeRate = Number(SETTINGS.feeRate ?? 0.236);
    const taxRate = Number(SETTINGS.taxRate ?? 0.10);
    const taxOnFee = Boolean(SETTINGS.taxOnFee ?? true);
    const trafficNonTaxable = Boolean(SETTINGS.trafficNonTaxable ?? true);
    const roundMode = String(SETTINGS.roundMode || "round");

    const roundMoney = (n) => {
      const v = Number(n) || 0;
      if (roundMode === "floor") return Math.floor(v);
      if (roundMode === "ceil") return Math.ceil(v);
      return Math.round(v);
    };

    const yen = (n) => roundMoney(n).toLocaleString("ja-JP");
    const yenWithSymbol = (n) => `¥${yen(n)}`;

    const setText = (root, sel, text) => {
      const el = root.querySelector(sel);
      if (el) el.textContent = text;
    };

    cards.forEach((card) => {
      const caseId = Number(card.dataset.case || 0);
      const d = DATA[caseId];
      if (!d) return;

      const hourly = Number(d.hourly || 0);
      const hours = Number(d.hours || 0);
      const optionMaster = window.BBJ_DATA?.optionMaster || {};

      // 👇ここ進化
      const addonKeys = d.addonKeys ?? (d.addonKey ? [d.addonKey] : []);

      const addons = addonKeys.reduce((sum, key) => {
        const val = optionMaster[key]?.金額 || 0;
        return sum + Number(val);
      }, 0);
      const traffic = Number(d.traffic || 0);

      const base = hourly * hours;
      const gross = base + addons + traffic;

      // fee対象：交通費を除外するなら base+addons
      const feeBase = trafficNonTaxable ? (base + addons) : gross;
      const fee = roundMoney(feeBase * feeRate);
      const feeTax = taxOnFee ? roundMoney(fee * taxRate) : 0;

      const net = gross - fee - feeTax;

      // HTMLの“正”クラスに合わせて埋める
      setText(card, ".js-title", String(d.title || ""));
      setText(card, ".js-sub", String(d.sub || ""));

      setText(card, ".js-hourly", yenWithSymbol(hourly));
      setText(card, ".js-hours", String(hours));
      setText(card, ".js-traffic", yenWithSymbol(traffic));
      setText(card, ".js-addons", yenWithSymbol(addons));

      const iconBox = card.querySelector(".js-addon-icons");
      if (iconBox) iconBox.innerHTML = "";

      setText(card, ".js-base", yenWithSymbol(base));
      setText(card, ".js-addon-total", yenWithSymbol(addons));
      setText(card, ".js-traffic2", yenWithSymbol(traffic));
      setText(card, ".js-fee", yen(fee));
      setText(card, ".js-fee-tax", yen(feeTax));
      setText(card, ".js-net", yenWithSymbol(net));
    });

    console.log("[IncomeExamples] SSOT init done");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.initIncomeRailInfinite_Work?.();
    }));

  });
  /* =========================
     Income Breakdown Sheet (SP)
  ========================= */
  NS.initIncomeBreakdownSheet = (opts = {}) => once("incomeBreakdownSheet", () => {
    const root = document.querySelector("#income-examples");
    if (!root) return;

    const isSP = () => window.matchMedia("(max-width: 768px)").matches;

    const closeAll = () => {
      document.body.classList.remove("is-breakdown-open");
      root.querySelectorAll(".income-breakdown.is-open").forEach(el => el.classList.remove("is-open"));
      document.querySelectorAll(".income-breakdown-backdrop").forEach(el => el.remove());
    };

    const ensureBackdrop = () => {
      let bd = document.querySelector(".income-breakdown-backdrop");
      if (bd) return bd;
      bd = document.createElement("div");
      bd.className = "income-breakdown-backdrop";
      bd.addEventListener("click", closeAll, { passive: true });
      document.body.appendChild(bd);
      return bd;
    };

    const openOne = (breakdownEl) => {
      closeAll();
      breakdownEl.classList.add("is-open");
      document.body.classList.add("is-breakdown-open");
      ensureBackdrop();
    };

    // Tap-to-toggle (only on SP)
    document.addEventListener("pointerdown", (e) => {
      if (!isSP()) return;
      const el = e.target.closest(".income-breakdown");
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      el.classList.contains("is-open") ? closeAll() : openOne(el);
    }, true);
    // ESC to close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });

    // if viewport changes to PC, cleanup
    window.addEventListener("resize", () => {
      if (!isSP()) closeAll();
    }, { passive: true });
  });

  /* =========================
   Bottom Seat Height Sync (SP)
   - footer-cta-slot の高さで toTop bottom を追従
========================= */
  NS.syncBottomSeat = (opts = {}) => once("syncBottomSeat", () => {
    const seat = document.querySelector(opts.seat || ".footer-cta-slot");
    if (!seat) return;

    const apply = () => {
      const h = Math.ceil(seat.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty("--bbj-seat-h", h ? `${h + 10}px` : "0px");
    };

    apply();
    window.addEventListener("resize", apply, { passive: true });
  });

})();

/* =========================================================
   WorkStyle Rail SSOT (render + loop)
========================================================= */
const BBJFeature = (window.BBJFeature = window.BBJFeature || {});

BBJFeature.initWorkStyleRail = function initWorkStyleRail(opts = {}) {
  const DATA = window.BBJ_DATA?.workStyle;
  if (!DATA) return;

  const cardsHost = document.querySelector(opts.cards || ".js-ws-cards");
  const miniHost = document.querySelector(opts.mini || ".js-ws-mini");
  if (!cardsHost) return;

  const cards = Array.isArray(DATA.cards) ? DATA.cards : [];
  if (!cards.length) return;

  if (cardsHost.dataset.wsRendered === "1") return;
  cardsHost.dataset.wsRendered = "1";

  let isDown = false;
  let startX;
  let scrollLeft;

  cardsHost.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - cardsHost.offsetLeft;
    scrollLeft = cardsHost.scrollLeft;
  });

  cardsHost.addEventListener("mouseleave", () => {
    isDown = false;
  });

  cardsHost.addEventListener("mouseup", () => {
    isDown = false;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
  });

  cardsHost.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - cardsHost.offsetLeft;
    const walk = (x - startX) * 1.2;
    cardsHost.scrollLeft = scrollLeft - walk;
  });

  if (miniHost && miniHost.dataset.wsRendered === "1") {
  } else if (miniHost) {
    miniHost.dataset.wsRendered = "1";
    // mini render...
  }

  const yen = (n) => Math.round(Number(n) || 0).toLocaleString("ja-JP");
  const monthFactor = Number(DATA.simulator?.monthFactor ?? 4);

  const calcMonthly = (c) => {
    const sim = c?.sim;
    if (!sim) return Number(c.monthly || 0);

    const hourly = Number(sim.hourly ?? 0);
    const perWeek = Number(sim.perWeek ?? 0);
    const hoursPerSupport = Number(sim.hoursPerSupport ?? 0);
    const supportsPerDay = Number(sim.supportsPerDay ?? 1);

    const feeRate = 0.236;
    const feeTaxRate = 0.10;

    const gross =
      hourly *
      hoursPerSupport *
      supportsPerDay *
      perWeek *
      monthFactor;

    const fee = Math.floor(gross * feeRate);
    const feeTax = Math.floor(fee * feeTaxRate);

    return gross - fee - feeTax;
  };

  /* ---------- render: PC cards ---------- */
  cardsHost.innerHTML = cards.map(c => {
    const color = c.color || "aqua";
    const badge = (c.badgeText ?? c.badge ?? "");
    const persona = (c.personaMain ?? c.persona ?? "");
    const baseBullets = Array.isArray(c.bullets) ? c.bullets : [];
    const metaLines = [...baseBullets];

    if (c.sim?.hourly) {
      metaLines.push(`時給 ${Number(c.sim.hourly).toLocaleString()} 円`);
    }
    const days = Array.isArray(c.days) ? c.days : [];
    const active = Array.isArray(c.activeDays) ? c.activeDays : [];
    const note = (c.note ?? "");

    return `
      <button class="ws-card ws-card--${color}" data-id="${c.id}">
        <div class="ws-card__badge ws-card__badge--${color}">${badge}</div>

        <div class="ws-card__top">
          <div class="ws-card__left">
            <p class="ws-card__persona">${persona}</p>

            <div class="ws-card__meta">
             ${metaLines.map(b => `<div class="ws-card__meta-line">${b}</div>`).join("")}
            </div>

            ${days.length ? `
              <div class="ws-card__label">出勤曜日</div>
              <div class="ws-card__days">
                ${days.map(d => `<div class="ws-day ${active.includes(d) ? "is-on" : ""}">${d}</div>`).join("")}
              </div>
            ` : ``}
          </div>

          <div class="ws-card__photo" style="${c.photo ? `background-image:url('${c.photo}')` : ""}"></div>
        </div>

        <div class="ws-sumbox">
          <div class="ws-sumbox__main">
            <span class="ws-sumbox__value">${yen(calcMonthly(c))}</span>
            <span class="ws-sumbox__unit">円／月</span>
          </div>
          ${note ? `<div class="ws-sumbox__note">${note}</div>` : ``}
        </div>
      </button>
    `;
  }).join("");

  // ===== WS drag scroll (mouse only / lightweight / natural) =====
  {
    const rail = cardsHost; // ← .js-ws-cards 本体
    if (!rail || rail.dataset.dragBound === "1") return;
    rail.dataset.dragBound = "1";

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let rafId = 0;
    let nextScrollLeft = 0;
    let moved = false;

    const DRAG_THRESHOLD = 6; // click誤爆防止
    const SPEED = 1;          // 1で素直。重ければ1のまま

    const applyScroll = () => {
      rafId = 0;
      rail.scrollLeft = nextScrollLeft;
    };

    const setDrag = (on) => {
      rail.classList.toggle("is-drag", !!on);
      rail.style.scrollBehavior = on ? "auto" : "";
    };

    const onPointerDown = (e) => {
      // mouseだけ。touch/trackpadのネイティブ挙動は殺さない
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (e.button !== 0) return;

      isDown = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = rail.scrollLeft;
      nextScrollLeft = rail.scrollLeft;

      setDrag(true);
      rail.setPointerCapture?.(e.pointerId);

      // text選択防止
      document.body.style.userSelect = "none";
    };

    const onPointerMove = (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) moved = true;

      nextScrollLeft = startScrollLeft - dx * SPEED;

      if (!rafId) {
        rafId = requestAnimationFrame(applyScroll);
      }
    };

    const endDrag = (e) => {
      if (!isDown) return;
      isDown = false;

      rail.releasePointerCapture?.(e.pointerId);

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      setDrag(false);
      document.body.style.userSelect = "";

      // ここでだけ loop補正を許可
      if (typeof schedule === "function") schedule();
    };

    rail.addEventListener("pointerdown", onPointerDown, { passive: true });
    rail.addEventListener("pointermove", onPointerMove, { passive: true });
    rail.addEventListener("pointerup", endDrag, { passive: true });
    rail.addEventListener("pointercancel", endDrag, { passive: true });
    rail.addEventListener("lostpointercapture", endDrag, { passive: true });

    // ドラッグ後の click 誤爆を止める
    rail.addEventListener(
      "click",
      (e) => {
        if (!moved) return;
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      },
      true
    );
  }

  const root = cardsHost.closest(".workstyle-cards");
  const prevBtn = root?.querySelector(".js-ws-prev");
  const nextBtn = root?.querySelector(".js-ws-next");

  const getStep = () => {
    const card = cardsHost.querySelector(".ws-card");
    return card ? Math.round(card.getBoundingClientRect().width + 24) : 320;
  };

  let wsNavLock = false;

  const snapTo = (dir) => {
    if (wsNavLock) return;
    wsNavLock = true;

    const step = getStep();
    const current = cardsHost.scrollLeft;

    const index = Math.round(current / step);
    const nextIndex = index + dir;

    cardsHost.scrollTo({
      left: nextIndex * step,
      behavior: "smooth"
    });

    setTimeout(() => {
      wsNavLock = false;
    }, 180);
  };
  prevBtn?.addEventListener("click", () => snapTo(-1));
  nextBtn?.addEventListener("click", () => snapTo(1));

  /* ---------- render: SP mini ---------- */
  if (miniHost) {
    miniHost.innerHTML = cards.map(c => {
      const color = c.color || "aqua";
      const badge = (c.badgeText ?? c.badge ?? "");
      return `
        <button class="ws-mini ws-mini--${color}" data-id="${c.id}">
          <div class="ws-mini__label">${badge}</div>
          <div class="ws-mini__value">${yen(calcMonthly(c))}円／月</div>
        </button>
      `;
    }).join("");
  }

  /* ---------- infinite loop (PC only) ---------- */
  function setupInfiniteRail(rail) {
    if (!rail) return;

    // 🔒 二重起動ガード（イベント・observer用）
    if (rail.dataset.loopBound === "1") return;
    rail.dataset.loopBound = "1";

    // 🔒 既存のrender/cloneガード
    if (rail.dataset.loopReady) return;
    rail.dataset.loopReady = "1";

    // すでにclone済みなら二重クローンしない
    if (rail.querySelector('[data-clone="1"]')) return;

    const items = Array.from(rail.children);
    if (items.length < 2) return;

    const CLONE_N = Math.min(3, items.length);

    // clone
    const head = items.slice(0, CLONE_N).map(n => n.cloneNode(true));
    const tail = items.slice(-CLONE_N).map(n => n.cloneNode(true));

    tail.forEach(n => { n.dataset.clone = "1"; rail.prepend(n); });
    head.forEach(n => { n.dataset.clone = "1"; rail.append(n); });

    // step
    const getStep = () => {
      const a = rail.children[0];
      const b = rail.children[1];
      if (!a) return 0;

      const cs = getComputedStyle(rail);
      const gap = parseFloat(cs.columnGap || 0) || parseFloat(cs.gap || 0) || 0;

      const w = a.getBoundingClientRect().width || a.offsetWidth || 0;
      const byWidth = w + gap;
      if (byWidth > 10) return byWidth;

      if (b) {
        const dx = b.offsetLeft - a.offsetLeft;
        if (dx > 10) return dx;
      }
      return w;
    };

    let step = 0;
    let isJump = false;
    let coolUntil = 0;
    let ready = false;

    // zones (clone-aware)
    const getBaseCount = () =>
      Array.from(rail.children).filter(n => !n.dataset.clone).length;

    let baseCount = 0;
    let pad = 0;
    let loop = 0;
    let min = 0;
    let max = 0;

    const calcZones = () => {
      baseCount = Math.max(1, getBaseCount());
      pad = step * CLONE_N;     // 左クローン帯
      loop = step * baseCount;   // 本体長（本体枚数だけ）
      min = pad;
      max = pad + loop;
    };

    const jump = (x) => {
      isJump = true;
      coolUntil = performance.now() + 180;

      rail.classList.add("is-jump");

      const prev = rail.style.scrollBehavior;
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = Math.round(x);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        rail.style.scrollBehavior = prev || "";
        rail.classList.remove("is-jump");
        isJump = false;
      }));
    };

    // init
    const ensureStep = (tries = 0) => {
      step = Math.round(getStep());

      if (!step || step < 10) {
        if (tries < 120) return requestAnimationFrame(() => ensureStep(tries + 1));
        console.warn("[WS] step unresolved", { step, tries });
        return;
      }

      calcZones();
      jump(min + Math.floor(loop / 2)); // ✅ 中央スタート固定
      ready = true;
      // 🔎 共通認知用（デバッグ）
      window.__WS_MIN = min;
      window.__WS_MAX = max;
      window.__WS_LOOP = loop;

      // --- relayout safe: step/zonesを追従更新（画像/フォント/リサイズ対策） ---
      let rafRecalc = 0;
      const recalcKeepPosition = () => {
        const rail = document.querySelector(".js-ws-cards");
        if (!rail || !step || !loop) return;

        const x = Math.round(rail.scrollLeft);
        const EPS = Math.max(140, Math.round(step * 0.45));

        // 中央帯は触らない
        if (x > (min + EPS) && x < (max - EPS)) return;

        const within = ((x - min) % loop + loop) % loop;
        jump(min + within);
      };

      // ✅ レイアウト変化に追従（止まり/ズレ対策）
      window.addEventListener("resize", recalcKeepPosition, { passive: true });

      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(() => recalcKeepPosition());
        ro.observe(rail);
      }

      // ✅ 初回も一度だけ（遅延ロード対策）
      recalcKeepPosition();

      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(() => recalcKeepPosition());
        ro.observe(rail);
      }


      // --- hard init: snapに戻されても確実に“中央へ” ---
      setTimeout(() => {
        if (!step) return;
        coolUntil = performance.now() + 70;
        calcZones();
        if (!loop) return;
        jump(min + Math.floor(loop / 2));
      }, 0);

      setTimeout(() => {
        if (!step) return;
        coolUntil = performance.now() + 70;
        calcZones();
        if (!loop) return;
        jump(min + Math.floor(loop / 2));
      }, 200);

    };

    requestAnimationFrame(() => requestAnimationFrame(() => ensureStep()));
    window.addEventListener("load", () => ensureStep(0), { once: true });

    rail.addEventListener("scroll", () => {
      if (!ready || isJump || rail.classList.contains("is-drag")) return;

      const now = performance.now();
      const x = Math.round(rail.scrollLeft);

      // ===== 物理端（スクロールの本当の端）でワープ：最強安定 =====
      //const HARD = 2;
      //const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      //
      //if (x <= HARD) { jump(x + loop); return; }
      // if (x >= maxScroll - HARD) { jump(x - loop); return; }

      // ===== 既存の“クローン帯”判定（保険） =====
      const EPS_L = Math.min(60, Math.round(step * 0.15));
      const EPS_R = Math.min(140, Math.round(step * 0.45));

      if (now < coolUntil) {
        // 中央帯は触らない
        if (x > (pad + EPS_L) && x < (pad + loop - EPS_R)) return;
      }

      if (x < (pad - EPS_L)) { jump(x + loop); return; }
      if (x > (pad + loop + EPS_R)) { jump(x - loop); return; }
    }, { passive: true });
  }

  /* ===== TEMP CLOSE: WorkStyle infinite rail on PC =====
  if (window.matchMedia("(min-width: 960px)").matches) {
    requestAnimationFrame(() => setupInfiniteRail(cardsHost));
  }
  */
};

/* =========================================================
   WorkStyle Rail reset (for re-init / debug / safety)
========================================================= */
BBJFeature.resetWorkStyleRail = function resetWorkStyleRail(opts = {}) {
  const cardsHost = document.querySelector(opts.cards || ".js-ws-cards");
  const miniHost = document.querySelector(opts.mini || ".js-ws-mini");

  if (cardsHost) {
    delete cardsHost.dataset.wsRendered;
    delete cardsHost.dataset.loopReady;
    delete cardsHost.dataset.loopBound;

    // クローン除去（再レンダー前提）
    cardsHost.querySelectorAll('[data-clone="1"]').forEach(n => n.remove());

    // 状態クラス掃除
    cardsHost.classList.remove("is-jump");
  }

  if (miniHost) {
    delete miniHost.dataset.wsRendered;
  }

  console.log("[WS] resetWorkStyleRail done");
};

// ===== DEV helper (defs side) =====
window.BBJ_DEBUG = window.BBJ_DEBUG || {};

window.BBJ_DEBUG.wsReset = (sel = { cards: ".js-ws-cards", mini: ".js-ws-mini" }) => {
  window.BBJFeature?.resetWorkStyleRail?.(sel);

  const host = document.querySelector(sel.cards);
  if (host) host.offsetHeight; // reflow

  window.BBJFeature?.initWorkStyleRail?.(sel);
  console.log("[WS] reset -> init done");
};

/* =========================
   Modal — SSOT (defs only)
========================= */
(() => {
  window.BBJFeature = window.BBJFeature || {};
  const NS = window.BBJFeature;

  const onceMap = (NS._once = NS._once || Object.create(null));
  const once = (key, fn) => { if (onceMap[key]) return; onceMap[key] = true; fn(); };

  NS.initModal = () => once("modal", () => {
    const body = document.body;
    let lastFocus = null;

    function openModal(id, opener) {
      const modal = document.getElementById(id);
      if (!modal) return;

      lastFocus = opener || document.activeElement;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";

      const panel = modal.querySelector(".modal__panel");
      if (panel) panel.focus();
    }

    function closeModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      body.style.overflow = "";

      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      lastFocus = null;
    }

    // ✅ open/close（イベントデリゲーション）
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) {
        const id = opener.getAttribute("data-open");
        if (!id) return;
        e.preventDefault();
        openModal(id, opener);
        return;
      }

      const closer = e.target.closest("[data-close]");
      if (closer) {
        const id = closer.getAttribute("data-close");
        if (!id) return;
        e.preventDefault();
        closeModal(id);
        return;
      }

      // backdrop click（既存仕様のまま）
      const modal = e.target.closest(".modal");
      if (modal && e.target.classList.contains("modal__backdrop")) {
        closeModal(modal.id);
      }
    });

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const openEl = document.querySelector(".modal.is-open");
      if (openEl) closeModal(openEl.id);
    });

    console.log("[Modal] SSOT init done");
  });
})();

function initWorkstyleSim() {
  const root = document.querySelector("#workstyle-sim");
  if (!root) return;

  const hourly = root.querySelector("[data-sim-hourly]");
  const weekly = root.querySelector("[data-sim-weekly]");

  // 両対応：月額の“数値出力”があるページも、表示mainだけのページもOK
  const result = root.querySelector("[data-sim-monthly]");
  const main = root.querySelector(".sim-eq__result-main");

  if (!hourly || !weekly || (!result && !main)) return;

  const FEE = 0.236;

  function calc() {
    const h = Number(hourly.value || 0);
    const w = Number(weekly.value || 0);
    const gross = h * w * 2 * 4;

    const net = Math.max(0, Math.floor(gross * (1 - FEE)));
    const txt = net.toLocaleString("ja-JP");

    if (result) result.textContent = txt;
    if (main) main.textContent = `${txt}円／月`;
  }

  hourly.addEventListener("input", calc, { passive: true });
  weekly.addEventListener("input", calc, { passive: true });

  // 初期描画（空でも0円表示を揃える）
  calc();
}

// ===== expose SSOT =====
window.BBJFeature = window.BBJFeature || {};
window.BBJFeature.initWorkstyleSim = initWorkstyleSim;

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-to-top]");
  if (!btn) return;
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
}, { passive: false });