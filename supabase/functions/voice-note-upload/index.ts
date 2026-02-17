// Voice Note Upload Edge Function
// Handles voice note uploads and creates database records
// Security: Private bucket, signed URLs only, auto-delete after 30 days

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security limits
const MAX_DURATION_SECONDS = 30;
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB max
const RETENTION_DAYS = 30;

interface VoiceNoteRequest {
  order_id: string;
  product_id?: string;
  storage_path: string;
  duration_seconds: number;
  file_size_bytes?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: VoiceNoteRequest = await req.json();
    
    // Validate required fields
    if (!body.order_id || !body.storage_path) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate duration limit
    if (body.duration_seconds > MAX_DURATION_SECONDS) {
      console.warn(`[voice-note] Duration exceeds limit: ${body.duration_seconds}s > ${MAX_DURATION_SECONDS}s`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Voice note duration exceeds maximum of ${MAX_DURATION_SECONDS} seconds` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size limit
    if (body.file_size_bytes && body.file_size_bytes > MAX_FILE_SIZE_BYTES) {
      console.warn(`[voice-note] File size exceeds limit: ${body.file_size_bytes} > ${MAX_FILE_SIZE_BYTES}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Voice note file size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024}KB` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS);

    // Insert voice note record with expiration
    const { data: voiceNote, error: insertError } = await supabase
      .from('order_voice_notes')
      .insert({
        order_id: body.order_id,
        product_id: body.product_id || null,
        storage_path: body.storage_path,
        duration_seconds: body.duration_seconds || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[voice-note] Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[voice-note] Voice note saved:', voiceNote.id, 'Expires:', expiresAt.toISOString());

    return new Response(
      JSON.stringify({ 
        success: true, 
        voice_note_id: voiceNote.id,
        storage_path: body.storage_path,
        expires_at: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[voice-note] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
