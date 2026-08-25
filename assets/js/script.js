// Dhiphos — progressive enhancement: year, section nav, mobile nav,
// custom select (theme-aligned), mailto inquiry.
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

  // Custom select — fully themeable (native <option> lists ignore CSS)
  (function () {
    var selects = document.querySelectorAll(".inquiry select");
    if (!selects.length) return;

    function closeAll(except) {
      document.querySelectorAll(".select.is-open").forEach(function (wrap) {
        if (wrap === except) return;
        wrap.classList.remove("is-open");
        var list = wrap.querySelector(".select-list");
        var btn = wrap.querySelector(".select-trigger");
        if (list) list.hidden = true;
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    selects.forEach(function (native, idx) {
      if (native.dataset.enhanced === "1") return;
      native.dataset.enhanced = "1";
      native.classList.add("select-native");
      native.tabIndex = -1;

      var wrap = document.createElement("div");
      wrap.className = "select";
      wrap.dataset.select = "";

      var listId = "select-list-" + (native.id || idx);
      var trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", listId);
      if (native.id) {
        trigger.id = native.id + "-trigger";
        var label = document.querySelector('label[for="' + native.id + '"]');
        if (label) trigger.setAttribute("aria-labelledby", label.id || "");
        if (label && !label.id) {
          label.id = native.id + "-label";
          trigger.setAttribute("aria-labelledby", label.id);
        }
      }

      var labelEl = document.createElement("span");
      labelEl.className = "select-trigger-label";
      var chevron = document.createElement("span");
      chevron.className = "select-chevron";
      chevron.setAttribute("aria-hidden", "true");
      trigger.appendChild(labelEl);
      trigger.appendChild(chevron);

      var list = document.createElement("ul");
      list.className = "select-list";
      list.id = listId;
      list.setAttribute("role", "listbox");
      list.hidden = true;

      function syncLabel() {
        var opt = native.options[native.selectedIndex];
        var text = opt ? opt.textContent : "";
        var empty = !native.value;
        labelEl.textContent = empty ? (text || "Select…") : text;
        labelEl.classList.toggle("is-placeholder", empty);
      }

      Array.prototype.forEach.call(native.options, function (opt, i) {
        var li = document.createElement("li");
        li.setAttribute("role", "presentation");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "select-option";
        btn.setAttribute("role", "option");
        btn.dataset.value = opt.value;
        btn.textContent = opt.textContent;
        if (!opt.value) btn.classList.add("is-placeholder");
        if (opt.selected) btn.classList.add("is-selected");
        btn.setAttribute("aria-selected", opt.selected ? "true" : "false");
        btn.addEventListener("click", function () {
          native.selectedIndex = i;
          native.dispatchEvent(new Event("change", { bubbles: true }));
          list.querySelectorAll(".select-option").forEach(function (o) {
            o.classList.remove("is-selected");
            o.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-selected");
          btn.setAttribute("aria-selected", "true");
          syncLabel();
          closeAll();
          trigger.focus();
        });
        li.appendChild(btn);
        list.appendChild(li);
      });

      syncLabel();

      function setOpen(open) {
        wrap.classList.toggle("is-open", open);
        list.hidden = !open;
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          closeAll(wrap);
          var selected = list.querySelector(".select-option.is-selected") ||
            list.querySelector(".select-option");
          if (selected) selected.focus();
        }
      }

      trigger.addEventListener("click", function () {
        setOpen(list.hidden);
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
      });

      list.addEventListener("keydown", function (e) {
        var options = Array.prototype.slice.call(list.querySelectorAll(".select-option"));
        var i = options.indexOf(document.activeElement);
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          trigger.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (i < options.length - 1) options[i + 1].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (i > 0) options[i - 1].focus();
          else trigger.focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          options[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          options[options.length - 1].focus();
        }
      });

      native.parentNode.insertBefore(wrap, native);
      wrap.appendChild(native);
      wrap.appendChild(trigger);
      wrap.appendChild(list);
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".select")) closeAll();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
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

  function focusField(name) {
    var el = form.elements.namedItem(name);
    if (!el) return;
    var trigger = document.getElementById(el.id + "-trigger");
    if (trigger) trigger.focus();
    else el.focus();
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
      focusField("name");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("Please enter a valid work email.", "err");
      focusField("email");
      return;
    }
    if (!company) {
      setStatus("Please enter your company.", "err");
      focusField("company");
      return;
    }
    if (!interest) {
      setStatus("Please select a primary interest.", "err");
      focusField("interest");
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
