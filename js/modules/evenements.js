/* Panorama Hotel Manager — Page Événements */
'use strict';

PAGES.events=()=>{
  const W=can('events',2),q=state.q.events||'';
  const rows=DB.cache.events.filter(e=>match(q,e.title,e.clientName,e.hall)).sort((a,b)=>b.date.localeCompare(a.date));
  const paid=e=>sum(DB.cache.payments.filter(p=>p.eventId===e.id),p=>p.amount);
  return head('Événements',W?addBtn('Nouvel événement','add','data-col="events"'):'')+`<div class="tools">${searchBox('events')}</div>`+table([{h:'Date',c:e=>fmtDate(e.date)+(e.start?' <small>'+esc(e.start)+'</small>':'')},{h:'Événement',c:e=>'<b>'+esc(e.title)+'</b><small style="display:block;color:var(--muted)">'+esc(e.clientName)+'</small>'},{h:'Espace',c:e=>esc(e.hall)},{h:'Pers.',cls:'num',c:e=>e.pax||''},{h:'Statut',c:e=>badge(e.status)},{h:'Prix',cls:'num',c:e=>esc(money(e.price))},{h:'Payé',cls:'num',c:e=>esc(money(paid(e)))},{h:'Solde',cls:'num',c:e=>{const b=e.status==='Annulé'?0:r2(e.price-paid(e));return `<span class="${b>0.009?'neg':''}">${esc(money(b))}</span>`}},
   {h:'',c:e=>acts('events',e,'events',can('billing',2)&&e.status!=='Annulé'?`<button class="btn sm" data-act="evPay" data-id="${e.id}">Encaisser</button>`:'')}],rows,'Aucun événement.');
};
ACT.evPay=t=>{
  const e=byId('events',t.dataset.id),bal=Math.max(0,r2(e.price-sum(DB.cache.payments.filter(p=>p.eventId===e.id),p=>p.amount)));
  formModal({title:'Encaisser — '+e.title,fields:[{k:'amount',label:'Montant',type:'number',req:1,step:'0.01',min:0},{k:'mode',label:'Mode',type:'select',opts:MODES},{k:'ref',label:'Référence'}],value:{amount:bal,mode:'Espèces'},onSubmit:v=>{if(!(v.amount>0))return 'Montant invalide.';addPayment({eventId:e.id,amount:v.amount,mode:v.mode,ref:v.ref});toast('Paiement enregistré')}});
};
