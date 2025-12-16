// Supabase Edge Function: webhook-external-notifier
// Valida firma, deduplicación básica y envía notificación por correo (SendGrid HTTP API).
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "dev-secret";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM");
const EMAIL_TO = Deno.env.get("EMAIL_TO");
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

async function sendEmail(subject: string, message: string) {
  if (!SENDGRID_API_KEY || !EMAIL_FROM || !EMAIL_TO) return { delivered: false, reason: "email_not_configured" };

  const url = "https://api.sendgrid.com/v3/mail/send";
  const body = {
    personalizations: [
      {
        to: [{ email: EMAIL_TO }],
        subject,
      },
    ],
    from: { email: EMAIL_FROM },
    content: [{ type: "text/plain", value: message }],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return { delivered: false, reason: `http_${res.status}` };
  return { delivered: true };
}

serve(async (req) => {
  try {
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const idempotencyKey = req.headers.get("x-webhook-idempotency-key") || "";
    const body = await req.text();

    if (!signature || !timestamp) return new Response("Missing signature/timestamp", { status: 400 });
    if (!validateTimestamp(timestamp)) return new Response("Invalid or expired timestamp", { status: 401 });
    const ok = await validateSignature(body, signature, WEBHOOK_SECRET);
    if (!ok) return new Response("Invalid signature", { status: 401 });

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
        await supabase.from("processed_webhooks").insert({ idempotency_key: idempotencyKey, event_id: parsed?.id || null });
      }
    }

    const subject = `Evento ${parsed?.event || "unknown"}`;
    const message = `Evento ${parsed?.event || "unknown"}\nReserva: ${parsed?.data?.reservation_id || "?"}\nSpace: ${parsed?.data?.space_id || "?"}`;
    const emailResult = await sendEmail(subject, message);

    if (supabase) {
      await supabase.from("webhook_deliveries").insert({
        subscription_id: null,
        event_id: parsed?.id || crypto.randomUUID(),
        attempt_number: 1,
        status_code: emailResult.delivered ? 200 : 500,
        status: emailResult.delivered ? "success" : "failed",
        error_message: emailResult.delivered ? null : emailResult.reason,
      });
    }

    const status = emailResult.delivered ? 200 : 500;
    return new Response(JSON.stringify({ delivered: emailResult.delivered, duplicate }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(`Error: ${err?.message || err}`, { status: 500 });
  }
});
