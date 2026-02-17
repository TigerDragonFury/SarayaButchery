import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Play, Pause, Loader2, User, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderMessages, OrderMessage } from '@/hooks/useOrderMessages';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OrderMessageThreadProps {
  orderId: string;
  productId?: string;
  productName?: string;
  senderType: 'butcher' | 'customer';
  className?: string;
}

export const OrderMessageThread = ({
  orderId,
  productId,
  productName,
  senderType,
  className,
}: OrderMessageThreadProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const { messages, loading, sendTextMessage, sendVoiceMessage, markAsRead } = useOrderMessages(
    orderId,
    productId
  );

  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const MAX_DURATION = 30;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages from other sender as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.sender_type !== senderType && !msg.is_read) {
        markAsRead(msg.id);
      }
    });
  }, [messages, senderType, markAsRead]);

  const handleSendText = async () => {
    if (!textInput.trim() || sending) return;

    setSending(true);
    const success = await sendTextMessage({
      orderId,
      productId,
      content: textInput.trim(),
      senderType,
    });

    if (success) {
      setTextInput('');
    }
    setSending(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
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

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const sendVoice = async () => {
    if (!audioBlob || sending) return;

    setSending(true);
    try {
      // Upload to storage
      const timestamp = Date.now();
      const fileName = `messages/${orderId}/${productId || 'order'}-${timestamp}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      const success = await sendVoiceMessage({
        orderId,
        productId,
        storagePath: fileName,
        durationSeconds: recordingTime,
        senderType,
      });

      if (success) {
        setAudioBlob(null);
        setRecordingTime(0);
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (dateString: string) => {
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {productName && (
        <div className="px-3 py-2 border-b bg-muted/30">
          <p className="text-sm font-medium">{productName}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {isRTL ? 'لا توجد رسائل بعد' : 'No messages yet'}
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_type === senderType}
              isRTL={isRTL}
              formatTime={formatMessageTime}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3 space-y-2">
        {/* Recording UI */}
        {isRecording && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
            <span className="text-xs text-muted-foreground">
              / {formatTime(MAX_DURATION)}
            </span>
            <div className="flex-1" />
            <Button size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Audio preview */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
            <span className="text-sm">{formatTime(recordingTime)}</span>
            <div className="flex-1" />
            <Button size="sm" variant="outline" onClick={cancelRecording}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={sendVoice} disabled={sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 me-1" />
                  {isRTL ? 'إرسال' : 'Send'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Text input */}
        {!isRecording && !audioBlob && (
          <div className="flex gap-2">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                onClick={handleSendText}
                disabled={!textInput.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              <Button size="icon" variant="outline" onClick={startRecording}>
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Message bubble component
const MessageBubble = ({
  message,
  isOwn,
  isRTL,
  formatTime,
}: {
  message: OrderMessage;
  isOwn: boolean;
  isRTL: boolean;
  formatTime: (date: string) => string;
}) => {
  const isButcher = message.sender_type === 'butcher';

  return (
    <div className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isButcher ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isButcher ? <ChefHat className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2',
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.message_type === 'text' ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          message.storage_path && (
            <VoiceNotePlayer
              storagePath={message.storage_path}
              duration={message.duration_seconds}
              size="sm"
            />
          )
        )}
        <p
          className={cn(
            'text-[10px] mt-1',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
};

export default OrderMessageThread;
