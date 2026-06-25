"""Document ingestion: read PDFs / text, split into overlapping chunks, index."""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

from pypdf import PdfReader

from app.config import CHUNK_OVERLAP, CHUNK_SIZE, DOCS_DIR
from app.rag import store


def _read_pdf(path: Path) -> list[tuple[int, str]]:
    reader = PdfReader(str(path))
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append((i, text))
    return pages


def _read_text(path: Path) -> list[tuple[int, str]]:
    return [(1, path.read_text(encoding="utf-8", errors="ignore"))]


def _clean(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _chunk(text: str) -> list[str]:
    text = _clean(text)
    if not text:
        return []
    chunks, start = [], 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        # try to break on a sentence/paragraph boundary for cleaner chunks
        if end < len(text):
            for sep in ("\n\n", ". ", "\n"):
                cut = chunk.rfind(sep)
                if cut > CHUNK_SIZE * 0.5:
                    chunk = chunk[: cut + len(sep)]
                    break
        chunks.append(chunk.strip())
        if start + len(chunk) >= len(text):
            break  # consumed the remainder — stop (avoids tiny tail chunks)
        start += max(1, len(chunk) - CHUNK_OVERLAP)
    return [c for c in chunks if c]


def ingest_file(path: Path) -> dict:
    """Index a single document. Returns a small summary dict."""
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        pages = _read_pdf(path)
    elif suffix in {".txt", ".md"}:
        pages = _read_text(path)
    else:
        return {"source": path.name, "chunks": 0, "skipped": True}

    ids, docs, metas = [], [], []
    for page_no, page_text in pages:
        for j, chunk in enumerate(_chunk(page_text)):
            uid = hashlib.sha1(
                f"{path.name}:{page_no}:{j}:{chunk[:40]}".encode()
            ).hexdigest()
            ids.append(uid)
            docs.append(chunk)
            metas.append({"source": path.name, "page": page_no, "chunk": j})

    store.add_chunks(ids, docs, metas)
    return {"source": path.name, "chunks": len(ids), "pages": len(pages)}


def ingest_dir(directory: Path = DOCS_DIR) -> list[dict]:
    results = []
    for path in sorted(directory.glob("*")):
        if path.suffix.lower() in {".pdf", ".txt", ".md"}:
            results.append(ingest_file(path))
    return results
