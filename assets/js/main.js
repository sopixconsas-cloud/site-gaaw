/* GAAW — interactions et animations du site vitrine */
(function () {
  "use strict";

  var cfg = window.GAAW_CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  var isAndroid = /Android/i.test(ua);
  var onDownloadPage = !!document.querySelector('meta[name="gaaw-page"][content="telecharger"]');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Liens des stores ---------- */
  var links = { ios: cfg.appStore || "", android: cfg.googlePlay || "" };
  $$('[data-store="ios"], [data-store="android"]').forEach(function (a) {
    var kind = a.getAttribute("data-store");
    if (links[kind]) {
      a.href = links[kind];
      a.rel = "noopener";
    } else {
      a.href = onDownloadPage ? "#dl-soon" : "telecharger.html";
      var tag = document.createElement("span");
      tag.className = "soon";
      tag.textContent = "Bientôt";
      a.appendChild(tag);
      a.setAttribute("aria-label", (kind === "ios" ? "App Store" : "Google Play") + " : bientôt disponible");
    }
  });
  var smartLink = (isIOS && links.ios) || (isAndroid && links.android) || "";
  $$('[data-store="smart"]').forEach(function (a) { if (smartLink) { a.href = smartLink; a.rel = "noopener"; } });

  /* Page « Télécharger » : redirection directe vers le bon store */
  if (onDownloadPage) {
    if (smartLink && !/[?&]stay/.test(location.search)) {
      location.replace(smartLink);
    } else if (!links.ios && !links.android) {
      var soon = $("#dl-soon"); if (soon) soon.hidden = false;
      var st = $(".dl-page .stores"); if (st) st.hidden = true;
      var t = $("#dl-title"); if (t) t.textContent = "GAAW arrive bientôt";
      var tx = $("#dl-text"); if (tx) tx.textContent = "L'application est en cours de publication sur l'App Store et Google Play.";
    }
  }

  /* ---------- En-tête et menu ---------- */
  var header = $("#header");
  var onScrollHeader = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  var toggle = $(".nav-toggle");
  if (toggle) {
    var closeNav = function () {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("#nav a").forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Apparitions au défilement ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Téléphone animé du hero ---------- */
  (function heroPhone() {
    var phone = $("#live-phone");
    if (!phone) return;
    var courier = $("#courier"), r1 = $("#r1"), r2 = $("#r2");
    var el = {
      status: $("#ph-status"), pct: $("#ph-pct"), eta: $("#ph-eta"), bar: $("#ph-bar"),
      cRow: $("#ph-courier"), cName: $("#ph-courier-name"), cSub: $("#ph-courier-sub"),
      cancel: $("#ph-cancel"), code: $("#ph-code"), done: $("#ph-done"),
      notif: $("#fc-notif"), pay: $("#fc-pay")
    };
    var place = function (path, t) {
      var p = path.getPointAtLength(path.getTotalLength() * t);
      courier.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
    };
    var move = function (path, dur) {
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var k = Math.min(1, (ts - start) / dur);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        place(path, e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var show = function (which) {
      [el.cancel, el.code, el.done].forEach(function (n) { n.classList.toggle("is-on", n === which); });
    };
    var set = function (s) {
      el.status.textContent = s.status;
      el.pct.textContent = s.pct + "%";
      el.bar.style.width = s.pct + "%";
      if (s.eta) el.eta.textContent = s.eta;
      var searching = s.pct <= 10;
      el.cRow.classList.toggle("is-searching", searching);
      el.cName.textContent = searching ? "Un livreur proche…" : "Thomas D.";
      el.cSub.textContent = searching ? "Rayon de 20 km" : "Vélo électrique";
      show(s.pct >= 100 ? el.done : (searching ? el.cancel : el.code));
    };

    if (reduce) {
      set({ status: "En route vers vous", pct: 75, eta: "Arrivée estimée : 5 min" });
      place(r2, .7);
      el.notif.classList.add("is-on"); el.pay.classList.add("is-on");
      return;
    }

    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var running = false;
    var cycle = function () {
      running = true;
      el.notif.classList.remove("is-on"); el.pay.classList.remove("is-on");
      place(r1, 0);
      set({ status: "Recherche d'un livreur…", pct: 10, eta: "Arrivée estimée : 15 min" });
      at(2300, function () { set({ status: "Livreur en route vers le retrait", pct: 30, eta: "Arrivée estimée : 15 min" }); move(r1, 2400); });
      at(5000, function () { set({ status: "Livreur sur place", pct: 50, eta: "Arrivée estimée : 10 min" }); });
      at(6600, function () { set({ status: "En route vers vous", pct: 75, eta: "Arrivée estimée : 5 min" }); move(r2, 3600); });
      at(7300, function () { el.notif.classList.add("is-on"); });
      at(10400, function () { set({ status: "Livré", pct: 100, eta: "Livré à l'instant" }); el.notif.classList.remove("is-on"); });
      at(11000, function () { el.pay.classList.add("is-on"); });
      at(14600, function () { running = false; cycle(); });
    };
    var stop = function () { timers.forEach(clearTimeout); timers = []; running = false; };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!running) cycle(); } else { stop(); }
      }, { threshold: 0.15 }).observe(phone);
    } else { cycle(); }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });
  })();

  /* ---------- Comment ça marche : récit au défilement ---------- */
  (function howSteps() {
    var steps = $$(".step");
    if (!steps.length) return;
    var shots = $$(".how-phone .phone-screen img");
    var bar = $(".how-progress"), box = $(".how-steps");
    var activate = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      shots.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(steps.indexOf(en.target)); });
      }, { rootMargin: "-45% 0px -50% 0px" });
      steps.forEach(function (s) { io.observe(s); });
    }
    var ticking = false;
    var update = function () {
      ticking = false;
      if (!bar || !box) return;
      var r = box.getBoundingClientRect();
      var k = (window.innerHeight * 0.5 - r.top) / (r.height - 20);
      bar.style.height = (Math.max(0, Math.min(1, k)) * (r.height - 20)) + "px";
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  /* ---------- Paiement réparti ---------- */
  (function split() {
    var sp = $("#split");
    if (!sp) return;
    var amount = $("[data-count]", sp);
    var run = function () {
      sp.classList.add("is-in");
      if (reduce || !amount) return;
      var target = +amount.getAttribute("data-count"), t0 = null;
      var tick = function (ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 900);
        amount.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + " €";
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(sp);
    } else { run(); }
  })();

  /* ---------- Onglets « Pour qui » ---------- */
  (function tabs() {
    var list = $('[role="tablist"]');
    if (!list) return;
    var tabsEls = $$('[role="tab"]', list);
    var select = function (tab, focus) {
      tabsEls.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (p) {
          p.hidden = !on;
          if (on && !reduce) { p.classList.remove("is-entering"); void p.offsetWidth; p.classList.add("is-entering"); }
        }
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    };
    tabsEls.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabsEls[(i + 1) % tabsEls.length];
        if (e.key === "ArrowLeft") n = tabsEls[(i - 1 + tabsEls.length) % tabsEls.length];
        if (e.key === "Home") n = tabsEls[0];
        if (e.key === "End") n = tabsEls[tabsEls.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  })();

  /* ---------- Barre de téléchargement mobile ---------- */
  (function mobileCta() {
    var bar = $("#mobile-cta"), hero = $(".hero"), dl = $("#telecharger"), foot = $(".site-footer");
    if (!bar || !hero || !("IntersectionObserver" in window)) return;
    var heroVisible = true, endVisible = false;
    var upd = function () {
      var on = !heroVisible && !endVisible;
      bar.classList.toggle("is-on", on);
      bar.setAttribute("aria-hidden", on ? "false" : "true");
      var a = $("a", bar); if (a) a.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; upd(); }, { threshold: 0.25 }).observe(hero);
    var seen = new Map();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { seen.set(e.target, e.isIntersecting); });
      endVisible = Array.from(seen.values()).some(Boolean); upd();
    });
    [dl, foot].forEach(function (n) { if (n) io.observe(n); });
  })();

  /* ---------- Code QR (ordinateur uniquement) ---------- */
  (function qr() {
    var box = $("#qr"), holder = $("#qr-code");
    if (!box || !holder || location.protocol === "file:") return;
    if (!window.matchMedia("(min-width: 641px) and (pointer: fine)").matches) return;
    var target = location.href.split("#")[0].replace(/[^/]*$/, "") + "telecharger.html";
    var draw = function () {
      try {
        var q = window.qrcode(0, "M");
        q.addData(target); q.make();
        holder.innerHTML = q.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
        var s = holder.querySelector("svg");
        if (s) { s.setAttribute("role", "img"); s.setAttribute("aria-label", "Code QR vers la page de téléchargement de GAAW"); }
        box.hidden = false;
      } catch (e) { /* le code QR reste masqué */ }
    };
    var load = function () {
      var sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
      sc.async = true; sc.onload = draw;
      document.head.appendChild(sc);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: "400px" });
      io.observe(holder.closest("section") || holder);
    } else { load(); }
  })();

  /* ---------- Sommaire des pages juridiques ---------- */
  (function toc() {
    var links = $$(".toc a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[en.target.id]; if (a) a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    $$(".legal-body h2[id]").forEach(function (h) { io.observe(h); });
  })();
})();
