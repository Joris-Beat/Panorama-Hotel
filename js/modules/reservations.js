/* Panorama Hotel Manager — Réservations : création, arrivée, départ, annulation */
'use strict';

const SOURCES=['En ligne','Direct','Téléphone','Site web','Booking.com','Airbnb','Agence','Entreprise','Autre'];
function roomOptsHTML(a,b,exclude,sel){
  return DB.cache.rooms.slice().sort((x,y)=>cmpNo(x.no,y.no)).map(r=>{
    const free=!a||!b||roomFree(r.id,a,b,exclude);const bad=r.status==='Hors service';
    return `<option value="${r.id}"${r.id===sel?' selected':''}${(!free&&r.id!==sel)?' disabled':''}>${esc(r.no)} — ${esc(r.type)} (${esc(money(r.rate))})${!free?' · occupée':''}${bad?' · hors service':''}</option>`;
  }).join('');
}
function resFields(rec){
  const stay=rec.status==='En séjour';
  return [
    {k:'clientId',label:'Client existant',type:'select',opts:DB.cache.clients.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>[c.id,c.name+(c.phone?' · '+c.phone:'')]),placeholder:'— Nouveau client —',span:1},
    {k:'newName',label:'Nouveau client : nom'},{k:'newPhone',label:'Nouveau client : téléphone',type:'tel'},
    {k:'in',label:'Arrivée',type:'date',req:1,readonly:stay},{k:'out',label:'Départ',type:'date',req:1},
    {k:'roomId',label:'Chambre',type:'select',req:1,readonly:stay,optsHTML:roomOptsHTML(rec.in,rec.out,rec.id,rec.roomId),span:1},
    {k:'adults',label:'Adultes',type:'number',min:1},{k:'children',label:'Enfants',type:'number',min:0},
    {k:'rate',label:'Tarif par nuit',type:'number',req:1,step:'0.01',min:0},{k:'discount',label:'Remise (%)',type:'number',min:0,step:'0.1'},
    {k:'source',label:'Source',type:'select',opts:SOURCES},{k:'notes',label:'Notes / demandes',type:'textarea',span:1}
  ];
}
function resHook(form,target){
  const g=k=>form.elements['f_'+k];if(!g('in'))return;
  const exclude=state.form&&state.form.rid;
  if(target&&target.id==='f_in'&&g('in').value&&(!g('out').value||g('out').value<=g('in').value))g('out').value=addDays(g('in').value,1);
  if(!target||target.id==='f_in'||target.id==='f_out'){
    const sel=g('roomId');
    if(!sel.disabled){const cur=sel.value;sel.innerHTML=roomOptsHTML(g('in').value,g('out').value,exclude,cur)}
    if(!g('rate').value){const rm0=byId('rooms',sel.value);if(rm0)g('rate').value=rm0.rate}
  }
  if(target&&target.id==='f_roomId'){const rm=byId('rooms',g('roomId').value);if(rm)g('rate').value=rm.rate}
  const a=g('in').value,b=g('out').value;const sm=$('#res-sum',form);
  if(sm){if(a&&b&&b>a){const n=diffDays(a,b),t=n*(+g('rate').value||0)*(1-(+g('discount').value||0)/100);sm.textContent=n+' nuit'+(n>1?'s':'')+' · hébergement : '+money(t)}else sm.textContent='Choisissez des dates valides (départ après arrivée).'}
}
function resForm(id,pre){
  const rec=id?byId('reservations',id):Object.assign({in:today(),out:addDays(today(),1),adults:1,children:0,discount:0,source:'Direct',status:'Confirmée'},pre||{});
  if(id&&!['Confirmée','En séjour'].includes(rec.status)){toast('Cette réservation ne peut plus être modifiée.','bad');return}
  const fields=resFields(rec);
  formModal({title:id?'Modifier la réservation '+rec.no:'Nouvelle réservation',fields,value:rec,wide:true,rid:id,
    extra:'<div class="sum" id="res-sum"></div>',onChange:resHook,
    onSubmit:async v=>{
      const inD=v.in||rec.in;
      if(!(v.out>inD))return 'La date de départ doit être après la date d’arrivée.';
      const roomId=v.roomId||rec.roomId;const room=byId('rooms',roomId);
      if(!room)return 'Choisissez une chambre.';
      if(!roomFree(roomId,inD,v.out,id))return 'Cette chambre est déjà réservée sur cette période.';
      let clientId=v.clientId;
      if(!clientId){if(!v.newName)return 'Choisissez un client ou saisissez le nom d’un nouveau client.';const c=put('clients',{id:uid(),name:v.newName,phone:v.newPhone});clientId=c.id}
      const cl=byId('clients',clientId);if(cl&&cl.blacklist)return 'Ce client est sur la liste noire.';
      if((+v.adults||0)+(+v.children||0)>(+room.capacity||99))toast('Attention : capacité de la chambre dépassée ('+room.capacity+').','bad');
      const out=Object.assign({},rec,{clientId,roomId,in:inD,out:v.out,adults:Math.max(1,+v.adults||1),children:+v.children||0,rate:+v.rate,discount:+v.discount||0,source:v.source,notes:v.notes});
      if(!id){const s=S();out.no='R'+String(s.resNext).padStart(4,'0');saveSettings({resNext:(+s.resNext||1)+1});out.createdAt=new Date().toISOString();out.by=state.user.name}
      put('reservations',out);logA((id?'Modification':'Nouvelle')+' réservation '+out.no+' — '+clientName(clientId)+', chambre '+room.no);toast('Réservation enregistrée');
    }});
}
ACT.newRes=()=>{if(needW('reservations'))resForm(null)};
ACT.newResAt=t=>{if(needW('reservations'))resForm(null,{in:t.dataset.d,out:addDays(t.dataset.d,1),roomId:t.dataset.room,rate:(byId('rooms',t.dataset.room)||{}).rate})};
ACT.editRes=t=>{if(needW('reservations'))resForm(t.dataset.id)};
ACT.openRes=t=>resDetail(t.dataset.id);
function resDetail(id){
  const r=byId('reservations',id);if(!r)return;const c=byId('clients',r.clientId)||{},rm=byId('rooms',r.roomId)||{},f=folio(r);
  const W=can('reservations',2);
  openModal(`${mhead('Réservation '+esc(r.no)+' '+badge(r.status))}<div class="mb"><div class="dl">
  <div><small>Client</small><b>${esc(c.name||'—')}</b>${c.vip?' '+badge('VIP','gold'):''}<br>${esc(c.phone||'')}</div>
  <div><small>Chambre</small><b>${esc(rm.no||'?')}</b> · ${esc(rm.type||'')}</div>
  <div><small>Séjour</small>${fmtDate(r.in)} → ${fmtDate(r.out)} (${f.n} nuit${f.n>1?'s':''})</div>
  <div><small>Personnes</small>${r.adults||1} adulte(s), ${r.children||0} enfant(s)</div>
  <div><small>Tarif</small>${money(r.rate)} / nuit${r.discount?' · remise '+r.discount+'%':''}</div>
  <div><small>Source</small>${esc(r.source||'')}</div>${r.payPlan?`<div><small>Règlement choisi</small>${esc({full:'Totalité',half:'Acompte',later:'À l’arrivée'}[r.payPlan]||'')}${r.payMethod?' · '+esc(r.payMethod):''}</div>`:''}</div>
  ${r.notes?`<div class="sum">${esc(r.notes)}</div>`:''}
  <div class="dl"><div><small>Total</small><b>${money(f.total)}</b></div><div><small>Payé</small><b class="pos">${money(f.paid)}</b></div><div><small>Solde</small><b class="${f.balance>0.009?'neg':''}">${money(f.balance)}</b></div></div></div>
  <footer class="mf"><button class="btn ghost" data-act="closeModal">Fermer</button>
  <button class="btn" data-act="confMsg" data-id="${r.id}">Confirmation</button>
  ${can('billing')?`<button class="btn" data-act="openFolio" data-id="${r.id}">${I('bill',16)}Facturation</button>`:''}
  ${W&&['Confirmée','En séjour'].includes(r.status)?`<button class="btn" data-act="editRes" data-id="${r.id}">${I('edit',16)}Modifier</button>`:''}
  ${W&&r.status==='Confirmée'?`<button class="btn danger" data-act="cancelRes" data-id="${r.id}">Annuler</button><button class="btn danger" data-act="noShow" data-id="${r.id}">No-show</button><button class="btn primary" data-act="checkin" data-id="${r.id}">Enregistrer l’arrivée</button>`:''}
  ${W&&r.status==='En séjour'?`<button class="btn primary" data-act="checkout" data-id="${r.id}">Enregistrer le départ</button>`:''}</footer>`,{wide:true,nofocus:true});
}
ACT.checkin=t=>{
  if(!needW('reservations'))return;
  const r=byId('reservations',t.dataset.id),room=byId('rooms',r.roomId);
  if(!room){toast('Chambre introuvable.','bad');return}
  if(room.status==='Hors service'){toast('La chambre est hors service.','bad');return}
  const o=DB.cache.reservations.find(x=>x.roomId===r.roomId&&x.status==='En séjour'&&x.id!==r.id);
  if(o){toast('La chambre est encore occupée par '+clientName(o.clientId)+'.','bad');return}
  put('reservations',Object.assign({},r,{status:'En séjour',ci:new Date().toISOString()}));
  put('rooms',Object.assign({},room,{status:'Occupée'}));
  logA('Arrivée : '+clientName(r.clientId)+', chambre '+room.no);closeModal();toast('Arrivée enregistrée');
};
function doCheckout(id){
  const r=byId('reservations',id),room=byId('rooms',r.roomId);
  put('reservations',Object.assign({},r,{status:'Terminée',co:new Date().toISOString()}));
  if(room){put('rooms',Object.assign({},room,{status:'Nettoyage'}));put('housekeeping',{id:uid(),roomId:room.id,type:'Départ',status:'À faire',date:today(),note:''})}
  logA('Départ : '+clientName(r.clientId)+', chambre '+roomNo(r.roomId));closeModal();toast('Départ enregistré — tâche de ménage créée');
}
ACT.checkout=t=>{
  if(!needW('reservations'))return;
  const r=byId('reservations',t.dataset.id),f=folio(r);
  if(f.balance>0.009)confirmDlg({title:'Solde à régler',msg:'Le client doit encore '+money(f.balance)+'.',yes:'Encaisser',alt:{label:'Départ quand même',fn:()=>doCheckout(r.id)},onYes:()=>openFolio(r.id)});
  else doCheckout(r.id);
};
ACT.cancelRes=t=>{
  const r=byId('reservations',t.dataset.id);
  confirmDlg({title:'Annuler la réservation ?',msg:'La réservation '+r.no+' sera annulée.',yes:'Annuler la réservation',danger:1,no:'Retour',onYes:()=>{put('reservations',Object.assign({},r,{status:'Annulée'}));logA('Annulation '+r.no);closeModal();toast('Réservation annulée')}});
};
ACT.noShow=t=>{
  const r=byId('reservations',t.dataset.id);
  confirmDlg({title:'Marquer No-show ?',msg:'Le client ne s’est pas présenté.',yes:'Confirmer',danger:1,no:'Retour',onYes:()=>{put('reservations',Object.assign({},r,{status:'No-show'}));logA('No-show '+r.no);closeModal();toast('Marquée No-show')}});
};
ACT.dlgYes=()=>{const d=state.dlg;closeModal();if(d&&d.onYes)d.onYes()};
ACT.dlgAlt=()=>{const d=state.dlg;closeModal();if(d&&d.alt)d.alt.fn()};
ACT.closeModal=()=>closeModal();
