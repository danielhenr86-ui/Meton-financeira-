(()=> {
  if (navigator.doNotTrack === "1") return;

  const endpoint = "/api/event";
  const params = new URLSearchParams(location.search);
  const campaign = {
    source: (params.get("utm_source") || "").slice(0, 80),
    medium: (params.get("utm_medium") || "").slice(0, 80),
    campaign: (params.get("utm_campaign") || "").slice(0, 120)
  };

  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : ""; } catch {}

  const send = (event, detail = {}) => {
    const payload = {
      event: String(event || "").slice(0, 80),
      path: location.pathname.slice(0, 160),
      referrer,
      ...campaign,
      context: String(detail.context || detail.label || "").slice(0, 100),
      plan: String(detail.plan || "").slice(0, 40),
      segment: String(detail.segment || "").slice(0, 60),
      field: String(detail.field || "").slice(0, 60),
      value: String(detail.value || detail.area || "").slice(0, 80)
    };

    const body = JSON.stringify(payload);
    fetch(endpoint, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body,
      keepalive: true,
      credentials: "omit"
    }).catch(() => {});
  };

  send("page_view");

  const interactiveHome = Boolean(document.querySelector("#diagnostico"));
  if (interactiveHome) {
    window.addEventListener("meton:interaction", (ev) => {
      const detail = ev.detail || {};
      if (detail.event) send(detail.event, detail);
    });
  } else {
    document.addEventListener("click", (ev) => {
      const link = ev.target.closest && ev.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.includes("wa.me")) {
        send("whatsapp_click", {context: (link.textContent || "").trim()});
      } else if (href.includes("#diagnostico")) {
        send("diagnostic_open", {context: (link.textContent || "").trim()});
      }
    }, {capture: true});
  }
})();