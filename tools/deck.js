// OpsBrain pitch deck — pptxgenjs. Dark, product-matched theme.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const A = path.join(__dirname, "..", "docs", "assets");
const img = (f) => path.join(A, f);
const has = (f) => fs.existsSync(img(f));

const C = {
  bg: "0A0E16", panel: "141C28", panel2: "1B2536", line: "26344A",
  text: "EEF3FA", muted: "9DB0CB", faint: "5D6F8A",
  blue: "4F8CFF", teal: "14D3B0", indigo: "7C8CFF",
  high: "EF4444", med: "F59E0B", low: "10B981",
};
const F = { head: "Calibri", body: "Calibri" };

const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";
const W = 13.333, H = 7.5;

// ---------- helpers ----------
function bg(s, color = C.bg) { s.background = { color }; }

function dotMotif(s, x, y, scale = 1) {
  // small node-and-edge cluster used as a recurring motif
  const nodes = [[0,0,.18,C.blue],[.9,.35,.12,C.teal],[.5,.95,.1,C.indigo],[1.5,.1,.09,C.faint],[1.2,.85,.13,C.blue]];
  const edges = [[0,1],[0,2],[1,3],[1,4]];
  edges.forEach(([a,b]) => s.addShape("line", {
    x: x+nodes[a][0]*scale+nodes[a][2]*scale/2, y: y+nodes[a][1]*scale+nodes[a][2]*scale/2,
    w: (nodes[b][0]-nodes[a][0])*scale, h: (nodes[b][1]-nodes[a][1])*scale,
    line: { color: C.line, width: 1 },
  }));
  nodes.forEach(([nx,ny,r,col]) => s.addShape("ellipse", {
    x: x+nx*scale, y: y+ny*scale, w: r*scale, h: r*scale, fill: { color: col }, line: { type: "none" },
  }));
}

function logo(s, x, y, d = 0.55) {
  s.addShape("roundRect", { x, y, w: d, h: d, rectRadius: d*0.28, fill: { color: C.blue }, line: { type: "none" } });
  s.addText("◆", { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: F.head, fontSize: d*30, color: "03121F", bold: true });
}

function eyebrow(s, x, y, txt) {
  s.addText(txt.toUpperCase(), { x, y, w: 8, h: 0.3, fontFace: F.body, fontSize: 11, color: C.teal, bold: true, charSpacing: 2 });
}

function kicker(s) { // page motif bottom-right
  dotMotif(s, W-2.5, H-1.9, 1.0);
}

// ---------- 1. Title ----------
let s = p.addSlide(); bg(s);
logo(s, 0.9, 0.85, 0.62);
s.addText("OpsBrain", { x: 1.65, y: 0.82, w: 6, h: 0.7, fontFace: F.head, fontSize: 26, bold: true, color: C.text });
s.addText("The operations brain for the plant floor.", {
  x: 0.9, y: 2.7, w: 9.5, h: 1.4, fontFace: F.head, fontSize: 44, bold: true, color: C.text, lineSpacingMultiple: 1.0,
});
s.addText("Ask your plant's manuals, work orders and safety standards in plain language — and get a cited answer back in seconds.", {
  x: 0.92, y: 4.15, w: 8.6, h: 0.9, fontFace: F.body, fontSize: 16, color: C.muted, lineSpacingMultiple: 1.15,
});
s.addText([
  { text: "ET AI Hackathon 2.0", options: { color: C.text, bold: true } },
  { text: "   ·   Problem Statement 8 — Industrial Knowledge Intelligence", options: { color: C.muted } },
], { x: 0.92, y: 6.25, w: 11, h: 0.4, fontFace: F.body, fontSize: 13 });
s.addText("Divyanshi Jain   ·   github.com/techwack/opsbrain", { x: 0.92, y: 6.7, w: 11, h: 0.35, fontFace: F.body, fontSize: 12, color: C.faint });
dotMotif(s, 10.3, 1.1, 1.7);

// ---------- 2. Problem ----------
s = p.addSlide(); bg(s, C.bg);
eyebrow(s, 0.9, 0.7, "The problem");
s.addText("Engineers don't have a data problem.\nThey have a retrieval problem.", {
  x: 0.88, y: 1.05, w: 11.2, h: 1.5, fontFace: F.head, fontSize: 32, bold: true, color: C.text, lineSpacingMultiple: 1.05,
});
s.addText("A single refinery runs on tens of thousands of pages — OEM manuals, P&IDs, work orders, OISD standards, incident reports — spread across binders, shared drives and three generations of software. When a pump trips at 2 a.m., the answer almost always exists somewhere. Finding it is the hard part.", {
  x: 0.9, y: 2.75, w: 7.4, h: 1.6, fontFace: F.body, fontSize: 16, color: C.muted, lineSpacingMultiple: 1.25,
});
const pains = [
  ["Scattered", "Manuals, drawings and logs live in different systems that don't talk to each other."],
  ["Tribal", "The engineer who remembers the 2019 failure is the search index. When they retire, it's gone."],
  ["Buried", "Compliance obligations sit inside 200-page PDFs nobody re-reads until after an incident."],
];
pains.forEach((pn, i) => {
  const x = 8.7, y = 2.65 + i*1.45;
  s.addShape("roundRect", { x, y, w: 3.7, h: 1.25, rectRadius: 0.1, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
  s.addText(pn[0], { x: x+0.25, y: y+0.15, w: 3.2, h: 0.35, fontFace: F.head, fontSize: 15, bold: true, color: C.blue });
  s.addText(pn[1], { x: x+0.25, y: y+0.5, w: 3.25, h: 0.7, fontFace: F.body, fontSize: 11.5, color: C.muted, lineSpacingMultiple: 1.1 });
});

// ---------- 3. Why it matters ----------
s = p.addSlide(); bg(s, "0E1622");
eyebrow(s, 0.9, 0.7, "Why it's worth solving");
s.addText("The cost shows up as time, repeated mistakes, and risk.", {
  x: 0.88, y: 1.05, w: 11.5, h: 0.8, fontFace: F.head, fontSize: 28, bold: true, color: C.text,
});
const stats = [
  ["~35%", "of a process engineer's day goes to searching for information that already exists.", C.blue],
  ["Repeat", "failures recur because the last work order on that asset is never read before the next job.", C.teal],
  ["After", "the incident is usually when a buried compliance gap finally gets noticed.", C.med],
];
stats.forEach((st, i) => {
  const x = 0.9 + i*4.0;
  s.addShape("roundRect", { x, y: 2.4, w: 3.6, h: 3.2, rectRadius: 0.12, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
  s.addText(st[0], { x: x+0.3, y: 2.75, w: 3.0, h: 1.1, fontFace: F.head, fontSize: 46, bold: true, color: st[2] });
  s.addText(st[1], { x: x+0.32, y: 4.0, w: 3.0, h: 1.4, fontFace: F.body, fontSize: 14.5, color: C.muted, lineSpacingMultiple: 1.2 });
});
s.addText("Heavy industry is India's manufacturing backbone. Small percentages here are crores in lost productivity and avoidable downtime.", {
  x: 0.9, y: 5.95, w: 11.3, h: 0.6, fontFace: F.body, fontSize: 13, italic: true, color: C.faint,
});

// ---------- 4. What it is ----------
s = p.addSlide(); bg(s);
eyebrow(s, 0.9, 0.7, "What OpsBrain is");
s.addText("One place to ask — grounded in your own documents.", {
  x: 0.88, y: 1.05, w: 11.5, h: 0.8, fontFace: F.head, fontSize: 28, bold: true, color: C.text,
});
const caps = [
  ["Ask", "Plain-language questions get an answer that cites the exact document and page, with a confidence score so you know when to trust it.", C.blue],
  ["Audit", "Point it at an asset and it checks the operational record against OISD and Factory Act clauses, then ranks the gaps it finds.", C.teal],
  ["Map", "It pulls equipment tags, failure modes, systems and standards out of the corpus and draws the relationships between them.", C.indigo],
];
caps.forEach((c, i) => {
  const x = 0.9 + i*4.0;
  s.addShape("roundRect", { x, y: 2.3, w: 3.6, h: 3.6, rectRadius: 0.12, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
  s.addShape("ellipse", { x: x+0.3, y: 2.6, w: 0.7, h: 0.7, fill: { color: c[2] }, line: { type: "none" } });
  s.addText(["?","✓","◇"][i], { x: x+0.3, y: 2.6, w: 0.7, h: 0.7, align: "center", valign: "middle", fontFace: F.head, fontSize: 22, bold: true, color: "03121F" });
  s.addText(c[0], { x: x+0.3, y: 3.5, w: 3.0, h: 0.5, fontFace: F.head, fontSize: 20, bold: true, color: C.text });
  s.addText(c[1], { x: x+0.32, y: 4.05, w: 3.05, h: 1.7, fontFace: F.body, fontSize: 13.5, color: C.muted, lineSpacingMultiple: 1.22 });
});

// ---------- screenshot slides ----------
function shotSlide(file, eb, title, caption) {
  const sl = p.addSlide(); bg(sl);
  eyebrow(sl, 0.9, 0.6, eb);
  sl.addText(title, { x: 0.88, y: 0.92, w: 11.5, h: 0.6, fontFace: F.head, fontSize: 25, bold: true, color: C.text });
  sl.addText(caption, { x: 0.9, y: 1.5, w: 11.4, h: 0.5, fontFace: F.body, fontSize: 14, color: C.muted });
  if (has(file)) {
    // frame
    sl.addShape("roundRect", { x: 1.55, y: 2.15, w: 10.23, h: 5.05, rectRadius: 0.08, fill: { color: C.panel2 }, line: { color: C.line, width: 1 } });
    sl.addImage({ path: img(file), x: 1.62, y: 2.22, w: 10.1, h: 4.9, sizing: { type: "contain", w: 10.1, h: 4.9 } });
  } else {
    sl.addText("[ screenshot: " + file + " ]", { x: 1.55, y: 4.2, w: 10.2, h: 0.6, align: "center", color: C.faint, fontSize: 14 });
  }
}
shotSlide("02_answer.png", "Live product — Ask", "Every answer carries its sources.",
  "A field tech asks how to swap the seal on P-204; OpsBrain answers with the steps, the torque spec, and a safety flag — each line cited back to a document.");
shotSlide("03_compliance.png", "Live product — Compliance", "It finds the gap before the auditor does.",
  "Audit 'P-204 mechanical seal' and it surfaces a missing root-cause analysis after repeat failures and an isolation-integrity gap, ranked by severity.");
shotSlide("04_graph.png", "Live product — Knowledge graph", "The plant, as a graph.",
  "Equipment, failure modes and the standards that govern them, extracted automatically from the same documents that power the answers.");

// ---------- 8. Architecture ----------
s = p.addSlide(); bg(s, "0E1622");
eyebrow(s, 0.9, 0.7, "How it works");
s.addText("One service. Retrieval that runs anywhere. Claude for the reasoning.", {
  x: 0.88, y: 1.05, w: 11.6, h: 0.7, fontFace: F.head, fontSize: 24, bold: true, color: C.text,
});
function box(x, y, w, h, title, sub, col) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: C.panel }, line: { color: col || C.line, width: 1.25 } });
  s.addText(title, { x: x+0.15, y: y+0.16, w: w-0.3, h: 0.4, align: "center", fontFace: F.head, fontSize: 14.5, bold: true, color: C.text });
  if (sub) s.addText(sub, { x: x+0.15, y: y+0.58, w: w-0.3, h: h-0.7, align: "center", fontFace: F.body, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.05 });
}
function arrow(x, y, w, h) { s.addShape("line", { x, y, w, h, line: { color: C.teal, width: 2, endArrowType: "triangle" } }); }

box(0.9, 2.3, 11.5, 1.0, "Web UI — Ask · Compliance · Knowledge Graph · Documents", "Single-page front end, served by the same process. No build step, no CORS.", C.blue);
arrow(6.6, 3.35, 0, 0.45);
box(0.9, 3.85, 11.5, 0.9, "FastAPI service", "/ask   /compliance   /graph   /upload   /reindex   /health", C.teal);
arrow(3.0, 4.8, 0, 0.4); arrow(6.6, 4.8, 0, 0.4); arrow(10.2, 4.8, 0, 0.4);
box(0.9, 5.25, 3.5, 1.5, "Retrieval", "TF-IDF + cosine over chunked docs.\nPure-Python, pluggable for embeddings.");
box(4.9, 5.25, 3.5, 1.5, "Agents", "QA · Compliance · Graph.\nGrounded prompts, JSON-structured output.");
box(8.9, 5.25, 3.5, 1.5, "Ingestion", "pypdf → sentence-aware\nchunking → index.");
s.addText("Agents call →  Anthropic Claude (claude-opus-4-8)", { x: 4.9, y: 6.95, w: 7.5, h: 0.35, fontFace: F.body, fontSize: 11.5, italic: true, color: C.faint });

// ---------- 9. Engineering choices ----------
s = p.addSlide(); bg(s);
eyebrow(s, 0.9, 0.7, "Engineering choices");
s.addText("The decisions I'd defend in a review.", {
  x: 0.88, y: 1.05, w: 11.5, h: 0.7, fontFace: F.head, fontSize: 28, bold: true, color: C.text,
});
const choices = [
  ["Single service over a microservice split", "FastAPI serves the API and the UI from one process. The whole thing runs with one command — which matters more for a demo and a small team than premature separation."],
  ["TF-IDF retrieval over a heavyweight vector DB", "A managed vector store needs a GPU or a C++ build chain to install. TF-IDF clones and runs on any laptop. The store is behind an interface, so swapping in embeddings later is a one-file change."],
  ["Works with no API key", "Retrieval and the knowledge graph run offline; answers fall back to cited extracts. The product is never a blank screen, key or not."],
  ["Citations and a confidence score, always", "An operations tool that can't show its source is a liability. Every answer points back to a document and page."],
];
choices.forEach((c, i) => {
  const x = 0.9 + (i%2)*6.0, y = 2.35 + Math.floor(i/2)*2.25;
  s.addShape("roundRect", { x, y, w: 5.6, h: 2.0, rectRadius: 0.1, fill: { color: C.panel }, line: { color: C.line, width: 1 } });
  s.addText(c[0], { x: x+0.28, y: y+0.22, w: 5.05, h: 0.7, fontFace: F.head, fontSize: 16, bold: true, color: C.teal, lineSpacingMultiple: 1.0 });
  s.addText(c[1], { x: x+0.3, y: y+0.92, w: 5.05, h: 0.95, fontFace: F.body, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.18 });
});

// ---------- 10. Scale + roadmap ----------
s = p.addSlide(); bg(s, "0E1622");
eyebrow(s, 0.9, 0.7, "Where it goes");
s.addText("Same platform, different document corpus.", {
  x: 0.88, y: 1.05, w: 11.5, h: 0.7, fontFace: F.head, fontSize: 28, bold: true, color: C.text,
});
s.addText("Nothing in OpsBrain is specific to one plant. Point it at a different corpus and it works for steel, oil & gas, pharma or power — the documents change, the engine doesn't.", {
  x: 0.9, y: 1.95, w: 11.2, h: 0.9, fontFace: F.body, fontSize: 15.5, color: C.muted, lineSpacingMultiple: 1.2,
});
const road = [
  ["Now", "Cited Q&A, compliance gap detection, knowledge graph, document upload — running end to end."],
  ["Next", "OCR for scanned P&IDs so legacy drawings become searchable, not just typed docs."],
  ["Then", "Connectors into CMMS / SCADA (SAP PM, Maximo) so live work orders and readings flow in."],
  ["Later", "Predictive maintenance scoring from the work-order and sensor history it already holds."],
];
road.forEach((r, i) => {
  const x = 0.9 + i*3.0;
  s.addShape("ellipse", { x, y: 3.4, w: 0.32, h: 0.32, fill: { color: i===0?C.teal:C.line }, line: { type: "none" } });
  if (i < 3) s.addShape("line", { x: x+0.32, y: 3.56, w: 2.68, h: 0, line: { color: C.line, width: 1.5 } });
  s.addText(r[0], { x: x-0.1, y: 3.85, w: 2.7, h: 0.4, fontFace: F.head, fontSize: 16, bold: true, color: i===0?C.teal:C.text });
  s.addText(r[1], { x: x-0.1, y: 4.3, w: 2.75, h: 1.6, fontFace: F.body, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.2 });
});

// ---------- 11. Close ----------
s = p.addSlide(); bg(s);
logo(s, 0.9, 0.85, 0.55);
dotMotif(s, 10.2, 1.0, 1.7);
s.addText("Built in a weekend.\nDesigned to run in a plant.", {
  x: 0.9, y: 2.7, w: 10.5, h: 1.7, fontFace: F.head, fontSize: 40, bold: true, color: C.text, lineSpacingMultiple: 1.0,
});
s.addText("OpsBrain — Industrial Knowledge Intelligence", { x: 0.92, y: 4.5, w: 10, h: 0.5, fontFace: F.body, fontSize: 16, color: C.teal });
s.addText([
  { text: "github.com/techwack/opsbrain", options: { color: C.text, bold: true } },
  { text: "      Divyanshi Jain", options: { color: C.muted } },
], { x: 0.92, y: 6.5, w: 11, h: 0.4, fontFace: F.body, fontSize: 14 });

p.writeFile({ fileName: path.join(__dirname, "..", "docs", "OpsBrain_Deck.pptx") }).then((f) => console.log("wrote", f));
