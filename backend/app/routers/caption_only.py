"""
API Router: /api/caption

Lightweight endpoint that accepts a pre-detected emotion string
(from client-side MediaPipe) and runs just the NLP pipeline:
  emotion → intent → caption → post-process

This avoids the ~500ms+ overhead of uploading/decoding base64 images
and running DeepFace on the server.
"""
import json
import logging
import random
from pathlib import Path
from fastapi import APIRouter, HTTPException

from app.models.schemas import CaptionRequest, CaptionResponse
from app.nlp.intent_mapper import map_emotion_to_intent
from app.nlp.caption_generator import generate_caption
from app.nlp.post_processor import post_process_caption

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["caption"])

# Valid emotions accepted by this endpoint
VALID_EMOTIONS = {"JOY", "SAD", "ANGRY", "SHOCKED", "JUDGING", "NEUTRAL"}

# Load the meme vault for template matching
VAULT_PATH = Path(__file__).parent.parent / "data" / "meme_vault.json"
with open(VAULT_PATH, "r") as f:
    MEME_VAULT: list[dict] = json.load(f)


def _select_meme(emotion: str, intent: str) -> dict:
    """Select a meme template by emotion, preferring intent matches."""
    candidates = [m for m in MEME_VAULT if m["emotion"] == emotion]
    if not candidates:
        candidates = [m for m in MEME_VAULT if m["emotion"] == "NEUTRAL"]

    intent_matches = [m for m in candidates if intent in m.get("intents", [])]
    if intent_matches:
        return random.choice(intent_matches)

    return random.choice(candidates)


@router.post("/caption", response_model=CaptionResponse)
async def get_caption(request: CaptionRequest):
    """
    Lightweight caption generation: Emotion → Intent → Caption.

    Accepts a client-side detected emotion and returns a contextual
    Hindi/Hinglish caption with the matched meme template ID.
    """
    emotion = request.emotion.upper()

    if emotion not in VALID_EMOTIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid emotion '{emotion}'. Must be one of: {', '.join(sorted(VALID_EMOTIONS))}",
        )

    try:
        # NLP Stage 1: Map to rich intent
        intent_result = map_emotion_to_intent(emotion)
        intent = intent_result["intent"]
        context = intent_result["context"]

        # NLP Stage 2: Generate caption
        raw_caption = generate_caption(intent, context, emotion)

        # NLP Stage 3: Post-process
        caption = post_process_caption(raw_caption, emotion)

        # Select matching meme template
        meme = _select_meme(emotion, intent)

        return CaptionResponse(
            emotion=emotion,
            intent=intent,
            caption=caption,
            meme_id=meme["id"],
        )

    except Exception as e:
        logger.error(f"Caption pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Caption generation failed: {str(e)}")
