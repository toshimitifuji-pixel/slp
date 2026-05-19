/* =========================================================
   bbj_towa.js（起動専用 / LAUNCHER ONLY）
   役割：
   - このファイルは「起動（boot）」だけを担当（描画やロジックは置かない）
   - SSOT（bbj_features.js / BBJFeature / BBJ）を呼ぶだけ
   ルール：
   - DOMContentLoaded は 1箇所のみ（増やさない）
   - boot内の呼び出し順は LP / work と同一に固定
========================================================= */

/* =========================================================
   TOWA 固有defs（自動実行しない）
   - function / const の定義だけ置く
   - init() をここで呼ばない（呼ぶのは boot の中だけ）
========================================================= */
// （必要ならTOWA専用 helper / 関数をここへ）

/* =========================================================
   TOWA bootstrap（自動起動）— SINGLE
========================================================= */

(() => {
  // ---------- boot (only once) ----------
  const boot = () => {
    // =========================
    // ① common UI（BBJ）
    // =========================
    window.BBJ?.initHeaderSilk?.({ threshold: 150 });

    window.BBJ?.initBackToTop?.({
      selector: "[data-to-top]",
      threshold: 300,
    });

    window.BBJ?.initBottomSeat?.();
    window.BBJ?.syncBottomSeat?.();

    window.BBJ?.initSpFixedCta?.({ selector: ".work-sp-cta", threshold: 420 });

    window.BBJ?.initFloatingCtaStopAtFooter?.({
      selector: ".js-floating-cta",
      dockSelector: "",           // 使わないなら空でOK（features側が無視できる設計なら）
      slotSelector: ".footer-cta-slot",
      threshold: 220,             // 見せ始め（必要なら調整）
      showClass: "is-visible",
    });

    window.BBJ?.initSmoothAnchor?.({ selector: 'a[href^="#"]' });

    // =========================
    // ② CV / optional（BBJ）
    // =========================
    window.BBJ?.initIncomeExamples?.(); // DOM無ければreturnで安全

    // =========================
    // ③ WorkStyle（BBJFeature）
    // =========================
    window.BBJFeature?.resetWorkStyleRail?.({
      cards: ".js-ws-cards",
      mini: ".js-ws-mini",
    });

    const host = document.querySelector(".js-ws-cards");
    if (host) host.offsetHeight; // reflow

    window.BBJFeature?.initWorkStyleRail?.({
      cards: ".js-ws-cards",
      mini: ".js-ws-mini",
    });

    // =========================
    // ④ Modal（BBJFeature）
    // =========================
    window.BBJFeature?.initModal?.();

    // =========================
    // ⑤ TOWA only（固有）
    // =========================
    patchTowa_20260128?.();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

/* =========================================================
   PATCH（暫定パッチ置き場）
   - 原則：SSOT（bbj_features.js）へ吸収するまでの一時避難
   - このページ固有＆期限付きのみ
========================================================= */
function patchTowa_20260128() {
  // いまは空でOK
}
