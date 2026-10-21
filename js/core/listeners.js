/* Panorama Hotel Manager — Écouteurs d’événements (clics, saisies, formulaires) */
'use strict';

document.addEventListener('click',e=>{
  const sc=e.target.closest('.scrim');if(sc&&e.target===sc){closeModal();return}
  const t=e.target.closest('[data-act]');if(!t)return;const fn=ACT[t.dataset.act];
  if(fn){e.preventDefault();try{fn(t,e)}catch(err){console.error(err);toast('Erreur : '+err.message,'bad')}}
});
document.addEventListener('submit',async e=>{
  const form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();
  const kind=form.dataset.form;
  if(kind!=='generic'){try{if(FORMS[kind])await FORMS[kind](form)}catch(err){console.error(err);const er=$('.ferr',form);if(er)er.textContent='Erreur : '+err.message}return}
  const st=state.form;if(!st)return;const er=$('.ferr',form),r=collect(form,st.fields);
  if(r.errs.length){er.textContent='Champs obligatoires : '+r.errs.join(', ');return}
  const btn=form.querySelector('button.primary');btn.disabled=true;
  try{const res=await st.onSubmit(r.out,form);if(typeof res==='string'){er.textContent=res;btn.disabled=false;return}if(state.form===st)closeModal()}
  catch(err){console.error(err);er.textContent='Erreur : '+(err&&err.message||err);btn.disabled=false}
});
document.addEventListener('input',e=>{
  const t=e.target,d=t.dataset||{};
  if(d.keep){state[d.keep]=t.value;return}
  if(d.pq&&state.portal){state.portal.q[d.pq]=t.type==='number'?(parseInt(t.value,10)||0):t.value;return}
  if(d.pf&&state.portal&&t.type!=='radio'&&t.type!=='checkbox'){state.portal.form[d.pf]=t.value;return}
  if(d.q){state.q[d.q]=t.value;renderPage()}
});
document.addEventListener('change',e=>{
  const t=e.target,d=t.dataset||{};
  if(d.f){state.filters[d.f]=t.value;renderPage();return}
  if(d.date){state[d.date]=t.value;renderPage();return}
  if(d.roomst){if(!needW('rooms'))return renderPage();const r=byId('rooms',d.roomst);put('rooms',Object.assign({},r,{status:t.value}));logA('Chambre '+r.no+' : '+t.value);return}
  if(d.att){
    if(!needW('hr'))return renderPage();const id=d.att+'_'+state.hrDate,rec=byId('attendance',id)||{id,staffId:d.att,date:state.hrDate,status:''};
    const o=Object.assign({},rec);o[d.fld]=t.value;if(d.fld!=='status'&&!o.status)o.status='Présent';put('attendance',o);return;
  }
  if(d.roleperm){
    if(!needW('users'))return renderPage();const a=d.roleperm.split('|'),r=byId('roles',a[0]);
    const perms=Object.assign({},r.perms);perms[a[1]]=+t.value;put('roles',Object.assign({},r,{perms}));logA('Permission modifiée : '+r.name+' / '+a[1]);return;
  }
  if(d.pf&&state.portal&&(t.type==='radio'||t.type==='checkbox')){state.portal.form[d.pf]=t.type==='checkbox'?t.checked:t.value;if(t.type==='radio')pRender();return}
  if(d.import){const f=t.files&&t.files[0];t.value='';if(f)importData(f);return}
  const form=t.closest('form[data-form="generic"]');
  if(form&&state.form&&state.form.onChange)state.form.onChange(form,t);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modal-root .scrim'))closeModal();else ACT.navClose()}});
