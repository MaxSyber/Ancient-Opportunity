import { type SupabaseContext, withSupabase } from "npm:@supabase/server@^1";

type SubmissionType = "job" | "field_school" | "social_listing";

type SubmissionEmailEvent = {
  id: number | string;
  submission_type: SubmissionType;
  submission_id: number | string;
  display_name: string;
  contact_email: string;
  notification_data: Record<string, unknown>;
  delivery_status: "pending" | "sent" | "failed";
  attempt_count: number;
  created_at: string;
};

type InsertWebhookPayload = {
  type: "INSERT";
  table: "submission_email_events";
  schema: "public";
  record: SubmissionEmailEvent;
  old_record: null;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_ERROR_LENGTH = 2_000;

const submissionLabels: Record<SubmissionType, string> = {
  job: "Job",
  field_school: "Field School",
  social_listing: "Social Listing",
};

const handler = async (request: Request, context: SupabaseContext): Promise<Response> => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const webhookSecret = Deno.env.get("SUBMISSION_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("notify-submission is missing its webhook secret.");
    return jsonResponse({ error: "Function configuration is incomplete." }, 500);
  }

  const providedWebhookSecret = request.headers.get("x-submission-webhook-secret");
  if (!providedWebhookSecret || !await secretsMatch(providedWebhookSecret, webhookSecret)) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const notificationTo = Deno.env.get("SUBMISSION_NOTIFICATION_TO");
  const notificationFrom = Deno.env.get("SUBMISSION_NOTIFICATION_FROM");

  if (!resendApiKey || !notificationTo || !notificationFrom) {
    console.error("notify-submission is missing required environment configuration.");
    return jsonResponse({ error: "Function configuration is incomplete." }, 500);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  if (!isSubmissionWebhook(payload)) {
    return jsonResponse({ error: "Invalid submission event." }, 400);
  }

  const event = payload.record;
  const supabase = context.supabaseAdmin;

  const { data: currentEvent, error: readError } = await supabase
    .from("submission_email_events")
    .select("id, delivery_status, attempt_count")
    .eq("id", event.id)
    .maybeSingle();

  if (readError || !currentEvent) {
    console.error("Could not read submission email event:", readError?.message ?? "Event not found.");
    return jsonResponse({ error: "Notification event could not be loaded." }, 500);
  }

  if (currentEvent.delivery_status === "sent") {
    return jsonResponse({ message: "Notification was already sent." });
  }

  const attemptedAt = new Date().toISOString();
  const nextAttemptCount = Number(currentEvent.attempt_count ?? 0) + 1;
  const label = submissionLabels[event.submission_type];
  const subjectName = event.display_name.replace(/[\r\n]+/g, " ").trim();
  const subject = `[Pending ${label}] ${subjectName}`.slice(0, 200);

  let resendResponse: Response;
  try {
    resendResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `submission-notification/${event.id}`,
      },
      body: JSON.stringify({
        from: notificationFrom,
        to: [notificationTo],
        subject,
        html: renderHtmlEmail(event, label),
        text: renderTextEmail(event, label),
      }),
    });
  } catch (error) {
    const message = error instanceof Error
      ? `Could not reach Resend: ${error.message}`
      : "Could not reach Resend.";
    console.error(message);

    const { error: updateError } = await supabase
      .from("submission_email_events")
      .update({
        delivery_status: "failed",
        attempt_count: nextAttemptCount,
        last_attempt_at: attemptedAt,
        last_error: message.slice(0, MAX_ERROR_LENGTH),
      })
      .eq("id", event.id);

    if (updateError) {
      console.error("Could not record notification network failure:", updateError.message);
    }

    return jsonResponse({ error: "Email provider could not be reached." }, 502);
  }

  const resendResult = await readJsonResponse(resendResponse);

  if (!resendResponse.ok) {
    const message = describeResendError(resendResponse.status, resendResult);
    console.error("Resend rejected a submission notification:", message);

    const { error: updateError } = await supabase
      .from("submission_email_events")
      .update({
        delivery_status: "failed",
        attempt_count: nextAttemptCount,
        last_attempt_at: attemptedAt,
        last_error: message.slice(0, MAX_ERROR_LENGTH),
      })
      .eq("id", event.id);

    if (updateError) {
      console.error("Could not record notification failure:", updateError.message);
    }

    return jsonResponse({ error: "Email provider rejected the notification." }, 502);
  }

  const resendEmailId = getResendEmailId(resendResult);
  const { error: updateError } = await supabase
    .from("submission_email_events")
    .update({
      delivery_status: "sent",
      attempt_count: nextAttemptCount,
      resend_email_id: resendEmailId,
      last_attempt_at: attemptedAt,
      last_error: null,
      sent_at: attemptedAt,
    })
    .eq("id", event.id);

  if (updateError) {
    console.error("Email sent, but the notification event could not be updated:", updateError.message);
    return jsonResponse({ error: "Email sent, but delivery status could not be recorded." }, 500);
  }

  return jsonResponse({ message: "Submission notification sent.", email_id: resendEmailId });
};

export default {
  fetch: withSupabase({ auth: "none" }, handler),
};

function isSubmissionWebhook(value: unknown): value is InsertWebhookPayload {
  if (!isRecord(value) || value.type !== "INSERT" || value.schema !== "public") return false;
  if (value.table !== "submission_email_events" || !isRecord(value.record)) return false;

  const event = value.record;
  return isIdentifier(event.id)
    && isIdentifier(event.submission_id)
    && isSubmissionType(event.submission_type)
    && typeof event.display_name === "string"
    && event.display_name.trim().length > 0
    && typeof event.contact_email === "string"
    && isRecord(event.notification_data)
    && (event.delivery_status === "pending" || event.delivery_status === "failed")
    && typeof event.attempt_count === "number"
    && typeof event.created_at === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is number | string {
  return (typeof value === "number" && Number.isSafeInteger(value) && value > 0)
    || (typeof value === "string" && /^\d+$/.test(value));
}

function isSubmissionType(value: unknown): value is SubmissionType {
  return value === "job" || value === "field_school" || value === "social_listing";
}

function renderHtmlEmail(event: SubmissionEmailEvent, label: string): string {
  const details = Object.entries(event.notification_data)
    .slice(0, 20)
    .map(([key, value]) => `
      <tr>
        <th style="padding:8px 12px;text-align:left;vertical-align:top;background:#f5f1e8;border-bottom:1px solid #ddd6c6;">${escapeHtml(humanizeKey(key))}</th>
        <td style="padding:8px 12px;border-bottom:1px solid #ddd6c6;white-space:pre-wrap;">${escapeHtml(formatValue(value))}</td>
      </tr>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f7f4ed;color:#27231f;font-family:Arial,sans-serif;">
    <main style="max-width:680px;margin:0 auto;padding:28px;background:#ffffff;border:1px solid #ddd6c6;border-radius:10px;">
      <p style="margin:0 0 8px;color:#786b58;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Pending ${escapeHtml(label)}</p>
      <h1 style="margin:0 0 24px;font-size:26px;">${escapeHtml(event.display_name)}</h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><th style="padding:8px 12px;text-align:left;background:#f5f1e8;border-bottom:1px solid #ddd6c6;">Submission ID</th><td style="padding:8px 12px;border-bottom:1px solid #ddd6c6;">${escapeHtml(String(event.submission_id))}</td></tr>
        <tr><th style="padding:8px 12px;text-align:left;background:#f5f1e8;border-bottom:1px solid #ddd6c6;">Contact Email</th><td style="padding:8px 12px;border-bottom:1px solid #ddd6c6;">${escapeHtml(event.contact_email)}</td></tr>
        <tr><th style="padding:8px 12px;text-align:left;background:#f5f1e8;border-bottom:1px solid #ddd6c6;">Received</th><td style="padding:8px 12px;border-bottom:1px solid #ddd6c6;">${escapeHtml(event.created_at)}</td></tr>
        ${details}
      </table>
      <p style="margin:0;color:#5f5548;">This submission is awaiting review in Supabase.</p>
    </main>
  </body>
</html>`;
}

function renderTextEmail(event: SubmissionEmailEvent, label: string): string {
  const details = Object.entries(event.notification_data)
    .slice(0, 20)
    .map(([key, value]) => `${humanizeKey(key)}: ${formatValue(value)}`)
    .join("\n");

  return [
    `Pending ${label}: ${event.display_name}`,
    "",
    `Submission ID: ${event.submission_id}`,
    `Contact Email: ${event.contact_email}`,
    `Received: ${event.created_at}`,
    details,
    "",
    "This submission is awaiting review in Supabase.",
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n");
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (Array.isArray(value)) return value.map(formatValue).join(", ").slice(0, 2_000);
  if (isRecord(value)) return JSON.stringify(value).slice(0, 2_000);
  return String(value).slice(0, 2_000);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function describeResendError(status: number, result: unknown): string {
  if (isRecord(result) && typeof result.message === "string") {
    return `Resend ${status}: ${result.message}`;
  }
  return `Resend request failed with status ${status}.`;
}

function getResendEmailId(result: unknown): string | null {
  return isRecord(result) && typeof result.id === "string" ? result.id : null;
}

async function secretsMatch(first: string, second: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [firstDigest, secondDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(first)),
    crypto.subtle.digest("SHA-256", encoder.encode(second)),
  ]);
  const firstBytes = new Uint8Array(firstDigest);
  const secondBytes = new Uint8Array(secondDigest);
  let difference = 0;

  for (let index = 0; index < firstBytes.length; index += 1) {
    difference |= firstBytes[index] ^ secondBytes[index];
  }

  return difference === 0;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
