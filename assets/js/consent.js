// Dhiphos — Consent Mode v2 banner.
// Plain DOM, no frameworks, no third-party SDK. Pairs with the
// gtag snippet in <head>, which sets `analytics_storage` (and the
// ad signals) to denied by default. This script:
//   1. checks localStorage for a prior decision;
//   2. honors Global Privacy Control / DNT signals as an implicit
//      "denied" without showing the banner;
//   3. otherwise renders a small modeless banner with two
//      equally-weighted choices (Decline / Accept) and persists
//      the visitor's pick for ~12 months;
//   4. exposes window.dhiphosConsent.open() so the footer
//      "Cookie preferences" link can re-open the banner.
//
// We never enable ad signals — Dhiphos doesn't run ads. The
// Accept button only flips analytics_storage to 'granted'.

(function () {
  "use strict";

  var STORAGE_KEY = "dhiphos:consent";
  var STORAGE_VERSION = 1;
  var TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

  // Re-define a local pusher that targets the same dataLayer the
  // gtag snippet uses. This script is loaded with `defer`, so by
  // the time it runs the snippet has already initialized
  // window.dataLayer and `window.gtag`. We re-create the helper
  // locally to stay decoupled from the snippet's binding name.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // ---------- Persistence ----------

  function readChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (parsed.v !== STORAGE_VERSION) return null;
      if (typeof parsed.ts !== "number") return null;
      if (Date.now() - parsed.ts > TTL_MS) return null;
      if (parsed.choice !== "granted" && parsed.choice !== "denied") return null;
      return parsed.choice;
    } catch (e) {
      return null;
    }
  }

  function writeChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: STORAGE_VERSION,
        choice: choice,
        ts: Date.now()
      }));
    } catch (e) {
      // Private mode, full quota, disabled storage — silently ignore.
      // The consent state is still applied for the current page load.
    }
  }

  function clearChoice() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  // ---------- gtag bridge ----------

  function applyConsent(choice) {
    var state = choice === "granted" ? "granted" : "denied";
    gtag("consent", "update", {
      analytics_storage: state,
      // Ad signals stay denied regardless of choice — Dhiphos doesn't
      // run ads, so accepting analytics shouldn't enable ad targeting.
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  // Honor Global Privacy Control (the modern signal) and legacy DNT.
  // GPC is recognized in California, Colorado, and Connecticut law as
  // a binding opt-out signal; we apply it everywhere as a defensive
  // baseline.
  function gpcDenied() {
    if (!navigator) return false;
    if (navigator.globalPrivacyControl === true) return true;
    if (navigator.doNotTrack === "1") return true;
    return false;
  }

  // ---------- Banner DOM ----------

  var bannerEl = null;
  var lastFocusedEl = null;

  function buildBanner() {
    var wrap = document.createElement("aside");
    wrap.className = "consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "false");
    wrap.setAttribute("aria-labelledby", "consent-title");
    wrap.setAttribute("aria-describedby", "consent-body");

    wrap.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-title" id="consent-title">' +
          '<span class="caret" aria-hidden="true"></span>cookies' +
        '</p>' +
        '<p class="consent-body" id="consent-body">' +
          'We use Google Analytics to understand how visitors use this ' +
          'site. It sets cookies in your browser. We don\u2019t run ads ' +
          'or share your data for marketing. See our ' +
          '<a href="privacy.html#h-collect">privacy notice</a> for details.' +
        '</p>' +
        '<div class="consent-actions">' +
          '<button type="button" class="btn consent-decline" data-choice="denied">' +
            'Decline' +
          '</button>' +
          '<button type="button" class="btn btn-primary consent-accept" data-choice="granted">' +
            'Accept analytics' +
          '</button>' +
        '</div>' +
      '</div>';

    wrap.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest("[data-choice]");
      if (!btn) return;
      choose(btn.getAttribute("data-choice"));
    });

    // Esc dismisses the banner as a "Decline" — still an explicit
    // signal, just delivered via keyboard.
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        choose("denied");
      }
    });

    return wrap;
  }

  function showBanner() {
    if (bannerEl) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", showBanner, { once: true });
      return;
    }
    lastFocusedEl = document.activeElement;
    bannerEl = buildBanner();
    document.body.appendChild(bannerEl);

    // Force a layout pass, then add the visible class so the
    // CSS transition runs from hidden -> visible state.
    requestAnimationFrame(function () {
      if (bannerEl) bannerEl.classList.add("is-visible");
    });

    // Move focus to the Accept button after the slide-in finishes.
    // Quick enough not to feel stolen, slow enough that screen
    // readers announce the dialog.
    setTimeout(function () {
      if (!bannerEl) return;
      var accept = bannerEl.querySelector(".consent-accept");
      if (accept) accept.focus();
    }, 240);
  }

  function hideBanner() {
    if (!bannerEl) return;
    var node = bannerEl;
    bannerEl = null;
    node.classList.remove("is-visible");
    // Match the CSS transition before removing the node.
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
      // Restore focus to whatever the user was on before the banner
      // appeared. Avoid stealing focus if they've moved on.
      if (lastFocusedEl && document.contains(lastFocusedEl) &&
          typeof lastFocusedEl.focus === "function") {
        try { lastFocusedEl.focus({ preventScroll: true }); } catch (e) {}
      }
      lastFocusedEl = null;
    }, 220);
  }

  function choose(choice) {
    var resolved = choice === "granted" ? "granted" : "denied";
    writeChoice(resolved);
    applyConsent(resolved);
    hideBanner();
  }

  // ---------- Public API ----------

  window.dhiphosConsent = {
    /** Open the banner (e.g. from the "Cookie preferences" link). */
    open: function () { showBanner(); },
    /** Forget the stored decision and re-prompt. */
    reset: function () {
      clearChoice();
      showBanner();
    },
    /** Read the current stored choice ('granted' | 'denied' | null). */
    get: function () { return readChoice(); }
  };

  // ---------- Init ----------

  function init() {
    var stored = readChoice();
    if (stored) {
      applyConsent(stored);
      return;
    }
    if (gpcDenied()) {
      // Treat GPC/DNT as an implicit decline. Don't persist it —
      // if the user later disables GPC, we'll re-prompt rather
      // than carrying forward a signal they no longer send.
      applyConsent("denied");
      return;
    }
    // No prior decision and no GPC signal — ask.
    showBanner();
  }

  init();

  // Delegated handler for any [data-consent-open] link in the
  // footer (or anywhere else). Wired once at script load.
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var trigger = t.closest("[data-consent-open]");
    if (!trigger) return;
    e.preventDefault();
    showBanner();
  });
})();