/* Smile Constructions : pages (routage par #), en-tête qui devient une pilule vitrée,
   menu téléphone, curseurs avant/après, défilement doux, formulaire de maquette. */
(function(){
  var reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vues=[].slice.call(document.querySelectorAll('[data-vue]'));
  var noms=vues.map(function(v){return v.dataset.vue});
  var top=document.querySelector('.top');
  var lenis=null;

  // ——— défilement doux ———
  if(window.Lenis&&!reduit){
    try{
      lenis=new Lenis({duration:1.1,smoothWheel:true,wheelMultiplier:1,touchMultiplier:1.2});
      (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
      lenis.on('scroll',etat);
    }catch(e){lenis=null}
  }
  function enHaut(){if(lenis){lenis.scrollTo(0,{immediate:true})}else{try{window.scrollTo({top:0,behavior:'instant'})}catch(e){window.scrollTo(0,0)}}}

  // ——— pages ———
  var courante=null;
  function afficher(){
    var h=(location.hash||'').replace('#','');
    if(noms.indexOf(h)<0)h=noms[0];
    if(h===courante)return;
    courante=h;
    vues.forEach(function(v){
      var on=v.dataset.vue===h;
      v.hidden=!on;
      if(on&&!reduit){v.classList.remove('entre');void v.offsetWidth;v.classList.add('entre')}
    });
    document.querySelectorAll('[data-lien]').forEach(function(a){
      if(a.getAttribute('href')==='#'+h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    document.body.dataset.page=h;
    fermerMenu();
    enHaut();
    etat();
    window.dispatchEvent(new Event('resize'));
    var titre=document.querySelector('[data-vue="'+h+'"] h1');
    if(titre){titre.setAttribute('tabindex','-1');try{titre.focus({preventScroll:true})}catch(e){}}
  }
  window.addEventListener('hashchange',afficher);

  // ——— en-tête : transparent sur le premier écran, puis pilule vitrée ———
  function etat(){
    var y=lenis?lenis.scroll:window.scrollY;
    if(top)top.classList.toggle('pilule',y>40);
  }
  window.addEventListener('scroll',etat,{passive:true});

  // ——— menu téléphone ———
  var burger=document.querySelector('.burger'),menu=document.querySelector('.menu-mobile');
  function fermerMenu(){if(!burger)return;burger.setAttribute('aria-expanded','false');document.body.classList.remove('menu-ouvert');if(lenis)lenis.start()}
  if(burger)burger.addEventListener('click',function(){
    var o=burger.getAttribute('aria-expanded')!=='true';
    burger.setAttribute('aria-expanded',o);document.body.classList.toggle('menu-ouvert',o);
    if(lenis){o?lenis.stop():lenis.start()}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')fermerMenu()});

  // ——— curseurs avant / après ———
  function curseur(el){
    var r=el.querySelector('input[type=range]');if(!r)return;
    function poser(v){v=Math.max(0,Math.min(100,v));el.style.setProperty('--p',v+'%');r.value=v}
    function depuis(x){var b=el.getBoundingClientRect();poser((x-b.left)/b.width*100)}
    // on ne fait glisser qu'en attrapant le bouton (le reste de l'image laisse défiler la page)
    var bouton=el.querySelector('.poignee,.prise,.rond');
    var tire=false,ecart=0;
    if(bouton){
      bouton.addEventListener('pointerdown',function(e){
        e.preventDefault();tire=true;el.classList.add('actif');
        var b=bouton.getBoundingClientRect();ecart=e.clientX-(b.left+b.width/2);
        try{bouton.setPointerCapture(e.pointerId)}catch(_){ }
      });
      bouton.addEventListener('pointermove',function(e){if(tire)depuis(e.clientX-ecart)});
      function lacher(){tire=false;el.classList.remove('actif')}
      bouton.addEventListener('pointerup',lacher);bouton.addEventListener('pointercancel',lacher);bouton.addEventListener('lostpointercapture',lacher);
    }
    r.addEventListener('input',function(){poser(+r.value)});
    el._poser=poser;poser(+r.value);
  }
  document.querySelectorAll('[data-aa]').forEach(curseur);

  // petit geste d'invitation sur le curseur du premier écran
  var h=document.querySelector('[data-aa][data-invite]');
  if(h&&h._poser&&!reduit){
    var base=+h.querySelector('input').value,t0=null;
    setTimeout(function(){requestAnimationFrame(function pas(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1700);
      h._poser(base+Math.sin(k*Math.PI*2)*20*(1-k));if(k<1)requestAnimationFrame(pas)})},1000);
  }

  // ——— apparitions au défilement (le contenu reste lisible sans) ———
  // (demande du fondateur, 24/11/2026) : aucune apparition au défilement, tout est déjà en place.

  // ——— formulaire de maquette ———
  var f=document.getElementById('form');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();document.getElementById('merci').hidden=false});

  afficher();
  window.SmileSite={curseur:curseur,lenis:lenis};
})();
