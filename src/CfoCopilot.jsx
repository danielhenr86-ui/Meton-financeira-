import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";

const DARK = "#14532d";
const LIGHT = "#86efac";
const NUDE = "#F6F0E8";

const QUICK_QUESTIONS = [
  "Quais são as 5 decisões financeiras mais importantes agora?",
  "Onde está meu maior risco de caixa nas próximas 13 semanas?",
  "O que explica o resultado deste mês e o que devo atacar primeiro?",
];

function SeverityBadge({ severity }) {
  const map = {
    critica: { label: "Crítica", bg: "#fee2e2", color: "#b91c1c" },
    atencao: { label: "Atenção", bg: "#fef3c7", color: "#b45309" },
    oportunidade: { label: "Oportunidade", bg: "#dcfce7", color: "#166534" },
  };
  const style = map[severity] || map.atencao;
  return <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>{style.label}</span>;
}

export default function CfoCopilot({ snapshot, onClose }) {
  const [question, setQuestion] = useState(QUICK_QUESTIONS[0]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const ask = async () => {
    const clean = question.trim();
    if (clean.length < 3 || loading) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 60_000);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, snapshot }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "Não foi possível concluir a análise.");
      if (!payload?.analysis) throw new Error("Resposta do CFO Copilot veio vazia.");
      setAnalysis(payload.analysis);
    } catch (err) {
      if (err?.name === "AbortError") setError("A análise demorou mais de 60 segundos. Tente novamente.");
      else setError(err?.message || "Falha ao consultar o CFO Copilot.");
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col" style={{ background: NUDE }}>
      <div className="text-white px-4 pb-4 shrink-0" style={{ background: DARK, paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
        <div className="max-w-lg mx-auto flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: LIGHT, color: DARK }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="mt-display text-lg font-extrabold">Meton CFO Copilot</h2>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/10">v1</span>
              </div>
              <p className="text-[11px] text-green-100 mt-0.5">Decisões gerenciais com evidência dos seus números.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-green-100 p-1" aria-label="Fechar CFO Copilot"><X size={22} /></button>
        </div>
      </div>

      <div className="max-w-lg w-full mx-auto flex-1 overflow-y-auto p-4 pb-10 space-y-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="flex items-start gap-2 text-[11px] text-stone-600 leading-relaxed">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" style={{ color: DARK }} />
            <p><b>Privacidade por minimização:</b> ao clicar em analisar, o Meton envia uma fotografia agregada com indicadores, metas e alertas gerenciais. O extrato bruto e as descrições individuais das transações não são enviados ao copiloto.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">Perguntas sugeridas</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((item, index) => (
                <button key={item} onClick={() => setQuestion(item)}
                  className="text-left text-[11px] font-semibold rounded-xl border px-2.5 py-2"
                  style={{ borderColor: question === item ? DARK : "#e7e5e4", color: question === item ? DARK : "#57534e", background: question === item ? "#f0fdf4" : "white" }}>
                  {index + 1}. {item}
                </button>
              ))}
            </div>
          </div>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} maxLength={600}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none resize-none"
            placeholder="Pergunte ao seu CFO..." />
          <button onClick={ask} disabled={loading || question.trim().length < 3}
            className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: DARK }}>
            {loading ? <><LoaderCircle size={16} className="animate-spin" /> Analisando números...</> : <><Sparkles size={16} /> Analisar como CFO</>}
          </button>
          <p className="text-[10px] text-stone-400 text-center">Nenhuma ação financeira é executada automaticamente.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2 text-sm text-rose-800">
            <AlertTriangle size={17} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 text-white" style={{ background: DARK }}>
              <div className="text-[10px] uppercase tracking-[0.2em] text-green-200 font-bold mb-2">Leitura executiva</div>
              <p className="text-sm leading-relaxed">{analysis.executiveSummary}</p>
            </div>

            <div className="space-y-3">
              {(analysis.decisions || []).map((decision) => (
                <div key={`${decision.priority}-${decision.title}`} className="bg-white rounded-2xl border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-mono text-xl font-bold" style={{ color: DARK }}>#{decision.priority}</span>
                      <h3 className="mt-display text-sm font-bold leading-snug pt-0.5">{decision.title}</h3>
                    </div>
                    <SeverityBadge severity={decision.severity} />
                  </div>
                  <div className="space-y-2 text-[12px] leading-relaxed text-stone-700">
                    <p><b>Fato:</b> {decision.fact}</p>
                    <p><b>Leitura:</b> {decision.inference}</p>
                    <p><b>Impacto:</b> {decision.impact}</p>
                    <p><b>Recomendação:</b> {decision.recommendation}</p>
                  </div>
                  <div className="mt-3 rounded-xl p-3 flex items-start gap-2" style={{ background: "#f0fdf4" }}>
                    <ArrowRight size={15} className="shrink-0 mt-0.5" style={{ color: DARK }} />
                    <div className="text-[12px] text-stone-800"><b>Próxima ação:</b> {decision.nextAction}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Evidências · confiança {decision.confidence}</div>
                    {(decision.evidence || []).map((evidence, index) => <div key={index} className="text-[11px] text-stone-500">• {evidence}</div>)}
                  </div>
                </div>
              ))}
            </div>

            {(analysis.risks || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">Riscos a monitorar</div>
                <div className="space-y-3">
                  {analysis.risks.map((risk, index) => (
                    <div key={`${risk.title}-${index}`} className="text-[12px] leading-relaxed">
                      <div className="font-bold text-stone-800">{risk.title}</div>
                      <div className="text-stone-500">Evidência: {risk.evidence}</div>
                      <div className="text-stone-700">Mitigação: {risk.mitigation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(analysis.missingData || []).length > 0 && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-2">Dados que aumentariam a confiança</div>
                {analysis.missingData.map((item, index) => <div key={index} className="text-[12px] text-amber-900">• {item}</div>)}
              </div>
            )}

            <p className="text-[10px] text-stone-400 leading-relaxed px-1">{analysis.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
