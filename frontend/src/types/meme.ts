export type Emotion = 
  | "NEUTRAL" 
  | "ANGRY" 
  | "SHOCKED" 
  | "JOY"
  | "SAD"
  | "JUDGING";

export interface DesiMeme {
  id: string;
  triggerEmotion: Emotion;
  source: string; // E.g., "Hera Pheri", "Mirzapur"
  imageUrl: string; 
  textPrimary: string;
  textSecondary?: string;
  tags: string[];
}
