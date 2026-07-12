import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  Compass, ListOrdered, CalendarClock, Upload, Settings2, Plus, Trash2,
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Wallet, Landmark,
  FileUp, Download, RotateCcw, X, ChevronRight, BellRing, LogOut, Mail,
  Lock, User, Eye, EyeOff, FileText, Share2, Copy, Users, ShieldCheck,
  KeyRound, Phone, Save, CheckCheck, PlayCircle, ChevronLeft, Sparkles,
  Camera, Pencil, Search, ArrowLeftRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line
} from "recharts";

/* ============================================================
   METON FINANCEIRA — Fase 1 · v4
   Novo: relatório mensal com dicas + compartilhar (WhatsApp,
   e-mail, salvar, copiar) · múltiplos usuários (admin/colaborador)
   Paleta: verde-escuro · verde-claro · branco · nude
   ============================================================ */

const STORAGE_KEY = "finradar:v1";     // dados financeiros
const USERS_KEY = "meton:users";       // lista de usuários
const AUTH_KEY = "meton:auth";         // conta única (versão anterior — migrada)
const SESSION_KEY = "meton:session";   // sessão {userId}
const CONTACTS_KEY = "meton:contacts"; // agenda de contatos p/ envio WhatsApp
const TUTORIAL_KEY = "meton:tutorialSeen"; // apresentação já vista

const DARK = "#14532d";
const LIGHT = "#86efac";
const NUDE = "#F6F0E8";
const NUDE_DEEP = "#C9A87C";

const CATEGORIES = [
  "Recebimentos", "Alimentação", "Moradia", "Transporte", "Saúde",
  "Impostos", "Fornecedores", "Pró-labore", "Tarifas bancárias",
  "Investimentos", "Lazer", "Educação", "Outros"
];

const DEFAULT_RULES = [
  // ----- Impostos -----
  { keyword: "das", category: "Impostos" }, { keyword: "darf", category: "Impostos" },
  { keyword: "simples", category: "Impostos" }, { keyword: "inss", category: "Impostos" },
  { keyword: "gps", category: "Impostos" }, { keyword: "dctf", category: "Impostos" },
  { keyword: "fgts", category: "Impostos" }, { keyword: "iptu", category: "Impostos" },
  { keyword: "ipva", category: "Impostos" }, { keyword: "issqn", category: "Impostos" },
  { keyword: "gare", category: "Impostos" }, { keyword: "receita federal", category: "Impostos" },
  // ----- Transporte -----
  { keyword: "uber", category: "Transporte" }, { keyword: "99app", category: "Transporte" },
  { keyword: "99pop", category: "Transporte" }, { keyword: "cabify", category: "Transporte" },
  { keyword: "posto", category: "Transporte" }, { keyword: "combustivel", category: "Transporte" },
  { keyword: "shell", category: "Transporte" }, { keyword: "ipiranga", category: "Transporte" },
  { keyword: "petrobras", category: "Transporte" }, { keyword: "ale", category: "Transporte" },
  { keyword: "estacionamento", category: "Transporte" }, { keyword: "estapar", category: "Transporte" },
  { keyword: "pedagio", category: "Transporte" }, { keyword: "sem parar", category: "Transporte" },
  { keyword: "veloe", category: "Transporte" }, { keyword: "conectcar", category: "Transporte" },
  { keyword: "metro", category: "Transporte" }, { keyword: "bilhete unico", category: "Transporte" },
  { keyword: "latam", category: "Transporte" }, { keyword: "gol", category: "Transporte" },
  { keyword: "azul", category: "Transporte" }, { keyword: "localiza", category: "Transporte" },
  { keyword: "movida", category: "Transporte" }, { keyword: "unidas", category: "Transporte" },
  // ----- Alimentação (mercado) -----
  { keyword: "mercado", category: "Alimentação" }, { keyword: "supermercado", category: "Alimentação" },
  { keyword: "atacadao", category: "Alimentação" }, { keyword: "assai", category: "Alimentação" },
  { keyword: "carrefour", category: "Alimentação" }, { keyword: "pao de acucar", category: "Alimentação" },
  { keyword: "extra", category: "Alimentação" }, { keyword: "big", category: "Alimentação" },
  { keyword: "dia", category: "Alimentação" }, { keyword: "sacolao", category: "Alimentação" },
  { keyword: "hortifruti", category: "Alimentação" }, { keyword: "acougue", category: "Alimentação" },
  { keyword: "padaria", category: "Alimentação" }, { keyword: "panificadora", category: "Alimentação" },
  // ----- Alimentação (comer fora / delivery) -----
  { keyword: "ifood", category: "Alimentação" }, { keyword: "rappi", category: "Alimentação" },
  { keyword: "restaurante", category: "Alimentação" }, { keyword: "lanchonete", category: "Alimentação" },
  { keyword: "mcdonalds", category: "Alimentação" }, { keyword: "burger king", category: "Alimentação" },
  { keyword: "bk ", category: "Alimentação" }, { keyword: "subway", category: "Alimentação" },
  { keyword: "habib", category: "Alimentação" }, { keyword: "pizza", category: "Alimentação" },
  { keyword: "starbucks", category: "Alimentação" }, { keyword: "cafe", category: "Alimentação" },
  { keyword: "bar ", category: "Alimentação" }, { keyword: "boteco", category: "Alimentação" },
  // ----- Moradia / contas de casa -----
  { keyword: "aluguel", category: "Moradia" }, { keyword: "condominio", category: "Moradia" },
  { keyword: "energia", category: "Moradia" }, { keyword: "enel", category: "Moradia" },
  { keyword: "cpfl", category: "Moradia" }, { keyword: "cemig", category: "Moradia" },
  { keyword: "light", category: "Moradia" }, { keyword: "eletropaulo", category: "Moradia" },
  { keyword: "sabesp", category: "Moradia" }, { keyword: "agua", category: "Moradia" },
  { keyword: "comgas", category: "Moradia" }, { keyword: "gas ", category: "Moradia" },
  { keyword: "internet", category: "Moradia" }, { keyword: "vivo fibra", category: "Moradia" },
  { keyword: "claro", category: "Moradia" }, { keyword: "tim", category: "Moradia" },
  { keyword: "vivo", category: "Moradia" }, { keyword: "oi ", category: "Moradia" },
  { keyword: "net ", category: "Moradia" }, { keyword: "telefone", category: "Moradia" },
  // ----- Saúde -----
  { keyword: "farmacia", category: "Saúde" }, { keyword: "drogaria", category: "Saúde" },
  { keyword: "drogasil", category: "Saúde" }, { keyword: "pacheco", category: "Saúde" },
  { keyword: "raia", category: "Saúde" }, { keyword: "pague menos", category: "Saúde" },
  { keyword: "unimed", category: "Saúde" }, { keyword: "amil", category: "Saúde" },
  { keyword: "hapvida", category: "Saúde" }, { keyword: "bradesco saude", category: "Saúde" },
  { keyword: "clinica", category: "Saúde" }, { keyword: "laboratorio", category: "Saúde" },
  { keyword: "hospital", category: "Saúde" }, { keyword: "dentista", category: "Saúde" },
  { keyword: "psicolog", category: "Saúde" }, { keyword: "academia", category: "Saúde" },
  { keyword: "smartfit", category: "Saúde" }, { keyword: "gympass", category: "Saúde" },
  // ----- Lazer / assinaturas -----
  { keyword: "netflix", category: "Lazer" }, { keyword: "spotify", category: "Lazer" },
  { keyword: "disney", category: "Lazer" }, { keyword: "prime video", category: "Lazer" },
  { keyword: "hbo", category: "Lazer" }, { keyword: "max ", category: "Lazer" },
  { keyword: "globoplay", category: "Lazer" }, { keyword: "deezer", category: "Lazer" },
  { keyword: "youtube premium", category: "Lazer" }, { keyword: "cinema", category: "Lazer" },
  { keyword: "cinemark", category: "Lazer" }, { keyword: "ingresso", category: "Lazer" },
  { keyword: "steam", category: "Lazer" }, { keyword: "playstation", category: "Lazer" },
  { keyword: "xbox", category: "Lazer" },
  // ----- Educação -----
  { keyword: "escola", category: "Educação" }, { keyword: "faculdade", category: "Educação" },
  { keyword: "universidade", category: "Educação" }, { keyword: "curso", category: "Educação" },
  { keyword: "udemy", category: "Educação" }, { keyword: "alura", category: "Educação" },
  { keyword: "hotmart", category: "Educação" }, { keyword: "mensalidade", category: "Educação" },
  { keyword: "livraria", category: "Educação" }, { keyword: "kindle", category: "Educação" },
  // ----- Fornecedores / compras -----
  { keyword: "amazon", category: "Fornecedores" }, { keyword: "mercado livre", category: "Fornecedores" },
  { keyword: "mercadolivre", category: "Fornecedores" }, { keyword: "shopee", category: "Fornecedores" },
  { keyword: "aliexpress", category: "Fornecedores" }, { keyword: "magazine", category: "Fornecedores" },
  { keyword: "magalu", category: "Fornecedores" }, { keyword: "americanas", category: "Fornecedores" },
  { keyword: "casas bahia", category: "Fornecedores" }, { keyword: "papelaria", category: "Fornecedores" },
  { keyword: "correios", category: "Fornecedores" },
  // ----- Pró-labore / receita -----
  { keyword: "prolabore", category: "Pró-labore" }, { keyword: "pro labore", category: "Pró-labore" },
  { keyword: "salario", category: "Pró-labore" }, { keyword: "honorarios", category: "Recebimentos" },
  { keyword: "honorario", category: "Recebimentos" },
  // ----- Tarifas bancárias -----
  { keyword: "tarifa", category: "Tarifas bancárias" }, { keyword: "anuidade", category: "Tarifas bancárias" },
  { keyword: "iof", category: "Tarifas bancárias" }, { keyword: "juros", category: "Tarifas bancárias" },
  { keyword: "cesta", category: "Tarifas bancárias" }, { keyword: "manutencao conta", category: "Tarifas bancárias" },
  // ----- Investimentos -----
  { keyword: "cdb", category: "Investimentos" }, { keyword: "tesouro", category: "Investimentos" },
  { keyword: "rendimento", category: "Investimentos" }, { keyword: "aplicacao", category: "Investimentos" },
  { keyword: "lci", category: "Investimentos" }, { keyword: "lca", category: "Investimentos" },
  { keyword: "fundo", category: "Investimentos" }, { keyword: "xp investimentos", category: "Investimentos" },
  { keyword: "rico", category: "Investimentos" }, { keyword: "nuinvest", category: "Investimentos" },
];

const STOPWORDS = new Set([
  "pix", "ted", "doc", "transferencia", "transf", "pagamento", "pgto",
  "compra", "debito", "credito", "cartao", "de", "para", "com", "via",
  "recebido", "recebida", "enviado", "enviada", "banco", "conta", "ltda", "me", "sa"
]);

// palavras que indicam transferência entre as carteiras da mesma pessoa (PF<->PJ)
const TRANSFER_KEYWORDS = ["prolabore", "pro labore", "transferencia entre contas", "transf entre contas", "transferencia propria", "entre carteiras"];

// detecta se a descrição sugere transferência interna
function looksLikeTransfer(desc) {
  const nd = normalize(desc);
  return TRANSFER_KEYWORDS.some((k) => nd.includes(k));
}

// um lançamento é transferência se marcado manualmente (transfer===true/false) ou, na ausência de marca, pela heurística
function isTransfer(t) {
  if (typeof t.transfer === "boolean") return t.transfer;
  return looksLikeTransfer(t.desc);
}

/* ---------- meio de pagamento ---------- */

function paymentMethod(desc) {
  const nd = normalize(desc);
  if (/\bpix\b/.test(nd)) return "Pix";
  if (nd.includes("credito") || nd.includes("cartao de credito") || nd.includes("fatura")) return "Crédito";
  if (nd.includes("debito") || nd.includes("cartao de debito")) return "Débito";
  if (nd.includes("boleto")) return "Boleto";
  if (nd.includes("ted") || nd.includes("doc") || nd.includes("transferencia")) return "TED/DOC";
  if (nd.includes("saque") || nd.includes("dinheiro")) return "Dinheiro";
  return "Outros";
}

/* ---------- provisão de parcelas ---------- */

// total ainda a pagar/receber de uma conta parcelada (parcelas restantes)
function remainingProvision(b) {
  if (b.recur === "parcelado" && b.installments) {
    const restantes = Math.max(0, b.installments - ((b.installmentIndex || 1) - 1));
    return b.amount * restantes;
  }
  return b.amount;
}

/* ---------- helpers ---------- */

const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const normalize = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const txHash = (t) => `${t.date}|${t.amount.toFixed(2)}|${normalize(t.desc).slice(0, 40)}`;
const monthKey = (iso) => iso.slice(0, 7);
const MONTH_NAMES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${names[parseInt(m, 10) - 1]}/${y.slice(2)}`;
};
const monthFull = (key) => {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} de ${y}`;
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const prevMonthKey = (key) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const parseBRNumber = (raw) => {
  if (typeof raw === "number") return raw;
  let s = String(raw || "").trim().replace(/R\$\s?/i, "");
  const neg = /^-|^\(/.test(s) || /D$/.test(s.trim());
  s = s.replace(/[()]/g, "").replace(/[CD]$/i, "").trim();
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return null;
  return neg && n > 0 ? -n : n;
};

const applyRules = (desc, rules) => {
  const nd = normalize(desc);
  for (const r of rules) if (nd.includes(r.keyword)) return r.category;
  return "Outros";
};

const extractKeyword = (desc) => {
  const words = normalize(desc).split(" ").filter((w) => w.length > 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
  if (!words.length) return null;
  return words.sort((a, b) => b.length - a.length)[0];
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------- duplicados ---------- */

// agrupa transações por hash e retorna só os grupos com repetição
function findDuplicateTx(tx) {
  const groups = {};
  for (const t of tx) {
    const h = txHash(t);
    (groups[h] = groups[h] || []).push(t);
  }
  return Object.values(groups).filter((g) => g.length > 1);
}

// remove repetidos exatos mantendo o primeiro de cada grupo
function dedupeTx(tx) {
  const seen = new Set();
  const kept = [];
  let removed = 0;
  for (const t of tx) {
    const h = txHash(t);
    if (seen.has(h)) { removed++; continue; }
    seen.add(h);
    kept.push(t);
  }
  return { kept, removed };
}

/* ---------- telefone (WhatsApp) ---------- */

// normaliza para o formato aceito pelo wa.me: só dígitos, com DDI 55 se faltar
function normalizePhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 11) d = "55" + d; // assume Brasil se não veio DDI
  return d;
}
function formatPhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length >= 12) { // 55 + DDD + numero
    const ddi = d.slice(0, 2), ddd = d.slice(2, 4), n = d.slice(4);
    return `+${ddi} (${ddd}) ${n.slice(0, n.length - 4)}-${n.slice(-4)}`;
  }
  return raw;
}

async function sha256(text) {
  // usa crypto.subtle quando disponível (contexto seguro); senão, hash simples de reserva
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) { /* cai no fallback */ }
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return "fb" + h.toString(16).padStart(8, "0");
}

/* ---------- armazenamento resiliente (memória de reserva) ----------
   Em alguns webviews (ex.: WhatsApp Business) window.storage pode falhar.
   Este invólucro nunca lança erro: mantém tudo em memória e tenta persistir
   por baixo. Assim o app continua utilizável mesmo sem persistência. */
const memStore = {};
const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage && window.storage.get) {
        const r = await window.storage.get(key);
        if (r && typeof r.value !== "undefined") { memStore[key] = r.value; return r; }
      }
    } catch (e) { /* usa memória */ }
    return key in memStore ? { key, value: memStore[key] } : null;
  },
  async set(key, value) {
    memStore[key] = value; // memória sempre primeiro (garante a sessão)
    try {
      if (typeof window !== "undefined" && window.storage && window.storage.set) {
        return await window.storage.set(key, value);
      }
    } catch (e) { /* silencioso: memória já cobre */ }
    return { key, value };
  },
  async delete(key) {
    delete memStore[key];
    try {
      if (typeof window !== "undefined" && window.storage && window.storage.delete) {
        return await window.storage.delete(key);
      }
    } catch (e) { /* silencioso */ }
    return { key, deleted: true };
  },
};

/* ---------- parsers ---------- */

function parseOFX(text) {
  const out = [];
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  for (const b of blocks) {
    const get = (tag) => {
      const m = b.match(new RegExp(`<${tag}>([^<\\r\\n]*)`, "i"));
      return m ? m[1].trim() : "";
    };
    const dt = get("DTPOSTED").slice(0, 8);
    const amt = parseBRNumber(get("TRNAMT"));
    const desc = get("MEMO") || get("NAME") || "Sem descrição";
    if (dt.length === 8 && amt !== null) {
      out.push({ date: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`, amount: amt, desc });
    }
  }
  return out;
}

function parseCSV(text) {
  const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  if (!res.data.length) return [];
  const headers = res.meta.fields.map((h) => normalize(h));
  const find = (...cands) => {
    const i = headers.findIndex((h) => cands.some((c) => h.includes(c)));
    return i >= 0 ? res.meta.fields[i] : null;
  };
  const colDate = find("data", "date");
  const colDesc = find("descricao", "historico", "lancamento", "memo", "detalhe", "titulo");
  const colVal = find("valor", "amount", "quantia", "montante");
  if (!colDate || !colVal) return [];
  const out = [];
  for (const row of res.data) {
    const rawD = String(row[colDate] || "").trim();
    let iso = null;
    let m;
    if ((m = rawD.match(/^(\d{2})[\/\-.](\d{2})[\/\-.](\d{4})/))) iso = `${m[3]}-${m[2]}-${m[1]}`;
    else if ((m = rawD.match(/^(\d{4})-(\d{2})-(\d{2})/))) iso = m[0];
    const amt = parseBRNumber(row[colVal]);
    if (iso && amt !== null && amt !== 0) {
      out.push({ date: iso, amount: amt, desc: String(row[colDesc] || "Sem descrição").trim() });
    }
  }
  return out;
}

/* ---------- leitor de PDF (extratos em PDF) ---------- */

let pdfjsPromise = null;
function loadPdfJs() {
  if (typeof window !== "undefined" && window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } catch (e) {}
      resolve(window.pdfjsLib);
    };
    s.onerror = () => reject(new Error("Não foi possível carregar o leitor de PDF."));
    document.head.appendChild(s);
  });
  return pdfjsPromise;
}

async function parsePDF(file) {
  const pdfjs = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const lines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // agrupa itens de texto por linha (mesma coordenada Y aproximada)
    const rows = {};
    for (const it of content.items) {
      const y = Math.round(it.transform[5]);
      const key = Math.round(y / 3); // tolerância
      (rows[key] = rows[key] || []).push({ x: it.transform[4], s: it.str });
    }
    Object.keys(rows)
      .sort((a, b) => b - a)
      .forEach((k) => {
        const line = rows[k].sort((a, b) => a.x - b.x).map((i) => i.s).join(" ").replace(/\s+/g, " ").trim();
        if (line) lines.push(line);
      });
  }
  return linesToTx(lines);
}

/* transforma linhas de texto (PDF ou OCR) em lançamentos, por heurística */
function linesToTx(lines) {
  const out = [];
  const dateRe = /(\d{2})[\/.\-](\d{2})(?:[\/.\-](\d{2,4}))?/;
  const valRe = /(-?\s?R?\$?\s?\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD])?/g;
  const year = new Date().getFullYear();
  for (const raw of lines) {
    const line = String(raw || "").replace(/\s+/g, " ").trim();
    const dm = line.match(dateRe);
    if (!dm) continue;
    const vals = [...line.matchAll(valRe)];
    if (!vals.length) continue;
    const last = vals[vals.length - 1];
    let amt = parseBRNumber(last[1]);
    if (amt === null) continue;
    if (last[2] === "D") amt = -Math.abs(amt);
    if (last[2] === "C") amt = Math.abs(amt);
    let yy = dm[3] ? (dm[3].length === 2 ? "20" + dm[3] : dm[3]) : String(year);
    const iso = `${yy}-${dm[2]}-${dm[1]}`;
    let desc = line.replace(dateRe, "").replace(valRe, "").replace(/\s+/g, " ").trim();
    if (desc.length < 2) desc = "Lançamento";
    if (amt !== 0) out.push({ date: iso, amount: amt, desc: desc.slice(0, 60) });
  }
  return out;
}

/* ---------- leitura de foto de extrato (OCR) ---------- */

let tessPromise = null;
function loadTesseract() {
  if (typeof window !== "undefined" && window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tessPromise) return tessPromise;
  tessPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js";
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error("Não foi possível carregar o leitor de imagem (OCR)."));
    document.head.appendChild(s);
  });
  return tessPromise;
}

async function parsePhoto(file, onProgress) {
  const Tesseract = await loadTesseract();
  const url = URL.createObjectURL(file);
  try {
    const { data } = await Tesseract.recognize(url, "por+eng", {
      logger: (m) => { if (m.status === "recognizing text" && onProgress) onProgress(Math.round(m.progress * 100)); },
    });
    const lines = (data.text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return linesToTx(lines);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- gerador de PDF ---------- */

let jspdfPromise = null;
function loadJsPDF() {
  if (typeof window !== "undefined" && window.jspdf) return Promise.resolve(window.jspdf);
  if (jspdfPromise) return jspdfPromise;
  jspdfPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf);
    s.onerror = () => reject(new Error("Não foi possível carregar o gerador de PDF."));
    document.head.appendChild(s);
  });
  return jspdfPromise;
}

// gera um PDF a partir de um texto (linhas) e retorna um Blob
async function textToPdf(title, textLines) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;
  doc.setFillColor(20, 83, 45);
  doc.rect(0, 0, 595, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Meton Financeira", margin, 38);
  y = 90;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, margin, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  for (const raw of textLines) {
    const line = String(raw).replace(/[*_]/g, "");
    const wrapped = doc.splitTextToSize(line || " ", 595 - margin * 2);
    for (const w of wrapped) {
      if (y > 800) { doc.addPage(); y = margin; }
      doc.text(w, margin, y);
      y += 15;
    }
  }
  return doc.output("blob");
}

/* ---------- dados de exemplo ---------- */

function sampleData() {
  const tx = [];
  const now = new Date();
  const push = (mOff, day, amount, desc, wallet) => {
    const d = new Date(now.getFullYear(), now.getMonth() - mOff, day);
    tx.push({ id: uid(), date: d.toISOString().slice(0, 10), amount, desc, wallet, category: null });
  };
  for (let m = 5; m >= 0; m--) {
    push(m, 5, 6500 + m * 120, "PIX recebido cliente honorarios", "PJ");
    push(m, 12, 2800, "PIX recebido cliente consultoria", "PJ");
    push(m, 20, -76.9, "DAS Simples Nacional", "PJ");
    push(m, 8, -3200, "Transferencia prolabore", "PJ");
    push(m, 8, 3200, "Prolabore recebido", "PF");
    push(m, 10, -1400, "Aluguel apartamento", "PF");
    push(m, 11, -(480 + m * 22), "Supermercado Atacadao", "PF");
    push(m, 15, -(180 + m * 9), "Posto Shell combustivel", "PF");
    push(m, 18, -129.9, "Internet fibra", "PF");
    push(m, 22, -(95 + m * 6), "iFood restaurante", "PF");
    push(m, 25, -350, "CDB aplicacao automatica", "PF");
    push(m, 27, -34.9, "Tarifa manutencao conta", "PJ");
  }
  const due = new Date(now); due.setDate(due.getDate() + 3);
  const due2 = new Date(now); due2.setDate(due2.getDate() + 12);
  const bills = [
    { id: uid(), desc: "DAS Simples Nacional", amount: 76.9, dueDate: due.toISOString().slice(0, 10), type: "pagar", recurring: true, recur: "mensal", category: "Impostos", paid: false, wallet: "PJ" },
    { id: uid(), desc: "Aluguel", amount: 1400, dueDate: due2.toISOString().slice(0, 10), type: "pagar", recurring: true, recur: "mensal", category: "Moradia", paid: false, wallet: "PF" },
    { id: uid(), desc: "Honorários cliente Omega", amount: 890, dueDate: due2.toISOString().slice(0, 10), type: "receber", recurring: true, recur: "mensal", category: "Recebimentos", paid: false, wallet: "PJ" },
  ];
  return { tx, bills };
}

/* ============================================================
   RELATÓRIO MENSAL — motor de análise (regras, transparente)
   ============================================================ */

function buildMonthStats(tx, mKey, catOf) {
  const mTx = tx.filter((t) => monthKey(t.date) === mKey);
  // totais consolidados ignoram transferências entre carteiras (dinheiro mudando de bolso)
  const flow = mTx.filter((t) => !isTransfer(t));
  const inn = flow.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = flow.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const byWallet = {};
  for (const w of ["PF", "PJ"]) {
    // no detalhamento por carteira, transferências aparecem (é onde o pró-labore faz sentido)
    const wt = mTx.filter((t) => t.wallet === w);
    byWallet[w] = {
      in: wt.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      out: wt.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0),
    };
  }
  const cats = {};
  for (const t of flow) {
    if (t.amount >= 0) continue;
    const c = catOf(t);
    cats[c] = (cats[c] || 0) - t.amount;
  }
  return { inn, out, result: inn - out, byWallet, cats, count: mTx.length };
}

/* ---------- relatório de período livre (para exportação) ---------- */

function buildPeriodReport({ from, to, tx, bills, catOf, userName }) {
  const inRange = (d) => d >= from && d <= to;
  const rows = tx.filter((t) => inRange(t.date));
  const flow = rows.filter((t) => !isTransfer(t));
  const inn = flow.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = flow.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const byWallet = {};
  for (const w of ["PF", "PJ"]) {
    const wt = rows.filter((t) => t.wallet === w);
    byWallet[w] = {
      in: wt.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      out: wt.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0),
    };
  }
  const cats = {};
  for (const t of flow) { if (t.amount < 0) { const c = catOf(t); cats[c] = (cats[c] || 0) - t.amount; } }
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const methods = {};
  for (const t of rows) {
    const m = paymentMethod(t.desc);
    if (!methods[m]) methods[m] = { in: 0, out: 0 };
    if (t.amount >= 0) methods[m].in += t.amount; else methods[m].out -= t.amount;
  }

  const fmt = (iso) => iso.split("-").reverse().join("/");
  const lines = [
    `RELATÓRIO POR PERÍODO`,
    `De ${fmt(from)} a ${fmt(to)}`,
    ``,
    `RESULTADO`,
    `Entradas: ${brl(inn)}`,
    `Saídas: ${brl(out)}`,
    `Resultado: ${brl(inn - out)}`,
    `Lançamentos: ${rows.length}`,
    ``,
    `POR CARTEIRA`,
    `PF: entrou ${brl(byWallet.PF.in)} · saiu ${brl(byWallet.PF.out)}`,
    `PJ: entrou ${brl(byWallet.PJ.in)} · saiu ${brl(byWallet.PJ.out)}`,
    ``,
    `GASTOS POR CATEGORIA`,
    ...topCats.map(([c, v]) => `- ${c}: ${brl(v)}`),
    ``,
    `POR MEIO DE PAGAMENTO`,
    ...Object.entries(methods).map(([m, v]) => `- ${m}: entrou ${brl(v.in)} · saiu ${brl(v.out)}`),
    ``,
    `Gerado por ${userName} em ${todayISO().split("-").reverse().join("/")} — Meton Financeira`,
    `Conteúdo educacional. Não constitui recomendação de investimento.`,
  ];
  return { inn, out, result: inn - out, count: rows.length, text: lines.join("\n") };
}

/* ---------- previsão de fluxo de caixa (retrospecto + contas futuras) ---------- */

function buildForecast({ tx, bills, saldoTotal, wallet }) {
  // fluxo médio mensal dos últimos 3 meses (ignora transferências)
  const flow = tx.filter((t) => (wallet === "Tudo" ? !isTransfer(t) : t.wallet === wallet));
  const now = new Date();
  const keys = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  let ins = 0, outs = 0, n = 0;
  for (const k of keys) {
    const mt = flow.filter((t) => monthKey(t.date) === k);
    if (!mt.length) continue;
    ins += mt.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    outs += mt.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
    n++;
  }
  const avgIn = n ? ins / n : 0;
  const avgOut = n ? outs / n : 0;
  const avgNet = avgIn - avgOut; // saldo médio que sobra por mês

  // contas a pagar/receber já cadastradas nos próximos 90 dias
  const today = new Date(todayISO());
  const horizons = [30, 60, 90];
  const upcoming = bills.filter((b) => !b.paid).filter((b) => wallet === "Tudo" || b.wallet === wallet);
  const proj = horizons.map((h) => {
    const limit = new Date(today); limit.setDate(limit.getDate() + h);
    let billsPay = 0, billsRecv = 0;
    for (const b of upcoming) {
      const due = new Date(b.dueDate);
      if (due >= today && due <= limit) {
        if (b.type === "pagar") billsPay += b.amount;
        else billsRecv += b.amount;
      }
    }
    // projeção = saldo atual + (fluxo médio proporcional aos meses) + contas conhecidas do período
    const months = h / 30;
    const projected = saldoTotal + avgNet * months + billsRecv - billsPay;
    return { horizon: h, projected, billsPay, billsRecv };
  });

  // dia estimado em que o saldo zera, se o fluxo médio for negativo
  let daysToZero = null;
  if (avgNet < 0 && saldoTotal > 0) {
    const dailyBurn = Math.abs(avgNet) / 30;
    daysToZero = Math.round(saldoTotal / dailyBurn);
  }

  return { avgIn, avgOut, avgNet, proj, daysToZero, monthsUsed: n };
}

function buildReport({ mKey, tx, bills, catOf, saldoTotal, userName }) {
  const cur = buildMonthStats(tx, mKey, catOf);
  const prev = buildMonthStats(tx, prevMonthKey(mKey), catOf);
  const savings = cur.inn > 0 ? cur.result / cur.inn : null;
  const topCats = Object.entries(cur.cats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const overdue = bills.filter((b) => !b.paid && b.dueDate < todayISO());
  const avgOut3 = (() => {
    let s = 0, n = 0, k = mKey;
    for (let i = 0; i < 3; i++) {
      const st = buildMonthStats(tx, k, catOf);
      if (st.count) { s += st.out; n++; }
      k = prevMonthKey(k);
    }
    return n ? s / n : 0;
  })();
  const reserve = avgOut3 > 0 ? Math.max(0, saldoTotal) / avgOut3 : null;

  const pctDelta = (a, b) => (b > 0 ? ((a - b) / b) * 100 : null);
  const dIn = pctDelta(cur.inn, prev.inn);
  const dOut = pctDelta(cur.out, prev.out);

  /* --- dicas (baseadas em regras, explicadas) --- */
  const tips = [];
  if (cur.result < 0) {
    tips.push(`🔴 Você gastou ${brl(-cur.result)} a mais do que ganhou. Antes de cortar tudo, olhe as 2 maiores categorias abaixo: é lá que um corte pequeno tem o maior efeito.`);
  } else if (savings !== null && savings < 0.1) {
    tips.push(`🟡 Sobrou só ${(savings * 100).toFixed(0)}% do que entrou. A referência saudável é guardar de 15% a 20%. Tente separar essa fatia no dia em que o dinheiro entra, não no fim do mês.`);
  } else if (savings !== null && savings >= 0.2) {
    tips.push(`🟢 Excelente: sobraram ${(savings * 100).toFixed(0)}% das entradas. Dinheiro parado perde valor com o tempo — vale estudar opções conservadoras (informação educacional; não é recomendação de investimento).`);
  }
  for (const [cat, val] of topCats) {
    const prevVal = prev.cats[cat] || 0;
    const d = pctDelta(val, prevVal);
    if (d !== null && d > 25) {
      tips.push(`⚠️ "${cat}" subiu ${d.toFixed(0)}% em relação ao mês anterior (${brl(prevVal)} → ${brl(val)}). Vale conferir se foi algo pontual ou um novo padrão de gasto.`);
      break;
    }
  }
  if (dOut !== null && dOut > 15 && dIn !== null && dIn < 5) {
    tips.push(`⚠️ Suas saídas cresceram ${dOut.toFixed(0)}% mas as entradas quase não mudaram. Esse descompasso, se repetir por 2-3 meses, corrói a reserva.`);
  }
  if (overdue.length) {
    tips.push(`🔴 Há ${overdue.length} conta(s) vencida(s) sem baixa. Atraso gera juros e multa — priorize quitar ou registrar o pagamento.`);
  }
  if (reserve !== null && reserve < 3) {
    tips.push(`🟡 Sua reserva cobre ${reserve.toFixed(1)} mês(es) de despesas. A meta mínima de segurança é 3 a 6 meses — especialmente importante para quem tem renda variável.`);
  }
  if ((cur.byWallet.PJ?.in || 0) > 0 && !Object.keys(cur.cats).includes("Impostos")) {
    tips.push(`🟡 A PJ teve receita no mês, mas não vi despesa de Impostos registrada. Confira se o DAS do período foi pago e lançado.`);
  }
  if (!tips.length) tips.push(`🟢 Mês equilibrado, sem alertas relevantes. Mantenha o ritmo e continue registrando tudo — a qualidade do relatório depende da qualidade dos lançamentos.`);

  /* --- orientação educativa sobre o que fazer com a sobra (NÃO é recomendação de ativo) --- */
  const eduTips = [];
  if (savings !== null && savings >= 0.15 && reserve !== null && reserve < 6) {
    eduTips.push(`💡 Você tem sobra, mas a reserva ainda não cobre 6 meses. Prioridade educacional: primeiro complete a reserva de emergência em algo de alta liquidez e baixo risco, antes de pensar em investimentos de prazo mais longo.`);
  } else if (savings !== null && savings >= 0.15 && reserve !== null && reserve >= 6) {
    eduTips.push(`💡 Reserva saudável e sobra consistente. A partir daqui, é comum estudar diversificação por prazo e objetivo (renda fixa, previdência, etc.). Isto é conteúdo educacional — a escolha de produtos deve ser feita com um profissional certificado, considerando seu perfil de risco.`);
  }
  if (cur.result > 0) {
    eduTips.push(`💡 Dinheiro parado em conta perde para a inflação ao longo do tempo. Vale se informar sobre opções conservadoras de curto prazo. O Meton não recomenda ativos específicos — busque orientação de um assessor registrado na CVM.`);
  }
  eduTips.push(`⚠️ As orientações acima são educativas e gerais, não constituem recomendação de investimento (art. da Resolução CVM sobre consultoria de valores mobiliários). Decisões devem considerar seu perfil e, idealmente, apoio profissional.`);

  /* --- texto compartilhável --- */
  const arrow = (d) => (d === null ? "" : d >= 0 ? ` (▲ ${d.toFixed(0)}%)` : ` (▼ ${(-d).toFixed(0)}%)`);
  const lines = [
    `📊 *RELATÓRIO MENSAL — METON FINANCEIRA*`,
    `🗓 ${monthFull(mKey)}`,
    ``,
    `*RESULTADO DO MÊS*`,
    `Entradas: ${brl(cur.inn)}${arrow(dIn)}`,
    `Saídas: ${brl(cur.out)}${arrow(dOut)}`,
    `Resultado: ${cur.result >= 0 ? "🟢" : "🔴"} ${brl(cur.result)}`,
    savings !== null ? `Taxa de sobra: ${(savings * 100).toFixed(0)}%` : null,
    ``,
    `*POR CARTEIRA*`,
    `PF: entrou ${brl(cur.byWallet.PF.in)} · saiu ${brl(cur.byWallet.PF.out)}`,
    `PJ: entrou ${brl(cur.byWallet.PJ.in)} · saiu ${brl(cur.byWallet.PJ.out)}`,
    ``,
    topCats.length ? `*MAIORES GASTOS*` : null,
    ...topCats.map(([c, v], i) => `${i + 1}. ${c}: ${brl(v)}`),
    topCats.length ? `` : null,
    `*DICAS DO MÊS*`,
    ...tips.map((t) => `• ${t.replace(/\*/g, "")}`),
    ``,
    `*ORIENTAÇÃO (educacional)*`,
    ...eduTips.map((t) => `• ${t.replace(/\*/g, "")}`),
    ``,
    reserve !== null ? `Reserva atual: ~${reserve.toFixed(1)} mês(es) de despesas` : null,
    ``,
    `_Gerado por ${userName} em ${todayISO().split("-").reverse().join("/")} · Meton Financeira_`,
    `_Conteúdo educacional. Não constitui recomendação de investimento._`,
  ].filter((l) => l !== null);

  return { cur, prev, savings, topCats, tips, eduTips, overdue, reserve, dIn, dOut, text: lines.join("\n") };
}

/* ---------- identidade visual ---------- */

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
  .mt-display { font-family: 'Sora', system-ui, sans-serif; }
  .mt-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
`;

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm ${className}`}>{children}</div>;
}

function SectionTitle({ children }) {
  return (
    <h3 className="mt-display text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
      <span className="inline-block w-4 h-0.5 rounded-full" style={{ background: NUDE_DEEP }} />
      {children}
    </h3>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3400);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] text-white text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 max-w-[90vw]" style={{ background: DARK }}>
      <CheckCircle2 size={16} className="shrink-0" style={{ color: LIGHT }} />
      <span className="truncate">{msg}</span>
    </div>
  );
}

function HealthGauge({ score, savings, commit, reserve }) {
  const zones = [
    { color: "#dc2626", label: "Crítico" },
    { color: "#d97706", label: "Atenção" },
    { color: "#15803d", label: "Saudável" },
  ];
  const pct = Math.max(2, Math.min(98, score));
  const zone = score < 34 ? 0 : score < 67 ? 1 : 2;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="mt-display text-xs font-bold uppercase tracking-widest text-stone-400">Saúde financeira</span>
        <span className="mt-display text-sm font-bold" style={{ color: zones[zone].color }}>{zones[zone].label}</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden flex">
        <div className="flex-1" style={{ background: "#fca5a5" }} />
        <div className="flex-1" style={{ background: "#fcd34d" }} />
        <div className="flex-1" style={{ background: LIGHT }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full shadow"
          style={{ left: `${pct}%`, background: DARK, border: "2px solid white", transition: "left .6s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div>
          <div className="mt-mono text-sm font-semibold text-stone-800">{savings === null ? "—" : `${(savings * 100).toFixed(0)}%`}</div>
          <div className="text-[11px] text-stone-500 leading-tight">sobra do que entra</div>
        </div>
        <div>
          <div className="mt-mono text-sm font-semibold text-stone-800">{commit === null ? "—" : `${(commit * 100).toFixed(0)}%`}</div>
          <div className="text-[11px] text-stone-500 leading-tight">renda comprometida</div>
        </div>
        <div>
          <div className="mt-mono text-sm font-semibold text-stone-800">{reserve === null ? "—" : `${reserve.toFixed(1)} m`}</div>
          <div className="text-[11px] text-stone-500 leading-tight">reserva (meses)</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL DE COMPARAÇÃO ENTRE MESES
   ============================================================ */

function CompareModal({ tx, catOf, onClose }) {
  const months = useMemo(() => {
    const set = new Set(tx.map((t) => monthKey(t.date)));
    return Array.from(set).sort().reverse().slice(0, 6); // até 6 meses recentes
  }, [tx]);
  const cols = months.slice(0, 4).reverse(); // exibe até 4, cronológico

  const stats = useMemo(() => cols.map((k) => buildMonthStats(tx, k, catOf)), [cols, tx, catOf]);

  // categorias presentes em qualquer mês, ordenadas pela soma total
  const cats = useMemo(() => {
    const totals = {};
    for (const s of stats) for (const [c, v] of Object.entries(s.cats)) totals[c] = (totals[c] || 0) + v;
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [stats]);

  const delta = (cur, prev) => {
    if (prev === 0 || prev === undefined) return null;
    return ((cur - prev) / prev) * 100;
  };
  const DeltaTag = ({ d, invert }) => {
    if (d === null || Math.abs(d) < 1) return <span className="text-stone-300 text-[10px]">—</span>;
    const bad = invert ? d < 0 : d > 0; // para gastos, subir é ruim
    return (
      <span className={`text-[10px] font-bold ${bad ? "text-rose-600" : "text-green-700"}`}>
        {d >= 0 ? "▲" : "▼"}{Math.abs(d).toFixed(0)}%
      </span>
    );
  };

  const cell = "px-2 py-2 text-right mt-mono text-xs whitespace-nowrap";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: NUDE }}>
      <style>{fontStyles}</style>
      <div className="text-white px-4 pb-4 shrink-0" style={{ background: DARK, paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: LIGHT }} />
            <span className="mt-display font-bold">Comparar meses</span>
          </div>
          <button onClick={onClose} className="text-green-200 p-2 -m-2" aria-label="Fechar"><X size={22} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3 pb-6">
          {cols.length < 2 ? (
            <Card className="p-6 text-center text-sm text-stone-500">
              É preciso ter lançamentos em pelo menos 2 meses para comparar. Importe mais extratos ou carregue os dados de exemplo.
            </Card>
          ) : (
            <>
              {/* Gráfico de evolução */}
              <Card className="p-4">
                <SectionTitle>Evolução de entradas e saídas</SectionTitle>
                <div className="h-48 -ml-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cols.map((k, i) => ({ mes: monthLabel(k), Entradas: Math.round(stats[i].inn), Saídas: Math.round(stats[i].out), Resultado: Math.round(stats[i].result) }))} barGap={2}>
                      <CartesianGrid vertical={false} stroke="#e7e5e4" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={44}
                        tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                      <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Entradas" fill={DARK} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Saídas" fill={NUDE_DEEP} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-32 -ml-3 mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cols.map((k, i) => ({ mes: monthLabel(k), Resultado: Math.round(stats[i].result) }))}>
                      <CartesianGrid vertical={false} stroke="#e7e5e4" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={44}
                        tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                      <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }} />
                      <Line type="monotone" dataKey="Resultado" stroke={DARK} strokeWidth={2.5} dot={{ r: 3, fill: DARK }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-stone-400 text-center">Linha = resultado (entradas − saídas) de cada mês.</p>
              </Card>

              {/* Resumo */}
              <Card className="p-3 overflow-x-auto">
                <SectionTitle>Resumo do mês</SectionTitle>
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] uppercase text-stone-400">
                      <th className="text-left px-2 py-1 font-bold">—</th>
                      {cols.map((k) => <th key={k} className="text-right px-2 py-1 font-bold">{monthLabel(k)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-stone-100">
                      <td className="px-2 py-2 text-xs font-semibold text-green-800">Entradas</td>
                      {stats.map((s, i) => (
                        <td key={i} className={cell}>
                          <div className="text-green-800 font-semibold">{brl(s.inn)}</div>
                          {i > 0 && <DeltaTag d={delta(s.inn, stats[i - 1].inn)} />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-stone-100">
                      <td className="px-2 py-2 text-xs font-semibold text-stone-700">Saídas</td>
                      {stats.map((s, i) => (
                        <td key={i} className={cell}>
                          <div className="text-stone-800 font-semibold">{brl(s.out)}</div>
                          {i > 0 && <DeltaTag d={delta(s.out, stats[i - 1].out)} invert />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-stone-100" style={{ background: NUDE }}>
                      <td className="px-2 py-2 text-xs font-bold">Resultado</td>
                      {stats.map((s, i) => (
                        <td key={i} className={cell}>
                          <span className={`font-bold ${s.result >= 0 ? "text-green-800" : "text-rose-600"}`}>{brl(s.result)}</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </Card>

              {/* Por categoria */}
              <Card className="p-3 overflow-x-auto">
                <SectionTitle>Gastos por categoria</SectionTitle>
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] uppercase text-stone-400">
                      <th className="text-left px-2 py-1 font-bold">Categoria</th>
                      {cols.map((k) => <th key={k} className="text-right px-2 py-1 font-bold">{monthLabel(k)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cats.map((c) => (
                      <tr key={c} className="border-t border-stone-100">
                        <td className="px-2 py-2 text-xs text-stone-700">{c}</td>
                        {stats.map((s, i) => {
                          const v = s.cats[c] || 0;
                          const pv = i > 0 ? (stats[i - 1].cats[c] || 0) : undefined;
                          return (
                            <td key={i} className={cell}>
                              <div className="text-stone-800">{v ? brl(v) : "—"}</div>
                              {i > 0 && v > 0 && <DeltaTag d={delta(v, pv)} invert />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <p className="text-[11px] text-stone-400 px-1 leading-relaxed">
                ▲ vermelho = gasto subiu · ▼ verde = gasto caiu (nas entradas, a lógica é inversa).
                Comparação sempre contra o mês imediatamente anterior exibido.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL DE RELATÓRIO
   ============================================================ */

function ReportModal({ tx, bills, catOf, saldoTotal, userName, contacts, onSaveContact, onClose, setToast }) {
  const months = useMemo(() => {
    const set = new Set(tx.map((t) => monthKey(t.date)));
    return Array.from(set).sort().reverse();
  }, [tx]);
  const [mKey, setMKey] = useState(months[0] || monthKey(todayISO()));
  const [showWa, setShowWa] = useState(false);
  const [phone, setPhone] = useState("");
  const [saveContactName, setSaveContactName] = useState("");
  const report = useMemo(
    () => buildReport({ mKey, tx, bills, catOf, saldoTotal, userName }),
    [mKey, tx, bills, catOf, saldoTotal, userName]
  );

  const sendWhatsAppTo = (num) => {
    const n = normalizePhone(num);
    const url = n
      ? `https://wa.me/${n}?text=${encodeURIComponent(report.text)}`
      : `https://wa.me/?text=${encodeURIComponent(report.text)}`;
    window.open(url, "_blank");
  };
  const shareEmail = () => {
    const subject = `Relatório Mensal Meton — ${monthFull(mKey)}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(report.text.replace(/\*/g, ""))}`, "_blank");
  };
  const saveTxt = () => {
    const blob = new Blob([report.text.replace(/\*/g, "")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-meton-${mKey}.txt`;
    a.click();
    setToast("Relatório salvo como arquivo de texto.");
  };
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(report.text);
      setToast("Relatório copiado. Cole onde quiser.");
    } catch (e) {
      setToast("Não consegui copiar automaticamente neste navegador.");
    }
  };

  const arrowBadge = (d) => {
    if (d === null) return null;
    const up = d >= 0;
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-800"}`}>
        {up ? "▲" : "▼"} {Math.abs(d).toFixed(0)}%
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: NUDE }}>
      <style>{fontStyles}</style>
      {/* topo */}
      <div className="text-white px-4 pb-4 shrink-0" style={{ background: DARK, paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: LIGHT }} />
            <span className="mt-display font-bold">Relatório mensal</span>
          </div>
          <button onClick={onClose} className="text-green-200 p-2 -m-2" aria-label="Fechar"><X size={22} /></button>
        </div>
        <div className="max-w-lg mx-auto mt-3">
          <select value={mKey} onChange={(e) => setMKey(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm font-semibold bg-green-950/50 border border-green-800 text-white">
            {months.length ? months.map((k) => <option key={k} value={k}>{monthFull(k)}</option>)
              : <option value={mKey}>{monthFull(mKey)}</option>}
          </select>
        </div>
      </div>

      {/* corpo rolável */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3 pb-4">
          <Card className="p-4">
            <SectionTitle>Resultado de {monthFull(mKey)}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">Entradas {arrowBadge(report.dIn !== null ? report.dIn : null)}</div>
                <div className="mt-mono font-semibold text-green-800">{brl(report.cur.inn)}</div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">Saídas {arrowBadge(report.dOut)}</div>
                <div className="mt-mono font-semibold text-stone-800">{brl(report.cur.out)}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-600">Resultado</span>
              <span className={`mt-mono text-lg font-bold ${report.cur.result >= 0 ? "text-green-800" : "text-rose-600"}`}>
                {brl(report.cur.result)}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
              <span>PF: {brl(report.cur.byWallet.PF.in)} / {brl(report.cur.byWallet.PF.out)}</span>
              <span>PJ: {brl(report.cur.byWallet.PJ.in)} / {brl(report.cur.byWallet.PJ.out)}</span>
            </div>
          </Card>

          {report.topCats.length > 0 && (
            <Card className="p-4">
              <SectionTitle>Maiores gastos do mês</SectionTitle>
              <div className="space-y-2">
                {report.topCats.map(([c, v], i) => (
                  <div key={c} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{i + 1}. {c}</span>
                    <span className="mt-mono font-semibold">{brl(v)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <SectionTitle>Dicas do Meton</SectionTitle>
            <div className="space-y-2.5">
              {report.tips.map((t, i) => (
                <p key={i} className="text-sm text-stone-700 leading-snug">{t}</p>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle>Orientação (educacional)</SectionTitle>
            <div className="space-y-2.5">
              {report.eduTips.map((t, i) => (
                <p key={i} className="text-sm text-stone-700 leading-snug">{t}</p>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-3 leading-snug">
              Análise gerada por regras sobre os seus lançamentos. Conteúdo educacional — não constitui recomendação de investimento (CVM).
            </p>
          </Card>
        </div>
      </div>

      {/* barra de compartilhamento */}
      <div className="shrink-0 bg-white border-t border-stone-200 px-4 pt-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2">
          <button onClick={() => setShowWa(true)} className="flex flex-col items-center gap-1 py-2 rounded-xl text-white" style={{ background: "#25D366" }}>
            <Share2 size={17} />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </button>
          <button onClick={shareEmail} className="flex flex-col items-center gap-1 py-2 rounded-xl text-white" style={{ background: DARK }}>
            <Mail size={17} />
            <span className="text-[10px] font-bold">E-mail</span>
          </button>
          <button onClick={saveTxt} className="flex flex-col items-center gap-1 py-2 rounded-xl border border-stone-300 text-stone-700">
            <Download size={17} />
            <span className="text-[10px] font-bold">Salvar</span>
          </button>
          <button onClick={copyText} className="flex flex-col items-center gap-1 py-2 rounded-xl border border-stone-300 text-stone-700">
            <Copy size={17} />
            <span className="text-[10px] font-bold">Copiar</span>
          </button>
        </div>
      </div>

      {/* folha de envio WhatsApp para qualquer contato */}
      {showWa && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center" style={{ background: "rgba(20,83,45,0.5)" }} onClick={() => setShowWa(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="mt-display font-bold text-base flex items-center gap-2">
                <Share2 size={18} style={{ color: "#25D366" }} /> Enviar por WhatsApp
              </h3>
              <button onClick={() => setShowWa(false)} className="text-stone-400"><X size={20} /></button>
            </div>

            {/* digitar número */}
            <label className="block text-xs font-semibold text-stone-500 mb-1">Número do contato</label>
            <div className="relative mb-2">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
                placeholder="(11) 99999-9999 ou +55..."
                className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <button onClick={() => { sendWhatsAppTo(phone); setShowWa(false); }} disabled={!phone.trim()}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm mb-2 disabled:opacity-40" style={{ background: "#25D366" }}>
              Enviar para este número
            </button>

            {/* salvar contato */}
            {phone.trim() && (
              <div className="flex gap-2 mb-3">
                <input value={saveContactName} onChange={(e) => setSaveContactName(e.target.value)}
                  placeholder="Salvar como (nome)…"
                  className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none" />
                <button onClick={() => {
                  if (!saveContactName.trim()) return;
                  onSaveContact({ id: uid(), name: saveContactName.trim(), phone: normalizePhone(phone) });
                  setSaveContactName("");
                  setToast("Contato salvo na agenda.");
                }} className="px-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold flex items-center gap-1">
                  <Save size={14} /> Salvar
                </button>
              </div>
            )}

            {/* agenda salva */}
            {contacts.length > 0 && (
              <>
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">agenda</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl">
                  {contacts.map((c) => (
                    <button key={c.id} onClick={() => { sendWhatsAppTo(c.phone); setShowWa(false); }}
                      className="w-full p-3 flex items-center justify-between text-left">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[11px] text-stone-400">{formatPhone(c.phone)}</div>
                      </div>
                      <Share2 size={15} style={{ color: "#25D366" }} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* escolher no WhatsApp (sem número) */}
            <button onClick={() => { sendWhatsAppTo(""); setShowWa(false); }}
              className="w-full mt-3 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm">
              Escolher contato no WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APRESENTAÇÃO / TUTORIAL (dados fictícios)
   ============================================================ */

// mini-componentes visuais só para os mockups do tutorial
const MiniCard = ({ children, className = "", style = {} }) => (
  <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm ${className}`} style={style}>{children}</div>
);

function MiniGauge({ pos }) {
  return (
    <div className="relative h-3 rounded-full overflow-hidden flex w-full">
      <div className="flex-1" style={{ background: "#fca5a5" }} />
      <div className="flex-1" style={{ background: "#fcd34d" }} />
      <div className="flex-1" style={{ background: LIGHT }} />
      <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full shadow"
        style={{ left: `${pos}%`, background: DARK, border: "2px solid white" }} />
    </div>
  );
}

function MiniBars() {
  const data = [
    { e: 60, s: 40 }, { e: 75, s: 55 }, { e: 68, s: 62 }, { e: 90, s: 50 },
  ];
  return (
    <div className="flex items-end gap-3 h-24 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex items-end gap-1 justify-center">
          <div className="w-3 rounded-t" style={{ height: `${d.e}%`, background: DARK }} />
          <div className="w-3 rounded-t" style={{ height: `${d.s}%`, background: NUDE_DEEP }} />
        </div>
      ))}
    </div>
  );
}

const SLIDES = [
  {
    tag: "Bem-vindo",
    title: "Meton Financeira",
    body: "Seu radar financeiro: pessoa física e empresa no mesmo lugar. Veja este tour rápido — leva menos de 2 minutos.",
    visual: (
      <div className="flex flex-col items-center py-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: LIGHT }}>
          <Compass size={40} style={{ color: DARK }} />
        </div>
        <div className="flex gap-2">
          {["Radar", "Extrato", "Contas", "Relatório"].map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NUDE, color: DARK }}>{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    tag: "Passo 1 · Visão geral",
    title: "PF e PJ juntas, sem misturar",
    body: "No topo você troca entre Tudo, PF e PJ. O saldo consolidado soma as duas, mas você sempre vê separado quanto é seu e quanto é da empresa.",
    visual: (
      <div className="rounded-2xl p-4 text-white" style={{ background: DARK }}>
        <div className="text-[10px] uppercase tracking-widest text-green-200 mb-1">Saldo consolidado</div>
        <div className="mt-mono text-3xl font-semibold">R$ 12.480,00</div>
        <div className="flex gap-4 mt-3 text-xs text-green-100">
          <span className="flex items-center gap-1"><Wallet size={13} className="text-green-300" /> PF <b className="text-white">R$ 3.200</b></span>
          <span className="flex items-center gap-1"><Landmark size={13} className="text-green-300" /> PJ <b className="text-white">R$ 9.280</b></span>
        </div>
      </div>
    ),
  },
  {
    tag: "Passo 2 · Importar",
    title: "Traga seu extrato em 1 toque",
    body: "Baixe o extrato no app do seu banco e envie aqui em CSV, OFX ou PDF. Lançamentos repetidos são ignorados automaticamente.",
    visual: (
      <MiniCard className="p-4 text-center">
        <FileUp size={28} className="mx-auto mb-2" style={{ color: DARK }} />
        <div className="flex justify-center gap-2 mb-3">
          {["CSV", "OFX", "PDF"].map((t) => (
            <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NUDE, color: DARK }}>{t}</span>
          ))}
        </div>
        <div className="text-xs rounded-lg py-2 font-semibold text-white" style={{ background: DARK }}>extrato_itau_maio.ofx ✓</div>
      </MiniCard>
    ),
  },
  {
    tag: "Passo 3 · Organização",
    title: "Cada gasto se organiza sozinho",
    body: "O Meton reconhece o nome do lugar e classifica. Se errar, você corrige uma vez — e ele aprende para sempre.",
    visual: (
      <MiniCard className="divide-y divide-stone-100">
        {[
          ["iFood *Restaurante", "R$ 47,90", "Alimentação"],
          ["Posto Shell", "R$ 180,00", "Transporte"],
          ["Netflix.com", "R$ 39,90", "Lazer"],
        ].map(([d, v, c]) => (
          <div key={d} className="p-3 flex items-center justify-between text-xs">
            <span className="text-stone-700 truncate">{d}</span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="mt-mono text-stone-500">{v}</span>
              <ChevronRight size={12} className="text-stone-300" />
              <span className="font-bold px-1.5 py-0.5 rounded" style={{ background: NUDE, color: DARK }}>{c}</span>
            </span>
          </div>
        ))}
      </MiniCard>
    ),
  },
  {
    tag: "Passo 4 · Saúde",
    title: "Um semáforo da sua saúde financeira",
    body: "Verde, amarelo ou vermelho conforme quanto sobra, quanto da renda está comprometida e quantos meses de reserva você tem.",
    visual: (
      <MiniCard className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Saúde financeira</span>
          <span className="text-xs font-bold text-green-700">Saudável</span>
        </div>
        <MiniGauge pos={78} />
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          {[["22%", "sobra"], ["78%", "comprometido"], ["4,1m", "reserva"]].map(([v, l]) => (
            <div key={l}><div className="mt-mono text-sm font-semibold">{v}</div><div className="text-[10px] text-stone-400">{l}</div></div>
          ))}
        </div>
      </MiniCard>
    ),
  },
  {
    tag: "Passo 5 · Contas",
    title: "Nunca mais perca um vencimento",
    body: "Cadastre contas a pagar e a receber. O que vence em 7 dias vira alerta. Contas mensais (como o DAS) se renovam sozinhas ao dar baixa.",
    visual: (
      <MiniCard className="p-4 border-amber-300" style={{ background: "#fffbeb" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-amber-900">DAS Simples Nacional</div>
            <div className="text-[11px] text-amber-700 flex items-center gap-1 mt-0.5"><AlertTriangle size={11} /> Vence em 3 dias · PJ</div>
          </div>
          <div className="text-right">
            <div className="mt-mono font-semibold text-amber-900">R$ 76,90</div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-block mt-1" style={{ background: DARK }}>Paguei</span>
          </div>
        </div>
      </MiniCard>
    ),
  },
  {
    tag: "Passo 6 · Relatório",
    title: "Relatório mensal com dicas de verdade",
    body: "Um resumo do mês com opinião sobre o resultado — e você compartilha por WhatsApp, e-mail ou salva o arquivo.",
    visual: (
      <MiniCard className="p-4">
        <div className="text-xs text-stone-700 space-y-1 mb-3">
          <div className="font-bold" style={{ color: DARK }}>📊 Maio · Resultado: <span className="text-green-800">+R$ 2.180</span></div>
          <div className="text-stone-500 leading-snug">🟡 "Alimentação subiu 28% vs. abril. Vale conferir se foi pontual."</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="py-1.5 rounded-lg text-white text-[10px] font-bold text-center" style={{ background: "#25D366" }}>WhatsApp</div>
          <div className="py-1.5 rounded-lg text-white text-[10px] font-bold text-center" style={{ background: DARK }}>E-mail</div>
          <div className="py-1.5 rounded-lg border border-stone-300 text-[10px] font-bold text-center text-stone-600">Salvar</div>
          <div className="py-1.5 rounded-lg border border-stone-300 text-[10px] font-bold text-center text-stone-600">Copiar</div>
        </div>
      </MiniCard>
    ),
  },
  {
    tag: "Passo 7 · Comparar",
    title: "Compare com os meses anteriores",
    body: "Veja entradas, saídas e cada categoria lado a lado, com a variação de um mês para o outro em setas.",
    visual: (
      <MiniCard className="p-4">
        <MiniBars />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1 px-1">
          <span>fev</span><span>mar</span><span>abr</span><span>mai</span>
        </div>
        <div className="flex gap-3 justify-center mt-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: DARK }} /> Entradas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: NUDE_DEEP }} /> Saídas</span>
        </div>
      </MiniCard>
    ),
  },
  {
    tag: "Passo 8 · Equipe",
    title: "Compartilhe o acesso com quem confia",
    body: "Adicione outros usuários (seu sócio, seu contador, sua família). Cada um lança, edita e envia relatórios. Você controla quem entra.",
    visual: (
      <MiniCard className="divide-y divide-stone-100">
        {[["Daniel", "administrador", true], ["Clarice", "colaborador", false]].map(([n, r, adm]) => (
          <div key={n} className="p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: LIGHT }}><User size={15} style={{ color: DARK }} /></div>
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center gap-1">{n} {adm && <ShieldCheck size={12} style={{ color: DARK }} />}</div>
              <div className="text-[11px] text-stone-400">{r}</div>
            </div>
          </div>
        ))}
      </MiniCard>
    ),
  },
  {
    tag: "Tudo pronto",
    title: "Bora começar? É de graça.",
    body: "Crie sua conta em segundos, ou entre se já tiver uma. Quer testar antes? Depois de entrar, toque em 'Carregar dados de exemplo'.",
    visual: (
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3" style={{ background: LIGHT }}>
          <Sparkles size={30} style={{ color: DARK }} />
        </div>
        <p className="text-center text-xs text-stone-500 max-w-[220px]">
          Seus dados ficam no seu dispositivo. Você pode exportar um backup quando quiser.
        </p>
      </div>
    ),
  },
];

function Onboarding({ onClose }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];
  return (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: NUDE }}>
      <style>{fontStyles}</style>

      {/* topo: marca + pular */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: DARK }}>
            <Compass size={15} style={{ color: LIGHT }} />
          </div>
          <span className="mt-display font-extrabold text-sm" style={{ color: DARK }}>Meton</span>
        </div>
        <button onClick={onClose} className="text-xs font-semibold text-stone-400">Pular tour</button>
      </div>

      {/* conteúdo do slide */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: NUDE_DEEP }}>{s.tag}</div>
          <h2 className="mt-display font-extrabold text-2xl leading-tight mb-2" style={{ color: DARK }}>{s.title}</h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-5">{s.body}</p>
          <div>{s.visual}</div>
        </div>
      </div>

      {/* rodapé: pontos + navegação */}
      <div className="px-5 pb-8 pt-4 shrink-0">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center gap-1.5 mb-4">
            {SLIDES.map((_, k) => (
              <button key={k} onClick={() => setI(k)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: k === i ? 22 : 6, background: k === i ? DARK : "#d6d3d1" }} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="px-4 py-3 rounded-xl border border-stone-300 text-stone-600 font-semibold text-sm flex items-center gap-1">
                <ChevronLeft size={16} /> Voltar
              </button>
            )}
            <button onClick={() => (last ? onClose() : setI(i + 1))}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5"
              style={{ background: DARK }}>
              {last ? "Começar agora" : "Próximo"} {!last && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACESSO — múltiplos usuários
   ============================================================ */

const authInputCls = "w-full rounded-xl border border-stone-300 pl-10 pr-10 py-2.5 text-sm focus:outline-none bg-white";

function AuthField({ icon: Icon, type = "text", placeholder, value, onChange, revealable }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input className={authInputCls}
        type={revealable ? (show ? "text" : "password") : type}
        placeholder={placeholder} value={value} onChange={onChange} autoCapitalize="none" />
      {revealable && (
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

function AuthScreen({ users, onAuthed, onCreateFirst, onAddUser, onResetAccess, onShowTutorial }) {
  const hasUsers = users.length > 0;
  const [mode, setMode] = useState(hasUsers ? "login" : "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const emailOk = /\S+@\S+\.\S+/.test(email);

  const doSignup = async () => {
    setErr(""); setInfo("");
    if (!name.trim()) return setErr("Informe seu nome.");
    if (!emailOk) return setErr("E-mail inválido.");
    if (pass.length < 6) return setErr("A senha precisa de pelo menos 6 caracteres.");
    if (pass !== pass2) return setErr("As senhas não conferem.");
    if (users.some((u) => u.email === email.trim().toLowerCase()))
      return setErr("Já existe uma conta com este e-mail. Vá em 'Entrar'.");
    setBusy(true);
    const isFirst = !hasUsers;
    const user = { id: uid(), name: name.trim(), email: email.trim().toLowerCase(), passHash: await sha256(pass), role: isFirst ? "admin" : "colaborador" };
    if (isFirst) await onCreateFirst(user);
    else await onAddUser(user); // conta adicional entra direto
    setBusy(false);
  };

  const doLogin = async () => {
    setErr(""); setInfo("");
    if (!emailOk || !pass) return setErr("Preencha e-mail e senha.");
    setBusy(true);
    const h = await sha256(pass);
    const u = users.find((x) => x.email === email.trim().toLowerCase() && x.passHash === h);
    if (u) onAuthed(u);
    else setErr("E-mail ou senha incorretos.");
    setBusy(false);
  };

  const social = (provider) => {
    setErr("");
    setInfo(`Entrar com ${provider} estará disponível na versão publicada (exige servidor OAuth).`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NUDE }}>
      <style>{fontStyles}</style>
      <div className="pb-10 px-6 text-center" style={{ background: DARK, paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: LIGHT }}>
          <Compass size={28} style={{ color: DARK }} />
        </div>
        <h1 className="mt-display font-extrabold text-2xl text-white tracking-tight">Meton</h1>
        <div className="text-[11px] uppercase tracking-[0.3em]" style={{ color: LIGHT }}>Financeira</div>
        <p className="text-green-100 text-xs mt-3 max-w-xs mx-auto">
          Sua visão panorâmica das finanças pessoais e da empresa.
        </p>
        <button onClick={onShowTutorial}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: LIGHT, color: DARK }}>
          <PlayCircle size={15} /> Ver como funciona
        </button>
      </div>

      <div className="flex-1 px-5 -mt-5 pb-10">
        <Card className="max-w-md mx-auto p-5">
          {/* abas Entrar / Criar conta */}
          <div className="flex rounded-xl p-1 mb-5" style={{ background: NUDE }}>
            {[["login", "Entrar"], ["signup", "Criar conta"]].map(([m, l]) => (
              <button key={m}
                onClick={() => { setMode(m); setErr(""); setInfo(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === m ? "text-white" : "text-stone-500"}`}
                style={mode === m ? { background: DARK } : {}}>
                {l}
              </button>
            ))}
          </div>

          {mode === "login" && !hasUsers && (
            <p className="text-xs text-stone-500 mb-3 text-center">
              Nenhuma conta criada ainda. Toque em <b>Criar conta</b> para começar.
            </p>
          )}
          {mode === "signup" && !hasUsers && (
            <p className="text-xs text-stone-500 mb-3 text-center">
              Primeiro acesso: esta será a conta de <b>administrador</b>.
            </p>
          )}

          <div className="space-y-3">
            {mode === "signup" && (
              <AuthField icon={User} placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <AuthField icon={Mail} type="email" placeholder="E-mail (Gmail, Hotmail, iCloud…)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <AuthField icon={Lock} placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} revealable />
            {mode === "signup" && (
              <AuthField icon={Lock} placeholder="Confirme a senha" value={pass2} onChange={(e) => setPass2(e.target.value)} revealable />
            )}

            {err && <p className="text-xs font-semibold text-rose-600 text-center">{err}</p>}
            {info && <p className="text-xs font-semibold text-center" style={{ color: DARK }}>{info}</p>}

            <button disabled={busy}
              onClick={mode === "signup" ? doSignup : doLogin}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: DARK }}>
              {busy ? "Aguarde…" : mode === "signup" ? (hasUsers ? "Criar conta e entrar" : "Criar conta de administrador") : "Entrar"}
            </button>

            {mode === "login" && hasUsers && (
              <button onClick={() => setForgot(true)} className="w-full text-xs font-semibold text-stone-500 underline">
                Esqueci minha senha
              </button>
            )}
          </div>

          {forgot && (
            <div className="mt-3 rounded-xl p-3 text-xs leading-relaxed" style={{ background: NUDE }}>
              <p className="text-stone-600 mb-2">
                <b>Você é colaborador?</b> Peça ao administrador para redefinir sua senha em Ajustes › Usuários.
              </p>
              <p className="text-stone-600 mb-2">
                <b>Você é o administrador e esqueceu a senha?</b> É possível redefinir o acesso. Isso apaga apenas os logins — <b>seus lançamentos e relatórios são mantidos</b> — e você cria uma nova conta de administrador.
              </p>
              <button onClick={onResetAccess}
                className="w-full py-2 rounded-lg text-white font-semibold text-xs" style={{ background: "#b91c1c" }}>
                Redefinir acesso (mantém os dados financeiros)
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">ou continue com</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["Google", "#DB4437", "G"], ["Microsoft", "#0078D4", "M"], ["Apple", "#111111", ""]].map(([id, color, letter]) => (
              <button key={id} onClick={() => social(id)}
                className="py-2.5 rounded-xl border border-stone-300 bg-white flex items-center justify-center gap-1.5 text-sm font-semibold text-stone-700">
                <span className="mt-display font-extrabold" style={{ color }}>{letter}</span>{id}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-2 leading-snug">
            Login social requer a versão publicada com servidor (OAuth). Neste protótipo, use e-mail e senha.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ---------- modal: alterar a própria senha ---------- */

function ChangePasswordModal({ user, onClose, onSave, setToast }) {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [nw2, setNw2] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    const curHash = await sha256(cur);
    if (curHash !== user.passHash) return setErr("Senha atual incorreta.");
    if (nw.length < 6) return setErr("A nova senha precisa de pelo menos 6 caracteres.");
    if (nw !== nw2) return setErr("As senhas não conferem.");
    if (await sha256(nw) === user.passHash) return setErr("A nova senha é igual à atual.");
    onSave(await sha256(nw));
  };
  return (
    <ModalShell title="Alterar minha senha" onClose={onClose}>
      <div className="space-y-3">
        <AuthField icon={Lock} placeholder="Senha atual" value={cur} onChange={(e) => setCur(e.target.value)} revealable />
        <AuthField icon={KeyRound} placeholder="Nova senha" value={nw} onChange={(e) => setNw(e.target.value)} revealable />
        <AuthField icon={KeyRound} placeholder="Confirme a nova senha" value={nw2} onChange={(e) => setNw2(e.target.value)} revealable />
        {err && <p className="text-xs font-semibold text-rose-600 text-center">{err}</p>}
        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: DARK }}>
          Salvar nova senha
        </button>
      </div>
    </ModalShell>
  );
}

/* ---------- modal: admin redefine a senha de um usuário ---------- */

function ResetPasswordModal({ target, onClose, onSave }) {
  const [nw, setNw] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    setErr("");
    if (nw.length < 6) return setErr("Mínimo de 6 caracteres.");
    onSave(await sha256(nw));
  };
  return (
    <ModalShell title={`Redefinir senha de ${target.name}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-stone-500">
          Defina uma senha provisória e informe à pessoa. Ela poderá alterá-la depois em Ajustes.
        </p>
        <AuthField icon={KeyRound} placeholder="Senha provisória" value={nw} onChange={(e) => setNw(e.target.value)} revealable />
        {err && <p className="text-xs font-semibold text-rose-600 text-center">{err}</p>}
        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: DARK }}>
          Redefinir senha
        </button>
      </div>
    </ModalShell>
  );
}

/* ---------- modal: adicionar usuário (admin) ---------- */

function AddUserModal({ users, onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("colaborador");
  const [err, setErr] = useState("");
  const emailOk = /\S+@\S+\.\S+/.test(email);

  const save = async () => {
    setErr("");
    if (!name.trim()) return setErr("Informe o nome.");
    if (!emailOk) return setErr("E-mail inválido.");
    if (users.some((u) => u.email === email.trim().toLowerCase())) return setErr("Já existe usuário com este e-mail.");
    if (pass.length < 6) return setErr("Senha mínima de 6 caracteres.");
    onSave({ id: uid(), name: name.trim(), email: email.trim().toLowerCase(), passHash: await sha256(pass), role });
  };

  return (
    <ModalShell title="Adicionar usuário" onClose={onClose}>
      <div className="space-y-3">
        <AuthField icon={User} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <AuthField icon={Mail} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthField icon={Lock} placeholder="Senha provisória" value={pass} onChange={(e) => setPass(e.target.value)} revealable />
        <div className="flex gap-2">
          {[["colaborador", "Colaborador"], ["admin", "Administrador"]].map(([v, l]) => (
            <button key={v} onClick={() => setRole(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${role === v ? "text-white" : "border-stone-300 text-stone-600"}`}
              style={role === v ? { background: DARK, borderColor: DARK } : {}}>{l}</button>
          ))}
        </div>
        <p className="text-[11px] text-stone-400 leading-snug">
          Colaborador: lança, edita e gera/envia relatórios. Administrador: tudo isso + gerencia usuários e pode apagar dados.
        </p>
        {err && <p className="text-xs font-semibold text-rose-600 text-center">{err}</p>}
        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: DARK }}>
          Criar usuário
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */

export default function MetonFinanceira() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const [tx, setTx] = useState([]);
  const [bills, setBills] = useState([]);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("radar");
  const [wallet, setWallet] = useState("Tudo");
  const [toast, setToast] = useState(null);
  const [pending, setPending] = useState(null);
  const [importWallet, setImportWallet] = useState("PF");
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [showChangePass, setShowChangePass] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [addContact, setAddContact] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [extSearch, setExtSearch] = useState("");
  const [extCat, setExtCat] = useState("Todas");
  const contactsTimer = useRef(null);
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const backupRef = useRef(null);
  const saveTimer = useRef(null);
  const usersTimer = useRef(null);

  const isAdmin = currentUser?.role === "admin";

  /* carga inicial + migração da conta única antiga */
  useEffect(() => {
    (async () => {
      let loadedUsers = [];
      try {
        const u = await store.get(USERS_KEY);
        if (u?.value) loadedUsers = JSON.parse(u.value);
      } catch (e) {}
      if (!loadedUsers.length) {
        try {
          const a = await store.get(AUTH_KEY);
          if (a?.value) {
            const old = JSON.parse(a.value);
            loadedUsers = [{ id: uid(), name: old.name, email: old.email, passHash: old.passHash, role: "admin" }];
            await store.set(USERS_KEY, JSON.stringify(loadedUsers));
          }
        } catch (e) {}
      }
      setUsers(loadedUsers);

      try {
        const s = await store.get(SESSION_KEY);
        if (s?.value) {
          let sess = null;
          try { sess = JSON.parse(s.value); } catch (e) {}
          if (sess?.userId) {
            const u = loadedUsers.find((x) => x.id === sess.userId);
            if (u) setCurrentUser(u);
          } else if (s.value === "1" && loadedUsers.length) {
            setCurrentUser(loadedUsers[0]); // sessão da versão anterior
          }
        }
      } catch (e) {}

      try {
        const r = await store.get(STORAGE_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          setTx(d.tx || []);
          setBills(d.bills || []);
          setRules(d.rules?.length ? d.rules : DEFAULT_RULES);
        }
      } catch (e) {}
      try {
        const c = await store.get(CONTACTS_KEY);
        if (c?.value) setContacts(JSON.parse(c.value));
      } catch (e) {}
      // apresentação automática no primeiro acesso
      try {
        const seen = await store.get(TUTORIAL_KEY);
        if ((!seen || seen.value !== "1") && !loadedUsers.length) setShowOnboarding(true);
      } catch (e) {
        if (!loadedUsers.length) setShowOnboarding(true);
      }
      setLoaded(true);
      setAuthLoaded(true);
    })();
  }, []);

  /* persistências */
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await store.set(STORAGE_KEY, JSON.stringify({ tx, bills, rules })); }
      catch (e) { console.error("Falha ao salvar", e); }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [tx, bills, rules, loaded]);

  useEffect(() => {
    if (!authLoaded) return;
    clearTimeout(usersTimer.current);
    usersTimer.current = setTimeout(async () => {
      try { await store.set(USERS_KEY, JSON.stringify(users)); } catch (e) {}
    }, 400);
    return () => clearTimeout(usersTimer.current);
  }, [users, authLoaded]);

  useEffect(() => {
    if (!authLoaded) return;
    clearTimeout(contactsTimer.current);
    contactsTimer.current = setTimeout(async () => {
      try { await store.set(CONTACTS_KEY, JSON.stringify(contacts)); } catch (e) {}
    }, 400);
    return () => clearTimeout(contactsTimer.current);
  }, [contacts, authLoaded]);

  const setSessionUser = async (u) => {
    setCurrentUser(u);
    try { await store.set(SESSION_KEY, JSON.stringify({ userId: u.id })); } catch (e) {}
  };

  const catOf = useCallback((t) => t.category || applyRules(t.desc, rules), [rules]);

  const filtered = useMemo(
    () => (wallet === "Tudo" ? tx : tx.filter((t) => t.wallet === wallet)),
    [tx, wallet]
  );

  const metrics = useMemo(() => {
    const nowKey = monthKey(todayISO());
    const saldoPF = tx.filter((t) => t.wallet === "PF").reduce((s, t) => s + t.amount, 0);
    const saldoPJ = tx.filter((t) => t.wallet === "PJ").reduce((s, t) => s + t.amount, 0);

    // no consolidado "Tudo", transferências entre carteiras não contam como fluxo
    // (é só dinheiro mudando de bolso). Em PF/PJ isolado, contam normalmente.
    const flowTx = wallet === "Tudo" ? filtered.filter((t) => !isTransfer(t)) : filtered;

    const monthTx = flowTx.filter((t) => monthKey(t.date) === nowKey);
    const inMonth = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outMonth = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

    const keys = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
      keys.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`);
    }
    const evolution = keys.map((k) => {
      const mt = flowTx.filter((t) => monthKey(t.date) === k);
      return {
        mes: monthLabel(k),
        Entradas: Math.round(mt.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)),
        Saídas: Math.round(mt.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0)),
      };
    });

    const last3 = keys.slice(3);
    let ins = 0, outs = 0, mCount = 0;
    for (const k of last3) {
      const mt = flowTx.filter((t) => monthKey(t.date) === k);
      if (!mt.length) continue;
      ins += mt.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      outs += mt.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
      mCount++;
    }
    const avgIn = mCount ? ins / mCount : 0;
    const avgOut = mCount ? outs / mCount : 0;
    const savings = avgIn > 0 ? (avgIn - avgOut) / avgIn : null;
    const commit = avgIn > 0 ? avgOut / avgIn : null;
    const saldoTotal = saldoPF + saldoPJ;
    const reserve = avgOut > 0 ? Math.max(0, saldoTotal) / avgOut : null;

    let score = 50;
    if (savings !== null && reserve !== null) {
      const sSav = Math.max(0, Math.min(1, savings / 0.3));
      const sRes = Math.max(0, Math.min(1, reserve / 6));
      score = Math.round((sSav * 0.5 + sRes * 0.5) * 100);
    }

    const catMap = {};
    for (const t of monthTx) {
      if (t.amount >= 0) continue;
      const c = catOf(t);
      catMap[c] = (catMap[c] || 0) - t.amount;
    }
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalOut = topCats.reduce((s, [, v]) => Math.max(s, v), 1);

    // meios de pagamento do mês corrente (entradas e saídas por método)
    const methodMap = {};
    for (const t of monthTx) {
      const m = paymentMethod(t.desc);
      if (!methodMap[m]) methodMap[m] = { in: 0, out: 0 };
      if (t.amount >= 0) methodMap[m].in += t.amount;
      else methodMap[m].out -= t.amount;
    }
    const methods = Object.entries(methodMap)
      .map(([name, v]) => ({ name, ...v, total: v.in + v.out }))
      .sort((a, b) => b.total - a.total);

    // rótulo do mês atual e período usado no cálculo de saúde
    const curLabel = monthFull(nowKey);
    const healthMonths = last3.filter((k) => flowTx.some((t) => monthKey(t.date) === k));
    const periodLabel = healthMonths.length
      ? `${monthLabel(healthMonths[healthMonths.length - 1])}–${monthLabel(healthMonths[0])}`
      : "sem histórico suficiente";

    return { saldoPF, saldoPJ, inMonth, outMonth, evolution, savings, commit, reserve, score, topCats, totalOut, methods, curLabel, periodLabel, monthCount: mCount };
  }, [filtered, tx, catOf, wallet]);

  const forecast = useMemo(
    () => buildForecast({ tx, bills, saldoTotal: metrics.saldoPF + metrics.saldoPJ, wallet }),
    [tx, bills, metrics.saldoPF, metrics.saldoPJ, wallet]
  );

  const radarInsights = useMemo(() => {
    const out = [];
    const { savings, commit, reserve, inMonth, outMonth } = metrics;
    if (metrics.monthCount === 0 && inMonth === 0 && outMonth === 0) {
      return ["Ainda não há dados suficientes neste período. Importe extratos ou lance movimentações para ver a análise."];
    }
    // crítica
    if (outMonth > inMonth && inMonth > 0) {
      out.push(`🔴 Neste mês você gastou mais do que entrou (${brl(outMonth)} vs ${brl(inMonth)}). É um sinal de alerta se repetir.`);
    } else if (savings !== null && savings >= 0.2) {
      out.push(`🟢 Ótimo controle: você tem guardado cerca de ${(savings * 100).toFixed(0)}% do que entra.`);
    } else if (savings !== null && savings >= 0) {
      out.push(`🟡 Você fecha no positivo, mas a folga é pequena (${(savings * 100).toFixed(0)}% de sobra). A meta saudável é 15–20%.`);
    }
    // melhoria
    if (metrics.topCats.length) {
      const [cat, val] = metrics.topCats[0];
      out.push(`💡 Sua maior saída do mês é "${cat}" (${brl(val)}). É o melhor lugar para buscar economia com pouco esforço.`);
    }
    if (commit !== null && commit > 0.8) {
      out.push(`⚠️ Cerca de ${(commit * 100).toFixed(0)}% da sua renda está comprometida com saídas. Acima de 80%, sobra pouca margem para imprevistos.`);
    }
    // previsão
    if (forecast.daysToZero !== null) {
      out.push(`🔴 No ritmo médio recente, o caixa tende a zerar em ~${forecast.daysToZero} dias. Priorize cortar saídas ou antecipar recebimentos.`);
    } else if (forecast.avgNet > 0 && reserve !== null && reserve < 6) {
      out.push(`💡 Você tem sobrado em média ${brl(forecast.avgNet)}/mês. Direcionar essa sobra para completar a reserva (meta de 6 meses) é o passo mais seguro antes de investir. Conteúdo educacional — busque um profissional certificado para escolher produtos.`);
    } else if (forecast.avgNet > 0 && reserve !== null && reserve >= 6) {
      out.push(`💡 Reserva saudável e sobra consistente. É um bom momento para se informar sobre diversificação por objetivo e prazo — sempre com orientação profissional. O Meton não indica ativos específicos.`);
    }
    if (!out.length) out.push("Período equilibrado, sem alertas relevantes. Continue registrando tudo para a análise ficar cada vez mais precisa.");
    return out;
  }, [metrics, forecast]);

  const upcomingBills = useMemo(() => {
    const now = new Date(todayISO());
    return bills
      .filter((b) => !b.paid)
      .filter((b) => wallet === "Tudo" || b.wallet === wallet)
      .map((b) => ({ ...b, days: Math.round((new Date(b.dueDate) - now) / 86400000) }))
      .sort((a, b) => a.days - b.days);
  }, [bills, wallet]);

  const alertCount = upcomingBills.filter((b) => b.days <= 7).length;

  // extrato: aplica busca + filtro de categoria e agrupa por mês
  const extratoGroups = useMemo(() => {
    const q = normalize(extSearch);
    const rows = filtered.filter((t) => {
      if (extCat !== "Todas" && catOf(t) !== extCat) return false;
      if (q && !normalize(t.desc).includes(q)) return false;
      return true;
    });
    const groups = {};
    for (const t of rows) {
      const k = monthKey(t.date);
      (groups[k] = groups[k] || []).push(t);
    }
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((k) => ({
        key: k,
        label: monthFull(k),
        items: groups[k],
        total: groups[k].reduce((s, t) => s + t.amount, 0),
      }));
  }, [filtered, extSearch, extCat, catOf]);

  // contas não-recorrentes já pagas (para permitir estorno "não paguei")
  const paidBills = useMemo(
    () => bills.filter((b) => b.paid).filter((b) => wallet === "Tudo" || b.wallet === wallet),
    [bills, wallet]
  );

  /* ---------- ações ---------- */

  const [importing, setImporting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handlePhoto = async (file) => {
    setImporting(true);
    setOcrProgress(0);
    let parsed = [];
    try {
      parsed = await parsePhoto(file, setOcrProgress);
    } catch (e) {
      setToast("Falha no OCR: " + (e?.message || "erro") + ". Você pode digitar os lançamentos manualmente na revisão.");
      // abre revisão vazia editável para digitação manual
      setPending({ rows: [], dupes: 0, fileName: file.name, isPhoto: true });
      setImporting(false);
      return;
    }
    const existing = new Set(tx.map(txHash));
    const fresh = parsed.filter((p) => !existing.has(txHash(p)));
    if (!fresh.length) {
      setToast("Não reconheci lançamentos na foto. Verifique a nitidez ou digite manualmente na revisão.");
    }
    setPending({ rows: fresh, dupes: parsed.length - fresh.length, fileName: file.name, isPhoto: true });
    setImporting(false);
  };

  const handleFile = async (file) => {
    const name = file.name.toLowerCase();
    let parsed = [];
    setImporting(true);
    try {
      if (name.endsWith(".pdf")) {
        parsed = await parsePDF(file);
        if (!parsed.length) {
          setToast("Li o PDF mas não reconheci lançamentos. Extratos em PDF variam muito de layout — se possível, use OFX ou CSV do mesmo banco.");
          setImporting(false);
          return;
        }
      } else {
        const text = await file.text();
        if (name.endsWith(".ofx") || /<OFX>/i.test(text)) parsed = parseOFX(text);
        else parsed = parseCSV(text);
        if (!parsed.length) {
          setToast("Não consegui ler este arquivo. Verifique se é OFX, CSV ou PDF de extrato bancário.");
          setImporting(false);
          return;
        }
      }
    } catch (e) {
      setToast("Falha ao processar o arquivo: " + (e?.message || "erro desconhecido"));
      setImporting(false);
      return;
    }
    const existing = new Set(tx.map(txHash));
    const fresh = parsed.filter((p) => !existing.has(txHash(p)));
    setPending({ rows: fresh, dupes: parsed.length - fresh.length, fileName: file.name, isPdf: name.endsWith(".pdf") });
    setImporting(false);
  };

  const updatePendingRow = (i, field, value) => {
    setPending((p) => {
      const rows = p.rows.map((r, j) => {
        if (j !== i) return r;
        if (field === "amountStr") {
          const n = parseBRNumber(value);
          return { ...r, amountStr: value, amount: n === null ? r.amount : n };
        }
        return { ...r, [field]: value };
      });
      return { ...p, rows };
    });
  };
  const removePendingRow = (i) => setPending((p) => ({ ...p, rows: p.rows.filter((_, j) => j !== i) }));
  const addPendingRow = () => setPending((p) => ({ ...p, rows: [...p.rows, { date: todayISO(), amount: 0, amountStr: "0,00", desc: "" }] }));

  const confirmImport = () => {
    const clean = pending.rows
      .map((p) => ({ date: p.date, amount: p.amount, desc: (p.desc || "Lançamento").trim() }))
      .filter((p) => p.date && p.amount !== 0);
    const newTx = clean.map((p) => ({ ...p, id: uid(), wallet: importWallet, category: null, by: currentUser?.name }));
    setTx((prev) => [...prev, ...newTx].sort((a, b) => b.date.localeCompare(a.date)));
    setToast(`${newTx.length} lançamento(s) importado(s) para ${importWallet}.`);
    setPending(null);
    setTab("extrato");
  };

  const changeCategory = (t, newCat) => {
    setTx((prev) => prev.map((x) => (x.id === t.id ? { ...x, category: newCat } : x)));
    const kw = extractKeyword(t.desc);
    if (kw && newCat !== "Outros") {
      setRules((prev) => {
        const others = prev.filter((r) => r.keyword !== kw);
        return [{ keyword: kw, category: newCat }, ...others];
      });
      setToast(`Aprendi: "${kw}" → ${newCat}`);
    }
  };

  const toggleTransfer = (t) => {
    const now = isTransfer(t);
    setTx((prev) => prev.map((x) => (x.id === t.id ? { ...x, transfer: !now } : x)));
    setToast(!now ? "Marcado como transferência entre carteiras." : "Deixou de ser transferência.");
  };

  const markBillPaid = (b) => {
    const txId = uid();
    const t = {
      id: txId, date: todayISO(),
      amount: b.type === "pagar" ? -Math.abs(b.amount) : Math.abs(b.amount),
      desc: b.recur === "parcelado" && b.installments ? `${b.desc} (${b.installmentIndex || 1}/${b.installments})` : b.desc,
      wallet: b.wallet, category: b.category || null, by: currentUser?.name,
    };
    setTx((prev) => [t, ...prev]);
    setBills((prev) => prev.map((x) => {
      if (x.id !== b.id) return x;
      const recur = x.recur || (x.recurring ? "mensal" : "nao");
      if (recur === "nao") return { ...x, paid: true, lastPayment: { txId } };
      // avança a próxima data conforme a periodicidade
      const d = new Date(x.dueDate);
      if (recur === "quinzenal") d.setDate(d.getDate() + 15);
      else if (recur === "anual") d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1); // mensal e parcelado
      if (recur === "parcelado") {
        const idx = (x.installmentIndex || 1) + 1;
        if (idx > (x.installments || 1)) {
          // última parcela paga: encerra
          return { ...x, paid: true, lastPayment: { txId, prevDueDate: x.dueDate, prevIndex: x.installmentIndex || 1 } };
        }
        return { ...x, dueDate: d.toISOString().slice(0, 10), installmentIndex: idx, lastPayment: { txId, prevDueDate: x.dueDate, prevIndex: x.installmentIndex || 1 } };
      }
      return { ...x, dueDate: d.toISOString().slice(0, 10), lastPayment: { txId, prevDueDate: x.dueDate } };
    }));
    setToast(`"${b.desc}" ${b.type === "pagar" ? "pago" : "recebido"} e lançado no extrato.`);
  };

  // estorno de pagamento ("não paguei"): remove o lançamento criado e volta a conta para pendente
  const undoPayment = (b) => {
    const lp = b.lastPayment;
    if (lp?.txId) setTx((prev) => prev.filter((t) => t.id !== lp.txId));
    setBills((prev) => prev.map((x) => {
      if (x.id !== b.id) return x;
      const recur = x.recur || (x.recurring ? "mensal" : "nao");
      if (recur === "nao") return { ...x, paid: false, lastPayment: null };
      const restored = { ...x, paid: false, dueDate: lp?.prevDueDate || x.dueDate, lastPayment: null };
      if (recur === "parcelado" && lp?.prevIndex) restored.installmentIndex = lp.prevIndex;
      return restored;
    }));
    setToast("Pagamento estornado. A conta voltou para pendente.");
  };

  const editBill = (updated) => {
    setBills((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    setEditingBill(null);
    setToast("Conta atualizada.");
  };

  const loadSample = () => {
    const s = sampleData();
    setTx(s.tx.sort((a, b) => b.date.localeCompare(a.date)));
    setBills(s.bills);
    setToast("Dados de exemplo carregados.");
    setTab("radar");
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ tx, bills, rules, contacts, version: 11 }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `meton-backup-${todayISO()}.json`;
    a.click();
  };

  const importBackup = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data || (!Array.isArray(data.tx) && !Array.isArray(data.bills))) {
        setToast("Arquivo de backup inválido."); return;
      }
      const mode = window.confirm("Como importar?\n\nOK = MESCLAR com os dados atuais (sem apagar).\nCancelar = SUBSTITUIR tudo pelos dados do backup.");
      if (mode) {
        // mesclar, evitando duplicados de lançamentos
        const existing = new Set(tx.map(txHash));
        const newTx = (data.tx || []).filter((t) => !existing.has(txHash(t)));
        setTx((p) => [...p, ...newTx].sort((a, b) => b.date.localeCompare(a.date)));
        setBills((p) => {
          const seen = new Set(p.map((b) => `${normalize(b.desc)}|${b.amount}|${b.dueDate}`));
          const add = (data.bills || []).filter((b) => !seen.has(`${normalize(b.desc)}|${b.amount}|${b.dueDate}`));
          return [...p, ...add];
        });
        if (Array.isArray(data.contacts)) setContacts((p) => {
          const phones = new Set(p.map((c) => c.phone));
          return [...p, ...data.contacts.filter((c) => !phones.has(c.phone))];
        });
        setToast(`Backup mesclado: +${newTx.length} lançamento(s).`);
      } else {
        setTx((data.tx || []).sort((a, b) => b.date.localeCompare(a.date)));
        setBills(data.bills || []);
        if (Array.isArray(data.rules) && data.rules.length) setRules(data.rules);
        if (Array.isArray(data.contacts)) setContacts(data.contacts);
        setToast("Backup restaurado (dados substituídos).");
      }
    } catch (e) {
      setToast("Não consegui ler o backup: " + (e?.message || "arquivo inválido"));
    }
  };

  const wipeAll = () => {
    const answer = window.prompt('Esta ação apaga TODOS os lançamentos, contas e regras — e NÃO pode ser desfeita.\n\nPara confirmar, digite: APAGAR');
    if (answer === null) return;
    if (answer.trim().toUpperCase() !== "APAGAR") { setToast("Confirmação incorreta. Nada foi apagado."); return; }
    setTx([]); setBills([]); setRules(DEFAULT_RULES);
    setToast("Todos os dados financeiros foram apagados.");
  };

  const logout = async () => {
    try { await store.delete(SESSION_KEY); } catch (e) {}
    setCurrentUser(null);
  };

  const createFirstUser = async (user) => {
    setUsers([user]);
    await store.set(USERS_KEY, JSON.stringify([user])); // nunca lança (memória de reserva)
    await setSessionUser(user);
    setToast(`Bem-vindo, ${user.name.split(" ")[0]}! Conta de administrador criada.`);
  };

  const removeUser = (u) => {
    if (u.id === currentUser.id) return setToast("Você não pode remover a si mesmo.");
    if (!window.confirm(`Remover o acesso de ${u.name}?`)) return;
    setUsers((p) => p.filter((x) => x.id !== u.id));
    setToast(`Acesso de ${u.name} removido.`);
  };

  const changeMyPassword = (newHash) => {
    setUsers((p) => p.map((x) => (x.id === currentUser.id ? { ...x, passHash: newHash } : x)));
    setCurrentUser((c) => ({ ...c, passHash: newHash }));
    setShowChangePass(false);
    setToast("Senha alterada com sucesso.");
  };

  const resetUserPassword = (targetId, newHash) => {
    setUsers((p) => p.map((x) => (x.id === targetId ? { ...x, passHash: newHash } : x)));
    setResetTarget(null);
    setToast("Senha redefinida. Informe a senha provisória ao usuário.");
  };

  const dismissTutorial = async () => {
    setShowOnboarding(false);
    try { await store.set(TUTORIAL_KEY, "1"); } catch (e) {}
  };

  const resetAccess = async () => {
    if (!window.confirm("Redefinir acesso? Isto apaga TODOS os logins (mas mantém lançamentos, contas e relatórios). Você criará uma nova conta de administrador.")) return;
    setUsers([]);
    await store.delete(USERS_KEY);
    await store.delete(SESSION_KEY);
    setCurrentUser(null);
    setToast("Acesso redefinido. Crie a nova conta de administrador.");
  };

  /* ---------- render ---------- */

  if (!authLoaded || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DARK }}>
        <style>{fontStyles}</style>
        <div className="mt-display font-semibold" style={{ color: LIGHT }}>Carregando Meton…</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthScreen
          users={users}
          onAuthed={setSessionUser}
          onCreateFirst={createFirstUser}
          onAddUser={async (u) => { setUsers((p) => [...p, u]); await setSessionUser(u); }}
          onResetAccess={resetAccess}
          onShowTutorial={() => setShowOnboarding(true)}
        />
        {showOnboarding && <Onboarding onClose={dismissTutorial} />}
      </>
    );
  }

  const empty = tx.length === 0 && bills.length === 0;
  const saldoAtual = wallet === "PF" ? metrics.saldoPF : wallet === "PJ" ? metrics.saldoPJ : metrics.saldoPF + metrics.saldoPJ;

  return (
    <div className="min-h-screen text-stone-900 pb-24" style={{ background: NUDE }}>
      <style>{fontStyles}</style>

      {/* ===== hero ===== */}
      <div style={{ background: DARK }} className="text-white">
        <div className="max-w-lg mx-auto px-4 pb-6" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: LIGHT }}>
                <Compass size={19} style={{ color: DARK }} />
              </div>
              <div className="leading-tight">
                <div className="mt-display font-extrabold text-lg tracking-tight">Meton</div>
                <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: LIGHT }}>Financeira</div>
              </div>
            </div>
            <div className="flex rounded-full p-0.5 border border-green-800 bg-green-950/50">
              {["Tudo", "PF", "PJ"].map((w) => (
                <button key={w} onClick={() => setWallet(w)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${wallet === w ? "" : "text-green-300"}`}
                  style={wallet === w ? { background: LIGHT, color: DARK } : {}}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          {tab === "radar" && !empty && (
            <>
              <div className="text-[11px] uppercase tracking-widest text-green-200 mb-1">
                Olá, {currentUser.name.split(" ")[0]} · {metrics.curLabel}
              </div>
              <div className="text-[10px] text-green-300 mb-1.5">
                Saldo consolidado {wallet !== "Tudo" ? `· ${wallet}` : "· PF + PJ"}
              </div>
              <div className="mt-mono text-4xl font-semibold tracking-tight">{brl(saldoAtual)}</div>
              {wallet === "Tudo" && (
                <div className="flex gap-4 mt-2.5 text-sm text-green-100">
                  <span className="flex items-center gap-1.5">
                    <Wallet size={14} className="text-green-300" /> PF <b className="mt-mono text-white">{brl(metrics.saldoPF)}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Landmark size={14} className="text-green-300" /> PJ <b className="mt-mono text-white">{brl(metrics.saldoPJ)}</b>
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl p-3 bg-green-950/40 border border-green-800">
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: LIGHT }}><TrendingUp size={13} /> Entrou no mês</div>
                  <div className="mt-mono text-base font-semibold mt-1">{brl(metrics.inMonth)}</div>
                </div>
                <div className="rounded-xl p-3 bg-green-950/40 border border-green-800">
                  <div className="flex items-center gap-1 text-rose-300 text-xs font-semibold"><TrendingDown size={13} /> Saiu no mês</div>
                  <div className="mt-mono text-base font-semibold mt-1">{brl(metrics.outMonth)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => setShowReport(true)}
                  className="py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
                  style={{ background: LIGHT, color: DARK }}>
                  <FileText size={15} /> Relatório
                </button>
                <button onClick={() => setShowCompare(true)}
                  className="py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 border"
                  style={{ borderColor: LIGHT, color: LIGHT }}>
                  <TrendingUp size={15} /> Comparar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ============ RADAR ============ */}
        {tab === "radar" && (
          <>
            {empty ? (
              <Card className="p-6 text-center">
                <Compass size={36} className="mx-auto mb-3" style={{ color: DARK }} />
                <h2 className="mt-display font-bold text-lg mb-1">Sua bússola está zerada</h2>
                <p className="text-sm text-stone-500 mb-4">
                  Importe um extrato (OFX ou CSV) ou carregue dados de exemplo para ver como funciona.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setTab("importar")} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: DARK }}>
                    Importar extrato
                  </button>
                  <button onClick={loadSample} className="w-full py-2.5 rounded-xl border border-stone-300 font-semibold text-sm text-stone-700 bg-white">
                    Carregar dados de exemplo
                  </button>
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-5">
                  <HealthGauge score={metrics.score} savings={metrics.savings} commit={metrics.commit} reserve={metrics.reserve} />
                  <p className="text-[10px] text-stone-400 mt-3 text-center">
                    Calculado sobre {metrics.periodLabel} ({metrics.monthCount} mês(es) com dados)
                  </p>
                </Card>

                {/* Previsão de fluxo de caixa */}
                <Card className="p-5">
                  <SectionTitle>Previsão de caixa</SectionTitle>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Projeção com base na média dos últimos {forecast.monthsUsed || 0} mês(es) + contas já cadastradas.
                  </p>
                  {forecast.monthsUsed === 0 ? (
                    <p className="text-sm text-stone-400">Ainda sem histórico suficiente para prever. Importe mais meses.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {forecast.proj.map((p) => (
                          <div key={p.horizon} className="rounded-xl p-2.5" style={{ background: NUDE }}>
                            <div className="text-[10px] text-stone-500 font-semibold">{p.horizon} dias</div>
                            <div className={`mt-mono text-sm font-bold mt-1 ${p.projected >= 0 ? "text-green-800" : "text-rose-600"}`}>
                              {brl(p.projected)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-500 mt-3">
                        <span>Fluxo médio/mês</span>
                        <span className={`mt-mono font-semibold ${forecast.avgNet >= 0 ? "text-green-700" : "text-rose-600"}`}>
                          {forecast.avgNet >= 0 ? "+" : ""}{brl(forecast.avgNet)}
                        </span>
                      </div>
                      {forecast.daysToZero !== null && (
                        <div className="mt-2 rounded-xl px-3 py-2 text-[11px] font-semibold flex items-start gap-1.5" style={{ background: "#fef2f2", color: "#b91c1c" }}>
                          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                          No ritmo atual, seu saldo pode zerar em ~{forecast.daysToZero} dias. Reveja as saídas ou antecipe recebimentos.
                        </div>
                      )}
                    </>
                  )}
                </Card>

                {alertCount > 0 && (
                  <Card className="p-4 border-amber-300 bg-amber-50">
                    <div className="flex items-center gap-2 mb-2">
                      <BellRing size={16} className="text-amber-600" />
                      <span className="mt-display text-sm font-bold text-amber-800">Vence em até 7 dias</span>
                    </div>
                    <div className="space-y-1.5">
                      {upcomingBills.filter((b) => b.days <= 7).slice(0, 4).map((b) => (
                        <button key={b.id} onClick={() => setTab("contas")} className="w-full flex items-center justify-between text-sm text-left">
                          <span className="truncate text-amber-900">{b.desc}</span>
                          <span className="mt-mono font-semibold text-amber-900 shrink-0 ml-2">
                            {brl(b.amount)} · {b.days < 0 ? `${-b.days}d atrás` : b.days === 0 ? "hoje" : `${b.days}d`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-5">
                  <SectionTitle>Evolução · 6 meses</SectionTitle>
                  <div className="h-44 -ml-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.evolution} barGap={2}>
                        <CartesianGrid vertical={false} stroke="#e7e5e4" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} width={44}
                          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                        <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Entradas" fill={DARK} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Saídas" fill={NUDE_DEEP} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionTitle>Onde o dinheiro saiu este mês</SectionTitle>
                  {metrics.topCats.length === 0 ? (
                    <p className="text-sm text-stone-400">Sem despesas registradas neste mês.</p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.topCats.map(([cat, val]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-stone-700">{cat}</span>
                            <span className="mt-mono font-semibold">{brl(val)}</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: NUDE }}>
                            <div className="h-full rounded-full" style={{ width: `${(val / metrics.totalOut) * 100}%`, background: `linear-gradient(90deg,${LIGHT},${DARK})` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Meios de pagamento */}
                {metrics.methods.length > 0 && (
                  <Card className="p-5">
                    <SectionTitle>Por meio de pagamento (mês)</SectionTitle>
                    <div className="divide-y divide-stone-100">
                      {metrics.methods.map((m) => (
                        <div key={m.name} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-stone-700 font-medium">{m.name}</span>
                          <span className="flex gap-3 mt-mono text-xs">
                            {m.in > 0 && <span className="text-green-700">+{brl(m.in)}</span>}
                            {m.out > 0 && <span className="text-stone-600">−{brl(m.out)}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Dicas informativas do período */}
                <Card className="p-5">
                  <SectionTitle>Leitura do período</SectionTitle>
                  <div className="space-y-2">
                    {radarInsights.map((t, i) => (
                      <p key={i} className="text-sm text-stone-700 leading-snug">{t}</p>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-3 leading-snug">
                    Conteúdo educacional gerado a partir dos seus lançamentos. Não constitui recomendação de investimento (CVM).
                  </p>
                </Card>
              </>
            )}
          </>
        )}

        {/* ============ EXTRATO ============ */}
        {tab === "extrato" && (
          <>
            <div className="flex items-center justify-between">
              <SectionTitle>Extrato {wallet !== "Tudo" && `· ${wallet}`}</SectionTitle>
              <button onClick={() => setShowAddTx(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: DARK }}>
                <Plus size={14} /> Lançar manual
              </button>
            </div>

            {/* busca + filtro */}
            {filtered.length > 0 && (
              <div className="flex gap-2 mb-1">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input value={extSearch} onChange={(e) => setExtSearch(e.target.value)}
                    placeholder="Buscar…"
                    className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-sm bg-white focus:outline-none" />
                </div>
                <select value={extCat} onChange={(e) => setExtCat(e.target.value)}
                  className="rounded-xl border border-stone-200 px-2 py-2 text-xs font-semibold bg-white focus:outline-none" style={{ color: DARK }}>
                  <option>Todas</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}

            {filtered.length === 0 ? (
              <Card className="p-6 text-center text-sm text-stone-400">Nenhum lançamento. Importe um extrato ou lance manualmente.</Card>
            ) : extratoGroups.length === 0 ? (
              <Card className="p-6 text-center text-sm text-stone-400">Nada encontrado para esse filtro.</Card>
            ) : (
              <div className="space-y-3">
                {extratoGroups.map((g) => (
                  <div key={g.key}>
                    <div className="flex items-center justify-between px-1 mb-1.5">
                      <span className="mt-display text-xs font-bold uppercase tracking-wide" style={{ color: DARK }}>{g.label}</span>
                      <span className={`mt-mono text-[11px] font-semibold ${g.total >= 0 ? "text-green-700" : "text-stone-500"}`}>
                        {g.total >= 0 ? "+" : ""}{brl(g.total)}
                      </span>
                    </div>
                    <Card className="divide-y divide-stone-100">
                      {g.items.map((t) => {
                        const transfer = isTransfer(t);
                        return (
                          <div key={t.id} className="p-3.5 flex items-start gap-3">
                            <div className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ background: transfer ? NUDE_DEEP : t.amount >= 0 ? LIGHT : "#e5e7eb", outline: t.amount >= 0 && !transfer ? `1px solid ${DARK}` : "none" }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate flex items-center gap-1.5">
                                {t.desc}
                                {transfer && <span className="text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0" style={{ background: NUDE, color: NUDE_DEEP }}><ArrowLeftRight size={9} /> transf.</span>}
                              </div>
                              <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {t.date.split("-").reverse().join("/")} · {t.wallet}{t.by ? ` · ${t.by.split(" ")[0]}` : ""}
                                <select value={catOf(t)} onChange={(e) => changeCategory(t, e.target.value)}
                                  className="text-[11px] font-semibold bg-transparent border-0 p-0 pr-4 focus:ring-0 cursor-pointer" style={{ color: DARK }}>
                                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                                <button onClick={() => toggleTransfer(t)} className="text-[10px] font-semibold underline" style={{ color: NUDE_DEEP }}>
                                  {transfer ? "não é transf." : "marcar transf."}
                                </button>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`mt-mono text-sm font-semibold ${t.amount >= 0 ? "text-green-800" : "text-stone-800"}`}>
                                {t.amount >= 0 ? "+" : ""}{brl(t.amount)}
                              </div>
                              <button onClick={() => { if (window.confirm(`Excluir "${t.desc}" (${brl(t.amount)})?`)) setTx((p) => p.filter((x) => x.id !== t.id)); }} className="text-stone-300 mt-1">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ CONTAS ============ */}
        {tab === "contas" && (
          <>
            <div className="flex items-center justify-between">
              <SectionTitle>Contas a pagar e receber {wallet !== "Tudo" && `· ${wallet}`}</SectionTitle>
              <button onClick={() => setShowAddBill(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: DARK }}>
                <Plus size={14} /> Nova conta
              </button>
            </div>
            {upcomingBills.length === 0 ? (
              <Card className="p-6 text-center text-sm text-stone-400">Nenhuma conta cadastrada. Cadastre o DAS, aluguel, honorários a receber…</Card>
            ) : (
              <>
                {/* Provisão: total futuro a pagar/receber, incluindo parcelas restantes */}
                <Card className="p-4">
                  <SectionTitle>Provisão futura</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: "#fef2f2" }}>
                      <div className="text-[11px] font-semibold text-rose-700">A pagar</div>
                      <div className="mt-mono text-base font-bold text-rose-800 mt-1">
                        {brl(upcomingBills.filter((b) => b.type === "pagar").reduce((s, b) => s + remainingProvision(b), 0))}
                      </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "#f0fdf4" }}>
                      <div className="text-[11px] font-semibold text-green-700">A receber</div>
                      <div className="mt-mono text-base font-bold text-green-800 mt-1">
                        {brl(upcomingBills.filter((b) => b.type === "receber").reduce((s, b) => s + remainingProvision(b), 0))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2">
                    Inclui todas as parcelas restantes de contas parceladas. É o compromisso total já conhecido.
                  </p>
                </Card>
                <div className="space-y-2.5">
                  {upcomingBills.map((b) => {
                    const late = b.days < 0;
                  const soon = b.days >= 0 && b.days <= 7;
                  return (
                    <Card key={b.id} className={`p-4 ${late ? "border-rose-300" : soon ? "border-amber-300" : ""}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{b.desc}</div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {b.type === "pagar" ? "A pagar" : "A receber"} · {b.wallet} · vence {b.dueDate.split("-").reverse().join("/")}
                            {b.recurring && ` · ${
                              (b.recur || "mensal") === "parcelado"
                                ? `parcela ${b.installmentIndex || 1}/${b.installments || "?"}`
                                : (b.recur || "mensal")
                            }`}
                          </div>
                          {(late || soon) && (
                            <div className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold ${late ? "text-rose-600" : "text-amber-600"}`}>
                              <AlertTriangle size={11} />
                              {late ? `Atrasada há ${-b.days} dia(s)` : b.days === 0 ? "Vence hoje" : `Vence em ${b.days} dia(s)`}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="mt-mono text-sm font-semibold">{brl(b.amount)}</div>
                          <div className="flex gap-2 mt-2 justify-end items-center">
                            <button onClick={() => markBillPaid(b)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: DARK }}>
                              {b.type === "pagar" ? "Paguei" : "Recebi"}
                            </button>
                            <button onClick={() => setEditingBill(b)} className="text-stone-400" title="Editar">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => { if (window.confirm(`Excluir "${b.desc}"?`)) setBills((p) => p.filter((x) => x.id !== b.id)); }} className="text-stone-300" title="Excluir">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {b.recurring && b.lastPayment && (
                            <button onClick={() => undoPayment(b)} className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1 justify-end w-full">
                              <RotateCcw size={11} /> Não paguei (estornar)
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </>
            )}

            {/* Pagas — permite estornar ("não paguei") */}
            {paidBills.length > 0 && (
              <>
                <SectionTitle>Pagas / recebidas</SectionTitle>
                <div className="space-y-2.5">
                  {paidBills.map((b) => (
                    <Card key={b.id} className="p-4 opacity-90">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                            <CheckCheck size={14} className="text-green-700 shrink-0" /> {b.desc}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {b.type === "pagar" ? "Paga" : "Recebida"} · {b.wallet}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="mt-mono text-sm font-semibold">{brl(b.amount)}</div>
                          <button onClick={() => undoPayment(b)} className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1 justify-end w-full">
                            <RotateCcw size={11} /> Não paguei
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ============ IMPORTAR ============ */}
        {tab === "importar" && (
          <>
            <SectionTitle>Importar extrato</SectionTitle>
            {!pending ? (
              <Card className="p-6 text-center">
                <FileUp size={32} className="mx-auto mb-3" style={{ color: DARK }} />
                <p className="text-sm text-stone-600 mb-1 font-medium">Extrato: arquivo ou foto</p>
                <p className="text-xs text-stone-400 mb-4">
                  Envie o arquivo do banco (CSV, OFX, PDF) ou tire uma foto do extrato. Lançamentos repetidos são ignorados automaticamente.
                </p>
                <div className="flex justify-center gap-2 mb-3">
                  {["CSV", "OFX", "PDF", "FOTO"].map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: NUDE, color: DARK }}>{t}</span>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {["PF", "PJ"].map((w) => (
                    <button key={w} onClick={() => setImportWallet(w)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border ${importWallet === w ? "text-white" : "border-stone-300 text-stone-600 bg-white"}`}
                      style={importWallet === w ? { background: DARK, borderColor: DARK } : {}}>
                      Conta {w}
                    </button>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept=".ofx,.csv,.txt,.pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }} />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => fileRef.current?.click()} disabled={importing}
                    className="py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60" style={{ background: DARK }}>
                    <Upload size={16} /> Arquivo
                  </button>
                  <button onClick={() => photoRef.current?.click()} disabled={importing}
                    className="py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 border disabled:opacity-60"
                    style={{ borderColor: DARK, color: DARK }}>
                    <Camera size={16} /> Foto
                  </button>
                </div>
                {importing && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold" style={{ color: DARK }}>
                      {ocrProgress > 0 ? `Lendo a foto… ${ocrProgress}%` : "Processando…"}
                    </div>
                    {ocrProgress > 0 && (
                      <div className="h-1.5 rounded-full mt-1" style={{ background: NUDE }}>
                        <div className="h-full rounded-full" style={{ width: `${ocrProgress}%`, background: DARK }} />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-stone-400 mt-3 leading-snug">
                  Foto e PDF são lidos por aproximação e podem errar — por isso você revisa e edita cada lançamento antes de confirmar. CSV e OFX são mais precisos.
                </p>
              </Card>
            ) : (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <div className="mt-display font-bold text-sm truncate">{pending.fileName}</div>
                    <div className="text-xs text-stone-400">
                      {pending.rows.length} lançamento(s) · {pending.dupes} já existiam · conta {importWallet}
                    </div>
                  </div>
                  <button onClick={() => setPending(null)} className="text-stone-400 shrink-0"><X size={18} /></button>
                </div>
                {(pending.isPdf || pending.isPhoto) && (
                  <div className="text-[11px] rounded-xl px-3 py-2 mb-3 flex items-start gap-1.5" style={{ background: "#fffbeb", color: "#92400e" }}>
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    Leitura por {pending.isPhoto ? "foto" : "PDF"} é aproximada. Revise e corrija cada linha abaixo antes de confirmar.
                  </div>
                )}
                <div className="max-h-72 overflow-y-auto space-y-2 mb-3">
                  {pending.rows.map((r, i) => (
                    <div key={i} className="rounded-xl border border-stone-200 p-2.5">
                      <div className="flex gap-2 items-center">
                        <input type="date" value={r.date}
                          onChange={(e) => updatePendingRow(i, "date", e.target.value)}
                          className="text-[11px] rounded-lg border border-stone-200 px-1.5 py-1 focus:outline-none" />
                        <input inputMode="decimal" value={r.amountStr ?? String(r.amount).replace(".", ",")}
                          onChange={(e) => updatePendingRow(i, "amountStr", e.target.value)}
                          className={`flex-1 text-right mt-mono text-sm font-semibold rounded-lg border border-stone-200 px-2 py-1 focus:outline-none ${r.amount >= 0 ? "text-green-800" : "text-stone-800"}`} />
                        <button onClick={() => removePendingRow(i)} className="text-stone-300 shrink-0"><Trash2 size={14} /></button>
                      </div>
                      <input value={r.desc} placeholder="Descrição"
                        onChange={(e) => updatePendingRow(i, "desc", e.target.value)}
                        className="w-full mt-1.5 text-xs rounded-lg border border-stone-200 px-2 py-1 focus:outline-none" />
                    </div>
                  ))}
                  {!pending.rows.length && (
                    <p className="text-xs text-stone-400 text-center py-4">Nenhuma linha. Adicione manualmente abaixo.</p>
                  )}
                </div>
                <button onClick={addPendingRow}
                  className="w-full py-2 rounded-xl border border-dashed border-stone-300 text-stone-500 font-semibold text-xs flex items-center justify-center gap-1 mb-3">
                  <Plus size={14} /> Adicionar linha
                </button>
                <button onClick={confirmImport} disabled={!pending.rows.length}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40" style={{ background: DARK }}>
                  Confirmar importação
                </button>
              </Card>
            )}
          </>
        )}

        {/* ============ AJUSTES ============ */}
        {tab === "ajustes" && (
          <>
            <SectionTitle>Perfil</SectionTitle>
            <Card className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: LIGHT }}>
                  <User size={17} style={{ color: DARK }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {currentUser.name}
                    {isAdmin && <ShieldCheck size={13} style={{ color: DARK }} />}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate">{currentUser.email} · {isAdmin ? "administrador" : "colaborador"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => setShowChangePass(true)} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: DARK }}>
                  <KeyRound size={14} /> Senha
                </button>
                <button onClick={logout} className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <SectionTitle>Usuários com acesso</SectionTitle>
              {isAdmin && (
                <button onClick={() => setShowAddUser(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: DARK }}>
                  <Plus size={14} /> Adicionar
                </button>
              )}
            </div>
            <Card className="divide-y divide-stone-100">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users size={15} className="text-stone-300 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {u.name} {u.id === currentUser.id && <span className="text-[10px] text-stone-400">(você)</span>}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate">{u.email} · {u.role}</div>
                    </div>
                  </div>
                  {isAdmin && u.id !== currentUser.id && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => setResetTarget(u)} className="text-stone-400" title="Redefinir senha">
                        <KeyRound size={14} />
                      </button>
                      <button onClick={() => removeUser(u)} className="text-stone-300"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </Card>
            <p className="text-[11px] text-stone-400 px-1 leading-relaxed -mt-1">
              Todos os usuários compartilham os mesmos dados financeiros e podem lançar, editar e enviar relatórios.
              Neste protótipo, os acessos valem neste dispositivo/conta; acesso remoto real por várias pessoas exige a versão com servidor.
            </p>

            <div className="flex items-center justify-between">
              <SectionTitle>Contatos p/ WhatsApp</SectionTitle>
              <button onClick={() => setAddContact(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: DARK }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {contacts.length === 0 ? (
              <Card className="p-4 text-center text-xs text-stone-400">
                Nenhum contato salvo. Você também pode salvar contatos na hora de enviar um relatório.
              </Card>
            ) : (
              <Card className="divide-y divide-stone-100">
                {contacts.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Phone size={14} className="text-stone-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[11px] text-stone-400">{formatPhone(c.phone)}</div>
                      </div>
                    </div>
                    <button onClick={() => setContacts((p) => p.filter((x) => x.id !== c.id))} className="text-stone-300"><Trash2 size={14} /></button>
                  </div>
                ))}
              </Card>
            )}

            <SectionTitle>Manutenção</SectionTitle>
            <Card className="divide-y divide-stone-100">
              <button onClick={() => {
                const groups = findDuplicateTx(tx);
                if (!groups.length) { setToast("Nenhum lançamento duplicado encontrado."); return; }
                const extras = groups.reduce((s, g) => s + (g.length - 1), 0);
                if (!window.confirm(`Encontrei ${groups.length} grupo(s) de lançamentos repetidos (${extras} extra(s)). Remover as cópias, mantendo uma de cada?`)) return;
                const { kept, removed } = dedupeTx(tx);
                setTx(kept);
                setToast(`${removed} lançamento(s) duplicado(s) removido(s).`);
              }} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <CheckCheck size={16} style={{ color: DARK }} /> Verificar lançamentos duplicados
              </button>
            </Card>

            <SectionTitle>Regras de categorização</SectionTitle>
            <Card className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {rules.map((r, i) => (
                <div key={i} className="p-3 flex items-center justify-between text-sm">
                  <span className="text-stone-600">"{r.keyword}" <ChevronRight size={12} className="inline text-stone-300" /> <b>{r.category}</b></span>
                  <button onClick={() => setRules((p) => p.filter((_, j) => j !== i))} className="text-stone-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </Card>

            <SectionTitle>Relatórios e dados</SectionTitle>
            <Card className="divide-y divide-stone-100">
              <button onClick={() => setShowExport(true)} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <FileText size={16} style={{ color: DARK }} /> Exportar período (PDF / WhatsApp / e-mail)
              </button>
              <button onClick={exportBackup} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <Download size={16} style={{ color: DARK }} /> Exportar backup (JSON)
              </button>
              <input ref={backupRef} type="file" accept=".json,application/json" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f); e.target.value = ""; }} />
              <button onClick={() => backupRef.current?.click()} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <Upload size={16} style={{ color: DARK }} /> Importar backup (JSON)
              </button>
              <button onClick={loadSample} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <RotateCcw size={16} style={{ color: DARK }} /> Recarregar dados de exemplo
              </button>
              <button onClick={() => setShowOnboarding(true)} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-stone-700">
                <PlayCircle size={16} style={{ color: DARK }} /> Ver apresentação novamente
              </button>
              {isAdmin && (
                <button onClick={wipeAll} className="w-full p-4 flex items-center gap-3 text-sm font-medium text-rose-600">
                  <Trash2 size={16} /> Apagar todos os dados financeiros
                </button>
              )}
            </Card>

            <Card className="p-4" style={{ background: NUDE }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: NUDE_DEEP }} />
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  <b>Usar no celular e no computador?</b> Hoje os dados ficam salvos só neste aparelho/navegador — não sincronizam sozinhos. Para transportar: exporte o backup aqui, envie o arquivo para o outro aparelho e use "Importar backup". Sincronização automática entre dispositivos exige a versão com servidor (em desenvolvimento).
                </p>
              </div>
            </Card>
            <p className="text-[11px] text-stone-400 px-1 leading-relaxed">
              Meton Financeira · Fase 1 · uso pessoal. Senhas protegidas por hash SHA-256.
              Relatórios têm caráter educacional e não constituem recomendação de investimento.
            </p>
          </>
        )}
      </main>

      {showAddTx && (
        <AddTxModal rules={rules} onClose={() => setShowAddTx(false)} onSave={(t) => {
          const h = txHash(t);
          const isDup = tx.some((x) => txHash(x) === h);
          if (isDup && !window.confirm("Já existe um lançamento igual (mesma data, valor e descrição). Adicionar mesmo assim?")) return;
          setTx((p) => [{ ...t, id: uid(), by: currentUser?.name }, ...p].sort((a, b) => b.date.localeCompare(a.date)));
          setShowAddTx(false); setToast(isDup ? "Lançamento duplicado adicionado (confirmado)." : "Lançamento adicionado.");
        }} />
      )}
      {showAddBill && (
        <AddBillModal rules={rules} onClose={() => setShowAddBill(false)} onSave={(b) => {
          const dup = bills.some((x) => !x.paid && normalize(x.desc) === normalize(b.desc) && Math.abs(x.amount - b.amount) < 0.005 && x.dueDate === b.dueDate && x.wallet === b.wallet);
          if (dup) { setToast("Essa conta já está cadastrada (mesma descrição, valor e vencimento). Não foi duplicada."); return; }
          setBills((p) => [...p, { ...b, id: uid(), paid: false, by: currentUser?.name }]);
          setShowAddBill(false); setToast("Conta cadastrada.");
        }} />
      )}
      {editingBill && (
        <AddBillModal rules={rules} initial={editingBill} onClose={() => setEditingBill(null)}
          onSave={(b) => editBill({ ...b, id: editingBill.id })} />
      )}
      {showAddUser && (
        <AddUserModal users={users} onClose={() => setShowAddUser(false)} onSave={(u) => {
          setUsers((p) => [...p, u]);
          setShowAddUser(false);
          setToast(`Usuário ${u.name} criado. Compartilhe o e-mail e a senha provisória com a pessoa.`);
        }} />
      )}
      {showReport && (
        <ReportModal
          tx={tx} bills={bills} catOf={catOf}
          saldoTotal={metrics.saldoPF + metrics.saldoPJ}
          userName={currentUser.name}
          contacts={contacts}
          onSaveContact={(c) => setContacts((p) => [...p.filter((x) => x.phone !== c.phone), c])}
          onClose={() => setShowReport(false)}
          setToast={setToast}
        />
      )}
      {showCompare && (
        <CompareModal tx={tx} catOf={catOf} onClose={() => setShowCompare(false)} />
      )}
      {showChangePass && (
        <ChangePasswordModal user={currentUser} onClose={() => setShowChangePass(false)} onSave={changeMyPassword} setToast={setToast} />
      )}
      {resetTarget && (
        <ResetPasswordModal target={resetTarget} onClose={() => setResetTarget(null)} onSave={(h) => resetUserPassword(resetTarget.id, h)} />
      )}
      {addContact && (
        <AddContactModal onClose={() => setAddContact(false)} onSave={(c) => {
          setContacts((p) => [...p.filter((x) => x.phone !== c.phone), c]);
          setAddContact(false); setToast("Contato salvo.");
        }} />
      )}
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      {showExport && (
        <ExportPeriodModal tx={tx} bills={bills} catOf={catOf} userName={currentUser.name}
          contacts={contacts} onClose={() => setShowExport(false)} setToast={setToast} />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-lg mx-auto grid grid-cols-5">
          {[
            { id: "radar", icon: Compass, label: "Radar" },
            { id: "extrato", icon: ListOrdered, label: "Extrato" },
            { id: "contas", icon: CalendarClock, label: "Contas", badge: alertCount },
            { id: "importar", icon: Upload, label: "Importar" },
            { id: "ajustes", icon: Settings2, label: "Ajustes" },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`relative py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-semibold ${tab === id ? "" : "text-stone-400"}`}
              style={tab === id ? { color: DARK } : {}}>
              <Icon size={19} strokeWidth={tab === id ? 2.4 : 2} />
              {label}
              {tab === id && <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: LIGHT, outline: `1px solid ${DARK}` }} />}
              {badge > 0 && (
                <span className="absolute top-1 right-1/2 translate-x-4 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ---------- modais ---------- */

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,83,45,0.45)" }} onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="mt-display font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-stone-400"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none";

function AddTxModal({ onClose, onSave, rules }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState("saida");
  const [wallet, setWallet] = useState("PF");
  const [cat, setCat] = useState("");
  const [catTouched, setCatTouched] = useState(false);
  // sugere categoria automaticamente pela descrição, até o usuário mexer
  const effectiveCat = catTouched ? cat : (desc.trim() ? applyRules(desc, rules || DEFAULT_RULES) : "");
  const ok = desc.trim() && parseBRNumber(amount) !== null;
  return (
    <ModalShell title="Lançamento manual" onClose={onClose}>
      <div className="space-y-3">
        <input className={inputCls} placeholder="Descrição (ex: Supermercado)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input className={inputCls} placeholder="Valor (ex: 150,00)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div>
          <label className="block text-xs text-stone-500 mb-1 pl-1">Categoria {!catTouched && desc.trim() && <span style={{ color: NUDE_DEEP }}>(sugerida)</span>}</label>
          <select className={inputCls} value={effectiveCat || "Outros"} onChange={(e) => { setCat(e.target.value); setCatTouched(true); }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {[["saida", "Saída"], ["entrada", "Entrada"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${type === v ? "text-white" : "border-stone-300 text-stone-600"}`}
              style={type === v ? { background: DARK, borderColor: DARK } : {}}>{l}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {["PF", "PJ"].map((w) => (
            <button key={w} onClick={() => setWallet(w)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${wallet === w ? "text-white" : "border-stone-300 text-stone-600"}`}
              style={wallet === w ? { background: DARK, borderColor: DARK } : {}}>{w}</button>
          ))}
        </div>
        <button disabled={!ok}
          onClick={() => {
            const v = Math.abs(parseBRNumber(amount));
            onSave({ desc: desc.trim(), amount: type === "saida" ? -v : v, date, wallet, category: effectiveCat || "Outros" });
          }}
          className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40" style={{ background: DARK }}>
          Salvar lançamento
        </button>
      </div>
    </ModalShell>
  );
}

function AddBillModal({ onClose, onSave, initial, rules }) {
  const [desc, setDesc] = useState(initial?.desc || "");
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || todayISO());
  const [type, setType] = useState(initial?.type || "pagar");
  const [wallet, setWallet] = useState(initial?.wallet || "PF");
  const [recur, setRecur] = useState(initial?.recur || (initial?.recurring ? "mensal" : "nao"));
  const [installments, setInstallments] = useState(initial?.installments || 2);
  const [cat, setCat] = useState(initial?.category || "");
  const [catTouched, setCatTouched] = useState(!!initial?.category);
  const effectiveCat = catTouched ? cat : (desc.trim() ? applyRules(desc, rules || DEFAULT_RULES) : "");
  const ok = desc.trim() && parseBRNumber(amount) !== null;
  return (
    <ModalShell title={initial ? "Editar conta" : "Nova conta"} onClose={onClose}>
      <div className="space-y-3">
        <input className={inputCls} placeholder="Descrição (ex: DAS Simples Nacional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input className={inputCls} placeholder="Valor (ex: 76,90)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div>
          <label className="block text-xs text-stone-500 mb-1 pl-1">Categoria {!catTouched && desc.trim() && <span style={{ color: NUDE_DEEP }}>(sugerida)</span>}</label>
          <select className={inputCls} value={effectiveCat || "Outros"} onChange={(e) => { setCat(e.target.value); setCatTouched(true); }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label className="block text-xs text-stone-500 -mb-2 pl-1">Data de vencimento</label>
        <input className={inputCls} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div className="flex gap-2">
          {[["pagar", "A pagar"], ["receber", "A receber"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${type === v ? "text-white" : "border-stone-300 text-stone-600"}`}
              style={type === v ? { background: DARK, borderColor: DARK } : {}}>{l}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {["PF", "PJ"].map((w) => (
            <button key={w} onClick={() => setWallet(w)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${wallet === w ? "text-white" : "border-stone-300 text-stone-600"}`}
              style={wallet === w ? { background: DARK, borderColor: DARK } : {}}>{w}</button>
          ))}
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1 pl-1">Repetição</label>
          <select className={inputCls} value={recur} onChange={(e) => setRecur(e.target.value)}>
            <option value="nao">Não repete</option>
            <option value="quinzenal">Quinzenal</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
            <option value="parcelado">Parcelado (Nx)</option>
          </select>
        </div>
        {recur === "parcelado" && (
          <div className="flex items-center gap-2 pl-1">
            <span className="text-sm text-stone-600">Nº de parcelas:</span>
            <input type="number" min="2" max="60" value={installments}
              onChange={(e) => setInstallments(Math.max(2, Math.min(60, parseInt(e.target.value) || 2)))}
              className="w-20 rounded-xl border border-stone-300 px-2 py-1.5 text-sm focus:outline-none" />
          </div>
        )}
        <button disabled={!ok}
          onClick={() => onSave({
            desc: desc.trim(), amount: Math.abs(parseBRNumber(amount)), dueDate, type, wallet,
            category: effectiveCat || "Outros",
            recur, recurring: recur !== "nao",
            installments: recur === "parcelado" ? installments : undefined,
            installmentIndex: recur === "parcelado" ? (initial?.installmentIndex || 1) : undefined,
          })}
          className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40" style={{ background: DARK }}>
          {initial ? "Salvar alterações" : "Salvar conta"}
        </button>
      </div>
    </ModalShell>
  );
}

function ExportPeriodModal({ tx, bills, catOf, userName, contacts, onClose, setToast }) {
  const firstOfMonth = todayISO().slice(0, 8) + "01";
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const report = useMemo(() => buildPeriodReport({ from, to, tx, bills, catOf, userName }), [from, to, tx, bills, catOf, userName]);
  const title = `Período ${from.split("-").reverse().join("/")} a ${to.split("-").reverse().join("/")}`;

  const savePdf = async () => {
    setBusy(true);
    try {
      const blob = await textToPdf(title, report.text.split("\n"));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `meton-periodo-${from}_a_${to}.pdf`;
      a.click();
      setToast("PDF gerado. Você pode anexá-lo no WhatsApp ou e-mail.");
    } catch (e) {
      setToast("Falha ao gerar PDF: " + (e?.message || "erro") + ". Use 'Copiar' como alternativa.");
    }
    setBusy(false);
  };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(report.text)}`, "_blank");
  const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent("Relatório Meton — " + title)}&body=${encodeURIComponent(report.text)}`, "_blank");
  const copyText = async () => {
    try { await navigator.clipboard.writeText(report.text); setToast("Relatório copiado."); }
    catch (e) { setToast("Não consegui copiar neste navegador."); }
  };

  return (
    <ModalShell title="Exportar período" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-stone-500 mb-1 pl-1">De</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-stone-500 mb-1 pl-1">Até</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: NUDE }}>
          <div className="flex justify-between text-sm"><span className="text-stone-600">Entradas</span><span className="mt-mono font-semibold text-green-800">{brl(report.inn)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-600">Saídas</span><span className="mt-mono font-semibold text-stone-800">{brl(report.out)}</span></div>
          <div className="flex justify-between text-sm pt-1 mt-1 border-t border-stone-200"><span className="font-semibold">Resultado</span><span className={`mt-mono font-bold ${report.result >= 0 ? "text-green-800" : "text-rose-600"}`}>{brl(report.result)}</span></div>
          <div className="text-[11px] text-stone-400 mt-1">{report.count} lançamento(s) no período</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={savePdf} disabled={busy} className="py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: DARK }}>
            <FileText size={15} /> {busy ? "Gerando…" : "Salvar PDF"}
          </button>
          <button onClick={shareWhatsApp} className="py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: "#25D366" }}>
            <Share2 size={15} /> WhatsApp
          </button>
          <button onClick={shareEmail} className="py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm flex items-center justify-center gap-1.5">
            <Mail size={15} /> E-mail
          </button>
          <button onClick={copyText} className="py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm flex items-center justify-center gap-1.5">
            <Copy size={15} /> Copiar
          </button>
        </div>
        <p className="text-[10px] text-stone-400 leading-snug">
          O botão WhatsApp/E-mail envia o resumo em texto. Para mandar o PDF, gere com "Salvar PDF" e anexe manualmente na conversa.
        </p>
      </div>
    </ModalShell>
  );
}

function AddContactModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const save = () => {
    if (!name.trim()) return setErr("Informe o nome.");
    const n = normalizePhone(phone);
    if (n.length < 12) return setErr("Número inválido. Use DDD + número (ex: 11 99999-9999).");
    onSave({ id: uid(), name: name.trim(), phone: n });
  };
  return (
    <ModalShell title="Novo contato" onClose={onClose}>
      <div className="space-y-3">
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none"
            placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="w-full rounded-xl border border-stone-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none"
            inputMode="tel" placeholder="(11) 99999-9999 ou +55..." value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {err && <p className="text-xs font-semibold text-rose-600 text-center">{err}</p>}
        <button onClick={save} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: DARK }}>
          Salvar contato
        </button>
      </div>
    </ModalShell>
  );
}
