'use client';

import type { Agent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

type AgentCardProps = {
  agent: Agent;
};

export default function AgentCard({ agent }: AgentCardProps) {
  const getBadgeVariant = (status: Agent['status']) => {
    switch (status) {
      case 'running':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <agent.icon className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline">{agent.name}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant(agent.status)} className="capitalize">
            {agent.status}
          </Badge>
        </div>
        <CardDescription>{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-48 p-4 border rounded-md bg-muted/20">
          {agent.status === 'running' && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          )}
          {agent.error && <p className="text-sm text-destructive font-code">{agent.error}</p>}
          {agent.output && (
            <div className="space-y-2 text-sm font-code">
              {Array.isArray(agent.output) ? (
                <ul className="space-y-1 list-disc list-inside">
                  {agent.output.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{agent.output}</p>
              )}
            </div>
          )}
          {agent.status === 'idle' && !agent.output && (
            <p className="text-sm text-muted-foreground">Awaiting execution...</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
