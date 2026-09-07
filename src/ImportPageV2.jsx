import React,{useMemo,useState}from'react';
import Papa from'papaparse';
import{AlertTriangle,CheckCircle2,FileSpreadsheet,RefreshCw,Trash2,UploadCloud}from'lucide-react';
import{supabase}from'./cloud.js';

const DATE_KEYS=['data','date','dt','data lancamento','data do lancamento','data movimento','data movimentacao','data transacao','data da transacao','posted date','transaction date'];
const DESC_KEYS=['descricao','descrição','historico','histórico','lancamento','lançamento','detalhes','memo','description','transaction','estabelecimento','favorecido','nome'];
const VALUE_KEYS=['valor','amount','valor lancamento','valor do lancamento','valor transacao','valor da transacao','value'];
const DEBIT_KEYS=['debito','débito','valor debito','valor débito','debit','saida','saída'];
const CREDIT_KEYS=['credito','crédito','valor credito','valor crédito','credit','entrada'];
const TYPE_KEYS=['tipo','natureza','type','debito credito','débito crédito','dc'];

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_.-]+/g,' ').replace(/\s+/g,' ').trim();
const clean=s=>String(s??'').replace(/^\uFEFF/,'').trim();
const findKey=(keys,candidates)=>keys.find(k=>candidates.includes(norm(k)))||keys.find(k=>candidates.some(c=>norm(k).includes(c)))||null;

function parseMoney(v){
 if(v==null||v==='')return NaN;
 let s=String(v).trim().replace(/R\$|\s/g,'');
 let neg=/^\(.*\)$/.test(s)||s.startsWith('-');
 s=s.replace(/[()]/g,'').replace(/^\+|-$/g,'');
 if(s.includes(',')&&s.includes('.')){
   if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');
   else s=s.replace(/,/g,'');
 }else if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
 const n=Number(s.replace(/[^0-9.-]/g,''));
 return Number.isFinite(n)?(neg?-Math.abs(n):n):NaN;
}
function parseDate(v){
 const s=clean(v);if(!s)return null;
 let m=s.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})/);if(m)return`${m[3]}-${m[2]}-${m[1]}`;
 m=s.match(/^(\d{4})[\/.-](\d{2})[\/.-](\d{2})/);if(m)return`${m[1]}-${m[2]}-${m[3]}`;
 m=s.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{2})/);if(m)return`20${m[3]}-${m[2]}-${m[1]}`;
 const d=new Date(s);return Number.isNaN(d.getTime())?null:d.toISOString().slice(0,10);
}
function decodeFile(file){return file.arrayBuffer().then(buf=>{const bytes=new Uint8Array(buf);let text=new TextDecoder('utf-8',{fatal:false}).decode(bytes);const replacement=(text.match(/�/g)||[]).length;if(replacement>3)try{text=new TextDecoder('windows-1252').decode(bytes)}catch{}return text})}
function detectDelimiter(text){const sample=text.split(/\r?\n/).slice(0,8).join('\n');const counts={';':(sample.match(/;/g)||[]).length,',':(sample.match(/,/g)||[]).length,'\t':(sample.match(/\t/g)||[]).length};return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]}
function headerScore(row){const cells=row.map(norm);return cells.reduce((score,c)=>score+(DATE_KEYS.includes(c)?3:0)+(DESC_KEYS.includes(c)?3:0)+(VALUE_KEYS.includes(c)||DEBIT_KEYS.includes(c)||CREDIT_KEYS.includes(c)?3:0),0)}
function parseStatement(text){
 const delimiter=detectDelimiter(text);const raw=Papa.parse(text,{delimiter,skipEmptyLines:'greedy'}).data.map(r=>r.map(clean));
 if(!raw.length)return{rows:[],errors:['Arquivo vazio.'],meta:{delimiter}};
 let headerIndex=0,best=-1;raw.slice(0,15).forEach((r,i)=>{const s=headerScore(r);if(s>best){best=s;headerIndex=i}});
 const headers=raw[headerIndex].map((h,i)=>h||`coluna_${i+1}`);const keys=headers;
 const dateKey=findKey(keys,DATE_KEYS),descKey=findKey(keys,DESC_KEYS),valueKey=findKey(keys,VALUE_KEYS),debitKey=findKey(keys,DEBIT_KEYS),creditKey=findKey(keys,CREDIT_KEYS),typeKey=findKey(keys,TYPE_KEYS);
 const idx=k=>k==null?-1:keys.indexOf(k);const di=idx(dateKey),xi=idx(descKey),vi=idx(valueKey),dbi=idx(debitKey),cri=idx(creditKey),ti=idx(typeKey);
 const errors=[];if(di<0)errors.push('Não foi localizada uma coluna de data.');if(xi<0)errors.push('Não foi localizada uma coluna de descrição/histórico.');if(vi<0&&dbi<0&&cri<0)errors.push('Não foi localizada coluna de valor, débito ou crédito.');
 const rows=[];for(let i=headerIndex+1;i<raw.length;i++){const r=raw[i];const date=parseDate(r[di]);const description=clean(r[xi]);let amount=NaN;
   if(vi>=0)amount=parseMoney(r[vi]);
   if(!Number.isFinite(amount)&&dbi>=0){const d=parseMoney(r[dbi]);if(Number.isFinite(d)&&d!==0)amount=-Math.abs(d)}
   if((!Number.isFinite(amount)||amount===0)&&cri>=0){const c=parseMoney(r[cri]);if(Number.isFinite(c)&&c!==0)amount=Math.abs(c)}
   if(Number.isFinite(amount)&&ti>=0){const t=norm(r[ti]);if(/deb|saida|d$/.test(t))amount=-Math.abs(amount);if(/cred|entrada|c$/.test(t))amount=Math.abs(amount)}
   if(!date||!description||!Number.isFinite(amount)||amount===0)continue;rows.push({date,description,amount,line:i+1});
 }
 return{rows,errors,meta:{delimiter:delimiter==='\t'?'TAB':delimiter,headerIndex:headerIndex+1,dateKey,descKey,valueKey:valueKey||`${debitKey||''}/${creditKey||''}`}};
}
async function sha256(s){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function classify(desc){const s=norm(desc);if(/pix recebido|ted receb|credito|salario|recebimento/.test(s))return'Recebimentos';if(/tarifa|taxa|iof|juros/.test(s))return'Tarifas bancárias';if(/imposto|darf|das|gps|tribut/.test(s))return'Impostos';if(/posto|combust|uber|99 |pedagio/.test(s))return'Transporte';if(/mercado|supermerc|ifood|restaur|padaria/.test(s))return'Alimentação';if(/farmac|hospital|clinica|saude/.test(s))return'Saúde';return'Outros'}

export default function ImportPageV2({session,reload,toast}){
 const[items,setItems]=useState([]);const[running,setRunning]=useState(false);const uid=session?.user?.id;
 const total=useMemo(()=>items.reduce((s,x)=>s+(x.parsed?.rows?.length||0),0),[items]);
 async function selectFiles(fileList){const selected=Array.from(fileList||[]).filter(f=>/\.csv$/i.test(f.name)||/csv/i.test(f.type));if(!selected.length)return toast('Selecione um ou mais arquivos CSV.','error');const next=[];for(const file of selected){try{const text=await decodeFile(file);const parsed=parseStatement(text);next.push({id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,file,scope:'PJ',parsed,status:'ready'});}catch(e){next.push({id:`${Date.now()}-${Math.random()}`,file,scope:'PJ',parsed:{rows:[],errors:[e.message||'Falha ao ler arquivo.'],meta:{}},status:'error'})}}setItems(v=>[...v,...next])}
 function update(id,patch){setItems(v=>v.map(x=>x.id===id?{...x,...patch}:x))}
 async function importAll(){if(!items.length)return;const valid=items.filter(x=>x.parsed.rows.length&&!x.parsed.errors.length);if(!valid.length)return toast('Nenhum arquivo válido para importar.','error');setRunning(true);let ok=0,dup=0,fail=0;
  for(const item of valid){update(item.id,{status:'importing'});let localOk=0,localDup=0,localFail=0;for(const r of item.parsed.rows){try{const raw=`${item.scope}|${r.date}|${norm(r.description)}|${Number(r.amount).toFixed(2)}`;const hash=await sha256(raw);const payload={user_id:uid,scope:item.scope,kind:r.amount>0?'income':'expense',status:'paid',description:r.description,category:classify(r.description),amount:Math.abs(r.amount),occurred_on:r.date,source_name:item.file.name,source_hash:hash};const{error}=await supabase.from('financial_transactions').insert(payload);if(error?.code==='23505'){dup++;localDup++}else if(error){fail++;localFail++}else{ok++;localOk++}}catch{fail++;localFail++}}
   update(item.id,{status:localFail?'partial':'done',result:{ok:localOk,dup:localDup,fail:localFail}});
  }
  setRunning(false);await reload(true);toast(`${ok} lançamentos importados, ${dup} duplicidades ignoradas${fail?`, ${fail} falhas`:''}.`,fail?'error':'success');
 }
 return <section className="mn-page"><div className="mn-title"><div><small>ENTRADA DE DADOS</small><h1>Importação bancária</h1><p>Envie vários extratos CSV e defina individualmente se cada arquivo pertence ao PF ou PJ. A Meton detecta automaticamente o formato do banco.</p></div></div><article className="mn-card"><small>UPLOAD</small><h2>Selecionar extratos</h2><div className="mn-upload"><label><UploadCloud size={36}/><b>Selecionar arquivos CSV</b><span>Você pode escolher mais de um arquivo de uma só vez.</span><input type="file"accept=".csv,text/csv"multiple onChange={e=>{selectFiles(e.target.files);e.target.value=''}}/></label></div></article>{items.length>0&&<article className="mn-card"style={{marginTop:18}}><small>PRÉ-VALIDAÇÃO</small><h2>{items.length} arquivo(s) · {total} movimentação(ões) reconhecida(s)</h2><div style={{display:'flex',flexDirection:'column',gap:12}}>{items.map(item=><div key={item.id}style={{border:'1px solid #dce6e0',borderRadius:14,padding:14}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><div><b style={{display:'flex',gap:7,alignItems:'center'}}><FileSpreadsheet size={16}/>{item.file.name}</b><small style={{display:'block',marginTop:5}}>{item.parsed.rows.length} linhas válidas · delimitador {item.parsed.meta.delimiter||'—'} · cabeçalho linha {item.parsed.meta.headerIndex||'—'}</small></div><button onClick={()=>setItems(v=>v.filter(x=>x.id!==item.id))}style={{border:0,background:'transparent',cursor:'pointer'}}><Trash2 size={16}/></button></div><div style={{display:'flex',gap:10,alignItems:'center',marginTop:12,flexWrap:'wrap'}}><label style={{display:'flex',gap:7,alignItems:'center'}}>Destino <select value={item.scope}onChange={e=>update(item.id,{scope:e.target.value})}><option value="PJ">PJ</option><option value="PF">PF</option></select></label>{item.parsed.errors.length?<span style={{color:'#b42318',display:'flex',gap:5,alignItems:'center'}}><AlertTriangle size={15}/>{item.parsed.errors.join(' ')}</span>:<span style={{color:'#0d8a55',display:'flex',gap:5,alignItems:'center'}}><CheckCircle2 size={15}/>Formato reconhecido</span>}</div>{item.result&&<small style={{display:'block',marginTop:10}}>{item.result.ok} importados · {item.result.dup} duplicados · {item.result.fail} falhas</small>}</div>)}</div><button className="mn-primary"disabled={running||!items.some(x=>x.parsed.rows.length&&!x.parsed.errors.length)}onClick={importAll}style={{marginTop:14}}>{running?<><RefreshCw className="spin"size={16}/>Importando...</>:<>Importar todos os extratos válidos</>}</button></article>}</section>
}
