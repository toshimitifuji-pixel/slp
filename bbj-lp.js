/* =========================================================
   bbj-lp.js（TOP / 起動専用＋TOP固有）
   役割：
   - 共通挙動：window.BBJ（bbj_features.js 側のSSOT）
   - WorkStyle：window.BBJFeature（render/loop はSSOT）
   - TOP固有：FAQ / シミュレーター / カード→シミュ連動（このファイル内）
   ルール：
   - 自動起動は boot のみ（DOMContentLoaded は1回）
   - ここで「共通ロジック」を増やさない（共通はSSOTへ）
========================================================= */

/* =========================================================
   TOP 固有defs（自動実行しない）
   - function / const 定義だけ置く
   - init() をここで呼ばない（呼ぶのは boot の中だけ）
========================================================= */
(() => {
  // ---------- FAQ ----------
  function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach((item) => {
      const btn = item.querySelector(".faq-item__question");
      if (!btn) return;
      btn.addEventListener("click", () => item.classList.toggle("is-open"));
    });
  }

  // ---------- helpers ----------
  const JPY = (n) => (Number(n || 0)).toLocaleString("ja-JP");

  // ---------- TOP only: bind card -> simulator ----------
  function bindWorkstyleSimFromCardsTOP() {
    const rail = document.querySelector(".js-ws-cards");
    const mini = document.querySelector(".js-ws-mini");
    const data = window.BBJ_DATA?.workStyle?.cards || [];
    if (!rail || !data.length) return;

    const setSimFromCard = (cardEl) => {
      const id = cardEl?.dataset?.id || cardEl?.dataset?.wsId;
      const card = data.find((x) => String(x.id) === String(id));
      if (!card?.sim) return;

      const root = document.querySelector("#workstyle-sim");
      const hourly = root?.querySelector("[data-sim-hourly]");
      const weekly = root?.querySelector("[data-sim-weekly]");
      if (!hourly || !weekly) return;

      hourly.value = Number(card.sim.hourly || 0);
      weekly.value = Number(card.sim.perWeek || 0);

      hourly.dispatchEvent(new Event("input", { bubbles: true }));
      weekly.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const bind = (target) => {
      if (!target) return;
      target.addEventListener("click", (e) => {
        const cardEl = e.target.closest("[data-id],[data-ws-id]");
        if (cardEl) setSimFromCard(cardEl);
      });
    };

    const workstyleRoot = document.querySelector("#workstyle");
    bind(workstyleRoot);
    bind(mini);

    // 初期：入力が空なら1枚目を流し込む（0円回避）
    const hourly = document.querySelector("[data-sim-hourly]");
    const weekly = document.querySelector("[data-sim-weekly]");
    if (hourly && weekly && (!hourly.value || !weekly.value)) {
      const first = rail.querySelector("[data-id],[data-ws-id]");
      if (first) setSimFromCard(first);
    }
  }

  // ---------- TOP only: simulator ----------
  /*
  function initWorkstyleSimTOP() {
    const hourlyEl = document.querySelector("[data-sim-hourly]");
    const weeklyEl = document.querySelector("[data-sim-weekly]");
    const outEl = document.querySelector("[data-sim-monthly]");
    if (!hourlyEl || !weeklyEl || !outEl) return;

    const feeRate = Number(window.BBJ_DATA?.settings?.feeRate ?? 0.236);
    const monthFactor = Number(window.BBJ_DATA?.workStyle?.simulator?.monthFactor ?? 4);
    const hoursPerSupport = 2; // TOP表記に合わせる：サポート1回=2時間

    const calc = () => {
      const hourly = Number(hourlyEl.value || 0);
      const perWeek = Number(weeklyEl.value || 0);
      const gross = hourly * perWeek * hoursPerSupport * monthFactor;
      const net = Math.max(0, Math.round(gross * (1 - feeRate)));
      outEl.textContent = JPY(net);
    };

    hourlyEl.addEventListener("input", calc, { passive: true });
    weeklyEl.addEventListener("input", calc, { passive: true });
    calc();
  }
*/

  /* =========================================================
     TOP bootstrap（自動起動）— SINGLE
     - 呼び出し順は LP / TOWA / work で統一
     - 共通→CV→WorkStyle→Modal→ページ固有 の順
  ========================================================= */

  // ---------- boot (only once) ----------
  const boot = () => {

    // =========================
    // ① common UI（BBJ）
    // =========================
    window.BBJ?.initFloatingCtaStopAtFooter?.({
      selector: ".js-floating-cta",
      threshold: 220,
      showClass: "is-visible",
      dockSelector: ".lp-message-block",
      slotSelector: ".footer-cta-slot",
    });

    window.BBJ?.initBackToTop?.({ selector: "[data-to-top]", threshold: 520 });
    window.BBJ?.initSpFixedCta?.({ selector: ".work-sp-cta", threshold: 420 });


    window.BBJ?.initBottomSeat?.();
    window.BBJ?.syncBottomSeat?.();
    window.BBJ?.initSmoothAnchor?.({ selector: 'a[href^="#"]' });

    // =========================
    // ② common CV（BBJ）
    // =========================
    window.BBJ?.initIncomeExamples?.();

    // =========================
    // ③ WorkStyle（BBJFeature）
    // =========================
    window.BBJFeature?.resetWorkStyleRail?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" });

    const host = document.querySelector(".js-ws-cards");
    if (host) host.offsetHeight; // reflow

    window.BBJFeature?.initWorkStyleRail?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" });

    // =========================
    // ④ Modal（BBJFeature）
    // =========================
    window.BBJFeature?.initModal?.();

    // =========================
    // ⑤ TOP only（固有）
    // =========================
    window.BBJFeature?.initWorkstyleSim?.();   // ← SSOT起動
    bindWorkstyleSimFromCardsTOP();
    initFaqAccordion();
    // =========================
    // ⑥ PATCH（暫定）
    // =========================
    patchTop_20260128?.();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
/* =========================================================
   PATCH（暫定パッチ置き場）
   - 原則：SSOTへ吸収するまでの一時避難
   - このページ固有＆期限付きのみ
========================================================= */
function patchTop_20260128() {
  // いまは空でOK

}
