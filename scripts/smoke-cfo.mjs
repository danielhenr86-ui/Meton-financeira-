import { analyzeCfo, toPublicCfoError } from "../api/_cfoAgent.js";
import { createSampleCfoSnapshot } from "./cfoSample.mjs";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY ausente. Carregue a credencial server-side antes do smoke test.");
}

try {
  const analysis = await analyzeCfo({
    question: "Quais sao as 3 decisoes financeiras mais importantes agora e por que?",
    snapshot: createSampleCfoSnapshot(),
  });

  console.log(JSON.stringify({
    executiveSummary: analysis.executiveSummary,
    decisions: analysis.decisions.map((decision) => ({
      priority: decision.priority,
      title: decision.title,
      confidence: decision.confidence,
      evidence: decision.evidence,
    })),
    missingData: analysis.missingData,
  }, null, 2));
} catch (error) {
  const publicError = toPublicCfoError(error);
  console.error(`[smoke:cfo] ${publicError.body.error}: ${publicError.body.message}`);
  process.exitCode = 1;
}
