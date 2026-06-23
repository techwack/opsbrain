# OpsBrain — Industrial Knowledge Intelligence

> ET AI Hackathon 2.0 · Problem Statement 8 · Industrial Knowledge Intelligence

**OpsBrain is an Operations Brain for the plant floor.** Heavy industry (steel, oil &
gas, pharma, power) loses ~35% of engineer time hunting through scattered manuals,
P&IDs, work orders and safety standards. OpsBrain ingests that unstructured corpus and
turns it into an instant, *cited*, mobile-friendly copilot for field technicians and
reliability engineers.

It does three things no plain document-search tool does:

1. **Grounded Q&A with citations & confidence** — every answer points back to the exact
   document and page, and reports a retrieval-confidence score so engineers know when to
   trust it.
2. **Compliance Gap Agent** — audits operational records against OISD / Factory Act
   standards and flags concrete, severity-ranked deviations with recommended actions.
3. **Knowledge Graph** — auto-extracts equipment tags, failure modes, systems and
   standards from the corpus and renders the asset relationship map.

## Architecture

```
              ┌─────────────────────────── Browser UI (single page) ───────────────────────────┐
              │   Ask (RAG chat)      Compliance Audit      Knowledge Graph      Documents        │
              └───────────────────────────────────┬────────────────────────────────────────────┘
                                                   │  REST (JSON)
                              ┌────────────────────▼─────────────────────┐
                              │              FastAPI service              │
                              │  /ask  /compliance  /graph  /upload …     │
                              └───────┬───────────────┬───────────────┬───┘
                                      │               │               │
                       ┌──────────────▼───┐  ┌────────▼────────┐  ┌───▼──────────────┐
                       │  RAG retrieval    │  │  Agents          │  │  Ingestion        │
                       │  ChromaDB +       │  │  QA / Compliance  │  │  pypdf → chunk →  │
                       │  ONNX MiniLM emb. │  │  / KG (Claude)    │  │  embed → index    │
                       └───────────────────┘  └─────────┬────────┘  └──────────────────┘
                                                         │
                                                   Anthropic Claude API
```

- **Retrieval works with no API key** (ChromaDB ships a self-contained embedding model).
- **Answer generation** uses the Claude API when `ANTHROPIC_API_KEY` is set; otherwise the
  app degrades gracefully and still returns the retrieved evidence.

## Tech stack

| Layer        | Choice                                             |
|--------------|----------------------------------------------------|
| Backend      | Python · FastAPI · Uvicorn                          |
| Retrieval    | ChromaDB (persistent) · ONNX MiniLM embeddings      |
| Reasoning    | Anthropic Claude (`claude-opus-4-8`)                |
| Graph        | NetworkX (centrality) + vis-network (render)        |
| Ingestion    | pypdf, overlapping sentence-aware chunking          |
| Frontend     | Vanilla single-page app (no build step)             |

Single-service by design: FastAPI serves both the API and the UI, so the whole demo runs
with one command — no CORS, no second server.

## Quick start

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # macOS/Linux
pip install -r requirements.txt

# optional: enable Claude-generated answers
copy ..\.env.example .env       # then add your ANTHROPIC_API_KEY

uvicorn app.main:app --reload
```

Open http://localhost:8000 — the bundled sample plant corpus (Unit-2 crude transfer loop:
pump P-204 OEM manual, work-order history, OISD-STD-105 excerpt, a near-miss report and a
P&ID description) is indexed automatically on first boot.

## Try these

- *"What failed on pump P-204 last year?"*
- *"How do I replace the mechanical seal on P-204 safely?"*
- Compliance audit on **"P-204 mechanical seal"** → flags the missing RCFA after repeat
  seal failures (OISD-STD-105 Clause 5.1) and the passing isolation valve (Clause 6.3).
- Build the knowledge graph to see P-204 ↔ failure modes ↔ standards.

## Roadmap

- OCR for scanned P&IDs (computer vision tag extraction)
- Live SCADA/CMMS connectors (SAP PM, Maximo)
- Predictive maintenance scoring from work-order + sensor trends
