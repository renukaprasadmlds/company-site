// Dhiphos — progressive enhancement: year, section nav, mobile nav, mailto inquiry.
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile nav toggle
  (function () {
    var topnav = document.querySelector(".topnav");
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.getElementById("primary-nav");
    if (!topnav || !toggle || !panel) return;

    function setOpen(open) {
      topnav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      setOpen(!topnav.classList.contains("is-open"));
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  })();

  // Active-section indicator (home page hash nav only)
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
      rootMargin: "-72px 0px -45% 0px",
      threshold: [0, 0.15, 0.35, 0.6, 0.85, 1]
    });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  // Inquiry form → mailto (structured body to info@dhiphos.com)
  var form = document.getElementById("inquiry");
  if (!form) return;

  var status = document.getElementById("inquiry-status");
  var contactAddress = "info@dhiphos.com";

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("ok", "err");
    if (kind) status.classList.add(kind);
  }

  function val(name) {
    var el = form.elements.namedItem(name);
    return el && "value" in el ? String(el.value || "").trim() : "";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = val("name");
    var email = val("email");
    var company = val("company");
    var interest = val("interest");
    var stack = val("stack");
    var message = val("message");
    var source = val("source") || "dhiphos.site";

    if (!name) {
      setStatus("Please enter your name.", "err");
      form.elements.namedItem("name").focus();
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("Please enter a valid work email.", "err");
      form.elements.namedItem("email").focus();
      return;
    }
    if (!company) {
      setStatus("Please enter your company.", "err");
      form.elements.namedItem("company").focus();
      return;
    }
    if (!interest) {
      setStatus("Please select a primary interest.", "err");
      form.elements.namedItem("interest").focus();
      return;
    }

    var subject = encodeURIComponent(
      "Dhiphos inquiry — " + interest + " — " + company
    );
    var body = encodeURIComponent(
      "Hello Dhiphos team,\n\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Company: " + company + "\n" +
      "Primary interest: " + interest + "\n" +
      "Current stack: " + (stack || "(not provided)") + "\n" +
      "Source page: " + source + "\n\n" +
      "Message:\n" + (message || "(none)") + "\n\n" +
      "Best regards,\n" + name + "\n"
    );

    setStatus("Opening your email client…", "ok");
    window.location.href =
      "mailto:" + contactAddress + "?subject=" + subject + "&body=" + body;
  });
})();
