"""Thin wrapper around the Anthropic Claude API with graceful degradation.

If no API key is configured, callers get a clear, structured fallback instead of
a crash — so retrieval-only demos still work.
"""
from __future__ import annotations

from app.config import ANTHROPIC_API_KEY, LLM_ENABLED, MODEL

_client = None
if LLM_ENABLED:
    from anthropic import Anthropic

    _client = Anthropic(api_key=ANTHROPIC_API_KEY)


class LLMUnavailable(RuntimeError):
    pass


def complete(system: str, prompt: str, max_tokens: int = 1200, temperature: float = 0.2) -> str:
    if not LLM_ENABLED or _client is None:
        raise LLMUnavailable(
            "ANTHROPIC_API_KEY is not set — add it to backend/.env to enable answers."
        )
    msg = _client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in msg.content if block.type == "text").strip()
