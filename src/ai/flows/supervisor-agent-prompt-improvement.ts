'use server';
/**
 * @fileOverview Supervisor Agent Flow for suggesting prompt improvements.
 *
 * - supervisorAgentPromptImprovement - A function that reviews test episodes and suggests prompt improvements.
 * - SupervisorAgentPromptImprovementInput - The input type for the supervisorAgentPromptImprovement function.
 * - SupervisorAgentPromptImprovementOutput - The return type for the supervisorAgentPromptImprovement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupervisorAgentPromptImprovementInputSchema = z.object({
  testEpisode: z
    .string()
    .describe('A complete log of the test episode including agent decisions, actions, and UI states.'),
});
export type SupervisorAgentPromptImprovementInput = z.infer<
  typeof SupervisorAgentPromptImprovementInputSchema
>;

const SupervisorAgentPromptImprovementOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe(
      'A list of suggested improvements to the test prompts, plans, or overall testing strategy.'
    ),
});
export type SupervisorAgentPromptImprovementOutput = z.infer<
  typeof SupervisorAgentPromptImprovementOutputSchema
>;

export async function supervisorAgentPromptImprovement(
  input: SupervisorAgentPromptImprovementInput
): Promise<SupervisorAgentPromptImprovementOutput> {
  return supervisorAgentPromptImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supervisorAgentPromptImprovementPrompt',
  input: {schema: SupervisorAgentPromptImprovementInputSchema},
  output: {schema: SupervisorAgentPromptImprovementOutputSchema},
  prompt: `You are a lead QA engineer reviewing a test episode. Your goal is to identify areas where the testing strategy or prompts could be improved to increase bug detection accuracy.

  Consider the following test episode:
  {{testEpisode}}

  Based on this episode, provide a list of specific, actionable suggestions for improving the test prompts, plans, or overall testing strategy. Focus on areas where the agents may have missed bugs or made incorrect decisions.`,
});

const supervisorAgentPromptImprovementFlow = ai.defineFlow(
  {
    name: 'supervisorAgentPromptImprovementFlow',
    inputSchema: SupervisorAgentPromptImprovementInputSchema,
    outputSchema: SupervisorAgentPromptImprovementOutputSchema,
    retry: {
      backoff: {
        jitter: 'full',
        maxRetries: 5,
        duration: '2s',
        factor: 2,
      },
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
