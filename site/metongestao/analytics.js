(()=> {
  if (navigator.doNotTrack === "1") return;

  const endpoint = "/api/event";
  const params = new URLSearchParams(location.search);
  const campaign = {
    source: (params.get("utm_source") || "").slice(0, 80),
    medium: (params.get("utm_medium") || "").slice(0, 80),
    campaign: (params.get("utm_campaign") || "").slice(0, 120),
    content: (params.get("utm_content") || "").slice(0, 120),
    term: (params.get("utm_term") || "").slice(0, 120)
  };

  const getSessionId = () => {
    let id = sessionStorage.getItem("meton_site_session");
    if (!id) {
      id = (globalThis.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : "s_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      sessionStorage.setItem("meton_site_session", id);
    }
    return id;
  };
  const sessionId = getSessionId();

  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : ""; } catch {}

  const send = (event, detail = {}) => {
    const payload = {
      event: String(event || "").slice(0, 80),
      path: location.pathname.slice(0, 160),
      sessionId,
      referrer,
      ...campaign,
      context: String(detail.context || detail.label || "").slice(0, 100),
      plan: String(detail.plan || "").slice(0, 40),
      segment: String(detail.segment || "").slice(0, 60),
      field: String(detail.field || "").slice(0, 60),
      value: String(detail.value || detail.area || "").slice(0, 80)
    };

    fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit"
    }).catch(() => {});
  };

  const decorateDiagnosticLinks = () => {
    document.querySelectorAll('a[href*="formulario.metongestao.com.br"]').forEach((a) => {
      try {
        const u = new URL(a.href);
        u.searchParams.set("utm_source", campaign.source || "site");
        u.searchParams.set("utm_medium", campaign.medium || "owned");
        u.searchParams.set("utm_campaign", campaign.campaign || "diagnostico_site");
        if (campaign.term) u.searchParams.set("utm_term", campaign.term);
        u.searchParams.set(
          "utm_content",
          campaign.content || a.dataset.utmContent || "site_cta"
        );
        a.href = u.toString();
      } catch {}
    });
  };

  decorateDiagnosticLinks();
  send("page_view");

  const interactiveHome = Boolean(document.querySelector("#diagnostico"));
  if (interactiveHome) {
    window.addEventListener("meton:interaction", (ev) => {
      const detail = ev.detail || {};
      if (detail.event) send(detail.event, detail);
    });
  }

  document.addEventListener("click", (ev) => {
    const link = ev.target.closest && ev.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.includes("formulario.metongestao.com.br")) {
      send("diagnostic_open", {context: (link.textContent || "").trim()});
    } else if (!interactiveHome && href.includes("wa.me")) {
      send("whatsapp_click", {context: (link.textContent || "").trim()});
    } else if (!interactiveHome && href.includes("#diagnostico")) {
      send("diagnostic_open", {context: (link.textContent || "").trim()});
    }
  }, {capture: true});
})();