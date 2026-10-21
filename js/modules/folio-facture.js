/* Panorama Hotel Manager — Folio du séjour, paiements et facture */
'use strict';

const payFor=p=>{
  if(p.resId){const r=byId('reservations',p.resId);return r?clientName(r.clientId)+' · ch. '+roomNo(r.roomId):'Séjour'}
  if(p.eventId){const e=byId('events',p.eventId);return e?'Événement : '+e.title:'Événement'}
  return 'Vente '+(p.dept||'');
};
function addPayment(o){
  const p=Object.assign({id:uid(),date:today(),mode:'Espèces',by:state.user?state.user.name:'',ts:new Date().toISOString()},o);
  put('payments',p);logA('Encaissement '+money(p.amount)+' ('+p.mode+') — '+payFor(p));return p;
}
function openFolio(id){
  const r=byId('reservations',id);if(!r)return;const f=folio(r),W=can('billing',2),rm=byId('rooms',r.roomId)||{};
  const lines=[`<tr><td>Hébergement — chambre ${esc(rm.no||'?')} (${f.n} nuit${f.n>1?'s':''} × ${esc(money(r.rate))}${r.discount?', remise '+r.discount+'%':''})</td><td>${fmtDate(r.in)}</td><td class="num">${f.n}</td><td class="num">${esc(money(r.rate))}</td><td class="num">${esc(money(f.roomTotal))}</td><td></td></tr>`]
   .concat(f.ch.map(c=>`<tr><td>${esc(c.desc)} <small>(${esc(c.dept||'')})</small></td><td>${fmtDate(c.date)}</td><td class="num">${esc(c.qty)}</td><td class="num">${esc(money(c.price))}</td><td class="num">${esc(money((+c.qty||0)*(+c.price||0)))}</td><td>${W?`<button class="ib danger" data-act="chargeDel" data-id="${c.id}" data-res="${r.id}" aria-label="Supprimer">${I('trash',15)}</button>`:''}</td></tr>`))
   .concat(f.tax?[`<tr><td>Taxe de séjour</td><td></td><td class="num">${(r.adults||1)*f.n}</td><td class="num">${esc(money(S().touristTax))}</td><td class="num">${esc(money(f.tax))}</td><td></td></tr>`]:[]);
  openModal(`${mhead('Facturation — '+esc(clientName(r.clientId))+' · '+esc(r.no)+' '+badge(r.status))}<div class="mb">
  <div class="tw"><table><thead><tr><th>Description</th><th>Date</th><th class="num">Qté</th><th class="num">P.U.</th><th class="num">Montant</th><th></th></tr></thead><tbody>${lines.join('')}</tbody></table></div>
  <div class="tot"><div><span>Total</span><b>${money(f.total)}</b></div>${+S().tva?`<div><small>dont TVA ${S().tva}%</small><small>${money(f.tva)}</small></div>`:''}<div><span>Payé</span><b class="pos">${money(f.paid)}</b></div><div class="g"><span>Solde</span><b class="${f.balance>0.009?'neg':''}">${money(f.balance)}</b></div></div>
  ${pendTable(f.pend,r.id,W)}
  ${f.pays.length?`<h2>Paiements</h2><div class="tw"><table><tbody>${f.pays.map(p=>`<tr><td>${fmtDate(p.date)}</td><td>${esc(p.mode)}${p.ref?' · '+esc(p.ref):''}</td><td class="num">${esc(money(p.amount))}</td><td>${W?`<button class="ib danger" data-act="payDel" data-id="${p.id}" data-res="${r.id}" aria-label="Supprimer">${I('trash',15)}</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:''}</div>
  <footer class="mf"><button class="btn ghost" data-act="closeModal">Fermer</button><button class="btn" data-act="invoice" data-id="${r.id}">${I('bill',16)}Facture</button>${W?`<button class="btn" data-act="chargeAdd" data-id="${r.id}">${I('plus',16)}Dépense</button><button class="btn primary" data-act="payAdd" data-id="${r.id}">${I('wallet',16)}Encaisser</button>`:''}</footer>`,{wide:true,nofocus:true});
}
ACT.openFolio=t=>openFolio(t.dataset.id);
ACT.chargeAdd=t=>{
  if(!needW('billing'))return;const rid=t.dataset.id;
  formModal({title:'Ajouter une dépense',fields:[{k:'desc',label:'Description',req:1,span:1},{k:'dept',label:'Service',type:'select',opts:CHDEPTS},{k:'date',label:'Date',type:'date'},{k:'qty',label:'Quantité',type:'number',min:0,step:'any',req:1},{k:'price',label:'Prix unitaire',type:'number',req:1,step:'0.01',min:0}],value:{qty:1,date:today(),dept:'Restaurant'},
   onSubmit:v=>{put('charges',{id:uid(),resId:rid,desc:v.desc,dept:v.dept,date:v.date||today(),qty:v.qty,price:v.price});logA('Dépense ajoutée : '+v.desc+' ('+money(v.qty*v.price)+')');openFolio(rid)}});
};
ACT.chargeDel=t=>{if(!needW('billing'))return;const c=byId('charges',t.dataset.id),rid=t.dataset.res;confirmDlg({title:'Supprimer la dépense ?',msg:c.desc,yes:'Supprimer',danger:1,no:'Retour',onYes:()=>{del('charges',c.id);logA('Dépense supprimée : '+c.desc);openFolio(rid)}})};
ACT.payAdd=t=>{
  if(!needW('billing'))return;const r=byId('reservations',t.dataset.id),bal=Math.max(0,folio(r).balance);
  formModal({title:'Encaisser un paiement',fields:[{k:'amount',label:'Montant',type:'number',req:1,step:'0.01',min:0},{k:'mode',label:'Mode de paiement',type:'select',opts:MODES},{k:'date',label:'Date',type:'date'},{k:'ref',label:'Référence'}],value:{amount:bal,mode:'Espèces',date:today()},
   onSubmit:v=>{if(!(v.amount>0))return 'Le montant doit être positif.';addPayment({resId:r.id,amount:v.amount,mode:v.mode,date:v.date||today(),ref:v.ref});toast('Paiement enregistré');openFolio(r.id)}});
};
ACT.payDel=t=>{if(!needW('billing'))return;const p=byId('payments',t.dataset.id),rid=t.dataset.res;confirmDlg({title:'Supprimer le paiement ?',msg:money(p.amount)+' ('+p.mode+')',yes:'Supprimer',danger:1,no:'Retour',onYes:()=>{del('payments',p.id);logA('Paiement supprimé : '+money(p.amount));openFolio(rid)}})};
function ensureInvoice(r){
  if(r.invNo)return r;const s=S();
  const no=s.invoicePrefix+'-'+new Date().getFullYear()+'-'+String(s.invoiceNext).padStart(4,'0');
  saveSettings({invoiceNext:(+s.invoiceNext||1)+1});
  const out=Object.assign({},r,{invNo:no,invDate:today()});put('reservations',out);logA('Facture '+no+' émise');return out;
}
function invoiceBody(r){
  const s=S(),f=folio(r),c=byId('clients',r.clientId)||{},rm=byId('rooms',r.roomId)||{};
  return `<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap"><div><h2>${esc(s.hotel)}</h2>${esc(s.address)}<br>${esc(s.phone)} ${esc(s.email)}<br>${s.taxId?'ID fiscal : '+esc(s.taxId):''}</div><div style="text-align:right"><h2>FACTURE</h2>N° <b>${esc(r.invNo)}</b><br>Date : ${fmtDate(r.invDate)}<br>Réservation ${esc(r.no)}</div></div>
  <p><b>Client :</b> ${esc(c.name||'')}${c.company?' — '+esc(c.company):''}<br>${esc(c.address||'')}<br><b>Séjour :</b> ${fmtDate(r.in)} au ${fmtDate(r.out)} · chambre ${esc(rm.no||'')} (${esc(rm.type||'')})</p>
  <table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">P.U.</th><th style="text-align:right">Montant</th></tr></thead><tbody>
  <tr><td>Hébergement${r.discount?' (remise '+r.discount+'%)':''}</td><td style="text-align:right">${f.n} nuit(s)</td><td style="text-align:right">${esc(money(r.rate))}</td><td style="text-align:right">${esc(money(f.roomTotal))}</td></tr>
  ${f.ch.map(x=>`<tr><td>${esc(x.desc)}</td><td style="text-align:right">${esc(x.qty)}</td><td style="text-align:right">${esc(money(x.price))}</td><td style="text-align:right">${esc(money((+x.qty||0)*(+x.price||0)))}</td></tr>`).join('')}
  ${f.tax?`<tr><td>Taxe de séjour</td><td style="text-align:right">${(r.adults||1)*f.n}</td><td style="text-align:right">${esc(money(s.touristTax))}</td><td style="text-align:right">${esc(money(f.tax))}</td></tr>`:''}</tbody></table>
  <p style="text-align:right;margin-top:12px">${+s.tva?'dont TVA '+s.tva+'% : '+esc(money(f.tva))+'<br>':''}<b style="font-size:16px">Total TTC : ${esc(money(f.total))}</b><br>Déjà réglé : ${esc(money(f.paid))}<br><b>Reste à payer : ${esc(money(f.balance))}</b></p>
  <p style="color:#5a6f76;font-size:12px">Merci de votre séjour au ${esc(s.hotel)}.</p>`;
}
const invoiceDoc=r=>`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Facture ${esc(r.invNo)}</title><style>body{font:14px/1.5 "Segoe UI",Arial,sans-serif;color:#14232a;max-width:780px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;width:100%}th{background:#f2f6f7;text-align:left}td,th{border-bottom:1px solid #dfe7e9;padding:7px 8px}h2{margin:0 0 4px}</style></head><body>${invoiceBody(r)}</body></html>`;
ACT.invoice=t=>{
  if(!can('billing')){toast('Action non autorisée.','bad');return}
  let r=byId('reservations',t.dataset.id);if(!r.invNo){if(!needW('billing'))return;r=ensureInvoice(r)}
  openModal(`${mhead('Facture '+esc(r.invNo))}<div class="mb"><div class="inv">${invoiceBody(r)}</div></div><footer class="mf"><button class="btn ghost" data-act="openFolio" data-id="${r.id}">Retour</button><button class="btn primary" data-act="invDl" data-id="${r.id}">${I('dl',16)}Télécharger (HTML)</button></footer>`,{wide:true,nofocus:true});
};
ACT.invDl=t=>{const r=byId('reservations',t.dataset.id);saveFile('Facture-'+r.invNo+'.html',invoiceDoc(r))};
