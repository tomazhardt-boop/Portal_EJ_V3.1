// ============================================================================
// /api/gerar-documento — Motor de documentos via Google Docs (saída IDÊNTICA)
// ----------------------------------------------------------------------------
// Gera termo de desligamento / contrato com a MESMA diagramação do modelo
// oficial (logo, linhas gradiente, rodapé, fonte) — porque a saída É o próprio
// Google Doc modelo: copiamos o template, trocamos os {{campos}} por texto e
// exportamos PDF. Nada de recriar o layout à mão.
//
// Fluxo: Drive files.copy (template → cópia na pasta) → Docs batchUpdate
// (replaceAllText nos {{campos}} + preenche a tabela de parcelas) → Drive
// files.export (PDF). A cópia editável fica na pasta; o PDF volta pro download.
//
// Função serverless (Vercel, Node 18+). Usa a MESMA service account do
// ponto-sync/calendar-task — aqui SEM delegação de domínio: basta COMPARTILHAR
// (Editor) o Doc modelo e a pasta de saída com o e-mail da service account.
//
// Variáveis de ambiente (na Vercel — NUNCA no Git):
//   GOOGLE_SA_KEY        = JSON da service account (string única)
//   DOC_DRIVE_FOLDER_ID  = id da pasta de saída (o destino NÃO vem do navegador,
//                          para ninguém redirecionar as cópias geradas)
//
// SETUP (uma vez):
//   1. Ter os modelos como Google Docs com os {{campos}} (já existem).
//   2. Compartilhar cada Doc modelo + a pasta de saída com o e-mail da SA (Editor).
//   3. Colar os Doc IDs em config.js (PLATFORM_CONFIG.documentos) e ligar
//      `engine: true`; pôr o id da pasta em DOC_DRIVE_FOLDER_ID na Vercel.
// ============================================================================
const crypto = require('crypto');

const SCOPE = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive';

// ------------------------ token da service account --------------------------
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key);
  const jwt = `${unsigned}.${b64url(signature)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error('token Google: ' + (await res.text()));
  return (await res.json()).access_token;
}

// ------------------------------- Drive REST ---------------------------------
async function driveCopy(token, templateId, name, folderId) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${templateId}/copy?supportsAllDrives=true`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parents: [folderId] }),
    }
  );
  if (!res.ok) throw new Error('Drive copy: ' + (await res.text()));
  return (await res.json()).id;
}

async function driveExportPdf(token, fileId) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Drive export: ' + (await res.text()));
  return Buffer.from(await res.arrayBuffer()).toString('base64');
}

// -------------------------------- Docs REST ---------------------------------
async function docsGet(token, docId) {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Docs get: ' + (await res.text()));
  return res.json();
}

async function docsBatch(token, docId, requests) {
  if (!requests.length) return;
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) throw new Error('Docs batchUpdate: ' + (await res.text()));
  return res.json();
}

// --------------------------- tabela de parcelas -----------------------------
// Texto concatenado de uma célula (para localizar a tabela pelo cabeçalho).
function cellText(cell) {
  let t = '';
  (cell.content || []).forEach((el) => {
    ((el.paragraph && el.paragraph.elements) || []).forEach((e) => {
      t += (e.textRun && e.textRun.content) || '';
    });
  });
  return t;
}

// Acha a tabela cujo cabeçalho tem "Parcela" e "Vencimento".
function findParcelasTable(doc) {
  for (const el of (doc.body.content || [])) {
    if (!el.table) continue;
    const rows = el.table.tableRows || [];
    if (!rows.length) continue;
    const head = (rows[0].tableCells || []).map(cellText).join(' ').toLowerCase();
    if (head.includes('parcel') && head.includes('vencimento')) {
      return { startIndex: el.startIndex, table: el.table };
    }
  }
  return null;
}

// Preenche a tabela de parcelas. O modelo tem cabeçalho + 1 linha vazia; aqui
// inserimos as linhas extras necessárias e escrevemos as 3 colunas
// (Parcela | Valor | Vencimento). Tolerante a falha: se a tabela não existir,
// apenas registra e segue (o resto do documento já saiu preenchido).
async function fillParcelasTable(token, docId, parcelas) {
  if (!parcelas || !parcelas.length) return;
  let doc = await docsGet(token, docId);
  let found = findParcelasTable(doc);
  if (!found) { console.warn('gerar-documento: tabela de parcelas não encontrada'); return; }

  const bodyRows = (found.table.tableRows || []).length - 1;  // exclui o cabeçalho
  const toInsert = Math.max(0, parcelas.length - bodyRows);
  if (toInsert > 0) {
    const reqs = [];
    for (let i = 0; i < toInsert; i++) {
      // Insere SEMPRE abaixo do cabeçalho (rowIndex 0, que sempre existe). Assim
      // funciona tanto se a tabela vier só com cabeçalho quanto com 1 linha vazia.
      reqs.push({ insertTableRow: {
        tableCellLocation: { tableStartLocation: { index: found.startIndex }, rowIndex: 0, columnIndex: 0 },
        insertBelow: true,
      }});
    }
    await docsBatch(token, docId, reqs);
    doc = await docsGet(token, docId);     // índices mudaram após inserir linhas
    found = findParcelasTable(doc);
    if (!found) return;
  }

  // Escreve as células das linhas de dados (1..N). Em ordem DECRESCENTE de índice
  // para que cada inserção não desloque as posições ainda não escritas.
  const rows = found.table.tableRows || [];
  const inserts = [];
  for (let r = 0; r < parcelas.length; r++) {
    const row = rows[r + 1]; if (!row) continue;
    const cells = row.tableCells || [];
    const vals = [parcelas[r].parcela || '', parcelas[r].valor || '', parcelas[r].vencimento || ''];
    for (let c = 0; c < 3 && c < cells.length; c++) {
      const para = (cells[c].content || []).find((x) => x.paragraph);
      if (para && vals[c]) inserts.push({ index: para.startIndex, text: vals[c] });
    }
  }
  inserts.sort((a, b) => b.index - a.index);
  await docsBatch(token, docId, inserts.map((x) => ({
    insertText: { location: { index: x.index }, text: x.text },
  })));
}

// -------------------------------- handler -----------------------------------
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'método não permitido' }); return; }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { templateId, filename, fields, parcelas } = body;
    // Pasta de saída vem SÓ da env (confiável). NÃO confiar em body.folderId:
    // senão um chamador não autenticado poderia redirecionar as cópias para uma
    // pasta dele (o templateId/folderId ficam no config.js, visível no navegador).
    const folderId = process.env.DOC_DRIVE_FOLDER_ID;
    if (!templateId) { res.status(400).json({ error: 'templateId ausente' }); return; }
    if (!folderId) { res.status(500).json({ error: 'DOC_DRIVE_FOLDER_ID não configurada' }); return; }
    if (!process.env.GOOGLE_SA_KEY) { res.status(500).json({ error: 'GOOGLE_SA_KEY não configurada' }); return; }

    const sa = JSON.parse(process.env.GOOGLE_SA_KEY);
    const token = await getAccessToken(sa);

    const copyId = await driveCopy(token, templateId, filename || 'Documento', folderId);

    // Troca os {{campos}} por texto (campo vazio remove o marcador).
    const reqs = Object.keys(fields || {}).map((k) => ({
      replaceAllText: {
        containsText: { text: `{{${k}}}`, matchCase: true },
        replaceText: String(fields[k] == null ? '' : fields[k]),
      },
    }));
    await docsBatch(token, copyId, reqs);

    await fillParcelasTable(token, copyId, parcelas);

    const pdfBase64 = await driveExportPdf(token, copyId);
    res.status(200).json({
      ok: true,
      docId: copyId,
      docUrl: `https://docs.google.com/document/d/${copyId}/edit`,
      pdfBase64,
    });
  } catch (e) {
    console.error('gerar-documento erro:', e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
};
