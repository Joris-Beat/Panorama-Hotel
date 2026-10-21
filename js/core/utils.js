/* Panorama Hotel Manager — Fonctions utilitaires (dates, texte, stockage navigateur) */
'use strict';

const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad=n=>String(n).padStart(2,'0');
const fmtISO=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const a=String(s).split('-').map(Number);return new Date(a[0],a[1]-1,a[2])};
const today=()=>fmtISO(new Date());
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return fmtISO(d)};
const diffDays=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const fmtDate=s=>s?parse(s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'';
const fmtTs=s=>s?new Date(s).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}):'';
const sum=(a,f)=>a.reduce((s,x)=>s+(+f(x)||0),0);
const r2=n=>Math.round((+n+Number.EPSILON)*100)/100;
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const match=(q,...v)=>!q||norm(v.join(' ')).includes(norm(q));
const cmpNo=(a,b)=>String(a).localeCompare(String(b),'fr',{numeric:true});
const clean=o=>JSON.parse(JSON.stringify(o));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NF=new Intl.NumberFormat('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:2});
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function ssGet(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function ssSet(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function ssDel(k){try{sessionStorage.removeItem(k)}catch(e){}}
