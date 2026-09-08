const clean = (value, max = 120) => {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
};

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const origin = clean(req.headers.origin || "", 200);
  if (origin && !/^https:\/\/([a-z0-9-]+\.)?(metongestao\.com\.br|vercel\.app)$/i.test(origin)) {
    return res.status(403).end();
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const event = clean(body.event, 80);
  const path = clean(body.path, 160);
  if (!event || !path) return res.status(400).end();

  const record = {
    type: "meton_analytics",
    event,
    path,
    context: clean(body.context, 100),
    plan: clean(body.plan, 40),
    segment: clean(body.segment, 60),
    field: clean(body.field, 60),
    value: clean(body.value, 80),
    source: clean(body.source, 80),
    medium: clean(body.medium, 80),
    campaign: clean(body.campaign, 120),
    referrer: clean(body.referrer, 120)
  };

  console.log("METON_EVENT " + JSON.stringify(record));
  res.setHeader("Cache-Control", "no-store");
  return res.status(204).end();
};