/* Maquette 3D Smile Constructions : une maison en L qui se construit étape par étape.
   Besoin de THREE (r147) et THREE.OrbitControls chargés avant ce fichier.
   Conteneur : <div data-maison3d data-fond="#..."> avec, dans la page, des boutons [data-etape="0..4"]. */
(function(){
  var box=document.querySelector('[data-maison3d]');
  if(!box||!window.THREE)return;
  var T=THREE, reduit=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fond=box.dataset.fond||'#EEEEEC';
  if(T.ColorManagement)T.ColorManagement.legacyMode=false;

  var r=new T.WebGLRenderer({antialias:true,alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio,2));
  r.outputEncoding=T.sRGBEncoding; r.toneMapping=T.ACESFilmicToneMapping; r.toneMappingExposure=0.9;
  r.shadowMap.enabled=true; r.shadowMap.type=T.PCFSoftShadowMap;
  box.appendChild(r.domElement);

  var sc=new T.Scene();
  var cam=new T.PerspectiveCamera(32,1,0.5,300);
  cam.position.set(21,13,25);
  var ctl=new T.OrbitControls(cam,r.domElement);
  ctl.target.set(0,1.6,3); ctl.enableDamping=true; ctl.dampingFactor=.08; ctl.enablePan=false;
  ctl.minDistance=16; ctl.maxDistance=60; ctl.maxPolarAngle=Math.PI*0.47; ctl.minPolarAngle=Math.PI*0.12;
  ctl.autoRotate=!reduit; ctl.autoRotateSpeed=0.7;
  ctl.addEventListener('start',function(){ctl.autoRotate=false});

  sc.add(new T.HemisphereLight(0xdfeeff,0x8a7350,0.9));
  var sol=new T.DirectionalLight(0xfff1d6,2.1); sol.position.set(-18,26,14); sol.castShadow=true;
  sol.shadow.mapSize.set(2048,2048); var s=sol.shadow.camera; s.left=-22;s.right=22;s.top=22;s.bottom=-22; sol.shadow.bias=-0.0004;
  sc.add(sol);

  function M(c,o){o=o||{};return new T.MeshStandardMaterial({color:c,roughness:o.r!=null?o.r:0.85,metalness:o.m||0,transparent:!!o.t,opacity:o.t||1})}
  var mat={
    terre:M(0xB4875A), herbe:M(0x7E9B4E), beton:M(0xA9A8A2,{r:.95}), fer:M(0x6b4a33,{r:.6,m:.4}),
    brique:M(0xC0623F), enduit:M(0xF3EFE7,{r:.92}), tuile:M(0xC8643B,{r:.8}), bois:M(0xD9B98A),
    alu:M(0x2E3033,{r:.45,m:.5}), vitre:M(0x9FB7C4,{r:.08,m:.3,t:.55}), trou:M(0x3B2A20),
    dalle:M(0xE3DCCB), tronc:M(0x6E5A45), olivier:M(0x7C8B63), jaune:M(0xF2C233,{r:.6})
  };
  function boite(w,h,d,m,x,y,z,g){var b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=true;b.receiveShadow=true;(g||sc).add(b);return b}

  // Plan en L : aile A (12 x 8) et aile B (6 x 7) en retour vers le jardin
  var A={x:-1,z:0,w:12,d:8}, B={x:2,z:7.5,w:6,d:7}, H=2.8;

  var terrain=new T.Mesh(new T.CircleGeometry(30,64),mat.terre); terrain.rotation.x=-Math.PI/2; terrain.receiveShadow=true; sc.add(terrain);

  // groupes par étape
  var G=[0,1,2,3,4].map(function(){var g=new T.Group();sc.add(g);return g});

  // 0 — fondations : semelles et dalle, fers d'attente
  [A,B].forEach(function(p){
    boite(p.w+.4,.35,p.d+.4,mat.beton,p.x,.175,p.z,G[0]);
    for(var i=0;i<=Math.round(p.w/2);i++){[-1,1].forEach(function(sz){var f=boite(.06,.9,.06,mat.fer,p.x-p.w/2+i*(p.w/Math.round(p.w/2)),.8,p.z+sz*p.d/2,G[0]);f.userData.fer=1})}
  });

  // 1 — murs : briques, ouvertures sombres
  var murs=[];
  var ep=.3,yM=.35+H/2;
  [A,B].forEach(function(p){
    murs.push(boite(p.w,H,ep,mat.brique,p.x,yM,p.z-p.d/2+ep/2,G[1]));
    murs.push(boite(p.w,H,ep,mat.brique,p.x,yM,p.z+p.d/2-ep/2,G[1]));
    murs.push(boite(ep,H,p.d-2*ep,mat.brique,p.x-p.w/2+ep/2,yM,p.z,G[1]));
    murs.push(boite(ep,H,p.d-2*ep,mat.brique,p.x+p.w/2-ep/2,yM,p.z,G[1]));
  });
  // cloisons intérieures, visibles tant que le toit n'est pas posé
  boite(.15,H,A.d-2*ep,mat.brique,A.x-1.5,yM,A.z,G[1]); boite(4,H,.15,mat.brique,A.x+3.5,yM,A.z-.8,G[1]);
  var ouvertures=[ // [x, z, largeur, hauteur, axe] axe 'z' = façade côté +z
    [-5,A.z+A.d/2,3.2,2.2,'z'],[-2.2,A.z+A.d/2,1.2,1.3,'z'],
    [B.x-1.2,B.z+B.d/2,3.6,2.2,'z'],[B.x+B.w/2,B.z,1.2,1.3,'x'],[B.x+B.w/2,B.z+2.2,1.2,1.3,'x'],
    [A.x-A.w/2,A.z,1.2,1.3,'-x'],[3.4,A.z-A.d/2,1.2,1.3,'-z'],[-4,A.z-A.d/2,1.2,1.3,'-z']
  ];
  var trous=[],menus=[];
  ouvertures.forEach(function(o){
    var y=.35+(o[3]>2?o[3]/2+.05:1.55), e=.06, w=o[2], h=o[3];
    var horiz=(o[4]==='z'||o[4]==='-z');
    var sx=horiz?w:e, sz=horiz?e:w;
    var px=o[0]+(o[4]==='x'?e/2:o[4]==='-x'?-e/2:0), pz=o[1]+(o[4]==='z'?e/2:o[4]==='-z'?-e/2:0);
    trous.push(boite(sx,h,sz,mat.trou,px,y,pz,G[1]));
    // 3 — menuiseries : cadre alu + vitre
    var cadre=boite(horiz?w+.12:e*2,h+.12,horiz?e*2:w+.12,mat.alu,px,y,pz,G[3]);
    var v=boite(horiz?w-.16:e*3,h-.16,horiz?e*3:w-.16,mat.vitre,px,y,pz,G[3]); v.castShadow=false;
    if(w>2){boite(horiz?.06:e*3.2,h-.16,horiz?e*3.2:.06,mat.alu,px,y,pz,G[3])}
    menus.push(cadre);
  });

  // 2 — charpente et tuiles : deux toits à deux pentes
  function toit(p,axe){
    var g=new T.Group(), span=axe==='x'?p.d:p.w, long=(axe==='x'?p.w:p.d)+.8, haut=span*0.3, deb=.5;
    var sh=new T.Shape(); sh.moveTo(-span/2-deb,0); sh.lineTo(0,haut+deb*0.3); sh.lineTo(span/2+deb,0); sh.lineTo(span/2+deb,.18); sh.lineTo(0,haut+deb*0.3+.18); sh.lineTo(-span/2-deb,.18); sh.closePath();
    var geo=new T.ExtrudeGeometry(sh,{depth:long,bevelEnabled:false}); geo.translate(0,0,-long/2);
    var m=new T.Mesh(geo,mat.tuile); m.castShadow=true; m.receiveShadow=true; g.add(m);
    var pignon=new T.Shape(); pignon.moveTo(-span/2,0); pignon.lineTo(0,haut); pignon.lineTo(span/2,0); pignon.closePath();
    var pg=new T.ExtrudeGeometry(pignon,{depth:long-1.2,bevelEnabled:false}); pg.translate(0,0,-(long-1.2)/2);
    var pm=new T.Mesh(pg,mat.brique); pm.castShadow=true; g.add(pm); g.userData.pignon=pm;
    if(axe==='x')g.rotation.y=Math.PI/2;
    g.position.set(p.x,.35+H,p.z); G[2].add(g); return g;
  }
  var toits=[toit(A,'x'),toit(B,'z')];
  boite(.7,1.3,.7,mat.enduit,A.x+3.5,.35+H+2.1,A.z-1.4,G[2]); // cheminée

  // 4 — finitions et extérieurs : herbe, terrasse, olivier, allée
  var herbe=new T.Mesh(new T.CircleGeometry(29.6,64),mat.herbe); herbe.rotation.x=-Math.PI/2; herbe.position.y=.02; herbe.receiveShadow=true; G[4].add(herbe);
  boite(7,.12,4,mat.dalle,-4.3,.08,A.z+A.d/2+2.1,G[4]);
  boite(2.2,.06,14,M(0xCFC6B4),B.x+B.w/2+3,.05,B.z+2,G[4]);
  var tr=new T.Mesh(new T.CylinderGeometry(.22,.32,2.2,10),mat.tronc); tr.position.set(-10,1.1,9); tr.castShadow=true; G[4].add(tr);
  [[0,2.9,0,1.5],[.9,2.5,.4,1.1],[-.8,2.6,-.3,1.1],[.2,3.4,-.6,1]].forEach(function(f){var b=new T.Mesh(new T.IcosahedronGeometry(f[3],1),mat.olivier);b.position.set(-10+f[0],f[1],9+f[2]);b.castShadow=true;G[4].add(b)});
  for(var i=0;i<14;i++){var hh=boite(1.4,.8,.9,M(0x5F7A3C),-14+i*1.9,.4,14.5,G[4])}

  // ——— montée des étapes ———
  var etape=-1, anims=[];
  function montrer(g,on,delai){
    g.visible=true;
    g.traverse(function(o){if(o.isMesh&&o.userData.y0==null){o.userData.y0=o.position.y}});
    anims.push({g:g,on:on,t0:performance.now()+(delai||0),d:reduit?1:700});
  }
  function aller(n){
    n=Math.max(0,Math.min(4,n)); if(n===etape)return;
    for(var i=0;i<5;i++){var doit=i<=n, etait=i<=etape; if(doit!==etait)montrer(G[i],doit,doit?(i-Math.max(etape+1,0))*260:0)}
    // les murs et les pignons passent de la brique à l'enduit aux finitions
    var m=n>=4?mat.enduit:mat.brique; murs.forEach(function(w){w.material=m}); toits.forEach(function(t){t.userData.pignon.material=m});
    trous.forEach(function(t){t.visible=n<3});
    G[0].traverse(function(o){if(o.userData.fer)o.visible=n<1});
    terrain.material=mat.terre;
    etape=n;
    document.querySelectorAll('[data-etape]').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.etape===n)});
    var l=document.querySelector('[data-etape-titre]'); if(l){var t=document.querySelector('[data-etape="'+n+'"]');l.textContent=t?t.dataset.titre||t.textContent:''}
  }
  G.forEach(function(g){g.visible=false});
  document.querySelectorAll('[data-etape]').forEach(function(b){b.addEventListener('click',function(){aller(+b.dataset.etape)})});
  var auto=document.querySelector('[data-etape-auto]');
  var boucle=null;
  function lecture(){clearInterval(boucle);var k=-1;aller(0);k=0;boucle=setInterval(function(){k++;if(k>4){clearInterval(boucle);boucle=null;return}aller(k)},1500)}
  if(auto)auto.addEventListener('click',lecture);

  function ease(t){return 1-Math.pow(1-t,3)}
  function taille(){var w=box.clientWidth,h=box.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  new ResizeObserver(taille).observe(box); taille();

  var vu=false;
  new IntersectionObserver(function(e){if(e[0].isIntersecting&&!vu){vu=true;reduit?aller(4):lecture()}},{threshold:.35}).observe(box);
  aller(4); // état complet au repos (aperçu, capture)
  if(!reduit){G.forEach(function(g){g.visible=true})}

  (function boucleRendu(now){
    requestAnimationFrame(boucleRendu);
    now=now||performance.now();
    anims=anims.filter(function(a){
      var k=Math.max(0,Math.min(1,(now-a.t0)/a.d)), e=ease(k);
      var s=a.on?e:1-e;
      a.g.scale.set(1,Math.max(.001,s),1);
      a.g.position.y=a.on?(1-e)*1.5:0;
      if(!a.on&&k>=1)a.g.visible=false;
      return k<1;
    });
    ctl.update(); r.render(sc,cam);
  })();
})();
