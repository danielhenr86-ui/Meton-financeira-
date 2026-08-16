import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import MetonFinanceira from "./MetonFinanceira.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import { initCloudStorage, supabase } from "./cloud.js";
import "./index.css";

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
        if (error) throw error;
        if (!data.session) setMessage("Cadastro criado. Confira seu e-mail para confirmar a conta.");
      }
    } catch (err) { setMessage(err?.message || "Não foi possível continuar."); }
    finally { setBusy(false); }
  }

  return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#07130d',fontFamily:'Inter,system-ui',padding:20}}>
    <form onSubmit={submit} style={{width:'min(420px,100%)',background:'#10231a',border:'1px solid #244333',borderRadius:20,padding:28,color:'#f1f7f3',boxShadow:'0 24px 80px #0008'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}><div style={{width:42,height:42,borderRadius:12,background:'#19c773',color:'#052314',display:'grid',placeItems:'center',fontWeight:900,fontSize:23}}>M</div><div><b style={{letterSpacing:2}}>METON</b><div style={{fontSize:10,color:'#7d9b8b',letterSpacing:2}}>FINANCEIRA</div></div></div>
      <div style={{fontSize:11,color:'#20cf7b',fontWeight:800,letterSpacing:1.5}}>ACESSO SEGURO</div><h1 style={{fontSize:28,margin:'8px 0'}}>Seu financeiro, em qualquer dispositivo.</h1><p style={{color:'#93a99d',fontSize:13,lineHeight:1.5}}>Use a mesma conta no celular e no notebook. Seus dados ficam sincronizados na nuvem.</p>
      {mode === 'register' && <input required placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} style={inputStyle}/>}<input required type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/><input required minLength={6} type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle}/>
      {message && <p style={{fontSize:12,color:'#f2b84b'}}>{message}</p>}
      <button disabled={busy} style={{width:'100%',border:0,borderRadius:10,padding:13,background:'#19c773',color:'#052314',fontWeight:800,cursor:'pointer'}}>{busy?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</button>
      <button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('')}} style={{width:'100%',border:0,background:'transparent',color:'#8ca89a',padding:14,cursor:'pointer'}}>{mode==='login'?'Ainda não tenho conta':'Já tenho uma conta'}</button>
    </form>
  </div>;
}
const inputStyle={width:'100%',boxSizing:'border-box',margin:'7px 0',border:'1px solid #31503f',borderRadius:10,padding:'12px 13px',background:'#0b1b13',color:'#fff',outline:'none'};

function App() {
  const [session, setSession] = useState(undefined);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
    return ()=>listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session?.user?.id) { setReady(false); return; }
    let cleanup;
    initCloudStorage(session.user.id).then(fn=>{cleanup=fn;setReady(true)}).catch(err=>{console.error(err);setReady(false)});
    return ()=>cleanup?.();
  }, [session?.user?.id]);
  if (session === undefined) return <div style={{minHeight:'100vh',background:'#07130d'}}/>;
  if (!session) return <AuthScreen/>;
  if (!ready) return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#07130d',color:'#19c773',fontFamily:'system-ui'}}>Sincronizando Meton...</div>;
  return <><button onClick={()=>supabase.auth.signOut()} title="Sair" style={{position:'fixed',right:12,bottom:12,zIndex:9999,border:'1px solid #31503f',background:'#10231a',color:'#a9c0b4',borderRadius:10,padding:'8px 11px',fontSize:11}}>Sair</button><MetonFinanceira/><InstallPrompt/></>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
