/* Panorama Hotel Manager — Espace client : réservation en ligne, paiement, suivi */
'use strict';

const PM={
  'Mobile money':{ref:1,hint:()=>S().momoInfo||'Les instructions de paiement vous seront communiquées par l’hôtel.'},
  'Virement bancaire':{ref:1,hint:()=>S().bankInfo||'Les coordonnées bancaires vous seront communiquées par l’hôtel.'},
  'Carte bancaire':{ref:0,hint:()=>'Vous réglerez par carte au terminal de la réception, à votre arrivée.'},
  'Espèces':{ref:0,hint:()=>'Vous réglerez en espèces à la réception, à votre arrivée.'}
};
const normPhone=s=>String(s||'').replace(/\D/g,'').slice(-8);
const CODE_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const webCode=()=>{let s='';for(let i=0;i<6;i++)s+=CODE_CH[Math.floor(Math.random()*CODE_CH.length)];return 'W-'+s};
function pInit(){
  state.portal={step:1,q:{in:today(),out:addDays(today(),1),adults:2,children:0},type:'',results:null,err:'',busy:false,track:null,
    form:{plan:'half',method:'Mobile money',accept:false,name:'',phone:'',email:'',nationality:'',notes:'',ref:'',payerPhone:''}};
  state.occ=null;
}
function pRender(){const y=window.scrollY;state.view='';render(true);window.scrollTo(0,y)}
async function putSafe(c,rec){
  if(!rec.id)rec.id=uid();
  if(DB.db){try{await DB.db.collection(c).doc(rec.id).set(clean(rec))}catch(e){throw new Error(e&&(e.code==='invalid_argument'||e.code==='permission-denied')?'Écriture non autorisée.':'Enregistrement impossible, réessayez.')}}
  const a=DB.cache[c],i=a.findIndex(x=>x.id===rec.id);if(i>=0)a[i]=rec;else a.push(rec);
  if(!DB.db)saveLocal();return rec;
}
async function fetchOcc(q){
  if(DB.mode!=='firebase'){state.occ=null;return}
  const snap=await DB.fb.collection('nights').where('date','>=',q.in).where('date','<',q.out).get();
  state.occ=new Set(snap.docs.map(d=>d.data().roomId));
}
function availTypes(q){
  const g=(+q.adults||1)+(+q.children||0),out={},occ=state.occ;
  DB.cache.rooms.filter(r=>r.status!=='Hors service'&&(+r.capacity||2)>=g&&(occ?!occ.has(r.id):roomFree(r.id,q.in,q.out))).forEach(r=>{(out[r.type]=out[r.type]||[]).push(r)});
  return Object.keys(out).map(type=>{const rs=out[type].sort((a,b)=>(+a.rate)-(+b.rate)||cmpNo(a.no,b.no));return {type,rooms:rs,rate:+rs[0].rate,count:rs.length,cap:Math.max.apply(null,rs.map(r=>+r.capacity||2)),amen:rs[0].amenities||''}}).sort((a,b)=>a.rate-b.rate);
}
const pickRoom=(q,type)=>{const t=availTypes(q).find(x=>x.type===type);return t?t.rooms[0]:null};
function quote(q,room){const n=diffDays(q.in,q.out),s=S(),roomTotal=r2(n*(+room.rate)),tax=r2((+s.touristTax||0)*(+q.adults||1)*n);return {n,roomTotal,tax,total:r2(roomTotal+tax)}}
function dueNow(total,plan){const s=S();return plan==='full'?total:plan==='half'?r2(total*(+s.depositPct||50)/100):0}

/* message de confirmation (construit à partir du document de suivi T) */
function confText(T){
  const rest=r2(T.total-T.paid-T.pending),m=PM[T.method];
  const L=['✅ Confirmation de réservation — '+T.hotel,'','Code de réservation : '+T.no,'Statut : '+T.status,'Client : '+T.name,'Séjour : '+fmtDate(T.in)+' → '+fmtDate(T.out)+' ('+T.nights+' nuit'+(T.nights>1?'s':'')+')','Chambre : '+T.roomType+' n° '+T.roomNo,'Personnes : '+T.adults+' adulte(s)'+(T.children?', '+T.children+' enfant(s)':''),'','Total du séjour : '+money(T.total)];
  if(T.paid>0)L.push('Payé et confirmé : '+money(T.paid));
  if(T.pending>0)L.push('Paiement en cours de vérification : '+money(T.pending));
  if(rest>0.009)L.push('Reste à régler '+(m&&!m.ref?'à la réception ('+T.method+')':'à l’arrivée')+' : '+money(rest));
  else if(T.pending<=0.009)L.push('Séjour entièrement réglé.');
  L.push('','Arrivée à partir de '+T.checkin+' · Départ avant '+T.checkout,'Pour suivre votre réservation, indiquez votre code et votre numéro de téléphone.');
  if(T.hotelPhone)L.push('Contact : '+T.hotelPhone);
  return L.join('\n');
}
const waLink=(T,msg)=>{const ph=String(T.phone||'').trim(),d=ph.replace(/\D/g,'');return 'https://wa.me/'+(ph.startsWith('+')&&d.length>=10?d:'')+'?text='+encodeURIComponent(msg)};
function confBlock(T){
  state.confT=T;const msg=confText(T);
  return `<pre id="conf-pre" class="conf">${esc(msg)}</pre><div class="tools"><button class="btn primary" data-act="copyConf">Copier le message</button><a class="btn" target="_blank" rel="noopener" href="${esc(waLink(T,msg))}">Envoyer par WhatsApp</a><button class="btn" data-act="confDl">${I('dl',16)}Télécharger</button></div>`;
}
ACT.confMsg=t=>{const r=byId('reservations',t.dataset.id),T=trackDoc(r);openModal(`${mhead('Message de confirmation — '+esc(r.no))}<div class="mb">${confBlock(T)}</div><footer class="mf"><button class="btn" data-act="closeModal">Fermer</button></footer>`,{nofocus:true})};
ACT.copyConf=async()=>{
  try{await navigator.clipboard.writeText(confText(state.confT));toast('Message copié')}
  catch(e){const pre=$('#conf-pre');if(pre){const rg=document.createRange();rg.selectNodeContents(pre);const sl=window.getSelection();sl.removeAllRanges();sl.addRange(rg)}toast('Texte sélectionné : copiez-le manuellement.')}
};
ACT.confDl=()=>{const T=state.confT;saveFile('Confirmation-'+T.no+'.html',`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirmation ${esc(T.no)}</title><style>body{font:15px/1.6 "Segoe UI",Arial,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;color:#14232a}pre{white-space:pre-wrap;font:inherit;background:#f2f6f7;padding:16px;border-radius:10px}</style></head><body><pre>${esc(confText(T))}</pre></body></html>`)};

/* validation des paiements en ligne (personnel) */
function pendTable(list,resId,W){
  if(!list||!list.length)return '';
  return `<h2>Paiements en ligne à vérifier</h2><div class="tw"><table><tbody>${list.map(p=>`<tr><td>${fmtDate(p.date)}</td><td>${esc(p.mode)} · réf. ${esc(p.ref||'—')}${p.payerPhone?' · '+esc(p.payerPhone):''}</td><td class="num">${esc(money(p.amount))}</td><td>${W?`<div class="ra"><button class="btn sm primary" data-act="pendOk" data-id="${p.id}" data-res="${resId||''}">Valider</button><button class="btn sm danger" data-act="pendNo" data-id="${p.id}" data-res="${resId||''}">Rejeter</button></div>`:''}</td></tr>`).join('')}</tbody></table></div>`;
}
function pendCard(){
  const L=DB.cache.pending;if(!L.length)return '';
  return `<div class="card"><h2>Paiements en ligne à vérifier (${L.length})</h2><div class="tw"><table><tbody>${L.map(p=>{const r=byId('reservations',p.resId)||{};return `<tr><td><b>${esc(r.no||'?')}</b> · ${esc(clientName(r.clientId))}</td><td>${esc(p.mode)} · réf. ${esc(p.ref||'—')}${p.payerPhone?' · '+esc(p.payerPhone):''}</td><td class="num">${esc(money(p.amount))}</td><td>${can('billing',2)?`<div class="ra"><button class="btn sm primary" data-act="pendOk" data-id="${p.id}">Valider</button><button class="btn sm danger" data-act="pendNo" data-id="${p.id}">Rejeter</button></div>`:''}</td></tr>`}).join('')}</tbody></table></div></div>`;
}
ACT.pendOk=t=>{
  if(!needW('billing'))return;const p=byId('pending',t.dataset.id);if(!p)return;
  addPayment({resId:p.resId,amount:p.amount,mode:p.mode,ref:p.ref,date:today(),note:p.payerPhone||''});
  del('pending',p.id);toast('Paiement validé');if(t.dataset.res)openFolio(t.dataset.res);
};
ACT.pendNo=t=>{
  if(!needW('billing'))return;const p=byId('pending',t.dataset.id);if(!p)return;const rid=t.dataset.res;
  confirmDlg({title:'Rejeter ce paiement ?',msg:money(p.amount)+' — réf. '+(p.ref||'—')+'. Il ne sera pas compté.',yes:'Rejeter',danger:1,no:'Retour',onYes:()=>{del('pending',p.id);logA('Paiement en ligne rejeté : '+money(p.amount)+' réf. '+p.ref);if(rid)openFolio(rid)}});
};

/* écrans du portail */
ACT.portalOpen=()=>{pInit();state.portalOn=true;pRender()};
ACT.portalExit=()=>{state.portalOn=false;if(location.hash==='#reserver')history.replaceState(null,'',location.pathname+location.search);pRender()};
ACT.pBack=()=>{state.portal.step=1;state.portal.err='';pRender()};
ACT.pNew=()=>{pInit();pRender()};
const pField=(k,label,val,o)=>`<label class="fl ${o&&o.span?'s2':''}"><span>${esc(label)}${o&&o.req?' *':''}</span><input data-pf="${k}" type="${(o&&o.type)||'text'}" value="${esc(val)}"${o&&o.ac?` autocomplete="${o.ac}"`:''}></label>`;
function portalView(){
  const s=S(),p=state.portal||(pInit(),state.portal);
  const nav=`<header class="ptop"><div class="brand">${logoHTML()}<div><b>${esc(s.hotel)}</b><small>Réservation en ligne</small></div></div><div class="tools"><button class="btn ghost" data-act="pTrack" style="color:#fff;border-color:rgba(255,255,255,.35)">Suivre ma réservation</button>${state.user?'<button class="btn" data-act="portalExit">← Gestion</button>':(!needSetup()?'<button class="btn ghost" data-act="portalExit" style="color:#fff;border-color:rgba(255,255,255,.35)">Accès personnel</button>':'')}</div></header>`;
  let inner;
  const open=s.onlineEnabled&&!needSetup()&&DB.cache.rooms.length>0;
  if(!open)inner=`<div class="card"><h1>Réservation indisponible</h1><p style="color:var(--muted)">La réservation en ligne n’est pas ouverte pour le moment. Veuillez contacter l’hôtel${s.phone?' au '+esc(s.phone):''}.</p></div>`;
  else if(p.step===3)inner=pConfirm(p);
  else if(p.step===2)inner=pDetails(p);
  else inner=pSearch(p);
  const steps=['Dates et chambre','Vos informations et paiement','Confirmation'];
  const st=open?`<div class="steps">${steps.map((x,i)=>`<span class="${p.step===i+1?'on':p.step>i+1?'done':''}">${i+1}. ${x}</span>`).join('')}</div>`:'';
  return `<div class="portal">${nav}<main class="pmain">${st}${inner}</main></div>`;
}
function pSearch(p){
  const q=p.q;
  const res=p.results?(p.results.length?`<div class="tcards">${p.results.map(t=>{const n=diffDays(q.in,q.out);return `<div class="tcard"><div><h2>${esc(t.type)}</h2><small style="color:var(--muted)">Jusqu’à ${t.cap} personne(s) · ${t.count} disponible(s)</small><p style="margin:6px 0 0">${esc(t.amen)}</p></div><div><b style="font-family:var(--display);font-size:22px">${esc(money(t.rate))}</b> <small>/ nuit</small><br><small>${n} nuit${n>1?'s':''} : ${esc(money(r2(n*t.rate)))}</small></div><button class="btn primary" data-act="pPick" data-type="${esc(t.type)}">Choisir</button></div>`}).join('')}</div>`:'<div class="empty">Aucune chambre disponible pour ces dates et ce nombre de personnes. Essayez d’autres dates.</div>'):'';
  return `<section class="card"><h1>Réservez votre séjour</h1><p style="color:var(--muted);margin:6px 0 14px">Choisissez vos dates, puis votre chambre. Vous recevrez un code de réservation immédiatement.</p><div class="gf"><label class="fl"><span>Arrivée</span><input type="date" data-pq="in" value="${q.in}" min="${today()}"></label><label class="fl"><span>Départ</span><input type="date" data-pq="out" value="${q.out}" min="${addDays(today(),1)}"></label><label class="fl"><span>Adultes</span><input type="number" data-pq="adults" min="1" value="${q.adults}"></label><label class="fl"><span>Enfants</span><input type="number" data-pq="children" min="0" value="${q.children}"></label></div><div class="ferr" role="alert" style="margin-top:8px">${esc(p.err)}</div><div class="tools" style="margin-top:10px"><button class="btn primary" data-act="pSearch" ${p.busy?'disabled':''}>Voir les disponibilités</button></div></section>${res}`;
}
ACT.pSearch=async()=>{
  const p=state.portal,q=p.q;q.adults=Math.max(1,+q.adults||1);q.children=Math.max(0,+q.children||0);
  if(!q.in||!q.out||q.in<today())p.err='Choisissez une date d’arrivée à partir d’aujourd’hui.';
  else if(q.out<=q.in)p.err='La date de départ doit être après l’arrivée.';
  else if(diffDays(q.in,q.out)>30)p.err='Séjour limité à 30 nuits en ligne. Contactez l’hôtel pour plus.';
  else p.err='';
  p.results=null;
  if(!p.err){
    try{await fetchOcc(q);p.results=availTypes(q)}catch(e){console.warn(e);p.err='Impossible de vérifier les disponibilités pour le moment. Réessayez.'}
  }
  pRender();
};
ACT.pPick=t=>{state.portal.type=t.dataset.type;state.portal.step=2;state.portal.err='';pRender();window.scrollTo(0,0)};
function pDetails(p){
  const s=S(),room=pickRoom(p.q,p.type);
  if(!room)return `<div class="card"><h1>Chambre plus disponible</h1><p>Cette chambre vient d’être réservée. Merci de choisir à nouveau.</p><button class="btn primary" data-act="pBack">Retour</button></div>`;
  const qt=quote(p.q,room),f=p.form,plans=[['full','Payer la totalité maintenant',qt.total],['half','Payer un acompte de '+(+s.depositPct||50)+' % maintenant',dueNow(qt.total,'half')]].concat(s.allowLater?[['later','Payer à l’arrivée (rien à payer maintenant)',0]]:[]);
  if(!plans.some(x=>x[0]===f.plan))f.plan='half';
  const now=dueNow(qt.total,f.plan),m=PM[f.method]||PM['Mobile money'];
  return `<section class="card"><h1>Vos informations</h1><div class="gf" style="margin-top:12px">${pField('name','Nom complet',f.name,{req:1,ac:'name'})}${pField('phone','Téléphone (avec indicatif)',f.phone,{req:1,type:'tel',ac:'tel'})}${pField('email','E-mail',f.email,{type:'email',ac:'email'})}${pField('nationality','Nationalité',f.nationality)}<label class="fl s2"><span>Demandes particulières</span><textarea data-pf="notes" rows="2">${esc(f.notes)}</textarea></label></div></section>
  <section class="card"><h2>Mode de règlement</h2><div class="opts">${plans.map(x=>`<label class="opt ${f.plan===x[0]?'on':''}"><input type="radio" name="plan" data-pf="plan" value="${x[0]}"${f.plan===x[0]?' checked':''}><span><b>${esc(x[1])}</b><small>${x[0]==='later'?'Le total est à régler à la réception : '+esc(money(qt.total)):'Montant : '+esc(money(x[2]))+(x[0]==='half'?' · reste '+esc(money(r2(qt.total-x[2])))+' à l’arrivée':'')}</small></span></label>`).join('')}</div>
  ${f.plan!=='later'?`<h2 style="margin-top:14px">Moyen de paiement</h2><div class="opts">${Object.keys(PM).map(k=>`<label class="opt ${f.method===k?'on':''}"><input type="radio" name="method" data-pf="method" value="${esc(k)}"${f.method===k?' checked':''}><span><b>${esc(k)}</b></span></label>`).join('')}</div><div class="sum" style="margin-top:10px">${esc(m.hint())}</div>${m.ref?`<div class="gf" style="margin-top:10px">${pField('ref','Référence de la transaction',f.ref,{req:1})}${pField('payerPhone','Numéro / compte payeur',f.payerPhone)}</div><small style="color:var(--muted)">Montant à envoyer : <b>${esc(money(now))}</b>. Votre paiement sera vérifié par l’hôtel.</small>`:`<small style="color:var(--muted)">Montant à régler à l’arrivée : <b>${esc(money(now))}</b>. Aucun paiement en ligne.</small>`}`:''}</section>
  <section class="card"><h2>Récapitulatif</h2><div class="tot" style="margin:0"><div><span>${esc(p.type)} · ${qt.n} nuit${qt.n>1?'s':''} (${fmtDate(p.q.in)} → ${fmtDate(p.q.out)})</span><b>${esc(money(qt.roomTotal))}</b></div>${qt.tax?`<div><span>Taxe de séjour</span><b>${esc(money(qt.tax))}</b></div>`:''}<div class="g"><span>Total</span><b>${esc(money(qt.total))}</b></div><div><span>À payer maintenant en ligne</span><b>${esc(money(f.plan!=='later'&&PM[f.method]&&PM[f.method].ref?now:0))}</b></div></div>
  <p style="color:var(--muted)">${esc(s.onlineTerms||'')}</p><label class="chk"><input type="checkbox" data-pf="accept"${f.accept?' checked':''}><span>J’accepte les conditions de réservation</span></label><div class="ferr" role="alert">${esc(p.err)}</div><div class="tools" style="margin-top:10px"><button class="btn ghost" data-act="pBack">← Modifier</button><button class="btn primary" data-act="pSubmit" ${p.busy?'disabled':''}>Confirmer la réservation</button></div></section>`;
}
ACT.pSubmit=async()=>{
  const p=state.portal,f=p.form,s=S();if(p.busy)return;
  const fail=m=>{p.err=m;p.busy=false;pRender()};
  if(!f.name.trim())return fail('Indiquez votre nom.');
  if(f.phone.replace(/\D/g,'').length<8)return fail('Indiquez un numéro de téléphone valide.');
  if(!f.accept)return fail('Veuillez accepter les conditions de réservation.');
  if(f.plan==='later'&&!s.allowLater)f.plan='half';
  const m=PM[f.method];if(f.plan!=='later'&&m.ref&&!f.ref.trim())return fail('Saisissez la référence de votre transaction.');
  p.busy=true;
  try{
    const fbm=DB.mode==='firebase';
    if(fbm)await fetchOcc(p.q);
    const type=availTypes(p.q).find(x=>x.type===p.type);
    if(!type){p.step=2;return fail('Cette chambre n’est plus disponible. Choisissez à nouveau.')}
    const online=f.plan!=='later'&&m.ref,code=webCode(),cid=uid(),rid=uid(),iso=new Date().toISOString();
    const known=!fbm&&DB.cache.clients.find(x=>x.phone&&normPhone(x.phone)===normPhone(f.phone));
    if(known&&known.blacklist)return fail('La réservation en ligne est impossible. Merci de contacter l’hôtel.');
    const client=known||{id:cid,name:f.name.trim(),phone:f.phone.trim(),email:f.email.trim(),nationality:f.nationality.trim()};
    let done=null;
    for(const room of type.rooms.slice(0,fbm?4:1)){
      const qt=quote(p.q,room),nk=nightIds({roomId:room.id,in:p.q.in,out:p.q.out}),now=dueNow(qt.total,f.plan);
      const r={id:rid,no:code,clientId:client.id,roomId:room.id,in:p.q.in,out:p.q.out,adults:p.q.adults,children:p.q.children,rate:+room.rate,discount:0,source:'En ligne',status:'Confirmée',online:true,payPlan:f.plan,payMethod:f.plan==='later'?'':f.method,notes:f.notes.trim(),createdAt:iso,by:'Client (en ligne)',nk};
      const pd=online&&now>0?{id:uid(),resId:rid,amount:now,mode:f.method,ref:f.ref.trim(),payerPhone:f.payerPhone.trim(),date:today(),ts:iso}:null;
      const T={resId:rid,no:code,name:client.name,phone:client.phone,hotel:s.hotel,hotelPhone:s.phone||'',checkin:s.checkin,checkout:s.checkout,roomType:room.type,roomNo:room.no,in:p.q.in,out:p.q.out,nights:qt.n,adults:p.q.adults,children:p.q.children,total:qt.total,paid:0,pending:pd?pd.amount:0,status:'Confirmée',plan:f.plan,method:r.payMethod,updated:iso};
      if(fbm){
        const b=DB.fb.batch();
        nk.forEach(id=>{const k=id.lastIndexOf('_');b.set(DB.fb.collection('nights').doc(id),{roomId:id.slice(0,k),date:id.slice(k+1),resId:rid})});
        b.set(DB.fb.collection('clients').doc(client.id),clean(client));
        b.set(DB.fb.collection('reservations').doc(rid),clean(r));
        if(pd)b.set(DB.fb.collection('pending').doc(pd.id),clean(pd));
        b.set(DB.fb.collection('track').doc(await trackId(code,client.phone)),clean(T));
        try{await b.commit()}catch(e){if(e&&e.code==='permission-denied')continue;throw e}
      }else{
        if(!known)await putSafe('clients',client);
        await putSafe('reservations',r);
        if(pd)await putSafe('pending',pd);
      }
      done=T;break;
    }
    if(!done){p.step=1;p.results=null;return fail('Cette chambre vient d’être réservée par un autre client. Relancez la recherche.')}
    logA('Réservation en ligne '+code+' — '+f.name.trim()+', '+done.roomType+' '+done.roomNo+(online?' (paiement '+f.method+' à vérifier)':''));
    p.track=done;p.step=3;p.busy=false;p.err='';pRender();window.scrollTo(0,0);
  }catch(e){console.warn(e);fail((e&&e.message)||'Réservation impossible, réessayez.')}
};
function pConfirm(p){
  const T=p.track;if(!T)return '<div class="card">Réservation introuvable.</div>';
  const pend=T.pending>0;
  return `<section class="card" style="text-align:center"><small style="color:var(--muted)">Votre code de réservation</small><div class="code">${esc(T.no)}</div><p style="margin:0">${pend?'Réservation enregistrée — votre paiement est en cours de vérification.':'Réservation confirmée.'}</p><small style="color:var(--muted)">Conservez ce code : il est enregistré dans notre système.</small></section><section class="card"><h2>Message de confirmation</h2>${confBlock(T)}</section><div class="tools"><button class="btn" data-act="pNew">Nouvelle réservation</button><button class="btn" data-act="pTrack">Suivre ma réservation</button></div>`;
}
/* suivi par code + téléphone */
ACT.pTrack=()=>{
  formModal({title:'Suivre ma réservation',submit:'Rechercher',fields:[{k:'code',label:'Code de réservation',req:1,ph:'W-7K3Q9X'},{k:'phone',label:'Téléphone utilisé à la réservation',type:'tel',req:1}],
   onSubmit:async v=>{
     const code=v.code.trim().toUpperCase();let T=null;
     if(DB.mode==='firebase'){
       try{const d=await DB.fb.collection('track').doc(await trackId(code,v.phone)).get();if(d.exists)T=d.data()}catch(e){return 'Recherche impossible pour le moment. Réessayez.'}
     }else{
       const r=DB.cache.reservations.find(x=>String(x.no).toUpperCase()===code),c=r&&byId('clients',r.clientId);
       if(r&&c&&normPhone(c.phone)===normPhone(v.phone))T=trackDoc(r);
     }
     if(!T)return 'Aucune réservation ne correspond à ce code et ce numéro.';
     trackView(T);
   }});
};
function trackView(T){
  state.trk=T;const rest=r2(T.total-T.paid-T.pending),live=['Confirmée','En séjour'].includes(T.status);
  openModal(`${mhead('Réservation '+esc(T.no)+' '+badge(T.status))}<div class="mb">${confBlock(T)}${T.pending>0?'<small style="color:var(--muted)">Un paiement est en attente de vérification par l’hôtel.</small>':''}</div><footer class="mf"><button class="btn ghost" data-act="closeModal">Fermer</button>${rest>0.009&&live?`<button class="btn primary" data-act="pPay">Régler un montant</button>`:''}</footer>`,{nofocus:true});
}
ACT.pPay=()=>{
  const T=state.trk,rest=Math.max(0,r2(T.total-T.paid-T.pending));
  formModal({title:'Régler — '+T.no,submit:'Envoyer le paiement',fields:[{k:'mode',label:'Moyen de paiement',type:'select',opts:['Mobile money','Virement bancaire']},{k:'amount',label:'Montant',type:'number',req:1,step:'0.01',min:0},{k:'ref',label:'Référence de la transaction',req:1},{k:'payerPhone',label:'Numéro / compte payeur'}],value:{mode:'Mobile money',amount:rest},
   extra:`<div class="sum">${esc(S().momoInfo||'')} ${esc(S().bankInfo||'')}</div>`,
   onSubmit:async v=>{
     if(!(v.amount>0))return 'Montant invalide.';
     try{await putSafe('pending',{id:uid(),resId:T.resId,amount:v.amount,mode:v.mode,ref:v.ref,payerPhone:v.payerPhone,date:today(),ts:new Date().toISOString()})}catch(e){return e.message}
     logA('Paiement en ligne '+money(v.amount)+' ('+v.mode+') pour '+T.no+' à vérifier');toast('Paiement envoyé — en cours de vérification');
     trackView(Object.assign({},T,{pending:r2(T.pending+v.amount)}));
   }});
};
