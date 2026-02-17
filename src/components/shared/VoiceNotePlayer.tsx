import { useState, useRef } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface VoiceNotePlayerProps {
  storagePath: string;
  duration?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const VoiceNotePlayer = ({
  storagePath,
  duration = 0,
  className,
  size = 'sm',
}: VoiceNotePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadAndPlay = async () => {
    if (audioUrl) {
      // Already loaded, just play
      playAudio();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get signed URL from edge function
      const { data, error: funcError } = await supabase.functions.invoke('voice-note-url', {
        body: {},
        headers: {},
      });

      // Manually construct the URL with query param since invoke doesn't support query params well
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-note-url?path=${encodeURIComponent(storagePath)}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get audio URL');
      }

      const result = await response.json();

      if (!result.success || !result.signed_url) {
        throw new Error(result.error || 'Failed to get signed URL');
      }

      setAudioUrl(result.signed_url);
      
      // Create and play audio
      const audio = new Audio(result.signed_url);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);

    } catch (err) {
      console.error('Error loading voice note:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <span className="text-xs text-destructive">{error}</span>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/50 border border-accent",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? pauseAudio : loadAndPlay}
        disabled={isLoading}
        className={cn(
          "rounded-full",
          size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin", size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        ) : isPlaying ? (
          <Pause className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        ) : (
          <Play className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        )}
      </Button>
      
      <Volume2 className={cn("text-muted-foreground", size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      
      {duration > 0 && (
        <span className={cn("text-muted-foreground font-mono", size === 'sm' ? 'text-xs' : 'text-sm')}>
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
};

export default VoiceNotePlayer;
