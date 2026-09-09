import React from'react';
import{BarChart3,Bell,CreditCard,FileCheck2,LayoutDashboard,ReceiptText,Target,WalletCards}from'lucide-react';
import'./ux.css';
const ITEMS=[['radar',LayoutDashboard,'Visão'],['lancamentos',ReceiptText,'Lançamentos'],['planejamento',Target,'Planejar'],['cartoes',CreditCard,'Cartões'],['emprestimos',WalletCards,'Empréstimos'],['auditoria',FileCheck2,'Auditoria'],['lembretes',Bell,'Lembretes'],['relatorios',BarChart3,'Relatórios']];
export default function AppQuickNav({page,setPage}){return <div className="mx-quick-wrap"><nav className="mx-quick"aria-label="Navegação rápida">{ITEMS.map(([id,I,label])=><button key={id}className={page===id?'active':''}onClick={()=>setPage(id)}><I size={15}/><span>{label}</span></button>)}</nav></div>}
