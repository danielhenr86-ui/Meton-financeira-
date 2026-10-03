import React,{useEffect,useMemo,useState}from'react';
import{AlertCircle,BarChart3,ExternalLink,MessageCircle,RefreshCw,Target,Users}from'lucide-react';
import{supabase}from'./cloud.js';
import'./growth-dashboard.css';

const stages=['novo','frio','morno','qualificado','prioritario','reuniao','proposta','cliente','perdido'];
const stageLabel={novo:'Novo',frio:'Frio',morno:'Morno',qualificado:'Qualificado',prioritario:'Prioritário',reuniao:'Reunião',proposta:'Proposta',cliente:'Cliente',perdido:'Perdido'};
const dateTime=v=>v?new Date(v).toLocaleString('pt-BR'):'—';

export default function GrowthDashboard(){
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState('');
 const[overview,setOverview]=useState(null);
 const[leads,setLeads]=useState([]);
 const[campaigns,setCampaigns]=useState([]);
 const[daily,setDaily]=useState([]);
 const[filter,setFilter]=useState('all');

 async function load(){
  setLoading(true);setError('');
  const[o,l,c,d]=await Promise.all([
   supabase.from('growth_overview').select('*').maybeSingle(),
   supabase.from('growth_lead_inbox').select('*').order('created_at',{ascending:false}).limit(100),
   supabase.from('growth_campaign_performance').select('*').limit(30),
   supabase.from('growth_daily_funnel').select('*').limit(30)
  ]);
  const failed=[o,l,c,d].find(x=>x.error)?.error;
  if(failed)setError(failed.message);
  else{setOverview(o.data||{});setLeads(l.data||[]);setCampaigns(c.data||[]);setDaily(d.data||[])}
  setLoading(false);
 }
 useEffect(()=>{load()},[]);

 async function updateStage(id,lifecycle_stage){
  const{error}=await supabase.from('growth_leads').update({lifecycle_stage}).eq('id',id);
  if(error){setError(error.message);return}
  setLeads(rows=>rows.map(x=>x.id===id?{...x,lifecycle_stage}:x));
 }

 const shown=useMemo(()=>filter==='all'?leads:leads.filter(x=>x.lifecycle_stage===filter),[leads,filter]);
 const sourceTop=campaigns.slice(0,8);
 const maxViews=Math.max(1,...daily.map(x=>Number(x.total_events||0)));

 if(loading)return <section className="mn-page"><div className="gd-loading"><RefreshCw className="spin"/>Carregando Growth Engine...</div></section>;

 return <section className="mn-page gd-page">
  <div className="mn-title"><div><small>METON GROWTH ENGINE</small><h1>Leads & conversão</h1><p>Do diagnóstico até o atendimento comercial, com origem, score e estágio do lead.</p></div><button className="gd-refresh" onClick={load}><RefreshCw size={15}/>Atualizar</button></div>
  {error&&<div className="gd-error"><AlertCircle size={17}/>{error}</div>}

  <div className="mn-kpis">
   <GdKpi icon={<Users/>} label="Leads" value={overview?.total_leads||0}/>
   <GdKpi icon={<Target/>} label="Qualificados" value={overview?.qualified_leads||0}/>
   <GdKpi icon={<BarChart3/>} label="Prioritários" value={overview?.priority_leads||0}/>
   <GdKpi icon={<MessageCircle/>} label="Cliques WhatsApp" value={overview?.whatsapp_clicks||0}/>
  </div>

  <div className="gd-grid">
   <article className="mn-card gd-funnel"><small>FUNIL</small><h2>Conversão acumulada</h2>
    <Funnel label="Visualizações" value={overview?.page_views||0}/>
    <Funnel label="Aberturas do diagnóstico" value={overview?.diagnostic_opens||0}/>
    <Funnel label="Formulários iniciados" value={overview?.form_opens||0}/>
    <Funnel label="Diagnósticos concluídos" value={overview?.diagnostics_completed||0}/>
    <Funnel label="Leads gravados" value={overview?.total_leads||0}/>
    <Funnel label="Clientes" value={overview?.clients||0}/>
    <div className="gd-conversion"><span>Sessão → lead</span><strong>{Number(overview?.session_to_lead_pct||0).toFixed(1)}%</strong></div>
   </article>

   <article className="mn-card"><small>ORIGEM</small><h2>Campanhas e conteúdos</h2>
    <div className="gd-source-list">{sourceTop.map((x,i)=><div key={i}><span><b>{x.source}</b><small>{x.campaign} · {x.content}</small></span><strong>{x.leads} lead{x.leads===1?'':'s'}<small>score {x.avg_score??'—'}</small></strong></div>)}{!sourceTop.length&&<p className="gd-empty">Aguardando os primeiros leads rastreados.</p>}</div>
   </article>
  </div>

  <article className="mn-card"><div className="gd-card-head"><div><small>ATIVIDADE</small><h2>Eventos por dia</h2></div></div>
   <div className="gd-bars">{daily.slice().reverse().slice(-14).map((x,i)=><div key={i} title={String(x.day)}><i style={{height:Math.max(4,Number(x.total_events||0)/maxViews*100)+'%'}}/><span>{String(x.day||'').slice(5)}</span></div>)}{!daily.length&&<p className="gd-empty">Sem eventos ainda.</p>}</div>
  </article>

  <article className="mn-card gd-leads"><div className="gd-card-head"><div><small>PIPELINE</small><h2>Caixa de entrada comercial</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos os estágios</option>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></div>
   <div className="gd-table-wrap"><table><thead><tr><th>Lead</th><th>Origem</th><th>Plano</th><th>Score</th><th>Estágio</th><th>Contato</th></tr></thead><tbody>
    {shown.map(x=><tr key={x.id}><td><b>{x.name||'Sem nome'}</b><small>{x.company||'Empresa não informada'} · {dateTime(x.created_at)}</small></td><td><b>{x.acquisition_source||'direct'}</b><small>{x.utm_campaign||'sem campanha'}</small></td><td>{x.recommended_plan||'—'}</td><td><span className={'gd-score '+(Number(x.commercial_score)>=80?'hot':Number(x.commercial_score)>=60?'good':'')}>{x.commercial_score??'—'}</span></td><td><select value={x.lifecycle_stage} onChange={e=>updateStage(x.id,e.target.value)}>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></td><td>{x.whatsapp_link?<a className="gd-wa" href={x.whatsapp_link} target="_blank" rel="noreferrer"><MessageCircle size={15}/>WhatsApp<ExternalLink size={12}/></a>:<span>—</span>}</td></tr>)}
    {!shown.length&&<tr><td colSpan="6" className="gd-empty">Nenhum lead neste estágio.</td></tr>}
   </tbody></table></div>
  </article>
 </section>
}

function GdKpi({icon,label,value}){return <article className="mn-kpi"><div><span>{label}</span>{icon}</div><strong>{value}</strong></article>}
function Funnel({label,value}){return <div className="gd-funnel-row"><span>{label}</span><strong>{value}</strong></div>}
