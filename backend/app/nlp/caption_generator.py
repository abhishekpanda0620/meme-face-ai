"""
NLP Pipeline Stage 2: Hindi/Hinglish Caption Generator.

Uses HuggingFace transformers (ai4bharat/IndicBART or a text-generation
model) to produce fresh, culturally contextual captions every time.
Falls back to a curated template pool if the model is unavailable.
"""
import random
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Global model reference (loaded once at startup)
_generator = None
_model_loaded = False


def load_model():
    """
    Preload the HuggingFace text generation model at server startup.
    Uses a lightweight model suitable for Hinglish text generation.
    """
    global _generator, _model_loaded
    try:
        from transformers import pipeline
        logger.info("Loading HuggingFace caption generation model...")
        _generator = pipeline(
            "text2text-generation",
            model="ai4bharat/IndicBART",
            tokenizer="ai4bharat/IndicBART",
            max_length=60,
        )
        _model_loaded = True
        logger.info("Caption generation model loaded successfully.")
    except Exception as e:
        logger.warning(f"Failed to load HuggingFace model: {e}. Using fallback templates.")
        _model_loaded = False


def is_model_loaded() -> bool:
    return _model_loaded


# Curated fallback captions per intent (used when the model is unavailable or
# as supplementary variety). All captions are strictly SFW.
FALLBACK_CAPTIONS = {
    "celebration": [
        "Aaj toh party banti hai, bhai!",
        "Jeetne waalon ko kehte hain... legend!",
        "Arre yaar, khushi ke maare naach raha hoon!",
        "Mithai lao, celebration shuru karo!",
    ],
    "paisa_flex": [
        "Paisa hi paisa hoga! Hera Pheri style!",
        "Salary aa gayi, aaj toh raja feeling!",
        "Paise toh aate jaate hain... lekin aaj aaye hain!",
        "ATM se paise nikale, toh mann khush ho gaya!",
    ],
    "reunion": [
        "Bahut time baad mile yaar, aankhein bhar aayi!",
        "Purane dost mil gaye, life set hai!",
        "Yaar tere bina ye zindagi adhoori thi!",
    ],
    "foodie_joy": [
        "Biryani khane ka mood hai, baaki sab bakwaas!",
        "Garam chai aur baarish... kya combo hai!",
        "Paneer tikka aaya? Sab chodo, pehle khana!",
    ],
    "heartbreak": [
        "Bohot takleef hoti hai bhai... bohot takleef!",
        "Dil toota hai yaar, Arijit laga do!",
        "Kya se kya ho gaya... dekhte dekhte!",
        "Ek tarfa pyaar ki taakat hi kuch aur hoti hai!",
    ],
    "monday_blues": [
        "Monday aa gaya... survival mode ON!",
        "Boss ne phir se extra kaam de diya!",
        "Weekend kahan chala gaya yaar?",
    ],
    "exam_fail": [
        "Mummy ko kaise batayein... ye toh sochna padega!",
        "Padhai kar leta toh aaj ye din nahi dekhna padta!",
        "Result aa gaya... aur mann nahi lag raha!",
    ],
    "emotional_scene": [
        "Arre yaar, rula mat... already emotional hoon!",
        "Kuch toh log kahenge... logon ka kaam hai kehna!",
    ],
    "traffic_rage": [
        "Horn mat bajao bhai, dimag kharab hai already!",
        "Signal pe 5 minute? Ye toh zulm hai!",
        "Auto waale bhaiya... meter se chalo na!",
    ],
    "wifi_down": [
        "Internet nahi aa raha... ye kaisa torture hai!",
        "Jio ka signal gayab... ab kya karein!",
        "Buffering... buffering... zindagi bhi buffer ho gayi!",
    ],
    "political_rant": [
        "Neta ji ne phir se waada toda... kya naya hai?",
        "Tax dete dete thak gaye bhai!",
    ],
    "sibling_fight": [
        "Remote mere paas aayega... nahi toh mummy ko bol dunga!",
        "Bhai ne mera khaana kha liya... ab war hoga!",
    ],
    "plot_twist": [
        "Arre yaar... ye toh twist hai! Sax, sux, dhoka!",
        "Ye toh unhone socha hi nahi tha!",
        "Spoiler alert... par phir bhi shocked!",
    ],
    "bill_shock": [
        "Bill dekh ke toh dil baith gaya!",
        "Itna bill? Kidney bechni padegi!",
        "Restaurant ka bill dekha... ghar pe khana banana chahiye tha!",
    ],
    "gossip_bomb": [
        "Kya?! Ye toh breaking news hai!",
        "Suna hai? Woh dono... you know... hehe!",
    ],
    "exam_result": [
        "Result aa gaya... ab toh bas prayer!",
        "Topper ban gaya! Mummy ko batao jaldi!",
    ],
    "side_eye": [
        "Ye kya dekh liya... aankhein dhona padega!",
        "Judgement day aa gaya... main judge hoon!",
        "Thoda toh sharam karo yaar!",
    ],
    "disapproval": [
        "Ye kya bana diya bhai... bilkul bekar!",
        "Nahi pasand... sorry not sorry!",
    ],
    "sus_look": [
        "Kuch toh gadbad hai... kuch toh!",
        "Ye banda jhooth bol raha hai pakka!",
        "Hmm... interesting... bahut interesting!",
    ],
    "unbothered": [
        "Roz utho, naha dho ke... same old same old!",
        "Main toh chill hoon bhai... tension nahi leni ka!",
        "Na koi khushi na koi gham... bus hain!",
    ],
    "monday_mood": [
        "Aaj bhi wahi din... wahi zindagi!",
        "Routine chal rahi hai... kuch naya nahi!",
    ],
    "waiting": [
        "Kitna wait karaoge yaar!",
        "Loading... loading... poori zindagi loading mein nikal gayi!",
        "Zomato waale bhaiya kab aayenge?",
    ],
}


def generate_caption(intent: str, context: str, emotion: str) -> str:
    """
    Generate a Hindi/Hinglish meme caption based on the intent and context.
    
    Uses the HuggingFace model if loaded, otherwise falls back to curated templates.
    """
    # Try the HuggingFace model first
    if _model_loaded and _generator is not None:
        try:
            prompt = (
                f"Generate a funny, one-line Hindi meme caption about {context}. "
                f"The mood is {emotion.lower()}. Use Hinglish slang. Keep it SFW and "
                f"family-friendly. Only output the caption, nothing else."
            )
            result = _generator(prompt)
            if result and len(result) > 0:
                caption = result[0].get("generated_text", "").strip()
                if caption and len(caption) > 5:
                    return caption
        except Exception as e:
            logger.warning(f"Model generation failed, using fallback: {e}")

    # Fallback to curated templates
    captions = FALLBACK_CAPTIONS.get(intent, FALLBACK_CAPTIONS.get("unbothered", []))
    if captions:
        return random.choice(captions)

    return "Kuch toh hua hai... par kya?"
