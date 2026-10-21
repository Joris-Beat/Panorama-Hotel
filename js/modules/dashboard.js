/* Panorama Hotel Manager — Page Tableau de bord */
'use strict';

PAGES.dashboard=()=>{
  const t=today(),rooms=DB.cache.rooms,L=live(),total=rooms.length;
  const occ=d=>L.filter(r=>r.in<=d&&d<r.out).length;
  const arr=DB.cache.reservations.filter(r=>r.status==='Confirmée'&&r.in===t);
  const dep=DB.cache.reservations.filter(r=>r.status==='En séjour'&&r.out<=t);
  const inHouse=DB.cache.reservations.filter(r=>r.status==='En séjour').length;
  const ym=t.slice(0,7),B=can('billing');
  const cash=sum(DB.cache.payments.filter(p=>(p.date||'').startsWith(ym)),p=>p.amount);
  const due=sum(DB.cache.reservations.filter(r=>r.status==='En séjour'||r.status==='Terminée'),r=>Math.max(0,folio(r).balance));
  const cnt=s=>rooms.filter(r=>r.status===s).length;
  const days=[...Array(14)].map((_,i)=>addDays(t,i-6));
  const items=days.map(d=>({l:parse(d).toLocaleDateString('fr-FR',{weekday:'narrow'})+parse(d).getDate(),v:total?occ(d)/total*100:0,hl:d===t,t:fmtDate(d)+' : '+(total?Math.round(occ(d)/total*100):0)+'%'}));
  const al=[];
  const low=DB.cache.stock.filter(s=>+s.qty<=+s.min).length;if(low&&can('stock'))al.push(['warn',low+' article(s) de stock sous le seuil','stock']);
  const urg=DB.cache.maintenance.filter(m=>m.status!=='Résolu'&&['Haute','Urgente'].includes(m.priority)).length;if(urg&&can('maintenance'))al.push(['bad',urg+' ticket(s) de maintenance prioritaires','maintenance']);
  const hk=DB.cache.housekeeping.filter(h=>h.status!=='Terminé').length;if(hk&&can('housekeeping'))al.push(['info',hk+' tâche(s) de ménage en attente','housekeeping']);
  const lv=DB.cache.leaves.filter(l=>l.status==='En attente').length;if(lv&&can('hr'))al.push(['warn',lv+' demande(s) de congé à traiter','hr']);
  const pn=DB.cache.pending.length;if(pn&&can('billing'))al.push(['bad',pn+' paiement(s) en ligne à vérifier','billing']);
  const ev=DB.cache.events.filter(e=>e.status!=='Annulé'&&e.date>=t&&e.date<=addDays(t,7)).length;if(ev&&can('events'))al.push(['info',ev+' événement(s) dans les 7 jours','events']);
  const W=can('reservations',2);
  const list=(rows,act,lab)=>rows.length?rows.map(r=>`<div class="li"><div><b>${esc(clientName(r.clientId))}</b><small>Chambre ${esc(roomNo(r.roomId))} · ${nights(r)} nuit(s)</small></div>${W?`<button class="btn sm primary" data-act="${act}" data-id="${r.id}">${lab}</button>`:''}</div>`).join(''):'<div class="empty" style="padding:14px">Aucun.</div>';
  const rv=hBars(Object.entries(breakdown(ym+'-01',monthRange(ym).to)).map(e=>({l:e[0],v:e[1],t:money(e[1])})));
  return head('Tableau de bord',addBtn('Nouvelle réservation','newRes',can('reservations',2)?'':'hidden'),new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))+
  `<div class="kpis"><div class="kpi"><small>Taux d’occupation</small><b>${total?Math.round(occ(t)/total*100):0}%</b><em>${occ(t)} / ${total} chambres</em></div>
  <div class="kpi"><small>Arrivées du jour</small><b>${arr.length}</b><em>${inHouse} en séjour</em></div><div class="kpi"><small>Départs du jour</small><b>${dep.length}</b><em>à libérer</em></div>
  <div class="kpi"><small>Chambres disponibles</small><b>${cnt('Disponible')}</b><em>${cnt('Nettoyage')} à nettoyer · ${cnt('Hors service')} hors service</em></div>
  ${B?`<div class="kpi"><small>Encaissé ce mois</small><b>${esc(money(cash))}</b><em>paiements reçus</em></div><div class="kpi"><small>Soldes à encaisser</small><b class="${due>0?'neg':''}">${esc(money(due))}</b><em>séjours en cours et terminés</em></div>`:''}</div>
  <div class="grid2"><div class="card"><h2>Occupation — 14 jours</h2>${barChart(items)}</div>
  <div class="card"><h2>À surveiller</h2>${al.length?al.map(a=>`<button class="alert ${a[0]}" data-act="go" data-id="${a[2]}">${I('alert'===0?'x':'spark',16)}<span>${esc(a[1])}</span></button>`).join(''):'<div class="empty" style="padding:14px">Rien à signaler.</div>'}</div></div>
  <div class="grid2"><div class="card"><h2>Arrivées du jour</h2>${list(arr,'checkin','Arrivée')}</div><div class="card"><h2>Départs du jour</h2>${list(dep,'checkout','Départ')}</div></div>
  ${B||can('reports')?`<div class="card"><h2>Chiffre d’affaires du mois par activité</h2>${rv}</div>`:''}`;
};
