"use server";

import { analyzeUploadedImage } from "@/ai/flows/analyze-uploaded-image";
import { generateProductDescriptionFromImage, type GenerateProductDescriptionFromImageInput } from "@/ai/flows/generate-product-description-from-image";

export async function generateContent(
  photoDataUri: string, 
  customPrompt: string, 
  targetMarket: GenerateProductDescriptionFromImageInput['targetMarket'],
  length: GenerateProductDescriptionFromImageInput['length']
) {
  if (!photoDataUri) {
    return { error: "No image data provided." };
  }

  try {
    const [analysisResult, descriptionResult] = await Promise.all([
      analyzeUploadedImage({ photoDataUri }),
      generateProductDescriptionFromImage({ photoDataUri, customPrompt, targetMarket, length }),
    ]);

    return {
      analysis: analysisResult.features,
      description: descriptionResult.productDescription,
    };
  } catch (e: any) {
    console.error("Error generating content:", e);
    return { error: e.message || "An unknown error occurred during content generation." };
  }
}

    