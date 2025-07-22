import { config } from 'dotenv';
config();

import '@/ai/flows/supervisor-agent-prompt-improvement.ts';
import '@/ai/flows/planner-agent-subgoals.ts';
import '@/ai/flows/task-prompt-generator.ts';
import '@/ai/flows/verifier-agent-state-match.ts';