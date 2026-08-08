import { analyzeCfo, toPublicCfoError } from "./_cfoAgent.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed", message: "Use POST /api/cfo." });
  }

  try {
    let body = request.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return response.status(400).json({ error: "invalid_json", message: "JSON inválido." });
      }
    }
    const analysis = await analyzeCfo(body);
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({ analysis });
  } catch (error) {
    const publicError = toPublicCfoError(error);
    response.setHeader("Cache-Control", "no-store");
    return response.status(publicError.status).json(publicError.body);
  }
}
