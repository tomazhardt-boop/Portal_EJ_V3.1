// ============================================================================
// /api/ponto-sync — Espelho do Ponto no Google Sheets (PLANO 1.7 / 3.4)
// ----------------------------------------------------------------------------
// Função serverless (Vercel, Node 18+). Espelha horas + engajamento numa
// planilha Google em formato MATRIZ (1 linha por membro; por semana 4 colunas:
// Trabalhadas | Não trabalhadas | Soma | Engajamento).
//
// FONTE DA VERDADE = Supabase (`ponto_weekly`). Esta função RELÊ o valor real
// do banco com a chave service_role e escreve a célula correta. O navegador
// NUNCA manda os números — só dispara a ação (membro + semana). Assim ninguém
// burla a trava semanal escrevendo direto na planilha.
//
// Variáveis de ambiente (na Vercel — NUNCA no Git):
//   GOOGLE_SA_KEY         = JSON da service account (string única)
//   SUPABASE_URL          = URL do projeto Supabase
//   SUPABASE_SERVICE_ROLE = chave service_role (secreta)
//   PONTO_SHEET_ID        = id da planilha-espelho (OBRIGATÓRIO; o destino NÃO
//                           vem do navegador, para ninguém redirecionar o espelho)
//
// A service account precisa apenas que a PLANILHA esteja compartilhada com ela
// como Editor — NÃO precisa de delegação de domínio (ver PLANO 3.4).
// ============================================================================
const crypto = require('crypto');
const { requireUser, callerProfile, isDiretoria, AuthError } = require('./_auth');

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TAB_ATIVOS = 'Membros ativos';
const TAB_EX     = 'Ex-membros';
const FIXED_COLS = 2;     // A = chave (e-mail), B = Membro
const COLS_PER_WEEK = 4;  // Trabalhadas | Não trabalhadas | Soma | Engajamento
const SUBCOLS = ['Trab', 'Não trab', 'Soma', 'Engaj'];

// ----------------------------- utilidades -----------------------------------
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// índice de coluna 1-based → letra(s) A1 (1→A, 27→AA).
function colLetter(n) {
  let s = '';
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

// 'YYYY-MM-DD' (segunda-feira) → rótulo curto da semana, ex.: "Sem 09/06".
function weekLabel(weekStart) {
  const [, m, d] = String(weekStart).split('-');
  return `Sem ${d}/${m}`;
}

// ------------------------ token da service account --------------------------
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: SHEETS_SCOPE,
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
  if (!res.ok) throw new Error('Supabase: ' + (await res.text()));
  return res.json();
}

// -------------------------------- Sheets REST -------------------------------
async function sheetsGetTab(token, sheetId, tab) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Sheets get: ' + (await res.text()));
  return (await res.json()).values || [];
}

async function sheetsBatchUpdate(token, sheetId, data) {
  if (!data.length) return;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ valueInputOption: 'RAW', data }),
    }
  );
  if (!res.ok) throw new Error('Sheets batchUpdate: ' + (await res.text()));
}

// id numérico (gid) de uma aba pelo título — necessário p/ apagar linha.
async function getTabId(token, sheetId, title) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Sheets meta: ' + (await res.text()));
  const j = await res.json();
  const s = (j.sheets || []).find((x) => x.properties && x.properties.title === title);
  return s ? s.properties.sheetId : null;
}

async function deleteRow(token, sheetId, tabTitle, rowIndex0) {
  const gid = await getTabId(token, sheetId, tabTitle);
  if (gid == null) return;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId: gid, dimension: 'ROWS', startIndex: rowIndex0, endIndex: rowIndex0 + 1 },
        },
      }],
    }),
  });
  if (!res.ok) throw new Error('Sheets deleteRow: ' + (await res.text()));
}

// --------------------------- lógica da matriz -------------------------------
// Garante cabeçalhos fixos + a linha do membro numa aba; devolve {grid, rowIndex,
// pushes} já com as escritas pendentes acumuladas em `pushes` (ranges a gravar).
// `grid` é o conteúdo atual da aba (array de linhas); o chamador resolve colunas.
function ensureHeader(grid, pushes, tab) {
  if (!grid[0]) grid[0] = [];
  const need = [];
  if ((grid[0][0] || '') !== 'chave (e-mail)') { grid[0][0] = 'chave (e-mail)'; need.push(0); }
  if ((grid[0][1] || '') !== 'Membro')         { grid[0][1] = 'Membro';         need.push(1); }
  if (need.length) pushes.push({ range: `${tab}!A1:B1`, values: [[grid[0][0], grid[0][1]]] });
}

// Acha (ou cria, escrevendo no fim) a 1ª coluna 0-based do bloco de 4 colunas de
// uma semana, identificada pelo rótulo "Sem dd/mm".
function ensureWeekColsByLabel(grid, pushes, tab, label) {
  const header = grid[0];
  const wanted = `${label} — ${SUBCOLS[0]}`;
  let c0 = header.indexOf(wanted);
  if (c0 === -1) {
    c0 = Math.max(header.length, FIXED_COLS);
    const labels = SUBCOLS.map((s) => `${label} — ${s}`);
    for (let i = 0; i < COLS_PER_WEEK; i++) header[c0 + i] = labels[i];
    pushes.push({
      range: `${tab}!${colLetter(c0 + 1)}1:${colLetter(c0 + COLS_PER_WEEK)}1`,
      values: [labels],
    });
  }
  return c0;
}

// Acha (ou cria, no fim) a linha 0-based do membro pela chave (col A).
function ensureMemberRow(grid, pushes, tab, key, name) {
  for (let r = 1; r < grid.length; r++) {
    if ((grid[r] && grid[r][0]) === key) return r;
  }
  const r = grid.length;
  grid[r] = [key, name];
  pushes.push({ range: `${tab}!A${r + 1}:B${r + 1}`, values: [[key, name]] });
  return r;
}

// chave estável do membro: e-mail (minúsculo) ou, em último caso, o id do banco.
const memberKey = (p) => (p.email ? String(p.email).toLowerCase() : String(p.id));

// ------------------------------ ações ---------------------------------------
// sync: garante a linha do membro; se vier weekStart, escreve as 4 células.
async function actionSync(token, sheetId, profileId, weekStart) {
  const [profile] = await sbSelect(
    `profiles?id=eq.${profileId}&select=id,name,email,status`
  );
  if (!profile) return { ok: false, reason: 'profile não encontrado' };
  const tab = profile.status === 'Inativo' ? TAB_EX : TAB_ATIVOS;
  const grid = await sheetsGetTab(token, sheetId, tab);
  const pushes = [];
  ensureHeader(grid, pushes, tab);
  const rowIndex = ensureMemberRow(grid, pushes, tab, memberKey(profile), profile.name);

  if (weekStart) {
    const [pt] = await sbSelect(
      `ponto_weekly?profile_id=eq.${profileId}&week_start=eq.${weekStart}&select=worked,meetings,engajamento`
    );
    const worked = pt ? Number(pt.worked || 0) : 0;
    const meetings = pt ? Number(pt.meetings || 0) : 0;
    const engaj = pt && pt.engajamento != null ? pt.engajamento : '';
    const c0 = ensureWeekColsByLabel(grid, pushes, tab, weekLabel(weekStart));
    pushes.push({
      range: `${tab}!${colLetter(c0 + 1)}${rowIndex + 1}:${colLetter(c0 + COLS_PER_WEEK)}${rowIndex + 1}`,
      values: [[worked, meetings, worked + meetings, engaj]],
    });
  }
  await sheetsBatchUpdate(token, sheetId, pushes);
  return { ok: true, tab };
}

// move: copia todas as semanas do membro de uma aba p/ outra e apaga a origem.
async function actionMove(token, sheetId, profileId, fromTab, toTab) {
  const [profile] = await sbSelect(`profiles?id=eq.${profileId}&select=id,name,email`);
  if (!profile) return { ok: false, reason: 'profile não encontrado' };
  const key = memberKey(profile);

  const from = await sheetsGetTab(token, sheetId, fromTab);
  const srcRow = from.findIndex((row, r) => r > 0 && (row && row[0]) === key);
  if (srcRow === -1) return { ok: true, moved: false }; // sem dados a mover

  // Reconstrói os pares (semana → 4 valores) a partir do cabeçalho da origem.
  const head = from[0] || [];
  const rowVals = from[srcRow] || [];
  const weeks = {}; // weekLabelBase -> [v0,v1,v2,v3]
  for (let c = FIXED_COLS; c < head.length; c++) {
    const h = String(head[c] || '');
    const m = h.match(/^(Sem \d{2}\/\d{2}) — (.+)$/);
    if (!m) continue;
    const sub = SUBCOLS.indexOf(m[2]);
    if (sub === -1) continue;
    (weeks[m[1]] = weeks[m[1]] || ['', '', '', ''])[sub] = rowVals[c] != null ? rowVals[c] : '';
  }

  // Escreve no destino (cria cabeçalhos/colunas/linha conforme necessário).
  const dest = await sheetsGetTab(token, sheetId, toTab);
  const pushes = [];
  ensureHeader(dest, pushes, toTab);
  const dRow = ensureMemberRow(dest, pushes, toTab, key, profile.name);
  for (const base of Object.keys(weeks)) {
    // base é "Sem dd/mm" → reusa ensureWeekCols via um weekStart sintético.
    const c0 = ensureWeekColsByLabel(dest, pushes, toTab, base);
    pushes.push({
      range: `${toTab}!${colLetter(c0 + 1)}${dRow + 1}:${colLetter(c0 + COLS_PER_WEEK)}${dRow + 1}`,
      values: [weeks[base]],
    });
  }
  await sheetsBatchUpdate(token, sheetId, pushes);
  // Por fim, remove a linha da origem (recarrega p/ pegar o índice atual).
  const fresh = await sheetsGetTab(token, sheetId, fromTab);
  const delRow = fresh.findIndex((row, r) => r > 0 && (row && row[0]) === key);
  if (delRow > 0) await deleteRow(token, sheetId, fromTab, delRow);
  return { ok: true, moved: true };
}

// sync-all: garante uma linha p/ cada membro ATIVO (roster), sem tocar nas horas.
async function actionSyncAll(token, sheetId) {
  const ativos = await sbSelect(`profiles?status=eq.Ativo&select=id,name,email&order=name`);
  const grid = await sheetsGetTab(token, sheetId, TAB_ATIVOS);
  const pushes = [];
  ensureHeader(grid, pushes, TAB_ATIVOS);
  for (const p of ativos) ensureMemberRow(grid, pushes, TAB_ATIVOS, memberKey(p), p.name);
  await sheetsBatchUpdate(token, sheetId, pushes);
  return { ok: true, count: ativos.length };
}

// -------------------------------- handler -----------------------------------
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'método não permitido' }); return; }
  try {
    const user = await requireUser(req);  // só usuário logado (JWT do Supabase); ver api/_auth.js
    const prof = await callerProfile(req, user);   // cargo do chamador (null se auth desligado)
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action, profileId, weekStart } = body;
    // Autorização (só quando o cargo é resolvível): 'sync' = o próprio membro
    // (ou diretoria); 'sync-all'/'move-exmembro'/'restore' = só diretoria — senão
    // qualquer membro poderia mexer na linha de outro na planilha compartilhada.
    if (prof) {
      const diretoria = isDiretoria(prof);
      if (action === 'sync') {
        if (!diretoria && String(prof.id) !== String(profileId)) {
          res.status(403).json({ error: 'sem permissão para sincronizar outro membro' }); return;
        }
      } else if (!diretoria) {
        res.status(403).json({ error: 'ação restrita à diretoria' }); return;
      }
    }
    // Destino vem SÓ da env (confiável). NÃO confiar em body.sheetId: senão um
    // chamador não autenticado redirecionaria o espelho (nomes/e-mails dos
    // membros) para uma planilha dele compartilhada com a service account.
    const sheetId = process.env.PONTO_SHEET_ID;
    if (!sheetId) { res.status(500).json({ error: 'PONTO_SHEET_ID não configurada' }); return; }
    if (!process.env.GOOGLE_SA_KEY) { res.status(500).json({ error: 'GOOGLE_SA_KEY não configurada' }); return; }

    const sa = JSON.parse(process.env.GOOGLE_SA_KEY);
    const token = await getAccessToken(sa);

    let out;
    if (action === 'sync')              out = await actionSync(token, sheetId, profileId, weekStart);
    else if (action === 'move-exmembro') out = await actionMove(token, sheetId, profileId, TAB_ATIVOS, TAB_EX);
    else if (action === 'restore')       out = await actionMove(token, sheetId, profileId, TAB_EX, TAB_ATIVOS);
    else if (action === 'sync-all')      out = await actionSyncAll(token, sheetId);
    else { res.status(400).json({ error: 'ação inválida' }); return; }

    res.status(200).json(out);
  } catch (e) {
    if (e instanceof AuthError) { res.status(e.status).json({ error: e.message }); return; }
    console.error('ponto-sync erro:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
};
