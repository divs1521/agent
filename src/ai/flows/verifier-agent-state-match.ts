'use server';

/**
 * @fileOverview A Verifier Agent that analyzes the UI state after each action to determine if it matches the expected outcome.
 *
 * - verifyStateMatch - A function that handles the state verification process.
 * - VerifyStateMatchInput - The input type for the verifyStateMatch function.
 * - VerifyStateMatchOutput - The return type for the verifyStateMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyStateMatchInputSchema = z.object({
  plannerGoal: z.string().describe('The goal set by the planner agent.'),
  executorResult: z.string().describe('The result of the action executed by the executor agent.'),
  uiState: z.string().describe('The current UI state in JSON format.'),
  expectedState: z.string().describe('The expected state of the UI in JSON format.'),
});
export type VerifyStateMatchInput = z.infer<typeof VerifyStateMatchInputSchema>;

const VerifyStateMatchOutputSchema = z.object({
  stateMatchesExpectation: z.boolean().describe('Whether the current UI state matches the expected state.'),
  functionalBugDetected: z.boolean().describe('Whether a functional bug was detected (e.g., missing screen, wrong toggle state).'),
  reasoning: z.string().describe('The reasoning behind the verification result.'),
});
export type VerifyStateMatchOutput = z.infer<typeof VerifyStateMatchOutputSchema>;

export async function verifyStateMatch(input: VerifyStateMatchInput): Promise<VerifyStateMatchOutput> {
  return verifyStateMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyStateMatchPrompt',
  input: {schema: VerifyStateMatchInputSchema},
  output: {schema: VerifyStateMatchOutputSchema},
  prompt: `You are a QA engineer specializing in verifying the state of mobile applications after actions are performed.

You will receive the planner goal, the executor result, the current UI state, and the expected UI state.

Your task is to determine if the current UI state matches the expected UI state. You should also identify if there is a functional bug (e.g., missing screen, wrong toggle state).

Planner Goal: {{{plannerGoal}}}
Executor Result: {{{executorResult}}}
Current UI State: {{{uiState}}}
Expected UI State: {{{expectedState}}}

Based on the above information, determine if the current state matches the expectation and if a functional bug was detected. Provide your reasoning for your determination.

Output your answer in JSON format:
{
  "stateMatchesExpectation": true/false,
  "functionalBugDetected": true/false,
  "reasoning": "..."
}
`,
});

const verifyStateMatchFlow = ai.defineFlow(
  {
    name: 'verifyStateMatchFlow',
    inputSchema: VerifyStateMatchInputSchema,
    outputSchema: VerifyStateMatchOutputSchema,
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
