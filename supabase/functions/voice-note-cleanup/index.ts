// Voice Note Cleanup Edge Function
// Automatically deletes voice notes older than 30 days
// SECURED: Requires admin authentication

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RETENTION_DAYS = 30;

// Authenticate: accept service role key (internal/cron) or admin user
async function authenticateCaller(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Allow internal calls using service role key
  if (serviceRoleKey && token === serviceRoleKey) return true;

  // Otherwise validate as admin user
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const supabaseService = createClient(supabaseUrl, serviceRoleKey!);
  const { data: roles } = await supabaseService
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin');

  return (roles?.length || 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // AUTHENTICATION CHECK
    const isAuthorized = await authenticateCaller(req);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    console.log(`[voice-cleanup] Starting cleanup for notes older than ${cutoffDate.toISOString()}`);

    const { data: expiredNotes, error: fetchError } = await supabase
      .from('order_voice_notes')
      .select('id, storage_path, created_at')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('[voice-cleanup] Error fetching expired notes:', fetchError);
      throw fetchError;
    }

    if (!expiredNotes || expiredNotes.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No expired voice notes to clean up', deleted_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[voice-cleanup] Found ${expiredNotes.length} expired voice notes`);

    let deletedFiles = 0;
    let deletedRecords = 0;
    const errors: string[] = [];

    for (const note of expiredNotes) {
      try {
        const { error: storageError } = await supabase.storage
          .from('voice-notes')
          .remove([note.storage_path]);

        if (storageError) {
          errors.push(`Storage: ${note.storage_path} - ${storageError.message}`);
        } else {
          deletedFiles++;
        }

        const { error: dbError } = await supabase
          .from('order_voice_notes')
          .delete()
          .eq('id', note.id);

        if (dbError) {
          errors.push(`DB: ${note.id} - ${dbError.message}`);
        } else {
          deletedRecords++;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${note.id}: ${errMsg}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cleanup complete',
        stats: {
          total_expired: expiredNotes.length,
          deleted_files: deletedFiles,
          deleted_records: deletedRecords,
          errors: errors.length,
        },
        retention_days: RETENTION_DAYS,
        cutoff_date: cutoffDate.toISOString(),
        ...(errors.length > 0 && { error_details: errors.slice(0, 10) }),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[voice-cleanup] Fatal error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
