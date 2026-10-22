/* ===== Sasaka Bale Property · animasi interaktif (dipakai semua halaman) ===== */
(function () {
  "use strict";
  var d = document, w = window, root = d.documentElement;
  var rm = w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = w.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var header = $("header"), home = $(".home-hero"), heroWait = 100;
  root.classList.add("js");

  /* 1. Loader pembuka (beranda, sekali per sesi) */
  (function () {
    if (!home || rm) return;
    try { if (sessionStorage.getItem("sb-intro")) return; sessionStorage.setItem("sb-intro", "1"); } catch (e) { return; }
    var l = d.createElement("div");
    l.className = "loader";
    l.innerHTML = '<img src="Logo%20Sasaka%20Bale%20Property.jpg" alt=""><span></span>';
    d.body.appendChild(l); d.body.style.overflow = "hidden"; heroWait = 1500;
    setTimeout(function () { l.classList.add("done"); d.body.style.overflow = ""; }, 1350);
    setTimeout(function () { l.remove(); }, 2400);
  })();

  /* 2. Marquee: gandakan isi agar berputar mulus */
  $$(".marquee-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* 3. Pecah teks per kata */
  function split(el) {
    var i = 0;
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { f.appendChild(d.createTextNode(" ")); return; }
            var s = d.createElement("span"), x = d.createElement("i");
            s.className = "wd"; x.textContent = t; x.style.setProperty("--i", i++); s.appendChild(x); f.appendChild(s);
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    el.classList.add("split");
  }

  /* 4. Reveal saat scroll */
  var auto = "main section:not(.home-hero) .wrap > *:not(h1):not(h2):not(.cards):not(.cols):not(.prices):not(.gal):not(.chips):not(.grid2):not(.stats):not(.rail):not([data-reveal]):not([data-split]),.card,.cols>div,.price,.gal figure,.chips a,.grid2>*,.kontak-list li";
  $$("main h1.t, main h2").forEach(function (h) { if (!h.hasAttribute("data-split") && !h.closest(".home-hero")) h.setAttribute("data-split", ""); });
  $$("[data-split]").forEach(split);
  $$(auto).forEach(function (e) { e.setAttribute("data-reveal", "up"); });
  var seen = new Map();
  $$("[data-reveal]").forEach(function (e) {
    var n = seen.get(e.parentNode) || 0; seen.set(e.parentNode, n + 1);
    if (!e.style.getPropertyValue("--d")) e.style.setProperty("--d", Math.min(n, 6) * 90 + "ms");
  });
  var items = $$("[data-reveal], .split");
  if (rm || !("IntersectionObserver" in w)) {
    items.forEach(function (e) { e.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        var e = x.target; io.unobserve(e);
        setTimeout(function () {
          e.classList.add("is-in");
          if (e.hasAttribute("data-reveal")) setTimeout(function () { e.removeAttribute("data-reveal"); e.classList.remove("is-in"); e.style.removeProperty("--d"); }, 2000);
        }, e.closest(".home-hero") ? heroWait : 0);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (e) { io.observe(e); });
  }

  /* 5. Hitung angka naik */
  var fmt = function (el, v) { return (el.dataset.pre || "") + v.toFixed(el.dataset.dec | 0).replace(".", ",") + (el.dataset.suf || ""); };
  $$("[data-count]").forEach(function (el) {
    var to = parseFloat(el.dataset.count);
    if (rm || !("IntersectionObserver" in w)) { el.textContent = fmt(el, to); return; }
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting) return; ob.disconnect();
      var t0 = null;
      (function f(t) { t0 = t0 || t; var p = Math.min((t - t0) / 1800, 1); el.textContent = fmt(el, to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(f); })(performance.now());
    }, { threshold: 0.6 }).observe(el);
  });

  /* 6. Teks menyala mengikuti scroll */
  var scrub = $("[data-scrub]"), words = [];
  if (scrub) {
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(function (t) { return '<span class="w">' + t + "</span>"; }).join(" ");
    words = $$(".w", scrub);
    if (rm) words.forEach(function (s) { s.classList.add("on"); });
  }

  /* 7. Loop scroll: progress bar, header pintar, parallax */
  var bar = d.createElement("div"); bar.className = "progress"; d.body.appendChild(bar);
  var pars = $$("[data-parallax], .cover img"), last = 0, tick = false, mx = 0, my = 0;
  var bg = $(".hero-bg"), hc = $(".hero-content");
  function frame() {
    tick = false;
    var y = w.scrollY, vh = w.innerHeight, h = root.scrollHeight - vh;
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (header) {
      header.classList.toggle("scrolled", y > 10);
      header.classList.toggle("hide-nav", y > last && y > 140 && !$("#menu.open"));
    }
    last = y;
    if (!rm) {
      if (home && y < vh * 1.3) {
        bg.style.transform = "translate3d(" + (-mx * 26) + "px," + (-my * 18 + y * 0.28) + "px,0) scale(" + (1 + y / 3500) + ")";
        hc.style.transform = "translate3d(" + (mx * 12) + "px," + (y * 0.16) + "px,0)";
        hc.style.opacity = Math.max(0, 1 - y / (vh * 0.8));
      }
      pars.forEach(function (p) {
        var r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        p.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * -(parseFloat(p.dataset.parallax) || 0.08)).toFixed(1) + "px");
      });
    }
    if (words.length && !rm) {
      var r = scrub.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35))), n = Math.round(p * words.length);
      words.forEach(function (s, i) { s.classList.toggle("on", i < n); });
    }
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  w.addEventListener("scroll", req, { passive: true }); w.addEventListener("resize", req);
  if (home && fine && !rm) home.addEventListener("pointermove", function (e) {
    var r = home.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; req();
  });
  frame();

  /* 8. Menu mobile */
  var b = $("#burger"), m = $("#menu");
  if (b && m) {
    b.addEventListener("click", function () { var o = m.classList.toggle("open"); b.setAttribute("aria-expanded", o); b.textContent = o ? "✕" : "☰"; });
    m.addEventListener("click", function () { m.classList.remove("open"); b.setAttribute("aria-expanded", "false"); b.textContent = "☰"; });
  }

  /* 9. Transisi antarhalaman (tirai) */
  var cur = d.createElement("div"); cur.className = "curtain"; cur.innerHTML = '<img src="Logo%20Sasaka%20Bale%20Property.jpg" alt="">'; d.body.appendChild(cur);
  d.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (!/^(https?|file):$/.test(u.protocol) || u.origin !== location.origin || u.pathname === location.pathname) return;
    e.preventDefault(); cur.classList.add("in");
    setTimeout(function () { location.href = a.href; }, rm ? 0 : 650);
  });
  w.addEventListener("pageshow", function (e) { if (e.persisted) cur.classList.remove("in"); });

  if (!rm) {
    /* 10. Kursor pengikut, tilt kartu, tombol magnetik */
    if (fine) {
      var c = d.createElement("div"); c.className = "cursor"; d.body.appendChild(c);
      var cx = 0, cy = 0, tx = 0, ty = 0;
      w.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; c.classList.add("show"); });
      d.addEventListener("pointerover", function (e) { c.classList.toggle("big", !!(e.target.closest && e.target.closest("a,button,[data-lightbox-src],[data-zoom],input,select,textarea"))); });
      d.documentElement.addEventListener("pointerleave", function () { c.classList.remove("show"); });
      (function loop() { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; c.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
      $$(".card").forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg");
          el.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 8 + "deg");
        });
        el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
      });
      $$(".btn").forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty("--mx", (e.clientX - r.left - r.width / 2) * 0.22 + "px");
          el.style.setProperty("--my", (e.clientY - r.top - r.height / 2) * 0.32 + "px");
        });
        el.addEventListener("pointerleave", function () { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
      });
    }
  }

  /* 11. Galeri geser (drag) */
  $$(".rail").forEach(function (r) {
    var down = false, moved = false, sx = 0, sl = 0;
    r.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = r.scrollLeft; r.classList.add("drag"); });
    w.addEventListener("pointermove", function (e) { if (!down) return; if (Math.abs(e.clientX - sx) > 4) moved = true; r.scrollLeft = sl - (e.clientX - sx); });
    w.addEventListener("pointerup", function () { down = false; r.classList.remove("drag"); });
    r.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  });

  /* 12. Lightbox foto (panah, keyboard, geser jari) */
  var pics = $$("[data-lightbox-src]");
  if (pics.length) {
    var lb = d.createElement("div"); lb.className = "lightbox";
    lb.innerHTML = '<button class="lb-x" aria-label="Tutup">✕</button><button class="lb-nav prev" aria-label="Sebelumnya">‹</button><button class="lb-nav next" aria-label="Berikutnya">›</button><figure><img alt=""><figcaption></figcaption></figure>';
    d.body.appendChild(lb);
    var im = $("img", lb), cp = $("figcaption", lb), idx = 0, x0 = 0;
    var show = function (i) {
      idx = (i + pics.length) % pics.length; var it = pics[idx];
      im.classList.remove("swap"); void im.offsetWidth;
      im.src = it.dataset.lightboxSrc; im.alt = it.dataset.caption || ""; cp.textContent = it.dataset.caption || ""; im.classList.add("swap");
    };
    var close = function () { lb.classList.remove("active"); d.body.style.overflow = ""; };
    pics.forEach(function (it, i) {
      it.tabIndex = 0;
      it.addEventListener("click", function () { show(i); lb.classList.add("active"); d.body.style.overflow = "hidden"; });
      it.addEventListener("keydown", function (e) { if (e.key === "Enter") it.click(); });
    });
    lb.addEventListener("click", function (e) {
      var t = e.target;
      if (t === lb || t.classList.contains("lb-x")) close();
      else if (t.classList.contains("prev")) show(idx - 1);
      else if (t.classList.contains("next")) show(idx + 1);
    });
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
    d.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("active")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1);
    });
  }
})();
