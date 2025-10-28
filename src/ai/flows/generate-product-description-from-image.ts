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
  prompt: `Anda adalah pemasar ahli yang berspesialisasi dalam membuat deskripsi produk yang menarik dalam bahasa Indonesia. Buat deskripsi produk yang menarik berdasarkan gambar produk yang disediakan. Tekankan fitur dan manfaat utama produk untuk menarik pembeli potensial.

{{#if customPrompt}}
Ikuti instruksi tambahan ini: {{{customPrompt}}}
{{/if}}

Gambar Produk: {{media url=photoDataUri}}

Deskripsi Produk:`, // Prompt to generate product description in Indonesian.
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
