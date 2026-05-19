/* =========================
   bbj_components.js — SSOT (defs only)
   - NO auto run
   - once-guard prevents multi-init
   - each init: return if DOM missing
========================= */
(() => {
    const NS = (window.BBJ = window.BBJ || {});
    const _once = (NS._once = NS._once || Object.create(null));

    function once(key, fn) {
        if (_once[key]) return;
        _once[key] = true;
        try { fn(); } catch (e) { console.error(`[BBJ] init failed: ${key}`, e); }
    }

    function q(root, sel) {
        const base = typeof root === "string" ? document.querySelector(root) : root;
        if (!base) return null;
        return base.querySelector(sel);
    }
    function qa(root, sel) {
        const base = typeof root === "string" ? document.querySelector(root) : root;
        if (!base) return [];
        return Array.from(base.querySelectorAll(sel));
    }

    /* =========================
       Smooth Anchor (shared)
    ========================= */
    NS.initSmoothAnchor = (opts = {}) => once("smoothAnchor", () => {
        const selector = opts.selector || 'a[href^="#"]';
        const offset = Number(opts.offset || 0); // header height add if needed

        const links = Array.from(document.querySelectorAll(selector));
        if (!links.length) return;

        links.forEach(a => {
            a.addEventListener("click", (e) => {
                const href = a.getAttribute("href");
                if (!href || href === "#" || !href.startsWith("#")) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const y = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: y, behavior: "smooth" });
                history.pushState(null, "", href);
            }, { passive: false });
        });
    });

    /* =========================
       Back to Top (shared)
    ========================= */
    NS.initBackToTop = (opts = {}) => once("backToTop", () => {
        const btn = document.querySelector(opts.selector || "[data-to-top]");
        if (!btn) return;

        const threshold = Number(opts.threshold ?? 520);

        const onScroll = () => {
            const show = window.scrollY > threshold;

            // 見た目は class で統一
            btn.classList.toggle("is-visible", show);

            // hidden 属性があれば同期（TOWA対策）
            if ("hidden" in btn) btn.hidden = !show;
        };

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    });

    /* =========================
       Floating CTA (shared)
    ========================= */
    NS.initFloatingCta = (opts = {}) => once("floatingCta", () => {
        const el = document.querySelector(opts.selector || ".js-floating-cta");
        if (!el) return;

        const threshold = Number(opts.threshold ?? 220);

        const onScroll = () => {
            const show = window.scrollY > threshold;
            el.classList.toggle("is-show", show);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    });

    /* =========================
       FAQ Accordion (shared)
       - if no .faq => return
       - structure is flexible:
         [data-faq-q] toggles nextElementSibling or [data-faq-a]
    ========================= */
    NS.initFaqAccordion = (opts = {}) => once("faqAccordion", () => {
        const root = document.querySelector(opts.root || ".faq");
        if (!root) return;

        const qs = root.querySelectorAll("[data-faq-q], .faq-q, .faq__q");
        if (!qs.length) return;

        qs.forEach(qEl => {
            qEl.addEventListener("click", () => {
                const item = qEl.closest("[data-faq-item], .faq-item, .faq__item") || qEl.parentElement;
                const aEl =
                    (item && item.querySelector("[data-faq-a], .faq-a, .faq__a")) ||
                    qEl.nextElementSibling;

                if (!aEl) return;

                const isOpen = item?.classList.contains("is-open") || aEl.classList.contains("is-open");
                item?.classList.toggle("is-open", !isOpen);
                aEl.classList.toggle("is-open", !isOpen);

                // ARIA (if exists)
                if (qEl.hasAttribute("aria-expanded")) qEl.setAttribute("aria-expanded", String(!isOpen));
            }, { passive: true });
        });
    });

    /* =========================
       WorkStyle Rail (shared)
       - uses existing DOM:
         root: "#work-style"
         .js-ws-cards / .js-ws-mini を想定
       - template rendering is NEXT TASK (work SSOT)
    ========================= */
    // bbj_components.js（差し替え推奨）
    NS.initWorkstyleRail = (opts = {}) => once("workstyleRail", () => {
        const sel = opts.root || "#workstyle";
        const root =
            document.querySelector(sel) ||
            document.querySelector("#work-style"); // 互換

        if (!root) return;

        const rail = root.querySelector(".js-ws-cards");
        const mini = root.querySelector(".js-ws-mini");
        if (!rail && !mini) return;

        rail?.classList.add("is-ready");
        mini?.classList.add("is-ready");
    });

    /* =========================
       WorkStyle Simulator (shared)
       - root: "#workstyle-sim" (or element)
       - expects:
         [data-sim-hourly] [data-sim-weekly] [data-sim-monthly]
       - calc:
         hourly * 2h * weekly * 4weeks * (1 - feeRate)
    ========================= */
    NS.initWorkstyleSim = (opts = {}) => once("workstyleSim", () => {
        const root = typeof opts.root === "string"
            ? document.querySelector(opts.root)
            : (opts.root || document.querySelector("#workstyle-sim"));

        if (!root) return;

        const hourlyEl = root.querySelector("[data-sim-hourly]");
        const weeklyEl = root.querySelector("[data-sim-weekly]");
        const monthlyEl = root.querySelector("[data-sim-monthly]");
        if (!hourlyEl || !weeklyEl || !monthlyEl) return;

        const hoursPerSupport = Number(opts.hoursPerSupport ?? 2);
        const weeksPerMonth = Number(opts.weeksPerMonth ?? 4);
        const feeRate = Number(opts.feeRate ?? 0.236);

        const nf = new Intl.NumberFormat("ja-JP");

        const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

        const calc = () => {
            const hourly = Number(hourlyEl.value || 0);
            const weekly = Number(weeklyEl.value || 0);

            const gross = hourly * hoursPerSupport * weekly * weeksPerMonth;
            const net = Math.floor(gross * (1 - feeRate));

            monthlyEl.textContent = nf.format(net);
        };

        // 初期値が空でも表示は出す
        calc();

        hourlyEl.addEventListener("input", calc, { passive: true });
        weeklyEl.addEventListener("input", calc, { passive: true });
    });

})();

