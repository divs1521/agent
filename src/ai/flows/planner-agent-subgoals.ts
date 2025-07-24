'use server';

/**
 * @fileOverview A planner agent that decomposes high-level test goals into actionable subgoals.
 *
 * - generateSubgoals - A function that generates a sequence of subgoals from a given test goal.
 * - PlannerAgentSubgoalsInput - The input type for the generateSubgoals function.
 * - PlannerAgentSubgoalsOutput - The return type for the generateSubgoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlannerAgentSubgoalsInputSchema = z.object({
  testGoal: z.string().describe('The high-level test goal to decompose.'),
});
export type PlannerAgentSubgoalsInput = z.infer<
  typeof PlannerAgentSubgoalsInputSchema
>;

const PlannerAgentSubgoalsOutputSchema = z.object({
  subgoals: z
    .array(z.string())
    .describe('The sequence of actionable subgoals.'),
});
export type PlannerAgentSubgoalsOutput = z.infer<
  typeof PlannerAgentSubgoalsOutputSchema
>;

export async function generateSubgoals(
  input: PlannerAgentSubgoalsInput
): Promise<PlannerAgentSubgoalsOutput> {
  return plannerAgentSubgoalsFlow(input);
}

const plannerAgentSubgoalsPrompt = ai.definePrompt({
  name: 'plannerAgentSubgoalsPrompt',
  input: {schema: PlannerAgentSubgoalsInputSchema},
  output: {schema: PlannerAgentSubgoalsOutputSchema},
  prompt: `You are a QA engineer. Decompose the following high-level test goal into a sequence of actionable subgoals.

Test Goal: {{{testGoal}}}

Subgoals:`,
});

const plannerAgentSubgoalsFlow = ai.defineFlow(
  {
    name: 'plannerAgentSubgoalsFlow',
    inputSchema: PlannerAgentSubgoalsInputSchema,
    outputSchema: PlannerAgentSubgoalsOutputSchema,
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
    const {output} = await plannerAgentSubgoalsPrompt(input);
    return output!;
  }
);
