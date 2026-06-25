var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

// ====== Scroll-reveal ======
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || REDUCE) {
    els.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
})();

// ====== Combined scroll effects (progress, reviews, portfolio) ======
(function () {
  var root = document.documentElement;
  var bar = document.getElementById('progressBar');
  var revSlider = document.querySelector('.rev-slider');
  var revTrack = document.getElementById('revTrack');
  var hsec = document.getElementById('work');
  var htrack = document.getElementById('workTrack');
  var hsticky = hsec ? hsec.querySelector('.hscroll__sticky') : null;

  if (REDUCE && hsec) hsec.classList.add('no-pin');

  // Size the portfolio so vertical scroll distance == horizontal travel.
  var hMaxX = 0;
  var jobs = htrack ? htrack.querySelectorAll('.job') : [];
  function layoutPortfolio() {
    if (!hsec || !htrack || !hsticky || hsec.classList.contains('no-pin')) return;
    htrack.style.transform = 'none';
    hMaxX = Math.max(0, htrack.scrollWidth - hsticky.clientWidth);
    hsec.style.height = (window.innerHeight + hMaxX) + 'px';
  }

  var ticking = false;
  function onScroll() { if (!ticking) { requestAnimationFrame(run); ticking = true; } }
  function run() {
    ticking = false;
    var sy = window.scrollY || root.scrollTop;
    var vh = window.innerHeight;

    if (bar) {
      var max = root.scrollHeight - root.clientHeight;
      bar.style.width = (max > 0 ? sy / max * 100 : 0) + '%';
    }

    if (revSlider && revTrack && !REDUCE) {
      var r = revSlider.getBoundingClientRect();
      var prog = clamp((vh - r.top) / (vh + r.height), 0, 1);
      var maxX = revTrack.scrollWidth - revSlider.clientWidth;
      if (maxX < 0) maxX = 0;
      revTrack.style.transform = 'translateX(' + (-prog * maxX).toFixed(1) + 'px)';
    }

    if (hsec && htrack && hsticky && !hsec.classList.contains('no-pin') && hMaxX > 0) {
      var p = clamp((sy - hsec.offsetTop) / hMaxX, 0, 1);
      htrack.style.transform = 'translateX(' + (-p * hMaxX).toFixed(1) + 'px)';
    }
  }
  function relayout() { layoutPortfolio(); run(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  relayout();
})();

// ====== Milton Keynes map backdrop (OpenStreetMap via Leaflet) ======
(function () {
  var el = document.getElementById('mkMap');
  if (!el || typeof L === 'undefined') return;
  var MK = [52.0406, -0.7594];
  var map = L.map(el, {
    zoomControl: false, attributionControl: true,
    dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
    boxZoom: false, keyboard: false, touchZoom: false, tap: false
  }).setView(MK, 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(map);
  function fix() { map.invalidateSize(); map.setView(MK, 12); }
  setTimeout(fix, 200);
  window.addEventListener('load', fix);
  window.addEventListener('resize', fix);
})();
