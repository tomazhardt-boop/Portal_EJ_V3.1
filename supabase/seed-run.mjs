// ============================================================================
// Popula o banco via API REST do Supabase (equivalente ao seed.sql).
// Usa a chave service_role (lida do arquivo local) — roda no Node, sem npm install.
//   node supabase/seed-run.mjs
// Aborta se a tabela profiles já tiver dados (evita duplicar).
// ============================================================================
import { readFileSync } from 'node:fs';

const SUPABASE_URL = 'https://niawkodrysligvecsfug.supabase.co';
let KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!KEY) { try { KEY = readFileSync(new URL('./.service-role-key', import.meta.url), 'utf8').trim(); } catch {} }
if (!KEY) { console.error('❌ Faltou a chave service_role (supabase/.service-role-key).'); process.exit(1); }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function post(table, rows, ret = false) {
  if (!rows.length) return [];
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...H, Prefer: ret ? 'return=representation' : 'return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`POST ${table}: ${r.status} ${await r.text()}`);
  return ret ? r.json() : [];
}
async function patch(table, query, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${table}: ${r.status} ${await r.text()}`);
}

async function main() {
  // guarda anti-duplicação
  const chk = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id`, { headers: H });
  const existing = await chk.json();
  if (Array.isArray(existing) && existing.length) {
    console.error(`⚠️  profiles já tem ${existing.length} linha(s). Abortei para não duplicar.`);
    console.error('   Se quiser recomeçar do zero, limpe as tabelas antes.');
    process.exit(1);
  }

  // ---- profiles ----
  const profilesData = [
    ['Carlos Mendes','carlos.mendes','Presidente','Coordenação','Total','Ativo','Eng. Controle e Automação','mar/2024','CM',12,0],
    ['Ana Souza','ana.souza','Diretor','Projetos','Diretoria','Ativo','Eng. de Materiais','jan/2024','AS',9,0],
    ['Pedro Lima','pedro.lima','Diretor','ADM/FIN','Diretoria','Ativo','Eng. Têxtil','jan/2024','PL',7,0],
    ['Júlia Ferreira','julia.ferreira','Gerente','Comercial','Gerência','Ativo','Eng. Controle e Automação','ago/2024','JF',6,0],
    ['Lucas Almeida','lucas.almeida','Gerente','Projetos','Gerência','Ativo','Eng. de Materiais','ago/2024','LA',8,0],
    ['Bruna Costa','bruna.costa','Membro','Comercial','Membro','Ativo','Eng. Têxtil','fev/2025','BC',4,0],
    ['Rafael Oliveira','rafael.oliveira','Membro','Projetos','Membro','Ativo','Eng. Controle e Automação','fev/2025','RO',5,0],
    ['Marina Santos','marina.santos','Trainee','Projetos','Trainee','Ativo','Eng. de Materiais','mar/2026','MS',2,850],
    ['Felipe Rocha','felipe.rocha','Trainee','Comercial','Trainee','Ativo','Eng. Controle e Automação','mar/2026','FR',1,720],
    ['Camila Dias','camila.dias','Trainee','ADM/FIN','Trainee','Ativo','Eng. Têxtil','mar/2026','CD',2,690],
    ['Gustavo Pereira','gustavo.pereira','Trainee','Projetos','Trainee','Ativo','Eng. Controle e Automação','mar/2026','GP',1,540],
    ['Larissa Mota','larissa.mota','Trainee','Comercial','Trainee','Ativo','Eng. de Materiais','mar/2026','LM',1,480],
    ['Henrique Vargas','henrique.vargas','Trainee','Comercial','Trainee','Inativo','Eng. Têxtil','mar/2026','HV',0,410],
    ['Beatriz Lopes','beatriz.lopes','Trainee','Projetos','Trainee','Ativo','Eng. Controle e Automação','mar/2026','BL',0,340],
  ].map(([name,u,role,sector,access,status,course,entry_date,avatar,caps_count,points]) => ({
    name, email: `${u}@integrejr.com.br`, role, sector, access, status, course, entry_date, avatar, caps_count, points,
  }));
  const profiles = await post('profiles', profilesData, true);
  const pid = Object.fromEntries(profiles.map(p => [p.name, p.id]));
  console.log(`✓ profiles: ${profiles.length}`);

  // padrinhos
  const padr = { 'Marina Santos':'Lucas Almeida','Felipe Rocha':'Júlia Ferreira','Camila Dias':'Pedro Lima',
    'Gustavo Pereira':'Bruna Costa','Larissa Mota':'Rafael Oliveira','Henrique Vargas':'Ana Souza','Beatriz Lopes':'Carlos Mendes' };
  for (const [t, p] of Object.entries(padr)) await patch('profiles', `id=eq.${pid[t]}`, { padrinho_id: pid[p] });
  console.log('✓ padrinhos vinculados');

  // ---- projects ----
  const projData = [
    ['site-vivere','Site Cliente Vivere','Projetos','Em dia','green','Lucas Almeida','2026-04-12','2026-06-30','Desenvolvimento de site institucional para clínica odontológica Vivere, incluindo área de agendamento online.'],
    ['consultoria-cafe-norte','Consultoria - Café Norte','Comercial','Atenção','amber','Júlia Ferreira','2026-03-05','2026-05-30','Reestruturação de presença digital e estratégia de redes sociais para o Café Norte.'],
    ['pesquisa-habitar','Pesquisa Imobiliária Habitar','Projetos','Em dia','green','Bruna Costa','2026-04-20','2026-06-20','Análise quantitativa do mercado imobiliário no centro de Florianópolis.'],
    ['restruturacao-financeira','Reestruturação Financeira Interna','ADM/FIN','Não iniciado','','Carlos Mendes','2026-05-10','2026-07-31','Revisão completa do fluxo de caixa e relatórios mensais.'],
    ['rebrand-estudio-norte','Rebrand - Estúdio Norte','Comercial','Em dia','green','Rafael Oliveira','2026-03-18','2026-05-30','Construção de nova identidade visual e manual de marca para o Estúdio Norte.'],
    ['app-trilhar','App Mobile - Trilhar','Projetos','Em dia','green','Lucas Almeida','2026-04-28','2026-07-31','Aplicativo para empresa de turismo de aventura.'],
  ].map(([slug,name,sector,status,status_class,leader,start_date,end_date,description]) => ({
    slug, name, sector, status, status_class, leader_id: pid[leader], start_date, end_date, description,
  }));
  const projects = await post('projects', projData, true);
  const prid = Object.fromEntries(projects.map(p => [p.slug, p.id]));
  console.log(`✓ projects: ${projects.length}`);

  // ---- project_members ----
  const pm = [
    ['site-vivere','Lucas Almeida'],['site-vivere','Rafael Oliveira'],['site-vivere','Marina Santos'],['site-vivere','Júlia Ferreira'],
    ['consultoria-cafe-norte','Júlia Ferreira'],['consultoria-cafe-norte','Bruna Costa'],['consultoria-cafe-norte','Felipe Rocha'],
    ['pesquisa-habitar','Bruna Costa'],['pesquisa-habitar','Gustavo Pereira'],
    ['restruturacao-financeira','Carlos Mendes'],['restruturacao-financeira','Pedro Lima'],['restruturacao-financeira','Camila Dias'],
    ['rebrand-estudio-norte','Rafael Oliveira'],['rebrand-estudio-norte','Larissa Mota'],
    ['app-trilhar','Lucas Almeida'],['app-trilhar','Rafael Oliveira'],['app-trilhar','Marina Santos'],
  ].map(([slug,name]) => ({ project_id: prid[slug], profile_id: pid[name] }));
  await post('project_members', pm);
  console.log(`✓ project_members: ${pm.length}`);

  // ---- tasks ----
  const tasks = [
    ['site-vivere','Aprovar wireframes finais','Lucas Almeida','2026-04-12','2026-04-20',true,0],
    ['site-vivere','Finalizar identidade visual','Júlia Ferreira','2026-04-21','2026-05-15',true,1],
    ['site-vivere','Implementar página inicial','Rafael Oliveira','2026-05-01','2026-05-28',false,2],
    ['site-vivere','Integrar formulário de agendamento','Marina Santos','2026-05-20','2026-06-05',false,3],
    ['site-vivere','Testes em mobile','Rafael Oliveira','2026-06-06','2026-06-15',false,4],
    ['consultoria-cafe-norte','Diagnóstico de presença digital','Júlia Ferreira','2026-03-05','2026-03-20',true,0],
    ['consultoria-cafe-norte','Planejamento de conteúdo','Bruna Costa','2026-03-21','2026-04-15',false,1],
    ['consultoria-cafe-norte','Entrega do relatório final','Júlia Ferreira','2026-05-01','2026-05-30',false,2],
    ['pesquisa-habitar','Coleta de dados primários','Bruna Costa','2026-04-20','2026-05-10',true,0],
    ['pesquisa-habitar','Análise estatística','Gustavo Pereira','2026-05-11','2026-06-05',false,1],
    ['pesquisa-habitar','Relatório final','Bruna Costa','2026-06-06','2026-06-20',false,2],
    ['restruturacao-financeira','Levantamento de dados históricos','Pedro Lima','2026-05-10','2026-05-25',false,0],
    ['restruturacao-financeira','Proposta de novo modelo','Carlos Mendes','2026-05-26','2026-06-15',false,1],
    ['rebrand-estudio-norte','Pesquisa de referências','Larissa Mota','2026-03-18','2026-04-01',true,0],
    ['rebrand-estudio-norte','Criação do manual','Rafael Oliveira','2026-04-02','2026-05-30',false,1],
    ['app-trilhar','Levantamento de requisitos','Lucas Almeida','2026-04-28','2026-05-10',true,0],
    ['app-trilhar','Protótipo de telas','Marina Santos','2026-05-11','2026-06-01',false,1],
    ['app-trilhar','Desenvolvimento MVP','Rafael Oliveira','2026-06-02','2026-07-31',false,2],
  ].map(([slug,name,resp,start_date,due_date,done,position]) => ({
    project_id: prid[slug], name, resp_id: pid[resp], start_date, due_date, done, position,
  }));
  await post('tasks', tasks);
  console.log(`✓ tasks: ${tasks.length}`);

  // ---- avisos ----
  const now = Date.now(), day = 86400000;
  const avisos = [
    ['Reunião geral antecipada','A reunião geral desta semana foi antecipada para <b>quinta-feira às 19h</b>. Pauta principal: planejamento do 2º semestre.','geral','','Carlos Mendes','Carlos Mendes (Presidente)',null,0],
    ['Nova capacitação disponível: Gestão de Projetos com Notion','As inscrições estão abertas até o dia 27/05. Vagas limitadas a 12 pessoas.','geral','green','Ana Souza','Ana Souza (Diretora de Projetos)',null,1],
    ['Relatório mensal - lembrete','Entrega dos relatórios mensais de cada gerente até o dia 30.','setorial','amber','Pedro Lima','Pedro Lima (Diretor ADM/FIN)','ADM/FIN',2],
    ['Confraternização semestral confirmada','15/06 às 20h no Espaço Aurora. Confirmar presença até dia 10/06.','geral','','Júlia Ferreira','Júlia Ferreira (Gerente Comercial)',null,3],
  ].map(([title,body,type,color,author,author_label,target_sector,d]) => ({
    title, body, type, color, author_id: pid[author], author_label, target_sector,
    created_at: new Date(now - d*day).toISOString(),
  }));
  await post('avisos', avisos);
  console.log(`✓ avisos: ${avisos.length}`);

  // ---- calendar_events ----
  const events = [
    ['2026-05-25','Reunião do Conselho','17h','Sede','Diretoria','diretoria','reuniao-interna','gray'],
    ['2026-05-26','Mentoria de Trainees','18h','Sede','Padrinhos + Trainees','trainee','evento',''],
    ['2026-05-28','Reunião Geral','19h','Sede','Todos os membros','geral','reuniao-interna','green'],
    ['2026-05-30','Capacitação: HTML básico','14h','Online','Trainees','trainee','evento','green'],
    ['2026-06-02','Reunião Setor Projetos','18h','Sede','Setor Projetos','setorial','reuniao-interna',''],
    ['2026-06-05','Reunião Setor Comercial','18h','Online','Setor Comercial','setorial','reuniao-interna',''],
    ['2026-06-10','Capacitação: Vendas','14h','Sede','Todos','geral','evento','green'],
    ['2026-06-15','Confraternização semestral','20h','Espaço Aurora','Todos','geral','evento','green'],
  ].map(([event_date,title,event_time,location,audience,visibility,category,color]) => ({
    event_date, title, event_time, location, audience, visibility, category, color,
  }));
  await post('calendar_events', events);
  console.log(`✓ calendar_events: ${events.length}`);

  // ---- legado ----
  await post('legacy_categories', [
    { key:'presidencia', label:'Presidência', position:0 },
    { key:'vpresidencia', label:'Vice-presidência', position:1 },
    { key:'diretoriaProj', label:'Diretoria de Projetos', position:2 },
    { key:'diretoriaAdm', label:'Diretoria Adm-Financeira', position:3 },
    { key:'gerenciaMarketing', label:'Gerência de Marketing', position:4 },
  ]);
  await post('legacy_entries', [
    ['presidencia','Joana Vieira (2024-2025)','"Aprendi que delegar é mais importante que controlar. Tentei centralizar tudo no primeiro semestre e quase travamos a empresa."'],
    ['presidencia','Rafael Brum (2023-2024)','"Investir em rituais semanais salvou a comunicação. Reuniões soltas não funcionam."'],
    ['diretoriaProj','Marina Cruz (2024-2025)','"O maior erro foi aceitar projetos sem briefing detalhado. Geramos retrabalho e atraso."'],
    ['diretoriaProj','Diego Sales (2023-2024)','"Padronizar templates de proposta comercial foi o que mais economizou tempo no setor."'],
    ['diretoriaAdm','Beatriz Nunes (2024-2025)','"Não confie só na memória do gerente. Tudo deve estar no fluxo de caixa documentado."'],
    ['diretoriaAdm','Lucas Aguiar (2023-2024)','"Mudar de planilha para plataforma estruturada é prioridade. Vivi o caos sem isso."'],
    ['gerenciaMarketing','Pedro Lins (2024-2025)','"Métricas sem narrativa não convencem ninguém. Sempre conte uma história junto."'],
    ['gerenciaMarketing','Helena Faro (2023-2024)','"Conteúdo programado em lotes funciona muito melhor do que postar reativamente."'],
  ].map(([category_key,autor,texto]) => ({ category_key, autor, texto })));
  console.log('✓ legado');

  // ---- institutional_docs ----
  await post('institutional_docs', [
    ['rnn','1. Pontualidade','Todo membro deve chegar com 10 minutos de antecedência às reuniões.',0],
    ['rnn','2. Comunicação','Avisos oficiais sempre são feitos pela plataforma. Decisões verbais não têm validade.',1],
    ['rnn','3. Confidencialidade','Informações de clientes nunca são compartilhadas fora da empresa.',2],
    ['rnn','4. Capacitações','Cada membro deve concluir no mínimo 4 capacitações por semestre.',3],
    ['rnn','5. Faltas','Faltas devem ser justificadas com no mínimo 24h de antecedência ao padrinho ou gerente.',4],
    ['rnn','6. Uso da sede','A sede é compartilhada. Cada membro é responsável por organizar seu espaço ao sair.',5],
    ['valor','Integridade','Agimos com transparência e honestidade em todas as relações.',0],
    ['valor','Aprendizado contínuo','Cada projeto é uma oportunidade de evoluir como pessoa e profissional.',1],
    ['valor','Colaboração','Acreditamos no trabalho coletivo entre setores como motor de resultados.',2],
    ['valor','Impacto local','Trabalhamos para fortalecer pequenos e médios negócios da nossa região.',3],
    ['valor','Legado','Deixamos sempre a empresa melhor do que encontramos.',4],
  ].map(([kind,titulo,body,position]) => ({ kind, titulo, body, position })));
  console.log('✓ institutional_docs');

  // ---- metas ----
  await post('metas', [
    { key:'faturamento', label:'Faturamento Mensal', prefixo:'R$', sufixo:'', meta:15000, atual:8500 },
    { key:'colabs', label:'Projetos em Colaboração', prefixo:'', sufixo:' colabs', meta:3, atual:1 },
    { key:'engajamento', label:'Engajamento dos Membros', prefixo:'', sufixo:'', meta:80, atual:65 },
  ]);
  await post('annual_goals', [{ year:2026, goal_amount:180000 }]);
  await post('monthly_revenue',
    [8500,7200,9800,11000,8500,0,0,0,0,0,0,0].map((realizado,i) => ({ year:2026, month:i+1, realizado })));
  console.log('✓ metas / annual_goals / monthly_revenue');

  // ---- activities ----
  await post('activities', [
    ['Conhecer cada setor (entrevista)','Realize uma entrevista de 15 minutos com um membro de cada setor. Documente os aprendizados e apresente ao padrinho.',50,'Projetos',false,''],
    ['Participar de 1 reunião setorial','Participe de uma reunião do setor ao qual você está vinculado. Leve anotações para apresentar ao padrinho.',30,'ADM/FIN',false,''],
    ['Concluir capacitação básica','Conclua qualquer capacitação da trilha básica disponível na página de Capacitações e envie o certificado ao padrinho.',100,'Projetos',false,''],
    ['Apresentar um projeto antigo','Escolha um projeto do legado da Integre Jr e apresente um resumo de 5 minutos para os membros do seu setor.',80,'Projetos',false,''],
    ['Conversar com um diretor','Agende uma conversa informal de no mínimo 10 minutos com um dos diretores. Registre os principais pontos discutidos.',40,'ADM/FIN',false,''],
    ['Escrever resumo das RNNs','Leia as RNNs e escreva um resumo de 1 página com os principais valores e normas da empresa.',60,'ADM/FIN',false,''],
    ['Participar de 1 projeto como apoio','Contribua ativamente com pelo menos uma entrega em um projeto em andamento.',150,'Projetos',false,''],
    ['Apresentar pitch da Integre Jr','Prepare um pitch de 3 minutos sobre a Integre Jr e apresente para pelo menos 2 pessoas externas.',120,'Comercial',false,''],
    ['Atividade Obrigatória','Atividade fixa do setor Projetos.',0,'Projetos',true,''],
    ['Atividade Obrigatória','Atividade fixa do setor Comercial.',0,'Comercial',true,''],
    ['Atividade Obrigatória','Atividade fixa do setor ADM/FIN.',0,'ADM/FIN',true,''],
    ['Atividade Obrigatória','Atividade fixa do setor Diretoria.',0,'Diretoria',true,''],
  ].map(([name,description,points,area,mandatory,link]) => ({ name, description, points, area, mandatory, link })));
  const acts = await fetch(`${SUPABASE_URL}/rest/v1/activities?select=id,name`, { headers: H }).then(r => r.json());
  const aid = Object.fromEntries(acts.map(a => [a.name, a.id]));
  console.log('✓ activities: 12');

  // ---- activity_validations ----
  await post('activity_validations', [
    ['Marina Santos','Lucas Almeida','Concluir capacitação básica - HTML',100,'2026-05-23'],
    ['Felipe Rocha','Júlia Ferreira','Escrever resumo das RNNs',60,'2026-05-22'],
    ['Beatriz Lopes','Carlos Mendes','Conhecer cada setor (entrevista)',50,'2026-05-25'],
  ].map(([trainee,padrinho,activity_name,points,sent]) => ({
    trainee_id: pid[trainee], padrinho_id: pid[padrinho], activity_id: aid[activity_name] || null,
    activity_name, points, status:'pendente', sent_at: new Date(sent).toISOString(),
  })));
  console.log('✓ activity_validations: 3');

  // ---- capacitações ----
  await post('cap_topics', [
    ['programacao','Programação','💻',0],['financeiro','Financeiro','💰',1],['marketing','Marketing','📣',2],
    ['administracao','Administração','📋',3],['gerencia','Gerência','🏆',4],['prototipagem','Prototipagem','🔧',5],
  ].map(([key,label,emoji,position]) => ({ key, label, emoji, position })));

  const trackRows = [];
  for (const k of ['programacao','financeiro','marketing','administracao','gerencia','prototipagem'])
    for (const pos of [0,1]) trackRows.push({ topic_key:k, position:pos });
  const tracks = await post('cap_tracks', trackRows, true);
  const tkid = Object.fromEntries(tracks.map(t => [`${t.topic_key}:${t.position}`, t.id]));

  await post('caps', [
    ['programacao',0,'HTML básico',0],['programacao',0,'CSS básico',1],['programacao',0,'JavaScript',2],['programacao',0,'React',3],
    ['programacao',1,'Sites estáticos',0],['programacao',1,'Sites interativos',1],
    ['financeiro',0,'Excel básico',0],['financeiro',0,'Excel avançado',1],
    ['financeiro',1,'Power BI básico',0],
    ['marketing',0,'Comunicação',0],['marketing',0,'Atendimento ao cliente',1],['marketing',0,'Vendas',2],
    ['administracao',0,'Gestão de tempo',0],['administracao',0,'Gestão de projetos',1],
    ['administracao',1,'Liderança',0],
    ['gerencia',0,'Gestão de Projetos com Notion',0],
  ].map(([k,pos,name,position]) => ({ track_id: tkid[`${k}:${pos}`], name, link:'', position })));
  console.log('✓ capacitações (tópicos, trilhas, caps)');

  // ---- drive ----
  await post('drive_topics', [
    ['Planilhas Financeiras','📊',0],['Materiais de Capacitações','🎓',1],['Projetos Antigos','📁',2],
    ['Templates Internos','📝',3],['Identidade Visual','🎨',4],['Documentos Jurídicos','⚖️',5],
  ].map(([name,icon,position]) => ({ name, icon, link:'', position })));
  console.log('✓ drive_topics: 6');

  console.log('\n✅ Seed concluído com sucesso.');
}

main().catch(e => { console.error('\n❌ Erro:', e.message); process.exit(1); });
