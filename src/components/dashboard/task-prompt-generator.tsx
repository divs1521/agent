'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { generateTaskPrompt } from '@/ai/flows/task-prompt-generator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

export default function TaskPromptGenerator() {
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoFile || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a video file and a description.',
        variant: 'destructive',
      });
      return;
    }
    if (videoFile.size > 4 * 1024 * 1024) { // 4MB limit for Gemini Flash
      toast({
        title: 'File too large',
        description: 'Please provide a video file smaller than 4MB.',
        variant: 'destructive',
      });
      return;
    }


    setIsLoading(true);
    setGeneratedPrompt('');

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onload = async () => {
      try {
        const videoDataUri = reader.result as string;
        const result = await generateTaskPrompt({ videoDataUri, description });
        setGeneratedPrompt(result.taskPrompt);
      } catch (error) {
        console.error('Error generating task prompt:', error);
        toast({
          title: 'Generation Failed',
          description: 'Could not generate a prompt. Please check the console for errors.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        title: 'File Read Error',
        description: 'Could not read the video file.',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Task Prompt</CardTitle>
          <CardDescription>
            Upload a screen recording and describe the user's actions to generate a test prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-file">Screen Recording (.mp4)</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Session Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., The user opens the app, navigates to the profile page, and updates their username."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
              Generate Prompt
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Prompt</CardTitle>
          <CardDescription>The AI-generated task prompt will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full p-4 rounded-md min-h-[280px] bg-muted/50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : generatedPrompt ? (
              <pre className="text-sm whitespace-pre-wrap font-code">{generatedPrompt}</pre>
            ) : (
              <p className="text-sm text-center text-muted-foreground">Output will be shown here.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
