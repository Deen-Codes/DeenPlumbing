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
    var last = jobs[jobs.length - 1];
    // scroll just far enough for the last card to reach screen centre
    hMaxX = last ? Math.max(0, last.offsetLeft + last.offsetWidth / 2 - window.innerWidth / 2) : 0;
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
      // Spotlight: the card nearest screen centre swells, eases back as it moves away
      var vc = window.innerWidth / 2;
      var range = window.innerWidth * 0.55;
      var ms = window.innerWidth <= 760 ? 0.12 : 0.20;
      var foc = [];
      for (var i = 0; i < jobs.length; i++) {
        var r = jobs[i].getBoundingClientRect();
        foc.push(clamp(1 - Math.abs((r.left + r.width / 2) - vc) / range, 0, 1));
      }
      for (i = 0; i < jobs.length; i++) {
        jobs[i].style.transform = 'scale(' + (1 + ms * foc[i]).toFixed(3) + ')';
        jobs[i].style.opacity = (0.55 + 0.45 * foc[i]).toFixed(3);
        jobs[i].style.zIndex = Math.round(foc[i] * 10);
      }
    } else if (jobs.length && hsec && hsec.classList.contains('no-pin')) {
      for (var k = 0; k < jobs.length; k++) { jobs[k].style.transform = ''; jobs[k].style.opacity = ''; jobs[k].style.zIndex = ''; }
    }
  }
  function relayout() { layoutPortfolio(); run(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  relayout();
})();
