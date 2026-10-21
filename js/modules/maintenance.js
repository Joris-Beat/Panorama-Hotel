/* Panorama Hotel Manager — Page Maintenance */
'use strict';

PAGES.maintenance=()=>{
  const W=can('maintenance',2),f=state.filters.mt||'open',q=state.q.maintenance||'',PR={Urgente:0,Haute:1,Normale:2,Basse:3};
  const rows=DB.cache.maintenance.filter(m=>(f==='all'||(f==='open'?m.status!=='Résolu':m.status===f))&&match(q,m.title,roomNo(m.roomId),m.place,m.description)).sort((a,b)=>(a.status==='Résolu')-(b.status==='Résolu')||PR[a.priority]-PR[b.priority]);
  return head('Maintenance',W?addBtn('Nouveau ticket','add','data-col="maintenance"'):'')+`<div class="tools">${searchBox('maintenance')}${filterSel('mt',[['open','Non résolus'],['Ouvert','Ouverts'],['En cours','En cours'],['Résolu','Résolus'],['all','Tous']],f)}</div>`+
  table([{h:'Problème',c:m=>'<b>'+esc(m.title)+'</b>'+(m.blocks&&m.status!=='Résolu'?' '+badge('Chambre bloquée','bad'):'')},{h:'Lieu',c:m=>m.roomId?'Chambre '+esc(roomNo(m.roomId)):esc(m.place||'—')},{h:'Priorité',c:m=>badge(m.priority)},{h:'Statut',c:m=>badge(m.status)},{h:'Technicien',c:m=>m.assignee?esc(staffName(m.assignee)):'—'},{h:'Signalé',c:m=>fmtDate(m.opened)},{h:'Coût',cls:'num',c:m=>m.cost?esc(money(m.cost)):'—'},
   {h:'',c:m=>acts('maintenance',m,'maintenance',W&&m.status!=='Résolu'?`<button class="btn sm primary" data-act="mtDone" data-id="${m.id}">Résolu</button>`:'')}],rows,'Aucun ticket.');
};
ACT.mtDone=t=>{
  if(!needW('maintenance'))return;const m=byId('maintenance',t.dataset.id),out=Object.assign({},m,{status:'Résolu'});
  CRUD.maintenance.prep(out,m);put('maintenance',out);logA('Ticket résolu : '+m.title);toast('Ticket résolu');
};
