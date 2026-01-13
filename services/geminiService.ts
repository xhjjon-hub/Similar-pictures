import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Helper to get image dimensions and calculate closest supported aspect ratio
const getSupportedAspectRatio = (file: File): Promise<"1:1" | "3:4" | "4:3" | "16:9" | "9:16"> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      URL.revokeObjectURL(img.src);

      // Gemini supported ratios: 1:1, 3:4, 4:3, 16:9, 9:16
      // 16:9 = 1.777...
      // 4:3 = 1.333...
      // 1:1 = 1.0
      // 3:4 = 0.75
      // 9:16 = 0.5625

      if (ratio >= 1.55) resolve("16:9");
      else if (ratio >= 1.15) resolve("4:3");
      else if (ratio >= 0.85) resolve("1:1");
      else if (ratio >= 0.65) resolve("3:4");
      else resolve("9:16");
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const generateImageVariation = async (
  file: File,
  _config: GenerationConfig // We now ignore manual config and use auto-detected ratio
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Execute helpers in parallel
    const [base64Data, targetAspectRatio] = await Promise.all([
      fileToBase64(file),
      getSupportedAspectRatio(file)
    ]);

    // Using gemini-2.5-flash-image as requested
    const model = 'gemini-2.5-flash-image';

    // Updated prompt specifically for "End Frame" generation
    const prompt = `
      Task: Generate the **End Frame** for a video sequence, based on the uploaded **Start Frame**.
      
      Requirements:
      1. **Visual Continuity**: The generated image must strictly maintain the characters, background, lighting, artistic style, and camera angle of the Start Frame. It must look like the same scene.
      2. **Temporal Progression**: Introduce natural movement or change that would happen over a few seconds. 
         - If a character is present, change their expression slightly or move their limbs naturally.
         - If vehicles or objects are present, advance their position.
         - If it is a landscape, shift the clouds, water, or lighting slightly.
      3. **Text Handling**: If Chinese text is present, ensure it remains coherent and legible. It can move or animate, but must stay grammatically correct.
      4. **Aspect Ratio**: The output aspect ratio has been set to match the input. Ensure the composition fits this ratio perfectly.

      The goal is to use the Start Frame (input) and this End Frame (output) to generate a smooth video clip. The transition implies motion.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: targetAspectRatio,
        }
      },
    });

    // Extract the image from the response
    if (response.candidates && response.candidates.length > 0) {
        const content = response.candidates[0].content;
        if (content && content.parts) {
            for (const part of content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
    }

    throw new Error("API 未返回图像数据");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};