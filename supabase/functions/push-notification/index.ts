import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PushPayload {
  userId?: string;
  orderId?: string;
  orderNumber?: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  data?: Record<string, string>;
  topic?: string;
}

// Authenticate: accept service role key (internal calls) or authenticated admin/driver
async function authenticateCaller(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Allow internal calls using service role key
  if (serviceRoleKey && token === serviceRoleKey) return true;

  // Otherwise validate as authenticated user with admin or driver role
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
    .in('role', ['admin', 'driver', 'dispatcher']);

  return (roles?.length || 0) > 0;
}

// Generate JWT for FCM V1 API using Service Account
async function getAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signatureB64}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`OAuth token error: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ success: false, message: 'FIREBASE_SERVICE_ACCOUNT_JSON not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: PushPayload = await req.json();
    const title = payload.titleAr || payload.title;
    const body = payload.bodyAr || payload.body;

    // Get device tokens
    let tokens: string[] = [];
    if (payload.userId) {
      const { data } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', payload.userId)
        .eq('is_active', true);
      tokens = (data || []).map(t => t.token);
    }

    // If targeting a topic
    if (payload.topic) {
      const accessToken = await getAccessToken(serviceAccount);
      const fcmResponse = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              topic: payload.topic,
              notification: { title, body },
              data: { orderId: payload.orderId || '', orderNumber: payload.orderNumber || '', ...payload.data },
              apns: { payload: { aps: { sound: 'default', badge: 1 } } },
              android: { priority: 'high', notification: { sound: 'default', channel_id: 'orders' } },
            },
          }),
        }
      );
      const fcmResult = await fcmResponse.json();
      console.log('FCM topic send result:', fcmResult);
    }

    // Send to individual tokens
    let sentCount = 0;
    let failedTokens: string[] = [];

    if (tokens.length > 0) {
      const accessToken = await getAccessToken(serviceAccount);

      for (const token of tokens) {
        try {
          const fcmResponse = await fetch(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: {
                  token,
                  notification: { title, body },
                  data: { orderId: payload.orderId || '', orderNumber: payload.orderNumber || '', ...payload.data },
                  apns: { payload: { aps: { sound: 'default', badge: 1 } } },
                  android: { priority: 'high', notification: { sound: 'default', channel_id: 'orders' } },
                },
              }),
            }
          );

          if (fcmResponse.ok) {
            sentCount++;
          } else {
            const err = await fcmResponse.json();
            console.error('FCM send error for token:', token, err);
            if (err?.error?.details?.some((d: any) => d.errorCode === 'UNREGISTERED')) {
              failedTokens.push(token);
            }
          }
        } catch (e) {
          console.error('Error sending to token:', token, e);
        }
      }

      // Deactivate invalid tokens
      if (failedTokens.length > 0) {
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .in('token', failedTokens);
      }
    }

    // Store notification record
    if (payload.orderId) {
      await supabase.from('notifications').insert({
        order_id: payload.orderId,
        user_id: payload.userId,
        type: 'push',
        channel: 'fcm',
        content: JSON.stringify({ title, body }),
        sent: sentCount > 0,
        sent_at: sentCount > 0 ? new Date().toISOString() : null,
      });
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total_tokens: tokens.length, failed: failedTokens.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
