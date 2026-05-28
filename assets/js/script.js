// Dhiphos — small bits of progressive enhancement.
// No frameworks. No tracking. Plain DOM.

(function () {
  "use strict";

  // Footer year stamp.
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Active-section indicator in the topnav.
  // Watches each <section id="…"> referenced by a topnav link and
  // toggles `.is-active` on the matching <a> when that section is the
  // one currently dominating the viewport. Uses IntersectionObserver
  // so it costs ~nothing on scroll. Only runs on pages that actually
  // have same-page anchors in the nav (i.e. the home page).
  (function () {
    if (!("IntersectionObserver" in window)) return;
    var navLinks = document.querySelectorAll('.topnav-nav a[href^="#"]');
    if (!navLinks.length) return;

    var linkBySection = {};
    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (!id) return;
      var section = document.getElementById(id);
      if (!section) return;
      linkBySection[id] = link;
      sections.push(section);
    });
    if (!sections.length) return;

    function clearActive() {
      navLinks.forEach(function (l) { l.classList.remove("is-active"); });
    }

    // Track ratios so the "most visible" section wins when several
    // are intersecting at once (typical on tall viewports).
    var ratios = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var bestId = null;
      var bestRatio = 0;
      Object.keys(ratios).forEach(function (id) {
        if (ratios[id] > bestRatio) {
          bestRatio = ratios[id];
          bestId = id;
        }
      });
      clearActive();
      if (bestId && linkBySection[bestId]) {
        linkBySection[bestId].classList.add("is-active");
      }
    }, {
      // Account for the sticky 56px nav at the top.
      rootMargin: "-72px 0px -45% 0px",
      threshold: [0, 0.15, 0.35, 0.6, 0.85, 1]
    });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  // Signup form.
  // For now this is a client-only handler that validates the email and
  // falls back to a mailto: link so we don't need a backend on day one.
  // When you're ready, point `endpoint` at a form service (Formspree,
  // Netlify Forms, your own API, etc.).
  var form = document.getElementById("signup");
  if (!form) return;

  var input  = form.querySelector('input[type="email"]');
  var status = document.getElementById("signup-status");
  var endpoint = ""; // e.g. "https://formspree.io/f/xxxxxx"
  var contactAddress = "info@dhiphos.com";

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("ok", "err");
    if (kind) status.classList.add(kind);
  }

  function isValidEmail(value) {
    // Pragmatic, not RFC-perfect.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = (input && input.value || "").trim();

    if (!isValidEmail(value)) {
      setStatus("Please enter a valid email address.", "err");
      if (input) input.focus();
      return;
    }

    if (endpoint) {
      setStatus("Sending…", "");
      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "dhiphos.site" })
      })
        .then(function (r) {
          if (!r.ok) throw new Error("network");
          form.reset();
          setStatus("Thanks. We'll be in touch.", "ok");
        })
        .catch(function () {
          fallbackToMailto(value);
        });
    } else {
      fallbackToMailto(value);
    }
  });

  function fallbackToMailto(email) {
    var subject = encodeURIComponent(
      "Inquiry: Dhiphos offerings & services"
    );
    var body = encodeURIComponent(
      "Hello Dhiphos team,\n\n" +
      "I'd like to learn more about your offerings and services.\n\n" +
      "Area of interest: \n" +
      "Brief context: \n\n" +
      "Best regards,\n" +
      "[Your name, Company]\n"
    );
    var href = "mailto:" + contactAddress +
               "?subject=" + subject +
               "&body=" + body;
    setStatus("Opening your email client…", "ok");
    window.location.href = href;
  }
})();