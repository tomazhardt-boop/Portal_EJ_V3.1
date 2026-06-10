// ============================================================================
// Cria os logins (contas de acesso) dos membros no Supabase Auth — roda UMA vez.
// ----------------------------------------------------------------------------
// Para cada perfil da tabela `profiles`, cria um usuário no Supabase Auth com:
//   - senha padrão 'Integre123'
//   - e-mail já confirmado (pode logar de imediato)
//   - metadado must_change_password=true (força trocar a senha no 1º acesso)
// Depois liga profiles.user_id ao id do usuário criado.
//
// Requisitos: Node 18+ (tem fetch nativo). NÃO precisa de npm install.
//
// A chave service_role (SECRETA) é lida de:
//   1) variável de ambiente SUPABASE_SERVICE_ROLE_KEY, ou
//   2) arquivo supabase/.service-role-key (uma linha; está no .gitignore).
//
// Como rodar (no terminal do VS Code, dentro da pasta do projeto):
//   node supabase/create-users.mjs
// ============================================================================
import { readFileSync } from 'node:fs';

const SUPABASE_URL = 'https://niawkodrysligvecsfug.supabase.co';
const DEFAULT_PASSWORD = 'Integre123';

// --- lê a chave service_role ---
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SERVICE_KEY) {
  try { SERVICE_KEY = readFileSync(new URL('./.service-role-key', import.meta.url), 'utf8').trim(); }
  catch { /* arquivo não existe */ }
}
if (!SERVICE_KEY) {
  console.error('\n❌ Faltou a chave service_role.');
  console.error('   Crie o arquivo supabase/.service-role-key com a chave dentro,');
  console.error('   ou rode:  $env:SUPABASE_SERVICE_ROLE_KEY="..."; node supabase/create-users.mjs\n');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function listAuthUsers() {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers });
  if (!r.ok) throw new Error(`Falha ao listar usuários: ${r.status} ${await r.text()}`);
  const j = await r.json();
  const map = new Map();
  (j.users || []).forEach(u => map.set((u.email || '').toLowerCase(), u.id));
  return map;
}

async function listProfiles() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=email,name,user_id`, { headers });
  if (!r.ok) throw new Error(`Falha ao ler profiles: ${r.status} ${await r.text()}`);
  return r.json();
}

async function createUser(email) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST', headers,
    body: JSON.stringify({
      email, password: DEFAULT_PASSWORD, email_confirm: true,
      user_metadata: { must_change_password: true },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || JSON.stringify(j));
  return j.id;
}

async function linkProfile(email, userId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!r.ok) throw new Error(`Falha ao ligar ${email}: ${r.status} ${await r.text()}`);
}

async function main() {
  console.log('→ Lendo perfis e usuários existentes...');
  const [existing, profiles] = [await listAuthUsers(), await listProfiles()];
  let created = 0, reused = 0, linked = 0;

  for (const p of profiles) {
    const email = (p.email || '').toLowerCase();
    if (!email) { console.warn(`  ⚠️  ${p.name} sem e-mail — pulado.`); continue; }
    let id = existing.get(email);
    try {
      if (id) { reused++; }
      else { id = await createUser(email); created++; console.log(`  ✓ criado: ${email}`); }
      await linkProfile(email, id);
      linked++;
    } catch (e) {
      console.error(`  ❌ ${email}: ${e.message}`);
    }
  }
  console.log(`\n✅ Pronto. Criados: ${created} · Já existiam: ${reused} · Vinculados ao perfil: ${linked}`);
  console.log('   Senha padrão de todos: ' + DEFAULT_PASSWORD + ' (trocada no 1º acesso).');
}

main().catch(e => { console.error('\n❌ Erro:', e.message); process.exit(1); });
