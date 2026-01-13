export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface GeneratedImage {
  originalFile: File;
  originalPreviewUrl: string;
  generatedImageUrl?: string;
  status: JobStatus;
  id: string;
  error?: string;
  suggestedFileName: string;
}

export interface GenerationConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
}