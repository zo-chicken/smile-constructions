/* Carte de l'Occitanie : contour officiel des 13 départements (js/occitanie.js), Toulouse au centre,
   des arcs partent en boucle vers les villes de la région.
   Conteneur : <div data-carte></div>. Survol ou toucher d'une ville : son nom, son département, un lien vers le devis.
   Un clic sur « Demander un devis » envoie l'événement « smile-ville » (le questionnaire préremplit la commune). */
(function () {
  var O = window.OCCITANIE;
  if (!O) return;
  // [nom, longitude, latitude, département, préfecture, côté de l'étiquette (d, g, b, h), visible sur téléphone]
  var VILLES = [
    ['Toulouse', 1.444, 43.605, 'Haute-Garonne (31)', 1, 'b', 1],
    ['Montpellier', 3.877, 43.611, 'Hérault (34)', 1, 'd', 1], ['Nîmes', 4.36, 43.837, 'Gard (30)', 1, 'h', 1],
    ['Perpignan', 2.895, 42.699, 'Pyrénées-Orientales (66)', 1, 'd', 1], ['Albi', 2.148, 43.928, 'Tarn (81)', 1, 'd', 0],
    ['Montauban', 1.355, 44.018, 'Tarn-et-Garonne (82)', 1, 'g', 1], ['Carcassonne', 2.353, 43.213, 'Aude (11)', 1, 'd', 0],
    ['Tarbes', 0.078, 43.233, 'Hautes-Pyrénées (65)', 1, 'b', 1], ['Rodez', 2.575, 44.35, 'Aveyron (12)', 1, 'd', 1],
    ['Auch', 0.586, 43.646, 'Gers (32)', 1, 'g', 0], ['Cahors', 1.44, 44.448, 'Lot (46)', 1, 'd', 1],
    ['Foix', 1.605, 42.965, 'Ariège (09)', 1, 'd', 0], ['Mende', 3.5, 44.518, 'Lozère (48)', 1, 'd', 1],
    ['Narbonne', 3.003, 43.184, 'Aude (11)', 0, 'd', 0], ['Béziers', 3.215, 43.344, 'Hérault (34)', 0, 'd', 0],
    ['Castres', 2.24, 43.606, 'Tarn (81)', 0, 'd', 0], ['Alès', 4.08, 44.125, 'Gard (30)', 0, 'd', 0],
    ['Millau', 3.078, 44.098, 'Aveyron (12)', 0, 'd', 0], ['Figeac', 2.03, 44.61, 'Lot (46)', 0, 'd', 0],
    ['Lourdes', -0.046, 43.095, 'Hautes-Pyrénées (65)', 0, 'd', 0],
  ];
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = O.W, H = O.H, n = 0;
  function pt(lo, la) { return [(lo * O.K - O.X0) * O.S + O.PAD, (-la - O.Y0) * O.S + O.PAD]; }
  function f(v) { return v.toFixed(1); }

  document.querySelectorAll('[data-carte]').forEach(function (box) {
    var id = 'c' + (++n);
    var hub = pt(VILLES[0][1], VILLES[0][2]);
    var CYCLE = 5.4, PAS = 0.27;
    var fond = '', deps = '', arcs = '', mobiles = '', villes = '';
    O.deps.forEach(function (d) {
      fond += '<path d="' + d[2] + '"/>';
      deps += '<path class="c-dep" data-code="' + d[0] + '" d="' + d[2] + '"><title>' + d[1] + ' (' + d[0] + ')</title></path>';
    });
    VILLES.forEach(function (v, i) {
      var p = pt(v[1], v[2]);
      if (i > 0) {
        var dx = p[0] - hub[0], dy = p[1] - hub[1];
        var mx = (hub[0] + p[0]) / 2 - dy * 0.28, my = (hub[1] + p[1]) / 2 + dx * 0.28;
        if (my > (hub[1] + p[1]) / 2) { mx = (hub[0] + p[0]) / 2 + dy * 0.28; my = (hub[1] + p[1]) / 2 - dx * 0.28; } // toujours bombé vers le haut
        var debut = ((i - 1) * PAS) % CYCLE;
        arcs += '<path id="' + id + 'a' + i + '" class="c-arc" data-i="' + i + '" pathLength="100" d="M' + f(hub[0]) + ' ' + f(hub[1]) + 'Q' + f(mx) + ' ' + f(my) + ' ' + f(p[0]) + ' ' + f(p[1]) + '" style="animation-delay:' + debut.toFixed(2) + 's;animation-duration:' + CYCLE + 's"/>';
        mobiles += '<circle class="c-mobile" r="6" opacity="0"><animateMotion dur="' + CYCLE + 's" begin="' + debut.toFixed(2) + 's" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.42;1" calcMode="linear"><mpath href="#' + id + 'a' + i + '"/></animateMotion><animate attributeName="opacity" dur="' + CYCLE + 's" begin="' + debut.toFixed(2) + 's" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.42;0.46;1"/></circle>';
        mobiles += '<circle class="c-impact" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="8" opacity="0"><animate attributeName="r" dur="' + CYCLE + 's" begin="' + debut.toFixed(2) + 's" repeatCount="indefinite" values="8;8;30;30" keyTimes="0;0.42;0.6;1"/><animate attributeName="opacity" dur="' + CYCLE + 's" begin="' + debut.toFixed(2) + 's" repeatCount="indefinite" values="0;0.7;0;0" keyTimes="0;0.42;0.6;1"/></circle>';
      }
      var cote = v[5], tx = p[0], ty = p[1] + 7, anc = 'middle';
      if (cote === 'd') { tx = p[0] + 18; anc = 'start'; }
      if (cote === 'g') { tx = p[0] - 18; anc = 'end'; }
      if (cote === 'b') { ty = p[1] + (i === 0 ? 52 : 34); }
      if (cote === 'h') { ty = p[1] - 22; }
      villes += '<g class="c-ville' + (i === 0 ? ' c-hub' : '') + (v[4] ? ' c-pref' : '') + (v[6] ? ' c-mob' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="' + v[0] + ', ' + v[3] + '">'
        + (i === 0 ? '<circle class="c-onde" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="16">' + (reduit ? '' : '<animate attributeName="r" values="16;62" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;0" dur="2.2s" repeatCount="indefinite"/>') + '</circle>' : '')
        + '<circle class="c-zone" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="24"/>'
        + '<circle class="c-point" cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + (i === 0 ? 16 : v[4] ? 9 : 7) + '"/>'
        + '<g class="c-lab"><rect class="c-etiq" rx="10"/><text class="c-nom" x="' + f(tx) + '" y="' + f(ty) + '" text-anchor="' + anc + '">' + v[0] + '</text></g></g>';
    });
    box.innerHTML = '<svg class="c-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Carte de l\'Occitanie et de ses treize départements : depuis Toulouse, Smile Constructions intervient dans toute la région">'
      + '<g class="c-ombre">' + fond + '</g><g class="c-fond">' + fond + '</g><g class="c-deps">' + deps + '</g>'
      + '<g class="c-arcs">' + arcs + '</g><g class="c-mobiles">' + mobiles + '</g><g class="c-villes">' + villes + '</g></svg>'
      + '<div class="c-info" hidden><b class="c-info-nom"></b><span class="c-info-dep"></span><a class="c-info-lien" href="#contact">Demander un devis</a></div>';
    var svg = box.querySelector('svg'), info = box.querySelector('.c-info');
    if (reduit && svg.pauseAnimations) svg.pauseAnimations();

    // pastilles blanches sous les noms, mesurées une fois la carte visible
    var poses = false;
    function etiquettes() {
      if (poses || !box.offsetWidth) return;
      box.querySelectorAll('.c-lab').forEach(function (g) {
        var t = g.querySelector('text'), r = g.querySelector('rect'), b;
        try { b = t.getBBox(); } catch (e) { return; }
        if (!b.width) return;
        var px = 9, py = 4;
        r.setAttribute('x', f(b.x - px)); r.setAttribute('y', f(b.y - py)); r.setAttribute('width', f(b.width + px * 2)); r.setAttribute('height', f(b.height + py * 2));
        poses = true;
      });
    }
    function remesurer() { poses = false; etiquettes(); }
    if (window.ResizeObserver) new ResizeObserver(remesurer).observe(box);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remesurer);
    window.addEventListener('hashchange', function () { setTimeout(remesurer, 50); });

    var actif = null;
    function montrer(i) {
      box.querySelectorAll('.c-ville').forEach(function (g) { g.classList.toggle('actif', +g.dataset.i === i); });
      box.querySelectorAll('.c-arc').forEach(function (a) { a.classList.toggle('actif', +a.dataset.i === i); });
      box.classList.toggle('a-actif', i !== null);
      actif = i;
      if (i === null) { info.hidden = true; return; }
      var v = VILLES[i], p = pt(v[1], v[2]);
      info.querySelector('.c-info-nom').textContent = v[0];
      info.querySelector('.c-info-dep').textContent = i === 0 ? 'Notre point de départ, ' + v[3] : v[3];
      info.querySelector('.c-info-lien').dataset.ville = v[0];
      info.hidden = false;
      info.style.left = Math.min(74, Math.max(4, p[0] / W * 100)) + '%';
      info.style.top = (p[1] / H * 100) + '%';
      info.classList.toggle('dessous', p[1] / H < 0.3);
    }
    box.querySelectorAll('.c-ville').forEach(function (g) {
      var i = +g.dataset.i;
      g.addEventListener('mouseenter', function () { montrer(i); });
      g.addEventListener('focus', function () { montrer(i); });
      g.addEventListener('click', function (e) { e.stopPropagation(); montrer(actif === i && e.pointerType !== 'mouse' ? null : i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); montrer(i); info.querySelector('a').focus(); } });
    });
    box.addEventListener('mouseleave', function () { montrer(null); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) montrer(null); });
    info.querySelector('a').addEventListener('click', function () {
      var v = this.dataset.ville;
      setTimeout(function () { window.dispatchEvent(new CustomEvent('smile-ville', { detail: v })); }, 60);
    });
  });
})();
