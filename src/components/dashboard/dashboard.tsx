'use client';

import { useState, type FormEvent } from 'react';
import { GanttChartSquare, PlayCircle, ClipboardCheck, Loader2, Microscope, Eye } from 'lucide-react';
import type { Agent, LogEntry, AgentStatus } from '@/lib/types';
import { generateSubgoals } from '@/ai/flows/planner-agent-subgoals';
import { verifyStateMatch } from '@/ai/flows/verifier-agent-state-match';
import { suggestPromptImprovements } from '@/ai/flows/supervisor-agent-prompt-improvement';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import Header from './header';
import AgentCard from './agent-card';
import ResultsLog from './results-log';
import TaskPromptGenerator from './task-prompt-generator';

const initialAgents: Record<string, Agent> = {
  planner: {
    name: 'Planner Agent',
    description: 'Decomposes high-level goals into actionable subgoals.',
    icon: GanttChartSquare,
    status: 'idle',
    output: null,
    error: null,
  },
  executor: {
    name: 'Executor Agent',
    description: 'Executes subgoals in the UI environment.',
    icon: PlayCircle,
    status: 'idle',
    output: null,
    error: null,
  },
  verifier: {
    name: 'Verifier Agent',
    description: 'Checks if the UI state matches expectations after each step.',
    icon: ClipboardCheck,
    status: 'idle',
    output: null,
    error: null,
  },
  supervisor: {
    name: 'Supervisor Agent',
    description: 'Reviews the full test and suggests prompt improvements.',
    icon: Eye,
    status: 'idle',
    output: null,
    error: null,
  },
};

export default function Dashboard() {
  const [goal, setGoal] = useState('');
  const [agents, setAgents] = useState<Record<string, Agent>>(initialAgents);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateAgentState = (name: string, status: AgentStatus, data: Partial<Agent>) => {
    setAgents((prev) => ({
      ...prev,
      [name]: { ...prev[name], status, ...data },
    }));
  };

  const addLogEntry = (entry: Omit<LogEntry, 'step' | 'timestamp'>) => {
    setLog((prev) => [
      ...prev,
      { ...entry, step: prev.length + 1, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const resetState = () => {
    setAgents(initialAgents);
    setLog([]);
    setGoal('');
  };

  const handleStartTest = async (e: FormEvent) => {
    e.preventDefault();
    if (!goal) {
      toast({ title: 'Goal is required', description: 'Please enter a QA goal.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    resetState();
    
    let currentLog: LogEntry[] = [];
    const addToCurrentLog = (entry: Omit<LogEntry, 'step' | 'timestamp'>) => {
      const newEntry = { ...entry, step: currentLog.length + 1, timestamp: new Date().toLocaleTimeString() };
      currentLog.push(newEntry);
      setLog([...currentLog]);
    };

    try {
      // 1. Planner Agent
      updateAgentState('planner', 'running', {});
      addToCurrentLog({ agent: 'System', details: 'Starting test...', status: 'info' });
      addToCurrentLog({ agent: 'Planner', details: `Generating plan for goal: "${goal}"`, status: 'info' });
      const planResult = await generateSubgoals({ testGoal: goal });
      const subgoals = planResult.subgoals;
      updateAgentState('planner', 'completed', { output: subgoals });
      addToCurrentLog({ agent: 'Planner', details: `Generated ${subgoals.length} subgoals.`, status: 'success' });
      
      // 2. Executor & Verifier Loop
      updateAgentState('executor', 'running', { output: `Starting execution of ${subgoals.length} subgoals...` });
      updateAgentState('verifier', 'running', {});
      let overallTestPassed = true;
      let verifierOutput: string[] = [];

      for (const [index, subgoal] of subgoals.entries()) {
        addToCurrentLog({ agent: 'Executor', details: `Executing subgoal ${index + 1}/${subgoals.length}: ${subgoal}`, status: 'info' });
        await new Promise(res => setTimeout(res, 1000)); // Simulate execution
        const mockUiState = `Mock UI state after executing: ${subgoal}`;
        addToCurrentLog({ agent: 'Executor', details: mockUiState, status: 'info' });

        addToCurrentLog({ agent: 'Verifier', details: `Verifying state for subgoal: "${subgoal}"`, status: 'info' });
        const verificationResult = await verifyStateMatch({ subgoal, uiState: mockUiState });
        
        const verificationText = `Subgoal "${subgoal}": ${verificationResult.reasoning}`;
        verifierOutput.push(verificationText);
        setAgents((prev) => ({ ...prev, verifier: { ...prev.verifier, output: [...verifierOutput] }}));

        if (!verificationResult.stateMatchesExpectation) {
          overallTestPassed = false;
          addToCurrentLog({ agent: 'Verifier', details: `Verification failed. ${verificationResult.reasoning}`, status: 'failure' });
        } else {
          addToCurrentLog({ agent: 'Verifier', details: `Verification passed. ${verificationResult.reasoning}`, status: 'success' });
        }
      }
      updateAgentState('executor', 'completed', { output: `Completed all ${subgoals.length} subgoals.`});
      updateAgentState('verifier', 'completed', { output: verifierOutput });
      addToCurrentLog({ agent: 'Executor', details: `All subgoals executed.`, status: 'success' });
      addToCurrentLog({ agent: 'Verifier', details: `All subgoals verified.`, status: 'success' });

      // 3. Supervisor Agent
      updateAgentState('supervisor', 'running', {});
      const fullLogText = currentLog.map(l => `[${l.timestamp}] ${l.agent}: ${l.details}`).join('\n');
      addToCurrentLog({ agent: 'Supervisor', details: 'Reviewing full test episode for improvements...', status: 'info' });
      const supervisorResult = await suggestPromptImprovements({ testGoal: goal, fullLog: fullLogText });
      updateAgentState('supervisor', 'completed', { output: supervisorResult.suggestedImprovements });
      addToCurrentLog({ agent: 'Supervisor', details: `Analysis complete. ${supervisorResult.suggestedImprovements}`, status: 'info' });

      addToCurrentLog({ agent: 'System', details: `Test run ${overallTestPassed ? 'completed' : 'failed'}.`, status: overallTestPassed ? 'success' : 'failure' });
      toast({ title: 'Test Complete', description: `The test run has ${overallTestPassed ? 'completed' : 'failed'}.` });

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addToCurrentLog({ agent: 'System', details: `An error occurred: ${errorMessage}`, status: 'failure' });
      toast({ title: 'An Error Occurred', description: 'The test run was aborted. Check logs for details.', variant: 'destructive' });
      // Set all running agents to error status
      Object.keys(agents).forEach(agentName => {
        if(agents[agentName].status === 'running') {
          updateAgentState(agentName, 'error', { error: errorMessage });
        }
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="qa-runner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
            <TabsTrigger value="qa-runner">Multi-Agent QA Runner</TabsTrigger>
            <TabsTrigger value="prompt-generator">Task Prompt Generator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qa-runner" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Initiate QA Test</CardTitle>
                  <CardDescription>Enter a high-level QA goal to begin the automated test run.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStartTest} className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="e.g., Test user login and logout functionality"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      disabled={isLoading}
                      className="font-code"
                    />
                    <Button type="submit" disabled={isLoading} className="sm:w-48">
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Start Test'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AgentCard agent={agents.planner} />
                <AgentCard agent={agents.executor} />
                <AgentCard agent={agents.verifier} />
                <AgentCard agent={agents.supervisor} />
              </div>
              
              <ResultsLog log={log} />
            </div>
          </TabsContent>

          <TabsContent value="prompt-generator" className="mt-6">
            <TaskPromptGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
