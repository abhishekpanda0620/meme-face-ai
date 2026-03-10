"""
MemeFace AI — FastAPI Backend Entry Point.

Serves the Vision + NLP pipeline for real-time emotion detection
and dynamic Hindi/Hinglish meme caption generation.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers.caption import router as caption_router
from app.models.schemas import HealthResponse
from app.nlp.caption_generator import load_model, is_model_loaded

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preload AI models on startup, cleanup on shutdown."""
    logger.info("🚀 MemeFace AI Backend starting up...")
    logger.info("Loading NLP caption model (this may take a moment)...")
    load_model()
    logger.info("✅ Backend ready! DeepFace loads lazily on first request.")
    yield
    logger.info("👋 MemeFace AI Backend shutting down.")


app = FastAPI(
    title="MemeFace AI Backend",
    description="Vision + NLP pipeline for Desi meme generation",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS: Allow the Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(caption_router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        models_loaded=is_model_loaded(),
    )
