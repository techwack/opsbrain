"""Compliance gap agent.

Given an equipment tag or topic, it pulls the operational records and the relevant
standard (OISD / Factory Act) from the corpus and asks Claude to flag deviations.
"""
from __future__ import annotations

import json

from app.agents import llm
from app.rag import store

SYSTEM = """You are a process-safety compliance auditor. From the provided plant \
records and regulatory excerpts, identify concrete compliance GAPS. Output STRICT \
JSON only, no prose, in this schema:
{
  "gaps": [
    {
      "title": "...",
      "severity": "high|medium|low",
      "standard": "e.g. OISD-STD-105 clause / Factory Act",
      "finding": "what is wrong, grounded in the records",
      "evidence": "S# citation",
      "recommended_action": "..."
    }
  ],
  "summary": "one-line overall posture"
}
If no gaps are evident, return an empty gaps array with an explanatory summary."""


def _context(hits: list[dict]) -> str:
    return "\n\n".join(
        f"[S{i}] (source: {h['metadata'].get('source')}, page {h['metadata'].get('page')})\n{h['text']}"
        for i, h in enumerate(hits, start=1)
    )


def check(topic: str, top_k: int = 8) -> dict:
    hits = store.query(
        f"compliance safety standard procedure requirement for {topic}", top_k=top_k
    )
    if not hits:
        return {"gaps": [], "summary": "No records found for this topic.", "sources": []}

    sources = [
        {"id": f"S{i}", "source": h["metadata"].get("source"), "page": h["metadata"].get("page")}
        for i, h in enumerate(hits, start=1)
    ]
    try:
        raw = llm.complete(
            SYSTEM,
            f"Records & standards:\n\n{_context(hits)}\n\nAudit topic: {topic}",
            temperature=0.0,
        )
        # tolerate fenced code blocks
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
    except llm.LLMUnavailable as e:
        return {"gaps": [], "summary": f"LLM disabled: {e}", "sources": sources}
    except json.JSONDecodeError:
        return {"gaps": [], "summary": "Could not parse audit output.", "sources": sources}

    data["sources"] = sources
    return data
