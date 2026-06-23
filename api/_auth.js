// ============================================================================
// api/_auth — validação do chamador dos endpoints /api (item 3 de segurança)
// ----------------------------------------------------------------------------
// Exige que quem chama /api/gerar-documento, /api/ponto-sync e /api/calendar-task
// esteja LOGADO no app: o cliente manda o token de acesso (JWT) da sessão
// Supabase em "Authorization: Bearer <token>"; aqui validamos esse token
// chamando /auth/v1/user do próprio Supabase (não precisa do segredo do JWT,
// e pega tokens revogados/expirados).
//
// Ativação (env vars na Vercel — projeto inteiro):
//   SUPABASE_URL       = URL do projeto Supabase
//   SUPABASE_ANON_KEY  = chave anon (pública; serve de apikey p/ /auth/v1/user)
//                        — na falta dela, usa SUPABASE_SERVICE_ROLE se existir.
//
// FAIL-OPEN ENQUANTO NÃO CONFIGURADO: se SUPABASE_URL/apikey não estiverem nas
// env, a validação fica DESLIGADA e as funções respondem como antes. Assim,
// publicar este código NÃO derruba o que já está no ar (ex.: motor de docs); a
// proteção liga sozinha assim que você define as env na Vercel. Depois de
// configurado, é FAIL-CLOSED: sem token válido → 401.
//
// O arquivo começa com "_": a Vercel não o expõe como rota; os handlers o
// importam com require('./_auth').
// ============================================================================

// Erro com status HTTP, para o handler responder o código certo.
class AuthError extends Error {
  constructor(status, message) { super(message); this.name = 'AuthError'; this.status = status; }
}

function bearerToken(req) {
  const h = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

// Valida a sessão do chamador. Devolve o usuário (objeto do Supabase) quando OK;
// devolve null quando a validação está DESLIGADA (env ausente); lança AuthError
// quando configurado mas o token falta/é inválido.
async function requireUser(req) {
  const url = process.env.SUPABASE_URL;
  const apikey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !apikey) {
    console.warn('[_auth] SUPABASE_URL/SUPABASE_ANON_KEY ausentes — validação de JWT DESLIGADA. Defina-as na Vercel para ativar a proteção dos /api.');
    return null;  // sem regressão no que já está no ar
  }
  const token = bearerToken(req);
  if (!token) throw new AuthError(401, 'não autenticado');

  let res;
  try {
    res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey, Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    throw new AuthError(503, 'falha ao validar a sessão');
  }
  if (!res.ok) throw new AuthError(401, 'sessão inválida ou expirada');
  return res.json();
}

// Cargo do chamador (profiles) para AUTORIZAÇÃO nos endpoints. Lê a própria linha
// com o token do usuário — a policy `p_read` (select liberado a autenticados)
// permite. Devolve { id, role, sector } ou null quando: validação desligada (env
// ausente), sem perfil vinculado, ou falha de leitura. Os handlers só aplicam a
// regra de cargo quando vem não-nulo (defesa em profundidade, sem fail-closed que
// trave usuário legítimo por hipo de infra).
async function callerProfile(req, user) {
  const url = process.env.SUPABASE_URL;
  const apikey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !apikey || !user || !user.id) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/profiles?select=id,role,sector&user_id=eq.${encodeURIComponent(user.id)}`,
      { headers: { apikey, Authorization: `Bearer ${bearerToken(req)}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json().catch(() => []);
    return (Array.isArray(rows) && rows[0]) ? rows[0] : null;
  } catch (e) { return null; }
}

function isDiretoria(p) { return !!p && (p.role === 'Presidente' || p.role === 'Diretor'); }

module.exports = { requireUser, callerProfile, isDiretoria, AuthError };
