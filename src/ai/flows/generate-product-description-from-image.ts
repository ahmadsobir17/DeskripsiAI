'use server';
/**
 * @fileOverview Generates a product description in Indonesian from an image.
 *
 * - generateProductDescriptionFromImage - A function that generates a product description in Indonesian from an image.
 * - GenerateProductDescriptionFromImageInput - The input type for the generateProductDescriptionFromImage function.
 * - GenerateProductDescriptionFromImageOutput - The return type for the generateProductDescriptionFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  customPrompt: z
    .string()
    .optional()
    .describe('A custom prompt to guide the product description generation.'),
  language: z.string().describe('The target language for the product description.'),
});
export type GenerateProductDescriptionFromImageInput = z.infer<typeof GenerateProductDescriptionFromImageInputSchema>;

const GenerateProductDescriptionFromImageOutputSchema = z.object({
  productDescription: z.string().describe('The generated product description in the target language.'),
});
export type GenerateProductDescriptionFromImageOutput = z.infer<typeof GenerateProductDescriptionFromImageOutputSchema>;

export async function generateProductDescriptionFromImage(input: GenerateProductDescriptionFromImageInput): Promise<GenerateProductDescriptionFromImageOutput> {
  return generateProductDescriptionFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionFromImagePrompt',
  input: {schema: GenerateProductDescriptionFromImageInputSchema},
  output: {schema: GenerateProductDescriptionFromImageOutputSchema},
  prompt: `You are an expert marketer specializing in creating compelling product descriptions. Generate a compelling product description in '{{{language}}}' based on the provided product image. Emphasize the key features and benefits of the product to attract potential buyers.

{{#if customPrompt}}
Follow these additional instructions: {{{customPrompt}}}
{{/if}}

Product Image: {{media url=photoDataUri}}

Product Description:`,
});

const generateProductDescriptionFromImageFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFromImageFlow',
    inputSchema: GenerateProductDescriptionFromImageInputSchema,
    outputSchema: GenerateProductDescriptionFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
