(() => {
  // ===== SSOT: Workflow (tabs + lazy images) =====
  if (document.documentElement.dataset.workflowBound === "1") return;
  document.documentElement.dataset.workflowBound = "1";

  const root = document.querySelector(".wf");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-wf-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-wf-panel]"));
  if (!tabs.length || !panels.length) return;

  const setActive = (key) => {
    tabs.forEach((btn) => {
      const on = btn.dataset.wfTab === key;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    panels.forEach((sec) => {
      const on = sec.dataset.wfPanel === key;
      sec.classList.toggle("is-on", on);
      sec.hidden = !on;
    });
  };

  // click
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wf-tab]");
    if (!btn) return;
    setActive(btn.dataset.wfTab);
  });

  // initial
  const initial =
    tabs.find((b) => b.classList.contains("is-on"))?.dataset.wfTab || tabs[0].dataset.wfTab;
  setActive(initial);

  // ===== data-src -> src (avoid alt-only exposure) =====
  const imgs = Array.from(root.querySelectorAll('img[data-src]'));
  imgs.forEach((img) => {
    const src = img.getAttribute("data-src");
    if (!src) return;
    // already set?
    if (!img.getAttribute("src")) img.setAttribute("src", src);
  });
})();

(() => {
  // WF: image click toggles details (minimal, safe)
  const root = document.querySelector(".wf");
  if (!root) return;

  root.addEventListener("click", (e) => {
    const hit = e.target?.closest?.("[data-wf-detail-toggle]");
    if (!hit) return;

    const card = hit.closest(".wf-card");
    if (!card) return;

    const det = card.querySelector("details.wf-detail");
    if (!det) return;

    // toggle
    det.open = !det.open;

    // optional: openしたらsummary位置へ軽く寄せる（要らなければ消してOK）
    if (det.open) det.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, { passive: true });
})();

document.querySelector('.bbj-backtop')?.addEventListener('click',()=>{
  window.scrollTo({
    top:0,
    behavior:'smooth'
  });
});