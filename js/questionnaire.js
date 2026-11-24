/* Questionnaire de projet en 5 étapes : le projet, les travaux, le délai, les coordonnées
   (prénom, nom, téléphone, e-mail, adresse du domicile), le récapitulatif.
   Conteneur : <div data-questionnaire></div>. Le brouillon reste dans le navigateur du visiteur.
   Maquette : rien n'est envoyé ; à la mise en ligne, l'envoi se branche sur la boîte mail de l'entreprise. */
(function () {
  var box = document.querySelector('[data-questionnaire]');
  if (!box) return;
  var CLE = 'smile:questionnaire';
  var PROJETS = ['Maison neuve', 'Agrandissement', 'Rénovation intérieure', 'Rénovation complète', 'Autres travaux'];
  var TRAVAUX = ['Démolition', 'Terrassement', 'Fondations', 'Maçonnerie', 'Charpente', 'Couverture', 'Menuiseries', 'Plomberie', 'Électricité', 'Chauffage', 'Isolation', 'Plâtrerie', 'Carrelage', 'Sols', 'Peinture', 'Façades', 'Je ne sais pas encore'];
  var DELAIS = ['Dès que possible', 'Dans les 3 mois', 'Dans les 6 mois', 'Plus tard, je me renseigne'];
  var DEPS = ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'];
  var ETAPES = ['Votre projet', 'Les travaux', 'Le délai', 'Vos coordonnées', 'Récapitulatif'];
  var d = { projet: '', travaux: [], detail: '', delai: '', prenom: '', nom: '', tel: '', email: '', rue: '', cp: '', ville: '', autre: false, chantier: '' };
  try { var s = JSON.parse(localStorage.getItem(CLE) || 'null'); if (s) Object.assign(d, s.d); } catch (e) {}
  var etape = 0, envoye = false;
  function garder() { try { localStorage.setItem(CLE, JSON.stringify({ d: d })); } catch (e) {} }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function choix(nom, liste, multiple) {
    return '<div class="q-choix' + (multiple ? ' q-multi' : '') + '">' + liste.map(function (v, i) {
      var on = multiple ? d[nom].indexOf(v) >= 0 : d[nom] === v;
      return '<label class="q-carte' + (on ? ' on' : '') + '"><input type="' + (multiple ? 'checkbox' : 'radio') + '" name="q-' + nom + '" value="' + esc(v) + '"' + (on ? ' checked' : '') + '><span>' + esc(v) + '</span></label>';
    }).join('') + '</div>';
  }
  function champ(id, label, type, ac, requis, extra) {
    return '<div class="q-champ' + (extra || '') + '"><label for="q-' + id + '">' + label + (requis ? ' <i>*</i>' : ' <small>(facultatif)</small>') + '</label><input id="q-' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '" value="' + esc(d[id]) + '"' + (requis ? ' required' : '') + '></div>';
  }
  function corps() {
    if (envoye) {
      return '<div class="q-merci"><div class="q-gros">Merci ' + esc(d.prenom) + '&nbsp;!</div><p>Votre demande est bien prise en compte. Nous vous rappelons au ' + esc(d.tel) + ' pour fixer une visite.</p><p class="q-note">Maquette&nbsp;: à la mise en ligne, cette demande sera envoyée directement à Smile Constructions.</p><button type="button" class="q-btn q-sec" data-a="nouveau">Faire une autre demande</button></div>';
    }
    if (etape === 0) return '<fieldset><legend class="q-titre">Quel est votre projet&nbsp;?</legend>' + choix('projet', PROJETS) + '</fieldset>';
    if (etape === 1) return '<fieldset><legend class="q-titre">Quels travaux&nbsp;?</legend><p class="q-aide">Plusieurs choix possibles.</p>' + choix('travaux', TRAVAUX, true) + '</fieldset><div class="q-champ"><label for="q-detail">Décrivez votre projet <small>(facultatif)</small></label><textarea id="q-detail" name="detail" rows="3" placeholder="Surface, nombre de pièces, ce que vous avez en tête…">' + esc(d.detail) + '</textarea></div>';
    if (etape === 2) return '<fieldset><legend class="q-titre">Pour quand&nbsp;?</legend>' + choix('delai', DELAIS) + '</fieldset>';
    if (etape === 3) return '<fieldset><legend class="q-titre">Vos coordonnées</legend><div class="q-grille">'
      + champ('prenom', 'Prénom', 'text', 'given-name', 1) + champ('nom', 'Nom', 'text', 'family-name', 1)
      + champ('tel', 'Téléphone', 'tel', 'tel', 1) + champ('email', 'E-mail', 'email', 'email', 0)
      + champ('rue', 'Adresse du domicile', 'text', 'street-address', 1, ' q-large')
      + champ('cp', 'Code postal', 'text', 'postal-code', 1) + champ('ville', 'Commune', 'text', 'address-level2', 1)
      + '</div><p class="q-hors" hidden>Ce code postal n\'est pas en Occitanie&nbsp;: envoyez quand même, on en parle au téléphone.</p>'
      + '<label class="q-case"><input type="checkbox" name="autre"' + (d.autre ? ' checked' : '') + '><span>Le chantier est à une autre adresse</span></label>'
      + '<div class="q-champ q-chantier"' + (d.autre ? '' : ' hidden') + '><label for="q-chantier">Adresse du chantier</label><input id="q-chantier" name="chantier" type="text" value="' + esc(d.chantier) + '"></div>'
      + '<p class="q-note">Vos informations servent uniquement à vous recontacter au sujet de votre projet.</p></fieldset>';
    var lignes = [['Projet', d.projet, 0], ['Travaux', d.travaux.join(', ') + (d.detail ? ' — ' + d.detail : ''), 1], ['Délai', d.delai, 2],
      ['Nom', d.prenom + ' ' + d.nom, 3], ['Téléphone', d.tel + (d.email ? ' · ' + d.email : ''), 3], ['Domicile', d.rue + ', ' + d.cp + ' ' + d.ville, 3]];
    if (d.autre && d.chantier) lignes.push(['Chantier', d.chantier, 3]);
    return '<div class="q-titre" tabindex="-1">Tout est bon&nbsp;?</div><dl class="q-recap">' + lignes.map(function (l) {
      return '<div><dt>' + l[0] + '</dt><dd>' + esc(l[1] || '—') + '</dd><button type="button" class="q-modif" data-aller="' + l[2] + '">Modifier</button></div>';
    }).join('') + '</dl>';
  }
  function rendre(focus) {
    var p = envoye ? 100 : (etape / (ETAPES.length - 1)) * 100;
    box.innerHTML = '<form class="q-form" novalidate>'
      + (envoye ? '' : '<div class="q-haut"><span class="q-num">Étape ' + (etape + 1) + ' sur ' + ETAPES.length + '</span><span class="q-nometape">' + ETAPES[etape] + '</span></div><div class="q-barre" role="progressbar" aria-valuemin="1" aria-valuemax="' + ETAPES.length + '" aria-valuenow="' + (etape + 1) + '"><i style="width:' + Math.max(6, p) + '%"></i></div>')
      + '<div class="q-corps">' + corps() + '</div>'
      + '<p class="q-erreur" role="alert" hidden></p>'
      + (envoye ? '' : '<div class="q-nav">' + (etape > 0 ? '<button type="button" class="q-btn q-sec" data-a="retour">Retour</button>' : '<span></span>')
        + (etape < 4 ? '<button type="submit" class="q-btn">Continuer</button>' : '<button type="submit" class="q-btn">Envoyer ma demande</button>') + '</div>')
      + '</form>';
    var form = box.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); suivant(); });
    form.addEventListener('change', lire);
    form.addEventListener('input', lire);
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a],[data-aller]'); if (!b) return;
      if (b.dataset.aller) { etape = +b.dataset.aller; rendre(true); return; }
      if (b.dataset.a === 'retour') { etape = Math.max(0, etape - 1); rendre(true); }
      if (b.dataset.a === 'nouveau') { envoye = false; etape = 0; d.projet = ''; d.travaux = []; d.detail = ''; d.delai = ''; garder(); rendre(true); }
    });
    // un projet ou un délai choisi : on avance tout seul
    form.querySelectorAll('input[type=radio]').forEach(function (r) { r.addEventListener('change', function () { setTimeout(suivant, 220); }); });
    verifierCp();
    if (focus) { var t = box.querySelector('.q-titre, legend, .q-gros'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } var r = box.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * 0.6) window.scrollTo({ top: scrollY + r.top - 100, behavior: 'smooth' }); }
  }
  function lire(e) {
    var el = e.target;
    if (el.name === 'q-projet') d.projet = el.value;
    else if (el.name === 'q-delai') d.delai = el.value;
    else if (el.name === 'q-travaux') {
      d.travaux = [].slice.call(box.querySelectorAll('input[name=q-travaux]:checked')).map(function (c) { return c.value; });
    } else if (el.name === 'autre') { d.autre = el.checked; box.querySelector('.q-chantier').hidden = !el.checked; }
    else if (el.name && d.hasOwnProperty(el.name)) d[el.name] = el.value;
    if (el.closest('.q-carte')) {
      box.querySelectorAll('.q-carte').forEach(function (c) { c.classList.toggle('on', c.querySelector('input').checked); });
    }
    if (el.name === 'cp') verifierCp();
    garder();
  }
  function verifierCp() {
    var h = box.querySelector('.q-hors'); if (!h) return;
    var cp = (d.cp || '').replace(/\s/g, '');
    h.hidden = !(cp.length === 5 && DEPS.indexOf(cp.slice(0, 2)) < 0);
  }
  function erreur(t) { var e = box.querySelector('.q-erreur'); e.textContent = t; e.hidden = false; }
  function suivant() {
    if (etape === 0 && !d.projet) return erreur('Choisissez votre type de projet.');
    if (etape === 1 && !d.travaux.length && !d.detail.trim()) return erreur('Choisissez au moins un type de travaux, ou décrivez votre projet.');
    if (etape === 2 && !d.delai) return erreur('Indiquez quand vous souhaitez démarrer.');
    if (etape === 3) {
      var manque = [['prenom', 'votre prénom'], ['nom', 'votre nom'], ['tel', 'votre téléphone'], ['rue', 'l\'adresse de votre domicile'], ['cp', 'votre code postal'], ['ville', 'votre commune']].filter(function (c) { return !String(d[c[0]]).trim(); });
      if (manque.length) { var c0 = box.querySelector('#q-' + manque[0][0]); if (c0) c0.focus(); return erreur('Il manque ' + manque.map(function (m) { return m[1]; }).join(', ') + '.'); }
      if (d.tel.replace(/[\s.\-]/g, '').replace(/^\+33/, '0').length !== 10) { box.querySelector('#q-tel').focus(); return erreur('Le numéro de téléphone doit avoir 10 chiffres, par exemple 06 12 34 56 78.'); }
      if (!/^\d{5}$/.test(d.cp.replace(/\s/g, ''))) { box.querySelector('#q-cp').focus(); return erreur('Le code postal doit avoir 5 chiffres.'); }
      if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) { box.querySelector('#q-email').focus(); return erreur('L\'adresse e-mail ne semble pas complète.'); }
    }
    if (etape === 4) { envoye = true; rendre(true); return; }
    etape++; rendre(true);
  }
  // la carte envoie une commune : on la reporte dans le questionnaire
  window.addEventListener('smile-ville', function (e) { d.ville = e.detail; garder(); if (etape === 3) rendre(false); });
  rendre(false);
})();
