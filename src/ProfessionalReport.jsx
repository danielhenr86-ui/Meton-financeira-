import React,{useMemo,useState} from 'react';
import {Download,Printer,TrendingUp,ShieldCheck} from 'lucide-react';
import './ProfessionalReport.css';
const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const num=n=>Number(n||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
const monthName=s=>new Date(s+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
const previous=s=>{const [y,m]=s.split('-').map(Number);return new Date(y,m-2,1).toISOString().slice(0,7)};
const fixed=x=>Boolean(x.recurring||x.recurrence_rule)||/fix(a|o)|fixed/i.test(String(x.classification||''));
const summarize=rows=>{const income=rows.filter(x=>x.kind==='income').reduce((a,x)=>a+Number(x.amount||0),0);const expenses=rows.filter(x=>x.kind==='expense');const f=expenses.filter(fixed).reduce((a,x)=>a+Number(x.amount||0),0);const v=expenses.filter(x=>!fixed(x)).reduce((a,x)=>a+Number(x.amount||0),0);return{income,fixed:f,variable:v,expense:f+v,result:income-f-v,count:rows.length,reconciled:rows.filter(x=>x.reconciled).length}};
const variation=(a,b)=>b===0?null:(a-b)/Math.abs(b)*100;
const delta=(a,b)=>{const v=variation(a,b);return v===null?'Sem base comparável':(v>=0?'+':'')+num(v)+'%'};
function Stat({label,value,sub,negative}){return <div className={'mpr-stat '+(negative?'mpr-negative':'')}><span>{label}</span><strong>{brl(value)}</strong><small>{sub}</small></div>}
export default function ProfessionalReport({d={},data={}}){
 const [period,setPeriod]=useState(new Date().toISOString().slice(0,7));
 const [scope,setScope]=useState('all');
 const [source,setSource]=useState('bank');
 const tx=data.tx||[];
 const valid=useMemo(()=>tx.filter(x=>x.status==='paid'&&!x.is_import_duplicate&&(scope==='all'||x.scope===scope)&&(source==='all'||x.source_name)),[tx,scope,source]);
 const rows=valid.filter(x=>String(x.occurred_on||'').slice(0,7)===period);
 const prior=valid.filter(x=>String(x.occurred_on||'').slice(0,7)===previous(period));
 const now=summarize(rows),last=summarize(prior);
 const monthSeries=Array.from({length:6},(_,i)=>{const [y,m]=period.split('-').map(Number);const date=new Date(y,m-1-(5-i),1).toISOString().slice(0,7);return{date,...summarize(valid.filter(x=>String(x.occurred_on||'').slice(0,7)===date))}});
 const categories=Object.entries(rows.filter(x=>x.kind==='expense').reduce((o,x)=>{const k=x.category||'Sem categoria';o[k]=(o[k]||0)+Number(x.amount||0);return o},{})).sort((a,b)=>b[1]-a[1]).slice(0,8);
 const scopes=['PF','PJ'].map(s=>({scope:s,...summarize(rows.filter(x=>x.scope===s))}));
 const csv=()=>{const lines=[['METON FINANCEIRA — RELATÓRIO GERENCIAL'],['Período',period],['Escopo',scope],['Origem',source==='bank'?'Extratos bancários':'Todos os pagos'],[],['Indicador','Atual','Anterior'],['Receitas',now.income,last.income],['Despesas fixas',now.fixed,last.fixed],['Despesas variáveis',now.variable,last.variable],['Despesas totais',now.expense,last.expense],['Resultado',now.result,last.result],[],['Escopo','Receitas','Fixas','Variáveis','Resultado'],...scopes.map(s=>[s.scope,s.income,s.fixed,s.variable,s.result]),[],['Categoria','Despesa'],...categories];const csv=lines.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='meton-gerencial-'+period+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
 const max=Math.max(1,...monthSeries.flatMap(x=>[x.income,x.expense]));
 const quality=now.count?Math.round(now.reconciled/now.count*100):null;
 return <section className="mpr">
  <div className="mpr-toolbar">
   <div><p className="mpr-eyebrow">METON FINANCEIRA / INTELIGÊNCIA GERENCIAL</p><h1>Relatório financeiro</h1><p>Desempenho, composição de gastos e evolução do resultado.</p></div>
   <div className="mpr-actions"><button type="button" onClick={()=>window.print()}><Printer size={16}/> Exportar PDF</button><button type="button" onClick={csv}><Download size={16}/> Exportar CSV</button></div>
  </div>
  <div className="mpr-filters">
   <label>Competência <input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label>
   <label>Visão <select value={scope} onChange={e=>setScope(e.target.value)}><option value="all">Consolidado PF + PJ</option><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></label>
   <label>Origem dos dados <select value={source} onChange={e=>setSource(e.target.value)}><option value="bank">Extratos bancários</option><option value="all">Todos os lançamentos pagos</option></select></label>
  </div>
  <div className="mpr-paper">
   <header className="mpr-reporthead"><div><div className="mpr-mark">M</div><div><strong>METON FINANCEIRA</strong><span>RELATÓRIO GERENCIAL</span></div></div><div className="mpr-reportmeta"><b>{monthName(period)}</b><span>{scope==='all'?'PF + PJ':scope} · {source==='bank'?'Extratos bancários':'Lançamentos pagos'}</span><span>Emitido em {new Date().toLocaleDateString('pt-BR')}</span></div></header>
   <div className="mpr-sectiontitle"><span>01 / Síntese executiva</span><h2>Resultado do período</h2></div>
   <div className="mpr-stats"><Stat label="Receitas" value={now.income} sub={'Anterior: '+brl(last.income)}/><Stat label="Despesas fixas" value={now.fixed} sub="Recorrentes e classificadas"/><Stat label="Despesas variáveis" value={now.variable} sub="Demais despesas realizadas"/><Stat label="Resultado líquido gerencial" value={now.result} negative={now.result<0} sub={now.result<0?'Déficit no período':'Superávit no período'}/></div>
   <div className="mpr-insight"><TrendingUp size={18}/><p>{now.count===0?'Nenhuma movimentação paga encontrada para o período e os filtros selecionados. Isso não significa saldo bancário zero.':now.result<0?'As despesas superaram as receitas em '+brl(Math.abs(now.result))+'. Revise as categorias e o planejamento do próximo período.':'As receitas superaram as despesas em '+brl(now.result)+'. O resultado não representa necessariamente o saldo disponível nas contas.'}</p></div>
   <div className="mpr-sectiontitle"><span>02 / Demonstrativo</span><h2>Apuração gerencial comparativa</h2></div>
   <div className="mpr-tablewrap"><table><thead><tr><th>Conta gerencial</th><th>{monthName(period)}</th><th>Mês anterior</th><th>Variação</th></tr></thead><tbody>{[['(+) Receitas','income'],['(-) Despesas fixas','fixed'],['(-) Despesas variáveis','variable'],['(-) Despesas totais','expense'],['(=) Resultado','result']].map(([label,key])=><tr key={key} className={key==='result'?'mpr-total':''}><td>{label}</td><td>{brl(now[key])}</td><td>{brl(last[key])}</td><td>{delta(now[key],last[key])}</td></tr>)}<tr><td>Margem sobre receitas</td><td>{now.income?num(now.result/now.income*100)+'%':'N/A'}</td><td>{last.income?num(last.result/last.income*100)+'%':'N/A'}</td><td>—</td></tr></tbody></table></div>
   <div className="mpr-sectiontitle"><span>03 / Tendência</span><h2>Evolução dos últimos seis meses</h2></div>
   <div className="mpr-chartlegend"><span><i className="mpr-revenue"/> Receitas</span><span><i className="mpr-expense"/> Despesas</span></div>
   <div className="mpr-chart">{monthSeries.map(m=><div key={m.date} className="mpr-chartcol"><div className="mpr-bars"><div title={'Receitas '+brl(m.income)} className="mpr-revenue" style={{height:(m.income/max*100)+'%'}}/><div title={'Despesas '+brl(m.expense)} className="mpr-expense" style={{height:(m.expense/max*100)+'%'}}/></div><span>{new Date(m.date+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'short'})}</span><small>{brl(m.result)}</small></div>)}</div>
   <div className="mpr-twocol"><section><div className="mpr-sectiontitle"><span>04 / Composição</span><h2>Principais despesas</h2></div>{categories.length?categories.map(([name,amount])=><div className="mpr-category" key={name}><div><span>{name}</span><b>{brl(amount)}</b></div><div className="mpr-track"><span style={{width:(amount/Math.max(now.expense,1)*100)+'%'}}/></div></div>):<p className="mpr-muted">Sem despesas registradas no período.</p>}</section><section><div className="mpr-sectiontitle"><span>05 / Segmentação</span><h2>Pessoa física × jurídica</h2></div><table><thead><tr><th>Escopo</th><th>Receitas</th><th>Despesas</th><th>Resultado</th></tr></thead><tbody>{scopes.map(s=><tr key={s.scope}><td>{s.scope}</td><td>{brl(s.income)}</td><td>{brl(s.expense)}</td><td>{brl(s.result)}</td></tr>)}</tbody></table><div className="mpr-quality"><ShieldCheck size={17}/><span>Conciliação: <b>{quality===null?'Sem base':quality+'%'}</b> · {now.reconciled} de {now.count} movimentações</span></div></section></div>
   <footer className="mpr-footer"><strong>METON FINANCEIRA</strong><p>Relatório gerencial baseado nos lançamentos cadastrados e filtros selecionados. Despesas fixas são identificadas por recorrência ou classificação explícita; as demais são tratadas como variáveis. Dados não conciliados podem conter divergências. Este demonstrativo não substitui DRE contábil, escrituração ou extrato oficial.</p><span>Gerado em {new Date().toLocaleString('pt-BR')} · Uso gerencial</span></footer>
  </div>
 </section>;
}