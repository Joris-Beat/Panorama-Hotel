/* Panorama Hotel Manager — Modules, rôles et droits d’accès */
'use strict';

const MODS=[['dashboard','Tableau de bord','dash'],['reservations','Réservations','book'],['planning','Planning','cal'],['rooms','Chambres','bed'],['clients','Clients','users'],['housekeeping','Ménage','spark'],['maintenance','Maintenance','wrench'],['billing','Facturation & caisse','bill'],['pos','Restaurant & Bar','fork'],['events','Événements','party'],['stock','Stock','box'],['suppliers','Fournisseurs','truck'],['hr','Ressources humaines','id'],['payroll','Paie & salaires','wallet'],['reports','Rapports','chart'],['users','Utilisateurs & rôles','shield'],['settings','Paramètres','gear'],['log','Journal d’activité','scroll']];
const NAVG=[['Principal',['dashboard','reservations','planning']],['Hébergement',['rooms','clients','housekeeping','maintenance']],['Finances',['billing','pos','events']],['Logistique',['stock','suppliers']],['Équipe',['hr']],['Administration',['reports','users','settings','log']]];
const P=s=>{const o={};s.split(',').forEach(x=>{const k=x.split(':');o[k[0]]=+k[1]});return o};
const DEFROLES=[
{id:'admin',name:'Administrateur',locked:true,perms:{}},
{id:'directeur',name:'Directeur',perms:P('dashboard:1,reservations:2,planning:2,rooms:2,clients:2,housekeeping:2,maintenance:2,billing:2,pos:2,events:2,stock:2,suppliers:2,hr:2,payroll:2,reports:1,users:1,settings:1,log:1')},
{id:'reception',name:'Réceptionniste',perms:P('dashboard:1,reservations:2,planning:2,rooms:1,clients:2,housekeeping:1,maintenance:1,billing:2,pos:1,events:1')},
{id:'gouvernante',name:'Gouvernante',perms:P('dashboard:1,reservations:1,planning:1,rooms:1,housekeeping:2,maintenance:2,stock:1')},
{id:'comptable',name:'Comptable',perms:P('dashboard:1,reservations:1,clients:1,billing:2,pos:1,events:1,stock:1,suppliers:1,payroll:1,reports:2')},
{id:'rh',name:'Responsable RH',perms:P('dashboard:1,hr:2,payroll:2')},
{id:'maintenance',name:'Technicien maintenance',perms:P('dashboard:1,rooms:1,maintenance:2')},
{id:'restaurant',name:'Restaurant / Bar',perms:P('dashboard:1,reservations:1,rooms:1,pos:2')},
{id:'magasinier',name:'Magasinier',perms:P('dashboard:1,stock:2,suppliers:2')}
];
const state={ready:false,view:'',user:null,page:'dashboard',tabs:{},q:{},filters:{},navOpen:false,form:null,dlg:null,planStart:null,carts:{Restaurant:[],Bar:[]},posDept:'Restaurant',hrDate:today(),cashDate:today(),payMonth:today().slice(0,7),repMonth:today().slice(0,7),shiftWeek:null,failN:0,lockUntil:0,canWrite:true};
function can(mod,lvl){
  const u=state.user;if(!u)return false;if(u.roleId==='admin')return true;
  const r=byId('roles',u.roleId);return !!r&&((r.perms||{})[mod]||0)>=(lvl||1);
}
const pageOK=p=>p==='hr'?(can('hr')||can('payroll')):can(p);
const roleName=id=>{const r=byId('roles',id);return r?r.name:'—'};
function needW(mod){if(!can(mod,2)){toast('Action non autorisée pour votre rôle.','bad');return false}return true}
async function sha(t){
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=5381;for(const ch of t)h=((h<<5)+h+ch.charCodeAt(0))|0;return 'f'+(h>>>0).toString(16)}
}
const hashPw=(pw,salt)=>sha(salt+':'+pw);
function logA(msg){
  if(DB.mode==='firebase'&&!state.user)return;
  put('log',{id:uid(),ts:new Date().toISOString(),user:state.user&&state.view!=='portal'?state.user.name:(state.view==='portal'?'Client (en ligne)':'Système'),msg});
  const L=DB.cache.log;
  if(L.length>520){L.slice().sort((a,b)=>a.ts.localeCompare(b.ts)).slice(0,60).forEach(x=>del('log',x.id))}
}
