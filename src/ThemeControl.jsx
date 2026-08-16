import React,{useEffect,useRef,useState}from'react';
import{Monitor,Sun,Moon}from'lucide-react';
import{supabase}from'./cloud.js';
import'./theme.css';

const options=[['light','Claro',Sun],['dark','Escuro',Moon],['system','Automático',Monitor]];

export default function ThemeControl(){
 const[uid,setUid]=useState(null);const[mode,setMode]=useState('system');const[open,setOpen]=useState(false);const ref=useRef(null);
 useEffect(()=>{let active=true;supabase.auth.getSession().then(({data})=>{if(active)setUid(data.session?.user?.id||null)});const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>setUid(s?.user?.id||null));return()=>{active=false;l.subscription.unsubscribe()}},[]);
 useEffect(()=>{if(!uid)return;let alive=true;supabase.from('profiles').select('theme_preference').eq('id',uid).maybeSingle().then(({data})=>{if(alive)setMode(data?.theme_preference||'system')});const ch=supabase.channel('theme-'+uid).on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles',filter:`id=eq.${uid}`},p=>{if(p.new?.theme_preference)setMode(p.new.theme_preference)}).subscribe();return()=>{alive=false;supabase.removeChannel(ch)}},[uid]);
 useEffect(()=>{const mq=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{const resolved=mode==='system'?(mq.matches?'dark':'light'):mode;document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved};apply();mq.addEventListener?.('change',apply);return()=>mq.removeEventListener?.('change',apply)},[mode]);
 useEffect(()=>{const close=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 async function choose(next){setMode(next);setOpen(false);if(uid)await supabase.from('profiles').update({theme_preference:next,updated_at:new Date().toISOString()}).eq('id',uid)}
 const Icon=mode==='dark'?Moon:mode==='light'?Sun:Monitor;
 if(!uid)return null;
 return <div className="theme-control"ref={ref}><button className="theme-trigger"onClick={()=>setOpen(!open)}aria-label="Aparência"title="Aparência"><Icon size={18}/></button>{open&&<div className="theme-popover"><strong>Aparência</strong><span>Escolha como a Meton será exibida.</span>{options.map(([value,label,I])=><button key={value}className={mode===value?'active':''}onClick={()=>choose(value)}><I size={17}/><div><b>{label}</b><small>{value==='system'?'Segue o celular ou computador':value==='dark'?'Fundo escuro':'Fundo claro'}</small></div>{mode===value&&<i>✓</i>}</button>)}</div>}</div>
}
