# MemeFace AI (Desi Edition) 🎭

MemeFace AI is a real-time, vision-based web application that tracks your facial micro-expressions via a webcam and instantly generates contextual, highly relatable Hindi/Desi memes. 

Whether you're making a judging side-eye or a shocked expression, MemeFace AI will match it to iconic Bollywood or Indian Pop Culture moments!

## 🌟 Core Features

- **Live Expression Detection**: Uses MediaPipe Face Mesh to precisely track 468 facial landmarks right in your browser (zero-latency).
- **The Desi Meme Vault**: A curated database of iconic Hindi meme templates (e.g., Hera Pheri, Mirzapur, 3 Idiots, and classic Bollywood).
- **Instant Match & Overlay**: Automatically maps your mood (Angry, Shocked, Khushi, Nakhre) and drops the perfect meme text onto your live video feed.
- **Snap & Share**: Capture your generated meme instantly to share on Instagram, Twitter, or WhatsApp.
- **Strictly SFW**: All meme templates and AI captions are strictly Safe for Work and family-friendly.

## 🛠️ Technology Stack

- **Frontend**: React / Next.js
- **Styling**: Tailwind CSS
- **AI / Computer Vision**: MediaPipe Face Mesh (JS/WASM) for purely client-side, privacy-first processing.
- **Storage**: Local JSON (migrating to Supabase/PostgreSQL).

## 🚀 Getting Started

*(Instructions on how to install and run the project will be added here once the initial scaffolding is complete.)*

## 🗺️ Project Roadmap

The development of MemeFace AI is broken down into three core phases:
1. **The Face Scanner**: Enabling webcam access, integrating MediaPipe, and logging real-time facial landmarks.
2. **Emotion to Meme Mapping**: Building the logic engine to map facial distances (like eyebrow raise or mouth opening) to specific desi meme text.
3. **Polish & Shareability**: Refining the UI with Tailwind, adding photo capture, and optimizing the shareable output format.

> **Note**: For detailed AI instructions, architectural guidelines, and safety constraints, please see [AGENTS.md](./AGENTS.md). 

## 📝 License

*(License information to be added)*
