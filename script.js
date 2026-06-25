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

// ====== Milton Keynes "grid city" — stylised 3D (three.js), spins on scroll ======
(function () {
  var el = document.getElementById('mkMap');
  if (!el || typeof THREE === 'undefined') return;

  var W = el.clientWidth, H = el.clientHeight || 380;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.set(0, 9.5, 12);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xbcd2ff, 0.7));
  var dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(6, 12, 8); scene.add(dir);
  var glow = new THREE.PointLight(0xff9e3d, 1.4, 30); glow.position.set(0, 4, 0); scene.add(glow);

  var city = new THREE.Group(); scene.add(city);
  var GRID = 16, STEP = 1.4, half = (GRID * STEP) / 2;
  var amber = 0xff9e3d, blue = 0x3b9ad6;

  // Grid "roads" (MK's signature grid system) as lines on the plane
  var pts = [];
  for (var i = 0; i <= GRID; i++) {
    var x = -half + i * STEP;
    pts.push(x, 0, -half, x, 0, half);   // V roads
    pts.push(-half, 0, x, half, 0, x);   // H roads
  }
  var gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  city.add(new THREE.LineSegments(gGeo, new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.28 })));

  // A few "estates"/blocks for depth
  var blockMat = new THREE.MeshStandardMaterial({ color: 0x16324f, roughness: 0.6, metalness: 0.1 });
  var blockMatA = new THREE.MeshStandardMaterial({ color: amber, roughness: 0.5, metalness: 0.2, emissive: 0x4a2a06 });
  for (var b = 0; b < 46; b++) {
    var gx = Math.floor(Math.random() * GRID) - GRID / 2;
    var gz = Math.floor(Math.random() * GRID) - GRID / 2;
    if (Math.abs(gx) < 2 && Math.abs(gz) < 2) continue; // keep centre clear for marker
    var h = 0.3 + Math.random() * 1.6;
    var m = new THREE.Mesh(new THREE.BoxGeometry(STEP * 0.62, h, STEP * 0.62), Math.random() < 0.18 ? blockMatA : blockMat);
    m.position.set(gx * STEP + STEP / 2, h / 2, gz * STEP + STEP / 2);
    city.add(m);
  }

  // Central marker pin
  var pin = new THREE.Group();
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshStandardMaterial({ color: amber, emissive: 0xff7a1a, emissiveIntensity: 0.7 }));
  head.position.y = 2.6; pin.add(head);
  var spike = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.5, 24), new THREE.MeshStandardMaterial({ color: amber, emissive: 0x7a3a06 }));
  spike.position.y = 1.5; spike.rotation.x = Math.PI; pin.add(spike);
  var ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 40), new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; pin.add(ring);
  city.add(pin);

  // Town labels in roughly their real compass positions around MK
  function label(text, x, z, big) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 64;
    var ctx = c.getContext('2d');
    ctx.font = (big ? 'bold 34px' : '600 26px') + ' -apple-system, Arial, sans-serif';
    ctx.fillStyle = big ? '#ffb35e' : '#eef2f8';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6;
    ctx.fillText(text, 128, 34);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
    sp.scale.set(big ? 5.2 : 4, big ? 1.3 : 1, 1);
    sp.position.set(x, big ? 4.1 : 1.4, z);
    city.add(sp);
  }
  label('Milton Keynes', 0, 0, true);
  label('Wolverton', -half * 0.7, -half * 0.7);
  label('Stony Stratford', -half * 0.95, -half * 0.1);
  label('Newport Pagnell', half * 0.55, -half * 0.8);
  label('Willen', half * 0.85, -half * 0.2);
  label('Bletchley', 0, half * 0.85);
  label('Woburn Sands', half * 0.85, half * 0.6);
  label('Furzton', -half * 0.6, half * 0.55);

  city.rotation.x = -0.62; // lay the map back at an angle

  // Scroll-driven + idle spin
  var reduce = REDUCE, baseRot = -0.5, t0 = performance.now(), visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(el);
  }
  function scrollProg() {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }
  function resize() {
    W = el.clientWidth; H = el.clientHeight || 380;
    camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
  }
  window.addEventListener('resize', resize);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    var idle = reduce ? 0 : (now - t0) / 1000 * 0.12;
    city.rotation.y = baseRot + idle + (reduce ? 0 : scrollProg() * Math.PI * 1.1);
    var pulse = 0.9 + Math.sin(now / 360) * 0.12;
    ring.scale.set(pulse, pulse, pulse); glow.intensity = 1.1 + Math.sin(now / 360) * 0.4;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
