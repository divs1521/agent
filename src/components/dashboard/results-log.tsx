import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LogEntry } from '@/lib/types';
import { Badge } from '../ui/badge';

type ResultsLogProps = {
  log: LogEntry[];
};

export default function ResultsLog({ log }: ResultsLogProps) {
    const getBadgeVariant = (status: LogEntry['status']) => {
        switch (status) {
            case 'success':
                return 'default';
            case 'failure':
                return 'destructive';
            case 'info':
            default:
                return 'secondary';
        }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Log</CardTitle>
        <CardDescription>Detailed step-by-step execution trace of the QA agents.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Step</TableHead>
                <TableHead className="w-[150px]">Agent</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[180px] text-right">Timestamp</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {log.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No log entries yet. Start a test to see the execution trace.
                        </TableCell>
                    </TableRow>
                ) : (
                    log.map((entry) => (
                        <TableRow key={entry.step}>
                        <TableCell className="font-medium">{entry.step}</TableCell>
                        <TableCell>{entry.agent}</TableCell>
                        <TableCell className="font-code text-sm">{entry.details}</TableCell>
                        <TableCell>
                            <Badge variant={getBadgeVariant(entry.status)} className="capitalize">{entry.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{entry.timestamp}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
