import { useEffect, useRef, useState } from "react";
import type { Results } from "@mediapipe/face_mesh";
import { calculateDistance } from "@/utils/geometry";

// Emotion Thresholds: These are ratios relative to the user's face width.
// This makes the detection scale-invariant (works whether you are close or far from camera).
const THRESHOLDS = {
  BROW_FURROW: 0.28,  // Angry: Inner eyebrows distance ratio (lower = furrowed)
  MOUTH_OPEN: 0.08,   // Shocked: Upper/lower lip distance ratio (higher = open mouth)
  MOUTH_SMILE: 0.38,  // Joy: Mouth width ratio (higher = wide smile)
  SAD_FROWN: 0.02,    // Sad: Y-axis drop of mouth corners compared to center lip
};

export type EmotionState = "NEUTRAL" | "ANGRY" | "SHOCKED" | "JOY" | "JUDGING" | "SAD";

export function useFaceTracker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [isReady, setIsReady] = useState(false);
  
  // We use a React ref to store the current emotion so we don't trigger 
  // 60fps re-renders when the emotion flickers.
  const currentEmotionRef = useRef<EmotionState>("NEUTRAL");
  
  // A secondary state used *only* when we want the UI to react to a stable emotion change
  const [stableEmotion, setStableEmotion] = useState<EmotionState>("NEUTRAL");
  
  // Track consecutive frames of the same emotion to prevent flickering
  const emotionFramerRef = useRef({ emotion: "NEUTRAL" as EmotionState, count: 0 });

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const FaceMesh = (window as any).FaceMesh;
    const Camera = (window as any).Camera;

    if (!FaceMesh || !Camera) {
      console.warn("MediaPipe not loaded yet.");
      return;
    }

    const faceMesh = new FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: Results) => {
      if (!canvasCtx || !videoElement.videoWidth) return;

      // Sync canvas
      if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
      }

      // 1. Draw Mesh Overlay
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // Draw mesh points
        canvasCtx.fillStyle = "#f97316"; // Brand orange
        for (const landmark of landmarks) {
          canvasCtx.beginPath();
          canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 1.2, 0, 2 * Math.PI);
          canvasCtx.fill();
        }

        // Face width (distance between left and right cheekbones) for scale normalization
        const faceLeft = landmarks[234];
        const faceRight = landmarks[454];
        const faceWidth = calculateDistance(faceLeft, faceRight) || 1; // Prevent division by zero

        // 2. Emotion Logic Classification (Scale Invariant)
        const browInnerLeft = landmarks[107];
        const browInnerRight = landmarks[336];
        const upperInnerLip = landmarks[13];
        const lowerInnerLip = landmarks[14];
        const leftMouthCorner = landmarks[61];
        const rightMouthCorner = landmarks[291];

        // Ratios relative to face width
        const browRatio = calculateDistance(browInnerLeft, browInnerRight) / faceWidth;
        const mouthOpenRatio = calculateDistance(upperInnerLip, lowerInnerLip) / faceWidth;
        const mouthWidthRatio = calculateDistance(leftMouthCorner, rightMouthCorner) / faceWidth;

        // Frown detection: Check if corners of the mouth are pulled down relative to the center
        // In MediaPipe, Y increases downwards, so higher Y means lower on the face.
        const mouthCenterY = (upperInnerLip.y + lowerInnerLip.y) / 2;
        const mouthCornersY = (leftMouthCorner.y + rightMouthCorner.y) / 2;
        const frownDrop = mouthCornersY - mouthCenterY; 

        // Determine baseline emotion
        let currentDetectedEmotion: EmotionState = "NEUTRAL";

        // Determine emotion based on distances
        if (mouthOpenRatio > THRESHOLDS.MOUTH_OPEN) {
          currentDetectedEmotion = "SHOCKED";
        } else if (frownDrop > THRESHOLDS.SAD_FROWN) {
          currentDetectedEmotion = "SAD";
        } else if (mouthWidthRatio > THRESHOLDS.MOUTH_SMILE) {
          currentDetectedEmotion = "JOY";
        } else if (browRatio < THRESHOLDS.BROW_FURROW) {
          currentDetectedEmotion = "ANGRY";
        } else if (browRatio < THRESHOLDS.BROW_FURROW * 1.05 && mouthWidthRatio < THRESHOLDS.MOUTH_SMILE * 0.9) {
          currentDetectedEmotion = "JUDGING";
        }
        
        // Debugging logs to help user see raw values
        if (Math.random() < 0.03) {
          console.log(`Mood Math - Brow: ${browRatio.toFixed(3)}, Mouth Open: ${mouthOpenRatio.toFixed(3)}, Smile: ${mouthWidthRatio.toFixed(3)}, Frown: ${frownDrop.toFixed(3)} | Detected: ${currentDetectedEmotion}`);
        }

        // Stabilization logic: Only update state if emotion holds for 5 frames (~80ms)
        if (currentDetectedEmotion === emotionFramerRef.current.emotion) {
          emotionFramerRef.current.count++;
          if (emotionFramerRef.current.count > 5) {
            setStableEmotion((prev) => {
              if (prev !== currentDetectedEmotion) return currentDetectedEmotion;
              return prev;
            });
            currentEmotionRef.current = currentDetectedEmotion;
          }
        } else {
          emotionFramerRef.current = { emotion: currentDetectedEmotion, count: 1 };
        }
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        try {
          await faceMesh.send({ image: videoElement });
        } catch (error) {
          console.error("FaceTracker Error:", error);
        }
      },
      width: 1280,
      height: 720,
    });
    
    camera.start().then(() => setIsReady(true));

    return () => {
      camera.stop();
      faceMesh.close();
      setIsReady(false);
    };
  }, [videoRef, canvasRef]);

  return { isReady, stableEmotion, currentEmotionRef };
}
