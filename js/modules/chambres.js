/* Panorama Hotel Manager — Page Chambres */
'use strict';

PAGES.rooms=()=>{
  const W=can('rooms',2),v=state.filters.roomView||'grid',f=state.filters.roomSt||'',q=state.q.rooms||'';
  const rooms=DB.cache.rooms.filter(r=>(!f||r.status===f)&&match(q,r.no,r.type,r.amenities)).sort((a,b)=>cmpNo(a.no,b.no));
  const stay=id=>DB.cache.reservations.find(x=>x.roomId===id&&x.status==='En séjour');
  let body;
  if(!rooms.length)body='<div class="empty">Aucune chambre.</div>';
  else if(v==='list')body=table([{h:'N°',c:r=>'<b>'+esc(r.no)+'</b>'},{h:'Type',c:r=>esc(r.type)},{h:'Étage',c:r=>esc(r.floor)},{h:'Capacité',cls:'num',c:r=>r.capacity},{h:'Tarif / nuit',cls:'num',c:r=>esc(money(r.rate))},{h:'Statut',c:r=>badge(r.status)},{h:'Occupant',c:r=>{const s=stay(r.id);return s?esc(clientName(s.clientId)):'—'}},{h:'',c:r=>acts('rooms',r,'rooms')}],rooms);
  else{
    const floors=[...new Set(rooms.map(r=>String(r.floor||'—')))].sort(cmpNo);
    body=floors.map(fl=>`<div><h2 style="margin:6px 0 10px">Étage ${esc(fl)}</h2><div class="rooms">${rooms.filter(r=>String(r.floor||'—')===fl).map(r=>{const s=stay(r.id);return `<div class="rcard ${KIND[r.status]||''}"><div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(r.no)}</b>${badge(r.status)}</div><small>${esc(r.type)} · ${r.capacity||'?'} pers. · ${esc(money(r.rate))}</small><small>${s?'👤 '+esc(clientName(s.clientId)):esc(r.amenities||'')}</small>${W?`<div style="display:flex;gap:6px;align-items:center"><select data-roomst="${r.id}" aria-label="Statut">${['Disponible','Occupée','Nettoyage','Hors service'].map(o=>`<option${o===r.status?' selected':''}>${o}</option>`).join('')}</select><button class="ib" data-act="edit" data-col="rooms" data-id="${r.id}" aria-label="Modifier">${I('edit',16)}</button></div>`:''}</div>`}).join('')}</div></div>`).join('');
  }
  return head('Chambres',W?addBtn('Nouvelle chambre','add','data-col="rooms"'):'')+`<div class="tools">${searchBox('rooms')}${filterSel('roomSt',[['','Tous les statuts'],['Disponible','Disponible'],['Occupée','Occupée'],['Nettoyage','Nettoyage'],['Hors service','Hors service']],f)}${filterSel('roomView',[['grid','Vue par étage'],['list','Vue liste']],v)}</div>`+body;
};
