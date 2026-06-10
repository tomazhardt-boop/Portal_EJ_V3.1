// Verifica as views projetos_ativos / projetos_concluidos depois de rodar
// supabase/views-projetos.sql no SQL Editor.
//   node supabase/check-views.mjs
import { readFileSync } from 'node:fs';
const SUPABASE_URL = 'https://niawkodrysligvecsfug.supabase.co';
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!KEY) { try { KEY = readFileSync(new URL('./.service-role-key', import.meta.url), 'utf8').trim(); } catch {} }
if (!KEY) { console.error('❌ Faltou a chave service_role.'); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function list(view) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${view}?select=slug,name,status&order=name`, { headers: H });
  if (!r.ok) return { erro: `${r.status} ${await r.text()}` };
  return { rows: await r.json() };
}

for (const v of ['projetos_ativos', 'projetos_concluidos']) {
  const res = await list(v);
  if (res.erro) { console.log(`\n❌ ${v}: ${res.erro}`); continue; }
  console.log(`\n→ ${v} (${res.rows.length}):`);
  res.rows.forEach(p => console.log(`  • ${p.name}  [${p.slug}]  — ${p.status}`));
}
console.log('\n✅ Views verificadas.');
