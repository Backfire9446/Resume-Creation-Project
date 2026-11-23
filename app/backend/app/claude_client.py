"""Shared Claude API settings and helpers.

The pinned SDK (anthropic 0.52) predates `fallbacks` and `output_config`, so
they are sent through extra_headers/extra_body.
"""

import anthropic

MODEL = "claude-opus-5-5"

# On a policy decline, the API re-runs the request on a fallback model it picks.
_FALLBACK_BETA = "server-side-fallback-2026-07-01"


class ClaudeRefusal(RuntimeError):
    """Raised when the model (and its fallback) declined the request."""


def _extras(effort: str) -> dict:
    return {
        "extra_headers": {"anthropic-beta": _FALLBACK_BETA},
        "extra_body": {"fallbacks": "default", "output_config": {"effort": effort}},
    }


def create_message(client: anthropic.Anthropic, *, effort: str = "medium", **kwargs):
    """messages.create on MODEL with refusal fallbacks and an explicit effort level.

    Thinking is always on for this model and counts toward max_tokens, so callers
    should leave generous headroom.
    """
    return client.messages.create(model=MODEL, **_extras(effort), **kwargs)


def stream_message(client: anthropic.Anthropic, *, effort: str = "medium", **kwargs):
    """Same as create_message but streamed (for long outputs); returns the final message."""
    with client.messages.stream(model=MODEL, **_extras(effort), **kwargs) as stream:
        return stream.get_final_message()


def response_text(response) -> str:
    """Join the text blocks of a response.

    content[0] is usually a thinking block on current models, so never index it.
    """
    if response.stop_reason == "refusal":
        raise ClaudeRefusal("Claude declined this request.")
    return "".join(
        block.text for block in response.content if getattr(block, "type", None) == "text"
    )
