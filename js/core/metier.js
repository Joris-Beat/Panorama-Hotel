/* Panorama Hotel Manager — Calculs métier : folio, disponibilité, chiffre d’affaires */
'use strict';

const roomNo=id=>{const r=byId('rooms',id);return r?r.no:'?'};
const clientName=id=>{const c=byId('clients',id);return c?c.name:'—'};
const staffName=id=>{const s=byId('staff',id);return s?s.name:'—'};
const nights=r=>Math.max(1,diffDays(r.in,r.out));
const DEAD=['Annulée','No-show'];
const live=()=>DB.cache.reservations.filter(r=>!DEAD.includes(r.status));
function folio(r){
  const s=S(),n=nights(r),act=!DEAD.includes(r.status);
  const roomTotal=act?r2(n*(+r.rate||0)*(1-(+r.discount||0)/100)):0;
  const ch=DB.cache.charges.filter(c=>c.resId===r.id);
  const chTotal=r2(sum(ch,c=>(+c.qty||0)*(+c.price||0)));
  const tax=act?r2((+s.touristTax||0)*(+r.adults||1)*n):0;
  const total=r2(roomTotal+chTotal+tax);
  const pays=DB.cache.payments.filter(p=>p.resId===r.id);
  const paid=r2(sum(pays,p=>p.amount));
  const pend=DB.cache.pending.filter(p=>p.resId===r.id),pending=r2(sum(pend,p=>p.amount));
  const t=+s.tva||0;
  return {pend,pending,n,roomTotal,chTotal,tax,total,paid,balance:r2(total-paid),tva:r2((roomTotal+chTotal)*t/(100+t)),ch,pays};
}
function roomFree(roomId,a,b,exclude){
  return !DB.cache.reservations.some(r=>r.roomId===roomId&&r.id!==exclude&&(r.status==='Confirmée'||r.status==='En séjour')&&r.in<b&&a<r.out);
}
const overlapNights=(r,from,to)=>{const a=r.in>from?r.in:from,b=r.out<to?r.out:to;return Math.max(0,diffDays(a,b))};
const roomRev=(from,to)=>sum(live(),r=>overlapNights(r,from,to)*(+r.rate||0)*(1-(+r.discount||0)/100));
function breakdown(from,to){
  const b={'Hébergement':roomRev(from,to),'Restaurant':0,'Bar':0,'Autres services':0,'Événements':0};
  DB.cache.charges.filter(c=>c.date>=from&&c.date<to).forEach(c=>{const k=(c.dept==='Restaurant'||c.dept==='Bar')?c.dept:'Autres services';b[k]+=(+c.qty||0)*(+c.price||0)});
  DB.cache.orders.filter(o=>o.type==='Comptant'&&o.date>=from&&o.date<to).forEach(o=>{b[o.dept]+=+o.total||0});
  DB.cache.events.filter(e=>e.status!=='Annulé'&&e.date>=from&&e.date<to).forEach(e=>{b['Événements']+=+e.price||0});
  return b;
}
const monthRange=ym=>{const p=ym.split('-').map(Number);return {from:ym+'-01',to:fmtISO(new Date(p[0],p[1],1))}};
const MODES=['Espèces','Carte bancaire','Mobile money','Virement','Chèque'];
const CHDEPTS=['Restaurant','Bar','Minibar','Blanchisserie','Spa & bien-être','Transport','Autre'];
