import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function patchMetonStable() {
  return {
    name: "patch-meton-stable",
    enforce: "pre",
    transform(code, id) {
      if (!id.replace(/\\/g, "/").endsWith("/src/MetonStable.jsx")) return null;
      let next = code.replace("import React,{useEffect,useMemo,useState}from'react';","import React,{useEffect,useState}from'react';");
      next = next.replace("const ctrl=useMemo(()=>calcController(data,balance,income,expense,result),[data,balance,income,expense,result]);","const ctrl=calcController(data,balance,income,expense,result);");
      next = next.replace("import'./stable.css';","import'./stable.css';\nimport{TransactionsV2,CardsPage,AuditPage,RemindersPage,ReportsV2,ReminderWatcher}from'./MetonControls.jsx';");
      next = next.replace("['radar',LayoutDashboard,'Radar'],['lancamentos',ReceiptText,'Lançamentos'],['planejamento',WalletCards,'Contas, metas & orçamento'],['controller',Bot,'Centro de Decisão'],['importar',FileSpreadsheet,'Importar extrato'],['relatorios',Download,'Relatórios'],['perfil',UserRound,'Meu perfil']","['radar',LayoutDashboard,'Radar'],['lancamentos',ReceiptText,'Lançamentos'],['planejamento',WalletCards,'Contas, metas & orçamento'],['cartoes',WalletCards,'Cartões'],['auditoria',FileSpreadsheet,'Auditoria & conciliação'],['lembretes',AlertCircle,'Lembretes'],['controller',Bot,'Centro de Decisão'],['importar',FileSpreadsheet,'Importar extrato'],['relatorios',Download,'Relatórios'],['perfil',UserRound,'Meu perfil']");
      next = next.replace("<div className=\"mn-app\"><ToastStack items={toasts}/>","<div className=\"mn-app\"><ReminderWatcher session={session}/><ToastStack items={toasts}/>");
      next = next.replace("{page==='lancamentos'&&<Transactions session={session}data={data}reload={load}toast={toast}/>} {page==='planejamento'&&<Planning session={session}data={data}reload={load}toast={toast}/>} {page==='controller'&&<Controller d={ctrl}/>} {page==='importar'&&<ImportPage session={session}reload={load}toast={toast}/>} {page==='relatorios'&&<Reports d={ctrl}/>} {page==='perfil'&&<Profile session={session}profile={profile}reload={load}toast={toast}/>}","{page==='lancamentos'&&<TransactionsV2 session={session}data={data}reload={load}toast={toast}/>} {page==='planejamento'&&<Planning session={session}data={data}reload={load}toast={toast}/>} {page==='cartoes'&&<CardsPage session={session}data={data}toast={toast}/>} {page==='auditoria'&&<AuditPage session={session}data={data}reload={load}toast={toast}/>} {page==='lembretes'&&<RemindersPage session={session}toast={toast}/>} {page==='controller'&&<Controller d={ctrl}/>} {page==='importar'&&<ImportPage session={session}reload={load}toast={toast}/>} {page==='relatorios'&&<ReportsV2 d={ctrl}data={data}/>} {page==='perfil'&&<Profile session={session}profile={profile}reload={load}toast={toast}/> }");
      const required=["TransactionsV2","CardsPage","AuditPage","RemindersPage","ReportsV2","ReminderWatcher","const ctrl=calcController"];
      const missing=required.filter(token=>!next.includes(token));
      if(missing.length) throw new Error(`Meton production patch incomplete: ${missing.join(", ")}`);
      return {code:next,map:null};
    },
  };
}

export default defineConfig({
  plugins: [
    patchMetonStable(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
      manifest: {name:"Meton Financeira",short_name:"Meton",description:"Sua visão panorâmica das finanças pessoais e da empresa.",theme_color:"#14532d",background_color:"#14532d",display:"standalone",orientation:"portrait",scope:"/",start_url:"/",lang:"pt-BR",categories:["finance","productivity"],icons:[{src:"pwa-192x192.png",sizes:"192x192",type:"image/png"},{src:"pwa-512x512.png",sizes:"512x512",type:"image/png"},{src:"pwa-512x512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]},
      workbox:{maximumFileSizeToCacheInBytes:4*1024*1024,globPatterns:["**/*.{js,css,html,ico,png,svg,woff,woff2}"],cleanupOutdatedCaches:true,skipWaiting:true,clientsClaim:true,runtimeCaching:[{urlPattern:/^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,handler:"CacheFirst",options:{cacheName:"google-fonts",expiration:{maxEntries:20,maxAgeSeconds:60*60*24*365},cacheableResponse:{statuses:[0,200]}}}]}
    }),
  ],
});
