"""
API Router: /api/analyze

Orchestrates the full Vision + NLP pipeline:
1. Decode image → DeepFace emotion detection
2. Map emotion → intent
3. Generate Hindi/Hinglish caption
4. Post-process and return
"""
import json
import logging
import random
from pathlib import Path
from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.vision.emotion_detector import detect_emotion
from app.nlp.intent_mapper import map_emotion_to_intent
from app.nlp.caption_generator import generate_caption
from app.nlp.post_processor import post_process_caption

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])

# Load the meme vault from the JSON data file
VAULT_PATH = Path(__file__).parent.parent / "data" / "meme_vault.json"
with open(VAULT_PATH, "r") as f:
    MEME_VAULT: list[dict] = json.load(f)


def select_meme(emotion: str, intent: str) -> dict:
    """
    Select the best meme template by matching emotion first,
    then preferring templates whose intents overlap with the current intent.
    """
    # Filter by emotion
    candidates = [m for m in MEME_VAULT if m["emotion"] == emotion]
    if not candidates:
        candidates = [m for m in MEME_VAULT if m["emotion"] == "NEUTRAL"]

    # Prefer templates that match the intent
    intent_matches = [m for m in candidates if intent in m.get("intents", [])]
    if intent_matches:
        return random.choice(intent_matches)

    return random.choice(candidates)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_face(request: AnalyzeRequest):
    """
    Full pipeline: Image → Emotion → Intent → Caption.
    
    Accepts a base64-encoded webcam snapshot and returns the detected
    emotion, a contextual Hindi/Hinglish caption, and the matched meme template.
    """
    try:
        # Pipeline Stage 1: Vision — Detect emotion from face
        vision_result = detect_emotion(request.image)
        emotion = vision_result["emotion"]
        confidence = vision_result["confidence"]

        # Pipeline Stage 2: NLP — Map to rich intent
        intent_result = map_emotion_to_intent(emotion)
        intent = intent_result["intent"]
        context = intent_result["context"]

        # Pipeline Stage 3: NLP — Generate caption
        raw_caption = generate_caption(intent, context, emotion)

        # Pipeline Stage 4: NLP — Post-process
        caption = post_process_caption(raw_caption, emotion)

        # Select matching meme template from the vault
        meme = select_meme(emotion, intent)

        return AnalyzeResponse(
            emotion=emotion,
            confidence=confidence,
            intent=intent,
            caption=caption,
            meme_id=meme["id"],
        )

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
