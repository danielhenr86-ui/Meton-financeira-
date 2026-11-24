import Papa from 'papaparse';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_.-]+/g,' ').replace(/\s+/g,' ').trim();
const clean=s=>String(s??'').replace(/^\uFEFF/,'').trim();
const DATE=['data','date','dt','data lancamento','data do lancamento','data movimento','data movimentacao','data transacao','posted date','transaction date'];
const DESC=['descricao','historico','lancamento','detalhes','memo','description','transaction','estabelecimento','favorecido','nome'];
const VALUE=['valor','amount','valor lancamento','valor do lancamento','valor transacao','value'];
const DEBIT=['debito','valor debito','debit','saida'];const CREDIT=['credito','valor credito','credit','entrada'];const TYPE=['tipo','natureza','type','debito credito','dc'];
const key=(keys,candidates)=>keys.find(k=>candidates.includes(norm(k)))||keys.find(k=>candidates.some(c=>norm(k).includes(c)))||null;
function money(v){if(v==null||v==='')return NaN;let s=String(v).trim().replace(/R\$|\s/g,'');let negative=/^\(.*\)$/.test(s)||s.startsWith('-');s=s.replace(/[()]/g,'').replace(/^\+|-$/g,'');if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'')}else if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?(negative?-Math.abs(n):n):NaN}
function date(v){if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);if(typeof v==='number'&&v>20000&&v<100000){const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000);return d.toISOString().slice(0,10)}const s=clean(v);let m=s.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})/);if(m)return `${m[3]}-${m[2]}-${m[1]}`;m=s.match(/^(\d{4})[\/.-](\d{2})[\/.-](\d{2})/);if(m)return `${m[1]}-${m[2]}-${m[3]}`;m=s.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{2})/);if(m)return `20${m[3]}-${m[2]}-${m[1]}`;return null}
function parseMatrix(raw,format){raw=raw.map(r=>r.map(clean));let best=-1,header=0;raw.slice(0,20).forEach((r,i)=>{const score=r.reduce((s,c)=>s+(DATE.includes(norm(c))?3:0)+(DESC.includes(norm(c))?3:0)+([...VALUE,...DEBIT,...CREDIT].includes(norm(c))?3:0),0);if(score>best){best=score;header=i}});const cols=raw[header]||[];const idx=k=>k===null?-1:cols.indexOf(k);const di=idx(key(cols,DATE)),xi=idx(key(cols,DESC)),vi=idx(key(cols,VALUE)),db=idx(key(cols,DEBIT)),cr=idx(key(cols,CREDIT)),ti=idx(key(cols,TYPE));const errors=[];if(di<0)errors.push('Coluna de data não identificada.');if(xi<0)errors.push('Coluna de descrição não identificada.');if(vi<0&&db<0&&cr<0)errors.push('Coluna de valor/débito/crédito não identificada.');const rows=[];if(errors.length)return{rows,errors,meta:{format,headerIndex:header+1}};for(let i=header+1;i<raw.length;i++){const r=raw[i];const d=date(r[di]),description=clean(r[xi]);let amount=vi>=0?money(r[vi]):NaN;if((!Number.isFinite(amount)||amount===0)&&db>=0){const x=money(r[db]);if(Number.isFinite(x)&&x!==0)amount=-Math.abs(x)}if((!Number.isFinite(amount)||amount===0)&&cr>=0){const x=money(r[cr]);if(Number.isFinite(x)&&x!==0)amount=Math.abs(x)}if(Number.isFinite(amount)&&ti>=0){const t=norm(r[ti]);if(/deb|saida|^d$/.test(t))amount=-Math.abs(amount);if(/cred|entrada|^c$/.test(t))amount=Math.abs(amount)}if(d&&description&&Number.isFinite(amount)&&amount!==0)rows.push({date:d,description,amount,line:i+1})}return{rows,errors:rows.length?[]:['Nenhuma movimentação válida reconhecida.'],meta:{format,headerIndex:header+1}}}
function ofx(text){const entries=text.match(/<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST>))/gi)||[];const value=(s,k)=>{const m=s.match(new RegExp('<'+k+'>([^<\\r\\n]+)','i'));return m?.[1]?.trim()||''};const rows=entries.map((s,i)=>{const rawDate=value(s,'DTPOSTED');const d=/^\d{8}/.test(rawDate)?rawDate.slice(0,4)+'-'+rawDate.slice(4,6)+'-'+rawDate.slice(6,8):null;const description=value(s,'MEMO')||value(s,'NAME')||'Movimentação OFX';return{date:d,description,amount:money(value(s,'TRNAMT')),line:i+1,fitid:value(s,'FITID')}}).filter(x=>x.date&&Number.isFinite(x.amount)&&x.amount!==0);return{rows,errors:rows.length?[]:['Nenhuma transação STMTTRN reconhecida no OFX.'],meta:{format:'OFX',headerIndex:null}}}
async function decode(file){const bytes=new Uint8Array(await file.arrayBuffer());let s=new TextDecoder('utf-8').decode(bytes);if((s.match(/�/g)||[]).length>3)s=new TextDecoder('windows-1252').decode(bytes);return s}
export async function parseBankFile(file,password=''){
 if(file.size>15*1024*1024)throw Error('Arquivo maior que 15 MB. Divida o extrato em períodos menores.');
 const ext=file.name.split('.').pop().toLowerCase();
 if(ext==='ofx')return ofx(await decode(file));
 if(ext==='xlsx'||ext==='xls'){
  const XLSX=await import('xlsx');let wb;try{wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});}catch(e){if(/password|encrypt|protected|unsupported/i.test(String(e?.message||'')))throw Object.assign(new Error('Esta planilha Excel está criptografada. A leitura com senha não é suportada neste importador; exporte uma cópia CSV ou XLSX sem criptografia.'),{code:'ENCRYPTED_EXCEL'});throw e;}
  let best={rows:[],errors:['Nenhuma planilha reconhecida.'],meta:{format:'XLSX'}};
  for(const name of wb.SheetNames){const matrix=XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:'',raw:false});const parsed=parseMatrix(matrix,'Excel · '+name);if(parsed.rows.length>best.rows.length)best=parsed}
  return best;
 }
 if(ext==='pdf'){
  const pdfjs=await import('pdfjs-dist/build/pdf.mjs');
  const workerUrl=(await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
  let pdf;try{pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),password:password||undefined}).promise;}catch(e){if(e?.name==='PasswordException'||/password/i.test(String(e?.message||'')))throw Object.assign(new Error(password?'Senha incorreta. Verifique e tente novamente.':'Este PDF exige senha para leitura.'),{code:'PASSWORD_REQUIRED'});throw e;}
  const lines=[];for(let i=1;i<=Math.min(pdf.numPages,30);i++){const page=await pdf.getPage(i);const content=await page.getTextContent();let y=null,line=[];for(const item of content.items){if(!item.str)continue;const nextY=Math.round(item.transform?.[5]||0);if(y!==null&&Math.abs(y-nextY)>3){lines.push(line.join(' '));line=[]}line.push(item.str);y=nextY}if(line.length)lines.push(line.join(' '))}
  // Only accept explicit credit/debit/balance columns; never infer a movement from the last value.
  const rows=[];let rejected=0;
  for(let i=0;i<lines.length;i++){
   const s=lines[i].trim();
   if(!/^\d{2}\/\d{2}\/\d{4}\s/.test(s))continue;
   const m=s.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d[\d.]*,\d{2})\s+(\d[\d.]*,\d{2})\s+(-?\d[\d.]*,\d{2})$/);
   if(!m){rejected++;continue;}
   const cr=money(m[3]),db=money(m[4]);
   if(!((cr>0&&db===0)||(db>0&&cr===0))){rejected++;continue;}
   rows.push({date:date(m[1]),description:m[2]+' '+m[3]+'   '+m[4],amount:cr-db,line:i+1});
  }
  // Existing corrected imports have preserved raw descriptions; block PDF reimports until source identity is reconciled.
  return {rows,errors:['Importação PDF temporariamente bloqueada para conferência de integridade e prevenção de duplicidades. Utilize OFX ou CSV.'],meta:{format:'PDF (prévia de crédito/débito)',headerIndex:null,rejected}};

 }
 if(ext==='csv'||ext==='txt'){
  const text=await decode(file);const candidates=[';',',','\t','|'];const lines=text.split(/\r?\n/).slice(0,8).join('\n');const delimiter=candidates.sort((a,b)=>lines.split(b).length-lines.split(a).length)[0];const matrix=Papa.parse(text,{delimiter,skipEmptyLines:'greedy'}).data;return parseMatrix(matrix,'CSV · '+(delimiter==='\t'?'TAB':delimiter));
 }
 throw Error('Formato não suportado. Envie CSV, OFX, XLSX, XLS ou PDF.');
}
