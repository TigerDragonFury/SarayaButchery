import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Security limits
const MAX_FILE_SIZE_KB = 1024; // 1MB max

interface VoiceNoteRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingDeleted?: () => void;
  existingAudioUrl?: string;
  existingDuration?: number;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  className?: string;
  isRTL?: boolean;
}

export const VoiceNoteRecorder = ({
  onRecordingComplete,
  onRecordingDeleted,
  existingAudioUrl,
  existingDuration = 0,
  maxDuration = 30, // 30 seconds max
  disabled = false,
  className,
  isRTL = false,
}: VoiceNoteRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [audioDuration, setAudioDuration] = useState(existingDuration);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingAudioUrl]);

  // Update audio URL when existingAudioUrl changes
  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
      setAudioDuration(existingDuration);
    }
  }, [existingAudioUrl, existingDuration]);

  const startRecording = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;

      // Determine best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Check file size limit
        if (blob.size > MAX_FILE_SIZE_KB * 1024) {
          setError(isRTL 
            ? `حجم الملف كبير جداً (الحد الأقصى ${MAX_FILE_SIZE_KB}KB)` 
            : `File too large (max ${MAX_FILE_SIZE_KB}KB)`
          );
          stream.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          return;
        }
        
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioDuration(recordingTime);
        
        onRecordingComplete(blob, recordingTime);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(isRTL ? 'فشل الوصول للميكروفون' : 'Failed to access microphone');
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      audioRef.current.src = audioUrl;
    }

    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setRecordingTime(0);
    setIsPlaying(false);
    
    onRecordingDeleted?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Has a recording
  if (audioUrl) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-accent/30 border border-accent",
        className
      )}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isPlaying ? pauseAudio : playAudio}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Audio waveform visualization (simple bars) */}
        <div className="flex items-center gap-0.5 flex-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full bg-primary/60 transition-all",
                isPlaying && "animate-pulse"
              )}
              style={{
                height: `${8 + Math.random() * 16}px`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-mono min-w-[40px]">
          {formatTime(audioDuration)}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={deleteRecording}
          disabled={disabled}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/50",
        className
      )}>
        <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
        
        <span className="text-sm font-medium text-destructive">
          {isRTL ? 'جاري التسجيل...' : 'Recording...'}
        </span>
        
        <span className="text-xs text-muted-foreground font-mono flex-1">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </span>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="h-8"
        >
          <Square className="h-3 w-3 me-1" />
          {isRTL ? 'إيقاف' : 'Stop'}
        </Button>
      </div>
    );
  }

  // Default state - record button
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={startRecording}
        disabled={disabled || isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isRTL ? 'تسجيل ملاحظة صوتية' : 'Record Voice Note'}
        <span className="text-xs text-muted-foreground">
          ({maxDuration}s max)
        </span>
      </Button>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default VoiceNoteRecorder;
