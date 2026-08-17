import React from "react";
import ReactDOM from "react-dom/client";
import MetonStable from "./MetonStable.jsx";
import InstallPrompt from "./InstallPrompt.jsx";
import ThemeControl from "./ThemeControl.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Meton frontend crash", error, info);
  }

  async recover() {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => null)));
      }
    } finally {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#07130d",color:"#eef7f1",fontFamily:"Inter,system-ui,sans-serif"}}>
        <section style={{width:"min(520px,100%)",background:"#10231a",border:"1px solid #31503f",borderRadius:18,padding:24}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:1.6,color:"#20cf7b"}}>METON · RECUPERAÇÃO</div>
          <h1 style={{fontSize:24,margin:"10px 0"}}>O aplicativo encontrou um erro de inicialização.</h1>
          <p style={{lineHeight:1.55,color:"#a8b9af"}}>A tela não ficará mais vazia. Atualize a aplicação para carregar a versão corrigida.</p>
          <button onClick={() => this.recover()} style={{width:"100%",border:0,borderRadius:10,padding:13,background:"#19c773",color:"#052314",fontWeight:800,cursor:"pointer"}}>Atualizar Meton</button>
          <details style={{marginTop:16,color:"#81958a",fontSize:12}}><summary>Detalhes técnicos</summary><pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{String(this.state.error?.message || this.state.error)}</pre></details>
        </section>
      </main>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <MetonStable />
      <ThemeControl />
      <InstallPrompt />
    </AppErrorBoundary>
  </React.StrictMode>
);
