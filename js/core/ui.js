/* Panorama Hotel Manager — Éléments d’interface : icônes, fenêtres, formulaires, tableaux */
'use strict';

const IC={
dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
bed:'<path d="M3 18V6M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-8v3"/><circle cx="7" cy="10" r="1.5"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c1.9.6 3.1 2.3 3.5 5.2"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23"/>',
wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3z"/><path d="M14.7 6.3l2.5-2.5"/>',
bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
fork:'<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7M7 7h4M17 3c-2 2-3 5-3 8h3v10"/>',
party:'<path d="M4 20l4-12 8 8z"/><path d="M14 4l1 2M18 8l2 1M17 3v2"/>',
box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
truck:'<path d="M2 6h11v10H2zM13 10h4l4 3v3h-8"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M15 10h3M15 13h3"/>',
wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.2"/>',
chart:'<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
scroll:'<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7z"/><path d="M10 9h6M10 13h6M10 17h3"/>',
out:'<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
hotel:'<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M2 21h20M8 8h3M8 12h3M8 16h3"/>',
dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'
};
const I=(n,s)=>`<svg width="${s||18}" height="${s||18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;
/* logo et photo de connexion personnalisés (voir config.js : window.PH_BRAND) */
const BR={logo:'',photo:''};
const logoInner=()=>BR.logo?`<img src="${esc(BR.logo)}" alt="">`:I('hotel',20);
const photoStyle=()=>BR.photo?'background-image:linear-gradient(170deg,rgba(7,20,23,.72) 0%,rgba(7,20,23,.2) 45%,rgba(7,20,23,.8) 100%),url("'+BR.photo.replace(/["\\]/g,'')+'")':'';
const logoHTML=()=>`<span class="logo${BR.logo?' img':''}">${logoInner()}</span>`;
function brandInit(){
  const b=window.PH_BRAND||{};
  const load=(src,ok)=>{if(!src)return;const im=new Image();im.onload=()=>ok(src);im.src=src};
  load(b.logo,src=>{
    BR.logo=src;
    document.querySelectorAll('.logo').forEach(el=>{el.classList.add('img');el.innerHTML=logoInner()});
    let fav=document.querySelector('link[rel="icon"]');if(!fav){fav=document.createElement('link');fav.rel='icon';document.head.appendChild(fav)}fav.href=src;
  });
  load(b.loginPhoto,src=>{
    BR.photo=src;
    document.querySelectorAll('.art').forEach(el=>{el.classList.add('photo');el.setAttribute('style',photoStyle())});
  });
}
const KIND={'Disponible':'good','Occupée':'info','Nettoyage':'warn','Hors service':'bad','Confirmée':'info','En séjour':'good','Terminée':'mute','Annulée':'bad','No-show':'bad','À faire':'warn','En cours':'info','Terminé':'good','Ouvert':'bad','Résolu':'good','Option':'warn','Confirmé':'info','Annulé':'bad','En attente':'warn','Approuvé':'good','Refusé':'bad','Actif':'good','En congé':'info','Suspendu':'warn','Parti':'mute','Basse':'mute','Normale':'info','Haute':'warn','Urgente':'bad','Présent':'good','Retard':'warn','Absent':'bad','Congé':'info','Repos':'mute','Payé':'good','À payer':'warn'};
const badge=(t,k)=>`<span class="bdg ${k||KIND[t]||'mute'}">${esc(t)}</span>`;
function toast(m,k){
  const el=document.createElement('div');el.className='toast'+(k==='bad'?' bad':'');el.setAttribute('role','status');el.textContent=m;
  $('#toast-root').appendChild(el);setTimeout(()=>el.remove(),k==='bad'?5200:2600);
}
function openModal(html,o){
  state.form=null;
  $('#modal-root').innerHTML=`<div class="scrim"><div class="modal ${o&&o.wide?'wide':''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const f=$('#modal-root input:not([type=hidden]):not([disabled]),#modal-root select:not([disabled])');if(f&&!(o&&o.nofocus))try{f.focus()}catch(e){}
}
function closeModal(){$('#modal-root').innerHTML='';state.form=null;state.dlg=null}
const mhead=t=>`<header class="mh"><h3>${t}</h3><button type="button" class="ib" data-act="closeModal" aria-label="Fermer">${I('x')}</button></header>`;
function fld(f,val){
  const id='f_'+f.k;const v=val==null?(f.def!=null?f.def:''):val;
  const at=(f.req?' required':'')+(f.readonly?' disabled':'');
  let c='';
  if(f.type==='select'){
    const body=f.optsHTML!=null?f.optsHTML:(f.placeholder!=null?`<option value="">${esc(f.placeholder)}</option>`:'')+(f.opts||[]).map(o=>{const a=Array.isArray(o)?o:[o,o];return `<option value="${esc(a[0])}"${String(a[0])===String(v)?' selected':''}>${esc(a[1])}</option>`}).join('');
    c=`<select id="${id}" name="${id}"${at}>${body}</select>`;
  }else if(f.type==='textarea')c=`<textarea id="${id}" name="${id}" rows="${f.rows||3}"${at}>${esc(v)}</textarea>`;
  else if(f.type==='checkbox')return `<label class="chk ${f.span?'s2':''}"><input type="checkbox" id="${id}" name="${id}"${v?' checked':''}${f.readonly?' disabled':''}><span>${esc(f.label)}</span></label>`;
  else c=`<input id="${id}" name="${id}" type="${f.type||'text'}" value="${esc(v)}"${f.ph?` placeholder="${esc(f.ph)}"`:''}${f.step?` step="${f.step}"`:''}${f.min!=null?` min="${f.min}"`:''}${f.ac?` autocomplete="${f.ac}"`:''}${at}>`;
  return `<label class="fl ${f.span?'s2':''}"><span>${esc(f.label)}${f.req?' *':''}</span>${c}${f.hint?`<small>${esc(f.hint)}</small>`:''}</label>`;
}
function collect(form,fields){
  const out={},errs=[];
  fields.forEach(f=>{
    if(f.readonly)return;const el=form.elements['f_'+f.k];if(!el)return;let v;
    if(f.type==='checkbox')v=el.checked;
    else if(f.type==='number'){v=el.value===''?'':parseFloat(el.value);if(v!==''&&isNaN(v))v='';if(v===''&&!f.req)v=0}
    else v=(el.value||'').trim();
    if(f.req&&(v===''||v==null))errs.push(f.label);
    out[f.k]=v;
  });
  return {out,errs};
}
function formModal(o){
  const v=o.value||{};
  openModal(`<form data-form="generic" novalidate>${mhead(esc(o.title))}<div class="mb"><div class="gf">${o.fields.map(f=>fld(f,v[f.k])).join('')}</div>${o.extra||''}<div class="ferr" role="alert"></div></div><footer class="mf"><button type="button" class="btn ghost" data-act="closeModal">Annuler</button><button class="btn primary">${esc(o.submit||'Enregistrer')}</button></footer></form>`,{wide:o.wide});
  state.form={fields:o.fields,onSubmit:o.onSubmit,onChange:o.onChange,rid:o.rid};
  if(o.onChange)o.onChange($('#modal-root form'),null);
}
function confirmDlg(o){
  state.dlg=o;
  openModal(`${mhead(esc(o.title))}<div class="mb"><p style="margin:0">${esc(o.msg)}</p></div><footer class="mf"><button class="btn ghost" data-act="closeModal">${esc(o.no||'Annuler')}</button>${o.alt?`<button class="btn" data-act="dlgAlt">${esc(o.alt.label)}</button>`:''}<button class="btn ${o.danger?'danger':'primary'}" data-act="dlgYes">${esc(o.yes||'Confirmer')}</button></footer>`,{nofocus:true});
  state.dlg=o;
}
function head(t,actions,sub){return `<div class="ph"><div><h1>${esc(t)}</h1>${sub?`<p class="sub">${sub}</p>`:''}</div><div class="pa">${actions||''}</div></div>`}
const addBtn=(label,act,extra)=>`<button class="btn primary" data-act="${act}" ${extra||''}>${I('plus',16)}<span>${esc(label)}</span></button>`;
function table(cols,rows,empty){
  if(!rows.length)return `<div class="empty">${esc(empty||'Aucun enregistrement.')}</div>`;
  return `<div class="tw"><table><thead><tr>${cols.map(c=>`<th class="${c.cls||''}">${esc(c.h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td class="${c.cls||''}">${c.c(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function acts(col,r,perm,extra){
  if(!can(perm,2))return extra?`<div class="ra">${extra}</div>`:'';
  return `<div class="ra">${extra||''}<button class="ib" data-act="edit" data-col="${col}" data-id="${r.id}" title="Modifier" aria-label="Modifier">${I('edit',16)}</button><button class="ib danger" data-act="del" data-col="${col}" data-id="${r.id}" title="Supprimer" aria-label="Supprimer">${I('trash',16)}</button></div>`;
}
const searchBox=p=>`<input type="search" id="q-${p}" data-q="${p}" placeholder="Rechercher…" value="${esc(state.q[p]||'')}" aria-label="Rechercher">`;
const filterSel=(key,opts,cur)=>`<select data-f="${key}" aria-label="Filtre">${opts.map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(cur)?' selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
function tabsHTML(page,list,cur){return `<div class="tabs" role="tablist">${list.map(t=>`<button class="tab ${t[0]===cur?'on':''}" role="tab" data-act="tab" data-page="${page}" data-tab="${t[0]}">${esc(t[1])}</button>`).join('')}</div>`}
function barChart(items,fmt){
  const max=Math.max(1,...items.map(i=>i.v));
  return `<div class="bars" role="img" aria-label="Graphique">${items.map(i=>`<div title="${esc(i.t||i.l)}"><i class="${i.hl?'hl':''}" style="height:${Math.max(1,Math.round(i.v/max*100))}%"></i></div>`).join('')}</div><div class="bl">${items.map(i=>`<span>${esc(i.l)}</span>`).join('')}</div>`;
}
function hBars(items){
  const max=Math.max(1,...items.map(i=>i.v));
  return items.map(i=>`<div class="hb"><span>${esc(i.l)}</span><span class="tr"><i style="width:${Math.round(i.v/max*100)}%"></i></span><span>${esc(i.t)}</span></div>`).join('');
}
async function saveFile(name,data){
  let dl=null;try{dl=await window.claude.use('downloads')}catch(e){}
  if(!dl){toast('Le téléchargement n’est pas disponible dans cette vue.','bad');return}
  try{await dl.save({filename:name,data})}catch(e){if(!e||e.code!=='declined')toast('Téléchargement impossible.','bad')}
}
const csvCell=v=>{const s=String(v==null?'':v);return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\n');
