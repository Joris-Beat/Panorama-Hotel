/* Panorama Hotel Manager — Paramètres de l’hôtel (devise, TVA, etc.) */
'use strict';

const DEF_SET={hotel:'Panorama Hotel',address:'',phone:'',email:'',taxId:'',currency:'USD',tva:0,touristTax:0,checkin:'14:00',checkout:'12:00',roomTypes:'Standard,Supérieure,Suite,Familiale',invoicePrefix:'FAC',invoiceNext:1,resNext:1,annualLeave:18,onlineEnabled:true,allowLater:true,depositPct:50,momoInfo:'',bankInfo:'',onlineTerms:'Annulation gratuite jusqu’à 48 h avant l’arrivée. L’acompte n’est pas remboursable en cas d’absence.'};
const S=()=>Object.assign({},DEF_SET,DB.cache.settings.find(x=>x.id==='main')||{});
function saveSettings(p){put('settings',Object.assign({},S(),p,{id:'main'}))}
const money=n=>NF.format(r2(n))+' '+S().currency;
const roomTypes=()=>S().roomTypes.split(',').map(x=>x.trim()).filter(Boolean);
