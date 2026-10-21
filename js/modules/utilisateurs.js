/* Panorama Hotel Manager — Page Utilisateurs et rôles */
'use strict';

PAGES.users=()=>{
  const tab=state.tabs.users||'u',W=can('users',2),tabs=tabsHTML('users',[['u','Utilisateurs'],['r','Rôles & permissions']],tab);
  if(tab==='r'){
    const roles=DB.cache.roles.filter(r=>r.id!=='admin').sort((a,b)=>a.name.localeCompare(b.name));
    const head1=roles.map(r=>`<th>${esc(r.name)} ${W?`<button class="ib danger" data-act="roleDel" data-id="${r.id}" aria-label="Supprimer le rôle" style="width:24px;height:24px">${I('trash',13)}</button>`:''}</th>`).join('');
    const rows=MODS.map(m=>`<tr><td><b>${esc(m[1])}</b></td>${roles.map(r=>`<td><select data-roleperm="${r.id}|${m[0]}" ${W?'':'disabled'} aria-label="${esc(r.name)} — ${esc(m[1])}">${[[0,'Aucun'],[1,'Lecture'],[2,'Écriture']].map(o=>`<option value="${o[0]}"${(r.perms||{})[m[0]]===o[0]||(!(r.perms||{})[m[0]]&&o[0]===0)?' selected':''}>${o[1]}</option>`).join('')}</select></td>`).join('')}</tr>`).join('');
    return head('Utilisateurs & rôles',W?addBtn('Nouveau rôle','roleNew'):'','L’administrateur a toujours un accès complet.')+tabs+`<div class="tw"><table><thead><tr><th>Module</th>${head1}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  const rows=DB.cache.users.slice().sort((a,b)=>a.name.localeCompare(b.name));
  return head('Utilisateurs & rôles',W?addBtn('Nouvel utilisateur','userNew'):'')+tabs+table([{h:'Nom',c:u=>'<b>'+esc(u.name)+'</b>'},{h:'Identifiant',c:u=>esc(u.username)},{h:'Rôle',c:u=>esc(roleName(u.roleId))},{h:'Statut',c:u=>u.active?badge('Actif','good'):badge('Désactivé','mute')},{h:'Dernière connexion',c:u=>u.lastLogin?fmtTs(u.lastLogin):'—'},{h:'',c:u=>W?`<div class="ra"><button class="ib" data-act="userEdit" data-id="${u.id}" aria-label="Modifier">${I('edit',16)}</button><button class="ib danger" data-act="userDel" data-id="${u.id}" aria-label="Supprimer">${I('trash',16)}</button></div>`:''}],rows);
};
function userForm(id){
  if(!needW('users'))return;const rec=id?byId('users',id):{active:true,roleId:'reception'},fbm=DB.mode==='firebase';
  const fields=[{k:'name',label:'Nom complet',req:1},{k:'username',label:'Identifiant',req:1,ac:'off',readonly:fbm&&!!id,hint:fbm?'Un nom court ou une adresse e-mail. Non modifiable après création.':''},{k:'roleId',label:'Rôle',type:'select',req:1,opts:DB.cache.roles.map(r=>[r.id,r.name])},{k:'staffId',label:'Employé lié (facultatif)',type:'select',opts:staffOpts(),placeholder:'—'}];
  if(!(fbm&&id))fields.push({k:'pw',label:id?'Nouveau mot de passe (vide = inchangé)':'Mot de passe (6 caractères min.)',type:'password',ac:'new-password',span:1});
  fields.push({k:'active',label:'Compte actif',type:'checkbox'});
  formModal({title:id?'Modifier l’utilisateur':'Nouvel utilisateur',value:rec,fields,
   extra:fbm&&id?'<div class="sum">Le mot de passe d’un autre utilisateur ne peut pas être modifié ici : il le change dans son profil, ou via « Mot de passe oublié » s’il utilise une vraie adresse e-mail.</div>':'',
   onSubmit:async v=>{
     const un=fbm&&id?rec.username:v.username.toLowerCase().replace(/\s+/g,'');
     v.pw=v.pw||'';
     if(DB.cache.users.some(u=>u.id!==id&&u.username===un))return 'Cet identifiant est déjà utilisé.';
     if(!id&&v.pw.length<6)return 'Mot de passe : 6 caractères minimum.';if(id&&v.pw&&v.pw.length<6)return 'Mot de passe : 6 caractères minimum.';
     if(id&&rec.roleId==='admin'&&(v.roleId!=='admin'||!v.active)&&DB.cache.users.filter(u=>u.roleId==='admin'&&u.active).length<2)return 'Il doit rester au moins un administrateur actif.';
     const out=Object.assign({},rec,{name:v.name,username:un,roleId:v.roleId,staffId:v.staffId,active:v.active});
     if(fbm&&!id){
       const app2=firebase.initializeApp(DB.cfg,'sec'+uid());
       try{const c2=await app2.auth().createUserWithEmailAndPassword(toEmail(un),v.pw);out.id=c2.user.uid;await app2.auth().signOut()}
       catch(e){return authMsg(e)}
       finally{try{await app2.delete()}catch(x){}}
     }else if(!fbm&&v.pw){out.salt=uid();out.hash=await hashPw(v.pw,out.salt)}
     put('users',out);logA((id?'Utilisateur modifié : ':'Utilisateur créé : ')+un);toast('Utilisateur enregistré');
   }});
}
ACT.userNew=()=>userForm();ACT.userEdit=t=>userForm(t.dataset.id);
ACT.userDel=t=>{
  if(!needW('users'))return;const u=byId('users',t.dataset.id);
  if(u.id===state.user.id){toast('Vous ne pouvez pas supprimer votre propre compte.','bad');return}
  if(u.roleId==='admin'&&DB.cache.users.filter(x=>x.roleId==='admin').length<2){toast('Il doit rester un administrateur.','bad');return}
  confirmDlg({title:'Supprimer l’utilisateur ?',msg:u.name+' ne pourra plus se connecter.'+(DB.mode==='firebase'?' Conseil : préférez désactiver le compte (l’identifiant reste réservé).':''),yes:'Supprimer',danger:1,onYes:()=>{del('users',u.id);logA('Utilisateur supprimé : '+u.username)}});
};
ACT.roleNew=()=>{
  if(!needW('users'))return;
  formModal({title:'Nouveau rôle',fields:[{k:'name',label:'Nom du rôle',req:1}],onSubmit:v=>{put('roles',{id:'r'+uid(),name:v.name,perms:{dashboard:1}});logA('Rôle créé : '+v.name);toast('Rôle créé — réglez ses permissions dans la grille')}});
};
ACT.roleDel=t=>{
  if(!needW('users'))return;const r=byId('roles',t.dataset.id);
  if(DB.cache.users.some(u=>u.roleId===r.id)){toast('Des utilisateurs ont ce rôle.','bad');return}
  confirmDlg({title:'Supprimer le rôle ?',msg:r.name,yes:'Supprimer',danger:1,onYes:()=>{del('roles',r.id);logA('Rôle supprimé : '+r.name)}});
};
