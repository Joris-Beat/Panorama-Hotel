/* Panorama Hotel Manager — Écrans d’installation et de connexion, menu et structure */
'use strict';

const artSVG=`<svg viewBox="0 0 560 240" aria-hidden="true"><circle cx="400" cy="120" r="58" fill="#d6a244" opacity=".9"/><path d="M0 190 L90 120 L170 170 L260 90 L350 175 L450 130 L560 190 V240 H0Z" fill="#0c2830" opacity=".85"/><path d="M0 215 L110 170 L220 205 L330 160 L440 205 L560 175 V240 H0Z" fill="#071417"/></svg>`;
function authArt(name){return `<div class="art${BR.photo?' photo':''}"${BR.photo?` style="${esc(photoStyle())}"`:''}><div class="brand">${logoHTML()}<div><b>${esc(name)}</b><small>Gestion hôtelière</small></div></div><div><h2>Toute votre exploitation, d’un seul regard.</h2><p>Réservations, chambres, caisse, équipe et stocks réunis dans un seul outil.</p>${artSVG}</div><small style="color:#8fb0b8">© ${new Date().getFullYear()} Panorama Hotel Manager</small></div>`}
function setupView(){
  return `<div class="auth">${authArt('Panorama Hotel Manager')}<div class="authf"><form data-form="setup" novalidate><div><h1>Bienvenue</h1><p class="sub" style="color:var(--muted);margin:6px 0 0">Première utilisation : configurez votre établissement et créez le compte administrateur.</p></div>
  <div class="gf" style="grid-template-columns:1fr">${[{k:'hotel',label:'Nom de l’hôtel',req:1,def:'Panorama Hotel'},{k:'currency',label:'Devise',req:1,def:'USD',hint:'Ex. USD, CDF, EUR, XAF'},{k:'name',label:'Votre nom complet',req:1},{k:'username',label:'Identifiant',req:1,ac:'username',hint:'Un nom court, ou votre e-mail (permet la réinitialisation du mot de passe).'},{k:'pw',label:'Mot de passe (6 caractères min.)',type:'password',req:1,ac:'new-password'},{k:'pw2',label:'Confirmer le mot de passe',type:'password',req:1,ac:'new-password'},{k:'demo',label:'Charger des données de démonstration',type:'checkbox'}].map(f=>fld(f)).join('')}</div>
  <div class="ferr" role="alert"></div><button class="btn primary">Créer et commencer</button></form></div></div>`;
}
function loginView(){
  const n=S().hotel;
  return `<div class="auth">${authArt(n)}<div class="authf"><form data-form="login" novalidate><div><h1>Bienvenue</h1><p style="color:var(--muted);margin:6px 0 0">Connectez-vous pour accéder à ${esc(n)}.</p></div>
  ${fld({k:'username',label:'Identifiant',req:1,ac:'username'})}${fld({k:'pw',label:'Mot de passe',type:'password',req:1,ac:'current-password'})}
  <label class="chk"><input type="checkbox" id="f_remember" name="f_remember"><span>Se souvenir de moi</span></label>
  <div class="ferr" role="alert"></div><button class="btn primary">Se connecter</button>
  ${S().onlineEnabled?'<button type="button" class="btn" data-act="portalOpen">Réserver une chambre (espace client)</button>':''}
  ${DB.mode==='firebase'?'<button type="button" class="btn ghost" data-act="forgot">Mot de passe oublié ?</button>':'<small style="color:var(--muted)">Mot de passe oublié ? Demandez à un administrateur de le réinitialiser dans « Utilisateurs & rôles ».</small>'}
  ${DB.mode==='local'?'<small style="color:var(--warn)">Mode local : les données restent sur cet appareil.</small>':''}
  ${DB.fbErr?'<small style="color:var(--bad)">Base de données injoignable ou règles non publiées : voir le guide de mise en ligne.</small>':''}</form></div></div>`;
}
const shellView=()=>`<div class="shell" id="shell"><div class="navscrim" data-act="navClose"></div><aside class="side" id="side"></aside><div class="col"><header class="top" id="top"></header><div id="banner"></div><main class="main" id="page" tabindex="-1"></main></div></div>`;
function renderChrome(){
  const u=state.user;if(!u)return;
  const side=$('#side');if(!side)return;
  side.innerHTML=`<div class="brand">${logoHTML()}<div><b>${esc(S().hotel)}</b><small>Hotel Manager</small></div></div>`+
   NAVG.map(g=>{const items=g[1].filter(pageOK);if(!items.length)return '';
     return `<div class="nav-g">${g[0]}</div>`+items.map(k=>{const m=MODS.find(x=>x[0]===k);return `<button class="nav ${state.page===k?'on':''}" data-act="go" data-id="${k}">${I(m[2],18)}<span>${esc(k==='hr'?'Employés & paie':m[1])}</span></button>`}).join('')}).join('');
  const ini=u.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  $('#top').innerHTML=`<button class="ib burger" data-act="navToggle" aria-label="Menu">${I('menu',22)}</button><div class="tt">${esc(state.page==='hr'?'Ressources humaines':(TITLES[state.page]||''))}</div><button class="ib" data-act="theme" aria-label="Changer de thème" title="Thème clair / sombre">${I('moon')}</button><button class="chip" data-act="profile" title="Mon profil"><i>${esc(ini)}</i><span>${esc(u.name)}<small>${esc(roleName(u.roleId))}</small></span></button><button class="ib" data-act="logout" aria-label="Se déconnecter" title="Se déconnecter">${I('out')}</button>`;
}
const TITLES=Object.fromEntries(MODS.map(m=>[m[0],m[1]]));
function renderPage(){
  const el=$('#page');if(!el||state.view!=='app')return;
  const a=document.activeElement;const keep=a&&el.contains(a)&&a.id?{id:a.id,s:a.selectionStart,e:a.selectionEnd}:null;
  const sy=window.scrollY;
  if(!pageOK(state.page)){state.page=(MODS.find(m=>pageOK(m[0]))||['dashboard'])[0];renderChrome()}
  try{el.innerHTML=PAGES[state.page]()}catch(err){console.error(err);el.innerHTML=`<div class="empty">Erreur d’affichage : ${esc(err.message)}</div>`}
  const b=$('#banner');
  if(b)b.innerHTML=(DB.needConfig==='sdk'?'<div class="banner">Impossible de charger Firebase : vérifiez la connexion Internet puis rechargez la page.</div>':DB.needConfig?'<div class="banner">Version non configurée : ajoutez votre configuration Firebase dans index.html (voir le guide). En attendant, les données restent sur cet appareil.</div>':DB.mode==='local'?'<div class="banner">Mode local : les données restent sur cet appareil. Ouvrez l’application via Claude pour partager les données entre postes.</div>':(!state.canWrite?'<div class="banner">Accès en lecture seule : demandez le niveau Contributeur pour modifier les données.</div>':''));
  if(keep){const n=document.getElementById(keep.id);if(n){n.focus();try{n.setSelectionRange(keep.s,keep.e)}catch(e){}}}
  window.scrollTo(0,sy);
}
let rt=null;
function scheduleRender(){clearTimeout(rt);rt=setTimeout(()=>{if(state.ready)render()},50)}
function render(force){
  let view=!state.ready?'boot':state.portalOn?'portal':needSetup()?'setup':!state.user?'login':'app';
  if(view==='app'){const u=byId('users',state.user.id);if(!u||u.active===false||(DB.mode!=='firebase'&&!u.active)){state.user=null;view='login';if(DB.mode==='firebase')leaveStaff()}else state.user=u}
  if(view!==state.view||force){
    state.view=view;const app=$('#app');
    app.innerHTML=view==='boot'?'<div class="boot">Chargement…</div>':view==='setup'?setupView():view==='login'?loginView():view==='portal'?portalView():shellView();
    if(view==='app')renderChrome();
  }
  if(view==='app')renderPage();
}
function go(p){state.page=p;state.navOpen=false;const s=$('#shell');if(s)s.classList.remove('open');renderChrome();renderPage();window.scrollTo(0,0)}
ACT.go=t=>go(t.dataset.id);
ACT.navToggle=()=>{const s=$('#shell');if(s)s.classList.toggle('open')};
ACT.navClose=()=>{const s=$('#shell');if(s)s.classList.remove('open')};
ACT.tab=t=>{state.tabs[t.dataset.page]=t.dataset.tab;renderPage()};
ACT.theme=()=>{
  const cur=document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  const nx=cur==='dark'?'light':'dark';document.documentElement.dataset.theme=nx;lsSet('ph_theme',nx);
};
function startSession(u,remember){
  state.user=u;state.failN=0;
  if(remember){lsSet('ph_sess',u.id);ssDel('ph_sess')}else{ssSet('ph_sess',u.id);lsDel('ph_sess')}
  put('users',Object.assign({},u,{lastLogin:new Date().toISOString()}));
  state.page=(MODS.find(m=>pageOK(m[0]))||['dashboard'])[0];
  state.view='';render(true);logA('Connexion');
}
function startSessionFB(){
  put('users',Object.assign({},state.user,{lastLogin:new Date().toISOString()}));
  state.view='';render(true);logA('Connexion');
}
ACT.logout=async()=>{
  logA('Déconnexion');
  if(DB.mode==='firebase'){await leaveStaff()}
  state.user=null;lsDel('ph_sess');ssDel('ph_sess');closeModal();state.view='';render(true);
};
ACT.forgot=()=>{
  formModal({title:'Mot de passe oublié',submit:'Envoyer le lien',fields:[{k:'email',label:'Adresse e-mail du compte',type:'email',req:1}],
   extra:'<div class="sum">Fonctionne si votre identifiant est une vraie adresse e-mail. Sinon, demandez à un administrateur de créer un nouveau compte pour vous.</div>',
   onSubmit:async v=>{try{await DB.auth.sendPasswordResetEmail(v.email.toLowerCase())}catch(e){return authMsg(e)}toast('Si ce compte existe, un e-mail vient d’être envoyé.')}});
};
ACT.profile=()=>{
  const u=state.user;
  formModal({title:'Mon profil — '+u.name,fields:[{k:'cur',label:'Mot de passe actuel',type:'password',ac:'current-password'},{k:'pw',label:'Nouveau mot de passe (6 caractères min.)',type:'password',ac:'new-password'},{k:'pw2',label:'Confirmer le nouveau mot de passe',type:'password',ac:'new-password'}],
   extra:`<div class="sum">Identifiant : ${esc(u.username)} · Rôle : ${esc(roleName(u.roleId))}</div>`,submit:'Changer le mot de passe',
   onSubmit:async v=>{
     if(!v.pw)return 'Saisissez un nouveau mot de passe.';if(v.pw.length<6)return '6 caractères minimum.';if(v.pw!==v.pw2)return 'Les mots de passe ne correspondent pas.';
     if(DB.mode==='firebase'){
       try{const cu=DB.auth.currentUser;await cu.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(cu.email,v.cur));await cu.updatePassword(v.pw)}catch(e){return authMsg(e)}
       logA('Mot de passe modifié');toast('Mot de passe modifié');return;
     }
     if(await hashPw(v.cur,u.salt)!==u.hash)return 'Mot de passe actuel incorrect.';
     const salt=uid();put('users',Object.assign({},u,{salt,hash:await hashPw(v.pw,salt)}));logA('Mot de passe modifié');toast('Mot de passe modifié');
   }});
};
