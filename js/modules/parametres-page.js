/* Panorama Hotel Manager — Page Paramètres, sauvegarde et journal d’activité */
'use strict';

PAGES.settings=()=>{
  const W=can('settings',2),s=S();
  const F=[{k:'hotel',label:'Nom de l’hôtel',req:1},{k:'address',label:'Adresse'},{k:'phone',label:'Téléphone'},{k:'email',label:'E-mail'},{k:'taxId',label:'Identifiant fiscal / RCCM'},{k:'currency',label:'Devise',req:1},{k:'tva',label:'TVA incluse dans les prix (%)',type:'number',step:'0.01',min:0,hint:'Les tarifs sont saisis TTC ; la TVA est affichée sur la facture.'},{k:'touristTax',label:'Taxe de séjour (par personne et par nuit)',type:'number',step:'0.01',min:0},{k:'checkin',label:'Heure d’arrivée',type:'time'},{k:'checkout',label:'Heure de départ',type:'time'},{k:'roomTypes',label:'Types de chambre (séparés par des virgules)',span:1},{k:'invoicePrefix',label:'Préfixe des factures'},{k:'annualLeave',label:'Congés annuels (jours)',type:'number',min:0},{k:'onlineEnabled',label:'Activer la réservation en ligne (espace client)',type:'checkbox',span:1},{k:'allowLater',label:'Autoriser « payer à l’arrivée » (dette) en ligne',type:'checkbox',span:1},{k:'depositPct',label:'Acompte en ligne (%)',type:'number',min:1},{k:'momoInfo',label:'Instructions Mobile money (numéro, bénéficiaire)',span:1},{k:'bankInfo',label:'Coordonnées bancaires pour virement',span:1},{k:'onlineTerms',label:'Conditions affichées aux clients',type:'textarea',span:1}].map(f=>Object.assign(f,{readonly:!W}));
  return head('Paramètres')+`<form class="card" data-form="settings" novalidate><div class="gf">${F.map(f=>fld(f,s[f.k])).join('')}</div><div class="ferr" role="alert"></div>${W?'<div class="tools" style="margin-top:12px"><button class="btn primary">Enregistrer</button></div>':''}</form>`+
  `<div class="card"><h2>Espace client</h2><p style="color:var(--muted);margin-top:0">Les clients réservent depuis la page de connexion (« Réserver une chambre »). Pour leur envoyer un lien direct, ajoutez <b>#reserver</b> à la fin de l’adresse de cette application. Chaque réservation reçoit un code (ex. R0012) enregistré ici ; les paiements Mobile money et virement apparaissent dans « Facturation & caisse » pour validation.</p><div class="tools"><button class="btn" data-act="portalOpen">Ouvrir l’espace client</button>${DB.mode==='firebase'&&can('settings',2)?`<button class="btn" data-act="resync">Resynchroniser disponibilités et suivi</button>`:''}</div></div>`+
  (can('settings',2)?`<div class="card"><h2>Sauvegarde & données</h2><p style="color:var(--muted);margin-top:0">Exportez régulièrement une copie de vos données. L’import fusionne les enregistrements par identifiant.</p><div class="tools"><button class="btn" data-act="backup">${I('dl',16)}Exporter une sauvegarde (JSON)</button><label class="btn">Importer une sauvegarde<input type="file" accept="application/json,.json" data-import="1" hidden></label><button class="btn danger" data-act="wipe">Réinitialiser toutes les données</button></div></div>`:'');
};
FORMS.settings=form=>{
  if(!needW('settings'))return;const fields=[{k:'hotel',req:1,label:'Nom'},{k:'address'},{k:'phone'},{k:'email'},{k:'taxId'},{k:'currency',req:1,label:'Devise'},{k:'tva',type:'number'},{k:'touristTax',type:'number'},{k:'checkin'},{k:'checkout'},{k:'roomTypes'},{k:'invoicePrefix'},{k:'annualLeave',type:'number'},{k:'onlineEnabled',type:'checkbox'},{k:'allowLater',type:'checkbox'},{k:'depositPct',type:'number'},{k:'momoInfo'},{k:'bankInfo'},{k:'onlineTerms'}];
  const r=collect(form,fields);if(r.errs.length){$('.ferr',form).textContent='Champs obligatoires : '+r.errs.join(', ');return}
  saveSettings(r.out);logA('Paramètres modifiés');renderChrome();toast('Paramètres enregistrés');
};
ACT.resync=async()=>{
  if(!needW('settings'))return;let n=0;
  for(const r of DB.cache.reservations.slice()){try{await syncRes(r);n++}catch(e){writeErr(e);return}}
  toast(n+' réservation(s) synchronisée(s)');
};
ACT.backup=()=>{const d={};COLS.forEach(c=>{d[c]=DB.cache[c]});saveFile('sauvegarde-'+today()+'.json',JSON.stringify({app:'panorama-hotel-manager',version:1,exported:new Date().toISOString(),data:d}))};
async function importData(file){
  let j;try{j=JSON.parse(await file.text())}catch(e){toast('Fichier illisible.','bad');return}
  if(!j||!j.data){toast('Ce fichier n’est pas une sauvegarde valide.','bad');return}
  const n=sum(COLS,c=>Array.isArray(j.data[c])?j.data[c].length:0);
  confirmDlg({title:'Importer la sauvegarde ?',msg:n+' enregistrements seront fusionnés (les identifiants existants sont remplacés).',yes:'Importer',onYes:async()=>{
    let i=0;for(const c of COLS){if(DB.mode==='firebase'&&(c==='users'||c==='roles'))continue;for(const rec of (j.data[c]||[])){if(rec&&rec.id){put(c,rec);if(++i%12===0)await sleep(40)}}}
    toast('Import terminé : '+i+' enregistrements');logA('Import de sauvegarde ('+i+')');
  }});
}
ACT.wipe=()=>{
  if(!needW('settings')||state.user.roleId!=='admin'){toast('Réservé à l’administrateur.','bad');return}
  formModal({title:'Réinitialiser toutes les données',fields:[{k:'word',label:'Tapez SUPPRIMER pour confirmer',req:1}],submit:'Tout supprimer',extra:'<div class="sum">Toutes les données (réservations, clients, utilisateurs…) seront effacées. Exportez une sauvegarde avant.</div>',
   onSubmit:async v=>{
     if(v.word!=='SUPPRIMER')return 'Saisissez exactement SUPPRIMER.';
     if(DB.mode==='firebase'){
       try{for(const c of COLS){if(['users','roles','settings'].includes(c))continue;await wipeCol(c)}await wipeCol('nights');await wipeCol('track')}catch(e){return 'Suppression incomplète : '+(e&&e.message||e)}
       toast('Données supprimées (comptes, rôles et paramètres conservés).');return;
     }
     let i=0;for(const c of COLS){for(const rec of DB.cache[c].slice()){del(c,rec.id);if(++i%12===0)await sleep(40)}}
     lsDel('ph_sess');ssDel('ph_sess');state.user=null;state.view='';closeModal();render(true);
   }});
};
PAGES.log=()=>{
  const q=state.q.log||'',rows=DB.cache.log.slice().sort((a,b)=>b.ts.localeCompare(a.ts)).filter(l=>match(q,l.user,l.msg)).slice(0,300);
  return head('Journal d’activité',null,'Les 300 dernières actions.')+`<div class="tools">${searchBox('log')}</div>`+table([{h:'Date',c:l=>fmtTs(l.ts)},{h:'Utilisateur',c:l=>esc(l.user)},{h:'Action',c:l=>esc(l.msg)}],rows,'Journal vide.');
};
