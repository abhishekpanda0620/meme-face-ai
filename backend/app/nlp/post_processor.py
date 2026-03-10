"""
NLP Pipeline Stage 3: Post-Processor.

Cleans up generated captions, injects Desi slang variety,
and enforces a strict SFW content filter.
"""
import re
import random


# Desi slang injections — randomly added for variety
SLANG_SUFFIXES = [
    " 😤", " 💀", " 🔥", " 😂", " 🤣",
    " bhai!", " yaar!", " boss!", " pagle!",
]

# Strict SFW blocklist (lowercase). Any caption containing these is rejected.
BLOCKED_WORDS = {
    # Add any words that should be filtered out
    # Keeping this minimal since the generator is already prompted for SFW
}


def post_process_caption(caption: str, emotion: str) -> str:
    """
    Clean, flavour, and filter a generated caption.
    
    1. Strip whitespace and normalize
    2. Check SFW blocklist
    3. Add optional slang suffix for variety
    """
    # 1. Basic cleanup
    caption = caption.strip()
    caption = re.sub(r'\s+', ' ', caption)  # collapse multiple spaces

    # Remove any quotes the model might have wrapped around the caption
    caption = caption.strip('"').strip("'").strip()

    # 2. SFW filter
    lower_caption = caption.lower()
    for blocked in BLOCKED_WORDS:
        if blocked in lower_caption:
            # Replace with a safe generic caption
            return _safe_fallback(emotion)

    # 3. Add slang suffix with ~30% probability for variety
    if random.random() < 0.3 and not caption.endswith(("!", "?", "...")):
        caption += random.choice(SLANG_SUFFIXES)

    return caption


def _safe_fallback(emotion: str) -> str:
    """Return a guaranteed SFW caption if the filter catches something."""
    fallbacks = {
        "JOY": "Aaj ka din bahut achha hai! 🎉",
        "SAD": "Koi baat nahi yaar... sab theek hoga!",
        "ANGRY": "Gussa toh aa raha hai... par control! 😤",
        "SHOCKED": "Ye kya ho gaya?! 😱",
        "JUDGING": "Hmm... interesting! 🤔",
        "NEUTRAL": "Sab normal hai boss! ✌️",
    }
    return fallbacks.get(emotion, "Kya scene hai bhai?")
