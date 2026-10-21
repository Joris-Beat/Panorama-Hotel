/* Panorama Hotel Manager — Traitement des formulaires d’installation et de connexion */
'use strict';

FORMS.setup=async form=>{
  const er=$('.ferr',form),fields=[{k:'hotel',req:1,label:'Nom de l’hôtel'},{k:'currency',req:1,label:'Devise'},{k:'name',req:1,label:'Nom'},{k:'username',req:1,label:'Identifiant'},{k:'pw',req:1,label:'Mot de passe'},{k:'pw2',req:1,label:'Confirmation'},{k:'demo',type:'checkbox'}];
  const r=collect(form,fields);if(r.errs.length){er.textContent='Champs obligatoires : '+r.errs.join(', ');return}
  const v=r.out;if(v.pw.length<6){er.textContent='Mot de passe : 6 caractères minimum.';return}if(v.pw!==v.pw2){er.textContent='Les mots de passe ne correspondent pas.';return}
  const btn=form.querySelector('button.primary');btn.disabled=true;
  if(DB.mode==='firebase'){
    let cred;try{cred=await DB.auth.createUserWithEmailAndPassword(toEmail(v.username),v.pw)}catch(e){er.textContent=authMsg(e);btn.disabled=false;return}
    const uid2=cred.user.uid,un=v.username.trim().toLowerCase().replace(/\s+/g,'');
    const b=DB.fb.batch();
    b.set(DB.fb.collection('users').doc(uid2),{username:un,name:v.name,roleId:'admin',active:true,created:new Date().toISOString()});
    DEFROLES.forEach(x=>b.set(DB.fb.collection('roles').doc(x.id),clean(x)));
    b.set(DB.fb.collection('settings').doc('main'),Object.assign({},DEF_SET,{hotel:v.hotel,currency:v.currency,id:'main'}));
    b.set(DB.fb.collection('meta').doc('setup'),{at:new Date().toISOString(),by:uid2});
    try{await b.commit()}catch(e){er.textContent='Configuration refusée par la base : publiez d’abord les règles Firestore (voir le guide).';btn.disabled=false;try{await cred.user.delete()}catch(x){}return}
    DB.setupDone=true;
    if(!(await enterStaff(cred.user))){er.textContent='Compte créé mais accès refusé.';btn.disabled=false;return}
    if(v.demo)seedDemo();
    startSessionFB();return;
  }
  DEFROLES.forEach(x=>put('roles',Object.assign({},x)));
  saveSettings({hotel:v.hotel,currency:v.currency});
  const salt=uid(),u=put('users',{id:uid(),username:v.username.toLowerCase().replace(/\s+/g,''),name:v.name,roleId:'admin',active:true,salt,hash:await hashPw(v.pw,salt),created:new Date().toISOString()});
  if(v.demo)seedDemo();
  state.user=u;startSession(u,true);
};
FORMS.login=async form=>{
  const er=$('.ferr',form);
  if(Date.now()<state.lockUntil){er.textContent='Trop de tentatives. Patientez quelques secondes.';return}
  const un=(form.elements.f_username.value||'').trim().toLowerCase(),pw=form.elements.f_pw.value||'';
  if(DB.mode==='firebase'){
    const btn=form.querySelector('button.primary');btn.disabled=true;
    try{
      await DB.auth.setPersistence(form.elements.f_remember.checked?firebase.auth.Auth.Persistence.LOCAL:firebase.auth.Auth.Persistence.SESSION);
      const cred=await DB.auth.signInWithEmailAndPassword(toEmail(un),pw);
      if(!(await enterStaff(cred.user))){er.textContent='Ce compte n’a pas accès à l’application ou est désactivé.';btn.disabled=false;return}
      state.failN=0;startSessionFB();
    }catch(e){state.failN++;if(state.failN>=5){state.lockUntil=Date.now()+30000;state.failN=0}er.textContent=authMsg(e);btn.disabled=false}
    return;
  }
  const u=DB.cache.users.find(x=>x.username===un);
  if(!u||!u.active||await hashPw(pw,u.salt)!==u.hash){state.failN++;if(state.failN>=5){state.lockUntil=Date.now()+30000;state.failN=0}er.textContent=u&&!u.active?'Ce compte est désactivé.':'Identifiant ou mot de passe incorrect.';return}
  startSession(u,form.elements.f_remember.checked);
};
