'use strict';

const SUPABASE_URL = 'https://qhqqlyvgtmekngnrtbel.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rzUUuLcv-HW8jiDVeqV52w_BfxAXaLg';
const MAX_BODY_BYTES = 16 * 1024;
const ALLOWED_EVENTS = new Set([
  'page_view','diagnostic_open','whatsapp_click','site_click',
  'meton_demo_change','meton_plan_finder_choice',
  'meton_plan_finder_whatsapp','meton_cta_click'
]);

const clean = (value, max = 120) => {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
};

async function persist(record) {
  const eventName = ALLOWED_EVENTS.has(record.event) ? record.event : 'site_click';
  const response = await fetch(`${SUPABASE_URL}/rest/v1/growth_events`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      session_id: record.sessionId || null,
      event_name: eventName,
      source: record.source || 'site',
      utm_source: record.source || null,
      utm_medium: record.medium || null,
      utm_campaign: record.campaign || null,
      utm_content: record.content || null,
      path: record.path,
      metadata: {
        context: record.context,
        plan: record.plan,
        segment: record.segment,
        field: record.field,
        value: record.value,
        term: record.term,
        referrer: record.referrer
      }
    })
  });
  if (!response.ok) throw new Error('growth_event_insert_failed:' + response.status);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const length = Number(req.headers['content-length'] || 0);
  if (length > MAX_BODY_BYTES) return res.status(413).end();

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
    event,
    path,
    sessionId: clean(body.sessionId, 120),
    context: clean(body.context, 100),
    plan: clean(body.plan, 40),
    segment: clean(body.segment, 60),
    field: clean(body.field, 60),
    value: clean(body.value, 80),
    source: clean(body.source, 80),
    medium: clean(body.medium, 80),
    campaign: clean(body.campaign, 120),
    content: clean(body.content, 120),
    term: clean(body.term, 120),
    referrer: clean(body.referrer, 120)
  };

  console.log("METON_EVENT " + JSON.stringify(record));
  try {
    await persist(record);
  } catch (error) {
    console.error('METON_EVENT_STORE_FAILED', error?.message || error);
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(204).end();
};