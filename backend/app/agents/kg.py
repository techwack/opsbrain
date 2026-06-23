"""Knowledge-graph extraction.

Builds a graph of equipment, systems, failures and standards from the indexed
corpus. Uses Claude when available; otherwise falls back to a lightweight regex
tag-extractor so the graph view is never empty in a demo.
"""
from __future__ import annotations

import json
import re

import networkx as nx

from app.agents import llm
from app.rag import store

SYSTEM = """Extract a knowledge graph of industrial assets from the text. Return \
STRICT JSON only:
{
  "nodes": [{"id": "P-204", "type": "equipment|system|failure|standard|location"}],
  "edges": [{"source": "P-204", "target": "Seal failure", "relation": "has_failure_mode"}]
}
Use real tags/terms from the text (pump/valve/compressor tags, failure modes, \
standards like OISD-105, systems, locations). Keep it under 40 nodes."""

# matches tags like P-204, V-12, HX-3A, PT-101
_TAG = re.compile(r"\b([A-Z]{1,3}-\d{1,4}[A-Z]?)\b")
_STD = re.compile(r"\b(OISD[- ]?(?:STD[- ]?)?\d{2,3}|Factory Act|IS \d{3,5})\b", re.I)


def _fallback(samples: list[str]) -> dict:
    nodes, edges, seen = [], [], set()

    def add(nid, ntype):
        if nid and nid not in seen:
            seen.add(nid)
            nodes.append({"id": nid, "type": ntype})

    for text in samples:
        tags = _TAG.findall(text)
        stds = [s if isinstance(s, str) else s[0] for s in _STD.findall(text)]
        for t in tags:
            add(t, "equipment")
        for s in stds:
            add(s, "standard")
        # link co-occurring tags and standards within the same chunk
        for t in tags[:3]:
            for s in stds[:2]:
                edges.append({"source": t, "target": s, "relation": "governed_by"})
    return {"nodes": nodes[:40], "edges": edges[:60]}


def build(limit: int = 30) -> dict:
    hits = store.query("equipment pump valve compressor failure standard system", top_k=limit)
    samples = [h["text"] for h in hits]
    if not samples:
        return {"nodes": [], "edges": [], "engine": "empty"}

    try:
        raw = llm.complete(
            SYSTEM, "Text:\n\n" + "\n---\n".join(samples), temperature=0.0, max_tokens=1500
        )
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        data["engine"] = "llm"
    except (llm.LLMUnavailable, json.JSONDecodeError):
        data = _fallback(samples)
        data["engine"] = "regex-fallback"

    # de-dupe + compute degree centrality for sizing nodes in the UI
    g = nx.DiGraph()
    for n in data.get("nodes", []):
        g.add_node(n["id"], type=n.get("type", "equipment"))
    for e in data.get("edges", []):
        if e.get("source") and e.get("target"):
            g.add_edge(e["source"], e["target"], relation=e.get("relation", "related"))
    centrality = nx.degree_centrality(g) if g.number_of_nodes() else {}

    data["nodes"] = [
        {**n, "weight": round(centrality.get(n["id"], 0.0), 3)}
        for n in data.get("nodes", [])
    ]
    return data
