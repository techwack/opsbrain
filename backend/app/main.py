"""OpsBrain API + static UI (single service for zero-friction demos)."""
from __future__ import annotations

import shutil

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.config import DOCS_DIR, LLM_ENABLED, MODEL, STATIC_DIR
from app.agents import compliance, kg, qa
from app.rag import ingest, store

app = FastAPI(title="OpsBrain — Industrial Knowledge Intelligence", version="1.0.0")


class AskRequest(BaseModel):
    question: str


class TopicRequest(BaseModel):
    topic: str


@app.on_event("startup")
def _startup() -> None:
    # auto-index any sample docs on first boot
    if store.stats()["chunks"] == 0:
        ingest.ingest_dir()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "llm_enabled": LLM_ENABLED, "model": MODEL, **store.stats()}


@app.post("/api/ask")
def ask(req: AskRequest) -> dict:
    if not req.question.strip():
        raise HTTPException(400, "question is required")
    return qa.answer(req.question)


@app.post("/api/compliance")
def check_compliance(req: TopicRequest) -> dict:
    if not req.topic.strip():
        raise HTTPException(400, "topic is required")
    return compliance.check(req.topic)


@app.get("/api/graph")
def graph() -> dict:
    return kg.build()


@app.get("/api/stats")
def stats() -> dict:
    return store.stats()


@app.post("/api/upload")
async def upload(file: UploadFile) -> dict:
    if not file.filename.lower().endswith((".pdf", ".txt", ".md")):
        raise HTTPException(400, "only .pdf, .txt, .md supported")
    dest = DOCS_DIR / file.filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    result = ingest.ingest_file(dest)
    return {"indexed": result, **store.stats()}


@app.post("/api/reindex")
def reindex() -> dict:
    store.reset()
    results = ingest.ingest_dir()
    return {"reindexed": results, **store.stats()}


# ---- static UI ----
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(str(STATIC_DIR / "index.html"))
