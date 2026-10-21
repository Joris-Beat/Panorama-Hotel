/* Panorama Hotel Manager — Connexion Firebase, abonnements, nuitées et suivi public */
'use strict';

const FB_DOMAIN='@panorama-hotel.app';
const toEmail=u=>{u=String(u||'').trim().toLowerCase().replace(/\s+/g,'');return u.includes('@')?u:u+FB_DOMAIN};
const needSetup=()=>DB.mode==='firebase'?!DB.setupDone:DB.cache.users.length===0;
function authMsg(e){
  const c=(e&&e.code)||'';
  if(/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c))return 'Identifiant ou mot de passe incorrect.';
  if(c==='auth/email-already-in-use')return 'Cet identifiant existe déjà (compte supprimé ou désactivé ?). Choisissez un autre identifiant.';
  if(c==='auth/weak-password')return 'Mot de passe : 6 caractères minimum.';
  if(c==='auth/too-many-requests')return 'Trop de tentatives. Patientez quelques minutes.';
  if(c==='auth/network-request-failed')return 'Pas de connexion Internet.';
  if(c==='auth/operation-not-allowed')return 'Activez « E-mail / Mot de passe » dans Firebase > Authentication.';
  if(c==='auth/invalid-email')return 'Identifiant invalide (évitez les caractères spéciaux).';
  if(c==='auth/requires-recent-login')return 'Reconnectez-vous puis réessayez.';
  return (e&&e.message)||'Erreur de connexion.';
}
async function initFirebase(cfg){
  DB.cfg=cfg;firebase.initializeApp(cfg);DB.fb=firebase.firestore();DB.auth=firebase.auth();DB.db=DB.fb;DB.mode='firebase';
  try{const m=await DB.fb.collection('meta').doc('setup').get();DB.setupDone=m.exists}catch(e){DB.setupDone=true;DB.fbErr=e}
  try{
    const r=await Promise.all([DB.fb.collection('settings').get(),DB.fb.collection('rooms').get()]);
    DB.cache.settings=r[0].docs.map(d=>Object.assign({},d.data(),{id:d.id}));DB.cache.rooms=r[1].docs.map(d=>Object.assign({},d.data(),{id:d.id}));
  }catch(e){DB.fbErr=DB.fbErr||e}
  const user=await new Promise(res=>{const un=DB.auth.onAuthStateChanged(u=>{un();res(u)})});
  if(user){try{await enterStaff(user)}catch(e){console.warn(e)}}
}
async function subscribeAll(){
  if(DB.subs)return;DB.subs=[];let ready=false;
  const firsts=COLS.map(c=>new Promise(res=>{
    let first=true;const done=()=>{if(first){first=false;res()}};
    const un=DB.fb.collection(c).onSnapshot(snap=>{
      DB.cache[c]=snap.docs.map(d=>Object.assign({},d.data(),{id:d.id}));
      if(first)done();else if(ready)scheduleRender();
    },err=>{console.warn('Lecture refusée :',c,err&&err.code);done()});
    DB.subs.push(un);
  }));
  await Promise.race([Promise.all(firsts),sleep(9000)]);ready=true;
}
async function enterStaff(user){
  let doc;try{doc=await DB.fb.collection('users').doc(user.uid).get()}catch(e){throw new Error('Accès refusé par la base de données. Vérifiez les règles Firestore.')}
  if(!doc.exists||doc.data().active===false){try{await DB.auth.signOut()}catch(e){}return false}
  await subscribeAll();
  state.user=byId('users',user.uid)||Object.assign({},doc.data(),{id:user.uid});
  state.page=(MODS.find(m=>pageOK(m[0]))||['dashboard'])[0];return true;
}
async function leaveStaff(){
  try{await Promise.all(Object.values(DB.queues))}catch(e){}
  if(DB.subs){DB.subs.forEach(u=>{try{u()}catch(e){}});DB.subs=null}
  COLS.forEach(c=>{if(c!=='settings'&&c!=='rooms')DB.cache[c]=[]});
  try{await DB.auth.signOut()}catch(e){}
}
/* nuitées (anti double-réservation) et document de suivi public */
const nightIds=r=>{const a=[];if(!r.in||!r.out||!r.roomId)return a;let d=r.in,i=0;while(d<r.out&&i<400){a.push(r.roomId+'_'+d);d=addDays(d,1);i++}return a};
const trackId=(no,phone)=>sha('trk:'+String(no).toUpperCase()+':'+normPhone(phone));
function trackDoc(r){
  const c=byId('clients',r.clientId)||{},rm=byId('rooms',r.roomId)||{},f=folio(r),s=S();
  return {resId:r.id,no:r.no,name:c.name||'',phone:c.phone||'',hotel:s.hotel,hotelPhone:s.phone||'',checkin:s.checkin,checkout:s.checkout,roomType:rm.type||'',roomNo:rm.no||'',in:r.in,out:r.out,nights:f.n,adults:r.adults||1,children:r.children||0,total:f.total,paid:f.paid,pending:f.pending,status:r.status,plan:r.payPlan||'',method:r.payMethod||'',updated:new Date().toISOString()};
}
async function syncRes(r){
  const want=['Confirmée','En séjour'].includes(r.status)?nightIds(r):[],have=r.nk||[];
  const add=want.filter(x=>!have.includes(x)),rem=have.filter(x=>!want.includes(x));
  for(let i=0;i<Math.max(add.length,rem.length);i+=200){
    const b=DB.fb.batch(),ND=DB.fb.collection('nights');
    add.slice(i,i+200).forEach(id=>{const k=id.lastIndexOf('_');b.set(ND.doc(id),{roomId:id.slice(0,k),date:id.slice(k+1),resId:r.id})});
    rem.slice(i,i+200).forEach(id=>b.delete(ND.doc(id)));
    await b.commit();
  }
  if(add.length||rem.length)await DB.fb.collection('reservations').doc(r.id).update({nk:want});
  const c=byId('clients',r.clientId);
  if(c&&c.phone&&r.no){const tid=await trackId(r.no,c.phone);await DB.fb.collection('track').doc(tid).set(clean(trackDoc(r)))}
}
const syncQ=new Set();let syncT=null;
function qSync(id){syncQ.add(id);clearTimeout(syncT);syncT=setTimeout(runSync,500)}
async function runSync(){
  const ids=Array.from(syncQ);syncQ.clear();
  for(const id of ids){const r=byId('reservations',id);if(!r)continue;try{await syncRes(r)}catch(e){console.warn('Synchronisation :',e);writeErr(e)}}
}
function afterWrite(c,rec){
  if(DB.mode!=='firebase'||!state.user)return;
  if(c==='reservations')qSync(rec.id);
  else if(c==='payments'||c==='charges'||c==='pending'){if(rec.resId)qSync(rec.resId)}
  else if(c==='clients')DB.cache.reservations.filter(x=>x.clientId===rec.id).forEach(x=>qSync(x.id));
}
async function wipeCol(c){
  const snap=await DB.fb.collection(c).get();let b=DB.fb.batch(),n=0;
  for(const d of snap.docs){b.delete(d.ref);if(++n%400===0){await b.commit();b=DB.fb.batch()}}
  if(n%400!==0)await b.commit();
}
