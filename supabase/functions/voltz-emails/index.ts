const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const CRON_SECRET = Deno.env.get("EMAIL_CRON_SECRET") ?? "";
const SITE_URL = "https://jouunyyy.github.io/voltz-aprender-eletricidade/";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/voltz-emails`;
const HAPPY_FAISCA = `${SITE_URL}faisca-mobile.webp`;
const SAD_FAISCA = `${SITE_URL}faisca-saudades.jpg`;

type Preferences = {
  user_id: string;
  email: string;
  display_name: string;
  consent: boolean;
  last_active_at: string;
  feedback_sent_at: string | null;
  reminder_1_sent_at: string | null;
  reminder_2_sent_at: string | null;
  unsubscribe_token: string;
  test_sent_at: string | null;
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

function firstName(value: string) {
  return escapeHtml((value.trim().split(/\s+/)[0] || "Aprendiz").slice(0, 50));
}

function emailShell(options: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  button: string;
  buttonUrl: string;
  image: string;
  imageAlt: string;
  unsubscribeUrl: string;
}) {
  return `<!doctype html>
<html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f3f7fc;color:#10213d;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${options.preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fc;padding:24px 10px"><tr><td align="center">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dce6f3;border-radius:24px;overflow:hidden">
    <tr><td style="background:linear-gradient(135deg,#0a58da,#09275a);padding:24px 30px;color:#fff;font-size:25px;font-weight:800">⚡ Voltz</td></tr>
    <tr><td align="center" style="padding:30px 30px 10px"><img src="${options.image}" width="180" alt="${options.imageAlt}" style="display:block;width:180px;max-width:65%;height:auto;border:0;border-radius:22px"></td></tr>
    <tr><td style="padding:12px 34px 34px">
      <p style="margin:0 0 10px;color:#1268f4;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">${options.eyebrow}</p>
      <h1 style="margin:0 0 18px;font-size:32px;line-height:1.12;color:#10213d">${options.title}</h1>
      <p style="margin:0 0 16px;font-size:17px;line-height:1.55;color:#52637b">${options.intro}</p>
      <div style="font-size:16px;line-height:1.6;color:#34465f">${options.body}</div>
      <p style="margin:28px 0"><a href="${options.buttonUrl}" style="display:inline-block;background:#ffd21f;color:#10213d;text-decoration:none;font-size:16px;font-weight:800;padding:14px 22px;border-radius:13px">${options.button}</a></p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#6b7b91">Até já,<br><strong>A equipa Voltz e a Faísca</strong></p>
    </td></tr>
    <tr><td style="background:#edf4fc;padding:20px 30px;color:#718096;font-size:12px;line-height:1.5">
      Recebeste este email porque autorizaste comunicações de aprendizagem do Voltz.<br>
      <a href="${options.unsubscribeUrl}" style="color:#365e91">Cancelar estes emails</a> · <a href="${SITE_URL}" style="color:#365e91">Abrir Voltz</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function templates(preferences: Preferences, completed: number) {
  const name = firstName(preferences.display_name);
  const nextLevel = Math.min(completed + 1, 50);
  const unsubscribeUrl = `${FUNCTION_URL}/unsubscribe?token=${encodeURIComponent(preferences.unsubscribe_token)}`;
  return {
    feedback: {
      subject: "Já chegaste ao nível 5 — conta-nos como está a correr ⚡",
      html: emailShell({
        preheader: "A tua opinião vai ajudar-nos a melhorar o Voltz.",
        eyebrow: "Marco alcançado · nível 5",
        title: `Muito bem, ${name}!`,
        intro: "Já completaste os primeiros cinco níveis. Antes de continuares, queremos saber se as aulas estão claras e se os desafios te ajudam realmente a aprender.",
        body: "<p style=\"margin:0 0 12px\">Demora menos de dois minutos. Podes dizer-nos o que gostaste, onde tiveste dúvidas e o que devemos melhorar.</p><p style=\"margin:0\"><strong>A tua resposta será lida pela equipa do Voltz.</strong></p>",
        button: "Dar a minha opinião",
        buttonUrl: "mailto:voltz@midiahost.pt?subject=Opini%C3%A3o%20sobre%20o%20Voltz",
        image: HAPPY_FAISCA,
        imageAlt: "Faísca, a mascote do Voltz, a felicitar-te",
        unsubscribeUrl,
      }),
    },
    reminder1: {
      subject: "A Faísca guardou o teu lugar no Voltz ⚡",
      html: emailShell({
        preheader: `A tua próxima aula, o nível ${nextLevel}, está à tua espera.`,
        eyebrow: "Continua quando estiveres pronto",
        title: `${name}, fazemos mais uma aula?`,
        intro: `O teu progresso está guardado. A próxima etapa é o nível ${nextLevel} e podes retomá-la em qualquer dispositivo.`,
        body: "<p style=\"margin:0\">Não precisas de estudar muito tempo: abre o Voltz, revê o conceito e avança ao teu ritmo. A Faísca acompanha-te.</p>",
        button: `Continuar no nível ${nextLevel}`,
        buttonUrl: SITE_URL,
        image: HAPPY_FAISCA,
        imageAlt: "Faísca, a mascote do Voltz, a convidar-te a continuar",
        unsubscribeUrl,
      }),
    },
    reminder2: {
      subject: "Ainda tens lugar no Voltz 💛",
      html: emailShell({
        preheader: "Este é o último lembrete automático da Faísca.",
        eyebrow: "Último lembrete",
        title: `Sentimos a tua falta, ${name}.`,
        intro: `O teu progresso continua guardado e podes voltar ao nível ${nextLevel} quando quiseres.`,
        body: "<p style=\"margin:0 0 12px\">Este é o último lembrete automático. Se não voltares agora, não enviaremos mais mensagens de inatividade.</p><p style=\"margin:0\">Quando tiveres vontade de continuar, a Faísca estará no mesmo lugar.</p>",
        button: "Voltar ao meu percurso",
        buttonUrl: SITE_URL,
        image: SAD_FAISCA,
        imageAlt: "Faísca a acenar com uma expressão saudosa e simpática",
        unsubscribeUrl,
      }),
    },
  };
}

async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase REST ${response.status}: ${await response.text()}`);
  return response;
}

async function sendEmail(to: string, subject: string, html: string, test = false) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: test ? "Voltz Teste <onboarding@resend.dev>" : "Faísca do Voltz <voltz@midiahost.pt>",
      reply_to: "voltz@midiahost.pt",
      to: [to],
      subject,
      html,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Resend ${response.status}: ${JSON.stringify(result)}`);
  return result;
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", Authorization: authorization },
  });
  return response.ok ? await response.json() : null;
}

async function getPreferences(userId: string) {
  const response = await rest(`email_preferences?user_id=eq.${encodeURIComponent(userId)}&select=*`);
  const rows = await response.json() as Preferences[];
  return rows[0] ?? null;
}

async function completedCount(userId: string) {
  const response = await rest(`progress?user_id=eq.${encodeURIComponent(userId)}&select=completed_lessons`);
  const rows = await response.json() as { completed_lessons: string[] }[];
  return (rows[0]?.completed_lessons ?? []).filter((item) => item.startsWith("course-")).length;
}

async function claim(preferences: Preferences, field: "feedback_sent_at" | "reminder_1_sent_at" | "reminder_2_sent_at") {
  const now = new Date().toISOString();
  const response = await rest(`email_preferences?user_id=eq.${preferences.user_id}&${field}=is.null&select=user_id`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ [field]: now, updated_at: now }),
  });
  const rows = await response.json() as { user_id: string }[];
  return rows.length > 0;
}

async function release(preferences: Preferences, field: "feedback_sent_at" | "reminder_1_sent_at" | "reminder_2_sent_at") {
  await rest(`email_preferences?user_id=eq.${preferences.user_id}`, {
    method: "PATCH",
    body: JSON.stringify({ [field]: null, updated_at: new Date().toISOString() }),
  });
}

async function sendClaimed(preferences: Preferences, completed: number, field: "feedback_sent_at" | "reminder_1_sent_at" | "reminder_2_sent_at", template: { subject: string; html: string }) {
  if (!await claim(preferences, field)) return false;
  try {
    await sendEmail(preferences.email, template.subject, template.html);
    return true;
  } catch (error) {
    await release(preferences, field);
    throw error;
  }
}

async function runBatch() {
  const response = await rest("email_preferences?consent=eq.true&select=*");
  const rows = await response.json() as Preferences[];
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const report = { checked: rows.length, feedback: 0, reminder1: 0, reminder2: 0, errors: 0 };

  for (const preferences of rows) {
    try {
      const completed = await completedCount(preferences.user_id);
      const available = templates(preferences, completed);
      if (completed >= 5 && !preferences.feedback_sent_at && await sendClaimed(preferences, completed, "feedback_sent_at", available.feedback)) report.feedback++;
      const inactiveFor = now - new Date(preferences.last_active_at).getTime();
      if (!preferences.reminder_1_sent_at && inactiveFor >= threeDays && await sendClaimed(preferences, completed, "reminder_1_sent_at", available.reminder1)) report.reminder1++;
      const firstReminderAge = preferences.reminder_1_sent_at ? now - new Date(preferences.reminder_1_sent_at).getTime() : 0;
      const didNotReturn = preferences.reminder_1_sent_at && new Date(preferences.last_active_at) <= new Date(preferences.reminder_1_sent_at);
      if (!preferences.reminder_2_sent_at && didNotReturn && firstReminderAge >= sevenDays && await sendClaimed(preferences, completed, "reminder_2_sent_at", available.reminder2)) report.reminder2++;
    } catch (error) {
      report.errors++;
      console.error("Falha ao processar utilizador", preferences.user_id, error);
    }
  }
  return report;
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  try {
    if (request.method === "GET" && url.pathname.endsWith("/health")) {
      return new Response(JSON.stringify({ ready: Boolean(RESEND_API_KEY && CRON_SECRET), resendConfigured: Boolean(RESEND_API_KEY), cronConfigured: Boolean(CRON_SECRET) }), { headers: jsonHeaders });
    }
    if (request.method === "GET" && url.pathname.endsWith("/unsubscribe")) {
      const token = url.searchParams.get("token");
      if (!token) return new Response("Link inválido.", { status: 400 });
      await rest(`email_preferences?unsubscribe_token=eq.${encodeURIComponent(token)}`, {
        method: "PATCH",
        body: JSON.stringify({ consent: false, updated_at: new Date().toISOString() }),
      });
      return new Response("<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'><title>Emails cancelados</title><body style='font-family:Arial;background:#f3f7fc;color:#10213d;text-align:center;padding:50px 20px'><h1>⚡ Emails cancelados</h1><p>Não receberás mais lembretes de aprendizagem do Voltz.</p><a href='https://jouunyyy.github.io/voltz-aprender-eletricidade/'>Voltar ao Voltz</a></body>", { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405, headers: jsonHeaders });
    const body = await request.json().catch(() => ({}));

    if (body.action === "batch") {
      if (!CRON_SECRET || request.headers.get("x-cron-secret") !== CRON_SECRET) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: jsonHeaders });
      return new Response(JSON.stringify(await runBatch()), { headers: jsonHeaders });
    }

    if (body.action === "send-test") {
      const user = await authenticatedUser(request);
      if (!user?.id) return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 401, headers: jsonHeaders });
      const preferences = await getPreferences(user.id);
      if (!preferences || preferences.email.toLowerCase() !== String(user.email ?? "").toLowerCase()) return new Response(JSON.stringify({ error: "Preferências de email ainda não sincronizadas" }), { status: 409, headers: jsonHeaders });
      if (preferences.test_sent_at && Date.now() - new Date(preferences.test_sent_at).getTime() < 10 * 60 * 1000) return new Response(JSON.stringify({ error: "Aguarda 10 minutos antes de repetir o teste" }), { status: 429, headers: jsonHeaders });
      const completed = await completedCount(user.id);
      const available = templates(preferences, completed);
      for (const template of Object.values(available)) await sendEmail(preferences.email, `[TESTE] ${template.subject}`, template.html, true);
      await rest(`email_preferences?user_id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ test_sent_at: new Date().toISOString() }) });
      return new Response(JSON.stringify({ sent: 3, to: preferences.email }), { headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: jsonHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro inesperado" }), { status: 500, headers: jsonHeaders });
  }
});
