/* Panorama Hotel Manager — Page Réservations (liste) */
'use strict';

PAGES.reservations=()=>{
  const f=state.filters.res||'all',q=state.q.reservations||'',t=today();
  const F={arr:r=>r.status==='Confirmée'&&r.in===t,dep:r=>r.status==='En séjour'&&r.out<=t,stay:r=>r.status==='En séjour',conf:r=>r.status==='Confirmée'&&r.in>=t,past:r=>['Terminée','Annulée','No-show'].includes(r.status)};
  const rows=DB.cache.reservations.filter(r=>(F[f]?F[f](r):true)&&match(q,r.no,clientName(r.clientId),roomNo(r.roomId),r.source)).sort((a,b)=>b.in.localeCompare(a.in));
  const W=can('reservations',2);
  const cols=[{h:'N°',c:r=>esc(r.no)},{h:'Client',c:r=>'<b>'+esc(clientName(r.clientId))+'</b>'+(r.online?' '+badge('En ligne','info')+(folio(r).pending>0?' '+badge('Paiement à vérifier','warn'):''):'')},{h:'Chambre',c:r=>esc(roomNo(r.roomId))},{h:'Arrivée',c:r=>fmtDate(r.in)},{h:'Départ',c:r=>fmtDate(r.out)},{h:'Nuits',cls:'num',c:r=>nights(r)},{h:'Statut',c:r=>badge(r.status)},{h:'Solde',cls:'num',c:r=>{const b=folio(r).balance;return `<span class="${b>0.009?'neg':''}">${esc(money(b))}</span>`}},
   {h:'',c:r=>`<div class="ra">${W&&r.status==='Confirmée'?`<button class="btn sm primary" data-act="checkin" data-id="${r.id}">Arrivée</button>`:''}${W&&r.status==='En séjour'?`<button class="btn sm primary" data-act="checkout" data-id="${r.id}">Départ</button>`:''}<button class="ib" data-act="openRes" data-id="${r.id}" aria-label="Détails" title="Détails">${I('eye',16)}</button></div>`}];
  return head('Réservations',W?addBtn('Nouvelle réservation','newRes'):'')+`<div class="tools">${searchBox('reservations')}${filterSel('res',[['all','Toutes'],['arr','Arrivées du jour'],['dep','Départs du jour'],['stay','En séjour'],['conf','À venir'],['past','Terminées / annulées']],f)}</div>`+table(cols,rows,'Aucune réservation.');
};
