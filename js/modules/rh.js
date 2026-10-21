/* Panorama Hotel Manager — Ressources humaines : employés, présences, congés, planning, paie */
'use strict';

const weekStart=s=>addDays(s,-((parse(s).getDay()+6)%7));
PAGES.hr=()=>{
  const all=[['emp','Employés','hr'],['att','Présences','hr'],['leave','Congés','hr'],['shift','Planning','hr'],['pay','Paie','payroll']].filter(x=>can(x[2]));
  const cur=(all.find(x=>x[0]===state.tabs.hr)||all[0])[0],tabs=tabsHTML('hr',all,cur);
  const W=can('hr',2);
  if(cur==='emp'){
    const q=state.q.hr||'',rows=DB.cache.staff.filter(s=>match(q,s.name,s.role,s.dept)).sort((a,b)=>a.name.localeCompare(b.name)),P=can('payroll');
    return head('Employés',W?addBtn('Nouvel employé','add','data-col="staff"'):'')+tabs+`<div class="tools">${searchBox('hr')}</div>`+table([{h:'Nom',c:s=>'<b>'+esc(s.name)+'</b>'},{h:'Poste',c:s=>esc(s.role)},{h:'Département',c:s=>esc(s.dept)},{h:'Contrat',c:s=>esc(s.contract)},{h:'Embauche',c:s=>fmtDate(s.hired)},{h:'Statut',c:s=>badge(s.status)}].concat(P?[{h:'Salaire',cls:'num',c:s=>esc(money(s.salary))}]:[],[{h:'',c:s=>acts('staff',s,'hr')}]),rows,'Aucun employé.');
  }
  if(cur==='att'){
    const d=state.hrDate,act=DB.cache.staff.filter(s=>s.status==='Actif').sort((a,b)=>a.name.localeCompare(b.name));
    const rec=s=>byId('attendance',s.id+'_'+d)||{};
    const ym=d.slice(0,7),mr=monthRange(ym);
    const sumRows=act.map(s=>{const a=DB.cache.attendance.filter(x=>x.staffId===s.id&&x.date>=mr.from&&x.date<mr.to);const c=k=>a.filter(x=>x.status===k).length;return {s,p:c('Présent'),r:c('Retard'),a:c('Absent'),c:c('Congé')}});
    return head('Présences',W?`<button class="btn" data-act="attAll">Tous présents</button>`:'')+tabs+`<div class="tools"><label class="fl"><span>Date</span><input type="date" data-date="hrDate" value="${d}"></label></div>`+
    table([{h:'Employé',c:s=>'<b>'+esc(s.name)+'</b><small style="display:block;color:var(--muted)">'+esc(s.role)+'</small>'},{h:'Statut',c:s=>W?`<select data-att="${s.id}" data-fld="status" aria-label="Statut">${['','Présent','Retard','Absent','Congé','Repos'].map(o=>`<option value="${o}"${o===(rec(s).status||'')?' selected':''}>${o||'—'}</option>`).join('')}</select>`:badge(rec(s).status||'—')},{h:'Arrivée',c:s=>`<input type="time" data-att="${s.id}" data-fld="in" value="${esc(rec(s).in||'')}" ${W?'':'disabled'} style="width:120px">`},{h:'Départ',c:s=>`<input type="time" data-att="${s.id}" data-fld="out" value="${esc(rec(s).out||'')}" ${W?'':'disabled'} style="width:120px">`}],act,'Aucun employé actif.')+
    `<div class="card"><h2>Bilan du mois (${esc(ym)})</h2>${table([{h:'Employé',c:r=>esc(r.s.name)},{h:'Présent',cls:'num',c:r=>r.p},{h:'Retards',cls:'num',c:r=>r.r},{h:'Absences',cls:'num',c:r=>r.a},{h:'Congés',cls:'num',c:r=>r.c}],sumRows)}</div>`;
  }
  if(cur==='leave'){
    const yr=today().slice(0,4),bal=s=>(+S().annualLeave||0)-sum(DB.cache.leaves.filter(l=>l.staffId===s.id&&l.type==='Annuel'&&l.status==='Approuvé'&&l.from.startsWith(yr)),l=>diffDays(l.from,l.to)+1);
    const rows=DB.cache.leaves.slice().sort((a,b)=>b.from.localeCompare(a.from));
    return head('Congés',W?addBtn('Nouvelle demande','leaveNew'):'')+tabs+table([{h:'Employé',c:l=>'<b>'+esc(staffName(l.staffId))+'</b>'},{h:'Type',c:l=>esc(l.type)},{h:'Du',c:l=>fmtDate(l.from)},{h:'Au',c:l=>fmtDate(l.to)},{h:'Jours',cls:'num',c:l=>diffDays(l.from,l.to)+1},{h:'Statut',c:l=>badge(l.status)},{h:'',c:l=>W?`<div class="ra">${l.status==='En attente'?`<button class="btn sm primary" data-act="leaveSet" data-id="${l.id}" data-s="Approuvé">Approuver</button><button class="btn sm" data-act="leaveSet" data-id="${l.id}" data-s="Refusé">Refuser</button>`:''}<button class="ib danger" data-act="leaveDel" data-id="${l.id}" aria-label="Supprimer">${I('trash',16)}</button></div>`:''}],rows,'Aucune demande de congé.')+
    `<div class="card"><h2>Solde de congés annuels (${yr})</h2>${table([{h:'Employé',c:s=>esc(s.name)},{h:'Droit',cls:'num',c:()=>S().annualLeave},{h:'Restant',cls:'num',c:s=>bal(s)}],DB.cache.staff.filter(s=>s.status!=='Parti'))}</div>`;
  }
  if(cur==='shift'){
    const ws=state.shiftWeek||(state.shiftWeek=weekStart(today())),days=[...Array(7)].map((_,i)=>addDays(ws,i)),SH=['','Matin','Après-midi','Nuit','Repos'],ab=['','M','A','N','R'];
    const act=DB.cache.staff.filter(s=>s.status==='Actif').sort((a,b)=>a.dept.localeCompare(b.dept)||a.name.localeCompare(b.name));
    return head('Planning de l’équipe',`<button class="btn" data-act="shiftNav" data-n="-7">← Semaine</button><button class="btn" data-act="shiftNav" data-n="0">Cette semaine</button><button class="btn" data-act="shiftNav" data-n="7">Semaine →</button>`,'M = matin · A = après-midi · N = nuit · R = repos. Cliquez pour changer.')+tabs+
    `<div class="tw"><table><thead><tr><th>Employé</th>${days.map(d=>`<th class="num" style="text-align:center">${parse(d).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'})}</th>`).join('')}</tr></thead><tbody>${act.map(s=>`<tr><td><b>${esc(s.name)}</b><small style="display:block;color:var(--muted)">${esc(s.dept)}</small></td>${days.map(d=>{const r=byId('shifts',s.id+'_'+d),i=r?SH.indexOf(r.shift):0;return `<td style="text-align:center"><button class="shift s${i}" ${W?`data-act="shiftCycle" data-s="${s.id}" data-d="${d}"`:'disabled'} title="${SH[i]||'Non planifié'}">${ab[i]||'·'}</button></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  /* paie */
  const m=state.payMonth,PW=can('payroll',2),rows=DB.cache.payroll.filter(p=>p.month===m);
  const net=p=>r2((+p.base||0)+(+p.bonus||0)-(+p.deduct||0));
  return head('Paie',PW?`<button class="btn" data-act="payGen">Générer la paie</button><button class="btn" data-act="payCsv">${I('dl',16)}Export CSV</button>`:'')+tabs+`<div class="tools"><label class="fl"><span>Mois</span><input type="month" data-date="payMonth" value="${m}"></label></div><div class="kpis"><div class="kpi"><small>Masse salariale nette</small><b>${esc(money(sum(rows,net)))}</b></div><div class="kpi"><small>Déjà payé</small><b>${esc(money(sum(rows.filter(p=>p.paid),net)))}</b></div><div class="kpi"><small>Reste à payer</small><b>${esc(money(sum(rows.filter(p=>!p.paid),net)))}</b></div></div>`+
  table([{h:'Employé',c:p=>'<b>'+esc(staffName(p.staffId))+'</b>'},{h:'Base',cls:'num',c:p=>esc(money(p.base))},{h:'Primes',cls:'num',c:p=>esc(money(p.bonus))},{h:'Retenues',cls:'num',c:p=>esc(money(p.deduct))},{h:'Net',cls:'num',c:p=>'<b>'+esc(money(net(p)))+'</b>'},{h:'Statut',c:p=>p.paid?badge('Payé'):badge('À payer')},{h:'',c:p=>PW?`<div class="ra"><button class="btn sm" data-act="payEdit" data-id="${p.id}">Modifier</button><button class="btn sm ${p.paid?'':'primary'}" data-act="payToggle" data-id="${p.id}">${p.paid?'Annuler':'Marquer payé'}</button></div>`:''}],rows,'Aucune fiche pour ce mois. Cliquez sur « Générer la paie ».');
};
ACT.shiftNav=t=>{const n=+t.dataset.n;state.shiftWeek=n===0?weekStart(today()):addDays(state.shiftWeek,n);renderPage()};
ACT.shiftCycle=t=>{
  if(!needW('hr'))return;const SH=['','Matin','Après-midi','Nuit','Repos'],id=t.dataset.s+'_'+t.dataset.d,r=byId('shifts',id),i=r?SH.indexOf(r.shift):0,n=(i+1)%SH.length;
  if(n===0)del('shifts',id);else put('shifts',{id,staffId:t.dataset.s,date:t.dataset.d,shift:SH[n]});
};
ACT.attAll=()=>{if(!needW('hr'))return;const d=state.hrDate;DB.cache.staff.filter(s=>s.status==='Actif').forEach(s=>{if(!byId('attendance',s.id+'_'+d))put('attendance',{id:s.id+'_'+d,staffId:s.id,date:d,status:'Présent'})});toast('Présences enregistrées')};
ACT.leaveNew=()=>{
  if(!needW('hr'))return;
  formModal({title:'Demande de congé',fields:[{k:'staffId',label:'Employé',type:'select',req:1,opts:staffOpts()},{k:'type',label:'Type',type:'select',opts:['Annuel','Maladie','Maternité','Sans solde','Autre']},{k:'from',label:'Du',type:'date',req:1},{k:'to',label:'Au',type:'date',req:1},{k:'reason',label:'Motif',span:1}],value:{type:'Annuel',from:today(),to:today()},
   onSubmit:v=>{if(v.to<v.from)return 'La date de fin est avant le début.';put('leaves',{id:uid(),staffId:v.staffId,type:v.type,from:v.from,to:v.to,reason:v.reason,status:'En attente'});logA('Demande de congé : '+staffName(v.staffId));toast('Demande enregistrée')}});
};
ACT.leaveSet=t=>{if(!needW('hr'))return;const l=byId('leaves',t.dataset.id);put('leaves',Object.assign({},l,{status:t.dataset.s}));logA('Congé '+t.dataset.s.toLowerCase()+' : '+staffName(l.staffId))};
ACT.leaveDel=t=>{if(!needW('hr'))return;confirmDlg({title:'Supprimer la demande ?',msg:'Cette action est définitive.',yes:'Supprimer',danger:1,onYes:()=>del('leaves',t.dataset.id)})};
ACT.payGen=()=>{
  if(!needW('payroll'))return;const m=state.payMonth;let n=0;
  DB.cache.staff.filter(s=>s.status==='Actif').forEach(s=>{const id=s.id+'_'+m;if(!byId('payroll',id)){put('payroll',{id,staffId:s.id,month:m,base:+s.salary||0,bonus:0,deduct:0,paid:false});n++}});
  toast(n?n+' fiche(s) générée(s)':'Toutes les fiches existent déjà');
};
ACT.payEdit=t=>{
  if(!needW('payroll'))return;const p=byId('payroll',t.dataset.id);
  formModal({title:'Fiche de paie — '+staffName(p.staffId),fields:[{k:'base',label:'Salaire de base',type:'number',step:'0.01'},{k:'bonus',label:'Primes',type:'number',step:'0.01'},{k:'deduct',label:'Retenues',type:'number',step:'0.01'},{k:'note',label:'Note',span:1}],value:p,onSubmit:v=>{put('payroll',Object.assign({},p,v));logA('Paie modifiée : '+staffName(p.staffId))}});
};
ACT.payToggle=t=>{if(!needW('payroll'))return;const p=byId('payroll',t.dataset.id);put('payroll',Object.assign({},p,{paid:!p.paid,paidOn:p.paid?'':today()}));logA('Paie '+(p.paid?'annulée':'payée')+' : '+staffName(p.staffId))};
ACT.payCsv=()=>{const m=state.payMonth,rows=[['Employé','Poste','Base','Primes','Retenues','Net','Statut']].concat(DB.cache.payroll.filter(p=>p.month===m).map(p=>{const s=byId('staff',p.staffId)||{};return [s.name,s.role,p.base,p.bonus,p.deduct,r2(+p.base+(+p.bonus||0)-(+p.deduct||0)),p.paid?'Payé':'À payer']}));saveFile('paie-'+m+'.csv',toCSV(rows))};
