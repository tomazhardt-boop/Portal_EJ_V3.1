// ============================================================================
// /api/calendar-task — Tarefa de projeto → Google Agenda do RESPONSÁVEL
// ----------------------------------------------------------------------------
// Função serverless (Vercel, Node 18+). Espelha cada tarefa como um evento de
// dia inteiro na agenda PESSOAL do responsável pela tarefa (não de quem cria).
//
// Por que backend (Modelo B) e não OAuth do navegador: o criador não é,
// em geral, o responsável — e o token do navegador só escreve na agenda de quem
// está logado. Para escrever na agenda de OUTRA pessoa usamos uma service
// account com DELEGAÇÃO DE DOMÍNIO (domain-wide delegation), que personifica o
// responsável (claim `sub` = e-mail dele) e grava em sua agenda 'primary'.
//
// FONTE DA VERDADE = Supabase (`tasks`). Esta função RELÊ a tarefa real com a
// chave service_role e monta o evento; o navegador só dispara a ação (taskId) —
// nenhum dado sensível trafega por ele e ninguém forja eventos. O id do evento
// volta para `tasks.google_event_id` (escrito aqui, via service_role).
//
// Variáveis de ambiente (na Vercel — NUNCA no Git):
//   GOOGLE_SA_KEY         = JSON da service account (string única)
//   SUPABASE_URL          = URL do projeto Supabase
//   SUPABASE_SERVICE_ROLE = chave service_role (secreta)
//
// SETUP (uma vez, precisa de SUPER-ADMIN do Workspace):
//   1. Service account no mesmo projeto Google Cloud da EJ; criar uma chave JSON.
//   2. Habilitar "Domain-wide delegation" na service account.
//   3. No Admin do Workspace > Segurança > Controles de API > Delegação em todo
//      o domínio: autorizar o Client ID da SA com o escopo
//      https://www.googleapis.com/auth/calendar.events
//   4. Colar o JSON em GOOGLE_SA_KEY (Vercel) e ligar `taskCalendar: true` no
//      config.js. (A MESMA service account do ponto-sync pode ser reusada; ela
//      só precisa GANHAR a delegação acima — o ponto-sync não usa delegação.)
// ============================================================================
const crypto = require('crypto');

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

// ----------------------------- utilidades -----------------------------------
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// 'YYYY-MM-DD' + n dias → 'YYYY-MM-DD' (em UTC, sem fuso, pois é dia inteiro).
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ------------------------ token da service account --------------------------
// `subject` = e-mail a personificar (delegação de domínio). Sem ele, o token é
// da própria service account (que não tem agenda — por isso aqui é obrigatório).
async function getAccessToken(sa, subject) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    sub: subject,
    scope: CALENDAR_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key);
  const jwt = `${unsigned}.${b64url(signature)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error('token Google: ' + (await res.text()));
  return (await res.json()).access_token;
}

// ------------------------------ Supabase REST -------------------------------
async function sbSelect(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
    },
  });
  if (!res.ok) throw new Error('Supabase select: ' + (await res.text()));
  return res.json();
}

async function sbPatch(path, body) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Supabase patch: ' + (await res.text()));
}

// ----------------------------- Calendar REST --------------------------------
const CAL_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Monta o corpo do evento: dia inteiro, do start_date (ou due_date) até due_date.
// `end.date` é EXCLUSIVO no Google → soma 1 dia. Tarefa concluída ganha "✓".
function buildTaskEventBody(task, projectName) {
  const startD = task.start_date || task.due_date;
  const endD   = task.due_date || task.start_date;
  const summary = `${task.done ? '✓ ' : ''}${task.name}`;
  const proj = projectName ? `Tarefa do projeto "${projectName}". ` : '';
  return {
    summary,
    description: `${proj}${task.description ? task.description + '\n\n' : ''}Espelhado pela plataforma Portal EJ.`,
    start: { date: startD },
    end:   { date: addDays(endD, 1) },
  };
}

// ------------------------------ ações ---------------------------------------
// upsert: cria (ou atualiza) o evento na agenda do responsável e guarda o id.
async function actionUpsert(sa, taskId) {
  const [task] = await sbSelect(
    `tasks?id=eq.${taskId}&select=id,name,description,start_date,due_date,done,google_event_id,project_id,resp_id`
  );
  if (!task) return { ok: false, reason: 'tarefa não encontrada' };
  if (!task.resp_id) return { ok: true, skipped: 'sem responsável' };
  if (!task.start_date && !task.due_date) return { ok: true, skipped: 'sem data' };

  const [resp] = await sbSelect(`profiles?id=eq.${task.resp_id}&select=email,name`);
  if (!resp || !resp.email) return { ok: true, skipped: 'responsável sem e-mail' };

  const [project] = task.project_id
    ? await sbSelect(`projects?id=eq.${task.project_id}&select=name`)
    : [];

  const token = await getAccessToken(sa, resp.email);
  const body = buildTaskEventBody(task, project && project.name);
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  let eventId = task.google_event_id;

  // Se já existe um evento, tenta atualizar. 404/410 = sumiu (ou o responsável
  // mudou e o id é de outra agenda) → cai para criação de um novo.
  if (eventId) {
    const r = await fetch(`${CAL_BASE}/${encodeURIComponent(eventId)}`, {
      method: 'PATCH', headers: auth, body: JSON.stringify(body),
    });
    if (r.ok) return { ok: true, eventId, updated: true };
    if (r.status !== 404 && r.status !== 410) throw new Error('Calendar PATCH: ' + (await r.text()));
    eventId = null;
  }

  const r = await fetch(CAL_BASE, { method: 'POST', headers: auth, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('Calendar POST: ' + (await r.text()));
  const j = await r.json();
  await sbPatch(`tasks?id=eq.${taskId}`, { google_event_id: j.id });
  return { ok: true, eventId: j.id, created: true };
}

// delete: apaga o evento da agenda do responsável (lê a linha ANTES de o
// navegador remover a tarefa do banco). Idempotente: 404/410 contam como ok.
async function actionDelete(sa, taskId) {
  const [task] = await sbSelect(`tasks?id=eq.${taskId}&select=google_event_id,resp_id`);
  if (!task || !task.google_event_id || !task.resp_id) return { ok: true, skipped: true };
  const [resp] = await sbSelect(`profiles?id=eq.${task.resp_id}&select=email`);
  if (!resp || !resp.email) return { ok: true, skipped: true };

  const token = await getAccessToken(sa, resp.email);
  const r = await fetch(`${CAL_BASE}/${encodeURIComponent(task.google_event_id)}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok && r.status !== 404 && r.status !== 410) throw new Error('Calendar DELETE: ' + (await r.text()));
  return { ok: true };
}

// -------------------------------- handler -----------------------------------
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'método não permitido' }); return; }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action, taskId } = body;
    if (!taskId) { res.status(400).json({ error: 'taskId ausente' }); return; }
    if (!process.env.GOOGLE_SA_KEY) { res.status(500).json({ error: 'GOOGLE_SA_KEY não configurada' }); return; }

    const sa = JSON.parse(process.env.GOOGLE_SA_KEY);

    let out;
    if (action === 'upsert')      out = await actionUpsert(sa, taskId);
    else if (action === 'delete') out = await actionDelete(sa, taskId);
    else { res.status(400).json({ error: 'ação inválida' }); return; }

    res.status(200).json(out);
  } catch (e) {
    console.error('calendar-task erro:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
};
