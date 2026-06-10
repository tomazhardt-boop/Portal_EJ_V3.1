-- ============================================================================
-- Portal Integre Jr — Seed (Etapa 0.4)
-- ----------------------------------------------------------------------------
-- Popula o banco com os dados que hoje estão hardcoded em script.js.
-- Rode UMA VEZ, depois de aplicar schema.sql.
--   Supabase Dashboard > SQL Editor > cole este arquivo > Run.
--
-- Observações:
--   - Referências entre pessoas (padrinho, líder, responsável, membros de
--     projeto) são resolvidas por NOME via subselect em profiles.
--   - Datas dd/mm/aaaa viram date; eventos do calendário ganham ANO (2026).
--   - O "concluído" das capacitações NÃO é semeado: no protótipo era um estado
--     global; agora é por membro (cap_progress) e começa zerado para todos.
--   - Tabelas com chave natural usam ON CONFLICT DO NOTHING (seguro re-rodar);
--     as demais duplicariam — por isso: rode só uma vez.
-- ============================================================================

-- ============================== PROFILES ====================================
insert into profiles (name, email, role, sector, access, status, course, entry_date, avatar, caps_count, points) values
  ('Carlos Mendes',  'carlos.mendes@integrejr.com.br',  'Presidente','Coordenação','Total',    'Ativo',  'Eng. Controle e Automação','mar/2024','CM',12,0),
  ('Ana Souza',      'ana.souza@integrejr.com.br',      'Diretor',   'Projetos',   'Diretoria','Ativo',  'Eng. de Materiais',        'jan/2024','AS', 9,0),
  ('Pedro Lima',     'pedro.lima@integrejr.com.br',     'Diretor',   'ADM/FIN',    'Diretoria','Ativo',  'Eng. Têxtil',              'jan/2024','PL', 7,0),
  ('Júlia Ferreira', 'julia.ferreira@integrejr.com.br', 'Gerente',   'Comercial',  'Gerência', 'Ativo',  'Eng. Controle e Automação','ago/2024','JF', 6,0),
  ('Lucas Almeida',  'lucas.almeida@integrejr.com.br',  'Gerente',   'Projetos',   'Gerência', 'Ativo',  'Eng. de Materiais',        'ago/2024','LA', 8,0),
  ('Bruna Costa',    'bruna.costa@integrejr.com.br',    'Membro',    'Comercial',  'Membro',   'Ativo',  'Eng. Têxtil',              'fev/2025','BC', 4,0),
  ('Rafael Oliveira','rafael.oliveira@integrejr.com.br','Membro',    'Projetos',   'Membro',   'Ativo',  'Eng. Controle e Automação','fev/2025','RO', 5,0),
  ('Marina Santos',  'marina.santos@integrejr.com.br',  'Trainee',   'Projetos',   'Trainee',  'Ativo',  'Eng. de Materiais',        'mar/2026','MS', 2,850),
  ('Felipe Rocha',   'felipe.rocha@integrejr.com.br',   'Trainee',   'Comercial',  'Trainee',  'Ativo',  'Eng. Controle e Automação','mar/2026','FR', 1,720),
  ('Camila Dias',    'camila.dias@integrejr.com.br',    'Trainee',   'ADM/FIN',    'Trainee',  'Ativo',  'Eng. Têxtil',              'mar/2026','CD', 2,690),
  ('Gustavo Pereira','gustavo.pereira@integrejr.com.br','Trainee',   'Projetos',   'Trainee',  'Ativo',  'Eng. Controle e Automação','mar/2026','GP', 1,540),
  ('Larissa Mota',   'larissa.mota@integrejr.com.br',   'Trainee',   'Comercial',  'Trainee',  'Ativo',  'Eng. de Materiais',        'mar/2026','LM', 1,480),
  ('Henrique Vargas','henrique.vargas@integrejr.com.br','Trainee',   'Comercial',  'Trainee',  'Inativo','Eng. Têxtil',              'mar/2026','HV', 0,410),
  ('Beatriz Lopes',  'beatriz.lopes@integrejr.com.br',  'Trainee',   'Projetos',   'Trainee',  'Ativo',  'Eng. Controle e Automação','mar/2026','BL', 0,340)
on conflict (email) do nothing;

-- padrinhos (resolvidos após todos os profiles existirem)
update profiles t set padrinho_id = p.id from profiles p
where p.name = case t.name
  when 'Marina Santos'   then 'Lucas Almeida'
  when 'Felipe Rocha'    then 'Júlia Ferreira'
  when 'Camila Dias'     then 'Pedro Lima'
  when 'Gustavo Pereira' then 'Bruna Costa'
  when 'Larissa Mota'    then 'Rafael Oliveira'
  when 'Henrique Vargas' then 'Ana Souza'
  when 'Beatriz Lopes'   then 'Carlos Mendes'
end
and t.name in ('Marina Santos','Felipe Rocha','Camila Dias','Gustavo Pereira','Larissa Mota','Henrique Vargas','Beatriz Lopes');

-- ============================== PROJETOS ====================================
insert into projects (slug, name, sector, status, status_class, leader_id, start_date, end_date, description) values
  ('site-vivere','Site Cliente Vivere','Projetos','Em dia','green',(select id from profiles where name='Lucas Almeida'),'2026-04-12','2026-06-30','Desenvolvimento de site institucional para clínica odontológica Vivere, incluindo área de agendamento online.'),
  ('consultoria-cafe-norte','Consultoria - Café Norte','Comercial','Atenção','amber',(select id from profiles where name='Júlia Ferreira'),'2026-03-05','2026-05-30','Reestruturação de presença digital e estratégia de redes sociais para o Café Norte.'),
  ('pesquisa-habitar','Pesquisa Imobiliária Habitar','Projetos','Em dia','green',(select id from profiles where name='Bruna Costa'),'2026-04-20','2026-06-20','Análise quantitativa do mercado imobiliário no centro de Florianópolis.'),
  ('restruturacao-financeira','Reestruturação Financeira Interna','ADM/FIN','Não iniciado','',(select id from profiles where name='Carlos Mendes'),'2026-05-10','2026-07-31','Revisão completa do fluxo de caixa e relatórios mensais.'),
  ('rebrand-estudio-norte','Rebrand - Estúdio Norte','Comercial','Em dia','green',(select id from profiles where name='Rafael Oliveira'),'2026-03-18','2026-05-30','Construção de nova identidade visual e manual de marca para o Estúdio Norte.'),
  ('app-trilhar','App Mobile - Trilhar','Projetos','Em dia','green',(select id from profiles where name='Lucas Almeida'),'2026-04-28','2026-07-31','Aplicativo para empresa de turismo de aventura.')
on conflict (slug) do nothing;

-- membros dos projetos
insert into project_members (project_id, profile_id)
select pr.id, pf.id from (values
  ('site-vivere','Lucas Almeida'),('site-vivere','Rafael Oliveira'),('site-vivere','Marina Santos'),('site-vivere','Júlia Ferreira'),
  ('consultoria-cafe-norte','Júlia Ferreira'),('consultoria-cafe-norte','Bruna Costa'),('consultoria-cafe-norte','Felipe Rocha'),
  ('pesquisa-habitar','Bruna Costa'),('pesquisa-habitar','Gustavo Pereira'),
  ('restruturacao-financeira','Carlos Mendes'),('restruturacao-financeira','Pedro Lima'),('restruturacao-financeira','Camila Dias'),
  ('rebrand-estudio-norte','Rafael Oliveira'),('rebrand-estudio-norte','Larissa Mota'),
  ('app-trilhar','Lucas Almeida'),('app-trilhar','Rafael Oliveira'),('app-trilhar','Marina Santos')
) as m(slug, member)
join projects pr on pr.slug = m.slug
join profiles pf on pf.name = m.member
on conflict do nothing;

-- tarefas (cronograma)
insert into tasks (project_id, name, resp_id, start_date, due_date, done, position)
select pr.id, t.name, pf.id, t.start_date::date, t.due_date::date, t.done, t.position from (values
  ('site-vivere','Aprovar wireframes finais','Lucas Almeida','2026-04-12','2026-04-20',true,0),
  ('site-vivere','Finalizar identidade visual','Júlia Ferreira','2026-04-21','2026-05-15',true,1),
  ('site-vivere','Implementar página inicial','Rafael Oliveira','2026-05-01','2026-05-28',false,2),
  ('site-vivere','Integrar formulário de agendamento','Marina Santos','2026-05-20','2026-06-05',false,3),
  ('site-vivere','Testes em mobile','Rafael Oliveira','2026-06-06','2026-06-15',false,4),
  ('consultoria-cafe-norte','Diagnóstico de presença digital','Júlia Ferreira','2026-03-05','2026-03-20',true,0),
  ('consultoria-cafe-norte','Planejamento de conteúdo','Bruna Costa','2026-03-21','2026-04-15',false,1),
  ('consultoria-cafe-norte','Entrega do relatório final','Júlia Ferreira','2026-05-01','2026-05-30',false,2),
  ('pesquisa-habitar','Coleta de dados primários','Bruna Costa','2026-04-20','2026-05-10',true,0),
  ('pesquisa-habitar','Análise estatística','Gustavo Pereira','2026-05-11','2026-06-05',false,1),
  ('pesquisa-habitar','Relatório final','Bruna Costa','2026-06-06','2026-06-20',false,2),
  ('restruturacao-financeira','Levantamento de dados históricos','Pedro Lima','2026-05-10','2026-05-25',false,0),
  ('restruturacao-financeira','Proposta de novo modelo','Carlos Mendes','2026-05-26','2026-06-15',false,1),
  ('rebrand-estudio-norte','Pesquisa de referências','Larissa Mota','2026-03-18','2026-04-01',true,0),
  ('rebrand-estudio-norte','Criação do manual','Rafael Oliveira','2026-04-02','2026-05-30',false,1),
  ('app-trilhar','Levantamento de requisitos','Lucas Almeida','2026-04-28','2026-05-10',true,0),
  ('app-trilhar','Protótipo de telas','Marina Santos','2026-05-11','2026-06-01',false,1),
  ('app-trilhar','Desenvolvimento MVP','Rafael Oliveira','2026-06-02','2026-07-31',false,2)
) as t(slug, name, resp, start_date, due_date, done, position)
join projects pr on pr.slug = t.slug
left join profiles pf on pf.name = t.resp;

-- ============================== AVISOS ======================================
insert into avisos (title, body, type, color, author_id, author_label, target_sector, created_at) values
  ('Reunião geral antecipada','A reunião geral desta semana foi antecipada para <b>quinta-feira às 19h</b>. Pauta principal: planejamento do 2º semestre.','geral','',(select id from profiles where name='Carlos Mendes'),'Carlos Mendes (Presidente)',null, now()),
  ('Nova capacitação disponível: Gestão de Projetos com Notion','As inscrições estão abertas até o dia 27/05. Vagas limitadas a 12 pessoas.','geral','green',(select id from profiles where name='Ana Souza'),'Ana Souza (Diretora de Projetos)',null, now() - interval '1 day'),
  ('Relatório mensal - lembrete','Entrega dos relatórios mensais de cada gerente até o dia 30.','setorial','amber',(select id from profiles where name='Pedro Lima'),'Pedro Lima (Diretor ADM/FIN)','ADM/FIN', now() - interval '2 days'),
  ('Confraternização semestral confirmada','15/06 às 20h no Espaço Aurora. Confirmar presença até dia 10/06.','geral','',(select id from profiles where name='Júlia Ferreira'),'Júlia Ferreira (Gerente Comercial)',null, now() - interval '3 days');

-- ============================== CALENDÁRIO (ano 2026) =======================
insert into calendar_events (event_date, title, event_time, location, audience, visibility, category, color) values
  ('2026-05-25','Reunião do Conselho','17h','Sede','Diretoria','diretoria','reuniao-interna','gray'),
  ('2026-05-26','Mentoria de Trainees','18h','Sede','Padrinhos + Trainees','trainee','evento',''),
  ('2026-05-28','Reunião Geral','19h','Sede','Todos os membros','geral','reuniao-interna','green'),
  ('2026-05-30','Capacitação: HTML básico','14h','Online','Trainees','trainee','evento','green'),
  ('2026-06-02','Reunião Setor Projetos','18h','Sede','Setor Projetos','setorial','reuniao-interna',''),
  ('2026-06-05','Reunião Setor Comercial','18h','Online','Setor Comercial','setorial','reuniao-interna',''),
  ('2026-06-10','Capacitação: Vendas','14h','Sede','Todos','geral','evento','green'),
  ('2026-06-15','Confraternização semestral','20h','Espaço Aurora','Todos','geral','evento','green');

-- ============================== LEGADO ======================================
insert into legacy_categories (key, label, position) values
  ('presidencia','Presidência',0),
  ('vpresidencia','Vice-presidência',1),
  ('diretoriaProj','Diretoria de Projetos',2),
  ('diretoriaAdm','Diretoria Adm-Financeira',3),
  ('gerenciaMarketing','Gerência de Marketing',4)
on conflict (key) do nothing;

insert into legacy_entries (category_key, autor, texto) values
  ('presidencia','Joana Vieira (2024-2025)','"Aprendi que delegar é mais importante que controlar. Tentei centralizar tudo no primeiro semestre e quase travamos a empresa."'),
  ('presidencia','Rafael Brum (2023-2024)','"Investir em rituais semanais salvou a comunicação. Reuniões soltas não funcionam."'),
  ('diretoriaProj','Marina Cruz (2024-2025)','"O maior erro foi aceitar projetos sem briefing detalhado. Geramos retrabalho e atraso."'),
  ('diretoriaProj','Diego Sales (2023-2024)','"Padronizar templates de proposta comercial foi o que mais economizou tempo no setor."'),
  ('diretoriaAdm','Beatriz Nunes (2024-2025)','"Não confie só na memória do gerente. Tudo deve estar no fluxo de caixa documentado."'),
  ('diretoriaAdm','Lucas Aguiar (2023-2024)','"Mudar de planilha para plataforma estruturada é prioridade. Vivi o caos sem isso."'),
  ('gerenciaMarketing','Pedro Lins (2024-2025)','"Métricas sem narrativa não convencem ninguém. Sempre conte uma história junto."'),
  ('gerenciaMarketing','Helena Faro (2023-2024)','"Conteúdo programado em lotes funciona muito melhor do que postar reativamente."');

-- ============================== RNN / VALORES ===============================
insert into institutional_docs (kind, titulo, body, position) values
  ('rnn','1. Pontualidade','Todo membro deve chegar com 10 minutos de antecedência às reuniões.',0),
  ('rnn','2. Comunicação','Avisos oficiais sempre são feitos pela plataforma. Decisões verbais não têm validade.',1),
  ('rnn','3. Confidencialidade','Informações de clientes nunca são compartilhadas fora da empresa.',2),
  ('rnn','4. Capacitações','Cada membro deve concluir no mínimo 4 capacitações por semestre.',3),
  ('rnn','5. Faltas','Faltas devem ser justificadas com no mínimo 24h de antecedência ao padrinho ou gerente.',4),
  ('rnn','6. Uso da sede','A sede é compartilhada. Cada membro é responsável por organizar seu espaço ao sair.',5),
  ('valor','Integridade','Agimos com transparência e honestidade em todas as relações.',0),
  ('valor','Aprendizado contínuo','Cada projeto é uma oportunidade de evoluir como pessoa e profissional.',1),
  ('valor','Colaboração','Acreditamos no trabalho coletivo entre setores como motor de resultados.',2),
  ('valor','Impacto local','Trabalhamos para fortalecer pequenos e médios negócios da nossa região.',3),
  ('valor','Legado','Deixamos sempre a empresa melhor do que encontramos.',4);

-- ============================== METAS =======================================
insert into metas (key, label, prefixo, sufixo, meta, atual) values
  ('faturamento','Faturamento Mensal','R$','',15000,8500),
  ('colabs','Projetos em Colaboração','',' colabs',3,1),
  ('engajamento','Engajamento dos Membros','','',80,65)
on conflict (key) do nothing;

insert into annual_goals (year, goal_amount) values (2026, 180000)
on conflict (year) do nothing;

-- realizado mês a mês de 2026 (array mensal do protótipo)
insert into monthly_revenue (year, month, realizado) values
  (2026,1,8500),(2026,2,7200),(2026,3,9800),(2026,4,11000),(2026,5,8500),(2026,6,0),
  (2026,7,0),(2026,8,0),(2026,9,0),(2026,10,0),(2026,11,0),(2026,12,0)
on conflict (year, month) do nothing;

-- ============================== ATIVIDADES ==================================
insert into activities (name, description, points, area, mandatory, link) values
  ('Conhecer cada setor (entrevista)','Realize uma entrevista de 15 minutos com um membro de cada setor. Documente os aprendizados e apresente ao padrinho.',50,'Projetos',false,''),
  ('Participar de 1 reunião setorial','Participe de uma reunião do setor ao qual você está vinculado. Leve anotações para apresentar ao padrinho.',30,'ADM/FIN',false,''),
  ('Concluir capacitação básica','Conclua qualquer capacitação da trilha básica disponível na página de Capacitações e envie o certificado ao padrinho.',100,'Projetos',false,''),
  ('Apresentar um projeto antigo','Escolha um projeto do legado da Integre Jr e apresente um resumo de 5 minutos para os membros do seu setor.',80,'Projetos',false,''),
  ('Conversar com um diretor','Agende uma conversa informal de no mínimo 10 minutos com um dos diretores. Registre os principais pontos discutidos.',40,'ADM/FIN',false,''),
  ('Escrever resumo das RNNs','Leia as RNNs e escreva um resumo de 1 página com os principais valores e normas da empresa.',60,'ADM/FIN',false,''),
  ('Participar de 1 projeto como apoio','Contribua ativamente com pelo menos uma entrega em um projeto em andamento.',150,'Projetos',false,''),
  ('Apresentar pitch da Integre Jr','Prepare um pitch de 3 minutos sobre a Integre Jr e apresente para pelo menos 2 pessoas externas.',120,'Comercial',false,''),
  ('Atividade Obrigatória','Atividade fixa do setor Projetos.',0,'Projetos',true,''),
  ('Atividade Obrigatória','Atividade fixa do setor Comercial.',0,'Comercial',true,''),
  ('Atividade Obrigatória','Atividade fixa do setor ADM/FIN.',0,'ADM/FIN',true,''),
  ('Atividade Obrigatória','Atividade fixa do setor Diretoria.',0,'Diretoria',true,'');

-- validações pendentes (trainee -> padrinho)
insert into activity_validations (trainee_id, padrinho_id, activity_id, activity_name, points, status, sent_at)
select tr.id, pad.id, act.id, v.activity_name, v.points, 'pendente', v.sent_at::timestamptz from (values
  ('Marina Santos','Lucas Almeida','Concluir capacitação básica - HTML',100,'2026-05-23'),
  ('Felipe Rocha','Júlia Ferreira','Escrever resumo das RNNs',60,'2026-05-22'),
  ('Beatriz Lopes','Carlos Mendes','Conhecer cada setor (entrevista)',50,'2026-05-25')
) as v(trainee, padrinho, activity_name, points, sent_at)
join profiles tr  on tr.name  = v.trainee
join profiles pad on pad.name = v.padrinho
left join activities act on act.name = v.activity_name;

-- ============================== CAPACITAÇÕES ================================
insert into cap_topics (key, label, emoji, position) values
  ('programacao','Programação','💻',0),
  ('financeiro','Financeiro','💰',1),
  ('marketing','Marketing','📣',2),
  ('administracao','Administração','📋',3),
  ('gerencia','Gerência','🏆',4),
  ('prototipagem','Prototipagem','🔧',5)
on conflict (key) do nothing;

-- trilhas (cada tópico tem as colunas/trilhas que existiam no capTree)
insert into cap_tracks (topic_key, position) values
  ('programacao',0),('programacao',1),
  ('financeiro',0),('financeiro',1),
  ('marketing',0),('marketing',1),
  ('administracao',0),('administracao',1),
  ('gerencia',0),('gerencia',1),
  ('prototipagem',0),('prototipagem',1);

-- capacitações (referenciam a trilha por topic_key + position)
insert into caps (track_id, name, link, position)
select tk.id, c.name, '', c.position from (values
  ('programacao',0,'HTML básico',0),('programacao',0,'CSS básico',1),('programacao',0,'JavaScript',2),('programacao',0,'React',3),
  ('programacao',1,'Sites estáticos',0),('programacao',1,'Sites interativos',1),
  ('financeiro',0,'Excel básico',0),('financeiro',0,'Excel avançado',1),
  ('financeiro',1,'Power BI básico',0),
  ('marketing',0,'Comunicação',0),('marketing',0,'Atendimento ao cliente',1),('marketing',0,'Vendas',2),
  ('administracao',0,'Gestão de tempo',0),('administracao',0,'Gestão de projetos',1),
  ('administracao',1,'Liderança',0),
  ('gerencia',0,'Gestão de Projetos com Notion',0)
) as c(topic_key, track_pos, name, position)
join cap_tracks tk on tk.topic_key = c.topic_key and tk.position = c.track_pos;

-- ============================== DRIVE =======================================
insert into drive_topics (name, icon, link, position) values
  ('Planilhas Financeiras','📊','',0),
  ('Materiais de Capacitações','🎓','',1),
  ('Projetos Antigos','📁','',2),
  ('Templates Internos','📝','',3),
  ('Identidade Visual','🎨','',4),
  ('Documentos Jurídicos','⚖️','',5);

-- FIM DO SEED
