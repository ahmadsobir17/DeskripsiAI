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
  targetMarket: z.string().describe('The target market for the product description.'),
  length: z.enum(['Short', 'Medium', 'Long']).optional().describe('The desired length of the product description.'),
});
export type GenerateProductDescriptionFromImageInput = z.infer<typeof GenerateProductDescriptionFromImageInputSchema>;

const GenerateProductDescriptionFromImageOutputSchema = z.object({
  productDescription: z.string().describe('The generated product description in Indonesian.'),
});
export type GenerateProductDescriptionFromImageOutput = z.infer<typeof GenerateProductDescriptionFromImageOutputSchema>;

export async function generateProductDescriptionFromImage(input: GenerateProductDescriptionFromImageInput): Promise<GenerateProductDescriptionFromImageOutput> {
  return generateProductDescriptionFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionFromImagePrompt',
  input: {schema: GenerateProductDescriptionFromImageInputSchema},
  output: {schema: GenerateProductDescriptionFromImageOutputSchema},
  prompt: `You are an expert marketer specializing in creating compelling product descriptions in Indonesian. Your task is to generate a product description for the given image, tailored to the specified target market.

**Output Formatting Instructions:**
- Structure the description with clear paragraphs for readability. Use proper spacing between paragraphs.
- Use bullet points (with a hyphen, e.g., - Point 1) to highlight key features or benefits.
- Ensure correct use of punctuation, including commas and periods.
- The final output should be clean, well-organized, and easy to read.

**Description Length:** Generate a {{length | default: 'Medium'}}-length description.

**Target Market:** {{{targetMarket}}}

- If the target market is 'Gen Z', use a casual, trendy, and social media-friendly tone. Use slang and emojis where appropriate.
- If the target market is 'Young Professionals', use a sophisticated, polished, and benefits-oriented tone. Highlight quality, efficiency, and how the product can enhance their lifestyle. The output must be easy to read.
- If the target market is 'Families', use a warm, trustworthy, and practical tone. Emphasize safety, durability, and how the product can benefit the entire family.

{{#if customPrompt}}
**Custom Instructions:**
Follow these additional instructions: {{{customPrompt}}}
{{/if}}

**Product Image:**
{{media url=photoDataUri}}

**Product Description (in Indonesian):**`,
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

    