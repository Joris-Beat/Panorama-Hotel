/* Panorama Hotel Manager — Pages Stock et Fournisseurs */
'use strict';

PAGES.stock=()=>{
  const tab=state.tabs.stock||'items',W=can('stock',2),q=state.q.stock||'',tabs=tabsHTML('stock',[['items','Articles'],['moves','Mouvements']],tab);
  if(tab==='moves'){
    const M=DB.cache.stockMoves.slice().sort((a,b)=>b.ts.localeCompare(a.ts)).slice(0,200);
    return head('Stock')+tabs+table([{h:'Date',c:m=>fmtTs(m.ts)},{h:'Article',c:m=>esc((byId('stock',m.itemId)||{}).name||'—')},{h:'Type',c:m=>badge(m.type,m.type==='Entrée'?'good':'warn')},{h:'Qté',cls:'num',c:m=>esc(m.qty)},{h:'Fournisseur',c:m=>esc((byId('suppliers',m.supplierId)||{}).name||'')},{h:'Note',c:m=>esc(m.note||'')},{h:'Par',c:m=>esc(m.by||'')}],M,'Aucun mouvement.');
  }
  const rows=DB.cache.stock.filter(s=>match(q,s.name,s.cat)).sort((a,b)=>a.name.localeCompare(b.name));
  const val=sum(DB.cache.stock,s=>s.qty*s.cost),low=DB.cache.stock.filter(s=>+s.qty<=+s.min).length;
  return head('Stock',W?addBtn('Nouvel article','add','data-col="stock"'):'')+tabs+`<div class="kpis"><div class="kpi"><small>Valeur du stock</small><b>${esc(money(val))}</b></div><div class="kpi"><small>Articles</small><b>${DB.cache.stock.length}</b></div><div class="kpi"><small>Sous le seuil</small><b class="${low?'neg':''}">${low}</b></div></div><div class="tools">${searchBox('stock')}</div>`+
  table([{h:'Article',c:s=>'<b>'+esc(s.name)+'</b>'},{h:'Catégorie',c:s=>esc(s.cat)},{h:'En stock',cls:'num',c:s=>esc(NF.format(s.qty))+' '+esc(s.unit||'')},{h:'Seuil',cls:'num',c:s=>esc(s.min)},{h:'État',c:s=>+s.qty<=+s.min?badge('Réapprovisionner','bad'):badge('OK','good')},{h:'Fournisseur',c:s=>esc((byId('suppliers',s.supplierId)||{}).name||'—')},
   {h:'',c:s=>acts('stock',s,'stock',W?`<button class="btn sm" data-act="stIn" data-id="${s.id}">+ Entrée</button><button class="btn sm" data-act="stOut" data-id="${s.id}">− Sortie</button>`:'')}],rows,'Aucun article.');
};
function stockMove(id,type){
  if(!needW('stock'))return;const s=byId('stock',id);
  formModal({title:type+' — '+s.name,fields:[{k:'qty',label:'Quantité ('+(s.unit||'unité')+')',type:'number',req:1,step:'any',min:0}].concat(type==='Entrée'?[{k:'supplierId',label:'Fournisseur',type:'select',opts:DB.cache.suppliers.map(x=>[x.id,x.name]),placeholder:'—'}]:[]).concat([{k:'note',label:'Note',span:1}]),value:{supplierId:s.supplierId},
   onSubmit:v=>{
     if(!(v.qty>0))return 'Quantité invalide.';if(type==='Sortie'&&v.qty>s.qty)return 'Stock insuffisant ('+s.qty+' disponible).';
     put('stock',Object.assign({},s,{qty:r2(+s.qty+(type==='Entrée'?v.qty:-v.qty))}));
     put('stockMoves',{id:uid(),itemId:s.id,type,qty:v.qty,supplierId:v.supplierId||'',note:v.note,ts:new Date().toISOString(),by:state.user.name});
     const M=DB.cache.stockMoves;if(M.length>600)M.slice().sort((a,b)=>a.ts.localeCompare(b.ts)).slice(0,80).forEach(m=>del('stockMoves',m.id));
     logA(type+' stock : '+s.name+' ×'+v.qty);toast('Mouvement enregistré');
   }});
}
ACT.stIn=t=>stockMove(t.dataset.id,'Entrée');ACT.stOut=t=>stockMove(t.dataset.id,'Sortie');
PAGES.suppliers=()=>{
  const q=state.q.suppliers||'',rows=DB.cache.suppliers.filter(s=>match(q,s.name,s.category,s.contact)).sort((a,b)=>a.name.localeCompare(b.name));
  return head('Fournisseurs',can('suppliers',2)?addBtn('Nouveau fournisseur','add','data-col="suppliers"'):'')+`<div class="tools">${searchBox('suppliers')}</div>`+table([{h:'Fournisseur',c:s=>'<b>'+esc(s.name)+'</b>'},{h:'Catégorie',c:s=>esc(s.category||'')},{h:'Contact',c:s=>esc(s.contact||'')},{h:'Téléphone',c:s=>esc(s.phone||'')},{h:'E-mail',c:s=>esc(s.email||'')},{h:'Paiement',c:s=>esc(s.terms||'')},{h:'Articles',cls:'num',c:s=>DB.cache.stock.filter(x=>x.supplierId===s.id).length},{h:'',c:s=>acts('suppliers',s,'suppliers')}],rows,'Aucun fournisseur.');
};
