import { Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          Agent-S QA Mobile
        </h1>
      </div>
    </header>
  );
}
