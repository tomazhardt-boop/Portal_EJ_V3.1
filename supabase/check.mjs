// Health-check da conexão com o Supabase: conta linhas das tabelas principais
// e lista os projetos. Roda com a chave service_role (arquivo local).
//   node supabase/check.mjs
import { readFileSync } from 'node:fs';
const SUPABASE_URL = 'https://niawkodrysligvecsfug.supabase.co';
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!KEY) { try { KEY = readFileSync(new URL('./.service-role-key', import.meta.url), 'utf8').trim(); } catch {} }
if (!KEY) { console.error('❌ Faltou a chave service_role.'); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function count(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } });
  if (!r.ok) return `ERRO ${r.status}`;
  const cr = r.headers.get('content-range') || '';   // formato "0-0/<total>"
  return cr.split('/')[1] ?? '?';
}

const tables = ['profiles','projects','project_members','tasks','avisos','calendar_events',
  'metas','annual_goals','monthly_revenue','activities','activity_validations',
  'cap_topics','cap_tracks','caps','legacy_categories','legacy_entries','institutional_docs','drive_topics'];

console.log('→ Testando conexão com', SUPABASE_URL, '\n');
for (const t of tables) console.log(`  ${t.padEnd(22)} ${await count(t)}`);

console.log('\n→ Projetos no banco:');
const projs = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=slug,name,status&order=name`, { headers: H }).then(r => r.json());
projs.forEach(p => console.log(`  • ${p.name}  [${p.slug}]  — ${p.status}`));

console.log('\n✅ Conexão OK.');
