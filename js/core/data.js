/* Panorama Hotel Manager — Accès aux données : lecture, écriture, mode local */
'use strict';

const COLS=['users','roles','settings','rooms','clients','reservations','charges','payments','pending','housekeeping','maintenance','stock','stockMoves','suppliers','events','menu','orders','staff','attendance','leaves','payroll','shifts','log'];
const DB={cache:{},db:null,mode:'local',queues:{},warnT:null,fb:null,auth:null,cfg:null,subs:null,setupDone:false,fbErr:null,needConfig:false};
COLS.forEach(c=>{DB.cache[c]=[]});
const LS_KEY='ph_local_v1';
let saveT=null;
function saveLocal(){clearTimeout(saveT);saveT=setTimeout(()=>lsSet(LS_KEY,JSON.stringify(DB.cache)),150)}
function loadLocal(){const raw=lsGet(LS_KEY);if(!raw)return;try{const d=JSON.parse(raw);COLS.forEach(c=>{if(Array.isArray(d[c]))DB.cache[c]=d[c]})}catch(e){}}
function writeErr(e){
  const code=e&&e.code;let m='Enregistrement impossible.';
  if(code==='permission-denied')m='Action refusée par la base de données (droits insuffisants ou règles de sécurité).';
  else if(code==='invalid_argument')m='Écriture refusée : votre accès au fichier ne permet pas de modifier les données (niveau Contributeur requis).';
  else if(code==='quota_exceeded')m='Limite de stockage atteinte. Supprimez d’anciens enregistrements.';
  else if(code==='resource_exhausted')m='Trop d’opérations d’un coup, réessayez dans un instant.';
  if(DB.warnT)return;toast(m,'bad');DB.warnT=setTimeout(()=>{DB.warnT=null},4000);
}
function enqueue(key,fn){const prev=DB.queues[key]||Promise.resolve();const next=prev.then(fn).catch(writeErr);DB.queues[key]=next;return next}
function put(c,rec){
  if(!rec.id)rec.id=uid();
  const a=DB.cache[c];const i=a.findIndex(x=>x.id===rec.id);if(i>=0)a[i]=rec;else a.push(rec);
  if(DB.db){const body=clean(rec);enqueue(c+'/'+rec.id,()=>DB.db.collection(c).doc(rec.id).set(body))}else saveLocal();
  afterWrite(c,rec);scheduleRender();return rec;
}
function del(c,id){
  const old=byId(c,id);
  DB.cache[c]=DB.cache[c].filter(x=>x.id!==id);
  if(DB.db)enqueue(c+'/'+id,()=>DB.db.collection(c).doc(id).delete());else saveLocal();
  if(old)afterWrite(c,old);scheduleRender();
}
const byId=(c,id)=>DB.cache[c].find(x=>x.id===id);
async function initStore(){
  const cfg=window.PH_CONFIG;
  if(cfg&&cfg.apiKey&&window.firebase){await initFirebase(cfg);return}
  if(cfg){loadLocal();DB.mode='local';DB.needConfig=cfg.apiKey?'sdk':'cfg';return}
  let db=null;
  try{if(window.claude&&window.claude.use)db=await window.claude.use('db')}catch(e){db=null}
  if(!db){loadLocal();DB.mode='local';return}
  DB.db=db;DB.mode='cloud';
  let ready=false;
  const firsts=COLS.map(c=>new Promise(res=>{
    let first=true;const done=()=>{if(first){first=false;res()}};
    try{
      db.collection(c).onSnapshot(snap=>{
        DB.cache[c]=snap.docs.map(d=>Object.assign({},d.data(),{id:d.id}));
        if(first)done();else if(ready)scheduleRender();
      },()=>done());
    }catch(e){done()}
  }));
  await Promise.race([Promise.all(firsts),sleep(7000)]);
  ready=true;
}
