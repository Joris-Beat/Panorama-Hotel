/* Panorama Hotel Manager — Page Ménage */
'use strict';

PAGES.housekeeping=()=>{
  const W=can('housekeeping',2),t=today();
  const tasks=DB.cache.housekeeping.filter(h=>h.status!=='Terminé'||h.date===t);
  const col=(st)=>{
    const L=tasks.filter(h=>h.status===st).sort((a,b)=>cmpNo(roomNo(a.roomId),roomNo(b.roomId)));
    return `<div><div class="col-h"><span>${st}</span><span class="bdg ${KIND[st]}">${L.length}</span></div>${L.map(h=>`<div class="tk"><div style="display:flex;justify-content:space-between"><b>Chambre ${esc(roomNo(h.roomId))}</b>${badge(h.type,'mute')}</div><small style="color:var(--muted)">${h.assignee?esc(staffName(h.assignee)):'Non assignée'} · ${fmtDate(h.date)}</small>${h.note?`<small>${esc(h.note)}</small>`:''}${W?`<div class="ra" style="justify-content:flex-start">${st==='À faire'?`<button class="btn sm" data-act="hkSet" data-id="${h.id}" data-s="En cours">Démarrer</button>`:''}${st!=='Terminé'?`<button class="btn sm primary" data-act="hkSet" data-id="${h.id}" data-s="Terminé">Terminer</button>`:''}<button class="ib" data-act="edit" data-col="housekeeping" data-id="${h.id}" aria-label="Modifier">${I('edit',15)}</button><button class="ib danger" data-act="del" data-col="housekeeping" data-id="${h.id}" aria-label="Supprimer">${I('trash',15)}</button></div>`:''}</div>`).join('')||'<div class="empty" style="padding:14px">Aucune.</div>'}</div>`;
  };
  return head('Ménage',W?`<button class="btn" data-act="hkGen">${I('spark',16)}Générer les tâches du jour</button>${addBtn('Nouvelle tâche','add','data-col="housekeeping"')}`:'','Tâches ouvertes et terminées aujourd’hui.')+`<div class="board">${col('À faire')}${col('En cours')}${col('Terminé')}</div>`;
};
ACT.hkSet=t=>{
  if(!needW('housekeeping'))return;const h=byId('housekeeping',t.dataset.id),s=t.dataset.s;
  put('housekeeping',Object.assign({},h,{status:s,doneAt:s==='Terminé'?new Date().toISOString():h.doneAt}));
  if(s==='Terminé'){const rm=byId('rooms',h.roomId);if(rm&&rm.status==='Nettoyage'&&h.type!=='Recouche'&&!DB.cache.reservations.some(r=>r.roomId===rm.id&&r.status==='En séjour')){put('rooms',Object.assign({},rm,{status:'Disponible'}));toast('Chambre '+rm.no+' disponible')}logA('Ménage terminé : chambre '+roomNo(h.roomId))}
};
ACT.hkGen=()=>{
  if(!needW('housekeeping'))return;let n=0;const t=today();
  DB.cache.rooms.forEach(rm=>{
    const open=DB.cache.housekeeping.some(h=>h.roomId===rm.id&&(h.status!=='Terminé'||h.date===t));
    if(open)return;
    if(rm.status==='Occupée'){put('housekeeping',{id:uid(),roomId:rm.id,type:'Recouche',status:'À faire',date:t,note:''});n++}
    else if(rm.status==='Nettoyage'){put('housekeeping',{id:uid(),roomId:rm.id,type:'Départ',status:'À faire',date:t,note:''});n++}
  });
  toast(n?n+' tâche(s) créée(s)':'Aucune tâche à créer');
};
