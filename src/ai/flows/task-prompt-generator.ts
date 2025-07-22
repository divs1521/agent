'use server';

/**
 * @fileOverview Task Prompt Generator AI agent.
 *
 * - generateTaskPrompt - A function that generates task prompts from video examples.
 * - GenerateTaskPromptInput - The input type for the generateTaskPrompt function.
 * - GenerateTaskPromptOutput - The return type for the generateTaskPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskPromptInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video example of a user session, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the user session.'),
});
export type GenerateTaskPromptInput = z.infer<typeof GenerateTaskPromptInputSchema>;

const GenerateTaskPromptOutputSchema = z.object({
  taskPrompt: z.string().describe('The generated task prompt for the user session.'),
});
export type GenerateTaskPromptOutput = z.infer<typeof GenerateTaskPromptOutputSchema>;

export async function generateTaskPrompt(input: GenerateTaskPromptInput): Promise<GenerateTaskPromptOutput> {
  return generateTaskPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskPromptPrompt',
  input: {schema: GenerateTaskPromptInputSchema},
  output: {schema: GenerateTaskPromptOutputSchema},
  prompt: `You are an expert QA analyst specializing in generating task prompts from video examples of user sessions.\n\nYou will use this information to generate a task prompt that can be used to automate the creation of realistic test scenarios based on real-world usage.\n\nUse the following as the primary source of information about the user session.\n\nDescription: {{{description}}}\nVideo: {{media url=videoDataUri}}`,
});

const generateTaskPromptFlow = ai.defineFlow(
  {
    name: 'generateTaskPromptFlow',
    inputSchema: GenerateTaskPromptInputSchema,
    outputSchema: GenerateTaskPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
