import React,{useEffect,useState} from 'react';
import {supabase} from './cloud.js';
import './qr-login.css';
const endpoint='qr-login';
const makeVerifier=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
async function call(body){
 const {data,error}=await supabase.functions.invoke(endpoint,{body});
 if(error)throw error;
 if(data?.error)throw Error(data.error);
 return data;
}
export function QRLogin(){
 const [request,setRequest]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function start(){
  setLoading(true);setError('');setRequest(null);
  try{const verifier=makeVerifier();const data=await call({action:'create',verifier});setRequest({...data,verifier});}
  catch(e){setError(e.message||'Falha ao criar QR Code');}
  finally{setLoading(false)}
 }
 useEffect(()=>{
  if(!request)return;
  let active=true;
  const timer=setInterval(async()=>{
   if(!active)return;
   if(Date.now()>=new Date(request.expires_at).getTime()){setError('QR Code expirado. Gere outro.');setRequest(null);return;}
   try{
    const data=await call({action:'poll',id:request.id,verifier:request.verifier});
    if(!active)return;
    if(data.status==='approved'&&data.token_hash){
     active=false;clearInterval(timer);
     const {error:authError}=await supabase.auth.verifyOtp({token_hash:data.token_hash,type:'magiclink'});
     if(authError)setError('Não foi possível concluir o acesso: '+authError.message);
    }
   }catch(e){if(active)setError(e.message||'Falha na verificação');}
  },2200);
  return()=>{active=false;clearInterval(timer)};
 },[request?.id]);
 const link=request?new URL('/?qr_approve='+encodeURIComponent(request.id),window.location.origin).toString():'';
 return <section className="qr-login">
  <button type="button" className="qr-start" onClick={start} disabled={loading}>{loading?'Preparando...':request?'Gerar outro QR Code':'Entrar com QR Code'}</button>
  {request&&<div className="qr-panel">
   <p>Abra a Meton no celular, leia o QR Code e confirme o acesso.</p>
   <img width="216" height="216" alt="QR Code temporário para autorizar o acesso no computador" src={'https://api.qrserver.com/v1/create-qr-code/?size=216x216&margin=8&data='+encodeURIComponent(link)}/>
   <small>Expira em 2 minutos. Não compartilhe o código.</small>
  </div>}
  {error&&<p className="qr-error" role="alert">{error}</p>}
 </section>;
}
export function QRApproval({session}){
 const id=new URLSearchParams(window.location.search).get('qr_approve');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function approve(){
  setBusy(true);setMessage('');
  try{await call({action:'approve',id});setMessage('Acesso autorizado. Volte ao computador.');}
  catch(e){setMessage(e.message||'Não foi possível autorizar.');}
  finally{setBusy(false)}
 }
 return <main className="qr-approval"><div className="qr-approval-card">
  <h1>Autorizar computador</h1>
  <p>Você está conectado como <strong>{session.user.email}</strong>.</p>
  <p>Autorize somente se foi você quem iniciou o login no computador. Nunca aprove solicitações enviadas por terceiros.</p>
  <button type="button" onClick={approve} disabled={busy||Boolean(message)}>{busy?'Autorizando...':'Autorizar este acesso'}</button>
  <button type="button" className="qr-cancel" onClick={()=>window.location.assign('/')}>Cancelar e voltar</button>
  {message&&<p role="status">{message}</p>}
 </div></main>;
}