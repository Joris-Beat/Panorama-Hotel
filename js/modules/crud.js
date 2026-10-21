/* Panorama Hotel Manager — Formulaires génériques (clients, chambres, stock, etc.) */
'use strict';

const ACT={},FORMS={},PAGES={};
const DEPT_STAFF=['Réception','Ménage','Restaurant','Bar','Cuisine','Maintenance','Sécurité','Administration','Direction'];
const staffOpts=()=>DB.cache.staff.filter(s=>s.status!=='Parti').sort((a,b)=>a.name.localeCompare(b.name)).map(s=>[s.id,s.name]);
const roomOpts=()=>DB.cache.rooms.slice().sort((a,b)=>cmpNo(a.no,b.no)).map(r=>[r.id,r.no+' — '+r.type]);
const CRUD={
clients:{perm:'clients',add:'Nouveau client',edit:'Modifier le client',title:r=>r.name,wide:true,
  fields:()=>[{k:'name',label:'Nom complet',req:1,span:1},{k:'phone',label:'Téléphone',type:'tel'},{k:'email',label:'E-mail',type:'email'},{k:'nationality',label:'Nationalité'},{k:'idType',label:'Pièce d’identité',type:'select',opts:['Passeport','Carte d’identité','Permis de conduire','Carte d’électeur','Autre'],placeholder:'—'},{k:'idNo',label:'N° de pièce'},{k:'birth',label:'Date de naissance',type:'date'},{k:'company',label:'Société'},{k:'address',label:'Adresse',span:1},{k:'vip',label:'Client VIP',type:'checkbox'},{k:'blacklist',label:'Liste noire (réservation bloquée)',type:'checkbox'},{k:'notes',label:'Notes',type:'textarea',span:1}],
  canDelete:r=>DB.cache.reservations.some(x=>x.clientId===r.id)?'Ce client a des réservations : suppression impossible.':null},
rooms:{perm:'rooms',add:'Nouvelle chambre',edit:'Modifier la chambre',title:r=>'Chambre '+r.no,
  defaults:()=>({status:'Disponible',capacity:2,floor:1}),
  fields:()=>[{k:'no',label:'Numéro',req:1},{k:'type',label:'Type',type:'select',opts:roomTypes(),req:1},{k:'floor',label:'Étage'},{k:'capacity',label:'Capacité (personnes)',type:'number',min:1},{k:'rate',label:'Tarif par nuit',type:'number',req:1,step:'0.01',min:0},{k:'status',label:'Statut',type:'select',opts:['Disponible','Occupée','Nettoyage','Hors service']},{k:'amenities',label:'Équipements',span:1},{k:'notes',label:'Notes',type:'textarea',span:1}],
  validate:(v,rec)=>DB.cache.rooms.some(x=>x.id!==rec.id&&String(x.no)===String(v.no))?'Ce numéro de chambre existe déjà.':null,
  canDelete:r=>DB.cache.reservations.some(x=>x.roomId===r.id)?'Cette chambre a des réservations : suppression impossible.':null},
suppliers:{perm:'suppliers',add:'Nouveau fournisseur',edit:'Modifier le fournisseur',title:r=>r.name,
  fields:()=>[{k:'name',label:'Raison sociale',req:1},{k:'category',label:'Catégorie'},{k:'contact',label:'Personne de contact'},{k:'phone',label:'Téléphone',type:'tel'},{k:'email',label:'E-mail',type:'email'},{k:'terms',label:'Conditions de paiement'},{k:'address',label:'Adresse',span:1},{k:'notes',label:'Notes',type:'textarea',span:1}],
  canDelete:r=>DB.cache.stock.some(x=>x.supplierId===r.id)?'Des articles de stock sont liés à ce fournisseur.':null},
menu:{perm:'pos',add:'Nouvel article',edit:'Modifier l’article',title:r=>r.name,defaults:()=>({dept:'Restaurant',active:true}),
  fields:()=>[{k:'dept',label:'Point de vente',type:'select',opts:['Restaurant','Bar']},{k:'name',label:'Article',req:1},{k:'cat',label:'Catégorie'},{k:'price',label:'Prix (TTC)',type:'number',req:1,step:'0.01',min:0},{k:'active',label:'Disponible à la vente',type:'checkbox'}]},
stock:{perm:'stock',add:'Nouvel article',edit:'Modifier l’article',title:r=>r.name,defaults:()=>({cat:'Ménage',unit:'pièce',qty:0,min:0}),
  fields:rec=>[{k:'name',label:'Article',req:1},{k:'cat',label:'Catégorie',type:'select',opts:['Ménage','Linge','Cuisine','Bar','Minibar','Maintenance','Bureau','Autre']},{k:'unit',label:'Unité'},{k:'qty',label:rec&&rec.id?'Quantité en stock (via mouvements)':'Quantité initiale',type:'number',step:'any',readonly:!!(rec&&rec.id)},{k:'min',label:'Seuil d’alerte',type:'number',step:'any',min:0},{k:'cost',label:'Coût unitaire',type:'number',step:'0.01',min:0},{k:'supplierId',label:'Fournisseur habituel',type:'select',opts:DB.cache.suppliers.map(s=>[s.id,s.name]),placeholder:'—',span:1}]},
staff:{perm:'hr',add:'Nouvel employé',edit:'Modifier l’employé',title:r=>r.name,wide:true,defaults:()=>({status:'Actif',contract:'CDI',hired:today(),dept:'Réception'}),
  fields:()=>[{k:'name',label:'Nom complet',req:1},{k:'role',label:'Poste',req:1},{k:'dept',label:'Département',type:'select',opts:DEPT_STAFF},{k:'contract',label:'Contrat',type:'select',opts:['CDI','CDD','Stage','Journalier']},{k:'hired',label:'Date d’embauche',type:'date'},{k:'status',label:'Statut',type:'select',opts:['Actif','En congé','Suspendu','Parti']},{k:'phone',label:'Téléphone',type:'tel'},{k:'email',label:'E-mail',type:'email'},{k:'idNo',label:'N° de pièce d’identité'},{k:'emergency',label:'Contact d’urgence'}].concat(can('payroll')?[{k:'salary',label:'Salaire mensuel de base',type:'number',step:'0.01',min:0,readonly:!can('payroll',2)}]:[],[{k:'address',label:'Adresse',span:1},{k:'notes',label:'Notes',type:'textarea',span:1}])},
events:{perm:'events',add:'Nouvel événement',edit:'Modifier l’événement',title:r=>r.title,wide:true,defaults:()=>({status:'Option',hall:'Salle de fêtes',date:today(),pax:50}),
  fields:()=>[{k:'title',label:'Intitulé',req:1},{k:'clientName',label:'Client / organisateur',req:1},{k:'phone',label:'Téléphone',type:'tel'},{k:'hall',label:'Espace',type:'select',opts:['Salle de conférence','Salle de fêtes','Jardin','Terrasse','Restaurant','Autre']},{k:'date',label:'Date',type:'date',req:1},{k:'start',label:'Début',type:'time'},{k:'end',label:'Fin',type:'time'},{k:'pax',label:'Nombre de personnes',type:'number',min:1},{k:'price',label:'Prix total',type:'number',req:1,step:'0.01',min:0},{k:'status',label:'Statut',type:'select',opts:['Option','Confirmé','Terminé','Annulé']},{k:'notes',label:'Notes',type:'textarea',span:1}]},
housekeeping:{perm:'housekeeping',add:'Nouvelle tâche',edit:'Modifier la tâche',title:r=>'Tâche chambre '+roomNo(r.roomId),defaults:()=>({status:'À faire',type:'Nettoyage profond',date:today()}),
  fields:()=>[{k:'roomId',label:'Chambre',type:'select',opts:roomOpts(),req:1},{k:'type',label:'Type',type:'select',opts:['Départ','Recouche','Contrôle','Nettoyage profond']},{k:'assignee',label:'Assignée à',type:'select',opts:staffOpts(),placeholder:'—'},{k:'date',label:'Date',type:'date'},{k:'status',label:'Statut',type:'select',opts:['À faire','En cours','Terminé']},{k:'note',label:'Note',type:'textarea',span:1}]},
maintenance:{perm:'maintenance',add:'Nouveau ticket',edit:'Modifier le ticket',title:r=>r.title,wide:true,defaults:()=>({status:'Ouvert',priority:'Normale',opened:today()}),
  fields:()=>[{k:'title',label:'Problème',req:1,span:1},{k:'roomId',label:'Chambre concernée',type:'select',opts:roomOpts(),placeholder:'— Aucune —'},{k:'place',label:'Lieu (si pas une chambre)'},{k:'priority',label:'Priorité',type:'select',opts:['Basse','Normale','Haute','Urgente']},{k:'status',label:'Statut',type:'select',opts:['Ouvert','En cours','Résolu']},{k:'assignee',label:'Technicien',type:'select',opts:staffOpts(),placeholder:'—'},{k:'opened',label:'Signalé le',type:'date'},{k:'cost',label:'Coût de réparation',type:'number',step:'0.01',min:0},{k:'blocks',label:'Mettre la chambre hors service',type:'checkbox',span:1},{k:'description',label:'Détails',type:'textarea',span:1}],
  prep:(out,old)=>{
    if(out.status==='Résolu'&&!out.resolved)out.resolved=today();
    const blockingBefore=old&&old.blocks&&old.status!=='Résolu';
    const rm=out.roomId&&byId('rooms',out.roomId);
    if(rm){
      if(out.blocks&&out.status!=='Résolu')put('rooms',Object.assign({},rm,{status:'Hors service'}));
      else if((blockingBefore||!out.blocks)&&rm.status==='Hors service'&&!DB.cache.maintenance.some(t=>t.id!==out.id&&t.roomId===rm.id&&t.blocks&&t.status!=='Résolu'))put('rooms',Object.assign({},rm,{status:'Nettoyage'}));
    }
  }}
};
function crudForm(col,id){
  const cfg=CRUD[col];if(!needW(cfg.perm))return;
  const rec=id?byId(col,id):(cfg.defaults?cfg.defaults():{});
  formModal({title:id?cfg.edit:cfg.add,fields:cfg.fields(rec),value:rec,wide:cfg.wide,onSubmit:async v=>{
    const err=cfg.validate&&cfg.validate(v,rec);if(err)return err;
    const out=Object.assign({},rec,v);if(cfg.prep)cfg.prep(out,id?rec:null);
    put(col,out);logA((id?'Modification : ':'Création : ')+cfg.title(out));toast('Enregistré');
  }});
}
ACT.add=t=>crudForm(t.dataset.col);
ACT.edit=t=>crudForm(t.dataset.col,t.dataset.id);
ACT.del=t=>{
  const col=t.dataset.col,cfg=CRUD[col];if(!needW(cfg.perm))return;
  const rec=byId(col,t.dataset.id);if(!rec)return;
  const why=cfg.canDelete&&cfg.canDelete(rec);if(why){toast(why,'bad');return}
  confirmDlg({title:'Supprimer ?',msg:'« '+cfg.title(rec)+' » sera supprimé définitivement.',yes:'Supprimer',danger:1,onYes:()=>{del(col,rec.id);logA('Suppression : '+cfg.title(rec));toast('Supprimé')}});
};
