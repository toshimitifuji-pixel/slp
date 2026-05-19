/* =========================================================
   bbj-lp.js
   役割：TOP（LP）ページの起動・統括
   方針：
   - 起動制御のみ（単一 boot）
   - 定義は bbj_features.js
   - 一時対応は PATCH に集約
========================================================= */

/* =========================
   Work / Income ページ 起動専用（bootstrap・SINGLE）
   - 役割：このページの初期化だけを担当
   - 方針：ロジックは書かない（定義は bbj_features.js）
   - 例外：一時対応は PATCH に隔離
========================= */
(() => {
  const boot = () => {
    // shared page features
    window.BBJ?.initFloatingCtaStopAtFooter?.();
    window.BBJ?.initBackToTop?.();
    window.BBJ?.initSpFixedCta?.({ selector: ".work-sp-cta", threshold: 420 });
    requestAnimationFrame(() => window.BBJ?.syncBottomSeat?.());
    // Re-measure BottomSeat when SP CTA becomes visible
    window.addEventListener("scroll", () => window.BBJ?.syncBottomSeat?.(), { passive: true });



    window.BBJ?.initBottomSeat?.({
      ctaSelector: ".work-sp-cta, .js-float-cta, .js-floating-cta",

      toTopSelector: "[data-to-top]"
    });

    window.BBJ?.syncBottomSeat?.();


    // ✅ Modal (SSOT)
    window.BBJFeature?.initModal?.();

    // ✅ Income Examples (SSOT)
    window.BBJ?.initIncomeExamples?.();
    // KILLED (no toggle)     window.BBJ?.initIncomeBreakdownSheet?.();

    // ✅ WorkStyle Simulator (SSOT) ※featuresへ移した場合のみ有効
    window.BBJFeature?.initWorkstyleSim?.();

    // ✅ WorkStyle rail (SSOT)
////    window.BBJFeature?.resetWorkStyleRail?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" });

    // reflow（レイアウト確定）
    const host = document.querySelector(".js-ws-cards");
    if (host) host.offsetHeight;

    window.BBJFeature?.initWorkStyleRail?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" });

    // ✅ PATCH（work only）
    patchWork_20260128?.();
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
   - ここに書くのは「このページ固有」かつ「期限付き」だけ
   - boot外で勝手に動かさない（bootの最後から呼ぶ）
========================================================= */
function patchWork_20260128() {
  // いまは空でOK

}

function initIncomeRailInfinite_Work() {
  console.log("[IncomeInfinite] enter", {
    rail: !!document.querySelector("#income-examples .js-income-rail"),
    cards: document.querySelectorAll("#income-examples .income-card").length
  });

  const rail = document.querySelector("#income-examples .js-income-rail");
  if (!rail) return;

  // 二重起動ガード
  if (rail.dataset.incomeLoopBound === "1") return;
  rail.dataset.incomeLoopBound = "1";

  // clone済みなら終了
  if (rail.querySelector('[data-clone="1"]')) return;

  const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const items = Array.from(rail.children);
  if (items.length < 2) return;

  const CLONE_N = Math.min(3, items.length);
  const head = items.slice(0, CLONE_N).map(n => n.cloneNode(true));
  const tail = items.slice(-CLONE_N).map(n => n.cloneNode(true));

  tail.forEach(n => { n.dataset.clone = "1"; rail.prepend(n); });
  head.forEach(n => { n.dataset.clone = "1"; rail.append(n); });

  const getStep = () => {
    const a = rail.children[0];
    const b = rail.children[1];
    if (!a) return 0;
    const cs = getComputedStyle(rail);
    const gap = parseFloat(cs.gap || 0) || 0;
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
  let pad = 0;
  let loop = 0;
  let min = 0;
  let max = 0;
  let ready = false;
  let isJump = false;

  const baseCount = () => Array.from(rail.children).filter(n => !n.dataset.clone).length;

  const calc = () => {
    step = Math.round(getStep());
    if (!step || step < 10) return false;
    pad = step * CLONE_N;
    loop = step * Math.max(1, baseCount());
    min = pad;
    max = pad + loop;
    return true;
  };

  const jump = (x) => {
    isJump = true;
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

  const ensure = (tries = 0) => {
    if (!calc()) {
      if (tries < 120) return requestAnimationFrame(() => ensure(tries + 1));
      return;
    }
    // 中央スタート（無限っぽさ）
    jump(min + Math.floor(loop / 2));
    ready = true;
    if (prefersReduce) rail.style.scrollBehavior = "auto";
  };

  // “scroll中に補正しない”：止まってから補正
  let t = 0;
  const correct = () => {
    if (!ready || isJump) return;
    const x = Math.round(rail.scrollLeft);
    const EPS = Math.max(160, Math.round(step * 0.5));
    if (x < (min - EPS)) { jump(x + loop); return; }
    if (x > (max + EPS)) { jump(x - loop); return; }
  };
  const schedule = () => {
    clearTimeout(t);
    t = setTimeout(correct, 80);
  };

  rail.addEventListener("scroll", schedule, { passive: true });

  // drag中はsnap切り（気持ちよく）
  const setDrag = (on) => rail.classList.toggle("is-drag", !!on);
  rail.addEventListener("pointerdown", () => setDrag(true), { passive: true });
  rail.addEventListener("pointerup", () => { setDrag(false); schedule(); }, { passive: true });
  rail.addEventListener("pointercancel", () => setDrag(false), { passive: true });

  ensure();
}
function initIncomeRailInfinite() {
  const rail = document.querySelector("#income-examples .js-income-rail");
  if (!rail) return;

  // guard: single boot
  if (rail.dataset.incomeLoopBound === "1") return;
  rail.dataset.incomeLoopBound = "1";

  // already cloned?
  if (rail.querySelector('[data-clone="1"]')) return;

  const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const baseItems = Array.from(rail.children);
  if (baseItems.length < 2) return;

  const CLONE_N = Math.min(2, baseItems.length); // incomeは2で十分（3でもOK）
  const head = baseItems.slice(0, CLONE_N).map(n => n.cloneNode(true));
  const tail = baseItems.slice(-CLONE_N).map(n => n.cloneNode(true));

  tail.forEach(n => { n.dataset.clone = "1"; rail.prepend(n); });
  head.forEach(n => { n.dataset.clone = "1"; rail.append(n); });

  const getStep = () => {
    const a = rail.children[0];
    const b = rail.children[1];
    if (!a) return 0;
    const cs = getComputedStyle(rail);
    const gap = parseFloat(cs.columnGap || cs.gap || 0) || 0;
    const w = a.getBoundingClientRect().width || a.offsetWidth || 0;
    const by = Math.round(w + gap);
    if (by > 10) return by;
    if (b) {
      const dx = b.offsetLeft - a.offsetLeft;
      if (dx > 10) return dx;
    }
    return Math.round(w);
  };

  const baseCount = () => Array.from(rail.children).filter(n => !n.dataset.clone).length;

  let step = 0, pad = 0, loop = 0, min = 0, max = 0;
  let ready = false, isJump = false;

  const calc = () => {
    step = getStep();
    if (!step || step < 10) return false;
    pad = step * CLONE_N;
    loop = step * Math.max(1, baseCount());
    min = pad;
    max = pad + loop;
    return true;
  };

  const jump = (x) => {
    isJump = true;
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

  const ensure = (tries = 0) => {
    if (!calc()) {
      if (tries < 120) return requestAnimationFrame(() => ensure(tries + 1));
      return;
    }
    // start: center-ish
    jump(min + Math.floor(loop / 2));
    ready = true;
    if (prefersReduce) rail.style.scrollBehavior = "auto";
  };

  // correct after scroll end (debounce)
  let t = 0;
  const correct = () => {
    if (!ready || isJump) return;
    const x = Math.round(rail.scrollLeft);
    const EPS = Math.max(120, Math.round(step * 0.45));
    if (x < (min - EPS)) { jump(x + loop); return; }
    if (x > (max + EPS)) { jump(x - loop); return; }
  };
  const schedule = () => { clearTimeout(t); t = setTimeout(correct, 80); };

  rail.addEventListener("scroll", schedule, { passive: true });

  // drag hint
  const setDrag = (on) => rail.classList.toggle("is-drag", !!on);
  rail.addEventListener("pointerdown", () => setDrag(true), { passive: true });
  rail.addEventListener("pointerup", () => { setDrag(false); schedule(); }, { passive: true });
  rail.addEventListener("pointercancel", () => setDrag(false), { passive: true });

  ensure();
}
const safeCall = (name, fn) => {
  try { fn?.(); }
  catch (e) { console.warn(`[BBJ][boot] ${name} failed`, e); }
};

/* expose for SSOT (bbj_features.js) */
window.initIncomeRailInfinite_Work = initIncomeRailInfinite_Work;

function boot() {
  safeCall("initFloatCta", () => window.BBJ?.initFloatCta?.());
  safeCall("initBackToTop", () => window.BBJ?.initBackToTop?.());

  safeCall("syncBottomSeat", () => { requestAnimationFrame(() => window.BBJ?.syncBottomSeat?.()); });
  safeCall("bindSeatScroll", () => window.addEventListener("scroll", () => window.BBJ?.syncBottomSeat?.(), { passive: true }));
  safeCall("initIncomeExamples", () => {
    window.BBJ?.initIncomeExamples?.();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      initIncomeRailInfinite_Work();

    }));
  });
  safeCall("initWorkstyleSim", () => window.BBJFeature?.initWorkstyleSim?.());
//  //   safeCall("resetWorkstyleRail", () => window.BBJFeature?.resetWorkStyleRail?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" }));
  safeCall("initWorkstyleRail2", () => window.BBJFeature?.initWorkstyleRail2?.({ cards: ".js-ws-cards", mini: ".js-ws-mini" }));



}

(function(){
  const footer = document.querySelector("footer.work-footer");
  if(!footer) return;

  function checkDock(){
    const top = footer.getBoundingClientRect().top;

    // 入り口：薄く（まだ押せる）
    const soft = top < window.innerHeight - 40;

    // 深い：完全に消す（邪魔排除）
    const hard = top < window.innerHeight - 180;

    document.body.classList.toggle("is-footer-dock-soft", soft);
    document.body.classList.toggle("is-footer-dock", hard);
  }

  window.addEventListener("scroll", checkDock, { passive:true });
  window.addEventListener("resize", checkDock);
  checkDock();
})();