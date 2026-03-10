
# 1. Project Overview

**MemeFace AI (Desi Edition)** is a vision-based app that reads your facial expressions in real-time and instantly generates highly relatable, contextual Hindi memes.

Core idea:
- Capture user's face via webcam/phone camera.
- Detect micro-expressions (confusion, anger, joy, disgust, "judging you" look).
- Map the detected emotion to a database of iconic desi/Hindi meme templates (e.g., Hera Pheri, Mirzapur, classic Bollywood).
- Overlay the user's face or generate a custom text caption based on the emotion.

Example:
- You make a confused, squinting face.
- App instantly generates: *"Ye baburao ka style hai!"* or *"Kehna kya chahte हो?"* (3 Idiots).

------------------------------------------------------------------------

# 2. Core Features (MVP)

## Emotion & Micro-Expression Detection
Detect core desi moods:
- "Gusse mein" (Angry/Annoyed)
- "Shocked/Tension" (Wide eyes open)
- "Judgemental/Side-eye" (Thoda tera dekhna)
- "Khushi/Overexcited" (Big smile)
- "Nakhre/Attitude" (Eyebrow raise)

Libraries:
- MediaPipe Face Mesh (for 468 3D face landmarks)
- OpenCV

## The "Desi Meme Vault"
A curated JSON database mapping specific landmark geometries to meme templates.
- Categories: Bollywood, Standup Comedy, Indian TV Shows.

## Instant Meme Generation
- Overlay the iconic text on the live camera feed.
- Option to snap a photo and generate a shareable image card.

## Custom Caption Generation (LLM Integration)
- Send the emotion tag to a lightweight LLM to generate fresh, contextual Hindi slang.

------------------------------------------------------------------------

# 3. System Architecture

User Camera Feed |
                 v
      Face Mesh Detection (MediaPipe) |
                 v
   Emotion Classification Engine (Local) |
                 v
      Meme Template Matching (Database) |
                 v
      Caption/Text Overlay Generator |
                 v
      Shareable Output (Image/Live AR)

------------------------------------------------------------------------

# 4. Technology Stack

**Frontend**
- React / Next.js (Web MVP)
- TailwindCSS (for quick styling)

**AI / Vision (The Engine)**
- Python (FastAPI for backend logic if needed, or pure client-side JS)
- MediaPipe Face Mesh (JavaScript/WebAssembly for zero-latency in browser)
- OpenCV (if doing backend processing)

**Meme Database**
- Simple JSON initially -> PostgreSQL/Supabase later.

------------------------------------------------------------------------

# 5. Development Phases

## Phase 1 -- The "Face Scanner" (1 week)
Goals: 
- Get webcam feed working in browser.
- Run MediaPipe Face Mesh and draw the 468 points on the face.
- Extract key distances (e.g., distance between eyebrows for anger, mouth opening for shock).

## Phase 2 -- Emotion to Meme Mapping (2 weeks)
Goals:
- Build a logic engine that says: `If (eyebrow_distance < X && mouth_frown > Y) -> trigger 'Angry Dad' meme`.
- Curate the top 20 foundational Hindi meme templates and store them locally. **CRITICAL: Ensure all templates are strictly SFW (Safe for Work), avoiding any profanity, offensive language, or NSFW content.**
- Combine the logic to print the associated meme text directly onto the video feed.

## Phase 3 -- Polish & Shareability (1-2 weeks)
Goals:
- Build a slick UI. 
- Add a "Snap & Share" CTA button. 
- Ensure the output image looks exactly like a standard Instagram/Twitter meme post.

------------------------------------------------------------------------

# 6. Future Expansion Ideas

## Dynamic Face Swapping
Put the user's recognized expression directly onto the face of Babu Rao or Pankaj Tripathi using lightweight face-swap AI.

## "Roast Mode"
An LLM persona that actively roasts your current facial expression in Hindi audio. **(Strict system prompts required to keep all roasts family-friendly and SFW).**

## Slack/Discord Integration
A bot that automatically creates a reaction GIF of your face when someone drops bad news in the chat.

------------------------------------------------------------------------

# 7. Why this is highly unique (No Rat Race)
- **High Virality:** People love sharing memes of themselves. 
- **Cultural Relevancy:** Generic emotion detectors exist, but highly specific cultural/linguistic mapping (Hindi slang) is incredibly sticky.
- **Easy to Test:** Zero setup required. Test entirely using your laptop webcam.
