const api = (path, opts) => fetch(path, opts).then((r) => r.json());

// ---- tabs ----
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ---- health / status ----
async function refreshStatus() {
  try {
    const h = await api("/api/health");
    const el = document.getElementById("status");
    el.classList.add("live");
    el.textContent = `${h.chunks} chunks · ${h.documents.length} docs · ${
      h.llm_enabled ? h.model : "retrieval-only"
    }`;
    renderDocs(h.documents);
  } catch {
    document.getElementById("status").textContent = "offline";
  }
}

// ---- ask / chat ----
const chat = document.getElementById("chat");
function addMsg(cls, html) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}
function fmt(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[(S\d+)\]/g, '<b>[$1]</b>');
}
function sourcesHtml(sources) {
  if (!sources || !sources.length) return "";
  return (
    '<div class="sources">' +
    sources
      .map(
        (s) =>
          `<div class="src"><b>[${s.id}] ${s.source}</b> <span>· p.${s.page} · relevance ${s.score}</span><br><span>${
            (s.snippet || "").replace(/</g, "&lt;")
          }</span></div>`
      )
      .join("") +
    "</div>"
  );
}
async function ask(question) {
  addMsg("user", fmt(question));
  const pending = addMsg("bot", '<span class="loading">OpsBrain is reasoning<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>');
  try {
    const res = await api("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const pct = Math.round((res.confidence || 0) * 100);
    pending.innerHTML =
      `<div class="ans">${fmt(res.answer)}</div>` +
      `<div class="conf">confidence <div class="bar"><i style="width:${pct}%"></i></div> ${pct}%</div>` +
      sourcesHtml(res.sources);
    chat.scrollTop = chat.scrollHeight;
  } catch {
    pending.innerHTML = '<div class="ans">Something went wrong. Is the server running?</div>';
  }
}
document.getElementById("askForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("q");
  if (input.value.trim()) {
    ask(input.value.trim());
    input.value = "";
  }
});
document.querySelectorAll("#suggestions .chip").forEach((c) =>
  c.addEventListener("click", () => ask(c.textContent))
);

// ---- compliance ----
document.getElementById("compForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = document.getElementById("topic").value.trim();
  if (!topic) return;
  const out = document.getElementById("compResult");
  out.innerHTML = '<div class="loading">Auditing against OISD / Factory Act standards<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>';
  const res = await api("/api/compliance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  let html = `<div class="comp-summary">${res.summary || ""}</div>`;
  (res.gaps || []).forEach((g) => {
    html += `<div class="gap">
      <div class="gap-head"><span class="sev ${g.severity}">${g.severity}</span><h4>${g.title}</h4></div>
      <div class="std">📑 ${g.standard || ""} ${g.evidence ? "· " + g.evidence : ""}</div>
      <p>${g.finding || ""}</p>
      <p class="rec">→ ${g.recommended_action || ""}</p>
    </div>`;
  });
  if (!(res.gaps || []).length) html += '<div class="muted">No compliance gaps detected for this topic.</div>';
  out.innerHTML = html;
});

// ---- knowledge graph ----
const typeColor = {
  equipment: "#2f9bff", system: "#16c79a", failure: "#ff5c5c",
  standard: "#ffb020", location: "#a78bfa",
};
document.getElementById("buildGraph").addEventListener("click", async () => {
  document.getElementById("graphEngine").textContent = "building…";
  const g = await api("/api/graph");
  document.getElementById("graphEngine").textContent =
    `${g.nodes.length} nodes · ${g.edges.length} edges · engine: ${g.engine}`;
  const nodes = g.nodes.map((n) => ({
    id: n.id,
    label: n.id,
    color: typeColor[n.type] || "#8da2bd",
    value: (n.weight || 0) * 100 + 10,
    font: { color: "#e6edf6" },
  }));
  const edges = g.edges.map((e) => ({
    from: e.source, to: e.target, label: e.relation, arrows: "to",
    color: { color: "#3a4a66" }, font: { color: "#8da2bd", size: 10, strokeWidth: 0 },
  }));
  new vis.Network(
    document.getElementById("network"),
    { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) },
    {
      nodes: { shape: "dot", scaling: { min: 8, max: 36 } },
      edges: { smooth: { type: "continuous" } },
      physics: { stabilization: true, barnesHut: { springLength: 140 } },
      interaction: { hover: true },
    }
  );
});

// ---- documents ----
function renderDocs(docs) {
  const el = document.getElementById("docList");
  if (!el) return;
  el.innerHTML = (docs || [])
    .map((d) => `<div class="doc"><span class="ic">📄</span> ${d}</div>`)
    .join("");
}
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const f = document.getElementById("file").files[0];
  if (!f) return alert("Choose a file first");
  const fd = new FormData();
  fd.append("file", f);
  await fetch("/api/upload", { method: "POST", body: fd });
  refreshStatus();
  alert(`Indexed ${f.name}`);
});
document.getElementById("reindexBtn").addEventListener("click", async () => {
  await api("/api/reindex", { method: "POST" });
  refreshStatus();
});

refreshStatus();
