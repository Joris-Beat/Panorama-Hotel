/* Panorama Hotel Manager — Page Clients */
'use strict';

PAGES.clients=()=>{
  const q=state.q.clients||'',W=can('clients',2);
  const rows=DB.cache.clients.filter(c=>match(q,c.name,c.phone,c.email,c.company,c.idNo)).sort((a,b)=>a.name.localeCompare(b.name));
  const rs=id=>DB.cache.reservations.filter(r=>r.clientId===id&&!DEAD.includes(r.status));
  return head('Clients',W?addBtn('Nouveau client','add','data-col="clients"'):'')+`<div class="tools">${searchBox('clients')}</div>`+table([
   {h:'Nom',c:c=>'<b>'+esc(c.name)+'</b>'+(c.vip?' '+badge('VIP','gold'):'')+(c.blacklist?' '+badge('Liste noire','bad'):'')},{h:'Téléphone',c:c=>esc(c.phone||'')},{h:'E-mail',c:c=>esc(c.email||'')},{h:'Nationalité',c:c=>esc(c.nationality||'')},
   {h:'Séjours',cls:'num',c:c=>rs(c.id).length},{h:'Dernier séjour',c:c=>{const l=rs(c.id).sort((a,b)=>b.in.localeCompare(a.in))[0];return l?fmtDate(l.in):'—'}},
   {h:'',c:c=>acts('clients',c,'clients',`<button class="ib" data-act="clientView" data-id="${c.id}" aria-label="Historique" title="Historique">${I('eye',16)}</button>`)}],rows,'Aucun client.');
};
ACT.clientView=t=>{
  const c=byId('clients',t.dataset.id),rs=DB.cache.reservations.filter(r=>r.clientId===c.id).sort((a,b)=>b.in.localeCompare(a.in));
  const spent=sum(rs,r=>folio(r).paid);
  openModal(`${mhead(esc(c.name)+(c.vip?' '+badge('VIP','gold'):''))}<div class="mb"><div class="dl"><div><small>Téléphone</small>${esc(c.phone||'—')}</div><div><small>E-mail</small>${esc(c.email||'—')}</div><div><small>Pièce</small>${esc(c.idType||'')} ${esc(c.idNo||'')}</div><div><small>Société</small>${esc(c.company||'—')}</div><div><small>Total payé</small><b>${esc(money(spent))}</b></div></div>${c.notes?`<div class="sum">${esc(c.notes)}</div>`:''}
  ${table([{h:'N°',c:r=>esc(r.no)},{h:'Chambre',c:r=>esc(roomNo(r.roomId))},{h:'Séjour',c:r=>fmtDate(r.in)+' → '+fmtDate(r.out)},{h:'Statut',c:r=>badge(r.status)}],rs,'Aucun séjour.')}</div><footer class="mf"><button class="btn" data-act="closeModal">Fermer</button></footer>`,{wide:true,nofocus:true});
};
