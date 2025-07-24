'use server';

/**
 * @fileOverview A verifier agent that checks if the UI state matches expectations.
 *
 * - verifyStateMatch - A function that handles the state verification process.
 * - VerifierAgentStateMatchInput - The input type for the verifyStateMatch function.
 * - VerifierAgentStateMatchOutput - The return type for the verifyStateMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifierAgentStateMatchInputSchema = z.object({
  subgoal: z.string().describe('The subgoal that was just executed.'),
  uiState: z.string().describe('The current state of the UI, as a string.'),
});
export type VerifierAgentStateMatchInput = z.infer<
  typeof VerifierAgentStateMatchInputSchema
>;

const VerifierAgentStateMatchOutputSchema = z.object({
  stateMatchesExpectation: z
    .boolean()
    .describe('Whether the UI state matches the expected state for the subgoal.'),
  reasoning: z.string().describe('The reasoning behind the verification result.'),
});
export type VerifierAgentStateMatchOutput = z.infer<
  typeof VerifierAgentStateMatchOutputSchema
>;

export async function verifyStateMatch(
  input: VerifierAgentStateMatchInput
): Promise<VerifierAgentStateMatchOutput> {
  return verifierAgentStateMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifierAgentStateMatchPrompt',
  input: {schema: VerifierAgentStateMatchInputSchema},
  output: {schema: VerifierAgentStateMatchOutputSchema},
  prompt: `You are a QA verifier. Your task is to check if the provided UI state correctly reflects the outcome of the executed subgoal.

Subgoal: {{{subgoal}}}

Current UI State:
{{{uiState}}}

Does the UI state match the expected outcome of the subgoal? Provide your reasoning.
`,
});

const verifierAgentStateMatchFlow = ai.defineFlow(
  {
    name: 'verifierAgentStateMatchFlow',
    inputSchema: VerifierAgentStateMatchInputSchema,
    outputSchema: VerifierAgentStateMatchOutputSchema,
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
