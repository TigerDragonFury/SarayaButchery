import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Security limits - must match edge function
const MAX_DURATION_SECONDS = 30;
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB max

interface VoiceNoteUploadResult {
  success: boolean;
  storagePath?: string;
  error?: string;
}

interface UseVoiceNoteReturn {
  uploadVoiceNote: (
    audioBlob: Blob,
    orderId: string,
    productId?: string,
    durationSeconds?: number
  ) => Promise<VoiceNoteUploadResult>;
  getVoiceNoteUrl: (storagePath: string) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
  maxDuration: number;
  maxSizeBytes: number;
}

export const useVoiceNote = (): UseVoiceNoteReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVoiceNote = async (
    audioBlob: Blob,
    orderId: string,
    productId?: string,
    durationSeconds?: number
  ): Promise<VoiceNoteUploadResult> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file size on client side
      if (audioBlob.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024}KB`);
      }

      // Validate duration on client side
      if (durationSeconds && durationSeconds > MAX_DURATION_SECONDS) {
        throw new Error(`Duration exceeds maximum of ${MAX_DURATION_SECONDS} seconds`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                       audioBlob.type.includes('mp3') || audioBlob.type.includes('mpeg') ? 'mp3' :
                       audioBlob.type.includes('ogg') ? 'ogg' : 'wav';
      
      const fileName = productId 
        ? `${orderId}/${productId}-${timestamp}.${extension}`
        : `${orderId}/order-note-${timestamp}.${extension}`;

      // Upload to Supabase Storage (private bucket)
      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Voice note upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      return {
        success: true,
        storagePath: fileName,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  const getVoiceNoteUrl = async (storagePath: string): Promise<string | null> => {
    try {
      // Create a signed URL that expires in 1 hour (private bucket access)
      const { data, error } = await supabase.storage
        .from('voice-notes')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error getting signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Error getting voice note URL:', err);
      return null;
    }
  };

  return {
    uploadVoiceNote,
    getVoiceNoteUrl,
    isUploading,
    error,
    maxDuration: MAX_DURATION_SECONDS,
    maxSizeBytes: MAX_FILE_SIZE_BYTES,
  };
};

export default useVoiceNote;
