import type { LucideIcon } from "lucide-react";

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export type Agent = {
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  output: string | string[] | null;
  error: string | null;
};

export type LogEntry = {
  step: number;
  agent: string;
  details: string;
  status: 'success' | 'failure' | 'info';
  timestamp: string;
}
