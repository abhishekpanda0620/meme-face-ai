"use client";

import React, { useEffect, useRef } from "react";
import type { Results } from "@mediapipe/face_mesh";

export default function FaceScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    // MediaPipe defines these on the global window object via CDN scripts in layout.tsx
    const FaceMesh = (window as any).FaceMesh;
    const Camera = (window as any).Camera;

    if (!FaceMesh || !Camera) {
      console.error("MediaPipe not loaded from CDN yet.");
      return;
    }

    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // 468 points + irises
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: Results) => {
      if (!canvasCtx || !videoElement.videoWidth || !videoElement.videoHeight) return;

      // Sync canvas dimensions to video feed exactly once video is ready
      if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Flip context horizontally here if we want mirror effect, OR handle it via CSS.
      // We'll draw normally and flip via CSS to save computation points.
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Draw the 468 face mesh points
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          canvasCtx.fillStyle = "#10b981"; // Emerald-500 for a premium look
          for (const landmark of landmarks) {
            const x = landmark.x * canvasElement.width;
            const y = landmark.y * canvasElement.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 1.2, 0, 2 * Math.PI);
            canvasCtx.fill();
          }
        }
      }
      canvasCtx.restore();
    });

    // Setup Video Feed using MediaPipe Camera Utility
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        try {
          await faceMesh.send({ image: videoElement });
        } catch (error) {
          console.error("Error processing Face Mesh frame:", error);
        }
      },
      width: 1280, // Request HD for better accuracy
      height: 720,
    });
    
    camera.start();

    return () => {
      camera.stop();
      faceMesh.close();
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
      {/* Hidden Video element - MediaPipe requires a source HTMLVideoElement */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
      ></video>
      
      {/* Canvas container with an explicit aspect ratio and CSS horizontal flip for mirror effect */}
      <div className="relative w-full overflow-hidden rounded-lg bg-black flex items-center justify-center min-h-[400px]">
        <canvas
          ref={canvasRef}
          className="w-full h-auto object-cover transform scale-x-[-1]"
        ></canvas>

        {/* Overlay Badges for premium UI look */}
        <div className="absolute top-4 left-4 flex gap-3">
          <div className="flex items-center gap-2 bg-black/60 text-emerald-400 font-semibold px-4 py-2 rounded-full text-xs backdrop-blur-md border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Vision Active
          </div>
        </div>
      </div>
    </div>
  );
}
