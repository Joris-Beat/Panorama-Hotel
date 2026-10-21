/* Panorama Hotel Manager — Page Restaurant et Bar (caisse) */
'use strict';

PAGES.pos=()=>{
  const tab=state.tabs.pos||'sale',W=can('pos',2),dept=state.posDept;
  const tabs=tabsHTML('pos',[['sale','Caisse'],['orders','Commandes'],['menu','Carte']],tab);
  if(tab==='menu'){
    return head('Restaurant & Bar',W?addBtn('Nouvel article','add','data-col="menu"'):'')+tabs+table([{h:'Point de vente',c:m=>esc(m.dept)},{h:'Article',c:m=>'<b>'+esc(m.name)+'</b>'},{h:'Catégorie',c:m=>esc(m.cat||'')},{h:'Prix',cls:'num',c:m=>esc(money(m.price))},{h:'Vente',c:m=>m.active?badge('Disponible','good'):badge('Masqué','mute')},{h:'',c:m=>acts('menu',m,'pos')}],DB.cache.menu.slice().sort((a,b)=>a.dept.localeCompare(b.dept)||a.name.localeCompare(b.name)),'La carte est vide.');
  }
  if(tab==='orders'){
    const d=state.cashDate,O=DB.cache.orders.filter(o=>o.date===d).sort((a,b)=>b.ts.localeCompare(a.ts));
    return head('Restaurant & Bar')+tabs+`<div class="tools"><label class="fl"><span>Date</span><input type="date" data-date="cashDate" value="${d}"></label></div><div class="kpis"><div class="kpi"><small>Ventes du jour</small><b>${esc(money(sum(O,o=>o.total)))}</b><em>${O.length} commande(s)</em></div><div class="kpi"><small>Restaurant</small><b>${esc(money(sum(O.filter(o=>o.dept==='Restaurant'),o=>o.total)))}</b></div><div class="kpi"><small>Bar</small><b>${esc(money(sum(O.filter(o=>o.dept==='Bar'),o=>o.total)))}</b></div></div>`+
    table([{h:'Heure',c:o=>new Date(o.ts).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})},{h:'Point de vente',c:o=>esc(o.dept)},{h:'Détail',c:o=>esc(o.lines.map(l=>l.qty+'× '+l.name).join(', '))+(o.note?' <small>('+esc(o.note)+')</small>':'')},{h:'Règlement',c:o=>o.type==='Chambre'?'Sur chambre '+esc(roomNo((byId('reservations',o.resId)||{}).roomId)):esc(o.mode)},{h:'Total',cls:'num',c:o=>esc(money(o.total))},{h:'Par',c:o=>esc(o.by||'')}],O,'Aucune commande ce jour.');
  }
  const items=DB.cache.menu.filter(m=>m.active&&m.dept===dept).sort((a,b)=>(a.cat||'').localeCompare(b.cat||'')||a.name.localeCompare(b.name));
  const cart=state.carts[dept],total=sum(cart,l=>l.qty*l.price);
  return head('Restaurant & Bar')+tabs+`<div class="tools">${['Restaurant','Bar'].map(d=>`<button class="btn ${d===dept?'primary':''}" data-act="posDept" data-id="${d}">${d}</button>`).join('')}</div>
  <div class="pos-grid"><div class="items">${items.length?items.map(m=>`<button class="item" ${W?`data-act="posAdd" data-id="${m.id}"`:'disabled'}><b>${esc(m.name)}</b><span>${esc(money(m.price))}</span></button>`).join(''):'<div class="empty" style="grid-column:1/-1">Ajoutez des articles dans l’onglet « Carte ».</div>'}</div>
  <div class="card"><h2>Commande — ${dept}</h2>${cart.length?cart.map(l=>`<div class="li"><div><b>${esc(l.name)}</b><small>${esc(money(l.price))}</small></div><div class="qty"><button data-act="posDec" data-id="${l.id}" aria-label="Moins">−</button><b>${l.qty}</b><button data-act="posAdd" data-id="${l.id}" aria-label="Plus">+</button></div></div>`).join(''):'<div class="empty" style="padding:14px">Panier vide.</div>'}
  <label class="fl" style="margin-top:10px"><span>Table / note</span><input id="pos-note" value="${esc(state.posNote||'')}" data-keep="posNote" placeholder="Table 4"></label>
  <div class="tot" style="margin-top:10px"><div class="g"><span>Total</span><b>${esc(money(total))}</b></div></div>
  ${W?`<div class="tools" style="margin-top:10px"><button class="btn primary" data-act="posPay" ${cart.length?'':'disabled'}>Encaisser</button><button class="btn" data-act="posRoom" ${cart.length?'':'disabled'}>Sur une chambre</button><button class="btn ghost" data-act="posClear" ${cart.length?'':'disabled'}>Vider</button></div>`:''}</div></div>`;
};
ACT.posDept=t=>{state.posDept=t.dataset.id;renderPage()};
ACT.posAdd=t=>{if(!needW('pos'))return;const m=byId('menu',t.dataset.id),c=state.carts[state.posDept],l=c.find(x=>x.id===m.id);if(l)l.qty++;else c.push({id:m.id,name:m.name,price:+m.price,qty:1});renderPage()};
ACT.posDec=t=>{const c=state.carts[state.posDept],l=c.find(x=>x.id===t.dataset.id);if(!l)return;l.qty--;if(l.qty<=0)c.splice(c.indexOf(l),1);renderPage()};
ACT.posClear=()=>{state.carts[state.posDept]=[];renderPage()};
function posFinish(type,extra){
  const dept=state.posDept,cart=state.carts[dept],total=r2(sum(cart,l=>l.qty*l.price)),note=state.posNote||'';
  const o={id:uid(),dept,note,lines:cart.map(l=>({name:l.name,qty:l.qty,price:l.price})),total,type,date:today(),ts:new Date().toISOString(),by:state.user.name};
  Object.assign(o,extra);put('orders',o);
  if(type==='Chambre')put('charges',{id:uid(),resId:extra.resId,desc:dept+(note?' — '+note:' — commande'),dept,date:today(),qty:1,price:total,orderId:o.id});
  else addPayment({orderId:o.id,amount:total,mode:extra.mode,dept});
  state.carts[dept]=[];state.posNote='';logA('Vente '+dept+' '+money(total)+' ('+(type==='Chambre'?'sur chambre':extra.mode)+')');toast('Commande enregistrée');
}
ACT.posPay=()=>{
  if(!needW('pos'))return;const total=sum(state.carts[state.posDept],l=>l.qty*l.price);
  formModal({title:'Encaisser '+money(total),fields:[{k:'mode',label:'Mode de paiement',type:'select',opts:MODES}],submit:'Valider l’encaissement',onSubmit:v=>{posFinish('Comptant',{mode:v.mode})}});
};
ACT.posRoom=()=>{
  if(!needW('pos'))return;const stay=DB.cache.reservations.filter(r=>r.status==='En séjour');
  if(!stay.length){toast('Aucun client en séjour.','bad');return}
  formModal({title:'Imputer à une chambre',fields:[{k:'resId',label:'Chambre / client',type:'select',req:1,opts:stay.sort((a,b)=>cmpNo(roomNo(a.roomId),roomNo(b.roomId))).map(r=>[r.id,'Ch. '+roomNo(r.roomId)+' — '+clientName(r.clientId)])}],submit:'Imputer',onSubmit:v=>{posFinish('Chambre',{resId:v.resId})}});
};
