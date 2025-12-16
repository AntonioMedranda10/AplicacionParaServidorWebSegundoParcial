// Supabase Edge Function: webhook-event-logger
// Valida firma HMAC, anti-replay y registra evento en tabla webhook_events (opcional si SUPABASE_* está configurado).
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "dev-secret";
const MAX_AGE_SECONDS = Number(Deno.env.get("WEBHOOK_MAX_AGE_SECONDS") || 300);

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let res = 0;
  for (let i = 0; i < aBytes.length; i += 1) {
    res |= aBytes[i] ^ bBytes[i];
  }
  return res === 0;
}

async function validateSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const receivedHash = signature.replace("sha256=", "");
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const expectedHash = Array.from(new Uint8Array(signatureBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(receivedHash, expectedHash);
}

function validateTimestamp(timestampHeader?: string | null): boolean {
  if (!timestampHeader) return false;
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestampHeader);
  const age = now - ts;
  if (Number.isNaN(ts)) return false;
  if (age > MAX_AGE_SECONDS) return false;
  if (age < -60) return false;
  return true;
}

serve(async (req) => {
  try {
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const idempotencyKey = req.headers.get("x-webhook-idempotency-key") || "";
    const body = await req.text();

    if (!signature || !timestamp) {
      return new Response("Missing signature/timestamp", { status: 400 });
    }

    if (!validateTimestamp(timestamp)) {
      return new Response("Invalid or expired timestamp", { status: 401 });
    }

    const ok = await validateSignature(body, signature, WEBHOOK_SECRET);
    if (!ok) {
      return new Response("Invalid signature", { status: 401 });
    }

    const parsed = body ? JSON.parse(body) : {};
    let duplicate = false;

    if (supabase && idempotencyKey) {
      const { data: existing } = await supabase
        .from("processed_webhooks")
        .select("id")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existing) {
        duplicate = true;
      } else {
        await supabase.from("processed_webhooks").insert({
          idempotency_key: idempotencyKey,
          event_id: parsed?.id || null,
        });
      }

      await supabase.from("webhook_events").insert({
        event_id: parsed?.id || crypto.randomUUID(),
        event_type: parsed?.event || "unknown",
        idempotency_key: idempotencyKey || parsed?.idempotency_key || crypto.randomUUID(),
        payload: parsed,
        metadata: parsed?.metadata || null,
      });
    }

    return new Response(JSON.stringify({ ok: true, duplicate, event_id: parsed?.id || null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Error: ${err?.message || err}`, { status: 500 });
  }
});
