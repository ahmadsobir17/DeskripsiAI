"use server";

import { analyzeUploadedImage } from "@/ai/flows/analyze-uploaded-image";
import { generateProductDescriptionFromImage } from "@/ai/flows/generate-product-description-from-image";

export async function generateContent(photoDataUri: string) {
  if (!photoDataUri) {
    return { error: "No image data provided." };
  }

  try {
    const [analysisResult, descriptionResult] = await Promise.all([
      analyzeUploadedImage({ photoDataUri }),
      generateProductDescriptionFromImage({ photoDataUri }),
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
