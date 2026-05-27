// ============== CONFIG ==============
const DEFAULT_PAGE = 'dashboard';

const pageInitializers = {
  'dashboard':       renderDashboard,
  'permissoes':      renderPermissions,
  'trainees':        renderTrainees,
  'avisos':          renderAvisos,
  'projetos':        renderProjects,
  'projeto-detalhe': renderProjectDetail,
  'calendario':      renderCalendario,
  'perfil':          renderPerfil,
  'legado':          renderLegado,
  'rnn':             renderRNN,
  'metas':           renderMetas,
  'capacitacoes':    renderCapacitacoes,
};

// ============== CAPACITAÇÕES CADASTRADAS ==============
const capacitacoes = [
  'HTML básico','CSS básico','JavaScript','React','Sites estáticos','Sites interativos',
  'Comunicação','Atendimento ao cliente','Vendas','Gestão de tempo','Gestão de projetos',
  'Liderança','Excel básico','Excel avançado','Power BI básico','Gestão de Projetos com Notion',
];

// ============== USUÁRIO ATUAL ==============
const currentUser = {
  name: 'Carlos Mendes', role: 'Presidente', sector: 'Coordenação',
  email: 'carlos.mendes@integrejr.com.br', entryDate: 'mar/2024',
  course: 'Engenharia de Controle e Automação',
  caps: ['HTML básico','CSS básico','JavaScript','Sites interativos','Comunicação',
         'Atendimento ao cliente','Vendas','Gestão de tempo','Gestão de projetos',
         'Liderança','Excel básico','Excel avançado'],
  avatar: 'CM', photo: null,
};

// ============== MEMBROS ==============
const members = [
  { name:'Carlos Mendes',   role:'Presidente',sector:'Coordenação',access:'Total',    status:'Ativo',  self:true,  course:'Eng. Controle e Automação',entryDate:'mar/2024',capsCount:12 },
  { name:'Ana Souza',       role:'Diretor',   sector:'Projetos',  access:'Diretoria',status:'Ativo',              course:'Eng. de Materiais',         entryDate:'jan/2024',capsCount:9  },
  { name:'Pedro Lima',      role:'Diretor',   sector:'ADM/FIN',   access:'Diretoria',status:'Ativo',              course:'Eng. Têxtil',               entryDate:'jan/2024',capsCount:7  },
  { name:'Júlia Ferreira',  role:'Gerente',   sector:'Comercial', access:'Gerência', status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'ago/2024',capsCount:6  },
  { name:'Lucas Almeida',   role:'Gerente',   sector:'Projetos',  access:'Gerência', status:'Ativo',              course:'Eng. de Materiais',         entryDate:'ago/2024',capsCount:8  },
  { name:'Bruna Costa',     role:'Membro',    sector:'Comercial', access:'Membro',   status:'Ativo',              course:'Eng. Têxtil',               entryDate:'fev/2025',capsCount:4  },
  { name:'Rafael Oliveira', role:'Membro',    sector:'Projetos',  access:'Membro',   status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'fev/2025',capsCount:5  },
  { name:'Marina Santos',   role:'Trainee',   sector:'Projetos',  access:'Trainee',  status:'Ativo',              course:'Eng. de Materiais',         entryDate:'mar/2026',capsCount:2  },
  { name:'Felipe Rocha',    role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'mar/2026',capsCount:1  },
  { name:'Camila Dias',     role:'Trainee',   sector:'ADM/FIN',   access:'Trainee',  status:'Ativo',              course:'Eng. Têxtil',               entryDate:'mar/2026',capsCount:2  },
  { name:'Gustavo Pereira', role:'Trainee',   sector:'Projetos',  access:'Trainee',  status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'mar/2026',capsCount:1  },
  { name:'Larissa Mota',    role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Ativo',              course:'Eng. de Materiais',         entryDate:'mar/2026',capsCount:1  },
  { name:'Henrique Vargas', role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Inativo',            course:'Eng. Têxtil',               entryDate:'mar/2026',capsCount:0  },
];

// ============== TRAINEES ==============
const trainees = [
  { name:'Marina Santos',   padrinho:'Lucas Almeida',   points:850 },
  { name:'Felipe Rocha',    padrinho:'Júlia Ferreira',  points:720 },
  { name:'Camila Dias',     padrinho:'Pedro Lima',      points:690 },
  { name:'Gustavo Pereira', padrinho:'Bruna Costa',     points:540 },
  { name:'Larissa Mota',    padrinho:'Rafael Oliveira', points:480 },
  { name:'Henrique Vargas', padrinho:'Ana Souza',       points:410 },
  { name:'Beatriz Lopes',   padrinho:'Carlos Mendes',   points:340 },
];

let pendingValidations = [
  { trainee:'Marina Santos', activity:'Concluir capacitação básica - HTML', points:100, padrinho:'Lucas Almeida',  sent:'23/05/2026' },
  { trainee:'Felipe Rocha',  activity:'Escrever resumo das RNNs',           points:60,  padrinho:'Júlia Ferreira', sent:'22/05/2026' },
  { trainee:'Beatriz Lopes', activity:'Conhecer cada setor (entrevista)',   points:50,  padrinho:'Carlos Mendes',  sent:'25/05/2026' },
];

// ============== ATIVIDADES ==============
let activities = [
  { id:1, name:'Conhecer cada setor (entrevista)',   points:50,  desc:'Realize uma entrevista de 15 minutos com um membro de cada setor. Documente os aprendizados e apresente ao padrinho.' },
  { id:2, name:'Participar de 1 reunião setorial',   points:30,  desc:'Participe de uma reunião do setor ao qual você está vinculado. Leve anotações para apresentar ao padrinho.' },
  { id:3, name:'Concluir capacitação básica',        points:100, desc:'Conclua qualquer capacitação da trilha básica disponível na página de Capacitações e envie o certificado ao padrinho.' },
  { id:4, name:'Apresentar um projeto antigo',       points:80,  desc:'Escolha um projeto do legado da Integre Jr e apresente um resumo de 5 minutos para os membros do seu setor.' },
  { id:5, name:'Conversar com um diretor',           points:40,  desc:'Agende uma conversa informal de no mínimo 10 minutos com um dos diretores. Registre os principais pontos discutidos.' },
  { id:6, name:'Escrever resumo das RNNs',           points:60,  desc:'Leia as RNNs e escreva um resumo de 1 página com os principais valores e normas da empresa.' },
  { id:7, name:'Participar de 1 projeto como apoio', points:150, desc:'Contribua ativamente com pelo menos uma entrega em um projeto em andamento.' },
  { id:8, name:'Apresentar pitch da Integre Jr',     points:120, desc:'Prepare um pitch de 3 minutos sobre a Integre Jr e apresente para pelo menos 2 pessoas externas.' },
];
let activityIdCounter = 9;
let expandedActivityId = null;

// ============== AVISOS ==============
let avisos = [
  { id:1, title:'Reunião geral antecipada', type:'geral', body:'A reunião geral desta semana foi antecipada para <b>quinta-feira às 19h</b>. Pauta principal: planejamento do 2º semestre.', author:'Carlos Mendes (Presidente)', time:'Hoje · 09:14', color:'', expiry:null },
  { id:2, title:'Nova capacitação disponível: Gestão de Projetos com Notion', type:'geral', body:'As inscrições estão abertas até o dia 27/05. Vagas limitadas a 12 pessoas.', author:'Ana Souza (Diretora de Projetos)', time:'Ontem', color:'green', expiry:null },
  { id:3, title:'Relatório mensal - lembrete', type:'setorial', body:'Entrega dos relatórios mensais de cada gerente até o dia 30.', author:'Pedro Lima (Diretor ADM/FIN)', time:'2 dias atrás', color:'amber', expiry:null },
  { id:4, title:'Confraternização semestral confirmada', type:'geral', body:'15/06 às 20h no Espaço Aurora. Confirmar presença até dia 10/06.', author:'Júlia Ferreira (Gerente Comercial)', time:'3 dias atrás', color:'', expiry:null },
];
let avisoIdCounter = 5;
let activeAvisoFilter = 'todos';

// ============== CALENDÁRIO ==============
let calendarEvents = [
  { day:'25',month:'Mai',title:'Reunião do Conselho',       meta:'17h · Sede · Diretoria',           visibility:'diretoria',cls:'gray', category:'reuniao-interna' },
  { day:'26',month:'Mai',title:'Mentoria de Trainees',      meta:'18h · Sede · Padrinhos + Trainees', visibility:'trainee',  cls:'',     category:'evento'          },
  { day:'28',month:'Mai',title:'Reunião Geral',             meta:'19h · Sede · Todos os membros',     visibility:'geral',    cls:'green',category:'reuniao-interna' },
  { day:'30',month:'Mai',title:'Capacitação: HTML básico',  meta:'14h · Online · Trainees',           visibility:'trainee',  cls:'green',category:'evento'          },
  { day:'02',month:'Jun',title:'Reunião Setor Projetos',    meta:'18h · Sede · Setor Projetos',       visibility:'setorial', cls:'',     category:'reuniao-interna' },
  { day:'05',month:'Jun',title:'Reunião Setor Comercial',   meta:'18h · Online · Setor Comercial',    visibility:'setorial', cls:'',     category:'reuniao-interna' },
  { day:'10',month:'Jun',title:'Capacitação: Vendas',       meta:'14h · Sede · Todos',                visibility:'geral',    cls:'green',category:'evento'          },
  { day:'15',month:'Jun',title:'Confraternização semestral',meta:'20h · Espaço Aurora · Todos',       visibility:'geral',    cls:'green',category:'evento'          },
];

// ============== PROJETOS ==============
let projects = [
  { id:'site-vivere',name:'Site Cliente Vivere',sector:'Projetos',status:'Em dia',statusClass:'green',leader:'Lucas Almeida',start:'12/04/2026',end:'30/06/2026',desc:'Desenvolvimento de site institucional para clínica odontológica Vivere, incluindo área de agendamento online.',memberNames:['Lucas Almeida','Rafael Oliveira','Marina Santos','Júlia Ferreira'],tasks:[{done:true,name:'Aprovar wireframes finais',resp:'Lucas Almeida',due:'20/04/2026',startISO:'2026-04-12'},{done:true,name:'Finalizar identidade visual',resp:'Júlia Ferreira',due:'15/05/2026',startISO:'2026-04-21'},{done:false,name:'Implementar página inicial',resp:'Rafael Oliveira',due:'28/05/2026',startISO:'2026-05-01'},{done:false,name:'Integrar formulário de agendamento',resp:'Marina Santos',due:'05/06/2026',startISO:'2026-05-20'},{done:false,name:'Testes em mobile',resp:'Rafael Oliveira',due:'15/06/2026',startISO:'2026-06-06'}],concluded:false },
  { id:'consultoria-cafe-norte',name:'Consultoria - Café Norte',sector:'Comercial',status:'Atenção',statusClass:'amber',leader:'Júlia Ferreira',start:'05/03/2026',end:'30/05/2026',desc:'Reestruturação de presença digital e estratégia de redes sociais para o Café Norte.',memberNames:['Júlia Ferreira','Bruna Costa','Felipe Rocha'],tasks:[{done:true,name:'Diagnóstico de presença digital',resp:'Júlia Ferreira',due:'20/03/2026',startISO:'2026-03-05'},{done:false,name:'Planejamento de conteúdo',resp:'Bruna Costa',due:'15/04/2026',startISO:'2026-03-21'},{done:false,name:'Entrega do relatório final',resp:'Júlia Ferreira',due:'30/05/2026',startISO:'2026-05-01'}],concluded:false },
  { id:'pesquisa-habitar',name:'Pesquisa Imobiliária Habitar',sector:'Projetos',status:'Em dia',statusClass:'green',leader:'Bruna Costa',start:'20/04/2026',end:'20/06/2026',desc:'Análise quantitativa do mercado imobiliário no centro de Florianópolis.',memberNames:['Bruna Costa','Gustavo Pereira'],tasks:[{done:true,name:'Coleta de dados primários',resp:'Bruna Costa',due:'10/05/2026',startISO:'2026-04-20'},{done:false,name:'Análise estatística',resp:'Gustavo Pereira',due:'05/06/2026',startISO:'2026-05-11'},{done:false,name:'Relatório final',resp:'Bruna Costa',due:'20/06/2026',startISO:'2026-06-06'}],concluded:false },
  { id:'restruturacao-financeira',name:'Reestruturação Financeira Interna',sector:'ADM/FIN',status:'Não iniciado',statusClass:'',leader:'Carlos Mendes',start:'10/05/2026',end:'31/07/2026',desc:'Revisão completa do fluxo de caixa e relatórios mensais.',memberNames:['Carlos Mendes','Pedro Lima','Camila Dias'],tasks:[{done:false,name:'Levantamento de dados históricos',resp:'Pedro Lima',due:'25/05/2026',startISO:'2026-05-10'},{done:false,name:'Proposta de novo modelo',resp:'Carlos Mendes',due:'15/06/2026',startISO:'2026-05-26'}],concluded:false },
  { id:'rebrand-estudio-norte',name:'Rebrand - Estúdio Norte',sector:'Comercial',status:'Em dia',statusClass:'green',leader:'Rafael Oliveira',start:'18/03/2026',end:'30/05/2026',desc:'Construção de nova identidade visual e manual de marca para o Estúdio Norte.',memberNames:['Rafael Oliveira','Larissa Mota'],tasks:[{done:true,name:'Pesquisa de referências',resp:'Larissa Mota',due:'01/04/2026',startISO:'2026-03-18'},{done:false,name:'Criação do manual',resp:'Rafael Oliveira',due:'30/05/2026',startISO:'2026-04-02'}],concluded:false },
  { id:'app-trilhar',name:'App Mobile - Trilhar',sector:'Projetos',status:'Em dia',statusClass:'green',leader:'Lucas Almeida',start:'28/04/2026',end:'31/07/2026',desc:'Aplicativo para empresa de turismo de aventura.',memberNames:['Lucas Almeida','Rafael Oliveira','Marina Santos'],tasks:[{done:true,name:'Levantamento de requisitos',resp:'Lucas Almeida',due:'10/05/2026',startISO:'2026-04-28'},{done:false,name:'Protótipo de telas',resp:'Marina Santos',due:'01/06/2026',startISO:'2026-05-11'},{done:false,name:'Desenvolvimento MVP',resp:'Rafael Oliveira',due:'31/07/2026',startISO:'2026-06-02'}],concluded:false },
];
let activeProjectId = null;

// ============== LEGADO ==============
let legadoData = {
  presidencia:      { label:'Presidência',              key:'presidencia',      registros:[{ autor:'Joana Vieira (2024-2025)',texto:'"Aprendi que delegar é mais importante que controlar. Tentei centralizar tudo no primeiro semestre e quase travamos a empresa."'},{ autor:'Rafael Brum (2023-2024)', texto:'"Investir em rituais semanais salvou a comunicação. Reuniões soltas não funcionam."'}] },
  vpresidencia:     { label:'Vice-presidência',          key:'vpresidencia',     registros:[] },
  diretoriaProj:    { label:'Diretoria de Projetos',     key:'diretoriaProj',    registros:[{ autor:'Marina Cruz (2024-2025)',  texto:'"O maior erro foi aceitar projetos sem briefing detalhado. Geramos retrabalho e atraso."'},{ autor:'Diego Sales (2023-2024)',  texto:'"Padronizar templates de proposta comercial foi o que mais economizou tempo no setor."'}] },
  diretoriaAdm:     { label:'Diretoria Adm-Financeira',  key:'diretoriaAdm',     registros:[{ autor:'Beatriz Nunes (2024-2025)',texto:'"Não confie só na memória do gerente. Tudo deve estar no fluxo de caixa documentado."'},{ autor:'Lucas Aguiar (2023-2024)', texto:'"Mudar de planilha para plataforma estruturada é prioridade. Vivi o caos sem isso."'}] },
  gerenciaMarketing:{ label:'Gerência de Marketing',     key:'gerenciaMarketing',registros:[{ autor:'Pedro Lins (2024-2025)',   texto:'"Métricas sem narrativa não convencem ninguém. Sempre conte uma história junto."'},{ autor:'Helena Faro (2023-2024)',  texto:'"Conteúdo programado em lotes funciona muito melhor do que postar reativamente."'}] },
};

// ============== RNN ==============
let rnnsData = [
  { titulo:'1. Pontualidade',      body:'Todo membro deve chegar com 10 minutos de antecedência às reuniões.' },
  { titulo:'2. Comunicação',       body:'Avisos oficiais sempre são feitos pela plataforma. Decisões verbais não têm validade.' },
  { titulo:'3. Confidencialidade', body:'Informações de clientes nunca são compartilhadas fora da empresa.' },
  { titulo:'4. Capacitações',      body:'Cada membro deve concluir no mínimo 4 capacitações por semestre.' },
  { titulo:'5. Faltas',            body:'Faltas devem ser justificadas com no mínimo 24h de antecedência ao padrinho ou gerente.' },
  { titulo:'6. Uso da sede',       body:'A sede é compartilhada. Cada membro é responsável por organizar seu espaço ao sair.' },
];
let valoresData = [
  { titulo:'Integridade',          body:'Agimos com transparência e honestidade em todas as relações.' },
  { titulo:'Aprendizado contínuo', body:'Cada projeto é uma oportunidade de evoluir como pessoa e profissional.' },
  { titulo:'Colaboração',          body:'Acreditamos no trabalho coletivo entre setores como motor de resultados.' },
  { titulo:'Impacto local',        body:'Trabalhamos para fortalecer pequenos e médios negócios da nossa região.' },
  { titulo:'Legado',               body:'Deixamos sempre a empresa melhor do que encontramos.' },
];
let rnnTabAtivo = 'rnn';

// ============== METAS ==============
let metas = {
  faturamento: { label:'Faturamento Mensal',          prefixo:'R$', sufixo:'',  meta:15000, atual:8500  },
  colabs:      { label:'Projetos em Colaboração',     prefixo:'',   sufixo:' colabs', meta:3, atual:1 },
  engajamento: { label:'Engajamento dos Membros',     prefixo:'',   sufixo:'',  meta:80,    atual:65    },
};
let metaEditando = null;

let metasAnuais = {
  anoMeta: 180000,
  mensal:  [8500, 7200, 9800, 11000, 8500, 0, 0, 0, 0, 0, 0, 0],
};

// ============== CAPACITAÇÕES TREE ==============
let capTree = {
  programacao:  { label:'Programação',    emoji:'💻', tracks:[
    [{ name:'HTML básico',     done:true }, { name:'CSS básico',        done:true  }, { name:'JavaScript',     done:true  }, { name:'React',                    done:false }],
    [{ name:'Sites estáticos', done:true }, { name:'Sites interativos', done:true  }],
  ]},
  financeiro:   { label:'Financeiro',     emoji:'💰', tracks:[
    [{ name:'Excel básico',    done:true }, { name:'Excel avançado',    done:true  }],
    [{ name:'Power BI básico', done:false }],
  ]},
  marketing:    { label:'Marketing',      emoji:'📣', tracks:[
    [{ name:'Comunicação',     done:true }, { name:'Atendimento ao cliente', done:true }, { name:'Vendas', done:true }],
    [],
  ]},
  administracao:{ label:'Administração',  emoji:'📋', tracks:[
    [{ name:'Gestão de tempo', done:true }, { name:'Gestão de projetos', done:true }],
    [{ name:'Liderança',       done:true }],
  ]},
  gerencia:     { label:'Gerência',       emoji:'🏆', tracks:[
    [{ name:'Gestão de Projetos com Notion', done:false }],
    [],
  ]},
  prototipagem: { label:'Prototipagem',   emoji:'🔧', tracks:[[], []] },
};
let capAddTarget = { col: null, track: 0 };

// ============== NAVEGAÇÃO ==============
async function goTo(page, opts = {}) {
  const contentEl = document.getElementById('content');
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    contentEl.innerHTML = await response.text();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');
    if (pageInitializers[page]) pageInitializers[page]();
    if (opts.onLoaded) opts.onLoaded();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><h2>Erro ao carregar "${page}"</h2></div>`;
  }
}

function openProject(id) { activeProjectId = id; goTo('projeto-detalhe'); }

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => goTo(item.dataset.page));
});

function toggleSidebar() {
  const app = document.querySelector('.app');
  app.classList.toggle('sidebar-collapsed');
  const btn = document.querySelector('.sidebar-toggle-btn');
  if (btn) btn.textContent = app.classList.contains('sidebar-collapsed') ? '▶' : '◀';
}

// ============== MODAIS ==============
function openNewAviso()   { document.getElementById('modal-aviso').classList.add('active'); updateAvisoSubFields(); }
function openNewEvent()   { document.getElementById('modal-evento').classList.add('active'); updateEventoSubFields(); }
function openNewProject() { populateLeaderSelect(); document.getElementById('modal-projeto').classList.add('active'); }
function openNewCap()     { document.getElementById('modal-cap').classList.add('active'); }
function openEditPerfil() { populateEditPerfil(); document.getElementById('modal-perfil-edit').classList.add('active'); }
function closeModal(id)   { document.getElementById(id).classList.remove('active'); }

function openManageMembers() {
  const p = projects.find(x => x.id === activeProjectId);
  if (!p) return;
  refreshManageMembersModal(p);
  document.getElementById('modal-membros').classList.add('active');
}

function openEditProject() {
  const p = projects.find(x => x.id === activeProjectId);
  if (!p) return;
  document.getElementById('edit-proj-nome').value = p.name;
  document.getElementById('edit-proj-desc').value = p.desc;
  const sel = document.getElementById('edit-proj-status');
  if (sel) { for (const opt of sel.options) { if (opt.value.startsWith(p.status + '|')) { sel.value = opt.value; break; } } }
  document.getElementById('modal-editar-projeto').classList.add('active');
}

function openAddRegistro() { document.getElementById('modal-legado-registro').classList.add('active'); }

function openEditRNN() { document.getElementById('modal-editar-rnn').classList.add('active'); switchRNNTab('rnn'); }

function openEditMeta(campo) {
  metaEditando = campo;
  const m = metas[campo];
  document.getElementById('meta-edit-label').textContent = m.label;
  document.getElementById('meta-edit-atual').value = m.atual;
  document.getElementById('meta-edit-meta').value  = m.meta;
  document.getElementById('modal-metas-edit').classList.add('active');
}

function openEditAnual() {
  document.getElementById('anual-meta-total').value = metasAnuais.anoMeta;
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const grid = document.getElementById('anual-mensal-grid');
  if (grid) grid.innerHTML = months.map((m, i) => `
    <div style="display:flex;flex-direction:column;gap:3px;">
      <label style="font-size:11px;font-weight:600;color:var(--gray-500);">${m}</label>
      <input type="number" id="anual-mes-${i}" value="${metasAnuais.mensal[i]}" min="0" step="100"
             style="width:100%;padding:5px 7px;font-size:12px;border:1px solid var(--gray-300);border-radius:6px;" />
    </div>`).join('');
  document.getElementById('modal-anual-chart').classList.add('active');
}

function openAllActivities() {
  const modal = document.getElementById('modal-atividades-todas');
  if (!modal) return;
  const grid = document.getElementById('atividades-todas-grid');
  if (grid) grid.innerHTML = activities.map(a => `
    <div onclick="toggleActivityModal(${a.id})"
         style="padding:10px 12px;background:var(--gray-50);border-radius:8px;cursor:pointer;border:1px solid var(--gray-200);transition:all .15s;"
         onmouseover="this.style.background='var(--blue-50)'" onmouseout="this.style.background='var(--gray-50)'">
      <div style="font-weight:600;font-size:13px;">${a.name}</div>
      <div style="font-size:12px;color:var(--blue-700);margin-top:2px;font-weight:700;">${a.points} pts</div>
      <div id="atv-desc-${a.id}" style="display:none;font-size:12px;color:var(--gray-600);margin-top:6px;padding-top:6px;border-top:1px solid var(--gray-200);">${a.desc}</div>
    </div>`).join('');
  modal.classList.add('active');
}

function toggleActivityModal(id) {
  const el = document.getElementById(`atv-desc-${id}`);
  if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
}

function openAddCap(colKey, trackIdx) {
  capAddTarget = { col: colKey, track: trackIdx };
  document.getElementById('new-cap-col-label').textContent =
    `${capTree[colKey]?.emoji} ${capTree[colKey]?.label} — Trilha ${trackIdx + 1}`;
  document.getElementById('new-cap-name').value = '';
  document.getElementById('new-cap-link').value = '';
  document.getElementById('modal-add-cap').classList.add('active');
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});

// ============== TOAST ==============
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ============== HELPERS ==============
function initials(name) { return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase(); }
function getMemberRole(name) { const m = members.find(x => x.name === name); return m ? `${m.role} · Setor ${m.sector}` : ''; }
function getMemberSector(name) { const m = members.find(x => x.name === name); return m ? m.sector : ''; }

function calcTaskStatus(task) {
  if (task.done) return { status:'Concluída', cls:'green' };
  if (task.due && task.due !== 'Sem prazo') {
    const [d,m,y] = task.due.split('/');
    const due = new Date(+y,+m-1,+d); const today = new Date(); today.setHours(0,0,0,0);
    if (due < today) return { status:'Atrasada', cls:'red' };
  }
  return { status:'Em andamento', cls:'' };
}

function updateTopbarAvatar() {
  const el = document.getElementById('topbar-avatar');
  if (!el) return;
  if (currentUser.photo) { el.style.backgroundImage=`url(${currentUser.photo})`; el.style.backgroundSize='cover'; el.textContent=''; }
  else { el.style.backgroundImage=''; el.textContent=currentUser.avatar; }
}

// ============== DASHBOARD ==============
function renderDashboard() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('dash-projetos-val', projects.filter(p => !p.concluded).length);
  set('dash-membros-val',  members.filter(m => m.status === 'Ativo').length);
  set('dash-trainees-val', members.filter(m => m.role === 'Trainee' && m.status === 'Ativo').length + ' trainees');
  set('dash-caps-val',     capacitacoes.length);
  set('dash-reunioes-val', calendarEvents.filter(e => (e.category==='reuniao-interna'||e.category==='reuniao-externa') && e.month==='Mai').length);

  const avisosEl = document.getElementById('dash-avisos');
  if (avisosEl) avisosEl.innerHTML = avisos.slice(0,3).map(a => `
    <div class="aviso ${a.color}"><div class="head"><div class="title">${a.title}</div><span class="tag ${a.color}">${a.type.charAt(0).toUpperCase()+a.type.slice(1)}</span></div>
    <div class="body">${a.body}</div></div>`).join('') || '<div style="color:var(--gray-500);font-size:13px;">Nenhum aviso.</div>';

  const eventosEl = document.getElementById('dash-eventos');
  if (eventosEl) eventosEl.innerHTML = calendarEvents.slice(0,4).map(e => `
    <div class="event-row">
      <div class="event-date"><div class="day">${e.day}</div><div class="mon">${e.month}</div></div>
      <div class="event-info"><div class="title">${e.title}</div><div class="meta">${e.meta}</div></div>
    </div>`).join('');

  const projListEl = document.getElementById('dash-proj-list');
  if (projListEl) projListEl.innerHTML = projects.filter(p=>!p.concluded).slice(0,4).map(p =>
    `<tr><td><b>${p.name}</b></td><td>${p.sector}</td><td><span class="tag ${p.statusClass}">${p.status}</span></td></tr>`
  ).join('') || '<tr><td colspan="3" style="color:var(--gray-500);">Nenhum projeto ativo.</td></tr>';

  const rankEl = document.getElementById('dash-ranking');
  if (rankEl) {
    const medals = ['gold','silver','bronze'];
    rankEl.innerHTML = [...trainees].sort((a,b)=>b.points-a.points).slice(0,4).map((t,i) => `
      <div class="rank-row">
        <div class="rank-pos ${medals[i]||''}">${i+1}</div>
        <div class="rank-info"><div class="name">${t.name}</div><div class="role">Trainee · ${getMemberSector(t.name)}</div></div>
        <div class="rank-points">${t.points} pts</div>
      </div>`).join('');
  }

  const membrosListEl = document.getElementById('dash-membros-lista');
  if (membrosListEl) {
    membrosListEl.innerHTML = members.filter(m=>m.status==='Ativo').map(m => `
      <div onclick="openMemberProfile('${m.name.replace(/'/g,"\\'")}')"
           style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--gray-50);border-radius:10px;cursor:pointer;transition:background .15s;"
           onmouseover="this.style.background='var(--blue-50)'" onmouseout="this.style.background='var(--gray-50)'">
        <div class="avatar sm">${initials(m.name)}</div>
        <div><div style="font-weight:600;font-size:13px;">${m.name}</div><div style="font-size:11px;color:var(--gray-500);">${m.role} · ${m.sector}</div></div>
      </div>`).join('');
  }
}

function openMemberProfile(name) {
  const m = members.find(x => x.name === name);
  if (!m) return;
  const active    = projects.filter(p => p.memberNames.includes(name) && !p.concluded);
  const concluded = projects.filter(p => p.memberNames.includes(name) && p.concluded);
  const t = trainees.find(x => x.name === name);
  const content = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--gray-200);">
      <div class="avatar lg">${initials(name)}</div>
      <div>
        <h3 style="margin:0;font-size:18px;">${name}</h3>
        <div style="color:var(--gray-500);font-size:13px;margin-top:2px;">${m.role} · ${m.sector}</div>
        <div style="color:var(--gray-400);font-size:12px;margin-top:2px;">📚 ${m.course || '—'}</div>
        <div style="color:var(--gray-400);font-size:12px;">📅 Entrou em ${m.entryDate || '—'}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="text-align:center;padding:12px;background:var(--blue-50);border-radius:8px;">
        <div style="font-size:22px;font-weight:800;color:var(--blue-700);">${active.length}</div>
        <div style="font-size:11px;color:var(--gray-500);margin-top:2px;">Projetos ativos</div>
      </div>
      <div style="text-align:center;padding:12px;background:var(--green-100);border-radius:8px;">
        <div style="font-size:22px;font-weight:800;color:var(--green-700);">${concluded.length}</div>
        <div style="font-size:11px;color:var(--gray-500);margin-top:2px;">Concluídos</div>
      </div>
      ${t
        ? `<div style="text-align:center;padding:12px;background:var(--amber-100);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--amber-700);">${t.points}</div><div style="font-size:11px;color:var(--gray-500);margin-top:2px;">Pts trainee</div></div>`
        : `<div style="text-align:center;padding:12px;background:var(--blue-50);border-radius:8px;"><div style="font-size:22px;font-weight:800;color:var(--blue-700);">${m.capsCount || 0}</div><div style="font-size:11px;color:var(--gray-500);margin-top:2px;">Capacitações</div></div>`}
    </div>
    ${active.length > 0 ? `
      <div style="font-size:12px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Projetos em andamento</div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${active.map(p=>`<div style="padding:8px 12px;background:var(--gray-50);border-radius:6px;font-size:13px;display:flex;justify-content:space-between;align-items:center;"><b>${p.name}</b><span class="tag">${p.sector}</span></div>`).join('')}
      </div>` : ''}`;
  document.getElementById('membro-perfil-content').innerHTML = content;
  document.getElementById('modal-membro-perfil').classList.add('active');
}

// ============== PERFIL ==============
function renderPerfil() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('perfil-name',        currentUser.name);
  set('perfil-role',        `${currentUser.role} · ${currentUser.sector}`);
  set('perfil-email-text',  '📧 ' + currentUser.email);
  set('perfil-date-text',   '📅 Entrou em ' + currentUser.entryDate);
  set('perfil-course-text', '📚 ' + currentUser.course);
  set('perfil-cap-count',   currentUser.caps.length);
  const av = document.getElementById('perfil-avatar');
  if (av) {
    if (currentUser.photo) { av.style.backgroundImage=`url(${currentUser.photo})`; av.style.backgroundSize='cover'; av.textContent=''; }
    else { av.style.backgroundImage=''; av.textContent=currentUser.avatar; }
  }
  const removeBtn = document.getElementById('perfil-remove-photo');
  if (removeBtn) removeBtn.style.display = currentUser.photo ? 'inline-flex' : 'none';
  const caps = document.getElementById('perfil-caps');
  if (caps) caps.innerHTML = currentUser.caps.map(c=>`<span class="tag">${c}</span>`).join('');
  updateTopbarAvatar();
}

function populateEditPerfil() {
  document.getElementById('edit-name').value  = currentUser.name;
  document.getElementById('edit-email').value = currentUser.email;
  document.getElementById('edit-date').value  = currentUser.entryDate;
  const cs = document.getElementById('edit-course'); if (cs) cs.value = currentUser.course;
  populateCapSelect(); renderEditCaps();
}

function populateCapSelect() {
  const sel = document.getElementById('new-cap-select'); if (!sel) return;
  const disp = capacitacoes.filter(c => !currentUser.caps.includes(c));
  sel.innerHTML = '<option value="">— selecionar capacitação —</option>' + disp.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function renderEditCaps() {
  const el = document.getElementById('edit-caps-list'); if (!el) return;
  el.innerHTML = currentUser.caps.map((c,i)=>`
    <span class="tag" style="display:inline-flex;align-items:center;gap:4px;margin:3px;">${c}
      <span style="cursor:pointer;color:var(--red-700);font-size:14px;" onclick="removeCap(${i})">×</span>
    </span>`).join('') || '<span style="color:var(--gray-400);font-size:13px;">Nenhuma capacitação.</span>';
}

function removeCap(i) { currentUser.caps.splice(i,1); renderEditCaps(); populateCapSelect(); }
function addCap() {
  const sel = document.getElementById('new-cap-select'); if (!sel||!sel.value) return;
  currentUser.caps.push(sel.value); renderEditCaps(); populateCapSelect();
}

function saveEditPerfil() {
  const name=document.getElementById('edit-name').value.trim(), email=document.getElementById('edit-email').value.trim(),
        date=document.getElementById('edit-date').value.trim(), course=document.getElementById('edit-course').value;
  if (name)   { currentUser.name=name; currentUser.avatar=initials(name); }
  if (email)  currentUser.email=email;
  if (date)   currentUser.entryDate=date;
  if (course) currentUser.course=course;
  closeModal('modal-perfil-edit'); renderPerfil(); showToast('Perfil atualizado.');
}

function openPhotoUpload() {
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      currentUser.photo=ev.target.result; localStorage.setItem('perfil_photo',ev.target.result);
      renderPerfil(); showToast('Foto de perfil atualizada.');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removePhoto() { currentUser.photo=null; localStorage.removeItem('perfil_photo'); renderPerfil(); showToast('Foto removida.'); }

(function restorePhoto() { const s=localStorage.getItem('perfil_photo'); if(s) currentUser.photo=s; })();

// ============== AVISOS ==============
function renderAvisos() {
  const list=document.getElementById('avisos-list'); if(!list) return;
  const filtered=activeAvisoFilter==='todos'?avisos:avisos.filter(a=>a.type===activeAvisoFilter);
  const canDelete=(currentUser.role==='Presidente'||currentUser.role==='Diretor');
  list.innerHTML=filtered.length===0?'<div class="empty-state" style="padding:20px;">Nenhum aviso nesta categoria.</div>'
    :filtered.map(a=>`
      <div class="aviso ${a.color}" data-id="${a.id}">
        <div class="head"><div class="title">${a.title}</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="tag ${a.color}">${a.type.charAt(0).toUpperCase()+a.type.slice(1)}</span>
            <span style="font-size:12px;color:var(--gray-500);">${a.time}</span>
            ${a.expiry?`<span style="font-size:11px;color:var(--gray-400);">Expira: ${a.expiry}</span>`:''}
            ${canDelete?`<button class="btn btn-ghost" style="padding:2px 8px;font-size:12px;color:var(--red-700);" onclick="deleteAviso(${a.id})">✕</button>`:''}
          </div>
        </div>
        <div class="body">${a.body}</div>
        <div style="font-size:12px;color:var(--gray-500);margin-top:6px;">Por: ${a.author}</div>
      </div>`).join('');
  document.querySelectorAll('.aviso-filter-btn').forEach(btn=>{
    btn.classList.toggle('btn-outline',btn.dataset.filter===activeAvisoFilter);
    btn.classList.toggle('btn-ghost',btn.dataset.filter!==activeAvisoFilter);
  });
}

function filterAvisos(type) { activeAvisoFilter=type; renderAvisos(); }
function deleteAviso(id) { avisos=avisos.filter(a=>a.id!==id); renderAvisos(); showToast('Aviso removido.'); }

function updateAvisoSubFields() {
  const val=document.getElementById('aviso-alcance')?.value;
  document.getElementById('aviso-setorial-opts').style.display=val==='setorial'?'block':'none';
  document.getElementById('aviso-direcionado-opts').style.display=val==='direcionado'?'block':'none';
}

function submitAviso() {
  const title=document.getElementById('aviso-titulo').value.trim(), alcance=document.getElementById('aviso-alcance').value,
        body=document.getElementById('aviso-mensagem').value.trim(), expiry=document.getElementById('aviso-expiry').value;
  if(!title||!body){showToast('Preencha título e mensagem.');return;}
  avisos.unshift({id:avisoIdCounter++,title,type:alcance,body,author:`${currentUser.name} (${currentUser.role})`,time:'Agora',color:'',expiry:expiry||null});
  closeModal('modal-aviso');
  ['aviso-titulo','aviso-mensagem','aviso-expiry'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('avisos-list'))renderAvisos();
  showToast('Aviso enviado.');
}

// ============== CALENDÁRIO ==============
function renderCalendario() {
  const s=document.getElementById('cal-search');
  if(s&&!s._wired){s._wired=true;s.addEventListener('input',filterCalendario);}
  filterCalendario();
}

function filterCalendario() {
  const q=(document.getElementById('cal-search')?.value||'').toLowerCase().trim();
  const maioEl=document.getElementById('cal-maio'), junhoEl=document.getElementById('cal-junho');
  if(!maioEl||!junhoEl)return;
  const renderEvent=e=>`<div class="event-row">
    <div class="event-date"><div class="day">${e.day}</div><div class="mon">${e.month}</div></div>
    <div class="event-info"><div class="title">${e.title}</div><div class="meta">${e.meta}</div></div>
    <span class="tag ${e.cls}">${e.visibility.charAt(0).toUpperCase()+e.visibility.slice(1)}</span></div>`;
  const match=e=>!q||e.title.toLowerCase().includes(q)||e.meta.toLowerCase().includes(q)||e.visibility.toLowerCase().includes(q)||e.day.includes(q)||e.month.toLowerCase().includes(q);
  const empty='<div class="empty-state" style="padding:14px;">Nenhum evento encontrado.</div>';
  maioEl.innerHTML=calendarEvents.filter(e=>e.month==='Mai'&&match(e)).map(renderEvent).join('')||empty;
  junhoEl.innerHTML=calendarEvents.filter(e=>e.month==='Jun'&&match(e)).map(renderEvent).join('')||empty;
}

function updateEventoSubFields() {
  const val=document.getElementById('evento-visibilidade')?.value;
  document.getElementById('evento-setorial-opts').style.display=val==='setorial'?'block':'none';
  document.getElementById('evento-restrito-opts').style.display=val==='restrito'?'block':'none';
}

function submitEvent() {
  const title=document.getElementById('ev-titulo').value.trim(), data=document.getElementById('ev-data').value,
        hora=document.getElementById('ev-hora').value, local=document.getElementById('ev-local').value.trim(),
        categoria=document.getElementById('ev-categoria').value, visib=document.getElementById('evento-visibilidade').value;
  if(!title||!data){showToast('Preencha título e data.');return;}
  const d=new Date(data+'T00:00:00'), day=String(d.getDate()).padStart(2,'0');
  const monthNames=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const month=monthNames[d.getMonth()];
  const catLabels={'reuniao-interna':'Reunião Interna','reuniao-externa':'Reunião Externa','evento':'Evento'};
  const meta=[hora?hora+'h':'',local||'',catLabels[categoria]||''].filter(Boolean).join(' · ');
  calendarEvents.push({day,month,title,meta,visibility:visib,cls:'',category:categoria});
  calendarEvents.sort((a,b)=>{const ms=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];return(ms.indexOf(a.month)*100+parseInt(a.day))-(ms.indexOf(b.month)*100+parseInt(b.day));});
  avisos.unshift({id:avisoIdCounter++,title:`Novo evento: ${title}`,type:'geral',body:`Novo evento adicionado ao calendário: <b>${title}</b> — ${day}/${month}${meta?' · '+meta:''}.`,author:`${currentUser.name} (${currentUser.role})`,time:'Agora',color:'',expiry:null});
  closeModal('modal-evento');
  ['ev-titulo','ev-data','ev-hora','ev-local'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('cal-maio'))renderCalendario();
  if(document.getElementById('avisos-list'))renderAvisos();
  showToast('Evento criado.');
}

// ============== PROJETOS ==============
function renderProjects() {
  const grid=document.getElementById('projects-grid'); if(!grid) return;
  const active=projects.filter(p=>!p.concluded);
  grid.innerHTML=active.length===0?'<div class="empty-state">Nenhum projeto em andamento.</div>'
    :active.map(p=>`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
        <span class="tag">${p.sector}</span><span class="tag ${p.statusClass}">${p.status}</span></div>
      <h3 style="font-size:16px;">${p.name}</h3>
      <div style="font-size:13px;color:var(--gray-500);margin:6px 0 12px;">${p.desc}</div>
      <div style="font-size:12px;color:var(--gray-600);"><b>Líder:</b> ${p.leader}</div>
      <div style="font-size:12px;color:var(--gray-600);"><b>Início:</b> ${p.start}</div>
      <div class="divider"></div>
      <button class="btn btn-outline" style="width:100%;" onclick="openProject('${p.id}')">Abrir projeto</button>
    </div>`).join('');
}

function renderProjectDetail() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  const canManage=(currentUser.role==='Presidente'||currentUser.role==='Diretor'||p.leader===currentUser.name);
  const nameEl=document.getElementById('proj-name'); if(nameEl) nameEl.textContent=p.name;
  const infoEl=document.getElementById('proj-info');
  if(infoEl) infoEl.innerHTML=`
    <div><b>Líder:</b> ${p.leader}</div><div><b>Setor:</b> ${p.sector}</div>
    <div><b>Status:</b> <span class="tag ${p.statusClass}">${p.status}</span></div>
    <div><b>Início:</b> ${p.start}</div><div><b>Término previsto:</b> ${p.end}</div>
    <div><b>Descrição:</b> ${p.desc}</div>
    ${canManage?`<button class="btn btn-outline" style="margin-top:8px;font-size:12px;" onclick="openEditProject()">✏️ Editar informações</button>`:''}`;
  const membersEl=document.getElementById('proj-members');
  if(membersEl){
    membersEl.innerHTML=p.memberNames.map(n=>`<div style="display:flex;align-items:center;gap:10px;">
      <div class="avatar sm">${initials(n)}</div>
      <div><div style="font-weight:600;">${n}</div><div style="font-size:11px;color:var(--gray-500);">${getMemberRole(n)}</div></div>
    </div>`).join('');
    if(canManage) membersEl.innerHTML+=`<button class="btn btn-outline" style="margin-top:8px;font-size:12px;width:100%;" onclick="openManageMembers()">👥 Gerenciar membros</button>`;
  }
  const tasksEl=document.getElementById('proj-tasks');
  if(tasksEl) tasksEl.innerHTML=p.tasks.length===0?'<tr><td colspan="5" style="color:var(--gray-500);padding:12px;">Nenhuma tarefa cadastrada.</td></tr>'
    :p.tasks.map((t,i)=>{
      const s=calcTaskStatus(t);
      const startLabel=t.startISO?(()=>{const[y,m,d]=t.startISO.split('-');return`${d}/${m} → `;})():'';
      return `<tr>
        <td><input type="checkbox" ${t.done?'checked':''} onchange="toggleTaskDone('${p.id}',${i})" /></td>
        <td>${t.name}</td><td>${t.resp}</td>
        <td style="font-size:12px;">${startLabel}${t.due}</td>
        <td><span class="tag ${s.cls}">${s.status}</span></td>
      </tr>`;
    }).join('');
  const btn=document.getElementById('proj-conclude-btn');
  if(btn) btn.style.display=canManage&&!p.concluded?'inline-flex':'none';
  const cronEl=document.getElementById('proj-cronograma');
  if(cronEl) cronEl.innerHTML=buildCronograma(p);
}

function buildCronograma(p) {
  const parseDate=str=>{if(!str||str==='Sem prazo')return null;if(str.includes('-')){const[y,m,d]=str.split('-');return new Date(+y,+m-1,+d);}const[d,m,y]=str.split('/');return new Date(+y,+m-1,+d);};
  const projStart=parseDate(p.start), projEnd=parseDate(p.end);
  if(!projStart||!projEnd||p.tasks.length===0) return '<div style="color:var(--gray-400);font-size:13px;">Nenhuma tarefa para exibir.</div>';
  const total=(projEnd-projStart)/86400000;
  if(total<=0) return '';
  const today=new Date(); today.setHours(0,0,0,0);
  const todayPct=Math.min(100,Math.max(0,(today-projStart)/86400000/total*100));
  const fmtShort=d=>`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  const rows=p.tasks.map(t=>{
    const tStart=t.startISO?parseDate(t.startISO):projStart, tEnd=parseDate(t.due)||projEnd;
    const left=Math.max(0,(tStart-projStart)/86400000/total*100);
    const width=Math.min(100-left,Math.max(1.5,(tEnd-tStart)/86400000/total*100));
    const s=calcTaskStatus(t);
    const color=s.cls==='green'?'var(--green-700)':s.cls==='red'?'var(--red-700)':'var(--blue-500)';
    return `<div style="display:grid;grid-template-columns:155px 1fr;gap:8px;align-items:center;margin-bottom:6px;">
      <div style="font-size:12px;color:var(--gray-600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t.name}">${t.name}</div>
      <div style="position:relative;height:22px;background:var(--gray-100);border-radius:4px;">
        <div style="position:absolute;left:${left.toFixed(1)}%;width:${width.toFixed(1)}%;height:100%;background:${color};border-radius:4px;opacity:.85;"></div>
        <div style="position:absolute;left:${todayPct.toFixed(1)}%;top:0;width:2px;height:100%;background:var(--red-700);opacity:.5;z-index:1;"></div>
      </div>
    </div>`;
  }).join('');
  const canManage=(currentUser.role==='Presidente'||currentUser.role==='Diretor'||p.leader===currentUser.name);
  const hint=canManage?`<div style="font-size:11px;color:var(--blue-600);margin-bottom:8px;cursor:pointer;" onclick="ganttClick(event,'${p.id}',${projStart.getTime()},${projEnd.getTime()-projStart.getTime()})">+ Clique na linha do tempo para adicionar tarefa com data pré-preenchida</div>`:'';
  return `${hint}
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-400);margin-bottom:6px;">
      <span>${fmtShort(projStart)}</span><span style="color:var(--red-700);">▼ Hoje</span><span>${fmtShort(projEnd)}</span>
    </div>
    <div id="gantt-bars-${p.id}" style="cursor:${canManage?'crosshair':'default'};" onclick="${canManage?`ganttClick(event,'${p.id}',${projStart.getTime()},${projEnd.getTime()-projStart.getTime()})`:'void(0)'}">
      ${rows}
    </div>
    <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap;font-size:11px;">
      <span style="color:var(--blue-500);">■ Em andamento</span>
      <span style="color:var(--green-700);">■ Concluída</span>
      <span style="color:var(--red-700);">■ Atrasada  |  linha = hoje</span>
    </div>`;
}

function ganttClick(event, projId, startMs, totalMs) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const labelWidth = 155 + 8;
  const relX = event.clientX - rect.left - labelWidth;
  const barWidth = rect.width - labelWidth;
  if (relX < 0) return;
  const ratio = Math.max(0, Math.min(1, relX / barWidth));
  const clickDate = new Date(startMs + ratio * totalMs);
  const iso = `${clickDate.getFullYear()}-${String(clickDate.getMonth()+1).padStart(2,'0')}-${String(clickDate.getDate()).padStart(2,'0')}`;
  const p = projects.find(x => x.id === projId);
  if (!p) return;
  const sel = document.getElementById('task-resp');
  if (sel) sel.innerHTML = p.memberNames.map(n => `<option value="${n}">${n}</option>`).join('');
  document.getElementById('task-inicio').value = iso;
  document.getElementById('task-prazo').value  = iso;
  document.getElementById('modal-tarefa').classList.add('active');
}

function toggleTaskDone(projId, taskIdx) {
  const p=projects.find(x=>x.id===projId); if(!p) return;
  p.tasks[taskIdx].done=!p.tasks[taskIdx].done; renderProjectDetail();
}

function concludeProject() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  const can=(currentUser.role==='Presidente'||currentUser.role==='Diretor'||p.leader===currentUser.name);
  if(!can){showToast('Sem permissão.');return;}
  p.concluded=true; p.status='Concluído'; p.statusClass='green';
  showToast(`Projeto "${p.name}" concluído.`); goTo('projetos');
}

function populateLeaderSelect() {
  const sel=document.getElementById('proj-leader-select'); if(!sel) return;
  sel.innerHTML=members.filter(m=>m.role!=='Trainee'&&m.status==='Ativo').map(m=>`<option value="${m.name}">${m.name} (${m.role})</option>`).join('');
}

function submitProject() {
  const nome=document.getElementById('new-proj-nome').value.trim(), setor=document.getElementById('new-proj-setor').value,
        lider=document.getElementById('proj-leader-select').value, desc=document.getElementById('new-proj-desc').value.trim();
  if(!nome){showToast('Informe o nome do projeto.');return;}
  const today=new Date(), fmt=d=>`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const endDate=new Date(today); endDate.setMonth(endDate.getMonth()+3);
  const id='proj-'+Date.now();
  projects.push({id,name:nome,sector:setor,status:'Não iniciado',statusClass:'',leader:lider,start:fmt(today),end:fmt(endDate),desc:desc||'Sem descrição.',memberNames:lider?[lider]:[],tasks:[],concluded:false});
  closeModal('modal-projeto');
  document.getElementById('new-proj-nome').value=''; document.getElementById('new-proj-desc').value='';
  activeProjectId=id; goTo('projeto-detalhe'); showToast('Projeto criado.');
}

function openNewTask() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p){showToast('Nenhum projeto aberto.');return;}
  const sel=document.getElementById('task-resp'); if(sel) sel.innerHTML=p.memberNames.map(n=>`<option value="${n}">${n}</option>`).join('');
  document.getElementById('modal-tarefa').classList.add('active');
}

function submitTask() {
  const nome=document.getElementById('task-nome').value.trim(), resp=document.getElementById('task-resp').value,
        prazo=document.getElementById('task-prazo').value, inicio=document.getElementById('task-inicio').value;
  if(!nome){showToast('Informe o nome da tarefa.');return;}
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  const fmtDate=iso=>{if(!iso)return null;const[y,m,d]=iso.split('-');return`${d}/${m}/${y}`;};
  p.tasks.push({done:false,name:nome,resp:resp||'—',due:fmtDate(prazo)||'Sem prazo',startISO:inicio||null});
  closeModal('modal-tarefa');
  ['task-nome','task-prazo','task-desc','task-inicio'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderProjectDetail(); showToast('Tarefa adicionada.');
}

// ============== GERENCIAR MEMBROS ==============
function refreshManageMembersModal(p) {
  if(!p) p=projects.find(x=>x.id===activeProjectId);
  const listEl=document.getElementById('modal-membros-list');
  if(listEl) listEl.innerHTML=p.memberNames.map(n=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--gray-50);border-radius:8px;margin-bottom:6px;">
      <div style="display:flex;align-items:center;gap:8px;"><div class="avatar sm">${initials(n)}</div><span style="font-size:13px;">${n}</span></div>
      ${n!==p.leader?`<button class="btn btn-ghost" style="color:var(--red-700);font-size:12px;padding:4px 8px;" onclick="removeMemberFromProject('${n.replace(/'/g,"\\'")}')">✕ Remover</button>`:'<span class="tag">Líder</span>'}
    </div>`).join('')||'<div style="color:var(--gray-400);font-size:13px;">Nenhum membro.</div>';
  const sel=document.getElementById('add-member-select');
  if(sel){
    const el=members.filter(m=>m.role!=='Trainee'&&m.status==='Ativo'&&!p.memberNames.includes(m.name));
    sel.innerHTML=el.length?el.map(m=>`<option value="${m.name}">${m.name} (${m.role})</option>`).join(''):'<option value="">— sem membros disponíveis —</option>';
  }
}

function addMemberToProject() {
  const p=projects.find(x=>x.id===activeProjectId), sel=document.getElementById('add-member-select');
  if(!p||!sel||!sel.value) return;
  if(!p.memberNames.includes(sel.value)) p.memberNames.push(sel.value);
  refreshManageMembersModal(p); renderProjectDetail(); showToast(`${sel.value} adicionado.`);
}

function removeMemberFromProject(name) {
  const p=projects.find(x=>x.id===activeProjectId);
  if(!p||name===p.leader){showToast('Não é possível remover o líder.');return;}
  p.memberNames=p.memberNames.filter(n=>n!==name);
  refreshManageMembersModal(p); renderProjectDetail(); showToast(`${name} removido.`);
}

function submitEditProject() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  const nome=document.getElementById('edit-proj-nome').value.trim(), desc=document.getElementById('edit-proj-desc').value.trim();
  const [status,cls]=document.getElementById('edit-proj-status').value.split('|');
  if(nome) p.name=nome; if(desc) p.desc=desc; if(status){p.status=status;p.statusClass=cls||'';}
  closeModal('modal-editar-projeto'); renderProjectDetail(); showToast('Projeto atualizado.');
}

// ============== TRAINEES ==============
function renderTrainees() {
  const rankEl=document.getElementById('trainee-ranking'), validEl=document.getElementById('trainee-validacoes'), activEl=document.getElementById('trainee-activities');
  if(rankEl){
    const medals=['gold','silver','bronze'];
    rankEl.innerHTML=[...trainees].sort((a,b)=>b.points-a.points).map((t,i)=>`
      <div class="rank-row"><div class="rank-pos ${medals[i]||''}">${i+1}</div>
        <div class="rank-info"><div class="name">${t.name}</div><div class="role">Padrinho: ${t.padrinho}</div></div>
        <div class="rank-points">${t.points} pts</div></div>`).join('');
  }
  if(validEl){
    const minhas=pendingValidations.filter(v=>v.padrinho===currentUser.name);
    validEl.innerHTML=minhas.length===0?'<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:16px;">Nenhuma validação pendente.</td></tr>'
      :minhas.map(v=>{const ri=pendingValidations.indexOf(v);return`<tr>
        <td><b>${v.trainee}</b></td>
        <td>${v.activity} <span class="tag" style="margin-left:4px;">${v.points} pts</span></td>
        <td>${v.sent}</td>
        <td style="display:flex;gap:6px;">
          <button class="btn btn-primary" onclick="validateActivity(${ri},'aprovar')" style="padding:6px 12px;">✓ Aprovar</button>
          <button class="btn btn-outline" onclick="validateActivity(${ri},'rejeitar')" style="padding:6px 12px;">✕ Rejeitar</button>
        </td></tr>`;}).join('');
  }
  if(activEl){
    // Mostra apenas a primeira atividade
    const first=activities[0];
    if(!first){ activEl.innerHTML='<tr><td colspan="2" style="color:var(--gray-500);padding:12px;">Nenhuma atividade.</td></tr>'; return; }
    const isOpen=expandedActivityId===first.id;
    activEl.innerHTML=`<tr style="cursor:pointer;" onclick="toggleActivity(${first.id})">
      <td><b>${first.name}</b> <span style="font-size:11px;color:var(--gray-400);">${isOpen?'▲':'▼'}</span></td>
      <td><b>${first.points}</b> pts</td></tr>
      ${isOpen?`<tr><td colspan="2" style="background:var(--gray-50);padding:10px 14px;font-size:13px;color:var(--gray-600);">${first.desc}</td></tr>`:''}
      <tr><td colspan="2" style="padding:10px 14px;">
        <button class="btn btn-ghost" style="font-size:12px;color:var(--blue-700);" onclick="openAllActivities()">Ver todas as atividades (${activities.length}) →</button>
      </td></tr>`;
  }
}

function openNewActivity() { document.getElementById('modal-atividade').classList.add('active'); }

function submitActivity() {
  const nome=document.getElementById('atv-nome').value.trim(), pontos=parseInt(document.getElementById('atv-pontos').value), desc=document.getElementById('atv-desc').value.trim();
  if(!nome){showToast('Informe o nome.');return;} if(!pontos||pontos<1){showToast('Informe os pontos.');return;}
  activities.push({id:activityIdCounter++,name:nome,points:pontos,desc:desc||'Sem descrição.'});
  closeModal('modal-atividade');
  ['atv-nome','atv-pontos','atv-desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('trainee-activities'))renderTrainees();
  showToast('Atividade criada.');
}

function toggleActivity(id) { expandedActivityId=expandedActivityId===id?null:id; if(document.getElementById('trainee-activities'))renderTrainees(); }

function validateActivity(idx, action) {
  const v=pendingValidations[idx]; if(!v) return;
  if(action==='aprovar'){const t=trainees.find(x=>x.name===v.trainee);if(t)t.points+=v.points;showToast(`${v.trainee} +${v.points} pts.`);}
  else showToast(`Atividade de ${v.trainee} rejeitada.`);
  pendingValidations.splice(idx,1); renderTrainees();
}

// ============== LEGADO ==============
function renderLegado() {
  const grid=document.getElementById('legado-grid'); if(!grid) return;
  grid.innerHTML=Object.values(legadoData).map(cat=>`
    <div class="card">
      <div class="card-title">${cat.label}</div>
      <div style="font-size:13px;color:var(--gray-700);display:flex;flex-direction:column;gap:10px;">
        ${cat.registros.length>0?cat.registros.slice(0,2).map(r=>`<div><b>${r.autor}:</b> ${r.texto}</div>`).join(''):'<div style="color:var(--gray-400);">Nenhum registro ainda.</div>'}
      </div>
      <button class="btn btn-ghost" style="margin-top:10px;font-size:12px;" onclick="openVerRegistros('${cat.key}')">Ver todos os registros →</button>
    </div>`).join('');
}

function openVerRegistros(key) {
  const cat=legadoData[key]; if(!cat) return;
  document.getElementById('ver-reg-titulo').textContent=`${cat.label} — Todos os registros`;
  document.getElementById('ver-reg-lista').innerHTML=cat.registros.length>0
    ?cat.registros.map(r=>`<div style="padding:12px;background:var(--gray-50);border-radius:8px;"><div style="font-weight:600;font-size:13px;margin-bottom:4px;">${r.autor}</div><div style="font-size:13px;color:var(--gray-700);">${r.texto}</div></div>`).join('')
    :'<div style="color:var(--gray-400);text-align:center;padding:20px;">Nenhum registro ainda.</div>';
  document.getElementById('modal-ver-registros').classList.add('active');
}

function submitLegadoRegistro() {
  const cargo=document.getElementById('legado-cargo').value, autor=document.getElementById('legado-autor').value.trim(), texto=document.getElementById('legado-texto').value.trim();
  if(!autor||!texto){showToast('Preencha todos os campos.');return;}
  if(legadoData[cargo]) legadoData[cargo].registros.unshift({autor,texto:`"${texto}"`});
  closeModal('modal-legado-registro');
  document.getElementById('legado-autor').value=''; document.getElementById('legado-texto').value='';
  renderLegado(); showToast('Registro adicionado.');
}

// ============== RNN ==============
function renderRNN() {
  const grid=document.getElementById('rnn-grid'); if(!grid) return;
  grid.innerHTML=`
    <div class="card"><div class="card-title">📘 Regras, Normas e Normativas</div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;color:var(--gray-700);">
        ${rnnsData.map(r=>`<div><b>${r.titulo}</b><br>${r.body}</div>`).join('')}
      </div>
    </div>
    <div class="card"><div class="card-title">💡 Nossos Valores</div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${valoresData.map(v=>`<div style="padding:14px;background:var(--blue-50);border-radius:8px;"><b style="color:var(--blue-700);">${v.titulo}</b><div style="font-size:13px;color:var(--gray-700);margin-top:4px;">${v.body}</div></div>`).join('')}
      </div>
    </div>`;
}

function switchRNNTab(tab) {
  rnnTabAtivo=tab;
  document.getElementById('rnn-edit-rnn').style.display=tab==='rnn'?'':'none';
  document.getElementById('rnn-edit-val').style.display=tab==='val'?'':'none';
  document.getElementById('rnn-tab-rnn').className=tab==='rnn'?'btn btn-outline':'btn btn-ghost';
  document.getElementById('rnn-tab-val').className=tab==='val'?'btn btn-outline':'btn btn-ghost';
}

function addRNN() {
  const titulo=document.getElementById('rnn-new-titulo').value.trim(), body=document.getElementById('rnn-new-body').value.trim();
  if(!titulo||!body){showToast('Preencha título e descrição.');return;}
  rnnsData.push({titulo:`${rnnsData.length+1}. ${titulo}`,body});
  document.getElementById('rnn-new-titulo').value=''; document.getElementById('rnn-new-body').value='';
  if(document.getElementById('rnn-grid'))renderRNN(); showToast('RNN adicionada.');
}

function addValor() {
  const titulo=document.getElementById('val-new-titulo').value.trim(), body=document.getElementById('val-new-body').value.trim();
  if(!titulo||!body){showToast('Preencha título e descrição.');return;}
  valoresData.push({titulo,body});
  document.getElementById('val-new-titulo').value=''; document.getElementById('val-new-body').value='';
  if(document.getElementById('rnn-grid'))renderRNN(); showToast('Valor adicionado.');
}

// ============== METAS ==============
function buildAnualChart() {
  const d=metasAnuais;
  const W=560,H=200,pad={top:20,right:20,bottom:35,left:65};
  const iW=W-pad.left-pad.right, iH=H-pad.top-pad.bottom;
  const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  let cumActual=[],sum=0,lastIdx=-1;
  d.mensal.forEach((v,i)=>{sum+=v;if(v>0){cumActual[i]=sum;lastIdx=i;}else{cumActual[i]=null;}});
  for(let i=lastIdx+1;i<12;i++) cumActual[i]=null;
  const target=months.map((_,i)=>(i+1)/12*d.anoMeta);
  const maxVal=Math.max(d.anoMeta,cumActual.filter(v=>v!==null).reduce((m,v)=>Math.max(m,v),0)||d.anoMeta);
  const x=i=>pad.left+(i/11)*iW, y=v=>H-pad.bottom-(v/maxVal)*iH;
  const gridSteps=[0,0.25,0.5,0.75,1].map(f=>({v:f*maxVal,y:y(f*maxVal)}));
  const gridLines=gridSteps.map(s=>`<line x1="${pad.left}" y1="${s.y.toFixed(1)}" x2="${W-pad.right}" y2="${s.y.toFixed(1)}" stroke="var(--gray-200)" stroke-width="1"/>`).join('');
  const yLabels=gridSteps.map(s=>`<text x="${pad.left-5}" y="${s.y.toFixed(1)}" dy="4" text-anchor="end" font-size="10" fill="var(--gray-500)">${s.v>=1000?`R$${(s.v/1000).toFixed(0)}k`:`R$0`}</text>`).join('');
  const xLabels=months.map((m,i)=>`<text x="${x(i).toFixed(1)}" y="${H-5}" text-anchor="middle" font-size="10" fill="var(--gray-500)">${m}</text>`).join('');
  const targetPts=months.map((_,i)=>`${x(i).toFixed(1)},${y(target[i]).toFixed(1)}`).join(' ');
  const actualPts=[];
  cumActual.forEach((v,i)=>{if(v!==null)actualPts.push({x:x(i),y:y(v),v});});
  let areaD='';
  if(actualPts.length>0){
    const last=actualPts[actualPts.length-1];
    areaD=`M ${actualPts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} L ${last.x.toFixed(1)},${(H-pad.bottom).toFixed(1)} L ${pad.left},${(H-pad.bottom).toFixed(1)} Z`;
  }
  const actualLine=actualPts.length>1?`<polyline points="${actualPts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round"/>`:'';
  const actualDots=actualPts.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i===actualPts.length-1?5:3.5}" fill="#16a34a" ${i===actualPts.length-1?'stroke="white" stroke-width="1.5"':''}/>`).join('');
  const targetDots=months.map((_,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(target[i]).toFixed(1)}" r="3" fill="white" stroke="var(--gray-700)" stroke-width="1.5"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
    <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#16a34a" stop-opacity="0.25"/><stop offset="100%" stop-color="#16a34a" stop-opacity="0.02"/>
    </linearGradient></defs>
    ${gridLines}
    ${areaD?`<path d="${areaD}" fill="url(#areaGrad)"/>`:''}
    <polyline points="${targetPts}" fill="none" stroke="var(--gray-700)" stroke-width="2" stroke-dasharray="5,3"/>
    ${targetDots}${actualLine}${actualDots}
    ${yLabels}${xLabels}
  </svg>
  <div style="display:flex;gap:16px;justify-content:center;font-size:11px;color:var(--gray-600);margin-top:8px;">
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:18px;height:3px;background:#16a34a;display:inline-block;border-radius:2px;"></span>2026 (real acumulado)</span>
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:18px;height:3px;background:var(--gray-700);display:inline-block;border-radius:2px;border-top:2px dashed;"></span>Meta 2026</span>
  </div>`;
}

function renderMetas() {
  const grid=document.getElementById('metas-grid'); if(!grid) return;
  const fmtVal=(campo,val)=>{
    const m=metas[campo];
    if(campo==='faturamento') return 'R$ '+val.toLocaleString('pt-BR',{minimumFractionDigits:0});
    return val+(m.sufixo||'');
  };
  const cards=Object.entries(metas).map(([campo,m])=>{
    const pct=Math.min(100,Math.round(m.atual/m.meta*100));
    const label=pct>=100?'✓ Meta batida!':pct>=70?'Atenção':'Abaixo da meta';
    return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
        <div class="card-title" style="margin-bottom:0;">${m.label}</div>
        <button class="btn btn-ghost" style="font-size:12px;" onclick="openEditMeta('${campo}')">✏️ Editar</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <div style="font-size:30px;font-weight:800;color:var(--gray-900);">${fmtVal(campo,m.atual)}</div>
        <div style="font-size:13px;color:var(--gray-500);">Meta: ${fmtVal(campo,m.meta)}</div>
      </div>
      <div style="height:8px;background:linear-gradient(to right,#dc2626,#f59e0b,#16a34a);border-radius:999px;position:relative;overflow:hidden;margin-bottom:8px;">
        <div style="position:absolute;right:0;top:0;width:${100-pct}%;height:100%;background:var(--gray-100);"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray-500);">
        <span>${pct}% atingido</span>
        <span style="font-weight:600;color:${pct>=100?'#16a34a':pct>=70?'#f59e0b':'#dc2626'};">${label}</span>
      </div>
    </div>`;
  }).join('');
  // Gráfico anual
  const chartCard=`<div class="card" style="grid-column:1/-1;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div>
        <div class="card-title" style="margin-bottom:2px;">💰 Faturamento — Evolução Anual 2026</div>
        <div style="font-size:12px;color:var(--gray-500);">Acumulado mensal vs. meta anual de R$ ${metasAnuais.anoMeta.toLocaleString('pt-BR')}</div>
      </div>
      <button class="btn btn-ghost" style="font-size:12px;" onclick="openEditAnual()">✏️ Editar dados</button>
    </div>
    <div id="anual-chart-area">${buildAnualChart()}</div>
  </div>`;
  grid.innerHTML = chartCard + cards;
}

function submitEditMeta() {
  const m=metas[metaEditando]; if(!m) return;
  const atual=parseFloat(document.getElementById('meta-edit-atual').value), meta=parseFloat(document.getElementById('meta-edit-meta').value);
  if(!isNaN(atual)) m.atual=atual; if(!isNaN(meta)&&meta>0) m.meta=meta;
  closeModal('modal-metas-edit'); if(document.getElementById('metas-grid'))renderMetas(); showToast('Meta atualizada.');
}

function submitAnual() {
  metasAnuais.anoMeta=parseFloat(document.getElementById('anual-meta-total').value)||metasAnuais.anoMeta;
  for(let i=0;i<12;i++){const v=parseFloat(document.getElementById(`anual-mes-${i}`)?.value);metasAnuais.mensal[i]=isNaN(v)?0:Math.max(0,v);}
  closeModal('modal-anual-chart'); if(document.getElementById('metas-grid'))renderMetas(); showToast('Dados anuais atualizados.');
}

// ============== CAPACITAÇÕES ==============
function renderCapacitacoes() {
  const container=document.getElementById('cap-container'); if(!container) return;
  const canAdd=(currentUser.role==='Presidente'||currentUser.role==='Diretor');
  container.innerHTML=`<div class="cap-tree">
    ${Object.entries(capTree).map(([key,col])=>`
      <div class="cap-col-group">
        <div class="cap-col-header">${col.emoji} ${col.label}</div>
        <div class="cap-tracks">
          ${col.tracks.map((track,ti)=>`
            <div class="cap-track">
              ${track.map((cap,ci)=>{
                const locked=ci>0&&!track[ci-1].done;
                return `<div class="cap-node ${cap.done?'done':locked?'locked':''}" title="${cap.name}${locked?' (Bloqueado — complete o anterior)':''}">
                  <div class="cap-title">${cap.name}</div>
                  <div class="cap-status">${cap.done?'Concluído':locked?'🔒 Bloqueado':'Disponível'}</div>
                </div>`;
              }).join('')}
              ${canAdd?`<div class="cap-node add-slot" onclick="openAddCap('${key}',${ti})">
                <div class="cap-title">+ Adicionar</div>
              </div>`:''}
            </div>`).join('')}
        </div>
      </div>`).join('')}
  </div>
  <div style="margin-top:16px;display:flex;gap:14px;align-items:center;font-size:13px;color:var(--gray-600);">
    <div style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;background:var(--blue-600);border-radius:3px;display:inline-block;"></span> Concluído</div>
    <div style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;background:white;border:2px solid var(--blue-200);border-radius:3px;display:inline-block;"></span> Disponível</div>
    <div style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;background:var(--gray-100);border-radius:3px;display:inline-block;"></span> 🔒 Bloqueado</div>
  </div>`;
}

function submitCap() {
  const name=document.getElementById('new-cap-name').value.trim();
  if(!name){showToast('Informe o nome da capacitação.');return;}
  const {col,track}=capAddTarget;
  if(capTree[col]) capTree[col].tracks[track].push({name,done:false});
  closeModal('modal-add-cap');
  document.getElementById('new-cap-name').value=''; document.getElementById('new-cap-link').value='';
  if(document.getElementById('cap-container'))renderCapacitacoes();
  showToast('Capacitação adicionada.');
}

// ============== PERMISSÕES ==============
let permFilter={search:'',role:'',sector:''};

function renderPermissions() {
  const tbody=document.getElementById('permissions-table'); if(!tbody) return;
  const filtered=members.filter(m=>{
    const q=permFilter.search.toLowerCase();
    return(!q||m.name.toLowerCase().includes(q)||m.role.toLowerCase().includes(q))&&(!permFilter.role||m.role===permFilter.role)&&(!permFilter.sector||m.sector===permFilter.sector);
  });
  tbody.innerHTML=filtered.map(m=>{const gi=members.indexOf(m);return`
    <tr><td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar sm">${initials(m.name)}</div>
      <div><div style="font-weight:600;">${m.name}${m.self?' <span class="tag" style="font-size:10px;">Você</span>':''}</div>
      <div style="font-size:11px;color:var(--gray-500);">${m.name.toLowerCase().replace(' ','.')}@integrejr.com.br</div></div></div></td>
    <td><select data-i="${gi}" data-field="role" ${m.self?'disabled':''}>
      ${['Presidente','Diretor','Gerente','Membro','Trainee'].map(r=>`<option ${r===m.role?'selected':''}>${r}</option>`).join('')}</select></td>
    <td><select data-i="${gi}" data-field="sector" ${m.self?'disabled':''}>
      ${['Coordenação','Projetos','Comercial','ADM/FIN'].map(s=>`<option ${s===m.sector?'selected':''}>${s}</option>`).join('')}</select></td>
    <td><select data-i="${gi}" data-field="access" ${m.self?'disabled':''}>
      ${['Total','Diretoria','Gerência','Membro','Trainee'].map(a=>`<option ${a===m.access?'selected':''}>${a}</option>`).join('')}</select></td>
    <td><span class="tag ${m.status==='Ativo'?'green':'gray'}">${m.status}</span></td>
    <td>${m.self?'':` <button class="btn btn-ghost" onclick="toggleStatus(${gi})" style="font-size:12px;">${m.status==='Ativo'?'Desativar':'Reativar'}</button>`}</td>
    </tr>`;}).join('');
  tbody.querySelectorAll('select').forEach(sel=>sel.addEventListener('change',e=>{const i=parseInt(e.target.dataset.i),f=e.target.dataset.field;members[i][f]=e.target.value;showToast(`${members[i].name}: ${f} → ${e.target.value}`);}));
  const si=document.getElementById('perm-search'),rs=document.getElementById('perm-role'),ss=document.getElementById('perm-sector');
  if(si&&!si._wired){si._wired=true;si.addEventListener('input',()=>{permFilter.search=si.value;renderPermissions();});}
  if(rs&&!rs._wired){rs._wired=true;rs.addEventListener('change',()=>{permFilter.role=rs.value==='Todos os cargos'?'':rs.value;renderPermissions();});}
  if(ss&&!ss._wired){ss._wired=true;ss.addEventListener('change',()=>{permFilter.sector=ss.value==='Todos os setores'?'':ss.value;renderPermissions();});}
}

function toggleStatus(i) { members[i].status=members[i].status==='Ativo'?'Inativo':'Ativo'; renderPermissions(); showToast(`${members[i].name} agora está ${members[i].status}.`); }

// ============== INÍCIO ==============
goTo(DEFAULT_PAGE);
