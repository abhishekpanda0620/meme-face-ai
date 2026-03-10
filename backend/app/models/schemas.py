"""
Pydantic request/response models for the MemeFace AI API.
"""
from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    """Request body for the /api/analyze endpoint."""
    image: str = Field(
        ...,
        description="Base64-encoded JPEG/PNG image from the webcam canvas snapshot"
    )


class AnalyzeResponse(BaseModel):
    """Response body from the /api/analyze endpoint."""
    emotion: str = Field(..., description="Detected emotion (JOY, SAD, ANGRY, etc.)")
    confidence: float = Field(..., description="Confidence score from the classifier (0-1)")
    intent: str = Field(..., description="Richer intent label for NLP context")
    caption: str = Field(..., description="AI-generated Hindi/Hinglish meme caption")
    meme_id: str = Field(..., description="ID of the matched meme template")


class HealthResponse(BaseModel):
    """Response body for the /health endpoint."""
    status: str = "ok"
    models_loaded: bool = False
