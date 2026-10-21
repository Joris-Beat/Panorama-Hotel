/* Panorama Hotel Manager — Données de démonstration */
'use strict';

function seedDemo(){
  const t=today();
  const R={};[['101','Standard',1,2,45],['102','Standard',1,2,45],['103','Standard',1,2,45],['104','Standard',1,3,55],['201','Supérieure',2,2,70],['202','Supérieure',2,2,70],['203','Supérieure',2,3,80],['204','Supérieure',2,3,80],['301','Suite',3,4,140],['302','Suite',3,4,140],['303','Familiale',3,5,110],['304','Familiale',3,5,110]].forEach(a=>{R[a[0]]=put('rooms',{id:uid(),no:a[0],type:a[1],floor:a[2],capacity:a[3],rate:a[4],status:'Disponible',amenities:'Climatisation, Wi-Fi, TV'})});
  const C=['Aline Mukendi','Patrick Kabongo','Sarah Dupont','John Smith','Grace Ilunga','Société Katanga Services'].map((n,i)=>put('clients',{id:uid(),name:n,phone:'+243 81 000 00'+(10+i),nationality:i===2?'Française':i===3?'Britannique':'Congolaise',vip:i===5}));
  const mk=(c,room,a,b,st,extra)=>put('reservations',Object.assign({id:uid(),clientId:C[c].id,roomId:R[room].id,in:addDays(t,a),out:addDays(t,b),adults:2,children:0,rate:R[room].rate,discount:0,source:'Direct',status:st,createdAt:new Date().toISOString(),by:'Démo'},extra||{}));
  const r1=mk(0,'201',-2,1,'En séjour',{no:'R0001'}),r2=mk(1,'301',-1,2,'En séjour',{no:'R0002'});
  mk(2,'102',0,2,'Confirmée',{no:'R0003'});mk(3,'202',1,4,'Confirmée',{no:'R0004',source:'Booking.com'});
  const r5=mk(4,'104',-6,-3,'Terminée',{no:'R0005'});mk(5,'303',3,5,'Confirmée',{no:'R0006',source:'Entreprise'});const r7=mk(0,'101',-12,-10,'Terminée',{no:'R0007'});
  put('rooms',Object.assign({},R['201'],{status:'Occupée'}));put('rooms',Object.assign({},R['301'],{status:'Occupée'}));put('rooms',Object.assign({},R['103'],{status:'Nettoyage'}));put('rooms',Object.assign({},R['203'],{status:'Hors service'}));
  put('payments',{id:uid(),resId:r1.id,amount:100,mode:'Espèces',date:addDays(t,-2),by:'Démo'});
  [r5,r7].forEach(r=>{const f=folio(r);put('payments',{id:uid(),resId:r.id,amount:f.total,mode:'Carte bancaire',date:r.out,by:'Démo'})});
  put('charges',{id:uid(),resId:r1.id,desc:'Dîner restaurant',dept:'Restaurant',date:addDays(t,-1),qty:1,price:32});
  put('charges',{id:uid(),resId:r2.id,desc:'Blanchisserie',dept:'Blanchisserie',date:t,qty:3,price:4});
  put('housekeeping',{id:uid(),roomId:R['103'].id,type:'Départ',status:'À faire',date:t,note:''});
  put('maintenance',{id:uid(),title:'Climatiseur en panne',roomId:R['203'].id,priority:'Haute',status:'En cours',opened:addDays(t,-1),blocks:true,description:'Ne refroidit plus.'});
  [['Restaurant','Petit-déjeuner continental','Matin',8],['Restaurant','Poulet braisé et riz','Plats',14],['Restaurant','Poisson grillé','Plats',16],['Restaurant','Salade composée','Entrées',9],['Restaurant','Pizza margherita','Plats',12],['Restaurant','Café','Boissons',3],['Bar','Bière locale','Bières',3],['Bar','Soda','Softs',2],['Bar','Eau minérale','Softs',1.5],['Bar','Cocktail maison','Cocktails',7],['Bar','Jus frais','Softs',3.5],['Bar','Whisky','Spiritueux',8]].forEach(a=>put('menu',{id:uid(),dept:a[0],name:a[1],cat:a[2],price:a[3],active:true}));
  const S1=put('suppliers',{id:uid(),name:'Grossiste Alimentaire Lubumbashi',category:'Alimentation',contact:'M. Kalala',phone:'+243 99 000 0001',terms:'30 jours'});
  const S2=put('suppliers',{id:uid(),name:'Linge & Hôtellerie SARL',category:'Linge',contact:'Mme Banza',phone:'+243 99 000 0002',terms:'À la livraison'});
  [['Savon (pack)','Ménage','pack',40,15,2.5,S2],['Draps 2 places','Linge','pièce',30,10,12,S2],['Serviettes de bain','Linge','pièce',8,12,6,S2],['Bière locale (casier)','Bar','casier',20,6,18,S1],['Eau minérale (pack)','Bar','pack',35,10,4,S1],['Produit d’entretien','Ménage','L',18,8,3.2,S2]].forEach(a=>put('stock',{id:uid(),name:a[0],cat:a[1],unit:a[2],qty:a[3],min:a[4],cost:a[5],supplierId:a[6].id}));
  [['Marie Tshala','Réceptionniste','Réception',450],['Jean-Paul Mbuyi','Gouvernant','Ménage',420],['Esther Kasongo','Femme de chambre','Ménage',300],['David Ngoy','Serveur','Restaurant',320],['Rachel Mulumba','Cuisinière','Cuisine',380],['Samuel Kyungu','Technicien','Maintenance',400]].forEach(a=>put('staff',{id:uid(),name:a[0],role:a[1],dept:a[2],salary:a[3],contract:'CDI',hired:addDays(t,-400),status:'Actif'}));
  put('events',{id:uid(),title:'Mariage Mukendi',clientName:'Aline Mukendi',hall:'Salle de fêtes',date:addDays(t,12),start:'15:00',end:'23:00',pax:120,price:2400,status:'Confirmé'});
  saveSettings({resNext:8});
}
