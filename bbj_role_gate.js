(() => {
  // ===== SSOT: Role Menu (PC slide / SP bottom sheet) =====
  const URL_SITTER = "https://baby-j.site/sign_in?role=sitter&mode=sign_up&lang=ja_jp";
  const URL_TUTORS = "https://baby-j.site/sign_in?role=tutors&mode=sign_up&lang=ja_jp";
  const URL_CONTACT = "https://service.baby-j.site/contact";

  // once guard
  if (document.documentElement.dataset.roleGateBound === "1") return;
  document.documentElement.dataset.roleGateBound = "1";

  const ID_STYLE = "bbj-role-menu-style";
  const ID_OVERLAY = "bbj-role-menu-overlay";
  const ID_PANEL = "bbj-role-menu-panel";

  // ---- assets (必要ならパスだけ合わせて) ----
  const ICON_SITTER = "./bbj-images/icon_nursing_childcare_01.webp";
  const ICON_TUTOR = "./bbj-images/icon_education_book_01.webp";

  // ===== SSOT CSS (single) =====
  const CSS = `
:root{
  --rm-ink:#102235;
  --rm-navy:#10426F;
  --rm-paper:#F4F2EE;
  --rm-card:#FFFFFF;
  --rm-line: rgba(16,34,53,.10);
  --rm-shadow: 0 26px 70px rgba(16,34,53,.18);
  --rm-radius: 28px;
  --rm-radius2: 22px;
}

/* ---------- overlay (simple) ---------- */
#${ID_OVERLAY}{
  position: fixed;
  inset: 0;
  z-index: 2147483646;

  background: rgba(16,28,46,.58);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease;

  /* “モーダル感”を減らす：ぼかし無し・演出無し */
}
html.is-role-menu-open #${ID_OVERLAY}{
  opacity: 1;
  pointer-events: auto;
}

/* ---------- panel base ---------- */
#${ID_PANEL}{
  position: fixed;
  z-index: 2147483647;

  width: min(520px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  background: var(--rm-paper);
  border: 1px solid rgba(255,255,255,.55);
  box-shadow: var(--rm-shadow);
  border-radius: var(--rm-radius);

  opacity: 0;
  pointer-events: none;
  transition: transform .22s ease, opacity .16s ease;

  /* NOTE: PC/SPで transform を切り替える */
}

/* open */
html.is-role-menu-open #${ID_PANEL}{
  opacity: 1;
  pointer-events: auto;
}

/* ---------- close ---------- */
#${ID_PANEL} .rm-x{
  position:absolute;
  top: 14px;
  right: 14px;

  width: 34px;
  height: 34px;
  border-radius: 999px;

  background: rgba(255,255,255,.90);
  border: 1px solid rgba(16,34,53,.10);

  color: rgba(16,34,53,.55);
  font-size: 16px;
  line-height: 34px;

  display:grid;
  place-items:center;

  cursor:pointer;
  -webkit-tap-highlight-color: transparent;
}

/* ---------- header ---------- */
#${ID_PANEL} .rm-hero{
  padding: 22px 22px 14px;
}
#${ID_PANEL} .rm-kicker{
  margin: 0 0 6px;
  color: rgba(16,34,53,.55);
  letter-spacing: .06em;
  font-size: 12px;
}
#${ID_PANEL} .rm-title{
  margin: 0;
  color: var(--rm-navy);
  font-weight: 800;
  letter-spacing: .04em;
  font-size: 20px;
  line-height: 1.35;
}

/* ---------- list ---------- */

#${ID_PANEL} .rm-list{
  padding: 0 16px 16px;
  display: grid;
  gap: 12px;
}
#${ID_PANEL} .rm-item{
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 14px;
  align-items: center;

  padding: 14px 14px;
  border-radius: var(--rm-radius2);

  background: var(--rm-card);
  border: 1px solid var(--rm-line);
  box-shadow: 0 12px 28px rgba(16,34,53,.08);

  text-align: left;
  cursor: pointer;
}
#${ID_PANEL} .rm-ico{
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
}
#${ID_PANEL} .rm-ico img{
  width: 84px;
  height: 84px;
  display: block;
}
#${ID_PANEL} .rm-h{
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: rgba(16,34,53,.90);
  letter-spacing: .02em;
}
#${ID_PANEL} .rm-d{
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(16,34,53,.56);
}

/* ---------- center ---------- */
/* ========== PC: centered gate ========== */
@media (min-width: 901px){
  #${ID_PANEL}{
    left: 50%;
    top: 56%;
    right: auto;
    transform: translate(-50%, -50%);
    width: min(760px, calc(100vw - 48px));
  }

  html.is-role-menu-open #${ID_PANEL}{
    transform: translate(-50%, -50%);
  }

  #${ID_PANEL} .rm-list{
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}  


/* ---------- footer ---------- */
#${ID_PANEL} .rm-foot{
  padding: 12px 22px 18px;
  border-top: 1px solid rgba(16,34,53,.07);
  background: rgba(255,255,255,.35);
}
#${ID_PANEL} .rm-note{
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(16,34,53,.60);
}
#${ID_PANEL} .rm-links{
  margin-top: 10px;
  display:flex;
  gap: 14px;
  flex-wrap: wrap;
}
#${ID_PANEL} .rm-link{
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;

  color: rgba(16,34,53,.72);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(173,133,63,.45);
}

/* ========== PC: right slide (menu feel) ========== */
@media (min-width: 901px){
  #${ID_PANEL}{
    left: 50%;
    top: 56%;
    right: auto;
    transform: translate(-50%, -50%);
    width: min(760px, calc(100vw - 48px));
  }
  html.is-role-menu-open #${ID_PANEL}{
    transform: translate(-50%, -50%);
  }
}

/* ========== SP: bottom sheet (light) ========== */
@media (max-width: 900px){
  #${ID_PANEL}{
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%) translateY(24px);
    width: calc(100vw - 24px);
    border-radius: 26px;
  }
  html.is-role-menu-open #${ID_PANEL}{
    transform: translateX(-50%) translateY(0);
  }

  #${ID_PANEL} .rm-item{
    grid-template-columns: 72px 1fr;
  }
  #${ID_PANEL} .rm-ico, #${ID_PANEL} .rm-ico img{
    width: 72px;
    height: 72px;
  }
}

/* ========== SP: footer CTA sticky (fixed inside sheet) ========== */
@media (max-width: 900px){
  /* panel内スクロールにする前提 */
  #bbj-role-menu-panel{
    overflow: auto;
  }

  /* footerを下に固定 */
  #bbj-role-menu-panel .rm-foot{
    position: sticky;
    bottom: 0;
    z-index: 2;

    /* “固定感”を出すための薄い境界 */
    border-top: 1px solid rgba(16,34,53,.10);
    background: rgba(244,242,238,.92);
    backdrop-filter: blur(8px);
  }

  /* footerに隠れないよう、リスト側に下余白を確保 */
  #bbj-role-menu-panel .rm-list{
    padding-bottom: 18px;
  }

  /* iPhone小さめでボタンがきつい時の呼吸 */
  #bbj-role-menu-panel .rm-links{
    justify-content: space-between;
  }
}
/* === PATCH: remove title for luxury UI === */
#${ID_PANEL} .rm-title{
  display: none;
}
/* === PATCH: card = action button feel === */
#${ID_PANEL} .rm-item{
  border-radius: 999px;
  padding: 18px 24px;
}

`.trim();

  function mountStyles() {
    let st = document.getElementById(ID_STYLE);
    if (!st) {
      st = document.createElement("style");
      st.id = ID_STYLE;
      document.head.appendChild(st);
    }
    st.textContent = CSS;
  }

  function ensureUI() {
    mountStyles();

    let overlay = document.getElementById(ID_OVERLAY);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = ID_OVERLAY;
      overlay.addEventListener("click", closeMenu);
      document.body.appendChild(overlay);
    }

    let panel = document.getElementById(ID_PANEL);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = ID_PANEL;

      panel.innerHTML = `
<button class="rm-x" type="button" aria-label="閉じる" data-close="1">×</button>

<div class="rm-hero">
  <p class="rm-kicker">LET’S START</p>
  <h3 class="rm-title">活かしたい専門性を選択</h3>
</div>

<div class="rm-list">
  <button class="rm-item" type="button" data-action="sitter">
    <div class="rm-ico"><img src="${ICON_SITTER}" alt=""></div>
    <div>
      <p class="rm-h">シッターで登録する</p>
      <p class="rm-d">看護・保育の専門を活かす</p>
    </div>
  </button>

  <button class="rm-item" type="button" data-action="tutors">
    <div class="rm-ico"><img src="${ICON_TUTOR}" alt=""></div>
    <div>
      <p class="rm-h">家庭教師で登録する</p>
      <p class="rm-d">知識と経験を活かして教える</p>
    </div>
  </button>
</div>

<div class="rm-foot">
  <p class="rm-note">看護・教育分野で専門性をお持ちの方へ。多くのご家庭が、その力を必要としています。</p>
  <div class="rm-links">
    <button class="rm-link" type="button" data-action="contact">まずは相談する</button>
    <a class="rm-link" href="#faq" data-action="faq">FAQを見る</a>
  </div>
</div>
      `.trim();

      // close button
      panel.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.closest && t.closest("[data-close]")) {
          e.preventDefault();
          closeMenu();
          return;
        }
      });

      // actions
      panel.addEventListener("click", (e) => {
        const btn = e.target?.closest?.("[data-action]");
        if (!btn) return;

        const act = btn.getAttribute("data-action");
        if (!act) return;

        if (act === "sitter") {
          closeMenu();
          window.location.assign(URL_SITTER);
          return;
        }
        if (act === "tutors") {
          closeMenu();
          window.location.assign(URL_TUTORS);
          return;
        }
        if (act === "contact") {
          closeMenu();
          window.location.assign(URL_CONTACT);
          return;
        }
        // faq: in-page anchor (close only)
        if (act === "faq") {
          closeMenu();
          return;
        }
      });

      document.body.appendChild(panel);
    }

    return { overlay, panel };
  }

  function openMenu() {
    ensureUI();
    document.documentElement.classList.add("is-role-menu-open");
  }

  function closeMenu() {
    document.documentElement.classList.remove("is-role-menu-open");
  }

  // ESC close
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!document.documentElement.classList.contains("is-role-menu-open")) return;
    closeMenu();
  });

  // ---- intent detection (safe) ----
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const txt = (el) => norm(el?.textContent || "");
  const hrefOf = (a) => norm(a?.getAttribute?.("href") || "");

  function isContactLink(a) {
    const h = hrefOf(a);
    if (!h) return false;
    return h.includes("/contact") || h.includes("service.baby-j.site/contact");
  }

function looksLikeRegister(a) {
  const t = txt(a);
  const h = hrefOf(a);

  // このリンクは横取りしない（Workflowなど）
  if (a?.matches?.("[data-no-role-menu='1']")) return false;

  // ページ内リンクは #start だけ登録扱い。
  // #workflow / #faq / #about などは絶対に横取りしない
  if (h.startsWith("#") && h !== "#start") return false;

  // 明示フックがあれば最優先
  if (a?.dataset?.roleGate === "1") return true;

  // contact は除外
  if (isContactLink(a)) return false;

  const hasWord =
    t.includes("登録") ||
    t.includes("今すぐ登録") ||
    t.includes("はじめる") ||
    t.includes("始める");

  const hasSignIn = h.includes("/sign_in") || h.includes("sign_in?role=");

  const isFAQ = t.toLowerCase().includes("faq") || h.includes("#faq");
  const isInquiry = t.includes("お問い合わせ") || isContactLink(a);

  if (isFAQ || isInquiry) return false;

  return hasWord || hasSignIn;
}
  // delegate: capture phaseで先に拾う（他JSに奪われにくい）
  document.addEventListener(
  "click",
  (e) => {

    // ===== PATCH 1 : explicit RoleGate trigger =====
    const trg = e.target.closest("[data-role-gate]");
    if (trg) {
      e.preventDefault();
      window.__BBJ_RG_INTENT__ = trg.getAttribute("data-role-gate") || "entry";
      openMenu();
      return;
    }

    const a = e.target.closest?.("a, button");      if (!a) return;

      // ✅ PATCH
      if (a.closest?.("[data-no-role-menu]")) return;

      // すでに開いてるなら、外側クリックは overlay が処理する（ここでは何もしない）
      if (document.documentElement.classList.contains("is-role-menu-open")) return;

      // button でも a でも：登録っぽい導線はメニューへ
      const isAnchor = a.tagName === "A";
      if (isAnchor && looksLikeRegister(a)) {
        e.preventDefault();
        openMenu();
        return;
      }

      // button の場合：テキストだけで拾う（やりすぎ防止で “登録” を含む時だけ）
      if (!isAnchor) {
        const t = txt(a);
        if (t.includes("登録")) {
          e.preventDefault();
          openMenu();
        }
      }
    },
    true
  );

  // expose for debug
  window.BBJ_ROLE_MENU = { openMenu, closeMenu };
})();