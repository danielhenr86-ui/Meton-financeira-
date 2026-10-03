import React,{useEffect,useMemo,useState}from'react';
import{AlertCircle,BarChart3,Calendar,ExternalLink,MessageCircle,RefreshCw,Save,Target,Users,X}from'lucide-react';
import{supabase}from'./cloud.js';
import'./growth-dashboard.css';

const stages=['novo','frio','morno','qualificado','prioritario','reuniao','proposta','cliente','perdido'];
const stageLabel={novo:'Novo',frio:'Frio',morno:'Morno',qualificado:'Qualificado',prioritario:'Prioritário',reuniao:'Reunião',proposta:'Proposta',cliente:'Cliente',perdido:'Perdido'};
const dateTime=v=>v?new Date(v).toLocaleString('pt-BR'):'—';
const localInput=v=>{if(!v)return'';const d=new Date(v);const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,16)};

export default function GrowthDashboard(){
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState('');
 const[overview,setOverview]=useState(null);
 const[leads,setLeads]=useState([]);
 const[campaigns,setCampaigns]=useState([]);
 const[daily,setDaily]=useState([]);
 const[filter,setFilter]=useState('all');
 const[selected,setSelected]=useState(null);
 const[saving,setSaving]=useState(false);

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

 async function patchLead(id,patch){
  const next={...patch,updated_at:new Date().toISOString()};
  const{error}=await supabase.from('growth_leads').update(next).eq('id',id);
  if(error){setError(error.message);return false}
  setLeads(rows=>rows.map(x=>x.id===id?{...x,...next}:x));
  return true;
 }

 async function updateStage(id,lifecycle_stage){await patchLead(id,{lifecycle_stage})}

 async function saveFollowUp(){
  if(!selected)return;
  setSaving(true);setError('');
  const patch={
   next_action:selected.next_action?.trim()||null,
   next_follow_up_at:selected.next_follow_up_at?new Date(selected.next_follow_up_at).toISOString():null,
   commercial_notes:selected.commercial_notes?.trim()||null
  };
  const ok=await patchLead(selected.id,patch);
  setSaving(false);
  if(ok)setSelected(null);
 }

 async function markContact(){
  if(!selected)return;
  setSaving(true);setError('');
  const now=new Date().toISOString();
  const ok=await patchLead(selected.id,{last_contact_at:now});
  setSaving(false);
  if(ok)setSelected(v=>v?{...v,last_contact_at:now}:v);
 }

 const shown=useMemo(()=>filter==='all'?leads:leads.filter(x=>x.lifecycle_stage===filter),[leads,filter]);
 const sourceTop=campaigns.slice(0,8);
 const maxViews=Math.max(1,...daily.map(x=>Number(x.total_events||0)));
 const now=Date.now();
 const overdue=leads.filter(x=>x.next_follow_up_at&&new Date(x.next_follow_up_at).getTime()<now&&!['cliente','perdido'].includes(x.lifecycle_stage)).length;

 if(loading)return <section className="mn-page"><div className="gd-loading"><RefreshCw className="spin"/>Carregando Growth Engine...</div></section>;

 return <section className="mn-page gd-page">
  <div className="mn-title"><div><small>METON GROWTH ENGINE</small><h1>Leads & conversão</h1><p>Da origem ao fechamento, com score, estágio e próxima ação comercial.</p></div><button className="gd-refresh" onClick={load}><RefreshCw size={15}/>Atualizar</button></div>
  {error&&<div className="gd-error"><AlertCircle size={17}/>{error}</div>}

  <div className="mn-kpis">
   <GdKpi icon={<Users/>} label="Leads" value={overview?.total_leads||0}/>
   <GdKpi icon={<Target/>} label="Qualificados" value={overview?.qualified_leads||0}/>
   <GdKpi icon={<BarChart3/>} label="Prioritários" value={overview?.priority_leads||0}/>
   <GdKpi icon={<Calendar/>} label="Follow-ups vencidos" value={overdue}/>
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
    <div className="gd-source-list">{sourceTop.map((x,i)=><div key={i}><span><b>{x.source}</b><small>{x.campaign||'sem campanha'} · {x.content||'sem conteúdo'}</small></span><strong>{x.leads} lead{x.leads===1?'':'s'}<small>score {x.avg_score??'—'}</small></strong></div>)}{!sourceTop.length&&<p className="gd-empty">Aguardando os primeiros leads rastreados.</p>}</div>
   </article>
  </div>

  <article className="mn-card"><div className="gd-card-head"><div><small>ATIVIDADE</small><h2>Eventos por dia</h2></div></div>
   <div className="gd-bars">{daily.slice().reverse().slice(-14).map((x,i)=><div key={i} title={String(x.day)}><i style={{height:Math.max(4,Number(x.total_events||0)/maxViews*100)+'%'}}/><span>{String(x.day||'').slice(5)}</span></div>)}{!daily.length&&<p className="gd-empty">Sem eventos ainda.</p>}</div>
  </article>

  <article className="mn-card gd-leads"><div className="gd-card-head"><div><small>PIPELINE</small><h2>Caixa de entrada comercial</h2></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos os estágios</option>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></div>
   <div className="gd-table-wrap"><table><thead><tr><th>Lead</th><th>Origem</th><th>Plano</th><th>Score</th><th>Estágio</th><th>Próxima ação</th><th>Contato</th></tr></thead><tbody>
    {shown.map(x=><tr key={x.id}>
      <td><b>{x.name||'Sem nome'}</b><small>{x.company||'Empresa não informada'} · {dateTime(x.created_at)}</small></td>
      <td><b>{x.acquisition_source||'direct'}</b><small>{x.utm_campaign||'sem campanha'}</small></td>
      <td>{x.recommended_plan||'—'}</td>
      <td><span className={'gd-score '+(Number(x.commercial_score)>=80?'hot':Number(x.commercial_score)>=60?'good':'')}>{x.commercial_score??'—'}</span></td>
      <td><select value={x.lifecycle_stage} onChange={e=>updateStage(x.id,e.target.value)}>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></td>
      <td><button className={'gd-follow '+(x.next_follow_up_at&&new Date(x.next_follow_up_at).getTime()<now?'late':'')} onClick={()=>setSelected({...x,next_follow_up_at:localInput(x.next_follow_up_at)})}><b>{x.next_action||'Definir ação'}</b><small>{x.next_follow_up_at?dateTime(x.next_follow_up_at):'Sem data'}</small></button></td>
      <td>{x.whatsapp_link?<a className="gd-wa" href={x.whatsapp_link} target="_blank" rel="noreferrer"><MessageCircle size={15}/>WhatsApp<ExternalLink size={12}/></a>:<span>—</span>}</td>
    </tr>)}
    {!shown.length&&<tr><td colSpan="7" className="gd-empty">Nenhum lead neste estágio.</td></tr>}
   </tbody></table></div>
  </article>

  {selected&&<div className="gd-modal"><div className="gd-modal-card">
    <div className="gd-modal-head"><div><small>ACOMPANHAMENTO COMERCIAL</small><h2>{selected.name||'Lead'} · {selected.company||'Empresa não informada'}</h2></div><button onClick={()=>setSelected(null)}><X/></button></div>
    <div className="gd-modal-grid">
      <label>Próxima ação<input value={selected.next_action||''} onChange={e=>setSelected({...selected,next_action:e.target.value})} placeholder="Ex.: ligar, enviar proposta, agendar demonstração"/></label>
      <label>Data do follow-up<input type="datetime-local" value={selected.next_follow_up_at||''} onChange={e=>setSelected({...selected,next_follow_up_at:e.target.value})}/></label>
    </div>
    <label className="gd-notes">Notas comerciais<textarea rows="5" value={selected.commercial_notes||''} onChange={e=>setSelected({...selected,commercial_notes:e.target.value})} placeholder="Contexto, objeções, necessidades e próximos passos."/></label>
    <div className="gd-contact-meta"><span>Último contato: <b>{dateTime(selected.last_contact_at)}</b></span><span>Score: <b>{selected.commercial_score??'—'}</b></span><span>Plano: <b>{selected.recommended_plan||'—'}</b></span></div>
    <div className="gd-modal-actions"><button onClick={markContact} disabled={saving}><MessageCircle size={15}/>Registrar contato agora</button><button className="gd-primary" onClick={saveFollowUp} disabled={saving}><Save size={15}/>{saving?'Salvando...':'Salvar acompanhamento'}</button></div>
  </div></div>}
 </section>
}

function GdKpi({icon,label,value}){return <article className="mn-kpi"><div><span>{label}</span>{icon}</div><strong>{value}</strong></article>}
function Funnel({label,value}){return <div className="gd-funnel-row"><span>{label}</span><strong>{value}</strong></div>}
