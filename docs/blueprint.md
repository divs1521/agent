# **App Name**: Agent-S QA Mobile

## Core Features:

- Plan Decomposition: Planner Agent: Uses an LLM to parse high-level QA goals and decompose them into subgoals for execution.
- Action Execution: Executor Agent: Executes subgoals by interacting with the Android UI environment using grounded mobile gestures.
- State Verification: Verifier Agent: Employs LLM reasoning to determine if the app behaves as expected after each step, identifying functional bugs.
- Test Supervision: Supervisor Agent: Reviews entire test episodes using an LLM tool to suggest prompt improvements, identify failures, and recommend test coverage expansion.
- Prompt Generation: Task Prompt Generator: Generate the task prompt the user was likely trying to complete, based on provided video examples.
- Result Reporting: Results Display: Displays agent decisions, actions, and final verdicts (passed/failed/bug detected) in a readable format.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), evoking trust and reliability, crucial for a QA environment.
- Background color: Very light gray (#F5F5F5), providing a clean and neutral backdrop to ensure legibility and focus on content.
- Accent color: Teal (#009688), offering a vibrant contrast for important actions and status indicators (e.g., pass/fail).
- Body and headline font: 'Inter' (sans-serif), ensures excellent readability and a modern feel for both headings and body text.
- Code font: 'Source Code Pro' (monospace) is optimal for displaying agent logs and system interactions.
- Icons should be clear and symbolic, aligned with agent functions (e.g., magnifying glass for verification, gears for planning).
- Divide the screen into logical sections (agent panels, results area) to allow clear visual separation for each agent's input and output, supporting efficient QA process monitoring.