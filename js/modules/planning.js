/* Panorama Hotel Manager — Page Planning des chambres */
'use strict';

PAGES.planning=()=>{
  const N=14,t=today();if(!state.planStart)state.planStart=addDays(t,-2);
  const start=state.planStart,days=[...Array(N)].map((_,i)=>addDays(start,i));
  const rooms=DB.cache.rooms.slice().sort((a,b)=>cmpNo(a.no,b.no));
  const res=DB.cache.reservations.filter(r=>['Confirmée','En séjour','Terminée'].includes(r.status));
  const W=can('reservations',2);const cls={'Confirmée':'conf','En séjour':'stay','Terminée':'done'};
  const hd=days.map(d=>`<th class="${d===t?'tod':''}">${parse(d).toLocaleDateString('fr-FR',{weekday:'short'}).slice(0,3)}<br><b>${parse(d).getDate()}</b></th>`).join('');
  const body=rooms.map(rm=>{
    let cells='',i=0;
    while(i<N){
      const d=days[i],r=res.find(x=>x.roomId===rm.id&&x.in<=d&&d<x.out);
      if(r){const end=Math.min(N,diffDays(start,r.out)),span=Math.max(1,end-i);cells+=`<td colspan="${span}" class="pbar ${cls[r.status]}" data-act="openRes" data-id="${r.id}" title="${esc(clientName(r.clientId))} · ${fmtDate(r.in)} → ${fmtDate(r.out)}">${esc(clientName(r.clientId))}</td>`;i+=span}
      else{cells+=`<td class="pcell ${d===t?'tod':''}" ${W?`data-act="newResAt" data-room="${rm.id}" data-d="${d}"`:''}></td>`;i++}
    }
    return `<tr><td class="rn">${esc(rm.no)} <small style="color:var(--muted);font-weight:400">${esc(rm.type)}</small></td>${cells}</tr>`;
  }).join('');
  return head('Planning des chambres',`<button class="btn" data-act="planNav" data-n="-7">← 7 j</button><button class="btn" data-act="planNav" data-n="0">Aujourd’hui</button><button class="btn" data-act="planNav" data-n="7">7 j →</button>`,'Cliquez sur une case libre pour créer une réservation.')+
  (rooms.length?`<div class="tw"><table class="plan"><thead><tr><th class="rn">Chambre</th>${hd}</tr></thead><tbody>${body}</tbody></table></div>`:'<div class="empty">Ajoutez d’abord des chambres.</div>')+
  `<div class="tools"><span class="bdg info">Confirmée</span><span class="bdg good">En séjour</span><span class="bdg mute">Terminée</span></div>`;
};
ACT.planNav=t=>{const n=+t.dataset.n;state.planStart=n===0?addDays(today(),-2):addDays(state.planStart,n);renderPage()};
