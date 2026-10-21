/* Panorama Hotel Manager — Page Facturation et caisse */
'use strict';

PAGES.billing=()=>{
  const tab=state.tabs.billing||'folios';
  const tabs=tabsHTML('billing',[['folios','Folios & factures'],['cash','Caisse du jour']],tab);
  if(tab==='cash'){
    const d=state.cashDate,P=DB.cache.payments.filter(p=>p.date===d).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
    const tot=sum(P,p=>p.amount);
    return head('Facturation & caisse')+tabs+pendCard()+`<div class="tools"><label class="fl"><span>Date</span><input type="date" data-date="cashDate" value="${d}"></label></div>
    <div class="kpis"><div class="kpi"><small>Total encaissé</small><b>${esc(money(tot))}</b><em>${P.length} paiement(s)</em></div>${MODES.map(m=>{const s=sum(P.filter(p=>p.mode===m),p=>p.amount);return s?`<div class="kpi"><small>${esc(m)}</small><b>${esc(money(s))}</b></div>`:''}).join('')}</div>`+
    table([{h:'Pour',c:p=>esc(payFor(p))},{h:'Mode',c:p=>esc(p.mode)},{h:'Réf.',c:p=>esc(p.ref||'')},{h:'Par',c:p=>esc(p.by||'')},{h:'Montant',cls:'num',c:p=>esc(money(p.amount))}],P,'Aucun encaissement ce jour.');
  }
  const f=state.filters.bill||'stay',q=state.q.billing||'';
  const rows=DB.cache.reservations.filter(r=>!DEAD.includes(r.status)&&(f==='all'||(f==='stay'&&r.status==='En séjour')||(f==='due'&&folio(r).balance>0.009&&['En séjour','Terminée'].includes(r.status)))&&match(q,r.no,clientName(r.clientId),roomNo(r.roomId),r.invNo)).sort((a,b)=>b.in.localeCompare(a.in));
  return head('Facturation & caisse')+tabs+pendCard()+`<div class="tools">${searchBox('billing')}${filterSel('bill',[['stay','Séjours en cours'],['due','Soldes à régler'],['all','Tous']],f)}</div>`+
  table([{h:'Réservation',c:r=>esc(r.no)},{h:'Client',c:r=>'<b>'+esc(clientName(r.clientId))+'</b>'},{h:'Chambre',c:r=>esc(roomNo(r.roomId))},{h:'Statut',c:r=>badge(r.status)},{h:'Total',cls:'num',c:r=>esc(money(folio(r).total))},{h:'Payé',cls:'num',c:r=>esc(money(folio(r).paid))},{h:'Solde',cls:'num',c:r=>{const b=folio(r).balance;return `<span class="${b>0.009?'neg':''}">${esc(money(b))}</span>`}},{h:'Facture',c:r=>esc(r.invNo||'—')},{h:'',c:r=>`<div class="ra"><button class="btn sm" data-act="openFolio" data-id="${r.id}">Ouvrir</button></div>`}],rows,'Aucun folio.');
};
