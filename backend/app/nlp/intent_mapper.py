"""
NLP Pipeline Stage 1: Emotion-to-Intent Mapper.

Maps a raw EmotionState (JOY, SAD, etc.) to richer, culturally-specific
intent labels. These intents drive the caption generator to produce
contextually appropriate Hindi/Hinglish captions.
"""
import random


# Each emotion maps to a list of possible intents with Bollywood/Desi context.
# The caption generator uses the intent to produce varied, contextual captions.
EMOTION_INTENT_MAP = {
    "JOY": [
        {"intent": "celebration", "context": "party, success, winning, paisa"},
        {"intent": "paisa_flex", "context": "money, salary day, promotion"},
        {"intent": "reunion", "context": "meeting friends, family, nostalgia"},
        {"intent": "foodie_joy", "context": "biryani, chai, street food, khana"},
    ],
    "SAD": [
        {"intent": "heartbreak", "context": "breakup, rejection, loneliness"},
        {"intent": "monday_blues", "context": "work, office, boss, deadline"},
        {"intent": "exam_fail", "context": "results, marks, parents, padhai"},
        {"intent": "emotional_scene", "context": "movie, farewell, goodbye"},
    ],
    "ANGRY": [
        {"intent": "traffic_rage", "context": "auto, rickshaw, horn, signal"},
        {"intent": "wifi_down", "context": "internet, jio, airtel, buffering"},
        {"intent": "political_rant", "context": "neta, election, promise, tax"},
        {"intent": "sibling_fight", "context": "bhai, behn, remote, food"},
    ],
    "SHOCKED": [
        {"intent": "plot_twist", "context": "unexpected, twist, reveal, news"},
        {"intent": "bill_shock", "context": "restaurant, electricity, recharge"},
        {"intent": "gossip_bomb", "context": "scandal, secret, shaadi, affair"},
        {"intent": "exam_result", "context": "topper, marks, pass, fail"},
    ],
    "JUDGING": [
        {"intent": "side_eye", "context": "cringe, overacting, attitude, drama"},
        {"intent": "disapproval", "context": "bad taste, fashion fail, food choice"},
        {"intent": "sus_look", "context": "suspicious, lie, excuse, alibi"},
    ],
    "NEUTRAL": [
        {"intent": "unbothered", "context": "chill, relax, no stress, zen"},
        {"intent": "monday_mood", "context": "routine, boring, same old"},
        {"intent": "waiting", "context": "queue, loading, delivery, order"},
    ],
}


def map_emotion_to_intent(emotion: str) -> dict:
    """
    Map a raw EmotionState to a random, contextually rich intent.
    
    Returns:
        dict with keys: intent (str), context (str)
    """
    intents = EMOTION_INTENT_MAP.get(emotion, EMOTION_INTENT_MAP["NEUTRAL"])
    return random.choice(intents)
