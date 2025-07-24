'use server';

/**
 * @fileOverview A supervisor agent that suggests improvements to test prompts based on a full test run.
 *
 * - suggestPromptImprovements - A function that generates suggestions.
 * - SupervisorAgentPromptImprovementInput - The input type for the suggestPromptImprovements function.
 * - SupervisorAgentPromptImprovementOutput - The return type for the suggestPromptImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupervisorAgentPromptImprovementInputSchema = z.object({
  testGoal: z.string().describe('The original high-level test goal.'),
  fullLog: z.string().describe('The complete execution log of the test.'),
});
export type SupervisorAgentPromptImprovementInput = z.infer<
  typeof SupervisorAgentPromptImprovementInputSchema
>;

const SupervisorAgentPromptImprovementOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe('A list of suggested improvements to the test prompts or plans.'),
});
export type SupervisorAgentPromptImprovementOutput = z.infer<
  typeof SupervisorAgentPromptImprovementOutputSchema
>;

export async function suggestPromptImprovements(
  input: SupervisorAgentPromptImprovementInput
): Promise<SupervisorAgentPromptImprovementOutput> {
  return supervisorAgentPromptImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supervisorAgentPromptImprovementPrompt',
  input: {schema: SupervisorAgentPromptImprovementInputSchema},
  output: {schema: SupervisorAgentPromptImprovementOutputSchema},
  prompt: `You are a lead QA engineer supervising a test run. Based on the original goal and the full execution log, suggest improvements to the test prompts, plans, or overall testing strategy.

Original Test Goal: {{{testGoal}}}

Full Execution Log:
{{{fullLog}}}

Provide your suggested improvements.
`,
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
