import QRCode from "npm:qrcode@1.5.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const DEFAULT_SITE_URL = "https://jouunyyy.github.io/voltz-aprender-eletricidade/";
const SITE_URL = (Deno.env.get("VOLTZ_PUBLIC_SITE_URL") || DEFAULT_SITE_URL).replace(/\/?$/, "/");
const ALLOWED_ORIGINS = new Set([
  "https://jouunyyy.github.io",
  "https://voltz.midiahost.pt",
]);

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://jouunyyy.github.io",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function serviceHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function serviceFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...serviceHeaders(), ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("certificate service REST error", response.status, body.slice(0, 500));
    throw new Error(`CERT_DB_${response.status}`);
  }
  return response;
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authorization },
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id && !user?.is_anonymous ? user : null;
}

type CertificateRow = {
  id: string;
  user_id: string;
  certificate_code: string;
  display_name: string;
  xp_total: number;
  completed_at: string;
  created_at: string;
  revoked_at: string | null;
  email_sent_at: string | null;
  email_status: string;
};

function validationUrl(code: string) {
  return `${SITE_URL}?certificado=${encodeURIComponent(code)}`;
}

function privateUrl(code: string) {
  return `${SITE_URL}?certificate=${encodeURIComponent(code)}`;
}

function mapCertificate(row: CertificateRow) {
  return {
    id: row.id,
    code: row.certificate_code,
    displayName: row.display_name,
    xpTotal: Number(row.xp_total),
    completedAt: row.completed_at,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
    emailSentAt: row.email_sent_at,
    emailStatus: row.email_status,
    validationUrl: validationUrl(row.certificate_code),
    certificateUrl: privateUrl(row.certificate_code),
  };
}

function utf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function qrDataUrl(url: string) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 164,
    color: { dark: "#06265f", light: "#ffffff" },
  });
  return `data:image/svg+xml;base64,${utf8Base64(svg)}`;
}

async function loadMine(userId: string) {
  const response = await serviceFetch(`certificates?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`);
  const rows = await response.json() as CertificateRow[];
  return rows[0] ?? null;
}

async function sendCertificateEmail(request: Request, certificate: ReturnType<typeof mapCertificate>) {
  if (certificate.emailSentAt || certificate.emailStatus === "sent") return { status: "sent", alreadySent: true };
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/voltz-emails`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: request.headers.get("Authorization") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "send-certificate" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("certificate email request failed", response.status, data?.error || "unknown");
      return { status: "failed", error: "O certificado foi criado, mas o email não foi enviado." };
    }
    return { status: data?.alreadySent ? "sent" : "sent", alreadySent: Boolean(data?.alreadySent) };
  } catch (error) {
    console.error("certificate email request exception", error instanceof Error ? error.message : "unknown");
    return { status: "failed", error: "O certificado foi criado, mas o email não foi enviado." };
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin") ?? "";
  const headers = cors(origin);
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });

  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return reply({ error: "Método não permitido." }, 405);

  try {
    const raw = await request.text();
    if (raw.length > 4000) return reply({ error: "Pedido demasiado grande." }, 413);
    const body = raw ? JSON.parse(raw) : {};
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "validate") {
      const code = String(body.code ?? "").trim().toUpperCase();
      if (!/^VOLTZ-[0-9]{4}-[A-F0-9]{16}$/.test(code)) {
        return reply({ error: "Certificado não encontrado." }, 404);
      }
      const response = await serviceFetch(`certificates?certificate_code=eq.${encodeURIComponent(code)}&select=certificate_code,display_name,completed_at,revoked_at&limit=1`);
      const rows = await response.json() as Pick<CertificateRow, "certificate_code" | "display_name" | "completed_at" | "revoked_at">[];
      const row = rows[0];
      if (!row) return reply({ error: "Certificado não encontrado." }, 404);
      const revoked = Boolean(row.revoked_at);
      return reply({
        valid: !revoked,
        status: revoked ? "revoked" : "valid",
        name: row.display_name,
        course: "Voltz — Aprender Eletricidade",
        completedLevels: 50,
        totalLevels: 50,
        completedAt: row.completed_at,
        code: row.certificate_code,
      });
    }

    const user = await authenticatedUser(request);
    if (!user?.id) return reply({ error: "Inicia sessão para continuar." }, 401);

    if (action === "mine") {
      const row = await loadMine(user.id);
      if (!row) return reply({ certificate: null });
      const certificate = mapCertificate(row);
      return reply({ certificate: { ...certificate, qrDataUrl: await qrDataUrl(certificate.validationUrl) } });
    }

    if (action === "issue") {
      const rpcResponse = await serviceFetch("rpc/voltz_issue_certificate_server", {
        method: "POST",
        body: JSON.stringify({ p_user: user.id }),
      });
      const result = await rpcResponse.json();
      if (result?.error) return reply(result, 409);
      const row = await loadMine(user.id);
      if (!row) throw new Error("CERT_AFTER_ISSUE_NOT_FOUND");
      const certificate = mapCertificate(row);
      const email = await sendCertificateEmail(request, certificate);
      const fresh = await loadMine(user.id);
      const mapped = fresh ? mapCertificate(fresh) : certificate;
      return reply({
        created: Boolean(result?.created),
        certificate: { ...mapped, qrDataUrl: await qrDataUrl(mapped.validationUrl) },
        email,
      });
    }

    return reply({ error: "Ação inválida." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("Voltz certificate request failed", message);
    return reply({ error: "Não foi possível processar o certificado.", code: message.startsWith("CERT_") ? message : "CERT_BACKEND_ERROR" }, 500);
  }
});
