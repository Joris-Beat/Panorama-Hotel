/* Panorama Hotel Manager — Démarrage de l’application */
'use strict';

async function boot(){
  brandInit();
  const th=lsGet('ph_theme');if(th)document.documentElement.dataset.theme=th;
  render();
  await initStore();
  try{const u=await window.claude.use('user');if(u&&DB.mode==='cloud'){const c=await u.can('data.write');if(c===false)state.canWrite=false}}catch(e){}
  state.ready=true;if(location.hash==='#reserver'){pInit();state.portalOn=true}
  const sid=DB.mode==='firebase'?null:(lsGet('ph_sess')||ssGet('ph_sess'));
  if(sid){const u=byId('users',sid);if(u&&u.active){state.user=u;state.page=(MODS.find(m=>pageOK(m[0]))||['dashboard'])[0]}}
  render(true);
}
boot();
