'use server';

/**
 * @fileOverview An Analysis Agent that analyzes the entire test episode to verify outcomes and suggest improvements.
 *
 * - analyzeTestEpisode - A function that handles the analysis process.
 * - AnalysisAgentInput - The input type for the analyzeTestEpisode function.
 * - AnalysisAgentOutput - The return type for the analyzeTestEpisode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerificationResultSchema = z.object({
  subgoal: z.string().describe('The subgoal that was being executed.'),
  stateMatchesExpectation: z.boolean().describe('Whether the UI state matched the expected state for the subgoal.'),
  functionalBugDetected: z.boolean().describe('Whether a functional bug was detected.'),
  reasoning: z.string().describe('The reasoning behind the verification result for this specific subgoal.'),
});

const AnalysisAgentInputSchema = z.object({
  testGoal: z.string().describe('The original high-level test goal.'),
  fullLog: z.string().describe('The complete execution log of the test, including all agent actions and mock UI states.'),
});
export type AnalysisAgentInput = z.infer<typeof AnalysisAgentInputSchema>;

const AnalysisAgentOutputSchema = z.object({
  verificationResults: z.array(VerificationResultSchema).describe('An array of verification results for each executed subgoal.'),
  overallVerdict: z.enum(['Passed', 'Failed', 'Bug Detected']).describe('The final verdict for the entire test episode.'),
  suggestedImprovements: z
    .string()
    .describe(
      'A list of suggested improvements to the test prompts, plans, or overall testing strategy based on the full episode.'
    ),
});
export type AnalysisAgentOutput = z.infer<typeof AnalysisAgentOutputSchema>;

export async function analyzeTestEpisode(
  input: AnalysisAgentInput
): Promise<AnalysisAgentOutput> {
  return analysisAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analysisAgentPrompt',
  input: {schema: AnalysisAgentInputSchema},
  output: {schema: AnalysisAgentOutputSchema},
  prompt: `You are a lead QA engineer analyzing a completed test episode. Your task is to do two things:
1.  **Verify each step**: For each subgoal executed, determine if the outcome was a success or failure based on the logs. Identify any functional bugs.
2.  **Supervise and Suggest**: Based on the entire test run, provide an overall verdict and suggest improvements to the testing process.

Original Test Goal: {{{testGoal}}}

Full Execution Log:
{{{fullLog}}}

Analyze the log and provide your full analysis in the required JSON format. For each subgoal in the log, provide a verification result.
`,
});

const analysisAgentFlow = ai.defineFlow(
  {
    name: 'analysisAgentFlow',
    inputSchema: AnalysisAgentInputSchema,
    outputSchema: AnalysisAgentOutputSchema,
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
