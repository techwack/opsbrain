"""Central configuration for OpsBrain.

Everything is environment-driven so the same code runs locally and in the cloud.
Retrieval works with no API key; answer generation activates when a key is set.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("OPSBRAIN_DATA_DIR", BASE_DIR / "data")).resolve()
DOCS_DIR = DATA_DIR / "docs"
CHROMA_DIR = DATA_DIR / "chroma"
STATIC_DIR = (BASE_DIR / "app" / "static").resolve()

DOCS_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
MODEL = os.getenv("OPSBRAIN_MODEL", "claude-opus-4-8")

# Retrieval / chunking knobs
CHUNK_SIZE = 1100          # characters per chunk
CHUNK_OVERLAP = 180        # character overlap between chunks
TOP_K = 6                  # chunks retrieved per query
COLLECTION_NAME = "opsbrain_docs"

LLM_ENABLED = bool(ANTHROPIC_API_KEY)
