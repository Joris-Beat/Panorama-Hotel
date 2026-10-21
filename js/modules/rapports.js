/* Panorama Hotel Manager — Page Rapports */
'use strict';

PAGES.reports=()=>{
  const m=state.repMonth,mr=monthRange(m),days=diffDays(mr.from,mr.to),rooms=DB.cache.rooms.length,L=live();
  const nts=sum(L,r=>overlapNights(r,mr.from,mr.to)),room=roomRev(mr.from,mr.to),B=breakdown(mr.from,mr.to),totalRev=sum(Object.values(B),v=>v);
  const cash=DB.cache.payments.filter(p=>p.date>=mr.from&&p.date<mr.to);
  const inM=DB.cache.reservations.filter(r=>r.in>=mr.from&&r.in<mr.to);
  const src={};inM.filter(r=>!DEAD.includes(r.status)).forEach(r=>{src[r.source||'Autre']=(src[r.source||'Autre']||0)+1});
  const modes={};cash.forEach(p=>{modes[p.mode]=(modes[p.mode]||0)+(+p.amount||0)});
  const yr=m.slice(0,4),mon=[...Array(12)].map((_,i)=>{const ym=yr+'-'+pad(i+1),rg=monthRange(ym);const v=sum(DB.cache.payments.filter(p=>p.date>=rg.from&&p.date<rg.to),p=>p.amount);return {l:['J','F','M','A','M','J','J','A','S','O','N','D'][i],v,hl:ym===m,t:ym+' : '+money(v)}});
  const top={};L.filter(r=>r.in>=mr.from&&r.in<mr.to).forEach(r=>{top[r.clientId]=(top[r.clientId]||0)+folio(r).total});
  const topRows=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return head('Rapports',`<button class="btn" data-act="repCsv" data-k="res">${I('dl',16)}Réservations (CSV)</button><button class="btn" data-act="repCsv" data-k="pay">${I('dl',16)}Paiements (CSV)</button>`)+
  `<div class="tools"><label class="fl"><span>Mois</span><input type="month" data-date="repMonth" value="${m}"></label></div>
  <div class="kpis"><div class="kpi"><small>Taux d’occupation</small><b>${rooms?Math.round(nts/(rooms*days)*100):0}%</b><em>${nts} nuitées</em></div><div class="kpi"><small>Prix moyen / nuit</small><b>${esc(money(nts?room/nts:0))}</b></div><div class="kpi"><small>RevPAR</small><b>${esc(money(rooms?room/(rooms*days):0))}</b></div><div class="kpi"><small>Chiffre d’affaires</small><b>${esc(money(totalRev))}</b></div><div class="kpi"><small>Encaissements</small><b>${esc(money(sum(cash,p=>p.amount)))}</b></div><div class="kpi"><small>Annulations / No-show</small><b>${inM.filter(r=>DEAD.includes(r.status)).length}</b><em>sur ${inM.length} réservations</em></div></div>
  <div class="grid2"><div class="card"><h2>Chiffre d’affaires par activité</h2>${hBars(Object.entries(B).map(e=>({l:e[0],v:e[1],t:money(e[1])})))}</div><div class="card"><h2>Encaissements ${esc(yr)}</h2>${barChart(mon)}</div></div>
  <div class="grid3"><div class="card"><h2>Sources de réservation</h2>${Object.keys(src).length?hBars(Object.entries(src).map(e=>({l:e[0],v:e[1],t:String(e[1])}))):'<div class="empty" style="padding:14px">Aucune donnée.</div>'}</div>
  <div class="card"><h2>Modes de paiement</h2>${Object.keys(modes).length?hBars(Object.entries(modes).map(e=>({l:e[0],v:e[1],t:money(e[1])}))):'<div class="empty" style="padding:14px">Aucune donnée.</div>'}</div>
  <div class="card"><h2>Meilleurs clients</h2>${topRows.length?topRows.map(e=>`<div class="li"><span>${esc(clientName(e[0]))}</span><b>${esc(money(e[1]))}</b></div>`).join(''):'<div class="empty" style="padding:14px">Aucune donnée.</div>'}</div></div>`;
};
ACT.repCsv=t=>{
  const mr=monthRange(state.repMonth);
  if(t.dataset.k==='res')saveFile('reservations-'+state.repMonth+'.csv',toCSV([['N°','Client','Chambre','Arrivée','Départ','Nuits','Tarif','Statut','Source','Total','Payé','Solde']].concat(DB.cache.reservations.filter(r=>r.in>=mr.from&&r.in<mr.to).map(r=>{const f=folio(r);return [r.no,clientName(r.clientId),roomNo(r.roomId),r.in,r.out,f.n,r.rate,r.status,r.source,f.total,f.paid,f.balance]}))));
  else saveFile('paiements-'+state.repMonth+'.csv',toCSV([['Date','Pour','Mode','Référence','Montant','Par']].concat(DB.cache.payments.filter(p=>p.date>=mr.from&&p.date<mr.to).map(p=>[p.date,payFor(p),p.mode,p.ref||'',p.amount,p.by||'']))));
};
