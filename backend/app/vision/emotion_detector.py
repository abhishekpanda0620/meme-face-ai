"""
Vision Pipeline: Emotion Detection using DeepFace.

Replaces the broken hand-tuned MediaPipe thresholds with a pre-trained
CNN that classifies facial expressions into 7 emotions with high accuracy.
"""
import base64
import io
import numpy as np
from PIL import Image
from deepface import DeepFace


# Map DeepFace's 7-class labels to our EmotionState enum
DEEPFACE_TO_EMOTION = {
    "happy": "JOY",
    "sad": "SAD",
    "angry": "ANGRY",
    "surprise": "SHOCKED",
    "fear": "JUDGING",     # Fear maps to the "nervous judging" look
    "disgust": "ANGRY",    # Disgust is close to anger in Desi meme context
    "neutral": "NEUTRAL",
}


def decode_base64_image(base64_string: str) -> np.ndarray:
    """
    Decode a base64-encoded image string into a numpy array (RGB).
    Strips the data URI prefix if present (e.g., 'data:image/jpeg;base64,...').
    """
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def detect_emotion(base64_image: str) -> dict:
    """
    Run DeepFace emotion analysis on a base64-encoded image.
    
    Returns:
        dict with keys: emotion (str), confidence (float), raw_scores (dict)
    """
    img_array = decode_base64_image(base64_image)

    # DeepFace.analyze returns a list of face analysis results
    results = DeepFace.analyze(
        img_path=img_array,
        actions=["emotion"],
        enforce_detection=False,  # Don't crash if no face found
        silent=True,
    )

    if not results:
        return {
            "emotion": "NEUTRAL",
            "confidence": 0.0,
            "raw_scores": {},
        }

    # Take the first detected face
    face_result = results[0]
    dominant_emotion = face_result.get("dominant_emotion", "neutral")
    emotion_scores = face_result.get("emotion", {})

    # Convert DeepFace label to our EmotionState
    mapped_emotion = DEEPFACE_TO_EMOTION.get(dominant_emotion, "NEUTRAL")
    confidence = emotion_scores.get(dominant_emotion, 0.0) / 100.0

    return {
        "emotion": mapped_emotion,
        "confidence": round(confidence, 3),
        "raw_scores": {
            DEEPFACE_TO_EMOTION.get(k, k): round(v / 100.0, 3)
            for k, v in emotion_scores.items()
        },
    }
