"""Lightweight persistent vector store using TF-IDF + cosine similarity.

Pure-Python (scikit-learn wheels only) so it installs on any machine with no C++
build toolchain. The corpus is small, so the TF-IDF matrix is rebuilt in memory on
change — fast and deterministic. The interface mirrors a vector DB so the retrieval
backend can be swapped (e.g. for embeddings) without touching the agents.
"""
from __future__ import annotations

import json
import threading

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import STORE_PATH, TOP_K

_lock = threading.Lock()
_chunks: list[dict] = []
_vectorizer: TfidfVectorizer | None = None
_matrix = None
_dirty = True


def _load() -> None:
    global _chunks
    if STORE_PATH.exists():
        try:
            _chunks = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            _chunks = []
    else:
        _chunks = []


_load()


def _persist() -> None:
    STORE_PATH.write_text(json.dumps(_chunks), encoding="utf-8")


def _rebuild() -> None:
    global _vectorizer, _matrix, _dirty
    if not _chunks:
        _vectorizer, _matrix = None, None
    else:
        _vectorizer = TfidfVectorizer(
            stop_words="english", ngram_range=(1, 2), min_df=1, sublinear_tf=True
        )
        _matrix = _vectorizer.fit_transform([c["text"] for c in _chunks])
    _dirty = False


def add_chunks(ids: list[str], documents: list[str], metadatas: list[dict]) -> None:
    global _dirty
    if not ids:
        return
    with _lock:
        existing = {c["id"] for c in _chunks}
        for cid, doc, meta in zip(ids, documents, metadatas):
            if cid not in existing:
                _chunks.append({"id": cid, "text": doc, "metadata": meta})
        _persist()
        _dirty = True


def query(text: str, top_k: int = TOP_K, where: dict | None = None) -> list[dict]:
    with _lock:
        if _dirty:
            _rebuild()
        if not _chunks or _vectorizer is None:
            return []
        sims = cosine_similarity(_vectorizer.transform([text]), _matrix)[0]
        order = np.argsort(sims)[::-1][:top_k]
        out = []
        for i in order:
            score = float(sims[i])
            if score <= 0:
                continue
            c = _chunks[int(i)]
            out.append({"text": c["text"], "metadata": c["metadata"], "score": round(score, 3)})
        return out


def stats() -> dict:
    docs = {c["metadata"].get("source", "?") for c in _chunks}
    return {"chunks": len(_chunks), "documents": sorted(docs)}


def reset() -> None:
    global _chunks, _dirty
    with _lock:
        _chunks = []
        _persist()
        _dirty = True
