"""RAG question-answering agent with grounded citations and a confidence score."""
from __future__ import annotations

from app.agents import llm
from app.rag import store

SYSTEM = """You are OpsBrain, an industrial operations & maintenance copilot for \
plant engineers and field technicians. You answer ONLY from the provided context \
excerpts drawn from plant manuals, P&IDs, work orders, OISD/Factory Act standards \
and incident reports.

Rules:
- Ground every claim in the context. Cite sources inline as [S1], [S2] matching the \
numbered excerpts.
- If the context does not contain the answer, say so plainly and suggest what \
document the technician should consult. Never invent equipment tags, part numbers \
or readings.
- Be concise and operational. Prefer steps, checklists and exact values.
- When a safety or compliance risk is implied, surface it explicitly with a ⚠ marker.
"""


def _format_context(hits: list[dict]) -> str:
    blocks = []
    for i, h in enumerate(hits, start=1):
        m = h["metadata"]
        blocks.append(
            f"[S{i}] (source: {m.get('source')}, page {m.get('page')}, "
            f"relevance {h['score']})\n{h['text']}"
        )
    return "\n\n".join(blocks)


def answer(question: str, top_k: int = 6) -> dict:
    hits = store.query(question, top_k=top_k)
    sources = [
        {
            "id": f"S{i}",
            "source": h["metadata"].get("source"),
            "page": h["metadata"].get("page"),
            "score": h["score"],
            "snippet": h["text"][:280] + ("…" if len(h["text"]) > 280 else ""),
        }
        for i, h in enumerate(hits, start=1)
    ]
    # confidence: blend of best-match and average retrieval scores
    confidence = 0.0
    if hits:
        best = hits[0]["score"]
        avg = sum(h["score"] for h in hits) / len(hits)
        confidence = round(0.6 * best + 0.4 * avg, 2)

    if not hits:
        return {
            "answer": "No indexed documents matched this question. Upload the relevant "
            "manual or work order, or rephrase using the equipment tag.",
            "sources": [],
            "confidence": 0.0,
        }

    try:
        text = llm.complete(
            SYSTEM,
            f"Context excerpts:\n\n{_format_context(hits)}\n\n"
            f"Technician question: {question}\n\n"
            "Answer with inline [S#] citations.",
        )
    except llm.LLMUnavailable as e:
        text = (
            f"*(LLM answer disabled: {e})*\n\nMost relevant excerpts were still "
            "retrieved — see sources below."
        )
        confidence = round(confidence * 0.7, 2)

    return {"answer": text, "sources": sources, "confidence": confidence}
