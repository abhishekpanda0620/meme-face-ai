/**
 * API Service Layer for MemeFace AI.
 *
 * Communicates with the FastAPI backend to fetch AI-generated
 * Hindi/Hinglish captions based on detected emotions.
 */
import type { EmotionState } from "@/hooks/useFaceTracker";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CaptionApiResponse {
  emotion: string;
  intent: string;
  caption: string;
  meme_id: string;
}

/**
 * Fetch an AI-generated Hindi/Hinglish caption from the backend.
 * Uses the lightweight /api/caption endpoint (no image upload).
 */
export async function fetchCaption(
  emotion: EmotionState
): Promise<CaptionApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api/caption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emotion }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Caption API error: ${response.status}`);
      return null;
    }

    return (await response.json()) as CaptionApiResponse;
  } catch (error) {
    // Silently handle network errors — the app should work fine
    // without the backend (memes still display, just no captions)
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("Caption API timed out");
    } else {
      console.warn("Caption API unavailable:", error);
    }
    return null;
  }
}
