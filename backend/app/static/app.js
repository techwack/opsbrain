// ───────────────────────── demo fallback ─────────────────────────
// When the backend isn't reachable (e.g. static preview), the UI stays
// fully alive with representative data so the product is always demoable.
const DEMO = {
  health: { llm_enabled: true, model: "claude-opus-4-8 (demo)", chunks: 47, documents: [
    "01_pump_P-204_OEM_manual.md", "02_workorder_history_unit2.md",
    "03_OISD-STD-105_excerpt.md", "04_incident_report_NM-2023-058.md",
    "05_PID_unit2_description.md",
  ]},
  ask: (q) => {
    const k = q.toLowerCase();
    if (k.includes("seal") && k.includes("safe"))
      return {
        answer:
"To replace the **mechanical seal on P-204** safely:\n\n1. Raise a valid **Permit-to-Work** — mandatory for seal jobs per OISD-STD-105 Clause 4.2 [S3].\n2. **Isolate** suction valve `V-204A` and discharge valve `V-204B`, de-energize motor `M-204` at MCC-2, and apply **LOTO** [S1].\n3. ⚠ `V-204B` has a history of passing (WO-2024-0512) — confirm positive isolation; use **double block and bleed** if integrity is in doubt [S1].\n4. Replace the **John Crane Type 2100** seal faces and O-rings **as a set**; torque gland nuts to **25 N·m** in a star pattern [S1].\n5. Verify the **API Plan 11+62** flush/quench is clear before restart [S2].",
        confidence: 0.91,
        sources: [
          { id:"S1", source:"01_pump_P-204_OEM_manual.md", page:1, score:0.93, snippet:"Before any intervention on P-204, isolate suction valve V-204A and discharge valve V-204B, de-energize motor M-204… apply LOTO. A valid Permit-to-Work is mandatory." },
          { id:"S2", source:"02_workorder_history_unit2.md", page:1, score:0.88, snippet:"Flush plan upgraded to API Plan 11 + 62 (quench). Root cause: inadequate flush margin under high suction temperature." },
          { id:"S3", source:"03_OISD-STD-105_excerpt.md", page:1, score:0.85, snippet:"A valid written Permit-to-Work shall be issued before any maintenance on hydrocarbon service equipment." },
        ],
      };
    if (k.includes("vibration"))
      return {
        answer:
"The **vibration trip limit** on `P-204` is **7.1 mm/s RMS** (ISO 10816-3); the alert/trend level is 4.5 mm/s [S1].\n\nIn **WO-2024-0377**, vibration trended from 3.2 → 5.1 mm/s over three weeks with bearing temp at 88 °C. Root cause was **thermal misalignment** (coupling 0.3 mm off). Laser alignment restored it to 2.8 mm/s [S2]. A rising vibration + bearing-temp trend is the classic early indicator of misalignment or bearing wear [S1].",
        confidence: 0.89,
        sources: [
          { id:"S1", source:"01_pump_P-204_OEM_manual.md", page:1, score:0.9, snippet:"Vibration limit (overall): 4.5 mm/s RMS per ISO 10816-3. Above 7.1 mm/s = shutdown." },
          { id:"S2", source:"02_workorder_history_unit2.md", page:1, score:0.87, snippet:"Vibration trend rose from 3.2 to 5.1 mm/s… coupling found 0.3 mm misaligned… returned to 2.8 mm/s." },
        ],
      };
    if (k.includes("isolate"))
      return {
        answer:
"To **isolate `P-204`** for maintenance [S1]:\n\n1. Close **suction** valve `V-204A` and **discharge** valve `V-204B`.\n2. De-energize motor `M-204` at **MCC-2** and apply **LOTO**.\n3. ⚠ Per OISD-STD-105 Clause 6.3, a passing valve can't be the sole isolation point — `V-204B` has passed before, so verify positive isolation or use **double block and bleed / a spade** [S2].",
        confidence: 0.9,
        sources: [
          { id:"S1", source:"05_PID_unit2_description.md", page:1, score:0.92, snippet:"P-204 is isolated by closing V-204A (suction) and V-204B (discharge)." },
          { id:"S2", source:"03_OISD-STD-105_excerpt.md", page:1, score:0.86, snippet:"A valve that passes shall not be relied upon as a sole isolation point; double block and bleed or a spade/blind shall be used." },
        ],
      };
    return {
      answer:
"On **`P-204`** in the last year there were two notable events:\n\n• **WO-2024-0142** — a gland leak (~12 drops/min, seal chamber 78 °C). Replaced the Type 2100 seal; root cause was **loss of seal flush** (choked API Plan 11 line) [S1].\n• **WO-2024-0377** — vibration trended up to 5.1 mm/s with bearing temp 88 °C; **thermal misalignment** corrected by laser alignment [S2].\n\n⚠ A prior repeat seal failure escalated to **near-miss NM-2023-058** (crude pool near a hot surface) — the flush was upgraded to API Plan 11+62 [S1].",
      confidence: 0.88,
      sources: [
        { id:"S1", source:"02_workorder_history_unit2.md", page:1, score:0.91, snippet:"WO-2024-0142… Gland leak… Replaced John Crane Type 2100 seal… Root cause: loss of seal flush leading to dry running." },
        { id:"S2", source:"02_workorder_history_unit2.md", page:1, score:0.86, snippet:"WO-2024-0377… Vibration trend rose from 3.2 to 5.1 mm/s RMS… Root cause: thermal misalignment." },
      ],
    };
  },
  compliance: {
    summary: "2 gaps found for 'P-204 mechanical seal' — one high-severity RCFA omission and one isolation-integrity gap.",
    gaps: [
      { title:"No RCFA after repeat seal failures", severity:"high", standard:"OISD-STD-105 Clause 5.1", evidence:"S1",
        finding:"P-204 logged three seal failures across 2023–24, including a high-potential near-miss (NM-2023-058), but no documented Root Cause Failure Analysis was raised. The standard mandates an RCFA after more than two seal failures in any 12-month period.",
        recommended_action:"Raise and track a formal RCFA on the P-204 seal failures to closure; review flush adequacy at peak suction temperature." },
      { title:"Isolation integrity not verified", severity:"medium", standard:"OISD-STD-105 Clause 6.3", evidence:"S2",
        finding:"Discharge valve V-204B has a recorded passing history (WO-2024-0512) yet is still used as a primary isolation point for seal work.",
        recommended_action:"Mandate double block and bleed (or a spade) and a positive-isolation check on the P-204 PTW until V-204B integrity is re-validated." },
    ],
  },
  graph: {
    engine: "demo", nodes: [
      {id:"P-204",type:"equipment",weight:.9},{id:"V-204A",type:"equipment",weight:.3},{id:"V-204B",type:"equipment",weight:.4},
      {id:"M-204",type:"equipment",weight:.3},{id:"HX-301",type:"equipment",weight:.2},{id:"C-101",type:"equipment",weight:.2},
      {id:"Seal failure",type:"failure",weight:.6},{id:"Cavitation",type:"failure",weight:.3},{id:"Bearing failure",type:"failure",weight:.3},
      {id:"OISD-STD-105",type:"standard",weight:.7},{id:"Crude transfer loop",type:"system",weight:.5},{id:"Unit-2",type:"location",weight:.4},
    ],
    edges: [
      {source:"P-204",target:"Seal failure",relation:"has_failure_mode"},{source:"P-204",target:"Cavitation",relation:"has_failure_mode"},
      {source:"P-204",target:"Bearing failure",relation:"has_failure_mode"},{source:"P-204",target:"V-204A",relation:"isolated_by"},
      {source:"P-204",target:"V-204B",relation:"isolated_by"},{source:"P-204",target:"M-204",relation:"driven_by"},
      {source:"P-204",target:"OISD-STD-105",relation:"governed_by"},{source:"Seal failure",target:"OISD-STD-105",relation:"governed_by"},
      {source:"P-204",target:"Crude transfer loop",relation:"part_of"},{source:"HX-301",target:"Crude transfer loop",relation:"part_of"},
      {source:"Crude transfer loop",target:"Unit-2",relation:"located_in"},{source:"C-101",target:"Unit-2",relation:"located_in"},
    ],
  },
};
let DEMO_MODE = false;

async function api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

// ───────────────────────── nav ─────────────────────────
const TITLES = {
  ask: ["Ask OpsBrain", "Grounded answers from your plant's manuals, work orders & standards — with citations."],
  compliance: ["Compliance Audit", "Auto-audit equipment against OISD & Factory Act standards for ranked gaps."],
  graph: ["Knowledge Graph", "Equipment, failure modes, systems and standards extracted from your corpus."],
  docs: ["Documents", "Upload plant documents — they're chunked, embedded and indexed instantly."],
};
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    item.classList.add("active");
    const id = item.dataset.tab;
    document.getElementById(id).classList.add("active");
    document.getElementById("pageTitle").textContent = TITLES[id][0];
    document.getElementById("pageSub").textContent = TITLES[id][1];
  });
});

// ───────────────────────── status / health ─────────────────────────
async function refreshStatus() {
  let h;
  try { h = await api("/api/health"); DEMO_MODE = false; }
  catch { h = DEMO.health; DEMO_MODE = true; }

  const st = document.getElementById("status");
  st.className = "status " + (DEMO_MODE ? "demo" : "live");
  st.querySelector("span").textContent = DEMO_MODE
    ? "demo mode · backend offline"
    : (h.llm_enabled ? h.model : "retrieval-only");

  document.getElementById("mDocs").textContent = h.documents.length;
  document.getElementById("mChunks").textContent = h.chunks;
  document.getElementById("env").textContent = DEMO_MODE
    ? "Start the backend for live data" : "● connected";
  renderDocs(h.documents);
}

// ───────────────────────── chat ─────────────────────────
const chat = document.getElementById("chat");
function clearWelcome() { const w = chat.querySelector(".welcome"); if (w) w.remove(); }
function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fmt(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[(S\d+)\]/g, '<span class="cite">[$1]</span>');
}
function addMsg(role, inner) {
  clearWelcome();
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.innerHTML =
    `<div class="avatar">${role === "bot" ? "◆" : "You"}</div><div class="bubble">${inner}</div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div.querySelector(".bubble");
}
function sourcesHtml(sources) {
  if (!sources || !sources.length) return "";
  return '<div class="sources"><div class="sources-h">Sources</div>' +
    sources.map((s) =>
      `<div class="src"><span class="src-h">[${s.id}] ${esc(s.source)}</span> <span class="src-m">· p.${s.page} · relevance ${s.score}</span><span class="snip">${esc(s.snippet)}</span></div>`
    ).join("") + "</div>";
}
async function ask(question) {
  addMsg("user", esc(question));
  const pending = addMsg("bot", '<span class="loading">OpsBrain is reasoning<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>');
  let res;
  try {
    res = await api("/api/ask", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ question }) });
  } catch { await new Promise(r=>setTimeout(r,420)); res = DEMO.ask(question); }
  const pct = Math.round((res.confidence || 0) * 100);
  pending.innerHTML =
    `<div class="ans">${fmt(res.answer)}</div>` +
    `<div class="conf">confidence <div class="bar"><i style="width:${pct}%"></i></div> ${pct}%</div>` +
    sourcesHtml(res.sources);
  chat.scrollTop = chat.scrollHeight;
}
document.getElementById("askForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("q");
  if (input.value.trim()) { ask(input.value.trim()); input.value = ""; }
});
document.querySelectorAll("#suggestions .chip").forEach((c) =>
  c.addEventListener("click", () => ask(c.textContent)));

// ───────────────────────── compliance ─────────────────────────
document.getElementById("compForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = document.getElementById("topic").value.trim();
  if (!topic) return;
  const out = document.getElementById("compResult");
  out.innerHTML = '<div class="loading">Auditing against OISD / Factory Act standards<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>';
  let res;
  try {
    res = await api("/api/compliance", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ topic }) });
  } catch { await new Promise(r=>setTimeout(r,500)); res = DEMO.compliance; }
  let html = `<div class="comp-summary">${esc(res.summary || "")}</div>`;
  (res.gaps || []).forEach((g) => {
    html += `<div class="gap">
      <div class="gap-head"><span class="sev ${g.severity}">${g.severity}</span><h4>${esc(g.title)}</h4></div>
      <div class="std">📑 ${esc(g.standard || "")} ${g.evidence ? "· " + g.evidence : ""}</div>
      <p>${esc(g.finding || "")}</p>
      <p class="rec">→ ${esc(g.recommended_action || "")}</p></div>`;
  });
  if (!(res.gaps || []).length) html += '<div class="empty"><div class="empty-ic">✅</div><p>No compliance gaps detected for this topic.</p></div>';
  out.innerHTML = html;
});

// ───────────────────────── knowledge graph ─────────────────────────
const typeColor = { equipment:"#3b82f6", system:"#10b981", failure:"#ef4444", standard:"#f59e0b", location:"#a78bfa" };
document.getElementById("buildGraph").addEventListener("click", async () => {
  document.getElementById("graphEngine").textContent = "building…";
  let g;
  try { g = await api("/api/graph"); } catch { await new Promise(r=>setTimeout(r,400)); g = DEMO.graph; }
  document.getElementById("graphEngine").textContent =
    `${g.nodes.length} nodes · ${g.edges.length} edges · engine: ${g.engine}`;
  const nodes = g.nodes.map((n) => ({
    id:n.id, label:n.id, color:{background:typeColor[n.type]||"#8da3c0", border:typeColor[n.type]||"#8da3c0"},
    value:(n.weight||0)*100+12, font:{color:"#eef3fa", size:13}, borderWidth:0,
  }));
  const edges = g.edges.map((e) => ({
    from:e.source, to:e.target, label:e.relation, arrows:"to",
    color:{color:"#2c3a52", highlight:"#4f8cff"}, font:{color:"#5d6f8a", size:10, strokeWidth:0}, smooth:{type:"continuous"},
  }));
  new vis.Network(document.getElementById("network"),
    { nodes:new vis.DataSet(nodes), edges:new vis.DataSet(edges) },
    { nodes:{shape:"dot", scaling:{min:10,max:40}}, physics:{stabilization:true, barnesHut:{springLength:150, gravitationalConstant:-9000}}, interaction:{hover:true} });
});

// ───────────────────────── documents ─────────────────────────
function renderDocs(docs) {
  const el = document.getElementById("docList");
  if (!el) return;
  el.innerHTML = (docs || []).map((d) =>
    `<div class="doc"><span class="ic">📄</span> ${esc(d)}</div>`).join("");
}
const fileInput = document.getElementById("file");
const drop = document.getElementById("drop");
fileInput.addEventListener("change", () => {
  document.getElementById("fileLabel").textContent = fileInput.files[0]?.name || "Drop a PDF / TXT / MD here, or click to choose";
});
["dragover","dragenter"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => { if (e.dataTransfer.files[0]) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event("change")); } });
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const f = fileInput.files[0];
  if (!f) return alert("Choose a file first");
  if (DEMO_MODE) return alert("Demo mode — start the backend to index real uploads.");
  const fd = new FormData(); fd.append("file", f);
  await fetch("/api/upload", { method:"POST", body: fd });
  refreshStatus(); alert(`Indexed ${f.name}`);
});
document.getElementById("reindexBtn").addEventListener("click", async () => {
  if (DEMO_MODE) return alert("Demo mode — backend offline.");
  await api("/api/reindex", { method:"POST" }); refreshStatus();
});

refreshStatus();
