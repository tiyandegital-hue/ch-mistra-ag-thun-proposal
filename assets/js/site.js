/* ============================================================
   MISTRA AG HEIZTECHNIKEN — shared site behaviour
   Business name is ONE swappable constant:
   change BUSINESS_NAME here and every [data-business] slot updates.
   ============================================================ */
window.BUSINESS_NAME = "Mistra AG Heiztechniken";
window.BUSINESS_BRAND = "Mistra AG";
window.BUSINESS_PHONE = "033 336 81 00";
window.BUSINESS_EMAIL = "info@mistra-ag.ch";

(function () {
  "use strict";

  /* Business name injection (single source of truth) */
  document.querySelectorAll("[data-business]").forEach(function (el) {
    el.textContent = window.BUSINESS_NAME;
  });
  document.querySelectorAll("[data-brand]").forEach(function (el) {
    el.textContent = window.BUSINESS_BRAND;
  });

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Schliessen ✕" : "Menü ☰";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Reveal-on-scroll (restraint: quick, subtle, once) */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Count-up numbers (hero telemetry / KPI figures) */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null, dur = 900;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals).replace(".", ",") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Demo forms: no backend — show confirmation, keep data on the page.
     (Demo-Website: Anfragen werden NICHT versendet.) */
  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var ok = form.parentElement.querySelector(".form-success");
      if (ok) {
        ok.classList.add("show");
        ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      form.querySelectorAll("button[type=submit]").forEach(function (b) {
        b.disabled = true; b.textContent = "✓ Anfrage erfasst (Demo)";
      });
    });
  });

  /* /anfrage mode switch: Pfad A (planbar) / Pfad B (Notfall) */
  var modeCards = document.querySelectorAll(".mode-card");
  var urgencyField = document.getElementById("urgency-field");
  modeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      modeCards.forEach(function (c) { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      card.classList.add("active");
      card.setAttribute("aria-pressed", "true");
      var mode = card.getAttribute("data-mode");
      if (urgencyField) {
        var sel = urgencyField.querySelector("select");
        if (sel) sel.value = mode === "b" ? "sofort" : "normal";
      }
      var hint = document.getElementById("mode-hint");
      if (hint) {
        hint.textContent = mode === "b"
          ? "Notfall gewählt: Bitte rufen Sie bei Heizungsausfall, Leckage oder Frostgefahr direkt an: 033 336 81 00 — das Formular ersetzt keinen Notruf."
          : "Planbare Anfrage gewählt: Wir melden uns zur Terminabsprache.";
      }
    });
  });

  /* Interactive 5-point self-check (/service-wartung + Startseite teaser) */
  document.querySelectorAll("[data-selfcheck]").forEach(function (box) {
    var items = box.querySelectorAll("input[type=checkbox]");
    var result = box.querySelector("[data-selfcheck-result]");
    function update() {
      var done = Array.prototype.filter.call(items, function (i) { return i.checked; }).length;
      if (!result) return;
      if (done === 0) {
        result.textContent = "Gehen Sie die 5 Punkte der Reihe nach durch — oft ist die Störung damit schon behoben.";
      } else if (done < 5) {
        result.textContent = done + " von 5 geprüft. Weiter mit dem nächsten Punkt.";
      } else {
        result.innerHTML = "Alle 5 Punkte geprüft und die Heizung läuft trotzdem nicht? <strong>Jetzt Pikettdienst anrufen: 033 336 81 00.</strong>";
      }
    }
    items.forEach(function (i) { i.addEventListener("change", update); });
    update();
  });
})();
