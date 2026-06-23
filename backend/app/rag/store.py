"""Vector store wrapper around ChromaDB.

ChromaDB ships with a self-contained ONNX MiniLM embedding model, so semantic
search works out of the box with no external embedding API or API key.
"""
from __future__ import annotations

import chromadb
from chromadb.config import Settings

from app.config import CHROMA_DIR, COLLECTION_NAME, TOP_K

_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR),
    settings=Settings(anonymized_telemetry=False, allow_reset=True),
)


def _collection():
    return _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(ids: list[str], documents: list[str], metadatas: list[dict]) -> None:
    if not ids:
        return
    _collection().upsert(ids=ids, documents=documents, metadatas=metadatas)


def query(text: str, top_k: int = TOP_K, where: dict | None = None) -> list[dict]:
    col = _collection()
    if col.count() == 0:
        return []
    res = col.query(
        query_texts=[text],
        n_results=min(top_k, col.count()),
        where=where or None,
        include=["documents", "metadatas", "distances"],
    )
    out = []
    for doc, meta, dist in zip(
        res["documents"][0], res["metadatas"][0], res["distances"][0]
    ):
        out.append(
            {
                "text": doc,
                "metadata": meta,
                # cosine distance -> similarity score in [0, 1]
                "score": round(max(0.0, 1.0 - dist), 3),
            }
        )
    return out


def stats() -> dict:
    col = _collection()
    docs = set()
    if col.count():
        meta = col.get(include=["metadatas"])["metadatas"]
        docs = {m.get("source", "?") for m in meta}
    return {"chunks": col.count(), "documents": sorted(docs)}


def reset() -> None:
    _client.delete_collection(COLLECTION_NAME)
