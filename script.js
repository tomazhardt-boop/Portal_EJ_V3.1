// ============== CONFIG ==============
const DEFAULT_PAGE = 'dashboard';

const pageInitializers = {
  'dashboard':       renderDashboard,
  'configuracoes':   renderConfiguracoes,
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
  'atividades':      renderAtividades,
  'legado-todos':    renderLegadoTodos,
  'ponto':           renderPonto,
  'contratos':       renderContratos,
  'membros':         renderMembros,
  'drive':           renderDrive,
};

// Atualização 5: chave do cargo selecionado para a página "legado-todos".
let activeLegadoKey = null;

// Atualização 11: página atualmente carregada (inclui as que não são item da
// sidebar, ex.: 'projeto-detalhe'). Base para re-render em viradas de data.
let currentPage = DEFAULT_PAGE;

// Atualização 6: flag para ocultar pontuação dos trainees no ranking.
let hideTraineePoints = localStorage.getItem('hide_trainee_points') === '1';

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
// Fonte ÚNICA de verdade de pessoas. Trainee é apenas um membro com role:'Trainee';
// nesse caso ele carrega também `padrinho` e `points` (antes moravam num array `trainees`
// separado, que vivia descasando de `members`).
const members = [
  { name:'Carlos Mendes',   role:'Presidente',sector:'Coordenação',access:'Total',    status:'Ativo',  self:true,  course:'Eng. Controle e Automação',entryDate:'mar/2024',capsCount:12 },
  { name:'Ana Souza',       role:'Diretor',   sector:'Projetos',  access:'Diretoria',status:'Ativo',              course:'Eng. de Materiais',         entryDate:'jan/2024',capsCount:9  },
  { name:'Pedro Lima',      role:'Diretor',   sector:'ADM/FIN',   access:'Diretoria',status:'Ativo',              course:'Eng. Têxtil',               entryDate:'jan/2024',capsCount:7  },
  { name:'Júlia Ferreira',  role:'Gerente',   sector:'Comercial', access:'Gerência', status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'ago/2024',capsCount:6  },
  { name:'Lucas Almeida',   role:'Gerente',   sector:'Projetos',  access:'Gerência', status:'Ativo',              course:'Eng. de Materiais',         entryDate:'ago/2024',capsCount:8  },
  { name:'Bruna Costa',     role:'Membro',    sector:'Comercial', access:'Membro',   status:'Ativo',              course:'Eng. Têxtil',               entryDate:'fev/2025',capsCount:4  },
  { name:'Rafael Oliveira', role:'Membro',    sector:'Projetos',  access:'Membro',   status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'fev/2025',capsCount:5  },
  { name:'Marina Santos',   role:'Trainee',   sector:'Projetos',  access:'Trainee',  status:'Ativo',              course:'Eng. de Materiais',         entryDate:'mar/2026',capsCount:2, padrinho:'Lucas Almeida',   points:850 },
  { name:'Felipe Rocha',    role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'mar/2026',capsCount:1, padrinho:'Júlia Ferreira',  points:720 },
  { name:'Camila Dias',     role:'Trainee',   sector:'ADM/FIN',   access:'Trainee',  status:'Ativo',              course:'Eng. Têxtil',               entryDate:'mar/2026',capsCount:2, padrinho:'Pedro Lima',      points:690 },
  { name:'Gustavo Pereira', role:'Trainee',   sector:'Projetos',  access:'Trainee',  status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'mar/2026',capsCount:1, padrinho:'Bruna Costa',     points:540 },
  { name:'Larissa Mota',    role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Ativo',              course:'Eng. de Materiais',         entryDate:'mar/2026',capsCount:1, padrinho:'Rafael Oliveira', points:480 },
  { name:'Henrique Vargas', role:'Trainee',   sector:'Comercial', access:'Trainee',  status:'Inativo',            course:'Eng. Têxtil',               entryDate:'mar/2026',capsCount:0, padrinho:'Ana Souza',       points:410 },
  { name:'Beatriz Lopes',   role:'Trainee',   sector:'Projetos',  access:'Trainee',  status:'Ativo',              course:'Eng. Controle e Automação',entryDate:'mar/2026',capsCount:0, padrinho:'Carlos Mendes',   points:340 },
];

// ============== TRAINEES ==============
// Derivado de `members` — não há mais lista separada. Trainee = membro role:'Trainee'.
// (Inclui inativos, como era no array antigo; quem renderiza decide se filtra.)
function getTrainees() { return members.filter(m => m.role === 'Trainee'); }

let pendingValidations = [
  { trainee:'Marina Santos', activity:'Concluir capacitação básica - HTML', points:100, padrinho:'Lucas Almeida',  sent:'23/05/2026' },
  { trainee:'Felipe Rocha',  activity:'Escrever resumo das RNNs',           points:60,  padrinho:'Júlia Ferreira', sent:'22/05/2026' },
  { trainee:'Beatriz Lopes', activity:'Conhecer cada setor (entrevista)',   points:50,  padrinho:'Carlos Mendes',  sent:'25/05/2026' },
];

// ============== ATIVIDADES ==============
let activities = [
  { id:1, name:'Conhecer cada setor (entrevista)',   points:50,  area:'Projetos',  desc:'Realize uma entrevista de 15 minutos com um membro de cada setor. Documente os aprendizados e apresente ao padrinho.' },
  { id:2, name:'Participar de 1 reunião setorial',   points:30,  area:'ADM/FIN',   desc:'Participe de uma reunião do setor ao qual você está vinculado. Leve anotações para apresentar ao padrinho.' },
  { id:3, name:'Concluir capacitação básica',        points:100, area:'Projetos',  desc:'Conclua qualquer capacitação da trilha básica disponível na página de Capacitações e envie o certificado ao padrinho.' },
  { id:4, name:'Apresentar um projeto antigo',       points:80,  area:'Projetos',  desc:'Escolha um projeto do legado da Integre Jr e apresente um resumo de 5 minutos para os membros do seu setor.' },
  { id:5, name:'Conversar com um diretor',           points:40,  area:'ADM/FIN',   desc:'Agende uma conversa informal de no mínimo 10 minutos com um dos diretores. Registre os principais pontos discutidos.' },
  { id:6, name:'Escrever resumo das RNNs',           points:60,  area:'ADM/FIN',   desc:'Leia as RNNs e escreva um resumo de 1 página com os principais valores e normas da empresa.' },
  { id:7, name:'Participar de 1 projeto como apoio', points:150, area:'Projetos',  desc:'Contribua ativamente com pelo menos uma entrega em um projeto em andamento.' },
  { id:8, name:'Apresentar pitch da Integre Jr',     points:120, area:'Comercial', desc:'Prepare um pitch de 3 minutos sobre a Integre Jr e apresente para pelo menos 2 pessoas externas.' },
  // Atualização 9.1: 4 atividades FIXAS (uma por setor). São botões de link para
  // um PDF, SEM pontuação; o link só é editável por membros habilitados (botão direito).
  { id:9,  name:'Atividade Obrigatória',  points:0, area:'Projetos',  mandatory:true, link:'', desc:'Atividade fixa do setor Projetos.' },
  { id:10, name:'Atividade Obrigatória',  points:0, area:'Comercial', mandatory:true, link:'', desc:'Atividade fixa do setor Comercial.' },
  { id:11, name:'Atividade Obrigatória',  points:0, area:'ADM/FIN',   mandatory:true, link:'', desc:'Atividade fixa do setor ADM/FIN.' },
  { id:12, name:'Atividade Obrigatória',  points:0, area:'Diretoria', mandatory:true, link:'', desc:'Atividade fixa do setor Diretoria.' },
];
let activityIdCounter = 13;
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
let activeProjectFilter = 'ativos';  // Projetos: 'ativos' | 'concluidos' | 'todos'

// ============== CALENDÁRIO ==============
// Atualização 12: eventos passam a ter DATA REAL (iso 'AAAA-MM-DD', com ano). day/month/
// year/monthIdx são derivados do iso para exibição. A listagem agrupa por mês/ano.
const MONTH_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function eventDateParts(iso) {
  const [y,m,d] = (iso||'').split('-').map(Number);
  return { year:y||0, monthIdx:(m||1)-1, day:String(d||1).padStart(2,'0'), month:MONTH_ABBR[(m||1)-1] };
}
let calendarEvents = [
  { iso:'2026-05-25',title:'Reunião do Conselho',       meta:'17h · Sede · Diretoria',           visibility:'diretoria',cls:'gray', category:'reuniao-interna' },
  { iso:'2026-05-26',title:'Mentoria de Trainees',      meta:'18h · Sede · Padrinhos + Trainees', visibility:'trainee',  cls:'',     category:'evento'          },
  { iso:'2026-05-28',title:'Reunião Geral',             meta:'19h · Sede · Todos os membros',     visibility:'geral',    cls:'green',category:'reuniao-interna' },
  { iso:'2026-05-30',title:'Capacitação: HTML básico',  meta:'14h · Online · Trainees',           visibility:'trainee',  cls:'green',category:'evento'          },
  { iso:'2026-06-02',title:'Reunião Setor Projetos',    meta:'18h · Sede · Setor Projetos',       visibility:'setorial', cls:'',     category:'reuniao-interna' },
  { iso:'2026-06-05',title:'Reunião Setor Comercial',   meta:'18h · Online · Setor Comercial',    visibility:'setorial', cls:'',     category:'reuniao-interna' },
  { iso:'2026-06-10',title:'Capacitação: Vendas',       meta:'14h · Sede · Todos',                visibility:'geral',    cls:'green',category:'evento'          },
  { iso:'2026-06-15',title:'Confraternização semestral',meta:'20h · Espaço Aurora · Todos',       visibility:'geral',    cls:'green',category:'evento'          },
].map(e => ({ ...e, ...eventDateParts(e.iso) }));

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
  colabs:      { label:'Faturamento em Colaboração',  prefixo:'R$', sufixo:'',  meta:30000, atual:5000  },
  engajamento: { label:'Engajamento dos Membros',     prefixo:'',   sufixo:'%', meta:80,    atual:65    },
};
let metaEditando = null;

let metasAnuais = {
  anoMeta: 180000,
  mensal:  [8500, 7200, 9800, 11000, 8500, 0, 0, 0, 0, 0, 0, 0],
};

// Atualização 8 (itens 4/5): o card "Faturamento Mensal" é um ESPELHO do
// gráfico anual. A meta mensal = meta anual ÷ 12 (item 5) e o valor atual = o
// realizado do mês corrente no gráfico (item 4). Assim, editar um reflete no outro.
function fatMonthIndex() { return appToday().getMonth(); }           // mês corrente (0-11)
function syncFaturamentoFromAnual() {
  if (!metas.faturamento) return;
  metas.faturamento.atual = metasAnuais.mensal[fatMonthIndex()] || 0; // item 4
  metas.faturamento.meta  = Math.round(metasAnuais.anoMeta / 12);     // item 5
}

// ============== CAPACITAÇÕES TREE ==============
let capTree = {
  programacao:  { label:'Programação',    emoji:'', tracks:[
    [{ name:'HTML básico',     done:true }, { name:'CSS básico',        done:true  }, { name:'JavaScript',     done:true  }, { name:'React',                    done:false }],
    [{ name:'Sites estáticos', done:true }, { name:'Sites interativos', done:true  }],
  ]},
  financeiro:   { label:'Financeiro',     emoji:'', tracks:[
    [{ name:'Excel básico',    done:true }, { name:'Excel avançado',    done:true  }],
    [{ name:'Power BI básico', done:false }],
  ]},
  marketing:    { label:'Marketing',      emoji:'', tracks:[
    [{ name:'Comunicação',     done:true }, { name:'Atendimento ao cliente', done:true }, { name:'Vendas', done:true }],
    [],
  ]},
  administracao:{ label:'Administração',  emoji:'', tracks:[
    [{ name:'Gestão de tempo', done:true }, { name:'Gestão de projetos', done:true }],
    [{ name:'Liderança',       done:true }],
  ]},
  gerencia:     { label:'Gerência',       emoji:'', tracks:[
    [{ name:'Gestão de Projetos com Notion', done:false }],
    [],
  ]},
  prototipagem: { label:'Prototipagem',   emoji:'', tracks:[[], []] },
};
let capAddTarget = { col: null, track: 0 };

// ============== ARQUIVOS (DRIVE) — Atualização 9.1 ==============
// Tópicos = botões que levam a uma pasta/arquivo no Google Drive. Quem pode
// editar a plataforma adiciona/remove/renomeia tópicos e troca os links.
let driveTopics = [
  { id:1, name:'Planilhas Financeiras',     icon:'📁', link:'' },
  { id:2, name:'Materiais de Capacitações', icon:'📁', link:'' },
  { id:3, name:'Projetos Antigos',          icon:'📁', link:'' },
  { id:4, name:'Templates Internos',        icon:'📁', link:'' },
  { id:5, name:'Identidade Visual',         icon:'📁', link:'' },
  { id:6, name:'Documentos Jurídicos',      icon:'📁', link:'' },
];
let driveTopicIdCounter = 7;

// ============== NAVEGAÇÃO ==============
async function goTo(page, opts = {}) {
  const contentEl = document.getElementById('content');
  // Atualização 10: guarda de acesso — bloqueia páginas sem permissão para o cargo.
  if (!canSeePage(page)) {
    showToast('Você não tem acesso a esta página.');
    if (page !== DEFAULT_PAGE) goTo(DEFAULT_PAGE);
    return;
  }
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    contentEl.innerHTML = await response.text();
    document.querySelectorAll('.nav-item').forEach(n => { n.classList.remove('active'); n.removeAttribute('aria-current'); });
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) { navItem.classList.add('active'); navItem.setAttribute('aria-current', 'page'); }
    currentPage = page;           // rastreia a página ativa (p/ re-render em viradas de data)
    if (pageInitializers[page]) pageInitializers[page]();
    applyPagePermissions(page);   // esconde botões de criação/edição não permitidos
    if (opts.onLoaded) opts.onLoaded();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><h2>Erro ao carregar "${page}"</h2></div>`;
  }
}

function openProject(id) {
  const p = projects.find(x => x.id === id);
  // Atualização 10: só abre projeto se for diretor/presidente ou estiver relacionado.
  if (p && !can('projeto.open', { project: p })) {
    showToast('Você não tem acesso a este projeto.');
    return;
  }
  activeProjectId = id;
  goTo('projeto-detalhe');
}

document.querySelectorAll('.nav-item').forEach(item => {
  // Acessibilidade: divs viram "botões" navegáveis por teclado (Tab + Enter/Espaço).
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.addEventListener('click', () => { goTo(item.dataset.page); closeMobileNav(); });
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(item.dataset.page); closeMobileNav(); }
  });
});

function toggleSidebar() {
  const app = document.querySelector('.app');
  app.classList.toggle('sidebar-collapsed');
  const btn = document.querySelector('.sidebar-toggle-btn');
  if (btn) btn.textContent = app.classList.contains('sidebar-collapsed') ? '▶' : '◀';
}

// Gaveta de navegação no MOBILE: a sidebar vira um menu deslizante por cima do
// conteúdo. (toggleSidebar acima é o "recolher" do DESKTOP — coisas diferentes.)
function toggleMobileNav() {
  const app = document.querySelector('.app');
  if (!app) return;
  const open = app.classList.toggle('mobile-nav-open');
  const burger = document.querySelector('.nav-burger');
  if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeMobileNav() {
  const app = document.querySelector('.app');
  if (!app || !app.classList.contains('mobile-nav-open')) return;
  app.classList.remove('mobile-nav-open');
  const burger = document.querySelector('.nav-burger');
  if (burger) burger.setAttribute('aria-expanded', 'false');
}

// ============== MODAIS ==============
function openNewAviso()   { if (!can('aviso.create'))      { showToast('Sem permissão para criar avisos.'); return; }      populateAvisoMembros(); document.getElementById('modal-aviso').classList.add('active'); updateAvisoSubFields(); }
function openNewEvent()   { if (!can('calendario.create')) { showToast('Apenas Gerente ou acima cria eventos.'); return; } populateEventoMembros(); document.getElementById('modal-evento').classList.add('active'); updateEventoSubFields(); }
function openNewProject() { if (!can('projeto.create'))    { showToast('Sem permissão para criar projetos.'); return; }    populateLeaderSelect(); document.getElementById('modal-projeto').classList.add('active'); }
function openEditPerfil() { populateEditPerfil(); document.getElementById('modal-perfil-edit').classList.add('active'); }
function closeModal(id)   { document.getElementById(id).classList.remove('active'); }

function openManageMembers() {
  const p = projects.find(x => x.id === activeProjectId);
  if (!p) return;
  if (!can('projeto.editData', { project: p })) { showToast('Sem permissão para editar este projeto.'); return; }
  refreshManageMembersModal(p);
  document.getElementById('modal-membros').classList.add('active');
}

function openEditProject() {
  const p = projects.find(x => x.id === activeProjectId);
  if (!p) return;
  if (!can('projeto.editData', { project: p })) { showToast('Sem permissão para editar este projeto.'); return; }
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
  // Atualização 8 (item 5): faturamento tem meta derivada (anual ÷ 12) — esconde o campo.
  const isFat = campo === 'faturamento';
  const row  = document.getElementById('meta-edit-meta-row');
  const nota = document.getElementById('meta-edit-meta-nota');
  if (row)  row.style.display  = isFat ? 'none' : '';
  if (nota) nota.style.display = isFat ? '' : 'none';
  document.getElementById('modal-metas-edit').classList.add('active');
}

function openEditAnual() {
  const total = document.getElementById('anual-meta-total');
  total.value = metasAnuais.anoMeta;
  total.oninput = () => updateAnualLive();
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const grid = document.getElementById('anual-mensal-grid');
  if (grid) grid.innerHTML = months.map((m, i) => `
    <div style="display:flex;flex-direction:column;gap:3px;">
      <label style="font-size:11px;font-weight:600;color:var(--gray-500);">${m}</label>
      <input type="number" id="anual-mes-${i}" value="${metasAnuais.mensal[i]}" min="0" step="100"
             oninput="updateAnualLive(${i}, this.value)"
             style="width:100%;padding:5px 7px;font-size:12px;border:1px solid var(--gray-300);border-radius:6px;" />
    </div>`).join('');
  document.getElementById('modal-anual-chart').classList.add('active');
}

// Atualização 4.1: data binding ao vivo do gráfico anual.
// Cada input do mês altera metasAnuais.mensal[i] e re-renderiza só o gráfico.
function updateAnualLive(monthIdx, val) {
  if (monthIdx !== undefined) {
    const v = parseFloat(val);
    metasAnuais.mensal[monthIdx] = isNaN(v) ? 0 : Math.max(0, v);
  }
  const totalEl = document.getElementById('anual-meta-total');
  if (totalEl) {
    const t = parseFloat(totalEl.value);
    if (!isNaN(t) && t > 0) metasAnuais.anoMeta = t;
  }
  const area = document.getElementById('anual-chart-area');
  if (area) area.innerHTML = buildAnualChart();
}

function openAddCap(colKey, trackIdx) {
  capAddTarget = { col: colKey, track: trackIdx };
  document.getElementById('new-cap-col-label').textContent =
    `${capTree[colKey]?.label} — Trilha ${trackIdx + 1}`;
  document.getElementById('new-cap-name').value = '';
  document.getElementById('new-cap-link').value = '';
  document.getElementById('modal-add-cap').classList.add('active');
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});

// ============== CONTEXT MENU + PROMPT MODAL (Atualização 5) ==============
function closeContextMenu() {
  document.querySelectorAll('.ctx-menu').forEach(m => m.remove());
}

function showContextMenu(event, items) {
  closeContextMenu();
  const m = document.createElement('div');
  m.className = 'ctx-menu';
  m.style.left = event.pageX + 'px';
  m.style.top  = event.pageY + 'px';
  m.innerHTML = items.map((it, i) =>
    `<div class="ctx-item${it.danger ? ' danger' : ''}" data-i="${i}">${it.label}</div>`
  ).join('');
  document.body.appendChild(m);
  m.querySelectorAll('.ctx-item').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(el.dataset.i);
      closeContextMenu();
      items[idx].onClick();
    });
  });
  // Ajuste para não sair da tela
  const r = m.getBoundingClientRect();
  if (r.right > window.innerWidth)  m.style.left = (event.pageX - r.width) + 'px';
  if (r.bottom > window.innerHeight) m.style.top  = (event.pageY - r.height) + 'px';

  const closer = (e) => {
    if (m.contains(e.target)) return;
    closeContextMenu();
    document.removeEventListener('click', closer);
    document.removeEventListener('contextmenu', closer);
  };
  setTimeout(() => {
    document.addEventListener('click', closer);
    document.addEventListener('contextmenu', closer);
  }, 0);
}

function openPromptModal(opts) {
  document.getElementById('prompt-titulo').textContent = opts.titulo || 'Editar';
  document.getElementById('prompt-sub').textContent    = opts.sub || '';
  document.getElementById('prompt-label').textContent  = opts.label || 'Valor';
  const input = document.getElementById('prompt-input');
  input.value = opts.value || '';
  input.placeholder = opts.placeholder || '';
  const btn = document.getElementById('prompt-confirm-btn');
  btn.textContent = opts.confirmLabel || 'Salvar';
  btn.onclick = () => {
    const v = input.value.trim();
    if (opts.onConfirm) opts.onConfirm(v);
    closeModal('modal-prompt');
  };
  input.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
  document.getElementById('modal-prompt').classList.add('active');
  setTimeout(() => input.focus(), 50);
}

// ============== TOAST ==============
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ---- Estados de carregamento ----
// Overlay de tela cheia, usado durante as cargas do banco no login.
function showAppLoading(msg) {
  const el = document.getElementById('app-loading'); if (!el) return;
  const m = document.getElementById('app-loading-msg'); if (m && msg) m.textContent = msg;
  el.classList.add('show'); el.setAttribute('aria-hidden', 'false');
}
function hideAppLoading() {
  const el = document.getElementById('app-loading'); if (!el) return;
  el.classList.remove('show'); el.setAttribute('aria-hidden', 'true');
}
// Splash de abertura: some com fade quando o boot decide (app pronto ou login).
function hideBootSplash() {
  const el = document.getElementById('boot-splash'); if (!el) return;
  el.classList.add('hide'); el.setAttribute('aria-hidden', 'true');
  setTimeout(() => { el.style.display = 'none'; }, 400);  // remove após o fade
}
// Coloca/retira um botão no estado "ocupado" (spinner + bloqueado). Retorna uma
// função que restaura o botão ao estado anterior.
function setBtnLoading(btn) {
  if (!btn) return () => {};
  btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
  return () => { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); btn.disabled = false; };
}

// ============== HELPERS ==============
function initials(name) { return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase(); }
function getMemberRole(name) { const m = members.find(x => x.name === name); return m ? `${m.role} · Setor ${m.sector}` : ''; }
function getMemberSector(name) { const m = members.find(x => x.name === name); return m ? m.sector : ''; }

// Atualização 9.1: ponto único de "pode editar a plataforma" (administrador).
// Mantido por compatibilidade (usado em edições globais: nome/logo da empresa,
// conteúdo de RNN/Capacitações). Equivale a "Presidente ou Diretor".
function canEditPlatform() { return currentUser.role === 'Presidente' || currentUser.role === 'Diretor'; }

// ============================================================================
// PERMISSÕES POR CARGO (Atualização 10 — Níveis de acesso)
// ----------------------------------------------------------------------------
// Controle de acesso CENTRALIZADO e declarativo, a partir de niveis_de_acesso.md.
// Tudo passa por aqui: a sidebar, o goTo e as ações. Isso (a) deixa a regra num
// lugar só e (b) é o MESMO desenho que vira as policies de RLS no Supabase depois.
//
// IMPORTANTE: no protótipo isto é controle de UX, NÃO segurança real — o usuário
// pode burlar via console/localStorage. A trava de verdade é no backend (RLS).
//
// "Cargo" da matriz = role + setor (para Diretor/Gerente). profileKey() resolve isso.
// ============================================================================
const ROLE_RANK = { 'Trainee': 0, 'Membro': 1, 'Gerente': 2, 'Diretor': 3, 'Presidente': 4 };
function roleAtLeast(role, u = currentUser) { return (ROLE_RANK[u.role] ?? 0) >= (ROLE_RANK[role] ?? 99); }

function profileKey(u = currentUser) {
  if (u.role === 'Presidente') return 'presidente';
  if (u.role === 'Diretor')    return 'diretor:' + u.sector;
  if (u.role === 'Gerente')    return 'gerente:' + u.sector;
  if (u.role === 'Trainee')    return 'trainee';
  return 'membro';
}

// Cada página pertence a uma "coluna" da matriz. Páginas fora do mapa (ex.:
// projeto-detalhe, atividades) não têm regra própria — são tratadas no fluxo.
const PAGE_GROUP = {
  dashboard: 'pte', perfil: 'pte', avisos: 'pte', capacitacoes: 'pte', trainees: 'pte', rnn: 'pte', legado: 'pte',
  calendario: 'calendario', ponto: 'ponto', projetos: 'projetos', drive: 'arquivos',
  membros: 'membros', contratos: 'contratos', metas: 'metas', configuracoes: 'configuracoes',
};

// Acesso por perfil × coluna: 'edit' | 'view' | 'none' | 'cond' (condicional).
// Espelha a matriz de niveis_de_acesso.md.
const COL_ACCESS = {
  'presidente':          { pte:'edit', membros:'edit', configuracoes:'edit', contratos:'edit', metas:'edit',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'diretor:Coordenação': { pte:'edit', membros:'edit', configuracoes:'edit', contratos:'edit', metas:'edit',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'diretor:ADM/FIN':     { pte:'edit', membros:'view', configuracoes:'edit', contratos:'edit', metas:'edit',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'diretor:Projetos':    { pte:'edit', membros:'view', configuracoes:'edit', contratos:'edit', metas:'edit',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'diretor:Comercial':   { pte:'edit', membros:'view', configuracoes:'edit', contratos:'edit', metas:'edit',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'gerente:Coordenação': { pte:'view', membros:'view', configuracoes:'none', contratos:'none', metas:'none',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'gerente:ADM/FIN':     { pte:'view', membros:'none', configuracoes:'none', contratos:'edit', metas:'view',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'gerente:Projetos':    { pte:'view', membros:'none', configuracoes:'none', contratos:'none', metas:'none',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'gerente:Comercial':   { pte:'view', membros:'none', configuracoes:'none', contratos:'none', metas:'none',  arquivos:'edit', projetos:'cond', calendario:'edit', ponto:'edit' },
  'membro':              { pte:'view', membros:'none', configuracoes:'none', contratos:'none', metas:'none',  arquivos:'view', projetos:'cond', calendario:'view', ponto:'edit' },
  'trainee':             { pte:'view', membros:'none', configuracoes:'none', contratos:'none', metas:'none',  arquivos:'none', projetos:'cond', calendario:'view', ponto:'edit' },
};

function colAccess(page, u = currentUser) {
  const col = PAGE_GROUP[page]; if (!col) return 'edit';   // página sem regra própria
  const row = COL_ACCESS[profileKey(u)] || COL_ACCESS['membro'];
  return row[col] || 'none';
}

// --- Feature-flags (módulos vendáveis por EJ) ---
// Núcleo: páginas que NUNCA desligam (login não é página). Independem de config.
const CORE_PAGES = ['dashboard', 'perfil', 'membros', 'configuracoes', 'atividades'];
// Páginas internas (fora da sidebar) herdam o módulo do "pai".
const MODULE_OF = { 'projeto-detalhe': 'projetos', 'legado-todos': 'legado' };
// O módulo de uma página está ativo? Núcleo sempre sim; flag ausente = ativo
// (não quebra páginas internas sem flag própria).
function moduleEnabled(page) {
  if (CORE_PAGES.includes(page)) return true;
  const flags = window.MODULES || {};
  const mod = MODULE_OF[page] || page;
  return flags[mod] !== false;
}

// Vê a página = módulo ativo E cargo com acesso (não-'none'). Cobre sidebar
// (applySidebarPermissions) e o guard de navegação (goTo) de uma vez só.
function canSeePage(page, u = currentUser) { return moduleEnabled(page) && colAccess(page, u) !== 'none'; }
function pageMode(page, u = currentUser) {
  const a = colAccess(page, u);
  return a === 'edit' ? 'edit' : (a === 'none' ? 'none' : 'view'); // 'cond' conta como view (lista de projetos)
}
function canEditPage(page, u = currentUser) { return pageMode(page, u) === 'edit'; }

// --- Regras condicionais (vínculo a projeto / padrinho) ---
function isMemberOfProject(p, name = currentUser.name) {
  if (!p) return false;
  return (Array.isArray(p.memberNames) && p.memberNames.includes(name)) || p.leader === name;
}
// Abrir/visualizar projeto: diretor/presidente (todos) ou relacionado ao projeto.
function canOpenProject(p, u = currentUser) {
  return u.role === 'Presidente' || u.role === 'Diretor' || isMemberOfProject(p, u.name);
}
// Editar dados do projeto: Presidente, Diretor de Projetos, ou Gerente de Projetos relacionado.
function canEditProject(p, u = currentUser) {
  if (u.role === 'Presidente') return true;
  if (u.role === 'Diretor'  && u.sector === 'Projetos') return true;
  if (u.role === 'Gerente'  && u.sector === 'Projetos' && isMemberOfProject(p, u.name)) return true;
  return false;
}
// Aprovar pedido de trainee: exclusivo do padrinho daquele trainee (qualquer cargo).
function canApproveTrainee(traineeName, u = currentUser) {
  const t = members.find(m => m.name === traineeName);
  return !!t && t.padrinho === u.name;
}

// Permissão de uma AÇÃO discreta. ctx leva {project, trainee} quando aplicável.
function can(action, ctx = {}, u = currentUser) {
  switch (action) {
    case 'perfil.editOwn':    return true;                       // todos editam o próprio perfil
    case 'ponto.use':         return true;                       // ponto livre para todos
    case 'aviso.create':      return roleAtLeast('Membro', u);   // Membro ↑
    case 'atividade.create':  return roleAtLeast('Membro', u);   // Membro ↑
    case 'capacitacao.edit':  return roleAtLeast('Membro', u);   // todos menos Trainee
    case 'calendario.create': return roleAtLeast('Gerente', u);  // Gerente ↑
    case 'membros.edit':      return u.role === 'Presidente' || (u.role === 'Diretor' && u.sector === 'Coordenação');
    case 'contratos.use':     return canEditPage('contratos', u);
    case 'projeto.create':    return u.role === 'Presidente' || u.role === 'Diretor';
    case 'projeto.open':      return canOpenProject(ctx.project, u);
    case 'projeto.editData':  return canEditProject(ctx.project, u);
    case 'trainee.approve':   return canApproveTrainee(ctx.trainee, u);
    default:                  return canEditPage(ctx.page || '', u);
  }
}

// --- Aplicação na UI ---
// Esconde da sidebar as páginas sem acesso (none). Chamar ao entrar/trocar usuário.
function applySidebarPermissions() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    const page = item.dataset.page;
    item.style.display = canSeePage(page) ? '' : 'none';
  });
  // Esconde títulos de seção que ficaram sem nenhum item visível.
  document.querySelectorAll('.sidebar .nav-section-title').forEach(title => {
    let anyVisible = false;
    for (let el = title.nextElementSibling; el && el.classList.contains('nav-item'); el = el.nextElementSibling) {
      if (el.style.display !== 'none') { anyVisible = true; break; }
    }
    title.style.display = anyVisible ? '' : 'none';
  });
}

// Esconde botões de criação/edição embutidos nas páginas estáticas, conforme a
// permissão. Centraliza o que seria espalhado por cada pages/*.html.
function applyPagePermissions(page) {
  const rules = [
    ['openNewAviso()',     () => can('aviso.create')],
    ['openNewEvent()',     () => can('calendario.create')],
    ['openNewProject()',   () => can('projeto.create')],
    ['openNewActivity()',  () => can('atividade.create')],
    ['openEditarTopicos()',() => canEditPage('capacitacoes')],
    ['openAddRegistro()',  () => canEditPage('legado')],
    ['openEditRNN()',      () => canEditPage('rnn')],
  ];
  rules.forEach(([onclick, allow]) => {
    document.querySelectorAll(`[onclick="${onclick}"]`).forEach(btn => {
      btn.style.display = allow() ? '' : 'none';
    });
  });
}

function calcTaskStatus(task) {
  if (task.done) return { status:'Concluída', cls:'green' };
  if (task.due && task.due !== 'Sem prazo') {
    const [d,m,y] = task.due.split('/');
    const due = new Date(+y,+m-1,+d); const today = appToday(); // usa o relógio do protótipo (simulável)
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
  // Feature-flags: esconde os cards de módulos desligados (data-module no HTML).
  document.querySelectorAll('#content [data-module]').forEach(el => {
    el.style.display = moduleEnabled(el.dataset.module) ? '' : 'none';
  });
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('dash-projetos-val', projects.filter(p => !p.concluded).length);
  set('dash-membros-val',  members.filter(m => m.status === 'Ativo').length);
  set('dash-trainees-val', members.filter(m => m.role === 'Trainee' && m.status === 'Ativo').length + ' trainees');
  set('dash-caps-val',     capacitacoes.length);
  const _td=appToday(), _ty=_td.getFullYear(), _tm=_td.getMonth();
  set('dash-reunioes-val', calendarEvents.filter(e => (e.category==='reuniao-interna'||e.category==='reuniao-externa') && e.year===_ty && e.monthIdx===_tm).length);

  const avisosEl = document.getElementById('dash-avisos');
  if (avisosEl) avisosEl.innerHTML = activeAvisos().slice(0,3).map(a => `
    <div class="aviso ${a.color}"><div class="head"><div class="title">${gesc(a.title)}</div><span class="tag ${a.color}">${a.type.charAt(0).toUpperCase()+a.type.slice(1)}</span></div>
    <div class="body">${gsafe(a.body)}</div></div>`).join('') || '<div class="u-muted text-13">Nenhum aviso.</div>';

  const eventosEl = document.getElementById('dash-eventos');
  const _todayIso = `${_ty}-${String(_tm+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
  const _proximos = calendarEvents.filter(e => (e.iso || '') >= _todayIso).slice(0,4);  // só eventos futuros
  if (eventosEl) eventosEl.innerHTML = _proximos.map(e => `
    <div class="event-row">
      <div class="event-date"><div class="day">${e.day}</div><div class="mon">${e.month}</div></div>
      <div class="event-info"><div class="title">${e.title}</div><div class="meta">${e.meta}</div></div>
    </div>`).join('') || '<div class="u-muted text-13">Nenhum evento próximo.</div>';

  const projListEl = document.getElementById('dash-proj-list');
  if (projListEl) projListEl.innerHTML = projects.filter(p=>!p.concluded).slice(0,4).map(p =>
    `<tr><td><b>${gesc(p.name)}</b></td><td>${gesc(p.sector)}</td><td><span class="tag ${p.statusClass}">${gesc(p.status)}</span></td></tr>`
  ).join('') || '<tr><td colspan="3" style="color:var(--gray-500);">Nenhum projeto ativo.</td></tr>';

  // Atualização 5: progresso das metas no dashboard
  const dashMetasEl = document.getElementById('dash-metas');
  if (dashMetasEl) {
    dashMetasEl.innerHTML = Object.entries(metas)
      .map(([campo, m]) => buildMetaCard(campo, m, { compact: true }))
      .join('');
  }

  const rankEl = document.getElementById('dash-ranking');
  if (rankEl) {
    const medals = ['gold','silver','bronze'];
    rankEl.innerHTML = getTrainees().sort((a,b)=>b.points-a.points).slice(0,4).map((t,i) => `
      <div class="rank-row">
        <div class="rank-pos ${medals[i]||''}">${i+1}</div>
        <div class="rank-info"><div class="name">${gesc(t.name)}</div><div class="role">Trainee · ${gesc(getMemberSector(t.name))}</div></div>
        ${hideTraineePoints ? '' : `<div class="rank-points">${t.points} pts</div>`}
      </div>`).join('');
  }

  const membrosListEl = document.getElementById('dash-membros-lista');
  if (membrosListEl) {
    membrosListEl.innerHTML = members.filter(m=>m.status==='Ativo').map(m => `
      <div onclick="openMemberProfile(${jsArg(m.name)})"
           style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--gray-50);border-radius:10px;cursor:pointer;transition:background .15s;"
           onmouseover="this.style.background='var(--blue-50)'" onmouseout="this.style.background='var(--gray-50)'">
        <div class="avatar sm">${initials(m.name)}</div>
        <div><div style="font-weight:600;font-size:13px;">${gesc(m.name)}</div><div style="font-size:11px;color:var(--gray-500);">${gesc(m.role)} · ${gesc(m.sector)}</div></div>
      </div>`).join('');
  }
}

function openMemberProfile(name) {
  const m = members.find(x => x.name === name);
  if (!m) return;
  const active    = projects.filter(p => p.memberNames.includes(name) && !p.concluded);
  const concluded = projects.filter(p => p.memberNames.includes(name) && p.concluded);
  const t = m.role === 'Trainee' ? m : null; // pontos vivem no próprio membro agora
  const content = `
    <div class="profile-head">
      <div class="avatar lg">${initials(name)}</div>
      <div>
        <h3>${gesc(name)}</h3>
        <div class="u-muted text-13 mt-2">${gesc(m.role)} · ${gesc(m.sector)}</div>
        <div class="u-muted-soft text-sm mt-2">${gesc(m.course || '—')}</div>
        <div class="u-muted-soft text-sm">Entrou em ${gesc(m.entryDate || '—')}</div>
      </div>
    </div>
    <div class="profile-stats">
      <div class="stat-tile">
        <div class="st-num">${active.length}</div>
        <div class="st-label">Projetos ativos</div>
      </div>
      <div class="stat-tile green">
        <div class="st-num">${concluded.length}</div>
        <div class="st-label">Concluídos</div>
      </div>
      ${t
        ? `<div class="stat-tile amber"><div class="st-num">${t.points}</div><div class="st-label">Pts trainee</div></div>`
        : `<div class="stat-tile"><div class="st-num">${m.capsCount || 0}</div><div class="st-label">Capacitações</div></div>`}
    </div>
    ${active.length > 0 ? `
      <div class="section-label">Projetos em andamento</div>
      <div class="u-col gap-6">
        ${active.map(p=>`<div class="mini-list-row"><b>${gesc(p.name)}</b><span class="tag">${gesc(p.sector)}</span></div>`).join('')}
      </div>` : ''}`;
  document.getElementById('membro-perfil-content').innerHTML = content;
  document.getElementById('modal-membro-perfil').classList.add('active');
}

// ============== PERFIL ==============
function renderPerfil() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('perfil-name',        currentUser.name);
  set('perfil-role',        `${currentUser.role} · ${currentUser.sector}`);
  set('perfil-email-text',  currentUser.email);
  set('perfil-date-text',   'Entrou em ' + currentUser.entryDate);
  set('perfil-course-text', currentUser.course);
  set('perfil-cap-count',   currentUser.caps.length);
  const av = document.getElementById('perfil-avatar');
  if (av) {
    if (currentUser.photo) { av.style.backgroundImage=`url(${currentUser.photo})`; av.style.backgroundSize='cover'; av.textContent=''; }
    else { av.style.backgroundImage=''; av.textContent=currentUser.avatar; }
  }
  const removeBtn = document.getElementById('perfil-remove-photo');
  if (removeBtn) removeBtn.style.display = currentUser.photo ? 'inline-flex' : 'none';
  // Padrinho: só para trainees. Mostra nome · setor · e-mail (para contato).
  const padEl = document.getElementById('perfil-padrinho-text');
  if (padEl) {
    if (currentUser.role === 'Trainee' && currentUser.padrinho) {
      const p = members.find(m => m.name === currentUser.padrinho);
      const extra = p ? ` · ${gesc(p.sector)} · ${gesc(memberEmail(p))}` : '';
      padEl.innerHTML = `Padrinho: <b>${gesc(currentUser.padrinho)}</b>${extra}`;
      padEl.style.display = '';
    } else {
      padEl.style.display = 'none';
    }
  }
  const caps = document.getElementById('perfil-caps');
  if (caps) caps.innerHTML = currentUser.caps.map(c=>`<span class="tag">${gesc(c)}</span>`).join('');
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
  // Fonte = capacitações da árvore (inclui as adicionadas pelo admin), menos as já feitas.
  const todas = sbClient ? allCapNames() : capacitacoes;
  const disp = todas.filter(c => !currentUser.caps.includes(c));
  sel.innerHTML = '<option value="">— selecionar capacitação —</option>' + disp.map(c=>`<option value="${gesc(c)}">${gesc(c)}</option>`).join('');
}

function renderEditCaps() {
  const el = document.getElementById('edit-caps-list'); if (!el) return;
  el.innerHTML = currentUser.caps.map((c,i)=>`
    <span class="tag" style="display:inline-flex;align-items:center;gap:4px;margin:3px;">${gesc(c)}
      <span style="cursor:pointer;color:var(--red-700);font-size:14px;" onclick="removeUserCap(${i})">×</span>
    </span>`).join('') || '<span style="color:var(--gray-400);font-size:13px;">Nenhuma capacitação.</span>';
}

function removeUserCap(i) {
  const name = currentUser.caps[i];
  currentUser.caps.splice(i,1);
  setCapDoneByName(name, false);   // desmarca o progresso (salva no banco)
  renderEditCaps(); populateCapSelect();
  if (document.getElementById('cap-container')) renderCapacitacoes();
}
function addCap() {
  const sel = document.getElementById('new-cap-select'); if (!sel||!sel.value) return;
  const name = sel.value;
  if (!currentUser.caps.includes(name)) currentUser.caps.push(name);
  setCapDoneByName(name, true);    // marca como feita → salva e desbloqueia a seguinte na trilha
  renderEditCaps(); populateCapSelect();
  if (document.getElementById('cap-container')) renderCapacitacoes();
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

// Atualização 6: upload da logo da empresa pela sidebar (somente cargos autorizados).
function openLogoUpload() {
  const canEdit = (currentUser.role === 'Presidente' || currentUser.role === 'Diretor');
  if (!canEdit) { showToast('Apenas Presidente ou Diretor pode alterar a logo.'); return; }
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      localStorage.setItem('company_logo', ev.target.result);
      applyCompanyLogo(ev.target.result);
      showToast('Logo da empresa atualizada.');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function applyCompanyLogo(src) {
  const el = document.getElementById('sidebar-logo');
  if (el && src) el.src = src;
}

(function restoreCompanyLogo() {
  const s = localStorage.getItem('company_logo');
  if (s) applyCompanyLogo(s);
})();

// Atualização 9.1: nome da empresa exibido no canto superior esquerdo (sidebar).
// Editável por administradores na página Configurações; persiste no navegador.
function applyCompanyName(name) {
  const el = document.querySelector('.brand-name');
  if (el && name) el.textContent = name;
}

function saveCompanyName() {
  if (!canEditPlatform()) { showToast('Apenas administradores podem alterar o nome.'); return; }
  const v = (document.getElementById('cfg-company-name')?.value || '').trim();
  if (!v) { showToast('Informe o nome da empresa.'); return; }
  localStorage.setItem('company_name', v);
  applyCompanyName(v);
  showToast('Nome da empresa atualizado.');
}

(function restoreCompanyName() {
  const s = localStorage.getItem('company_name');
  if (s) applyCompanyName(s);
})();

// ============== AVISOS ==============
// Atualização 11: expiração com efeito real. O campo `expiry` vem do <input type="date">
// no formato ISO (YYYY-MM-DD); um aviso some no DIA SEGUINTE ao da expiração. Sem
// expiry = nunca expira. Usa o relógio central (appToday), então respeita simulação.
function isAvisoExpired(a) {
  if (!a || !a.expiry) return false;
  const [y, m, d] = a.expiry.split('-').map(Number);
  if (!y || !m || !d) return false;
  const exp = new Date(y, m - 1, d); exp.setHours(0, 0, 0, 0);
  return appToday() > exp;   // só expira a partir do dia seguinte
}
function activeAvisos() { return avisos.filter(a => !isAvisoExpired(a)); }

function renderAvisos() {
  const list=document.getElementById('avisos-list'); if(!list) return;
  updateGoogleCalUI();   // mostra/atualiza o botão "Conectar conta Google"
  gcalSilentRestore();   // tenta reconectar sem interface (ex.: após F5)
  const vigentes=activeAvisos();
  const filtered=activeAvisoFilter==='todos'?vigentes:vigentes.filter(a=>a.type===activeAvisoFilter);
  const canDelete=(currentUser.role==='Presidente'||currentUser.role==='Diretor');
  list.innerHTML=filtered.length===0?'<div class="empty-state" style="padding:20px;">Nenhum aviso nesta categoria.</div>'
    :filtered.map(a=>`
      <div class="aviso ${a.color}" data-id="${a.id}">
        <div class="head"><div class="title">${gesc(a.title)}</div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="tag ${a.color}">${a.type.charAt(0).toUpperCase()+a.type.slice(1)}</span>
            <span style="font-size:12px;color:var(--gray-500);">${a.time}</span>
            ${a.expiry?`<span style="font-size:11px;color:var(--gray-400);">Expira: ${(() => { const [y,m,d]=a.expiry.split('-'); return d&&m&&y?`${d}/${m}/${y}`:a.expiry; })()}</span>`:''}
            ${canDelete?`<button class="btn btn-ghost" style="padding:2px 8px;font-size:12px;color:var(--red-700);" onclick="deleteAviso(${jsArg(String(a.id))})">✕</button>`:''}
          </div>
        </div>
        <div class="body">${gsafe(a.body)}</div>
        <div style="font-size:12px;color:var(--gray-500);margin-top:6px;">Por: ${gesc(a.author)}</div>
      </div>`).join('');
  document.querySelectorAll('.aviso-filter-btn').forEach(btn=>{
    btn.classList.toggle('btn-outline',btn.dataset.filter===activeAvisoFilter);
    btn.classList.toggle('btn-ghost',btn.dataset.filter!==activeAvisoFilter);
  });
}

function filterAvisos(type) { activeAvisoFilter=type; renderAvisos(); }
function deleteAviso(id) { avisos=avisos.filter(a=>String(a.id)!==String(id)); dbDeleteAviso(id); renderAvisos(); showToast('Aviso removido.'); }

function updateAvisoSubFields() {
  const val=document.getElementById('aviso-alcance')?.value;
  document.getElementById('aviso-setorial-opts').style.display=val==='setorial'?'block':'none';
  document.getElementById('aviso-direcionado-opts').style.display=val==='direcionado'?'block':'none';
}

async function submitAviso() {
  const title=document.getElementById('aviso-titulo').value.trim(), alcance=document.getElementById('aviso-alcance').value,
        body=document.getElementById('aviso-mensagem').value.trim(), expiry=document.getElementById('aviso-expiry').value;
  if(!title||!body){showToast('Preencha título e mensagem.');return;}
  // Não cria aviso já vencido (evita gravar lixo no banco e avisa o erro de data).
  if(expiry && isAvisoExpired({expiry})){showToast('A data de expiração já passou. Escolha uma data futura.');return;}
  // Captura os destinatários ANTES de fechar o modal (lê as caixas de seleção).
  const recipients = avisoRecipientEmails(alcance);
  const novo={title,type:alcance,body,author:`${currentUser.name} (${currentUser.role})`,time:'Agora',color:'',expiry:expiry||null};
  const r = await dbCreateAviso(novo);          // grava no banco
  novo.id = r ? r.id : avisoIdCounter++;         // usa o uuid do banco (ou fallback local)
  if (r?.created_at) novo.time = fmtAvisoTime(r.created_at);
  avisos.unshift(novo);
  closeModal('modal-aviso');
  ['aviso-titulo','aviso-mensagem','aviso-expiry'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('avisos-list'))renderAvisos();
  showToast('Aviso enviado.');
  // Notificação por e-mail (best-effort), enviada DA conta Google do autor.
  if (googleCalConnected() && recipients.length) {
    const ok = await gmailSend({ to: memberEmail(currentUser), bcc: recipients.join(', '), subject: `Aviso: ${title}`, html: avisoEmailHtml(novo) });
    if (ok) showToast(`Aviso notificado por e-mail a ${recipients.length} membro(s).`);
  } else if (googleCalEnabled() && recipients.length) {
    showToast('Dica: conecte sua conta Google (em Avisos) para notificar por e-mail.');
  }
}

// ============== CALENDÁRIO ==============
function renderCalendario() {
  const s=document.getElementById('cal-search');
  if(s&&!s._wired){s._wired=true;s.addEventListener('input',filterCalendario);}
  filterCalendario();
  updateGoogleCalUI();   // mostra/atualiza o botão "Conectar Google Agenda"
  gcalSilentRestore();   // tenta reconectar sem interface (ex.: após F5)
}

const MONTH_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function filterCalendario() {
  const listEl=document.getElementById('cal-list'); if(!listEl) return;
  const q=(document.getElementById('cal-search')?.value||'').toLowerCase().trim();
  const renderEvent=e=>`<div class="event-row">
    <div class="event-date"><div class="day">${e.day}</div><div class="mon">${e.month}</div></div>
    <div class="event-info"><div class="title">${e.title}</div><div class="meta">${e.meta}</div></div>
    <span class="tag ${e.cls}">${e.visibility.charAt(0).toUpperCase()+e.visibility.slice(1)}</span></div>`;
  const match=e=>!q||e.title.toLowerCase().includes(q)||e.meta.toLowerCase().includes(q)||e.visibility.toLowerCase().includes(q)||(e.day||'').includes(q)||(e.month||'').toLowerCase().includes(q);
  // ordena cronologicamente (iso = AAAA-MM-DD, comparação lexicográfica funciona)
  const evs=calendarEvents.filter(match).slice().sort((a,b)=>(a.iso<b.iso?-1:a.iso>b.iso?1:0));
  // agrupa por mês/ano preservando a ordem cronológica
  const groups=[], idx={};
  evs.forEach(e=>{const key=`${e.year}-${e.monthIdx}`; if(idx[key]==null){idx[key]=groups.length;groups.push({monthIdx:e.monthIdx,year:e.year,items:[]});} groups[idx[key]].items.push(e);});
  listEl.innerHTML = groups.length
    ? groups.map(g=>`<div class="card">
        <div class="card-title">${MONTH_FULL[g.monthIdx]} ${g.year}</div>
        <div>${g.items.map(renderEvent).join('')}</div>
      </div>`).join('')
    : '<div class="card"><div class="empty-state" style="padding:14px;">Nenhum evento encontrado.</div></div>';
}

function updateEventoSubFields() {
  const val=document.getElementById('evento-visibilidade')?.value;
  document.getElementById('evento-setorial-opts').style.display=val==='setorial'?'block':'none';
  document.getElementById('evento-restrito-opts').style.display=val==='restrito'?'block':'none';
}

async function submitEvent() {
  const title=document.getElementById('ev-titulo').value.trim(), data=document.getElementById('ev-data').value,
        hora=document.getElementById('ev-hora').value, local=document.getElementById('ev-local').value.trim(),
        categoria=document.getElementById('ev-categoria').value, visib=document.getElementById('evento-visibilidade').value;
  if(!title||!data){showToast('Preencha título e data.');return;}   // data = 'AAAA-MM-DD' do input type=date
  const parts=eventDateParts(data);
  const catLabels={'reuniao-interna':'Reunião Interna','reuniao-externa':'Reunião Externa','evento':'Evento'};
  const horaTxt=hora?hora+'h':'', audience=catLabels[categoria]||'';
  const meta=[horaTxt,local||'',audience].filter(Boolean).join(' · ');
  // Captura os convidados ANTES de fechar o modal (lê as caixas de seleção).
  const attendees = eventAttendeeEmails(visib);
  const ev={iso:data,...parts,title,meta,visibility:visib,cls:'',category:categoria};
  calendarEvents.push(ev);
  calendarEvents.sort((a,b)=>(a.iso<b.iso?-1:a.iso>b.iso?1:0));
  const evAviso={id:avisoIdCounter++,title:`Novo evento: ${title}`,type:'geral',body:`Novo evento adicionado ao calendário: <b>${title}</b> — ${parts.day}/${parts.month}${meta?' · '+meta:''}.`,author:`${currentUser.name} (${currentUser.role})`,time:'Agora',color:'',expiry:null};
  avisos.unshift(evAviso);
  if (sbClient) dbCreateAviso(evAviso).then(r => { if (r) { evAviso.id = r.id; evAviso.time = fmtAvisoTime(r.created_at); } });
  closeModal('modal-evento');
  ['ev-titulo','ev-data','ev-hora','ev-local'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('cal-list'))renderCalendario();
  if(document.getElementById('avisos-list'))renderAvisos();
  showToast('Evento criado.');
  // Persistência no banco + sincronização com o Google Agenda (assíncronas; não
  // travam a UI). A sincronização só roda se o usuário tiver conectado a agenda.
  let row = null;
  if (sbClient) { row = await dbCreateEvent(ev,{horaTxt,local,audience}); if(row) ev.id=row.id; }
  if (googleCalConnected()) {
    const gid = await syncEventToGoogle(ev, hora, local, attendees);
    if (gid && ev.id && sbClient) dbUpdateEventGoogleId(ev.id, gid);
  } else if (googleCalEnabled()) {
    showToast('Dica: conecte o Google Agenda (no Calendário) para enviar convites por e-mail.');
  }
}

// ============== GOOGLE CALENDAR (Fase 5) ==============
// Integração OPCIONAL e por-usuário: se config.js não tiver `clientId`, tudo
// aqui é no-op e o app segue normal. Usa o Google Identity Services (GIS) para
// obter, no navegador, um token da agenda do PRÓPRIO usuário (escopo abaixo).
// Ao criar um evento, ele é inserido na agenda 'primary' do criador e os
// participantes entram como convidados (sendUpdates=all → Google envia o convite).
// Escopos pedidos numa só autorização: criar eventos na agenda + enviar e-mail
// pelo Gmail do usuário (notificações de aviso). Um consentimento cobre os dois.
const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send';
const GCAL_TOKEN_KEY = 'portal_ej_gcal_token';   // cache do token na sessão (sobrevive a F5/navegação)
let gcalTokenClient = null, gcalToken = null, gcalTokenExpiry = 0, gcalSilentTried = false;

function googleCalEnabled()   { return !!(window.GOOGLE_CONFIG && window.GOOGLE_CONFIG.clientId); }
function googleCalConnected() { return !!gcalToken && Date.now() < gcalTokenExpiry; }

// E-mail do usuário logado, usado como login_hint: o Google mira essa conta no
// fluxo silencioso, evitando o seletor de contas (e o popup) nas próximas vezes.
function gcalLoginHint() { return (currentUser && currentUser.email || '').toLowerCase(); }

// Guarda/recupera o token na sessionStorage. Os tokens do GIS duram ~1h e NÃO
// têm refresh token (fluxo de navegador), então isto só evita repedir dentro da
// validade — atravessa F5/navegação, mas não o fechamento do navegador.
function gcalPersistToken() {
  try { sessionStorage.setItem(GCAL_TOKEN_KEY, JSON.stringify({ t: gcalToken, e: gcalTokenExpiry })); } catch (_) {}
}
function gcalRestoreFromStorage() {
  if (googleCalConnected()) return true;
  try {
    const s = JSON.parse(sessionStorage.getItem(GCAL_TOKEN_KEY) || 'null');
    if (s && s.t && Date.now() < s.e) { gcalToken = s.t; gcalTokenExpiry = s.e; return true; }
  } catch (_) {}
  return false;
}
function gcalClearToken() {
  gcalToken = null; gcalTokenExpiry = 0;
  try { sessionStorage.removeItem(GCAL_TOKEN_KEY); } catch (_) {}
}

// Cria (uma vez) o "token client" do GIS. Retorna null se o GIS ainda não
// carregou ou se a integração está desligada.
function gcalInitClient() {
  if (gcalTokenClient || !googleCalEnabled()) return gcalTokenClient;
  if (!(window.google && google.accounts && google.accounts.oauth2)) return null;
  gcalTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: window.GOOGLE_CONFIG.clientId, scope: GCAL_SCOPE, callback: () => {},
  });
  return gcalTokenClient;
}

// Pede um token de acesso. prompt:'' = silencioso (sem UI, se já consentiu e há
// sessão Google ativa); prompt:'consent' = força a tela (1º acesso / reconectar).
// hint = e-mail do usuário → direciona a conta e evita o seletor.
function gcalRequestToken(prompt) {
  return new Promise((resolve, reject) => {
    const client = gcalInitClient();
    if (!client) return reject(new Error('Google Identity Services não carregou.'));
    client.callback = (resp) => {
      if (resp && resp.error) return reject(resp);
      gcalToken = resp.access_token;
      gcalTokenExpiry = Date.now() + ((resp.expires_in || 3600) - 60) * 1000;
      gcalPersistToken();
      resolve(gcalToken);
    };
    try {
      const cfg = { prompt: prompt || '' };
      const hint = gcalLoginHint(); if (hint) cfg.hint = hint;
      client.requestAccessToken(cfg);
    } catch (e) { reject(e); }
  });
}

async function gcalEnsureToken() {
  if (googleCalConnected()) return gcalToken;
  if (gcalRestoreFromStorage()) return gcalToken;
  try { return await gcalRequestToken(''); } catch { return null; }
}

// Botão "Conectar conta Google" — consentimento explícito (Agenda + Gmail).
async function connectGoogleCalendar(btn) {
  if (!googleCalEnabled()) { showToast('Integração com o Google ainda não foi configurada.'); return; }
  const restore = btn ? setBtnLoading(btn) : null;
  try {
    await gcalRequestToken('consent');
    showToast('Conta Google conectada! Eventos na sua agenda e e-mails de aviso habilitados.');
  } catch (e) {
    console.warn('Falha ao conectar conta Google:', e);
    showToast('Não foi possível conectar a conta Google.');
  } finally { if (restore) restore(); updateGoogleCalUI(); }
}

// Reconecta sem mostrar popup ao abrir Calendário/Avisos. Ordem: (1) cache da
// sessão (sem rede); (2) pedido silencioso ao Google (prompt:''), que com conta
// real + consentimento prévio + sessão Google ativa devolve o token SEM UI — só
// 1x por sessão pra não insistir. Com conta fictícia o silencioso falha (normal).
async function gcalSilentRestore() {
  if (!googleCalEnabled() || googleCalConnected()) { updateGoogleCalUI(); return; }
  if (gcalRestoreFromStorage()) { updateGoogleCalUI(); return; }
  if (gcalSilentTried) { updateGoogleCalUI(); return; }
  gcalSilentTried = true;
  try { await gcalRequestToken(''); } catch { /* sem consentimento prévio: ok */ }
  updateGoogleCalUI();
}

// Atualiza o rótulo/estilo do botão conforme o estado da conexão.
// Atualiza TODOS os botões "Conectar conta Google" (Calendário e Avisos). Cada
// botão declara em data-need a permissão para aparecer (ex.: aviso.create).
function updateGoogleCalUI() {
  const on = googleCalConnected();
  document.querySelectorAll('.google-connect-btn').forEach(btn => {
    const need = btn.dataset.need;
    if (!googleCalEnabled() || (need && !can(need))) { btn.style.display = 'none'; return; }
    btn.style.display = '';
    btn.textContent = on ? '✓ Conta Google conectada' : 'Conectar conta Google';
    btn.classList.toggle('btn-ghost', on);
    btn.classList.toggle('btn-outline', !on);
  });
}

// Monta o corpo do evento no formato da Google Calendar API.
function gcalBuildBody(ev, hora, local, attendees) {
  const tz = (window.GOOGLE_CONFIG && window.GOOGLE_CONFIG.calendarTimeZone) || 'America/Sao_Paulo';
  const body = {
    summary: ev.title, location: local || '',
    description: 'Criado pela plataforma Portal EJ.',
    attendees: (attendees || []).map(e => ({ email: e })),
  };
  if (hora && /^\d{2}:\d{2}$/.test(hora)) {
    const [h, m] = hora.split(':').map(Number);
    const end = `${String((h + 1) % 24).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    body.start = { dateTime: `${ev.iso}T${hora}:00`, timeZone: tz };
    body.end   = { dateTime: `${ev.iso}T${end}:00`,  timeZone: tz };
  } else {
    // Sem horário → evento de dia inteiro (end é exclusivo = dia seguinte).
    const d = new Date(ev.iso + 'T00:00:00'); d.setDate(d.getDate() + 1);
    body.start = { date: ev.iso };
    body.end   = { date: d.toISOString().slice(0, 10) };
  }
  return body;
}

// Insere o evento na agenda do criador e dispara os convites. Retorna o id do
// evento no Google (ou null em falha). É "best-effort": nunca quebra o app.
async function syncEventToGoogle(ev, hora, local, attendees) {
  if (!googleCalEnabled()) return null;
  const token = await gcalEnsureToken();
  if (!token) { updateGoogleCalUI(); return null; }
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(gcalBuildBody(ev, hora, local, attendees)),
    });
    if (!res.ok) {
      if (res.status === 401) { gcalClearToken(); updateGoogleCalUI(); showToast('Sessão do Google expirou — reconecte o Google Agenda.'); return null; }
      console.warn('Google Calendar erro:', res.status, await res.text());
      showToast('Evento criado, mas falhou ao enviar ao Google Agenda.');
      return null;
    }
    const j = await res.json();
    const n = (attendees || []).length;
    showToast(n ? `Evento no seu Google Agenda — ${n} convidado(s) notificado(s).` : 'Evento adicionado ao seu Google Agenda.');
    return j.id || null;
  } catch (e) {
    console.warn('Falha ao sincronizar com o Google:', e);
    showToast('Evento criado, mas a sincronização com o Google falhou.');
    return null;
  }
}

// Resolve os e-mails dos convidados conforme a visibilidade do evento.
// geral = todos; trainee/diretoria = por cargo; setorial = setores marcados;
// restrito = membros marcados. Exclui o próprio criador (vira organizador) e
// ignora membros inativos.
function eventAttendeeEmails(visibility) {
  const meEmail = currentUser ? memberEmail(currentUser) : '';
  const active = members.filter(m => (m.status || 'Ativo') !== 'Inativo');
  let list = [];
  if (visibility === 'geral')          list = active;
  else if (visibility === 'trainee')   list = active.filter(m => m.role === 'Trainee');
  else if (visibility === 'diretoria') list = active.filter(m => m.role === 'Presidente' || m.role === 'Diretor');
  else if (visibility === 'setorial') {
    const sectors = gcalCheckedValues('evento-setorial-list');
    list = active.filter(m => sectors.includes(m.sector));
  } else if (visibility === 'restrito') {
    return gcalCheckedValues('evento-restrito-list').filter(e => e && e.toLowerCase() !== meEmail);
  }
  return [...new Set(list.map(memberEmail))].filter(e => e && e !== meEmail);
}

function gcalCheckedValues(containerId) {
  const box = document.getElementById(containerId); if (!box) return [];
  return [...box.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value).filter(Boolean);
}

// Preenche a lista de "Restrito" com os membros REAIS (valor = e-mail). O modal
// vinha com nomes fixos do seed; aqui passa a refletir o banco.
function populateEventoMembros() {
  const box = document.getElementById('evento-restrito-list'); if (!box) return;
  const meEmail = currentUser ? memberEmail(currentUser) : '';
  const list = members.filter(m => (m.status || 'Ativo') !== 'Inativo' && memberEmail(m) !== meEmail)
                      .sort((a, b) => a.name.localeCompare(b.name));
  box.innerHTML = list.length
    ? list.map(m => `<label class="check-label"><input type="checkbox" value="${gesc(memberEmail(m))}" /> ${gesc(m.name)}</label>`).join('')
    : '<div class="u-muted text-13">Nenhum outro membro disponível.</div>';
}

async function dbUpdateEventGoogleId(rowId, gid) {
  if (!sbClient || !rowId || !gid) return;
  const { error } = await sbClient.from('calendar_events').update({ google_event_id: gid }).eq('id', rowId);
  if (error) console.warn('dbUpdateEventGoogleId', error.message);
}

// ============== NOTIFICAÇÃO DE AVISO POR E-MAIL (Fase 5) ==============
// Envia o aviso por e-mail PELA conta Google do próprio autor (Gmail API,
// escopo gmail.send já incluído na conexão). Best-effort: nunca quebra o app.

// base64 seguro p/ UTF-8 (acentos) e variante base64url (exigida pela Gmail API).
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}
function b64urlUtf8(str) { return b64utf8(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }

// Monta a mensagem MIME (HTML, UTF-8) e devolve em base64url para o campo `raw`.
function gmailBuildRaw({ to, bcc, subject, html }) {
  const mime = [
    to ? `To: ${to}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: =?UTF-8?B?${b64utf8(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64utf8(html),
  ].filter(Boolean).join('\r\n');
  return b64urlUtf8(mime);
}

async function gmailSend({ to, bcc, subject, html }) {
  if (!googleCalEnabled()) return false;
  const token = await gcalEnsureToken();
  if (!token) return false;
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: gmailBuildRaw({ to, bcc, subject, html }) }),
    });
    if (res.status === 401 || res.status === 403) {
      gcalClearToken(); updateGoogleCalUI();
      showToast('Reconecte sua conta Google para liberar o envio de e-mail.');
      return false;
    }
    if (!res.ok) { console.warn('Gmail erro:', res.status, await res.text()); return false; }
    return true;
  } catch (e) { console.warn('Falha ao enviar e-mail:', e); return false; }
}

// HTML do e-mail de aviso (corpo sanitizado com gsafe, igual ao render na tela).
function avisoEmailHtml(novo) {
  const company = localStorage.getItem('company_name') || 'Portal EJ';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#1d4ed8;margin:0 0 10px">${gesc(novo.title)}</h2>
    <div style="font-size:15px;color:#222;line-height:1.55">${gsafe(novo.body)}</div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0">
    <div style="font-size:12px;color:#888">Enviado por ${gesc(novo.author)} pela plataforma ${gesc(company)}.</div>
  </div>`;
}

// Destinatários de um aviso conforme o "Alcance": geral=todos; trainee=trainees;
// setorial=setores marcados; direcionado=membros marcados. Exclui o autor e inativos.
function avisoRecipientEmails(alcance) {
  const meEmail = currentUser ? memberEmail(currentUser) : '';
  const active = members.filter(m => (m.status || 'Ativo') !== 'Inativo');
  let list = [];
  if (alcance === 'geral')         list = active;
  else if (alcance === 'trainee')  list = active.filter(m => m.role === 'Trainee');
  else if (alcance === 'setorial') {
    const sectors = gcalCheckedValues('aviso-setorial-list');
    list = active.filter(m => sectors.includes(m.sector));
  } else if (alcance === 'direcionado') {
    return gcalCheckedValues('aviso-direcionado-list').filter(e => e && e.toLowerCase() !== meEmail);
  }
  return [...new Set(list.map(memberEmail))].filter(e => e && e !== meEmail);
}

// Preenche a lista de "Direcionado" com os membros REAIS (valor = e-mail).
function populateAvisoMembros() {
  const box = document.getElementById('aviso-direcionado-list'); if (!box) return;
  const meEmail = currentUser ? memberEmail(currentUser) : '';
  const list = members.filter(m => (m.status || 'Ativo') !== 'Inativo' && memberEmail(m) !== meEmail)
                      .sort((a, b) => a.name.localeCompare(b.name));
  box.innerHTML = list.length
    ? list.map(m => `<label class="check-label"><input type="checkbox" value="${gesc(memberEmail(m))}" /> ${gesc(m.name)}</label>`).join('')
    : '<div class="u-muted text-13">Nenhum outro membro disponível.</div>';
}

// ============== PROJETOS ==============
function renderProjects() {
  const grid=document.getElementById('projects-grid'); if(!grid) return;
  // Filtro Ativos / Concluídos / Todos (default Ativos). Concluídos aparecem esmaecidos.
  const list=activeProjectFilter==='ativos'?projects.filter(p=>!p.concluded)
    :activeProjectFilter==='concluidos'?projects.filter(p=>p.concluded)
    :projects;
  const empty={ativos:'Nenhum projeto em andamento.',concluidos:'Nenhum projeto concluído.',todos:'Nenhum projeto cadastrado.'}[activeProjectFilter];
  // Atualização 5: card flex-column + botão com margin-top:auto (alinhamento horizontal).
  grid.innerHTML=list.length===0?`<div class="empty-state">${empty}</div>`
    :list.map(p=>`<div class="card proj-card${p.concluded?' concluded':''}">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
        <span class="tag">${gesc(p.sector)}</span><span class="tag ${p.statusClass}">${gesc(p.status)}</span></div>
      <h3 style="font-size:16px;">${gesc(p.name)}</h3>
      <div style="font-size:13px;color:var(--gray-500);margin:6px 0 12px;">${gesc(p.desc)}</div>
      <div style="font-size:12px;color:var(--gray-600);"><b>Líder:</b> ${gesc(p.leader)}</div>
      <div style="font-size:12px;color:var(--gray-600);"><b>Início:</b> ${p.start}</div>
      <div class="divider"></div>
      <button class="btn btn-outline proj-card-bottom" style="width:100%;" onclick="openProject('${p.id}')">Abrir projeto</button>
    </div>`).join('');
  document.querySelectorAll('.proj-filter-btn').forEach(btn=>{
    btn.classList.toggle('btn-outline',btn.dataset.filter===activeProjectFilter);
    btn.classList.toggle('btn-ghost',btn.dataset.filter!==activeProjectFilter);
  });
}

function filterProjects(type) { activeProjectFilter=type; renderProjects(); }

function renderProjectDetail() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  const canManage=canEditProject(p);  // Pres, Diretor de Projetos, ou Gerente de Projetos relacionado
  const nameEl=document.getElementById('proj-name'); if(nameEl) nameEl.textContent=p.name;
  const infoEl=document.getElementById('proj-info');
  // Atualização 5: botão de editar no rodapé do card (.card-footer) — alinhamento via margin-top:auto.
  if(infoEl) infoEl.innerHTML=`
    <div><b>Líder:</b> ${gesc(p.leader)}</div><div><b>Setor:</b> ${gesc(p.sector)}</div>
    <div><b>Status:</b> <span class="tag ${p.statusClass}">${gesc(p.status)}</span></div>
    <div><b>Início:</b> ${gesc(p.start)}</div><div><b>Término previsto:</b> ${gesc(p.end)}</div>
    <div><b>Descrição:</b> ${gesc(p.desc)}</div>
    ${canManage?`<div class="card-footer"><button class="btn btn-outline" style="font-size:12px;width:100%;" onclick="openEditProject()">✏️ Editar informações</button></div>`:''}`;
  const membersEl=document.getElementById('proj-members');
  if(membersEl){
    // Lista rolável (máx. ~4 membros visíveis); o botão fica fora dela, no rodapé do card.
    const rows=p.memberNames.map(n=>`<div style="display:flex;align-items:center;gap:10px;">
      <div class="avatar sm">${initials(n)}</div>
      <div><div style="font-weight:600;">${gesc(n)}</div><div style="font-size:11px;color:var(--gray-500);">${gesc(getMemberRole(n))}</div></div>
    </div>`).join('')||'<div style="color:var(--gray-400);font-size:13px;">Nenhum membro vinculado.</div>';
    membersEl.innerHTML=`<div class="proj-members-list">${rows}</div>`
      +(canManage?`<div class="card-footer"><button class="btn btn-outline" style="font-size:12px;width:100%;" onclick="openManageMembers()">Gerenciar membros</button></div>`:'');
  }
  const tasksEl=document.getElementById('proj-tasks');
  if(tasksEl) tasksEl.innerHTML=p.tasks.length===0?'<tr><td colspan="5" class="td-empty">Nenhuma tarefa cadastrada.</td></tr>'
    :p.tasks.map((t,i)=>{
      const s=calcTaskStatus(t);
      const startLabel=t.startISO?(()=>{const[y,m,d]=t.startISO.split('-');return`${d}/${m} → `;})():'';
      // Atualização 6.1: clique na linha abre o modal de detalhes (com botão Excluir).
      return `<tr style="cursor:pointer;" onclick="openTaskDetail('${p.id}',${i})">
        <td onclick="event.stopPropagation();"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTaskDone('${p.id}',${i})" /></td>
        <td>${gesc(t.name)}</td><td>${gesc(t.resp)}</td>
        <td style="font-size:12px;">${startLabel}${gesc(t.due)}</td>
        <td><span class="tag ${s.cls}">${s.status}</span></td>
      </tr>`;
    }).join('');
  const btn=document.getElementById('proj-conclude-btn');
  if(btn) btn.style.display=canManage&&!p.concluded?'inline-flex':'none';
  // Atualização 9.1: botão "Drive". Clique esquerdo abre o link; só o clique
  // direito permite adicionar/editar o link da pasta do Drive.
  const driveBtn=document.getElementById('proj-drive-btn');
  if(driveBtn){
    driveBtn.textContent='📁 Drive';
    driveBtn.title=p.driveLink
      ? 'Abrir Drive · botão direito: editar link'
      : 'Sem link — clique com o botão direito para adicionar';
    driveBtn.onclick=()=>{
      if(p.driveLink) openDriveLink(p.id);
      else showToast('Nenhum link. Clique com o botão direito para adicionar.');
    };
    driveBtn.oncontextmenu=(e)=>{ e.preventDefault(); editDriveLink(p.id); };
  }
  const cronEl=document.getElementById('proj-cronograma');
  if(cronEl) cronEl.innerHTML=buildCronograma(p);
  // Atualização 6.2: botão de expansão fora do .gantt-wrap, alinhado ao título "Cronograma".
  const cronCtrls = document.getElementById('proj-cronograma-controls');
  if (cronCtrls) cronCtrls.innerHTML = buildGanttControls(p);
  if(cronEl) wireGanttInteractions(p);
}

// Atualização 8 (item 1): abre o link do Drive do projeto em nova aba.
function openDriveLink(projId) {
  const p = projects.find(x => x.id === projId);
  if (!p || !p.driveLink) return;
  window.open(p.driveLink, '_blank', 'noopener');
}

// Insere/edita o link do Drive do projeto (qualquer um edita — protótipo).
function editDriveLink(projId) {
  const p = projects.find(x => x.id === projId); if (!p) return;
  openPromptModal({
    titulo: 'Arquivos no Drive',
    sub: `Projeto: ${p.name}`,
    label: 'Link da pasta/página no Google Drive',
    value: p.driveLink || '',
    placeholder: 'https://drive.google.com/...',
    confirmLabel: 'Salvar link',
    onConfirm: (v) => {
      v = (v || '').trim();
      if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v; // assume https se faltar o esquema
      p.driveLink = v || null;
      renderProjectDetail();
      showToast(v ? 'Link do Drive salvo.' : 'Link do Drive removido.');
    },
  });
}

// ============== ARQUIVOS (DRIVE) — página dedicada (Atualização 9.1) ==============
function renderDrive() {
  const grid = document.getElementById('drive-grid'); if (!grid) return;
  const canEdit = canEditPlatform();
  const addBtn = document.getElementById('drive-add-btn');
  if (addBtn) addBtn.style.display = canEdit ? 'inline-flex' : 'none';
  grid.innerHTML = driveTopics.length === 0
    ? '<div class="empty-state" style="grid-column:1/-1;">Nenhum tópico ainda.</div>'
    : driveTopics.map(t => {
        const has = !!t.link;
        return `<div class="card drive-topic" data-id="${gesc(String(t.id))}" style="cursor:pointer;"
             title="${has ? 'Abrir pasta no Drive' : 'Sem link'}${canEdit ? ' · botão direito para editar' : ''}"
             onclick="openDriveTopic(${jsArg(String(t.id))})">
          <div style="font-size:22px;">📁</div>
          <b>${gesc(t.name)}</b>
          <div style="font-size:12px;color:var(--gray-500);margin-top:4px;">${has ? 'link definido' : '— sem link'}</div>
        </div>`;
      }).join('');
  // Edição via botão direito — só para quem pode editar a plataforma.
  if (canEdit) {
    grid.querySelectorAll('.drive-topic').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        const id = el.dataset.id;
        showContextMenu(e, [
          { label: '✏️ Renomear',     onClick: () => renameDriveTopic(id) },
          { label: 'Mudar link',    onClick: () => editDriveTopicLink(id) },
          { label: 'Remover', danger: true, onClick: () => removeDriveTopic(id) },
        ]);
      });
    });
  }
}

// Clique esquerdo: redireciona ao link do tópico (abre em nova aba).
function openDriveTopic(id) {
  const t = driveTopics.find(x => String(x.id) === String(id)); if (!t) return;
  if (!t.link) {
    showToast(canEditPlatform() ? 'Sem link. Botão direito para definir.' : 'Este tópico ainda não tem link.');
    return;
  }
  window.open(t.link, '_blank', 'noopener');
}

function addDriveTopic() {
  if (!canEditPlatform()) { showToast('Sem permissão para adicionar tópicos.'); return; }
  openPromptModal({
    titulo: 'Novo tópico de arquivos',
    label: 'Nome do tópico',
    placeholder: 'Ex: Planilhas Financeiras',
    confirmLabel: 'Criar',
    onConfirm: async (v) => {
      v = (v || '').trim();
      if (!v) { showToast('Informe o nome.'); return; }
      const t = { id: driveTopicIdCounter++, name: v, icon: '📁', link: '', position: driveTopics.length };
      driveTopics.push(t);
      await dbCreateDriveTopic(t);   // grava e troca o id pelo uuid
      renderDrive();
      showToast(`Tópico "${v}" criado. Botão direito para definir o link.`);
    },
  });
}

function renameDriveTopic(id) {
  const t = driveTopics.find(x => String(x.id) === String(id)); if (!t) return;
  openPromptModal({
    titulo: 'Renomear tópico', label: 'Nome', value: t.name,
    onConfirm: (v) => {
      v = (v || '').trim();
      if (!v) { showToast('Nome não pode ficar vazio.'); return; }
      t.name = v; dbUpdateDriveTopic(t, { name: v }); renderDrive(); showToast('Tópico renomeado.');
    },
  });
}

function editDriveTopicLink(id) {
  const t = driveTopics.find(x => String(x.id) === String(id)); if (!t) return;
  openPromptModal({
    titulo: 'Link do tópico', sub: t.name,
    label: 'Link da pasta no Google Drive',
    value: t.link || '', placeholder: 'https://drive.google.com/...', confirmLabel: 'Salvar link',
    onConfirm: (v) => {
      v = (v || '').trim();
      if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v; // assume https se faltar o esquema
      t.link = v; dbUpdateDriveTopic(t, { link: v }); renderDrive(); showToast(v ? 'Link salvo.' : 'Link removido.');
    },
  });
}

function removeDriveTopic(id) {
  const t = driveTopics.find(x => String(x.id) === String(id)); if (!t) return;
  if (!confirm(`Remover o tópico "${t.name}"?`)) return;
  dbDeleteDriveTopic(t.id);
  driveTopics = driveTopics.filter(x => String(x.id) !== String(id));
  renderDrive();
  showToast('Tópico removido.');
}

// Atualização 5: estado de expansão do Gantt por projeto.
let expandedGantt = new Set();

function toggleGanttExpand(projId) {
  if (expandedGantt.has(projId)) expandedGantt.delete(projId);
  else expandedGantt.add(projId);
  renderProjectDetail();
}

// Atualização 6.1: guarda o contexto da tarefa aberta para o botão de excluir.
let openedTaskCtx = null;

function openTaskDetail(projId, taskIdx) {
  const p = projects.find(x => x.id === projId); if (!p) return;
  const t = p.tasks[taskIdx]; if (!t) return;
  openedTaskCtx = { projId, taskIdx };
  document.getElementById('task-detail-nome').textContent = t.name;
  document.getElementById('task-detail-resp').textContent = `Responsável: ${t.resp}`;
  const startLabel = t.startISO
    ? (() => { const [y,m,d] = t.startISO.split('-'); return `${d}/${m}/${y}`; })()
    : '—';
  document.getElementById('task-detail-periodo').textContent = `${startLabel} → ${t.due || 'Sem prazo'}`;
  const s = calcTaskStatus(t);
  document.getElementById('task-detail-status').innerHTML = `<span class="tag ${s.cls}">${s.status}</span>`;
  document.getElementById('task-detail-desc').textContent = t.desc || 'Sem descrição adicional para esta tarefa.';
  // Botões excluir/modificar seguem a regra de editar dados do projeto.
  const canManage = canEditProject(p);
  const delBtn = document.getElementById('task-detail-delete-btn');
  if (delBtn) delBtn.style.display = canManage ? 'inline-flex' : 'none';
  const editBtn = document.getElementById('task-detail-edit-btn');
  if (editBtn) editBtn.style.display = canManage ? 'inline-flex' : 'none';
  document.getElementById('modal-task-detail').classList.add('active');
}

function deleteTaskFromDetail() {
  if (!openedTaskCtx) return;
  const { projId, taskIdx } = openedTaskCtx;
  const p = projects.find(x => x.id === projId); if (!p) return;
  if (!canEditProject(p)) { showToast('Sem permissão.'); return; }
  const removed = p.tasks.splice(taskIdx, 1)[0];
  dbDeleteTask(removed);
  openedTaskCtx = null;
  closeModal('modal-task-detail');
  if (document.getElementById('proj-tasks')) renderProjectDetail();
  showToast(`Tarefa "${removed?.name || ''}" removida.`);
}

// ============== GANTT (Atualização 7: cronograma mensal ancorado no início do projeto) ==============
// Janela = "mês do projeto" ancorada na data de início (ex.: 23/04 -> 23/05 -> 23/06...).
// Reduzido mostra o mês que contém o "hoje"; expandido mostra todo o range com rolagem.
const GANTT_LABEL_COL = 160;       // largura (px) da coluna de nomes das tarefas
const GANTT_DAY_PX = 22;           // px por dia quando expandido (ativa rolagem horizontal)

// "hoje" da plataforma — sempre a data real, normalizada à meia-noite (mesma usada em calcTaskStatus).
function ganttToday() { return appToday(); } // Atualização 8: usa o relógio central

// aceita 'AAAA-MM-DD' (startISO) ou 'DD/MM/AAAA' (due)
function parseDateStr(str) {
  if (!str || str === 'Sem prazo') return null;
  if (str.includes('-')) { const [y,m,d] = str.split('-'); return new Date(+y,+m-1,+d); }
  const [d,m,y] = str.split('/'); return new Date(+y,+m-1,+d);
}
function fmtDM(d)  { return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; }
function fmtDMY(d) { return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; }
function gesc(s)   { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
// Sanitiza HTML "rico" (corpo de aviso): escapa TUDO e depois reabilita só um punhado
// de tags de formatação inofensivas. Assim um aviso com <img src=x onerror=...> ou
// <script> fica neutralizado (a tag continua escapada), mas <b>/<i>/<br> funcionam.
// É a defesa contra XSS armazenado — qualquer Membro+ pode criar aviso.
function gsafe(html) {
  return gesc(html).replace(/&lt;(\/?(?:b|i|em|strong|u|br|p))\s*\/?&gt;/gi, '<$1>');
}
// Atualização 9: serializa um valor para uso como ARGUMENTO de função dentro de onclick="...".
// Usa JSON.stringify (escapa aspas/quebras) + encode de " para &quot; (compatível com atributo HTML).
function jsArg(s)  { return JSON.stringify(String(s)).replace(/"/g, '&quot;'); }

// converte 'DD/MM/AAAA' -> 'AAAA-MM-DD' (para gravar startISO no modelo)
function brToISO(br) {
  if (!br || br === 'Sem prazo') return '';
  const [d,m,y] = br.split('/');
  return `${y}-${String(+m).padStart(2,'0')}-${String(+d).padStart(2,'0')}`;
}
// valida dd/mm/aaaa de verdade (rejeita 31/02 etc.)
function isValidBR(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ''); if (!m) return false;
  const d = +m[1], mo = +m[2], y = +m[3], dt = new Date(y, mo-1, d);
  return dt.getDate() === d && dt.getMonth() === mo-1 && dt.getFullYear() === y;
}
// máscara dd/mm/aaaa: insere as barras automaticamente enquanto digita
function maskDate(el) {
  if (!el || el._masked) return; el._masked = true;
  el.addEventListener('input', () => {
    let v = el.value.replace(/\D/g,'').slice(0,8);
    if (v.length >= 5) v = v.slice(0,2)+'/'+v.slice(2,4)+'/'+v.slice(4);
    else if (v.length >= 3) v = v.slice(0,2)+'/'+v.slice(2);
    el.value = v;
  });
}
// soma n meses preservando o dia-âncora (clamp p/ meses curtos: 31/01 +1 => 28/02)
function addMonths(date, n) {
  const day = date.getDate();
  const base = new Date(date.getFullYear(), date.getMonth()+n, 1);
  const dim = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
  base.setDate(Math.min(day, dim));
  return base;
}

// Visão RECOLHIDA: enquadra o intervalo real das tarefas (todas visíveis de uma vez,
// sem paginação por mês). Visão EXPANDIDA ("Ver projeto completo"): mostra todo o range
// do projeto (início→fim), útil quando o projeto se estende além das tarefas.
function getGanttView(p) {
  const projStart = parseDateStr(p.start), projEnd = parseDateStr(p.end);
  if (!projStart || !projEnd) return null;
  // range efetivo do projeto (cobre início/fim e tarefas que extrapolam) e o range só das tarefas
  let effStart = projStart, effEnd = projEnd, tStart = null, tEnd = null;
  p.tasks.forEach(t => {
    const ts = t.startISO ? parseDateStr(t.startISO) : null, te = parseDateStr(t.due);
    if (ts) { if (ts < effStart) effStart = ts; if (!tStart || ts < tStart) tStart = ts; }
    if (te) { if (te > effEnd)   effEnd   = te; if (!tEnd   || te > tEnd)   tEnd   = te; }
  });
  tStart = tStart || projStart; tEnd = tEnd || projEnd;
  const pad = 86400000; // 1 dia de folga de cada lado, p/ as barras não colarem na borda
  const redStart = new Date(tStart.getTime() - pad), redEnd = new Date(tEnd.getTime() + pad);
  const expanded = expandedGantt.has(p.id);
  const viewStart = expanded ? effStart : redStart;
  const viewEnd   = expanded ? effEnd   : redEnd;
  const viewDays  = Math.max(1, (viewEnd - viewStart) / 86400000);
  // só vale "expandir" se a visão completa do projeto for maior que a das tarefas
  const canExpand = (effEnd - effStart) > (redEnd - redStart) + pad;
  return { projStart, projEnd, effStart, effEnd, viewStart, viewEnd, viewDays, expanded, canExpand };
}

// Botão: recolhido mostra as tarefas; "Ver projeto completo" mostra todo o range do projeto.
function buildGanttControls(p) {
  if (!p || p.tasks.length === 0) return '';
  const v = getGanttView(p); if (!v) return '';
  if (v.expanded)  return `<button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="toggleGanttExpand('${p.id}')">Recolher</button>`;
  if (v.canExpand) return `<button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="toggleGanttExpand('${p.id}')">Ver projeto completo</button>`;
  return '';
}

function buildCronograma(p) {
  const v = getGanttView(p);
  if (!v || p.tasks.length === 0)
    return '<div style="color:var(--gray-400);font-size:13px;">Nenhuma tarefa para exibir.</div>';

  const { projStart, projEnd, viewStart, viewEnd, viewDays, expanded } = v;
  const today = ganttToday();
  const dayToPct = (d) => Math.max(0, Math.min(100, (d - viewStart) / 86400000 / viewDays * 100));

  // ----- cabeçalho (marcas de data) -----
  let headerMarks = '';
  if (expanded) {
    // marca: início, cada virada de mês dentro do range, e o fim
    const marks = [viewStart]; let i = 0;
    while (addMonths(projStart, i) <= viewStart) i++;
    for (; addMonths(projStart, i) < viewEnd; i++) marks.push(addMonths(projStart, i));
    marks.push(viewEnd);
    headerMarks = marks.map(d => `<span style="left:${dayToPct(d).toFixed(2)}%;">${fmtDM(d)}</span>`).join('');
  } else {
    headerMarks = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const d = new Date(viewStart.getTime() + f * viewDays * 86400000);
      return `<span style="left:${(f * 100).toFixed(1)}%;">${fmtDM(d)}</span>`;
    }).join('');
  }

  // ----- linhas (barras) -----
  let hidden = 0;
  const rows = p.tasks.map((t, i) => {
    const tStart = t.startISO ? parseDateStr(t.startISO) : projStart;
    const tEnd   = parseDateStr(t.due) || projEnd;
    // no modo reduzido, esconde tarefas totalmente fora do mês atual (acessíveis ao expandir)
    if (!expanded && (tEnd < viewStart || tStart >= viewEnd)) { hidden++; return ''; }
    const visStart = tStart < viewStart ? viewStart : tStart;
    const visEnd   = tEnd   > viewEnd   ? viewEnd   : tEnd;
    const leftPct  = dayToPct(visStart), rightPct = dayToPct(visEnd);
    const widthPct = Math.max(2, rightPct - leftPct);
    const s = calcTaskStatus(t);
    const cls = s.cls === 'green' ? 'done' : s.cls === 'red' ? 'late' : '';
    return `<div class="gantt-row">
      <div class="gantt-row-label" title="${gesc(t.name)}">${gesc(t.name)}</div>
      <div class="gantt-row-track" data-proj="${p.id}">
        <div class="gantt-bar ${cls}" data-proj="${p.id}" data-task="${i}" data-name="${gesc(t.name)}"
             style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;">
          <span class="gantt-bar-name">${gesc(t.name)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  // ----- linha do "hoje" (sobre a trilha; reseta na virada do mês porque viewStart avança) -----
  const todayVisible = today >= viewStart && today < viewEnd;
  const todayLine = todayVisible
    ? `<div class="gantt-today" style="left:calc(${GANTT_LABEL_COL}px + (100% - ${GANTT_LABEL_COL}px) * ${(dayToPct(today)/100).toFixed(4)});"></div>`
    : '';

  const contentStyle = expanded ? `style="min-width:${GANTT_LABEL_COL + Math.round(viewDays * GANTT_DAY_PX)}px;"` : '';
  const wrapCls = expanded ? 'gantt-wrap expanded' : 'gantt-wrap';
  // ISO local (evita deslocamento de fuso de toISOString()) — usado no clique em área vazia.
  const viewStartISO = `${viewStart.getFullYear()}-${String(viewStart.getMonth()+1).padStart(2,'0')}-${String(viewStart.getDate()).padStart(2,'0')}`;

  return `<div class="${wrapCls}" data-proj="${p.id}" data-view-start="${viewStartISO}" data-view-days="${viewDays}">
    <div class="gantt-content" ${contentStyle}>
      <div class="gantt-header">
        <div class="gantt-header-label"></div>
        <div class="gantt-header-track">${headerMarks}</div>
      </div>
      <div class="gantt-body">
        ${rows}
        ${todayLine}
      </div>
    </div>
    ${(!expanded && hidden > 0) ? `<div class="gantt-hint">${hidden} tarefa(s) em outros meses — clique em <b>Abrir</b> para expandir.</div>` : ''}
    <div class="gantt-legend">
      <span><span class="legend-dot blue"></span> Em andamento</span>
      <span><span class="legend-dot green"></span> Concluída</span>
      <span><span class="legend-dot red"></span> Atrasada</span>
    </div>
  </div>`;
}

// Atualização 6.1: clique abre o modal de detalhes (que tem o botão Excluir). Sem contextmenu.
// Atualização 6.2: clique em área vazia da trilha (.gantt-row-track) abre o modal de nova
// tarefa com data inicial pré-preenchida pela posição do clique.
function wireGanttInteractions(p) {
  const wrap = document.querySelector('#proj-cronograma .gantt-wrap');
  if (!wrap) return;
  let tooltip = null;
  const ensureTip = () => {
    if (!tooltip) { tooltip = document.createElement('div'); tooltip.className = 'gantt-tooltip'; document.body.appendChild(tooltip); }
    return tooltip;
  };
  const hideTip = () => { if (tooltip) { tooltip.remove(); tooltip = null; } };

  wrap.querySelectorAll('.gantt-bar').forEach(bar => {
    bar.addEventListener('mouseenter', () => {
      const tip = ensureTip();
      tip.textContent = bar.dataset.name;
    });
    bar.addEventListener('mousemove', (e) => {
      const tip = ensureTip();
      tip.style.left = (e.clientX + 12) + 'px';
      tip.style.top  = (e.clientY + 12) + 'px';
    });
    bar.addEventListener('mouseleave', hideTip);
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      hideTip();
      openTaskDetail(bar.dataset.proj, parseInt(bar.dataset.task));
    });
  });

  // clique em área vazia → criar tarefa com a data clicada (já em dd/mm/aaaa).
  const viewStartISO = wrap.dataset.viewStart;
  const viewDays = parseInt(wrap.dataset.viewDays);
  const projId = wrap.dataset.proj;
  if (!viewStartISO || !viewDays || !projId) return;
  wrap.querySelectorAll('.gantt-row-track').forEach(track => {
    track.style.cursor = 'crosshair';
    track.addEventListener('click', (e) => {
      if (e.target.closest('.gantt-bar')) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const [y,m,d] = viewStartISO.split('-').map(Number);
      const start = new Date(y, m - 1, d);
      const clicked = new Date(start.getTime() + pct * viewDays * 86400000);
      openNewTaskAt(fmtDMY(clicked));
    });
  });
}

// abre o modal de Nova Tarefa com a data de início pré-preenchida (dd/mm/aaaa).
function openNewTaskAt(brDate) {
  openNewTask();
  const inicio = document.getElementById('task-inicio');
  if (inicio && brDate) inicio.value = brDate;
}

function toggleTaskDone(projId, taskIdx) {
  const p=projects.find(x=>x.id===projId); if(!p) return;
  const t=p.tasks[taskIdx]; t.done=!t.done;
  dbUpdateTask(t, { done: t.done });
  renderProjectDetail();
}

function concludeProject() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  if(!canEditProject(p)){showToast('Sem permissão.');return;}
  p.concluded=true; p.status='Concluído'; p.statusClass='green';
  dbUpdateProject(p, { concluded:true, status:'Concluído', status_class:'green' });
  showToast(`Projeto "${p.name}" concluído.`); goTo('projetos');
}

function populateLeaderSelect() {
  const sel=document.getElementById('proj-leader-select'); if(!sel) return;
  sel.innerHTML=members.filter(m=>m.role!=='Trainee'&&m.status==='Ativo').map(m=>`<option value="${m.name}">${m.name} (${m.role})</option>`).join('');
}

function submitProject() {
  if(!can('projeto.create')){showToast('Sem permissão para criar projetos.');return;}
  const nome=document.getElementById('new-proj-nome').value.trim(), setor=document.getElementById('new-proj-setor').value,
        lider=document.getElementById('proj-leader-select').value, desc=document.getElementById('new-proj-desc').value.trim();
  if(!nome){showToast('Informe o nome do projeto.');return;}
  const today=appToday(), fmt=d=>`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; // data de início = relógio do protótipo
  const endDate=new Date(today); endDate.setMonth(endDate.getMonth()+3);
  const id='proj-'+Date.now();
  const novo={id,name:nome,sector:setor,status:'Não iniciado',statusClass:'',leader:lider,start:fmt(today),end:fmt(endDate),desc:desc||'Sem descrição.',memberNames:lider?[lider]:[],tasks:[],concluded:false};
  projects.push(novo);
  dbCreateProject(novo);  // grava no banco e preenche novo.dbId
  closeModal('modal-projeto');
  document.getElementById('new-proj-nome').value=''; document.getElementById('new-proj-desc').value='';
  activeProjectId=id; goTo('projeto-detalhe'); showToast('Projeto criado.');
}

// Estado de edição: null = nova tarefa; {taskIdx} = editando tarefa existente.
let editingTaskIdx = null;

// Popula o select de responsável com os membros vinculados ao projeto (fonte única: p.memberNames).
// Como é reconstruído a cada abertura, reflete automaticamente quem foi adicionado/removido do projeto.
function fillRespSelect(p, selected) {
  const sel = document.getElementById('task-resp'); if (!sel) return;
  const names = [...p.memberNames];
  if (selected && selected !== '—' && !names.includes(selected)) names.unshift(selected); // mantém o atual mesmo se saiu do projeto
  sel.innerHTML = names.length
    ? names.map(n => `<option value="${gesc(n)}"${n === selected ? ' selected' : ''}>${gesc(n)}</option>`).join('')
    : '<option value="—">— sem membros no projeto —</option>';
}

function clearTaskForm() {
  ['task-nome','task-prazo','task-desc','task-inicio'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function openNewTask() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p){showToast('Nenhum projeto aberto.');return;}
  editingTaskIdx = null;
  document.getElementById('modal-tarefa-title').textContent = 'Nova tarefa';
  document.getElementById('modal-tarefa-submit').textContent = 'Criar tarefa';
  clearTaskForm();
  fillRespSelect(p, '—');
  maskDate(document.getElementById('task-inicio'));
  maskDate(document.getElementById('task-prazo'));
  document.getElementById('modal-tarefa').classList.add('active');
}

// Abre o mesmo modal de tarefa em modo edição, a partir do detalhe.
function openEditTaskFromDetail() {
  if (!openedTaskCtx) return;
  const p = projects.find(x => x.id === openedTaskCtx.projId); if (!p) return;
  const t = p.tasks[openedTaskCtx.taskIdx]; if (!t) return;
  if (!canEditProject(p)) { showToast('Sem permissão.'); return; }
  editingTaskIdx = openedTaskCtx.taskIdx;
  closeModal('modal-task-detail');
  document.getElementById('modal-tarefa-title').textContent = 'Editar tarefa';
  document.getElementById('modal-tarefa-submit').textContent = 'Salvar';
  document.getElementById('task-nome').value = t.name;
  fillRespSelect(p, t.resp || '—');
  document.getElementById('task-inicio').value = t.startISO ? (() => { const [y,m,d] = t.startISO.split('-'); return `${d}/${m}/${y}`; })() : '';
  document.getElementById('task-prazo').value = (t.due && t.due !== 'Sem prazo') ? t.due : '';
  document.getElementById('task-desc').value = t.desc || '';
  maskDate(document.getElementById('task-inicio'));
  maskDate(document.getElementById('task-prazo'));
  document.getElementById('modal-tarefa').classList.add('active');
}

function submitTask() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  if(!canEditProject(p)){showToast('Sem permissão para editar este projeto.');return;}
  const nome=document.getElementById('task-nome').value.trim();
  const resp=document.getElementById('task-resp').value;
  const inicio=document.getElementById('task-inicio').value.trim();
  const prazo=document.getElementById('task-prazo').value.trim();
  const desc=document.getElementById('task-desc').value.trim();
  if(!nome){showToast('Informe o nome da tarefa.');return;}
  if(!isValidBR(inicio) || !isValidBR(prazo)){showToast('Preencha início e fim no formato dd/mm/aaaa.');return;}
  if(parseDateStr(prazo) < parseDateStr(inicio)){showToast('O fim não pode ser antes do início.');return;}
  const data={name:nome, resp:resp||'—', due:prazo, startISO:brToISO(inicio), desc};
  if(editingTaskIdx !== null && p.tasks[editingTaskIdx]){
    const t=p.tasks[editingTaskIdx];
    Object.assign(t, data); // preserva o campo "done"
    dbUpdateTask(t, data);
    showToast('Tarefa atualizada.');
  } else {
    const nt={done:false, ...data};
    p.tasks.push(nt);
    dbCreateTask(p, nt);  // grava e preenche nt.dbId
    showToast('Tarefa adicionada.');
  }
  editingTaskIdx = null;
  closeModal('modal-tarefa');
  clearTaskForm();
  renderProjectDetail();
}

// ============== GERENCIAR MEMBROS ==============
function refreshManageMembersModal(p) {
  if(!p) p=projects.find(x=>x.id===activeProjectId);
  const listEl=document.getElementById('modal-membros-list');
  if(listEl) listEl.innerHTML=p.memberNames.map(n=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--gray-50);border-radius:8px;margin-bottom:6px;">
      <div style="display:flex;align-items:center;gap:8px;"><div class="avatar sm">${initials(n)}</div><span style="font-size:13px;">${gesc(n)}</span></div>
      ${n!==p.leader?`<button class="btn btn-ghost" style="color:var(--red-700);font-size:12px;padding:4px 8px;" onclick="removeMemberFromProject(${jsArg(n)})">✕ Remover</button>`:'<span class="tag">Líder</span>'}
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
  if(!canEditProject(p)){showToast('Sem permissão para editar este projeto.');return;}
  if(!p.memberNames.includes(sel.value)) { p.memberNames.push(sel.value); dbAddProjectMember(p, sel.value); }
  refreshManageMembersModal(p); renderProjectDetail(); showToast(`${sel.value} adicionado.`);
}

function removeMemberFromProject(name) {
  const p=projects.find(x=>x.id===activeProjectId);
  if(!p||!canEditProject(p)){showToast('Sem permissão para editar este projeto.');return;}
  if(name===p.leader){showToast('Não é possível remover o líder.');return;}
  p.memberNames=p.memberNames.filter(n=>n!==name);
  dbRemoveProjectMember(p, name);
  refreshManageMembersModal(p); renderProjectDetail(); showToast(`${name} removido.`);
}

function submitEditProject() {
  const p=projects.find(x=>x.id===activeProjectId); if(!p) return;
  if(!canEditProject(p)){showToast('Sem permissão para editar este projeto.');return;}
  const nome=document.getElementById('edit-proj-nome').value.trim(), desc=document.getElementById('edit-proj-desc').value.trim();
  const [status,cls]=document.getElementById('edit-proj-status').value.split('|');
  if(nome) p.name=nome; if(desc) p.desc=desc; if(status){p.status=status;p.statusClass=cls||'';}
  dbUpdateProject(p, { name:p.name, description:p.desc, status:p.status, status_class:p.statusClass });
  closeModal('modal-editar-projeto'); renderProjectDetail(); showToast('Projeto atualizado.');
}

// ============== TRAINEES ==============
function renderTrainees() {
  const rankEl=document.getElementById('trainee-ranking'), validEl=document.getElementById('trainee-validacoes'), activEl=document.getElementById('trainee-activities');
  if(rankEl){
    const medals=['gold','silver','bronze'];
    rankEl.innerHTML=getTrainees().sort((a,b)=>b.points-a.points).map((t,i)=>`
      <div class="rank-row"><div class="rank-pos ${medals[i]||''}">${i+1}</div>
        <div class="rank-info"><div class="name">${gesc(t.name)}</div><div class="role">Padrinho: ${gesc(t.padrinho)}</div></div>
        ${hideTraineePoints ? '' : `<div class="rank-points">${t.points} pts</div>`}</div>`).join('');
  }
  const toggleBtn = document.getElementById('toggle-points-btn');
  if (toggleBtn) toggleBtn.textContent = hideTraineePoints ? 'Mostrar pontos' : 'Ocultar pontos';
  if(validEl){
    const minhas=pendingValidations.filter(v=>v.padrinho===currentUser.name);
    validEl.innerHTML=minhas.length===0?'<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:16px;">Nenhuma validação pendente.</td></tr>'
      :minhas.map(v=>{const ri=pendingValidations.indexOf(v);return`<tr>
        <td><b>${gesc(v.trainee)}</b></td>
        <td>${gesc(v.activity)} <span class="tag" style="margin-left:4px;">${v.points} pts</span></td>
        <td>${v.sent}</td>
        <td style="display:flex;gap:6px;">
          <button class="btn btn-primary" onclick="validateActivity(${ri},'aprovar')" style="padding:6px 12px;">✓ Aprovar</button>
          <button class="btn btn-outline" onclick="validateActivity(${ri},'rejeitar')" style="padding:6px 12px;">✕ Rejeitar</button>
        </td></tr>`;}).join('');
  }
  if(activEl){
    // Atualização 4.1: mostra as 10 primeiras atividades pontuadas.
    // Atualização 9.1: as atividades FIXAS (sem pontuação) ficam só no grid por área.
    const pontuadas = activities.filter(a => !a.mandatory);
    const top = pontuadas.slice(0, 10);
    if (top.length === 0) {
      activEl.innerHTML = '<tr><td colspan="2" class="td-empty">Nenhuma atividade.</td></tr>';
      return;
    }
    activEl.innerHTML = top.map(a => {
      const isOpen = expandedActivityId === a.id;
      const areaTag = a.area ? `<span class="tag" style="margin-left:6px;font-size:10px;">${a.area}</span>` : '';
      return `<tr style="cursor:pointer;" onclick="toggleActivity(${a.id})">
        <td><b>${gesc(a.name)}</b> ${areaTag} <span style="font-size:11px;color:var(--gray-400);">${isOpen?'▲':'▼'}</span></td>
        <td><b>${a.points}</b> pts</td></tr>
        ${isOpen?`<tr><td colspan="2" style="background:var(--gray-50);padding:10px 14px;font-size:13px;color:var(--gray-600);">${a.desc}</td></tr>`:''}`;
    }).join('') + `<tr><td colspan="2" style="padding:10px 14px;">
      <button class="btn btn-ghost" style="font-size:12px;color:var(--blue-700);" onclick="goTo('atividades')">Ver todas as atividades por área (${pontuadas.length})</button>
    </td></tr>`;
  }
}

function openNewActivity() { if (!can('atividade.create')) { showToast('Sem permissão para criar atividades.'); return; } document.getElementById('modal-atividade').classList.add('active'); }

// Atualização 6: alterna a visualização dos pontos no ranking.
function toggleTraineePoints() {
  const canHide = (currentUser.role === 'Presidente' || currentUser.role === 'Diretor');
  if (!canHide) { showToast('Sem permissão para alterar a exibição.'); return; }
  hideTraineePoints = !hideTraineePoints;
  localStorage.setItem('hide_trainee_points', hideTraineePoints ? '1' : '0');
  if (document.getElementById('trainee-ranking')) renderTrainees();
  if (document.getElementById('dash-ranking')) renderDashboard();
  showToast(hideTraineePoints ? 'Pontos ocultos.' : 'Pontos visíveis.');
}

function submitActivity() {
  if (!can('atividade.create')) { showToast('Sem permissão para criar atividades.'); return; }
  const nome=document.getElementById('atv-nome').value.trim();
  const pontos=parseInt(document.getElementById('atv-pontos').value);
  const desc=document.getElementById('atv-desc').value.trim();
  // Atualização 4.1: área obrigatória.
  const area=document.getElementById('atv-area').value;
  if(!nome){showToast('Informe o nome.');return;}
  if(!pontos||pontos<1){showToast('Informe os pontos.');return;}
  if(!area){showToast('Selecione a área.');return;}
  const nova={id:activityIdCounter++,name:nome,points:pontos,area,desc:desc||'Sem descrição.',mandatory:false,link:''};
  activities.push(nova);
  dbCreateActivity(nova);   // grava no banco e preenche nova.dbId
  closeModal('modal-atividade');
  ['atv-nome','atv-pontos','atv-desc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  if(document.getElementById('trainee-activities'))renderTrainees();
  if(document.getElementById('atividades-grid'))renderAtividades();
  showToast('Atividade criada.');
}

function toggleActivity(id) { expandedActivityId=expandedActivityId===id?null:id; if(document.getElementById('trainee-activities'))renderTrainees(); }

// ============== ATIVIDADES (página dedicada) ==============
// Atualização 4.1: substitui o modal "Ver todas as atividades" por página com grid 3 colunas.
// Atualização 9: layout 2x2 com 4 setores (Diretoria adicionada).
// Atividades obrigatórias: botão de link (PDF); botão direito edita o link.
// Atividades normais: card expansível + botão "Feita" para Trainee solicitar aprovação.
function renderAtividades() {
  const wrap = document.getElementById('atividades-grid');
  if (!wrap) return;
  const cols = [
    { key:'Projetos',  label:'Projetos'  },
    { key:'Comercial', label:'Comercial' },
    { key:'ADM/FIN',   label:'ADM/FIN'   },
    { key:'Diretoria', label:'Diretoria' },
  ];
  const isTrainee = currentUser.role === 'Trainee';
  wrap.innerHTML = cols.map(c => {
    const items = activities.filter(a => a.area === c.key);
    return `<div class="atividades-col">
      <div class="atividades-col-header">
        <span>${c.label}</span>
        <span class="atividades-col-count">${items.length}</span>
      </div>
      <div class="atividades-cards">
        ${items.length === 0
          ? '<div style="padding:20px;text-align:center;color:var(--gray-400);font-size:13px;">Nenhuma atividade.</div>'
          : items.map(a => a.mandatory ? renderMandatoryActivityCard(a) : renderRegularActivityCard(a, isTrainee)).join('')
        }
      </div>
    </div>`;
  }).join('');
  // Liga o menu de contexto (botão direito) nas atividades fixas para editar o link.
  // Atualização 9.1: só membros habilitados podem alterar o arquivo.
  wrap.querySelectorAll('[data-mand]').forEach(el => {
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!canEditPlatform()) { showToast('Sem permissão para alterar o arquivo.'); return; }
      const id = parseInt(el.dataset.mand);
      const a = activities.find(x => x.id === id); if (!a) return;
      showContextMenu(e, [
        { label: a.link ? 'Mudar link do PDF' : 'Definir link do PDF', onClick: () => editMandatoryLink(id) },
      ]);
    });
  });
}

function renderMandatoryActivityCard(a) {
  const hasLink = !!a.link;
  const canEdit = canEditPlatform();
  const hint = canEdit
    ? `Botão direito: ${hasLink ? 'alterar arquivo' : 'definir arquivo'}`
    : 'Atividade fixa do setor';
  return `<div class="atividade-card" data-mand="${a.id}" onclick="mandatoryActivityClick(${a.id})"
       title="${hasLink ? 'Abrir PDF' : 'Sem arquivo'}${canEdit ? ` · botão direito: ${hasLink ? 'alterar' : 'definir'}` : ''}"
       style="border-color:var(--blue-400);background:linear-gradient(135deg,var(--blue-50),white);">
    <div class="atividade-card-head">
      <div class="atividade-card-name">${gesc(a.name)}
        ${hasLink ? '<span style="font-size:11px;color:#16a34a;margin-left:6px;">PDF</span>'
                  : '<span style="font-size:11px;color:var(--gray-400);margin-left:6px;">— sem arquivo</span>'}
      </div>
      <div class="atividade-card-pts" style="font-size:11px;color:var(--gray-400);">Sem pontuação</div>
    </div>
    <div style="font-size:11px;color:var(--gray-500);margin-top:6px;">${hint}</div>
  </div>`;
}

function renderRegularActivityCard(a, isTrainee) {
  return `<div class="atividade-card" onclick="toggleAtividadeCard(${a.id})">
    <div class="atividade-card-head">
      <div class="atividade-card-name">${gesc(a.name)}</div>
      <div class="atividade-card-pts">${a.points} pts</div>
    </div>
    <div id="atv-card-desc-${a.id}" class="atividade-card-desc">${gesc(a.desc)}</div>
    ${isTrainee ? `<div style="margin-top:10px;text-align:right;">
      <button class="btn btn-primary" style="font-size:12px;padding:5px 12px;" onclick="event.stopPropagation();requestActivityApproval(${a.id})">✓ Feita</button>
    </div>` : ''}
  </div>`;
}

// Trainee solicita aprovação da atividade. Vai para pendingValidations só do padrinho dele.
function requestActivityApproval(activityId) {
  const a = activities.find(x => x.id === activityId); if (!a) return;
  if (currentUser.role !== 'Trainee') { showToast('Apenas trainees podem solicitar aprovação.'); return; }
  const padrinho = currentUser.padrinho || members.find(m => m.name === currentUser.name)?.padrinho;
  if (!padrinho) { showToast('Você não tem padrinho atribuído — fale com um diretor.'); return; }
  if (pendingValidations.some(v => v.trainee === currentUser.name && v.activity === a.name)) {
    showToast('Você já enviou esta atividade para aprovação.');
    return;
  }
  const pedido={
    trainee: currentUser.name,
    activity: a.name,
    points:   a.points,
    padrinho,
    sent:     fmtDMY(appToday()),
  };
  pendingValidations.push(pedido);
  dbCreateValidation(pedido);   // grava o pedido no banco
  showToast(`Pedido enviado para ${padrinho}.`);
}

// Clica numa atividade fixa: abre o PDF. Se vazio, só membro habilitado é levado a definir.
function mandatoryActivityClick(activityId) {
  const a = activities.find(x => x.id === activityId); if (!a) return;
  if (!a.link) {
    if (canEditPlatform()) editMandatoryLink(activityId);
    else showToast('Esta atividade ainda não tem arquivo.');
    return;
  }
  window.open(a.link, '_blank', 'noopener');
}

// Define/edita o link do PDF da atividade obrigatória.
function editMandatoryLink(activityId) {
  const a = activities.find(x => x.id === activityId); if (!a) return;
  openPromptModal({
    titulo: 'Link da atividade obrigatória',
    sub: `Setor: ${a.area}`,
    label: 'URL do PDF',
    value: a.link || '',
    placeholder: 'https://...',
    confirmLabel: 'Salvar link',
    onConfirm: (v) => {
      v = (v || '').trim();
      if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      a.link = v;
      dbUpdateActivity(a, { link: v });
      if (document.getElementById('atividades-grid')) renderAtividades();
      showToast(v ? 'Link atualizado.' : 'Link removido.');
    },
  });
}

function toggleAtividadeCard(id) {
  const el = document.getElementById(`atv-card-desc-${id}`);
  if (!el) return;
  el.classList.toggle('open');
}

function validateActivity(idx, action) {
  const v=pendingValidations[idx]; if(!v) return;
  if(action==='aprovar'){
    const t=members.find(x=>x.name===v.trainee&&x.role==='Trainee');
    if(t){ t.points=(t.points||0)+v.points; dbUpdateMember(t, { points: t.points }); }  // pontos do trainee no banco
    dbResolveValidation(v, 'aprovada');
    showToast(`${v.trainee} +${v.points} pts.`);
  } else {
    dbResolveValidation(v, 'rejeitada');
    showToast(`Atividade de ${v.trainee} rejeitada.`);
  }
  pendingValidations.splice(idx,1); renderTrainees();
}

// ============== LEGADO ==============
function renderLegado() {
  const grid=document.getElementById('legado-grid'); if(!grid) return;
  // Atualização 9.1: card em coluna flex + botão com margin-top:auto, para o
  // "Ver todos os registros" ficar fixo na base de toda caixa (mesma posição).
  grid.innerHTML=Object.values(legadoData).map(cat=>`
    <div class="card" style="display:flex;flex-direction:column;">
      <div class="card-title">${gesc(cat.label)}</div>
      <div style="font-size:13px;color:var(--gray-700);display:flex;flex-direction:column;gap:10px;">
        ${cat.registros.length>0?cat.registros.slice(0,2).map(r=>`<div><b>${gesc(r.autor)}:</b> ${gesc(r.texto)}</div>`).join(''):'<div style="color:var(--gray-400);">Nenhum registro ainda.</div>'}
      </div>
      <button class="btn btn-ghost" style="margin-top:auto;padding-top:12px;font-size:12px;" onclick="openVerRegistros('${cat.key}')">Ver todos os registros</button>
    </div>`).join('');
}

// Atualização 5: antes abria modal; agora navega para página dedicada.
function openVerRegistros(key) {
  if (!legadoData[key]) return;
  activeLegadoKey = key;
  goTo('legado-todos');
}

function renderLegadoTodos() {
  const cat = legadoData[activeLegadoKey];
  const titEl = document.getElementById('legado-todos-titulo');
  const listEl = document.getElementById('legado-todos-lista');
  if (!cat) {
    if (titEl) titEl.textContent = 'Registro não encontrado';
    if (listEl) listEl.innerHTML = '<div class="empty-state">Volte para Legado e selecione um cargo.</div>';
    return;
  }
  if (titEl) titEl.textContent = `${cat.label} — Todos os registros`;
  if (!listEl) return;
  listEl.innerHTML = cat.registros.length > 0
    ? cat.registros.map(r => `
        <div style="padding:16px;background:var(--gray-50);border-radius:10px;border:1px solid var(--gray-200);">
          <div style="font-weight:700;font-size:14px;color:var(--blue-700);margin-bottom:8px;font-family:'Plus Jakarta Sans',sans-serif;">${gesc(r.autor)}</div>
          <div style="font-size:14px;color:var(--gray-700);line-height:1.55;white-space:pre-wrap;">${gesc(r.texto)}</div>
        </div>`).join('')
    : '<div class="empty-state">Nenhum registro ainda para este cargo.</div>';
}

function submitLegadoRegistro() {
  const cargo=document.getElementById('legado-cargo').value, autor=document.getElementById('legado-autor').value.trim(), texto=document.getElementById('legado-texto').value.trim();
  if(!autor||!texto){showToast('Preencha todos os campos.');return;}
  if(legadoData[cargo]){ const quoted=`"${texto}"`; legadoData[cargo].registros.unshift({autor,texto:quoted}); dbCreateLegadoEntry(cargo,autor,quoted); }
  closeModal('modal-legado-registro');
  document.getElementById('legado-autor').value=''; document.getElementById('legado-texto').value='';
  renderLegado(); showToast('Registro adicionado.');
}

// ============== RNN ==============
function renderRNN() {
  const grid=document.getElementById('rnn-grid'); if(!grid) return;
  grid.innerHTML=`
    <div class="card"><div class="card-title">Regras, Normas e Normativas</div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;color:var(--gray-700);">
        ${rnnsData.map(r=>`<div><b>${gesc(r.titulo)}</b><br>${gesc(r.body)}</div>`).join('')}
      </div>
    </div>
    <div class="card"><div class="card-title">Nossos Valores</div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${valoresData.map(v=>`<div style="padding:14px;background:var(--blue-50);border-radius:8px;"><b style="color:var(--blue-700);">${gesc(v.titulo)}</b><div style="font-size:13px;color:var(--gray-700);margin-top:4px;">${gesc(v.body)}</div></div>`).join('')}
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
  const tit=`${rnnsData.length+1}. ${titulo}`;
  rnnsData.push({titulo:tit,body});
  dbCreateInstitutional('rnn', tit, body, rnnsData.length-1);
  document.getElementById('rnn-new-titulo').value=''; document.getElementById('rnn-new-body').value='';
  if(document.getElementById('rnn-grid'))renderRNN(); showToast('RNN adicionada.');
}

function addValor() {
  const titulo=document.getElementById('val-new-titulo').value.trim(), body=document.getElementById('val-new-body').value.trim();
  if(!titulo||!body){showToast('Preencha título e descrição.');return;}
  valoresData.push({titulo,body});
  dbCreateInstitutional('valor', titulo, body, valoresData.length-1);
  document.getElementById('val-new-titulo').value=''; document.getElementById('val-new-body').value='';
  if(document.getElementById('rnn-grid'))renderRNN(); showToast('Valor adicionado.');
}

// ============== METAS ==============
// Atualização 5 — regra exata do eixo Y do gráfico anual:
//   se atual <= meta*2  →  yMax = meta*2
//   se atual >  meta*2  →  yMax = atual + 1000 (buffer)
function calcYMax(anoMeta, cumActual) {
  const meta  = anoMeta || 0;
  const atual = Math.max(0, ...cumActual.filter(v => v !== null));
  if (atual <= meta * 2) return Math.max(meta * 2, 1);
  return atual + 1000;
}

function buildAnualChart() {
  const d=metasAnuais;
  const W=560,H=200,pad={top:16,right:16,bottom:28,left:56};
  const iW=W-pad.left-pad.right, iH=H-pad.top-pad.bottom;
  const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  let cumActual=[],sum=0,lastIdx=-1;
  d.mensal.forEach((v,i)=>{sum+=v;if(v>0){cumActual[i]=sum;lastIdx=i;}else{cumActual[i]=null;}});
  for(let i=lastIdx+1;i<12;i++) cumActual[i]=null;
  const target=months.map((_,i)=>(i+1)/12*d.anoMeta);
  // Auto-scale dinâmico do eixo Y (regra Atualização 5)
  const maxVal = calcYMax(d.anoMeta, cumActual);
  const x=i=>pad.left+(i/11)*iW, y=v=>H-pad.bottom-(v/maxVal)*iH;
  const fmtY=v=>v>=1000?`R$${(v/1000).toFixed(v>=10000?0:1)}k`:`R$${Math.round(v)}`;
  const gridSteps=[0,0.25,0.5,0.75,1].map(f=>({v:f*maxVal,y:y(f*maxVal)}));
  const gridLines=gridSteps.map(s=>`<line x1="${pad.left}" y1="${s.y.toFixed(1)}" x2="${W-pad.right}" y2="${s.y.toFixed(1)}" stroke="var(--gray-200)" stroke-width="0.6"/>`).join('');
  const yLabels=gridSteps.map(s=>`<text x="${pad.left-4}" y="${s.y.toFixed(1)}" dy="3" text-anchor="end" font-size="8.5" fill="var(--gray-500)">${fmtY(s.v)}</text>`).join('');
  const xLabels=months.map((m,i)=>`<text x="${x(i).toFixed(1)}" y="${H-4}" text-anchor="middle" font-size="8.5" fill="var(--gray-500)">${m}</text>`).join('');
  const targetPts=months.map((_,i)=>`${x(i).toFixed(1)},${y(target[i]).toFixed(1)}`).join(' ');
  const actualPts=[];
  cumActual.forEach((v,i)=>{if(v!==null)actualPts.push({x:x(i),y:y(v),v});});
  let areaD='';
  if(actualPts.length>0){
    const last=actualPts[actualPts.length-1];
    areaD=`M ${actualPts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} L ${last.x.toFixed(1)},${(H-pad.bottom).toFixed(1)} L ${pad.left},${(H-pad.bottom).toFixed(1)} Z`;
  }
  const actualLine=actualPts.length>1?`<polyline points="${actualPts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="#16a34a" stroke-width="1.4" stroke-linejoin="round"/>`:'';
  const actualDots=actualPts.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i===actualPts.length-1?3:2}" fill="#16a34a" ${i===actualPts.length-1?'stroke="white" stroke-width="1"':''}/>`).join('');
  const targetDots=months.map((_,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(target[i]).toFixed(1)}" r="1.8" fill="white" stroke="var(--gray-700)" stroke-width="0.9"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
    <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#16a34a" stop-opacity="0.22"/><stop offset="100%" stop-color="#16a34a" stop-opacity="0.02"/>
    </linearGradient></defs>
    ${gridLines}
    ${areaD?`<path d="${areaD}" fill="url(#areaGrad)"/>`:''}
    <polyline points="${targetPts}" fill="none" stroke="var(--gray-700)" stroke-width="1.1" stroke-dasharray="4,3"/>
    ${targetDots}${actualLine}${actualDots}
    ${yLabels}${xLabels}
  </svg>
  <div style="display:flex;gap:16px;justify-content:center;font-size:11px;color:var(--gray-600);margin-top:8px;">
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:18px;height:2px;background:#16a34a;display:inline-block;border-radius:2px;"></span>2026 (real acumulado)</span>
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:18px;height:2px;background:var(--gray-700);display:inline-block;border-radius:2px;border-top:1px dashed;"></span>Meta 2026</span>
  </div>`;
}

// Atualização 5: card de meta reutilizável (Metas e Dashboard).
function fmtMetaVal(campo, val) {
  const m = metas[campo];
  if (m?.prefixo === 'R$') return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  return val + (m?.sufixo || '');
}

function buildMetaCard(campo, m, opts = {}) {
  const compact = !!opts.compact;
  const showEdit = !compact;
  const pct = Math.min(100, Math.round(m.atual / m.meta * 100));
  const label = pct >= 100 ? '✓ Meta batida!' : pct >= 70 ? 'Atenção' : 'Abaixo da meta';
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:0;">${gesc(m.label)}</div>
      ${showEdit ? `<button class="btn btn-ghost" style="font-size:12px;" onclick="openEditMeta('${campo}')">✏️ Editar</button>` : ''}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
      <div style="font-size:${compact ? 22 : 30}px;font-weight:800;color:var(--gray-900);">${fmtMetaVal(campo, m.atual)}</div>
      <div style="font-size:13px;color:var(--gray-500);">Meta: ${fmtMetaVal(campo, m.meta)}</div>
    </div>
    <div style="height:8px;background:linear-gradient(to right,#dc2626,#f59e0b,#16a34a);border-radius:999px;position:relative;overflow:hidden;margin-bottom:8px;">
      <div style="position:absolute;right:0;top:0;width:${100 - pct}%;height:100%;background:var(--gray-100);"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray-500);">
      <span>${pct}% atingido</span>
      <span style="font-weight:600;color:${pct >= 100 ? '#16a34a' : pct >= 70 ? '#f59e0b' : '#dc2626'};">${label}</span>
    </div>
  </div>`;
}

function renderMetas() {
  const grid=document.getElementById('metas-grid'); if(!grid) return;
  const cards = Object.entries(metas).map(([campo, m]) => buildMetaCard(campo, m)).join('');
  // Gráfico anual
  const chartCard=`<div class="card" style="grid-column:1/-1;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div class="card-title" style="margin-bottom:0;">Faturamento — Evolução Anual 2026</div>
      <button class="btn btn-ghost" style="font-size:12px;" onclick="openEditAnual()">✏️ Editar dados</button>
    </div>
    <div id="anual-chart-area">${buildAnualChart()}</div>
  </div>`;
  // Atualização 4.1: cards (inputs/painel) acima, gráfico abaixo.
  grid.innerHTML = cards + chartCard;
}

function submitEditMeta() {
  const m=metas[metaEditando]; if(!m) return;
  const atual=parseFloat(document.getElementById('meta-edit-atual').value);
  if(!isNaN(atual)) m.atual=atual;
  if(metaEditando==='faturamento'){
    // Atualização 8 (item 4): o faturamento do mês corrente alimenta o gráfico anual.
    const idx=fatMonthIndex();
    metasAnuais.mensal[idx] = isNaN(atual) ? 0 : Math.max(0, atual);
    syncFaturamentoFromAnual(); // recomputa meta = anual/12 e mantém o espelho
    dbSaveMonthRevenue(metasYear(), idx+1, metasAnuais.mensal[idx]);  // fonte da verdade do faturamento
  } else {
    const meta=parseFloat(document.getElementById('meta-edit-meta').value);
    if(!isNaN(meta)&&meta>0) m.meta=meta;
    dbUpdateMeta(metaEditando, { atual: m.atual, meta: m.meta });
  }
  closeModal('modal-metas-edit');
  if(document.getElementById('metas-grid')) renderMetas();
  if(document.getElementById('dash-metas')) renderDashboard();
  showToast('Meta atualizada.');
}

function submitAnual() {
  metasAnuais.anoMeta=parseFloat(document.getElementById('anual-meta-total').value)||metasAnuais.anoMeta;
  for(let i=0;i<12;i++){const v=parseFloat(document.getElementById(`anual-mes-${i}`)?.value);metasAnuais.mensal[i]=isNaN(v)?0:Math.max(0,v);}
  syncFaturamentoFromAnual(); // Atualização 8: card do faturamento espelha o gráfico (atual + meta=anual/12)
  dbSaveAnnual(metasYear(), metasAnuais.anoMeta, metasAnuais.mensal);  // grava meta anual + 12 meses
  closeModal('modal-anual-chart');
  if(document.getElementById('metas-grid'))renderMetas();
  if(document.getElementById('dash-metas'))renderDashboard();
  showToast('Dados anuais atualizados.');
}

// ============== CAPACITAÇÕES ==============
function renderCapacitacoes() {
  const container=document.getElementById('cap-container'); if(!container) return;
  const canAdd=(currentUser.role==='Presidente'||currentUser.role==='Diretor');
  const canEditCaps=can('capacitacao.edit');   // todos os níveis menos Trainee
  container.innerHTML=`<div class="cap-tree">
    ${Object.entries(capTree).map(([key,col])=>`
      <div class="cap-col-group">
        <div class="cap-col-header">${col.label}</div>
        <div class="cap-tracks">
          ${col.tracks.map((track,ti)=>`
            <div class="cap-track">
              ${track.map((cap,ci)=>{
                const locked=ci>0&&!track[ci-1].done;
                const cls = cap.done ? 'done' : locked ? 'locked' : '';
                // Nós disponíveis recebem menu (marcar concluído p/ todos; editar só p/ não-trainee).
                const ctxAttr = locked ? '' : `data-col="${key}" data-track="${ti}" data-idx="${ci}"`;
                return `<div class="cap-node ${cls}" ${ctxAttr} title="${gesc(cap.name)}${locked?' (Bloqueado — complete o anterior)':' — botão direito para opções'}">
                  <div class="cap-title">${gesc(cap.name)}</div>
                  <div class="cap-status">${cap.done?'Concluído':locked?'Bloqueado':'Disponível'}</div>
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
    <div style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;background:var(--gray-100);border-radius:3px;display:inline-block;"></span> Bloqueado</div>
    <div style="margin-left:auto;font-size:12px;color:var(--gray-500);">Dica: clique com o botão direito sobre uma capacitação para editar.</div>
  </div>`;
  // Atualização 5: menu de contexto por capacitação
  container.querySelectorAll('.cap-node[data-col]').forEach(node => {
    node.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const col = node.dataset.col;
      const track = parseInt(node.dataset.track);
      const idx = parseInt(node.dataset.idx);
      const cap = capTree[col].tracks[track][idx];
      if (!cap) return;
      // Progresso é PESSOAL (todos podem marcar o próprio). Edição do catálogo só não-trainee.
      const items = [ cap.done
        ? { label: '↩ Desmarcar concluído', onClick: () => toggleCapDone(col, track, idx) }
        : { label: '✓ Marcar como concluído', onClick: () => toggleCapDone(col, track, idx) } ];
      if (can('capacitacao.edit')) items.push(
        { label: '✏️ Editar nome', onClick: () => editCapName(col, track, idx) },
        { label: 'Mudar link',  onClick: () => editCapLink(col, track, idx) },
        { label: 'Remover', danger: true, onClick: () => removeCap(col, track, idx) },
      );
      showContextMenu(e, items);
    });
  });
}

// Marca/desmarca a capacitação como concluída para o USUÁRIO LOGADO (progresso pessoal).
function toggleCapDone(col, track, idx) {
  const cap = capTree[col]?.tracks[track]?.[idx]; if (!cap) return;
  cap.done = !cap.done;
  dbSetCapProgress(cap.id, cap.done);
  syncPerfilCap(cap.name, cap.done);   // mantém a lista do perfil em sincronia
  renderCapacitacoes();
  showToast(cap.done ? 'Capacitação concluída!' : 'Marcação removida.');
}

// ---- Unificação Perfil ↔ árvore: ambos usam o progresso (cap.done / cap_progress) ----
// Nomes de todas as capacitações existentes na árvore (fonte para o select do perfil).
function allCapNames() {
  const names = [];
  Object.values(capTree).forEach(col => col.tracks.forEach(tr => tr.forEach(c => names.push(c.name))));
  return names;
}
// Acha a capacitação no capTree pelo NOME e marca o progresso do usuário logado.
// Retorna a cap (ou null). Isso conecta "fiz no perfil" → desbloqueio na trilha.
function setCapDoneByName(name, done) {
  for (const col of Object.values(capTree)) {
    for (const tr of col.tracks) {
      const cap = tr.find(c => c.name === name);
      if (cap) { cap.done = done; dbSetCapProgress(cap.id, done); return cap; }
    }
  }
  return null;
}
// Reflete na lista currentUser.caps (perfil) sem duplicar.
function syncPerfilCap(name, done) {
  if (!currentUser.caps) currentUser.caps = [];
  if (done) { if (!currentUser.caps.includes(name)) currentUser.caps.push(name); }
  else      { currentUser.caps = currentUser.caps.filter(n => n !== name); }
}

function editCapName(col, track, idx) {
  if (!can('capacitacao.edit')) { showToast('Sem permissão para editar capacitações.'); return; }
  const cap = capTree[col]?.tracks[track]?.[idx]; if (!cap) return;
  openPromptModal({
    titulo: 'Editar nome da capacitação',
    label: 'Novo nome',
    value: cap.name,
    onConfirm: (v) => {
      if (!v) { showToast('Nome não pode ficar vazio.'); return; }
      cap.name = v;
      dbUpdateCap(cap, { name: v });
      renderCapacitacoes();
      showToast('Capacitação renomeada.');
    }
  });
}

function editCapLink(col, track, idx) {
  if (!can('capacitacao.edit')) { showToast('Sem permissão para editar capacitações.'); return; }
  const cap = capTree[col]?.tracks[track]?.[idx]; if (!cap) return;
  openPromptModal({
    titulo: 'Mudar link da capacitação',
    sub: `Capacitação: ${cap.name}`,
    label: 'URL de acesso',
    value: cap.link || '',
    placeholder: 'https://...',
    onConfirm: (v) => {
      cap.link = v;
      dbUpdateCap(cap, { link: v || '' });
      showToast(v ? 'Link atualizado.' : 'Link removido.');
    }
  });
}

function removeCap(col, track, idx) {
  if (!can('capacitacao.edit')) { showToast('Sem permissão para editar capacitações.'); return; }
  const arr = capTree[col]?.tracks[track]; if (!arr) return;
  const removed = arr.splice(idx, 1)[0];
  if (removed?.id) dbDeleteCap(removed.id);
  renderCapacitacoes();
  showToast(`"${removed?.name || 'Capacitação'}" removida.`);
}

function submitCap() {
  const name=document.getElementById('new-cap-name').value.trim();
  const link=(document.getElementById('new-cap-link')?.value||'').trim();
  if(!name){showToast('Informe o nome da capacitação.');return;}
  const {col,track}=capAddTarget;
  if(capTree[col]){
    const arr=capTree[col].tracks[track];
    const cap={name,link,done:false};
    arr.push(cap);
    dbCreateCap(capTree[col]._trackIds?.[track], cap, arr.length-1);  // grava e preenche cap.id
  }
  closeModal('modal-add-cap');
  document.getElementById('new-cap-name').value=''; document.getElementById('new-cap-link').value='';
  if(document.getElementById('cap-container'))renderCapacitacoes();
  showToast('Capacitação adicionada.');
}

// ============== CONFIGURAÇÕES (Atualização 6) ==============
// Paletas: cada esquema sobrescreve as variáveis --blue-* que regem a cor predominante do site.
const themePalettes = {
  blue:   { label:'Azul',     swatch:'#2563eb', vars:{ '50':'#eff6ff','100':'#dbeafe','200':'#bfdbfe','300':'#93c5fd','400':'#60a5fa','500':'#3b82f6','600':'#2563eb','700':'#1d4ed8','800':'#1e40af','900':'#1e3a8a' } },
  green:  { label:'Verde',    swatch:'#16a34a', vars:{ '50':'#f0fdf4','100':'#dcfce7','200':'#bbf7d0','300':'#86efac','400':'#4ade80','500':'#22c55e','600':'#16a34a','700':'#15803d','800':'#166534','900':'#14532d' } },
  purple: { label:'Roxo',     swatch:'#7c3aed', vars:{ '50':'#f5f3ff','100':'#ede9fe','200':'#ddd6fe','300':'#c4b5fd','400':'#a78bfa','500':'#8b5cf6','600':'#7c3aed','700':'#6d28d9','800':'#5b21b6','900':'#4c1d95' } },
  orange: { label:'Laranja',  swatch:'#ea580c', vars:{ '50':'#fff7ed','100':'#ffedd5','200':'#fed7aa','300':'#fdba74','400':'#fb923c','500':'#f97316','600':'#ea580c','700':'#c2410c','800':'#9a3412','900':'#7c2d12' } },
  pink:   { label:'Rosa',     swatch:'#db2777', vars:{ '50':'#fdf2f8','100':'#fce7f3','200':'#fbcfe8','300':'#f9a8d4','400':'#f472b6','500':'#ec4899','600':'#db2777','700':'#be185d','800':'#9d174d','900':'#831843' } },
  red:    { label:'Vermelho', swatch:'#dc2626', vars:{ '50':'#fef2f2','100':'#fee2e2','200':'#fecaca','300':'#fca5a5','400':'#f87171','500':'#ef4444','600':'#dc2626','700':'#b91c1c','800':'#991b1b','900':'#7f1d1d' } },
  teal:   { label:'Turquesa', swatch:'#0d9488', vars:{ '50':'#f0fdfa','100':'#ccfbf1','200':'#99f6e4','300':'#5eead4','400':'#2dd4bf','500':'#14b8a6','600':'#0d9488','700':'#0f766e','800':'#115e59','900':'#134e4a' } },
  slate:  { label:'Grafite',  swatch:'#334155', vars:{ '50':'#f8fafc','100':'#f1f5f9','200':'#e2e8f0','300':'#cbd5e1','400':'#94a3b8','500':'#64748b','600':'#475569','700':'#334155','800':'#1e293b','900':'#0f172a' } },
};
let activeTheme = localStorage.getItem('theme_color') || 'blue';

function setThemeColor(key) {
  const t = themePalettes[key]; if (!t) return;
  Object.entries(t.vars).forEach(([shade, hex]) => {
    document.documentElement.style.setProperty(`--blue-${shade}`, hex);
  });
  activeTheme = key;
  localStorage.setItem('theme_color', key);
  localStorage.removeItem('theme_hex');
  // Re-renderiza a paleta para atualizar o highlight do swatch ativo.
  if (document.getElementById('theme-palette')) renderThemePalette();
  showToast(`Tema "${t.label}" aplicado.`);
}

// Atualização 6.1: gera 10 tons (50..900) a partir de um HEX base (600).
// Tons claros = mix com branco; tons escuros = mix com preto.
function hexToRgb(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim()); if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}
function mix(c1, c2, t) {
  return { r: c1.r + (c2.r - c1.r) * t, g: c1.g + (c2.g - c1.g) * t, b: c1.b + (c2.b - c1.b) * t };
}
function generateShadesFromHex(hex) {
  const base = hexToRgb(hex); if (!base) return null;
  const white = { r:255, g:255, b:255 };
  const black = { r:0,   g:0,   b:0   };
  // Ratios de mistura (0 = cor pura, positivo = mais branco, negativo = mais preto)
  const ratios = { '50':0.95, '100':0.85, '200':0.72, '300':0.55, '400':0.32, '500':0.14, '600':0, '700':-0.18, '800':-0.32, '900':-0.45 };
  const out = {};
  Object.entries(ratios).forEach(([shade, t]) => {
    const target = t >= 0 ? white : black;
    const mixed  = mix(base, target, Math.abs(t));
    out[shade] = rgbToHex(mixed.r, mixed.g, mixed.b);
  });
  return out;
}

function applyCustomThemeColor() {
  const hex = (document.getElementById('theme-hex-input')?.value || '').trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) { showToast('HEX inválido. Use formato #RRGGBB.'); return; }
  const shades = generateShadesFromHex(hex); if (!shades) { showToast('Não foi possível gerar tons.'); return; }
  Object.entries(shades).forEach(([shade, h]) => {
    document.documentElement.style.setProperty(`--blue-${shade}`, h);
  });
  activeTheme = 'custom';
  localStorage.setItem('theme_color', 'custom');
  localStorage.setItem('theme_hex', hex);
  if (document.getElementById('theme-palette')) renderThemePalette();
  showToast(`Cor personalizada ${hex} aplicada.`);
}

function renderThemePalette() {
  const el = document.getElementById('theme-palette'); if (!el) return;
  el.innerHTML = Object.entries(themePalettes).map(([key, t]) => `
    <div class="theme-swatch ${activeTheme === key ? 'active' : ''}"
         style="background:${t.swatch};"
         title="${t.label}"
         onclick="setThemeColor('${key}')">
      ${activeTheme === key ? '<span>✓</span>' : ''}
    </div>
    <div class="theme-swatch-label">${t.label}</div>
  `).join('');
}

(function applyThemeOnBoot() {
  const saved = localStorage.getItem('theme_color');
  if (saved === 'custom') {
    const hex = localStorage.getItem('theme_hex');
    if (hex) {
      const shades = generateShadesFromHex(hex);
      if (shades) {
        Object.entries(shades).forEach(([shade, h]) => {
          document.documentElement.style.setProperty(`--blue-${shade}`, h);
        });
        activeTheme = 'custom';
      }
    }
  } else if (saved && themePalettes[saved] && saved !== 'blue') {
    Object.entries(themePalettes[saved].vars).forEach(([shade, hex]) => {
      document.documentElement.style.setProperty(`--blue-${shade}`, hex);
    });
    activeTheme = saved;
  }
})();

// Atualização 9.1: Trainee não tem setor — esconde o campo Setor no cadastro.
// O padrinho NÃO é escolhido aqui: é definido depois, na lista de Membros.
function updateNovoMembroSetor() {
  const cargo     = document.getElementById('cfg-novo-cargo')?.value;
  const setorWrap = document.getElementById('cfg-novo-setor-wrap');
  if (!setorWrap) return;
  setorWrap.style.display = cargo === 'Trainee' ? 'none' : '';
}

function submitAddMembro() {
  if (!can('membros.edit')) { showToast('Apenas Presidente ou Diretor de Coordenação gerencia membros.'); return; }
  const nome   = document.getElementById('cfg-novo-nome').value.trim();
  const email  = document.getElementById('cfg-novo-email').value.trim();
  const cargo  = document.getElementById('cfg-novo-cargo').value;
  if (!nome)  { showToast('Informe o nome.'); return; }
  if (!email) { showToast('Informe o e-mail.'); return; }
  if (!email.endsWith('@integrejr.com.br')) { showToast('E-mail precisa terminar em @integrejr.com.br'); return; }
  if (members.some(m => m.name === nome)) { showToast('Já existe um membro com esse nome.'); return; }
  const isTrainee = cargo === 'Trainee';
  const setor     = isTrainee ? '—' : document.getElementById('cfg-novo-setor').value;
  const accessMap = { 'Presidente':'Total', 'Diretor':'Diretoria', 'Gerente':'Gerência', 'Membro':'Membro', 'Trainee':'Trainee' };
  const novo = {
    name: nome, role: cargo, sector: setor, access: accessMap[cargo] || 'Membro',
    status: 'Ativo', email,
    course: '—', entryDate: 'novo', capsCount: 0,
    // Trainee entra sem padrinho; o admin atribui na lista de Membros.
    ...(isTrainee ? { padrinho: '', points: 0 } : {}),
  };
  members.push(novo);
  dbCreateMember(novo);      // grava o perfil no banco e preenche novo.id
  seedCredentialFor(email);  // fallback offline: senha padrão local
  ['cfg-novo-nome','cfg-novo-email'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  if (document.getElementById('memb-table'))         renderMembros();
  if (document.getElementById('permissions-table'))  renderPermissions();
  refreshProtoUserSelect();
  showToast(isTrainee
    ? `${nome} adicionado como Trainee. Defina o padrinho na lista. (Login ativado pelo admin.)`
    : `${nome} adicionado como ${cargo}. (Login ativado pelo admin.)`);
}

// Modo noturno: alterna a classe `dark` no <html> e persiste no navegador.
// O <head> aplica o estado salvo antes do CSS pintar (anti-flash); aqui só
// tratamos o clique no toggle e o rótulo. Independente do tema de COR.
function toggleDarkMode(on) {
  document.documentElement.classList.toggle('dark', !!on);
  localStorage.setItem('theme_dark', on ? '1' : '0');
  const label = document.getElementById('cfg-dark-label');
  if (label) label.textContent = on ? 'Ativado' : 'Desativado';
}

function renderConfiguracoes() {
  // Atualização 9.1: a lista de membros saiu daqui (mora na página Membros).
  // Pré-preenche o campo de nome da empresa com o valor atual.
  const cn = document.getElementById('cfg-company-name');
  if (cn) cn.value = (document.querySelector('.brand-name')?.textContent || 'Integre Jr').trim();
  // Reflete o estado atual do modo noturno no toggle.
  const darkToggle = document.getElementById('cfg-dark-toggle');
  if (darkToggle) {
    const on = document.documentElement.classList.contains('dark');
    darkToggle.checked = on;
    const dl = document.getElementById('cfg-dark-label');
    if (dl) dl.textContent = on ? 'Ativado' : 'Desativado';
  }
  // Sincroniza input HEX texto ↔ color
  const hexInput = document.getElementById('theme-hex-input');
  const hexText  = document.getElementById('theme-hex-text');
  if (hexInput && hexText) {
    hexText.value = hexInput.value;
    hexInput.oninput = () => { hexText.value = hexInput.value; };
    hexText.oninput  = () => {
      const v = hexText.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) hexInput.value = v;
    };
  }
}

// ============== PERMISSÕES ==============
let permFilter={search:'',role:'',sector:''};

function renderPermissions() {
  const tbody=document.getElementById('permissions-table'); if(!tbody) return;
  const filtered=members.filter(m=>{
    const q=permFilter.search.toLowerCase();
    return(!q||m.name.toLowerCase().includes(q)||m.role.toLowerCase().includes(q))&&(!permFilter.role||m.role===permFilter.role)&&(!permFilter.sector||m.sector===permFilter.sector);
  });
  tbody.innerHTML=filtered.map(m=>{const gi=members.indexOf(m); const isTrainee = m.role === 'Trainee'; return`
    <tr><td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar sm">${initials(m.name)}</div>
      <div><div style="font-weight:600;">${gesc(m.name)}${m.self?' <span class="tag" style="font-size:10px;">Você</span>':''}</div>
      <div style="font-size:11px;color:var(--gray-500);">${m.name.toLowerCase().replace(' ','.')}@integrejr.com.br</div></div></div></td>
    <td><select data-i="${gi}" data-field="role" ${m.self?'disabled':''}>
      ${['Presidente','Diretor','Gerente','Membro','Trainee'].map(r=>`<option ${r===m.role?'selected':''}>${r}</option>`).join('')}</select></td>
    <td>${isTrainee
      ? '<span style="color:var(--gray-400);font-size:12px;font-style:italic;">— sem setor —</span>'
      : `<select data-i="${gi}" data-field="sector" ${m.self?'disabled':''}>
          ${['Coordenação','Projetos','Comercial','ADM/FIN'].map(s=>`<option ${s===m.sector?'selected':''}>${s}</option>`).join('')}</select>`}</td>
    <td><select data-i="${gi}" data-field="access" ${m.self?'disabled':''}>
      ${['Total','Diretoria','Gerência','Membro','Trainee'].map(a=>`<option ${a===m.access?'selected':''}>${a}</option>`).join('')}</select></td>
    <td><span class="tag ${m.status==='Ativo'?'green':'gray'}">${m.status}</span></td>
    <td>${m.self?'':` <button class="btn btn-ghost" onclick="toggleStatus(${gi})" style="font-size:12px;">${m.status==='Ativo'?'Desativar':'Reativar'}</button>`}</td>
    </tr>`;}).join('');
  tbody.querySelectorAll('select').forEach(sel=>sel.addEventListener('change',e=>{
    const i=parseInt(e.target.dataset.i),f=e.target.dataset.field;
    members[i][f]=e.target.value;
    // Atualização 6.1: ao virar Trainee, zera setor; ao sair de Trainee, define um setor padrão.
    if (f === 'role') {
      if (e.target.value === 'Trainee') members[i].sector = '—';
      else if (members[i].sector === '—' || !members[i].sector) members[i].sector = 'Projetos';
      renderPermissions();
    }
    dbUpdateMember(members[i], { role: members[i].role, sector: members[i].sector, access: members[i].access });
    showToast(`${members[i].name}: ${f} → ${e.target.value}`);
  }));
  const si=document.getElementById('perm-search'),rs=document.getElementById('perm-role'),ss=document.getElementById('perm-sector');
  if(si&&!si._wired){si._wired=true;si.addEventListener('input',()=>{permFilter.search=si.value;renderPermissions();});}
  if(rs&&!rs._wired){rs._wired=true;rs.addEventListener('change',()=>{permFilter.role=rs.value==='Todos os cargos'?'':rs.value;renderPermissions();});}
  if(ss&&!ss._wired){ss._wired=true;ss.addEventListener('change',()=>{permFilter.sector=ss.value==='Todos os setores'?'':ss.value;renderPermissions();});}
}

function toggleStatus(i) { members[i].status=members[i].status==='Ativo'?'Inativo':'Ativo'; dbUpdateMember(members[i], { status: members[i].status }); renderPermissions(); showToast(`${members[i].name} agora está ${members[i].status}.`); }

// ============== MEMBROS — Atualização 9 ==============
let membFilter = { search: '', role: '', status: '' };
let desligamentoCtx = null; // { memberName }

function renderMembros() {
  const tbody = document.getElementById('memb-table'); if (!tbody) return;
  const f = membFilter;
  const rows = members.filter(m => {
    if (f.search && !`${m.name} ${m.role}`.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.role   && m.role   !== f.role)   return false;
    if (f.status && m.status !== f.status) return false;
    return true;
  });
  // Atualização 9.1: a lista virou editável (igual à antiga tabela de Configurações).
  // Cargo e setor são selects; para Trainee, no lugar do setor escolhe-se o PADRINHO
  // (lista dos membros efetivos = não-trainees ativos).
  const roles    = ['Presidente','Diretor','Gerente','Membro','Trainee'];
  const sectors  = ['Coordenação','Projetos','Comercial','ADM/FIN'];
  const efetivos = members.filter(x => x.role !== 'Trainee' && x.status === 'Ativo');
  // Atualização 10: só Presidente/Diretor de Coordenação editam; os demais (que
  // têm acesso à página) veem em modo somente-leitura.
  const canEditMembers = can('membros.edit');
  tbody.innerHTML = rows.length === 0
    ? '<tr><td colspan="6" class="td-empty">Nenhum membro encontrado.</td></tr>'
    : rows.map(m => {
        const gi = members.indexOf(m);
        const isSelf = m.name === currentUser.name;
        const isTrainee = m.role === 'Trainee';
        const dis = (canEditMembers && !isSelf) ? '' : 'disabled';  // próprio cargo nunca é editável
        // Coluna "Setor / Padrinho": Trainee → select de padrinho; demais → select de setor.
        const setorPadCell = isTrainee
          ? `<select data-i="${gi}" data-field="padrinho" ${dis}>
               ${!m.padrinho ? '<option value="">— escolher padrinho —</option>' : ''}
               ${efetivos.map(e => `<option ${e.name === m.padrinho ? 'selected' : ''}>${gesc(e.name)}</option>`).join('')}
             </select>`
          : `<select data-i="${gi}" data-field="sector" ${dis}>
               ${sectors.map(s => `<option ${s === m.sector ? 'selected' : ''}>${s}</option>`).join('')}
             </select>`;
        const statTag = m.status === 'Ativo' ? '<span class="tag green">Ativo</span>' : '<span class="tag">Inativo</span>';
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="avatar sm">${initials(m.name)}</div>
              <div>
                <div style="font-weight:600;">${gesc(m.name)}${isSelf ? ' <span style="font-size:10px;background:var(--blue-100);color:var(--blue-700);padding:1px 6px;border-radius:999px;margin-left:4px;">você</span>' : ''}</div>
                <div style="font-size:11px;color:var(--gray-500);">${gesc(m.email || '')}</div>
              </div>
            </div>
          </td>
          <td><select data-i="${gi}" data-field="role" ${dis}>
            ${roles.map(r => `<option ${r === m.role ? 'selected' : ''}>${r}</option>`).join('')}
          </select></td>
          <td>${setorPadCell}</td>
          <td>${gesc(m.entryDate || '—')}</td>
          <td>${statTag}</td>
          <td style="text-align:right;white-space:nowrap;">
            ${canEditMembers ? `
            <button class="btn btn-ghost" style="font-size:12px;" onclick="toggleStatusByName(${jsArg(m.name)})">${m.status === 'Ativo' ? '⏸ Desativar' : '▶ Ativar'}</button>
            <button class="btn btn-ghost" style="font-size:12px;color:#dc2626;" onclick="openDesligarMembro(${jsArg(m.name)})">Desligar</button>
            ${!isSelf ? `<button class="btn btn-ghost" style="font-size:12px;color:#991b1b;" onclick="excluirMembroPermanente(${jsArg(m.name)})" title="Apaga o registro do banco — só para teste/erro">Excluir</button>` : ''}
            ` : '<span style="font-size:12px;color:var(--gray-400);">—</span>'}
          </td>
        </tr>`;
      }).join('');
  // Esconde o card "Adicionar membro" quando é só-leitura.
  const addBtn = document.querySelector('[onclick="submitAddMembro()"]');
  if (addBtn) { const card = addBtn.closest('.card'); if (card) card.style.display = canEditMembers ? '' : 'none'; }
  // Liga os selects de cargo/setor/padrinho.
  tbody.querySelectorAll('select').forEach(sel => sel.addEventListener('change', e => {
    onMembroFieldChange(parseInt(e.target.dataset.i), e.target.dataset.field, e.target.value);
  }));
  // Filtros (liga 1 vez)
  const si = document.getElementById('memb-search'), rs = document.getElementById('memb-role'), st = document.getElementById('memb-status');
  if (si && !si._wired) { si._wired = true; si.addEventListener('input',  () => { membFilter.search = si.value; renderMembros(); }); }
  if (rs && !rs._wired) { rs._wired = true; rs.addEventListener('change', () => { membFilter.role   = rs.value === 'Todos os cargos'  ? '' : rs.value; renderMembros(); }); }
  if (st && !st._wired) { st._wired = true; st.addEventListener('change', () => { membFilter.status = st.value === 'Todos os status' ? '' : st.value; renderMembros(); }); }
  // Form: refletir cargo→setor de imediato
  updateNovoMembroSetor();
}

// Atualização 9.1: aplica a edição de cargo/setor/padrinho feita na lista de Membros.
function onMembroFieldChange(i, field, value) {
  if (!can('membros.edit')) { showToast('Sem permissão para editar membros.'); renderMembros(); return; }
  const m = members[i]; if (!m) return;
  if (field === 'role') {
    m.role = value;
    const accessMap = { 'Presidente':'Total','Diretor':'Diretoria','Gerente':'Gerência','Membro':'Membro','Trainee':'Trainee' };
    m.access = accessMap[value] || 'Membro';
    if (value === 'Trainee') {
      m.sector = '—';
      if (typeof m.points !== 'number') m.points = 0;
      if (!m.padrinho) m.padrinho = ''; // admin escolhe na própria lista
    } else {
      if (m.sector === '—' || !m.sector) m.sector = 'Projetos';
      delete m.padrinho;
    }
  } else if (field === 'sector') {
    m.sector = value;
  } else if (field === 'padrinho') {
    m.padrinho = value;
  }
  dbUpdateMember(m, { role: m.role, sector: m.sector, access: m.access, padrinho: ('padrinho' in m ? m.padrinho : null) });
  if (document.getElementById('memb-table'))        renderMembros();
  if (document.getElementById('permissions-table')) renderPermissions();
  showToast(`${m.name}: ${field === 'padrinho' ? 'padrinho' : field} → ${value || '—'}`);
}

function toggleStatusByName(name) {
  if (!can('membros.edit')) { showToast('Sem permissão para alterar membros.'); return; }
  const i = members.findIndex(m => m.name === name); if (i < 0) return;
  members[i].status = members[i].status === 'Ativo' ? 'Inativo' : 'Ativo';
  dbUpdateMember(members[i], { status: members[i].status });
  if (document.getElementById('memb-table'))        renderMembros();
  if (document.getElementById('permissions-table')) renderPermissions();
  showToast(`${members[i].name} agora está ${members[i].status}.`);
}

function openDesligarMembro(name) {
  if (!can('membros.edit')) { showToast('Sem permissão para desligar membros.'); return; }
  desligamentoCtx = { memberName: name };
  const lbl = document.getElementById('desl-membro-nome');
  if (lbl) lbl.textContent = name;
  document.getElementById('modal-desligar').classList.add('active');
}

// Executa o desligamento. Tipo: 'ma_conduta' ou 'normal'.
// Decisão de projeto (exclusão híbrida): desligar = SOFT — marca Inativo e
// PRESERVA o registro/histórico. Um Inativo não consegue mais entrar (bloqueio
// no login). Para apagar de vez (teste/erro), use "Excluir permanentemente".
// PLACEHOLDER de geração de documento — template e mapeamento entram depois.
async function executarDesligamento(tipo) {
  if (!desligamentoCtx) return;
  const nome = desligamentoCtx.memberName;
  const tituloDoc = tipo === 'ma_conduta' ? 'TERMO DE DESLIGAMENTO POR MÁ CONDUTA' : 'TERMO DE DESLIGAMENTO';
  console.log(`${tituloDoc} gerado para ${nome} — placeholder (template pendente).`);
  const m = members.find(x => x.name === nome);
  if (m) {
    m.status = 'Inativo';
    await dbUpdateMember(m, { status: 'Inativo' });
    if (!sbClient) {  // fallback offline: também tira a credencial local
      const e = memberEmail(m); delete authData.byEmail[e]; delete authData.resetCodes[e]; saveAuth();
    }
  }
  desligamentoCtx = null;
  closeModal('modal-desligar');
  if (document.getElementById('memb-table'))        renderMembros();
  if (document.getElementById('permissions-table')) renderPermissions();
  refreshProtoUserSelect();
  showToast(`${nome} desligado(a) — agora Inativo. ${tituloDoc.toLowerCase()} gerado (placeholder).`);
}

// Exclusão PERMANENTE (hard delete). Apaga o registro do banco; as FKs limpam os
// vínculos (projetos, progresso, ponto). Use só para registros de teste/erro.
async function excluirMembroPermanente(name) {
  if (!can('membros.edit')) { showToast('Sem permissão para excluir membros.'); return; }
  const i = members.findIndex(m => m.name === name); if (i < 0) return;
  const m = members[i];
  if (m.self || m.name === currentUser.name) { showToast('Você não pode excluir a si mesmo.'); return; }
  if (!confirm(`Excluir PERMANENTEMENTE ${name}?\n\nApaga o registro e todo o histórico vinculado (projetos, progresso, ponto). Não dá para desfazer.\n\nPara apenas afastar mantendo o histórico, use "Desligar".`)) return;
  await dbDeleteMember(m);
  members.splice(i, 1);
  if (document.getElementById('memb-table'))        renderMembros();
  if (document.getElementById('permissions-table')) renderPermissions();
  refreshProtoUserSelect();
  showToast(`${name} excluído permanentemente.`);
}

// ============== EDITAR TÓPICOS DE CAPACITAÇÃO — Atualização 9 ==============
// Gera slug ASCII para a chave do tópico (ex.: "Comunicação Visual" -> "comunicacao_visual").
function slugTopico(nome) {
  return (nome || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function openEditarTopicos() {
  renderTopicosEditor();
  document.getElementById('modal-cap-topicos').classList.add('active');
}

function renderTopicosEditor() {
  const list = document.getElementById('cap-topicos-list'); if (!list) return;
  const entries = Object.entries(capTree);
  if (entries.length === 0) { list.innerHTML = '<div class="u-muted text-13">Nenhum tópico.</div>'; return; }
  list.innerHTML = entries.map(([key, col]) => {
    const qtd = (col.tracks || []).reduce((acc, t) => acc + t.length, 0);
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--gray-100);border-radius:6px;">
      <div style="flex:1;">
        <div style="font-weight:600;">${gesc(col.label)}</div>
        <div style="font-size:11px;color:var(--gray-500);">${qtd} capacitaç${qtd === 1 ? 'ão' : 'ões'}</div>
      </div>
      <button class="btn btn-ghost" style="font-size:12px;color:#dc2626;" onclick="removeTopicoCap('${key}')">Remover</button>
    </div>`;
  }).join('');
}

async function addTopicoCap() {
  const nome  = (document.getElementById('cap-novo-nome')?.value  || '').trim();
  if (!nome) { showToast('Informe o nome do tópico.'); return; }
  const key = slugTopico(nome);
  if (!key)           { showToast('Nome inválido.'); return; }
  if (capTree[key])   { showToast('Já existe um tópico com esse nome.'); return; }
  const trackId = await dbCreateTopic(key, nome, '');   // cria tópico + 1 trilha no banco
  capTree[key] = { label: nome, emoji: '', tracks: [[]], _trackIds: [trackId] };
  document.getElementById('cap-novo-nome').value = '';
  renderTopicosEditor();
  renderCapacitacoes();
  showToast(`Tópico "${nome}" adicionado.`);
}

function removeTopicoCap(key) {
  const col = capTree[key]; if (!col) return;
  const qtd = (col.tracks || []).reduce((acc, t) => acc + t.length, 0);
  const msg = qtd > 0
    ? `Remover o tópico "${col.label}"?\n\nIsso apaga ${qtd} capacitaç${qtd === 1 ? 'ão' : 'ões'} dentro dele.`
    : `Remover o tópico "${col.label}"?`;
  if (!confirm(msg)) return;
  dbDeleteTopic(key);
  delete capTree[key];
  renderTopicosEditor();
  renderCapacitacoes();
  showToast(`Tópico "${col.label}" removido.`);
}

// ============== CONTRATOS — Atualização 8 (item 6) ==============
let contratoTextoAtual = '';

function renderContratos() {
  const dataEl = document.getElementById('ct-data');
  if (dataEl && !dataEl.value) dataEl.value = fmtDMY(appToday()); // data do contrato = hoje
  ['ct-inicio', 'ct-entrega', 'ct-data'].forEach(id => maskDate(document.getElementById(id)));
}

// Coleta os dados do formulário num objeto. (Ponto único para ajustar campos.)
function coletarDadosContrato() {
  const val = id => (document.getElementById(id)?.value || '').trim();
  const valorNum = parseFloat(document.getElementById('ct-valor')?.value);
  return {
    clienteNome: val('ct-cliente-nome'), clienteDoc: val('ct-cliente-doc'),
    clienteEnd: val('ct-cliente-end'), clienteRep: val('ct-cliente-rep'),
    clienteContato: val('ct-cliente-contato'),
    objeto: val('ct-objeto'), valor: isNaN(valorNum) ? 0 : valorNum,
    pagamento: val('ct-pagamento'), inicio: val('ct-inicio'),
    entrega: val('ct-entrega'), cidade: val('ct-cidade'), data: val('ct-data'),
  };
}

// Monta o TEXTO do contrato de PRESTAÇÃO DE SERVIÇOS. PLACEHOLDER — trocar pelo template oficial depois.
function montarContratoServico(d) {
  const fmtR = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const ou = (v, alt) => v || alt;
  return [
    'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
    '',
    'CONTRATADA: Integre Jr — Empresa Júnior de Engenharia de Controle e Automação (UFSC).',
    `CONTRATANTE: ${ou(d.clienteNome, '____________________')}`
      + (d.clienteDoc ? `, inscrita sob ${d.clienteDoc}` : '')
      + (d.clienteEnd ? `, com sede em ${d.clienteEnd}` : '')
      + (d.clienteRep ? `, neste ato representada por ${d.clienteRep}` : '') + '.',
    '',
    'CLÁUSULA 1ª — DO OBJETO',
    ou(d.objeto, '____________________'),
    '',
    'CLÁUSULA 2ª — DO VALOR E PAGAMENTO',
    `O valor total dos serviços é de ${fmtR(d.valor)}, na forma: ${ou(d.pagamento, 'a combinar')}.`,
    '',
    'CLÁUSULA 3ª — DO PRAZO',
    `Início em ${ou(d.inicio, '__/__/____')} e entrega prevista para ${ou(d.entrega, '__/__/____')}.`,
    '',
    'CLÁUSULA 4ª — DO FORO',
    `Fica eleito o foro da comarca de ${ou(d.cidade, '____________')} para dirimir dúvidas deste contrato.`,
    '',
    `${ou(d.cidade, '____________')}, ${ou(d.data, '__/__/____')}.`,
    '',
    '_______________________________        _______________________________',
    'Integre Jr (Contratada)                ' + ou(d.clienteNome, 'Contratante'),
  ].join('\n');
}

// Monta o TEXTO do contrato de PATROCÍNIO. PLACEHOLDER — template oficial vem depois.
function montarContratoPatrocinio(d) {
  const fmtR = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const ou = (v, alt) => v || alt;
  return [
    'CONTRATO DE PATROCÍNIO',
    '(Modelo provisório — aguardando template oficial.)',
    '',
    `PATROCINADOR: ${ou(d.clienteNome, '____________________')}`
      + (d.clienteDoc ? `, inscrito sob ${d.clienteDoc}` : '')
      + (d.clienteEnd ? `, com sede em ${d.clienteEnd}` : '')
      + (d.clienteRep ? `, neste ato representado por ${d.clienteRep}` : '') + '.',
    'PATROCINADA: Integre Jr — Empresa Júnior de Engenharia de Controle e Automação (UFSC).',
    '',
    'CLÁUSULA 1ª — DO OBJETO',
    'Apoio financeiro/institucional ao seguinte projeto/evento:',
    ou(d.objeto, '____________________'),
    '',
    'CLÁUSULA 2ª — DO VALOR DO PATROCÍNIO',
    `Valor total: ${fmtR(d.valor)}. Forma de repasse: ${ou(d.pagamento, 'a combinar')}.`,
    '',
    'CLÁUSULA 3ª — DA VIGÊNCIA',
    `Início em ${ou(d.inicio, '__/__/____')}; término previsto em ${ou(d.entrega, '__/__/____')}.`,
    '',
    'CLÁUSULA 4ª — DAS CONTRAPARTIDAS',
    '[A definir conforme template oficial: divulgação, presença de marca, materiais, etc.]',
    '',
    'CLÁUSULA 5ª — DO FORO',
    `Comarca de ${ou(d.cidade, '____________')}.`,
    '',
    `${ou(d.cidade, '____________')}, ${ou(d.data, '__/__/____')}.`,
    '',
    '_______________________________        _______________________________',
    ou(d.clienteNome, 'Patrocinador') + '                Integre Jr (Patrocinada)',
  ].join('\n');
}

// Despacha para o modelo selecionado. Ponto único de extensão para novos modelos.
function montarContrato(d, modelo) {
  if (modelo === 'patrocinio') return montarContratoPatrocinio(d);
  return montarContratoServico(d);
}

function gerarContrato() {
  const d = coletarDadosContrato();
  if (!d.clienteNome) { showToast('Informe o nome/razão social do cliente.'); return; }
  if (!d.objeto)      { showToast('Descreva o objeto do contrato.'); return; }
  if (!d.valor)       { showToast('Informe o valor total.'); return; }
  for (const [id, label] of [['inicio', 'Início'], ['entrega', 'Entrega'], ['data', 'Data do contrato']]) {
    if (d[id] && !isValidBR(d[id])) { showToast(`${label}: data inválida (use dd/mm/aaaa).`); return; }
  }
  const modelo = (document.getElementById('ct-modelo')?.value || 'servico');
  contratoTextoAtual = montarContrato(d, modelo);
  const pre = document.getElementById('ct-preview');
  if (pre) pre.textContent = contratoTextoAtual;          // textContent: sem risco de injeção
  const card = document.getElementById('ct-preview-card');
  if (card) { card.style.display = ''; card.scrollIntoView({ behavior: 'smooth' }); }
  showToast(`Contrato ${modelo === 'patrocinio' ? 'de patrocínio' : 'de serviços'} gerado.`);
}

function copiarContrato() {
  if (!contratoTextoAtual) return;
  navigator.clipboard?.writeText(contratoTextoAtual)
    .then(() => showToast('Contrato copiado.'))
    .catch(() => showToast('Não foi possível copiar.'));
}

function imprimirContrato() {
  if (!contratoTextoAtual) return;
  const w = window.open('', '_blank');
  if (!w) { showToast('Permita pop-ups para imprimir.'); return; }
  w.document.write(`<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:13px;line-height:1.6;padding:24px;">${gesc(contratoTextoAtual)}</pre>`);
  w.document.close(); w.focus(); w.print();
}

// ============== PONTO — Atualização 8 (item 7) ==============
// Dados persistidos (espelham o que iria para a planilha — que ainda não existe).
// Atualização 9: as chaves semana.weekKey e engajamento.weekKey agora servem
// também como TRAVA: se a semana atual coincide, está bloqueado até segunda.
let pontoData = {
  semana:      { worked: 0, meetings: 0, weekKey: null },
  engajamento: { value: null, weekKey: null },
  crono:       { acumuladoMs: 0, weekKey: null },  // soma dos tempos guardados (zera ao mudar de semana)
};
// Estado do cronômetro (runtime, NÃO persiste — não faz sentido cruzar reload).
let pontoTimer = { running: false, startTs: 0 };
let pontoTickHandle = null;

function pontoWeekKey() { return _isoWeek(appToday()); }      // segunda-feira da semana atual

// Formata duração (ms) em HH:MM:SS.
function fmtDur(ms) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function pontoElapsedMs() { return pontoTimer.running ? Date.now() - pontoTimer.startTs : 0; }
function pontoTick() { const el = document.getElementById('ponto-display'); if (el) el.textContent = fmtDur(pontoElapsedMs()); }

// Atualização 9: regras de quando se pode editar.
// Horas da semana e engajamento só na segunda (getDay()===1) e uma vez por semana.
function pontoIsMonday()       { return appToday().getDay() === 1; }
function pontoCanEditSemana()  { return pontoIsMonday() && pontoData.semana.weekKey      !== pontoWeekKey(); }
function pontoCanEditEngaj()   { return pontoIsMonday() && pontoData.engajamento.weekKey !== pontoWeekKey(); }

// Garante que o acumulador é da semana atual (zera ao virar de semana).
function pontoEnsureCronoWeek() {
  const wk = pontoWeekKey();
  if (pontoData.crono.weekKey !== wk) pontoData.crono = { acumuladoMs: 0, weekKey: wk };
}

// Inicia/para o cronômetro. Ao parar, pergunta se guarda — se sim, soma no acumulador semanal.
function pontoToggle() {
  const btn = document.getElementById('ponto-toggle');
  if (!pontoTimer.running) {
    pontoTimer.running = true;
    pontoTimer.startTs = Date.now();                 // tempo real: é cronômetro, não calendário
    pontoTickHandle = setInterval(pontoTick, 1000);
    if (btn) { btn.textContent = '⏹ Parar'; btn.classList.replace('btn-primary', 'btn-purple'); }
    pontoTick();
  } else {
    const ms = pontoElapsedMs();
    pontoTimer.running = false;
    clearInterval(pontoTickHandle); pontoTickHandle = null;
    if (btn) { btn.textContent = '▶ Iniciar'; btn.classList.replace('btn-purple', 'btn-primary'); }
    const el = document.getElementById('ponto-display'); if (el) el.textContent = '00:00:00';
    if (ms < 1000) return;                            // clique sem tempo (<1s): ignora
    const horas = ms / 3600000;
    // Atualização 9: cronômetro NÃO envia planilha — soma no acumulador semanal.
    if (confirm(`Tempo: ${fmtDur(ms)} (${horas.toFixed(2)} h).\n\nGuardar e somar no acumulado da semana?`)) {
      pontoEnsureCronoWeek();
      pontoData.crono.acumuladoMs += ms;
      dbSavePonto({ crono_ms: pontoData.crono.acumuladoMs });
      renderPonto();
      showToast(`+${horas.toFixed(2)} h no acumulado da semana.`);
    } else {
      showToast('Tempo descartado.');
    }
  }
}

// Registra as horas da semana (com dupla confirmação e trava semanal).
function pontoSubmitSemana() {
  if (!pontoCanEditSemana()) {
    showToast(pontoIsMonday()
      ? 'Você já registrou as horas desta semana.'
      : 'O registro só pode ser feito às segundas-feiras.');
    return;
  }
  const w = parseFloat(document.getElementById('ponto-worked')?.value);
  const m = parseFloat(document.getElementById('ponto-meetings')?.value);
  const worked = isNaN(w) ? 0 : Math.max(0, w);
  const meetings = isNaN(m) ? 0 : Math.max(0, m);
  if (worked === 0 && meetings === 0) { showToast('Informe ao menos uma quantidade de horas.'); return; }
  // Atualização 9: dupla confirmação antes de gravar.
  if (!confirm(`Enviar ${worked} h trabalhadas e ${meetings} h em reuniões?\n\nNão será possível alterar até a próxima segunda-feira.`)) return;
  pontoData.semana = { worked, meetings, weekKey: pontoWeekKey() };
  dbSavePonto({ worked, meetings });
  renderPonto();
  showToast('Horas da semana registradas. (Envio à planilha pendente.)');
}

// Define o engajamento da semana (1–10) com dupla confirmação e trava semanal.
function pontoSetEngajamento(v) {
  if (!pontoCanEditEngaj()) {
    showToast(pontoIsMonday()
      ? 'Você já marcou seu engajamento desta semana.'
      : 'O engajamento só pode ser marcado às segundas-feiras.');
    return;
  }
  if (!confirm(`Confirmar engajamento ${v}/10?\n\nNão será possível alterar até a próxima segunda-feira.`)) return;
  pontoData.engajamento = { value: v, weekKey: pontoWeekKey() };
  dbSavePonto({ engajamento: v });
  renderPonto();
  showToast(`Engajamento da semana: ${v}/10. (Envio à planilha pendente.)`);
}

function renderPonto() {
  // Cronômetro: reflete o estado atual (ex.: voltar à página com o timer rodando).
  const btn = document.getElementById('ponto-toggle');
  if (btn) {
    btn.textContent = pontoTimer.running ? '⏹ Parar' : '▶ Iniciar';
    btn.classList.toggle('btn-purple', pontoTimer.running);
    btn.classList.toggle('btn-primary', !pontoTimer.running);
  }
  pontoTick();
  if (pontoTimer.running && !pontoTickHandle) pontoTickHandle = setInterval(pontoTick, 1000);

  // Acumulado da semana (cronômetro). Zera se a semana já mudou.
  pontoEnsureCronoWeek();
  const acEl = document.getElementById('ponto-acumulado');
  if (acEl) acEl.textContent = fmtDur(pontoData.crono.acumuladoMs);

  const wk = pontoWeekKey();
  // Rótulo "Semana de dd/mm a dd/mm" + indicação de segunda-feira
  const lblEl = document.getElementById('ponto-semana-label');
  if (lblEl) {
    const seg = appToday(); seg.setDate(seg.getDate() - ((seg.getDay() + 6) % 7));
    const dom = new Date(seg); dom.setDate(dom.getDate() + 6);
    const f = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    lblEl.textContent = `Semana de ${f(seg)} a ${f(dom)}${pontoIsMonday() ? ' · hoje é segunda-feira' : ''}`;
  }
  // Status do registro semanal
  const s = pontoData.semana, sameWeek = s.weekKey === wk;
  const stEl = document.getElementById('ponto-semana-status');
  if (stEl) stEl.textContent = (sameWeek && (s.worked || s.meetings))
    ? `Registrado nesta semana: ${s.worked} h trabalhadas · ${s.meetings} h reuniões.`
    : 'Ainda sem registro nesta semana.';

  // Atualização 9: bloqueio da seção semanal — segunda-feira E uma vez por semana
  const canSem = pontoCanEditSemana();
  const wi = document.getElementById('ponto-worked'), mi = document.getElementById('ponto-meetings');
  const semBtn = document.getElementById('ponto-semana-btn');
  const semBloq = document.getElementById('ponto-semana-bloqueio');
  if (wi) { wi.disabled = !canSem; if (sameWeek) wi.value = s.worked || ''; }
  if (mi) { mi.disabled = !canSem; if (sameWeek) mi.value = s.meetings || ''; }
  if (semBtn) semBtn.disabled = !canSem;
  if (semBloq) {
    if (!canSem) {
      semBloq.style.display = '';
      semBloq.textContent = sameWeek
        ? 'Horas desta semana já registradas. Próxima edição: na segunda da semana que vem.'
        : 'O registro só fica disponível às segundas-feiras.';
    } else {
      semBloq.style.display = 'none';
    }
  }

  // Escala de engajamento 1–10 — destaca o valor da semana atual e respeita o bloqueio
  const canEng = pontoCanEditEngaj();
  const scale = document.getElementById('ponto-engaj-scale');
  if (scale) {
    const sel = (pontoData.engajamento.weekKey === wk) ? pontoData.engajamento.value : null;
    scale.innerHTML = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1;
      return `<button class="btn ${sel === n ? 'btn-primary' : 'btn-outline'}" style="min-width:42px;" ${canEng ? '' : 'disabled'} onclick="pontoSetEngajamento(${n})">${n}</button>`;
    }).join('');
  }
  const engBloq = document.getElementById('ponto-engaj-bloqueio');
  if (engBloq) {
    const sameEng = pontoData.engajamento.weekKey === wk;
    if (!canEng) {
      engBloq.style.display = '';
      engBloq.textContent = sameEng
        ? 'Engajamento desta semana já registrado. Próxima edição: na segunda da semana que vem.'
        : 'O engajamento só pode ser marcado às segundas-feiras.';
    } else {
      engBloq.style.display = 'none';
    }
  }
  const enSt = document.getElementById('ponto-engaj-status');
  if (enSt) enSt.textContent = (pontoData.engajamento.weekKey === wk && pontoData.engajamento.value)
    ? `Você marcou ${pontoData.engajamento.value}/10 nesta semana.`
    : 'Você ainda não marcou seu engajamento nesta semana.';
}

// ============== RELÓGIO / DATA CENTRAL — Atualização 8 ==============
// Fonte ÚNICA da data/hora "de agora" na plataforma. Base das automações de
// tempo (viradas de dia/semana/mês).

// "Agora" e "hoje" (zerado às 00:00) — use em vez de new Date() pelo app.
function appNow()   { return new Date(); }
function appToday() { const t = appNow(); t.setHours(0, 0, 0, 0); return t; }

// Marcadores de período para detectar virada (compara tick a tick).
function _isoDay(d)   { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function _isoMonth(d) { return `${d.getFullYear()}-${d.getMonth()}`; }
function _isoWeek(d) { // semana ancorada na segunda-feira
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // recua até a segunda
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
}

// Callbacks por tipo de virada. Item 3 registra aqui a atualização das metas.
const clockListeners = { day: [], week: [], month: [] };
function onPeriodChange(period, fn) { if (clockListeners[period]) clockListeners[period].push(fn); }

// Avaliado no boot (define a baseline, sem disparar) e a cada minuto / simulação.
// Não persiste a baseline entre reloads de propósito: evita disparar automação
// destrutiva (ex.: virada de mês) sem querer ao reabrir a aba.
let _clockMarks = null;
function onClockTick() {
  const now = appToday();
  const marks = { day: _isoDay(now), week: _isoWeek(now), month: _isoMonth(now) };
  if (_clockMarks === null) { _clockMarks = marks; return; } // baseline no boot
  ['month', 'week', 'day'].forEach(p => {
    if (_clockMarks[p] !== marks[p]) {
      clockListeners[p].forEach(fn => { try { fn(now); } catch (e) { /* listener isolado */ } });
      _clockMarks[p] = marks[p];
    }
  });
}

// ============== MODO PROTÓTIPO — Atualização 9 ==============
// Troca rápida do usuário logado (seletor de perfil no topbar).

// Reflete o currentUser no chip de usuário do topbar (nome, cargo, iniciais).
function refreshTopbarUserChip() {
  const nameEl = document.querySelector('.user-chip .name');
  const roleEl = document.querySelector('.user-chip .role');
  const av     = document.getElementById('topbar-avatar');
  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role;
  if (av)     av.textContent     = currentUser.avatar;
}

// Re-popula o select de usuário (chamar após mudanças em `members`).
function refreshProtoUserSelect() {
  const sel = document.getElementById('proto-user'); if (!sel) return;
  sel.innerHTML = members.map(m =>
    `<option value="${gesc(m.name)}" ${m.name === currentUser.name ? 'selected' : ''}>${gesc(m.name)} (${gesc(m.role)})</option>`
  ).join('');
}

// Re-renderiza a página atual (após trocar de usuário). Usa currentPage para
// cobrir também páginas fora da sidebar (ex.: 'projeto-detalhe' e seu cronograma).
function rerenderCurrentPage() {
  const fn = pageInitializers[currentPage]; if (fn) fn();
}

// "Vira" o usuário ativo a partir de um membro. Muta currentUser IN-PLACE
// (é `const` e várias funções capturaram a referência original). Usado tanto
// pelo login real (Atualização Login) quanto pelo switcher do Modo Protótipo.
function setCurrentUserFromMember(m) {
  const padrinho = m.role === 'Trainee' ? (m.padrinho || null) : null;
  Object.keys(currentUser).forEach(k => delete currentUser[k]);
  Object.assign(currentUser, {
    name: m.name, role: m.role, sector: m.sector,
    email: memberEmail(m),
    entryDate: m.entryDate || '—', course: m.course || '—',
    caps: [], avatar: initials(m.name), photo: null, self: true,
    ...(padrinho ? { padrinho } : {}),
  });
}

function protoSwitchUser(name) {
  const m = members.find(x => x.name === name); if (!m) return;
  setCurrentUserFromMember(m);
  setSession(memberEmail(m));   // mantém o usuário ao recarregar a página
  refreshTopbarUserChip();
  applySidebarPermissions();    // atualiza páginas visíveis para o novo cargo
  // Se a página atual não é mais permitida para o novo cargo, volta ao dashboard.
  const active = document.querySelector('.nav-item.active');
  if (active && !canSeePage(active.dataset.page)) goTo(DEFAULT_PAGE);
  else rerenderCurrentPage();
  showToast(`Agora logado como ${m.name} (${m.role}).`);
}

function protoInit() {
  refreshProtoUserSelect();
  refreshTopbarUserChip();
}

// ============================================================================
// AUTENTICAÇÃO (Atualização Login)
// ----------------------------------------------------------------------------
// Camada de login pensada para ser PLUGÁVEL: hoje roda 100% local (sem e-mail
// nem banco), mas toda a UI conversa com um `AuthProvider`. Na migração para
// Next.js + Supabase, basta trocar o LocalAuthProvider por um SupabaseAuthProvider
// — nenhuma tela muda. (É a "camada 4 — Auth" do plano de ação.)
//
// Segurança (no que é possível sem backend):
//  - Senha NUNCA é guardada em texto puro: gravamos só um hash SHA-256 + salt.
//  - 1º acesso usa a senha padrão e FORÇA a criação de uma senha pessoal.
//  - "Mudar senha" exige um código de verificação (enviado ao e-mail no futuro).
//  - Sessão expira (TTL) e some no logout.
//  Obs.: como o protótipo não tem servidor, o localStorage é legível pelo usuário
//  — o hash aqui é a ESTRUTURA correta para quando a verificação for no backend.
// ============================================================================
const AUTH_KEY        = 'portal_ej_auth_v1';     // credenciais (hash) por e-mail
const SESSION_KEY     = 'portal_ej_session_v1';  // sessão ativa
const DEFAULT_PASSWORD = 'Integre123';           // senha do 1º acesso
const SESSION_TTL_MS  = 1000 * 60 * 60 * 12;     // sessão válida por 12h
const RESET_TTL_MS    = 1000 * 60 * 10;          // código de reset vale 10 min

// Armazena: byEmail[email] = { salt, hash, isDefault }; resetCodes[email] = { code, expires }
let authData = { byEmail: {}, resetCodes: {} };
let pendingFirstLoginEmail = null;  // e-mail aguardando troca de senha no 1º acesso
let resetFlowEmail = null;          // e-mail em fluxo de reset

// E-mail canônico de um membro (minúsculo). Deriva do nome se não houver e-mail.
function memberEmail(m) {
  if (m.email) return m.email.toLowerCase();
  return m.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.') + '@integrejr.com.br';
}

// Gera um salt aleatório (hex). Usa WebCrypto quando disponível.
function randomSalt() {
  if (crypto?.getRandomValues) {
    const a = new Uint8Array(8); crypto.getRandomValues(a);
    return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(16).slice(2, 18);
}

// Hash da senha (SHA-256 de salt::senha). crypto.subtle exige contexto seguro
// (localhost conta como seguro). Há um fallback fraco só para o protótipo não travar.
async function hashPw(password, salt) {
  const text = salt + '::' + password;
  if (crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return 'w' + h.toString(16);
}

function loadAuth() {
  try {
    const s = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (s && typeof s === 'object') { authData.byEmail = s.byEmail || {}; authData.resetCodes = s.resetCodes || {}; }
  } catch (e) { /* ignora */ }
}
function saveAuth() { try { localStorage.setItem(AUTH_KEY, JSON.stringify(authData)); } catch (e) {} }

// ---- Provider local. Mesma interface que um provider de backend terá. ----
const LocalAuthProvider = {
  // Confere e-mail/senha. Retorna { ok, isDefault, error }.
  async verify(email, password) {
    const acc = authData.byEmail[email];
    if (!acc) return { ok: false, error: 'E-mail não cadastrado.' };
    const h = await hashPw(password, acc.salt);
    if (h !== acc.hash) return { ok: false, error: 'Senha incorreta.' };
    return { ok: true, isDefault: !!acc.isDefault };
  },
  // Define uma nova senha pessoal (sai do estado "senha padrão").
  async setPassword(email, newPw) {
    const acc = authData.byEmail[email] || (authData.byEmail[email] = {});
    acc.salt = randomSalt();
    acc.hash = await hashPw(newPw, acc.salt);
    acc.isDefault = false;
    saveAuth();
    return { ok: true };
  },
  // Gera um código de verificação. SEM e-mail real ainda → devolve o código
  // para a UI exibir. FUTURO: enviar por e-mail (Supabase/Resend) e NÃO retornar.
  sendResetCode(email) {
    if (!authData.byEmail[email]) return { ok: false, error: 'E-mail não cadastrado.' };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    authData.resetCodes[email] = { code, expires: Date.now() + RESET_TTL_MS };
    saveAuth();
    return { ok: true, code };
  },
  // Valida o código e troca a senha.
  async confirmReset(email, code, newPw) {
    const rc = authData.resetCodes[email];
    if (!rc) return { ok: false, error: 'Solicite um código primeiro.' };
    if (Date.now() > rc.expires) return { ok: false, error: 'Código expirado. Solicite outro.' };
    if (code !== rc.code) return { ok: false, error: 'Código incorreto.' };
    await this.setPassword(email, newPw);
    delete authData.resetCodes[email];
    saveAuth();
    return { ok: true };
  },
};
// ---- Provider Supabase (login real — Fase 1). Mesma interface do Local. ----
// Cliente criado a partir de config.js. Se a lib ou as chaves não estiverem
// presentes, sbClient fica null e o app cai no LocalAuthProvider (modo offline).
let sbClient = null;
try {
  if (window.supabase && window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
    sbClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
  }
} catch (e) { console.warn('Supabase não inicializado — usando login local:', e); }

const SupabaseAuthProvider = {
  // Login real. `isDefault` = ainda está com a senha padrão (metadado must_change_password).
  async verify(email, password) {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: 'E-mail ou senha incorretos.' };
    return { ok: true, isDefault: data.user?.user_metadata?.must_change_password === true };
  },
  // Define a senha pessoal (usuário já está logado após verify) e tira a flag de padrão.
  async setPassword(email, newPw) {
    const { error } = await sbClient.auth.updateUser({ password: newPw, data: { must_change_password: false } });
    return error ? { ok: false, error: error.message } : { ok: true };
  },
  // Reset por e-mail REAL (código OTP de 6 dígitos). Não retorna o código — ele chega por e-mail.
  async sendResetCode(email) {
    const { error } = await sbClient.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    return error ? { ok: false, error: 'Não foi possível enviar o código.' } : { ok: true };
  },
  // Valida o código recebido por e-mail e troca a senha.
  async confirmReset(email, code, newPw) {
    const { error } = await sbClient.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) return { ok: false, error: 'Código incorreto ou expirado.' };
    const up = await sbClient.auth.updateUser({ password: newPw, data: { must_change_password: false } });
    return up.error ? { ok: false, error: up.error.message } : { ok: true };
  },
};

// Usa o Supabase quando disponível; senão, o provider local (protótipo).
let AuthProvider = sbClient ? SupabaseAuthProvider : LocalAuthProvider;

// Garante 1 credencial (senha padrão) para cada membro que ainda não tem.
// Também normaliza o e-mail dentro do próprio membro (fonte única).
async function ensureCredentials() {
  let changed = false;
  for (const m of members) {
    const email = memberEmail(m);
    if (!m.email) m.email = email;
    if (!authData.byEmail[email]) {
      const salt = randomSalt();
      authData.byEmail[email] = { salt, hash: await hashPw(DEFAULT_PASSWORD, salt), isDefault: true };
      changed = true;
    }
  }
  if (changed) saveAuth();
}

// Cria credencial (senha padrão) para um membro recém-adicionado.
async function seedCredentialFor(email) {
  email = (email || '').toLowerCase();
  if (!email || authData.byEmail[email]) return;
  const salt = randomSalt();
  authData.byEmail[email] = { salt, hash: await hashPw(DEFAULT_PASSWORD, salt), isDefault: true };
  saveAuth();
}

// ---- Sessão ----
function setSession(email) { try { localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() })); } catch (e) {} }
function clearSession()    { localStorage.removeItem(SESSION_KEY); }
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (s && s.email && (Date.now() - s.ts) < SESSION_TTL_MS) return s;
  } catch (e) {}
  return null;
}

// ---- Controle das telas (login overlay × app) ----
function showLogin() {
  const ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'flex';
  const ap = document.getElementById('app-root');     if (ap) ap.style.display = 'none';
}
function hideLogin() {
  const ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'none';
  const ap = document.getElementById('app-root');     if (ap) ap.style.display = '';
}
function authError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg || ''; }

// Alterna entre as 3 views da tela de login e limpa erros.
function showAuthView(name) {
  ['login', 'setpw', 'reset'].forEach(v => {
    const el = document.getElementById('auth-view-' + v);
    if (el) el.style.display = v === name ? 'block' : 'none';
  });
  ['login-error', 'setpw-error', 'reset-error1', 'reset-error2'].forEach(id => authError(id, ''));
  if (name === 'reset') {  // sempre começa o reset no passo 1
    const s1 = document.getElementById('reset-step1'); if (s1) s1.style.display = 'block';
    const s2 = document.getElementById('reset-step2'); if (s2) s2.style.display = 'none';
  }
}

// ---- Ações de login ----
async function doLogin(btn) {
  const email = (document.getElementById('login-email')?.value || '').trim().toLowerCase();
  const pw    =  document.getElementById('login-password')?.value || '';
  if (!email || !pw) { authError('login-error', 'Preencha e-mail e senha.'); return; }
  const restore = setBtnLoading(btn);   // spinner no botão enquanto verifica (rede)
  try {
    const r = await AuthProvider.verify(email, pw);
    if (!r.ok) { authError('login-error', r.error); return; }
    if (r.isDefault) {  // 1º acesso com a senha padrão → força criar senha pessoal
      pendingFirstLoginEmail = email;
      const a = document.getElementById('setpw-new'), b = document.getElementById('setpw-confirm');
      if (a) a.value = ''; if (b) b.value = '';
      showAuthView('setpw');
      return;
    }
    await enterApp(email);
  } finally { restore(); }
}

async function submitFirstPassword() {
  const a = document.getElementById('setpw-new')?.value || '';
  const b = document.getElementById('setpw-confirm')?.value || '';
  if (a.length < 6)            { authError('setpw-error', 'A senha precisa ter ao menos 6 caracteres.'); return; }
  if (a !== b)                 { authError('setpw-error', 'As senhas não coincidem.'); return; }
  if (a === DEFAULT_PASSWORD)  { authError('setpw-error', 'Escolha uma senha diferente da padrão.'); return; }
  await AuthProvider.setPassword(pendingFirstLoginEmail, a);
  const email = pendingFirstLoginEmail; pendingFirstLoginEmail = null;
  enterApp(email);
}

async function authSendCode() {
  const email = (document.getElementById('reset-email')?.value || '').trim().toLowerCase();
  if (!email) { authError('reset-error1', 'Informe o e-mail.'); return; }
  const r = await AuthProvider.sendResetCode(email);
  if (!r.ok) { authError('reset-error1', r.error); return; }
  resetFlowEmail = email;
  const box = document.getElementById('reset-code-box');
  // Local: mostra o código na tela (sem e-mail). Supabase: o código chega por e-mail.
  if (box) box.innerHTML = r.code
    ? `Código gerado para <b>${gesc(email)}</b>.<br>O envio por e-mail ainda não está integrado — use: <b style="font-size:17px;">${r.code}</b>`
    : `Enviamos um código de 6 dígitos para <b>${gesc(email)}</b>.<br>Verifique seu e-mail (inclusive o spam) e digite o código abaixo.`;
  document.getElementById('reset-step1').style.display = 'none';
  document.getElementById('reset-step2').style.display = 'block';
}

async function authConfirmReset() {
  const code = (document.getElementById('reset-code')?.value || '').trim();
  const a = document.getElementById('reset-new')?.value || '';
  const b = document.getElementById('reset-confirm')?.value || '';
  if (!code)        { authError('reset-error2', 'Informe o código.'); return; }
  if (a.length < 6) { authError('reset-error2', 'A senha precisa ter ao menos 6 caracteres.'); return; }
  if (a !== b)      { authError('reset-error2', 'As senhas não coincidem.'); return; }
  const r = await AuthProvider.confirmReset(resetFlowEmail, code, a);
  if (!r.ok) { authError('reset-error2', r.error); return; }
  resetFlowEmail = null;
  showAuthView('login');
  const ef = document.getElementById('login-email'); if (ef) ef.value = '';
  showToast('Senha redefinida. Faça login com a nova senha.');
}

// Entra de fato no app como o membro do e-mail informado.
// ============== DADOS DO BANCO (Fase 2 — leitura) ==============
// Carrega os membros da tabela `profiles` para o array `members`, mapeando os
// campos do banco para o formato que o app já usa. Cada membro passa a carregar
// seu `id` (UUID) — a ponte usada nas gravações dos próximos passos. O padrinho
// (que no app é um NOME) é resolvido a partir do padrinho_id.
async function loadMembersFromDB() {
  if (!sbClient) return false;
  const { data, error } = await sbClient.from('profiles')
    .select('id, name, email, role, sector, access, status, course, entry_date, caps_count, padrinho_id, points');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar membros do banco:', error?.message); return false; }
  const nameById = Object.fromEntries(data.map(r => [r.id, r.name]));
  const mapped = data.map(r => {
    const m = {
      id: r.id, name: r.name, email: r.email, role: r.role, sector: r.sector,
      access: r.access, status: r.status, course: r.course,
      entryDate: r.entry_date, capsCount: r.caps_count, points: r.points,
    };
    if (r.role === 'Trainee') m.padrinho = nameById[r.padrinho_id] || '';
    return m;
  });
  members.length = 0; mapped.forEach(m => members.push(m));  // muta no lugar (preserva referências)
  return true;
}

// Carrega projetos + membros do projeto + tarefas do banco para o array `projects`.
// Mapeia os campos do banco para o formato que o app já usa. Mantém project.id =
// slug (identidade legível usada no app) e adiciona project.dbId/task.dbId (UUID)
// para as gravações. Requer membros já hidratados (para resolver nomes).
async function loadProjectsFromDB() {
  if (!sbClient) return false;
  const isoToBR = s => (s ? s.split('-').reverse().join('/') : '');
  const nameById = Object.fromEntries(members.map(m => [m.id, m.name]));
  const { data, error } = await sbClient.from('projects').select(
    'id, slug, name, sector, status, status_class, leader_id, start_date, end_date, description, concluded,' +
    ' project_members(profile_id), tasks(id, name, description, resp_id, start_date, due_date, done, position)'
  );
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar projetos do banco:', error?.message); return false; }
  const mapped = data.map(r => ({
    id: r.slug, dbId: r.id, name: r.name, sector: r.sector,
    status: r.status, statusClass: r.status_class || '',
    leader: nameById[r.leader_id] || '',
    start: isoToBR(r.start_date), end: isoToBR(r.end_date),
    desc: r.description || '', concluded: !!r.concluded,
    memberNames: (r.project_members || []).map(pm => nameById[pm.profile_id]).filter(Boolean),
    tasks: (r.tasks || []).slice().sort((a, b) => (a.position || 0) - (b.position || 0)).map(t => ({
      dbId: t.id, name: t.name, desc: t.description || '', resp: nameById[t.resp_id] || '—',
      startISO: t.start_date || '', due: isoToBR(t.due_date), done: !!t.done,
    })),
  }));
  projects.length = 0; mapped.forEach(p => projects.push(p));  // muta no lugar
  return true;
}

// ---- Gravação de membros no banco (Fase 2 — escrita) ----
// Os pontos de edição mutam o array local (UI instantânea) E gravam no banco
// (write-through). Erros aparecem num toast. O padrinho (nome) vira padrinho_id.
function memberIdByName(name) { const m = members.find(x => x.name === name); return m ? m.id : null; }

async function dbUpdateMember(member, patch) {
  if (!sbClient || !member?.id) return;
  const row = {};
  if ('role'    in patch) row.role   = patch.role;
  if ('sector'  in patch) row.sector = patch.sector;
  if ('access'  in patch) row.access = patch.access;
  if ('status'  in patch) row.status = patch.status;
  if ('points'  in patch) row.points = patch.points;
  if ('padrinho' in patch) row.padrinho_id = patch.padrinho ? memberIdByName(patch.padrinho) : null;
  const { error } = await sbClient.from('profiles').update(row).eq('id', member.id);
  if (error) { showToast('Erro ao salvar no banco: ' + error.message); console.warn('dbUpdateMember', error); }
}

async function dbCreateMember(member) {
  if (!sbClient) return;
  const { data, error } = await sbClient.from('profiles').insert({
    name: member.name, email: member.email, role: member.role, sector: member.sector,
    access: member.access, status: member.status, course: member.course,
    entry_date: member.entryDate, caps_count: member.capsCount ?? 0, points: member.points ?? 0,
    padrinho_id: member.padrinho ? memberIdByName(member.padrinho) : null,
  }).select('id').single();
  if (error) { showToast('Erro ao criar no banco: ' + error.message); console.warn('dbCreateMember', error); return; }
  member.id = data.id;   // passa a carregar o id real do banco
}

async function dbDeleteMember(member) {
  if (!sbClient || !member?.id) return;
  const { error } = await sbClient.from('profiles').delete().eq('id', member.id);
  if (error) { showToast('Erro ao excluir no banco: ' + error.message); console.warn('dbDeleteMember', error); }
}

// ---- Gravação de projetos/tarefas no banco (Fase 2 — escrita) ----
// Usam project.dbId / task.dbId (UUID) e resolvem nomes → ids. Datas dd/mm/aaaa
// viram yyyy-mm-dd (null quando vazio). Write-through: mutam o local e gravam.
const toDate = br => (br && br !== 'Sem prazo' ? brToISO(br) : null);

async function dbCreateProject(p) {
  if (!sbClient) return;
  const { data, error } = await sbClient.from('projects').insert({
    slug: p.id, name: p.name, sector: p.sector, status: p.status, status_class: p.statusClass || '',
    leader_id: memberIdByName(p.leader), start_date: toDate(p.start), end_date: toDate(p.end),
    description: p.desc || '', concluded: !!p.concluded,
  }).select('id').single();
  if (error) { showToast('Erro ao criar projeto no banco: ' + error.message); console.warn('dbCreateProject', error); return; }
  p.dbId = data.id;
  const rows = (p.memberNames || []).map(n => ({ project_id: p.dbId, profile_id: memberIdByName(n) })).filter(r => r.profile_id);
  if (rows.length) { const { error: e2 } = await sbClient.from('project_members').insert(rows); if (e2) console.warn('project_members init', e2); }
}

async function dbUpdateProject(p, patch) {
  if (!sbClient || !p?.dbId) return;
  const row = {};
  if ('name'         in patch) row.name = patch.name;
  if ('sector'       in patch) row.sector = patch.sector;
  if ('status'       in patch) row.status = patch.status;
  if ('status_class' in patch) row.status_class = patch.status_class;
  if ('description'  in patch) row.description = patch.description;
  if ('concluded'    in patch) row.concluded = patch.concluded;
  if ('leader'       in patch) row.leader_id = memberIdByName(patch.leader);
  if ('start'        in patch) row.start_date = toDate(patch.start);
  if ('end'          in patch) row.end_date = toDate(patch.end);
  const { error } = await sbClient.from('projects').update(row).eq('id', p.dbId);
  if (error) { showToast('Erro ao salvar projeto: ' + error.message); console.warn('dbUpdateProject', error); }
}

async function dbAddProjectMember(p, name) {
  if (!sbClient || !p?.dbId) return;
  const profile_id = memberIdByName(name); if (!profile_id) return;
  const { error } = await sbClient.from('project_members').insert({ project_id: p.dbId, profile_id });
  if (error) { showToast('Erro ao adicionar membro: ' + error.message); console.warn('dbAddProjectMember', error); }
}

async function dbRemoveProjectMember(p, name) {
  if (!sbClient || !p?.dbId) return;
  const profile_id = memberIdByName(name); if (!profile_id) return;
  const { error } = await sbClient.from('project_members').delete().eq('project_id', p.dbId).eq('profile_id', profile_id);
  if (error) { showToast('Erro ao remover membro: ' + error.message); console.warn('dbRemoveProjectMember', error); }
}

async function dbCreateTask(p, task) {
  if (!sbClient || !p?.dbId) return;
  const { data, error } = await sbClient.from('tasks').insert({
    project_id: p.dbId, name: task.name, description: task.desc || '',
    resp_id: memberIdByName(task.resp), start_date: task.startISO || null, due_date: toDate(task.due),
    done: !!task.done, position: (p.tasks ? Math.max(0, p.tasks.length - 1) : 0),
  }).select('id').single();
  if (error) { showToast('Erro ao criar tarefa: ' + error.message); console.warn('dbCreateTask', error); return; }
  task.dbId = data.id;
}

async function dbUpdateTask(task, patch) {
  if (!sbClient || !task?.dbId) return;
  const row = {};
  if ('name'     in patch) row.name = patch.name;
  if ('desc'     in patch) row.description = patch.desc;
  if ('resp'     in patch) row.resp_id = memberIdByName(patch.resp);
  if ('startISO' in patch) row.start_date = patch.startISO || null;
  if ('due'      in patch) row.due_date = toDate(patch.due);
  if ('done'     in patch) row.done = patch.done;
  const { error } = await sbClient.from('tasks').update(row).eq('id', task.dbId);
  if (error) { showToast('Erro ao salvar tarefa: ' + error.message); console.warn('dbUpdateTask', error); }
}

async function dbDeleteTask(task) {
  if (!sbClient || !task?.dbId) return;
  const { error } = await sbClient.from('tasks').delete().eq('id', task.dbId);
  if (error) { showToast('Erro ao excluir tarefa: ' + error.message); console.warn('dbDeleteTask', error); }
}

// ---- Avisos (Fase 2) ----
function fmtAvisoTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
async function loadAvisosFromDB() {
  if (!sbClient) return false;
  const nameById = Object.fromEntries(members.map(m => [m.id, m.name]));
  const { data, error } = await sbClient.from('avisos')
    .select('id, title, body, type, color, author_id, author_label, expiry, created_at')
    .order('created_at', { ascending: false });
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar avisos do banco:', error?.message); return false; }
  const mapped = data.map(r => ({
    id: r.id, title: r.title, body: r.body, type: r.type, color: r.color || '',
    author: r.author_label || nameById[r.author_id] || '—',
    time: fmtAvisoTime(r.created_at), expiry: r.expiry || null,
  }));
  avisos.length = 0; mapped.forEach(a => avisos.push(a));
  return true;
}
async function dbCreateAviso(a) {
  if (!sbClient) return null;
  const { data, error } = await sbClient.from('avisos').insert({
    title: a.title, body: a.body, type: a.type, color: a.color || '',
    author_id: memberIdByName(currentUser.name), author_label: a.author, expiry: a.expiry || null,
  }).select('id, created_at').single();
  if (error) { showToast('Erro ao enviar aviso: ' + error.message); console.warn('dbCreateAviso', error); return null; }
  return data;
}
async function dbDeleteAviso(id) {
  if (!sbClient || typeof id !== 'string') return;   // id numérico = fallback offline
  const { error } = await sbClient.from('avisos').delete().eq('id', id);
  if (error) { showToast('Erro ao remover aviso: ' + error.message); console.warn('dbDeleteAviso', error); }
}

// ---- Metas (Fase 2): 3 cards (metas) + meta anual (annual_goals) + 12 meses (monthly_revenue) ----
function metasYear() { return appToday().getFullYear(); }

async function loadMetasFromDB() {
  if (!sbClient) return false;
  const year = metasYear();
  const [mRes, aRes, rRes] = await Promise.all([
    sbClient.from('metas').select('key,label,prefixo,sufixo,meta,atual'),
    sbClient.from('annual_goals').select('goal_amount').eq('year', year).maybeSingle(),
    sbClient.from('monthly_revenue').select('month,realizado').eq('year', year).order('month'),
  ]);
  // label/prefixo/sufixo são definidos no código (apresentação); do banco vêm só
  // os números editáveis (meta/atual).
  if (Array.isArray(mRes.data)) mRes.data.forEach(r => {
    if (metas[r.key]) Object.assign(metas[r.key], {
      meta: Number(r.meta), atual: Number(r.atual),
    });
  });
  if (aRes.data?.goal_amount != null) metasAnuais.anoMeta = Number(aRes.data.goal_amount);
  if (Array.isArray(rRes.data) && rRes.data.length) {
    const arr = new Array(12).fill(0);
    rRes.data.forEach(r => { if (r.month >= 1 && r.month <= 12) arr[r.month - 1] = Number(r.realizado); });
    metasAnuais.mensal = arr;
  }
  syncFaturamentoFromAnual();   // recomputa o espelho do faturamento
  return true;
}
async function dbUpdateMeta(key, patch) {
  if (!sbClient) return;
  const row = {};
  if ('atual' in patch) row.atual = patch.atual;
  if ('meta'  in patch) row.meta  = patch.meta;
  const { error } = await sbClient.from('metas').update(row).eq('key', key);
  if (error) { showToast('Erro ao salvar meta: ' + error.message); console.warn('dbUpdateMeta', error); }
}
async function dbSaveMonthRevenue(year, month, realizado) {
  if (!sbClient) return;
  const { error } = await sbClient.from('monthly_revenue').upsert({ year, month, realizado }, { onConflict: 'year,month' });
  if (error) { showToast('Erro ao salvar faturamento: ' + error.message); console.warn('dbSaveMonthRevenue', error); }
}
async function dbSaveAnnual(year, anoMeta, mensal) {
  if (!sbClient) return;
  const { error: e1 } = await sbClient.from('annual_goals').upsert({ year, goal_amount: anoMeta }, { onConflict: 'year' });
  if (e1) { showToast('Erro ao salvar meta anual: ' + e1.message); console.warn('dbSaveAnnual', e1); }
  const rows = mensal.map((realizado, i) => ({ year, month: i + 1, realizado }));
  const { error: e2 } = await sbClient.from('monthly_revenue').upsert(rows, { onConflict: 'year,month' });
  if (e2) { showToast('Erro ao salvar faturamento mensal: ' + e2.message); console.warn('dbSaveAnnual months', e2); }
}

// ---- Calendário (Fase 2): event_date é a data real (com ano) ----
async function loadCalendarFromDB() {
  if (!sbClient) return false;
  const { data, error } = await sbClient.from('calendar_events')
    .select('id, event_date, title, event_time, location, audience, visibility, category, color')
    .order('event_date');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar calendário do banco:', error?.message); return false; }
  const mapped = data.map(r => ({
    id: r.id, iso: r.event_date, ...eventDateParts(r.event_date),
    title: r.title, meta: [r.event_time, r.location, r.audience].filter(Boolean).join(' · '),
    visibility: r.visibility, cls: r.color || '', category: r.category,
  }));
  calendarEvents.length = 0; mapped.forEach(e => calendarEvents.push(e));
  return true;
}
async function dbCreateEvent(ev, parts) {
  if (!sbClient) return null;
  const { data, error } = await sbClient.from('calendar_events').insert({
    event_date: ev.iso, title: ev.title, event_time: parts.horaTxt || '',
    location: parts.local || '', audience: parts.audience || '',
    visibility: ev.visibility, category: ev.category, color: ev.cls || '',
    created_by: memberIdByName(currentUser.name),
  }).select('id').single();
  if (error) { showToast('Erro ao criar evento: ' + error.message); console.warn('dbCreateEvent', error); return null; }
  return data;
}

// ---- Drive (Fase 2): tópicos = atalhos (nome/ícone/link) ----
async function loadDriveFromDB() {
  if (!sbClient) return false;
  const { data, error } = await sbClient.from('drive_topics').select('id, name, icon, link, position').order('position');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar drive:', error?.message); return false; }
  driveTopics.length = 0;
  data.forEach(r => driveTopics.push({ id: r.id, name: r.name, icon: r.icon || '📁', link: r.link || '', position: r.position }));
  return true;
}
async function dbCreateDriveTopic(t) {
  if (!sbClient) return;
  const { data, error } = await sbClient.from('drive_topics').insert({ name: t.name, icon: t.icon || '📁', link: t.link || '', position: t.position ?? 0 }).select('id').single();
  if (error) { showToast('Erro ao criar tópico: ' + error.message); console.warn('dbCreateDriveTopic', error); return; }
  t.id = data.id;
}
async function dbUpdateDriveTopic(t, patch) {
  if (!sbClient || typeof t.id !== 'string') return;
  const row = {};
  if ('name' in patch) row.name = patch.name;
  if ('icon' in patch) row.icon = patch.icon;
  if ('link' in patch) row.link = patch.link;
  const { error } = await sbClient.from('drive_topics').update(row).eq('id', t.id);
  if (error) { showToast('Erro ao salvar tópico: ' + error.message); console.warn('dbUpdateDriveTopic', error); }
}
async function dbDeleteDriveTopic(id) {
  if (!sbClient || typeof id !== 'string') return;
  const { error } = await sbClient.from('drive_topics').delete().eq('id', id);
  if (error) { showToast('Erro ao remover tópico: ' + error.message); console.warn('dbDeleteDriveTopic', error); }
}

// ---- Legado (Fase 2): categorias + registros ----
async function loadLegadoFromDB() {
  if (!sbClient) return false;
  const [cRes, eRes] = await Promise.all([
    sbClient.from('legacy_categories').select('key, label, position').order('position'),
    sbClient.from('legacy_entries').select('category_key, autor, texto, created_at').order('created_at', { ascending: false }),
  ]);
  if (!Array.isArray(cRes.data)) { console.warn('Falha ao carregar legado:', cRes.error?.message); return false; }
  Object.keys(legadoData).forEach(k => delete legadoData[k]);
  cRes.data.forEach(c => { legadoData[c.key] = { label: c.label, key: c.key, registros: [] }; });
  (eRes.data || []).forEach(e => { if (legadoData[e.category_key]) legadoData[e.category_key].registros.push({ autor: e.autor, texto: e.texto }); });
  return true;
}
async function dbCreateLegadoEntry(categoryKey, autor, texto) {
  if (!sbClient) return;
  const { error } = await sbClient.from('legacy_entries').insert({ category_key: categoryKey, autor, texto });
  if (error) { showToast('Erro ao salvar registro: ' + error.message); console.warn('dbCreateLegadoEntry', error); }
}

// ---- RNN / Valores (institutional_docs) ----
async function loadInstitutionalFromDB() {
  if (!sbClient) return false;
  const { data, error } = await sbClient.from('institutional_docs').select('kind, titulo, body, position').order('position');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar RNN/valores:', error?.message); return false; }
  rnnsData.length = 0; valoresData.length = 0;
  data.forEach(r => { (r.kind === 'valor' ? valoresData : rnnsData).push({ titulo: r.titulo, body: r.body }); });
  return true;
}
async function dbCreateInstitutional(kind, titulo, body, position) {
  if (!sbClient) return;
  const { error } = await sbClient.from('institutional_docs').insert({ kind, titulo, body, position });
  if (error) { showToast('Erro ao salvar: ' + error.message); console.warn('dbCreateInstitutional', error); }
}

// ---- Capacitações (Fase 2): catálogo (tópicos→trilhas→caps) + progresso POR MEMBRO ----
// capTree[key] ganha _trackIds (uuid de cada trilha) e cada cap ganha id (uuid).
// cap.done reflete o progresso do USUÁRIO LOGADO (tabela cap_progress).
async function loadCapsFromDB() {
  if (!sbClient) return false;
  const myId = memberIdByName(currentUser.name);
  const [tRes, pRes] = await Promise.all([
    sbClient.from('cap_topics').select('key,label,emoji,position, cap_tracks(id,position, caps(id,name,link,position))').order('position'),
    myId ? sbClient.from('cap_progress').select('cap_id,done').eq('profile_id', myId) : Promise.resolve({ data: [] }),
  ]);
  if (!Array.isArray(tRes.data)) { console.warn('Falha ao carregar capacitações:', tRes.error?.message); return false; }
  const doneMap = {}; (pRes.data || []).forEach(p => { doneMap[p.cap_id] = !!p.done; });
  Object.keys(capTree).forEach(k => delete capTree[k]);
  tRes.data.forEach(topic => {
    const tracksSorted = (topic.cap_tracks || []).slice().sort((a,b)=>(a.position||0)-(b.position||0));
    const tracks = [], trackIds = [];
    tracksSorted.forEach(tr => {
      const caps = (tr.caps || []).slice().sort((a,b)=>(a.position||0)-(b.position||0))
        .map(c => ({ id:c.id, name:c.name, link:c.link||'', done: !!doneMap[c.id] }));
      tracks.push(caps); trackIds.push(tr.id);
    });
    capTree[topic.key] = { label: topic.label, emoji: '', tracks, _trackIds: trackIds };
  });
  // Sincroniza a lista de capacitações feitas do PERFIL com o progresso (mesma fonte).
  const feitas = [];
  Object.values(capTree).forEach(col => col.tracks.forEach(tr => tr.forEach(c => { if (c.done) feitas.push(c.name); })));
  if (typeof currentUser === 'object' && currentUser) currentUser.caps = feitas;
  return true;
}
async function dbUpdateCap(cap, patch) {
  if (!sbClient || !cap?.id) return;
  const row = {}; if ('name' in patch) row.name = patch.name; if ('link' in patch) row.link = patch.link;
  const { error } = await sbClient.from('caps').update(row).eq('id', cap.id);
  if (error) { showToast('Erro ao salvar capacitação: ' + error.message); console.warn('dbUpdateCap', error); }
}
async function dbDeleteCap(id) {
  if (!sbClient || typeof id !== 'string') return;
  const { error } = await sbClient.from('caps').delete().eq('id', id);
  if (error) { showToast('Erro ao remover capacitação: ' + error.message); console.warn('dbDeleteCap', error); }
}
async function dbCreateCap(trackId, cap, position) {
  if (!sbClient || !trackId) return;
  const { data, error } = await sbClient.from('caps').insert({ track_id: trackId, name: cap.name, link: cap.link || '', position }).select('id').single();
  if (error) { showToast('Erro ao criar capacitação: ' + error.message); console.warn('dbCreateCap', error); return; }
  cap.id = data.id;
}
async function dbCreateTopic(key, label, emoji) {   // cria o tópico + 1 trilha; retorna o id da trilha
  if (!sbClient) return null;
  const { error: e1 } = await sbClient.from('cap_topics').insert({ key, label, emoji, position: Object.keys(capTree).length });
  if (e1) { showToast('Erro ao criar tópico: ' + e1.message); console.warn('dbCreateTopic', e1); return null; }
  const { data, error: e2 } = await sbClient.from('cap_tracks').insert({ topic_key: key, position: 0 }).select('id').single();
  if (e2) { console.warn('dbCreateTopic track', e2); return null; }
  return data.id;
}
async function dbDeleteTopic(key) {
  if (!sbClient) return;
  const { error } = await sbClient.from('cap_topics').delete().eq('key', key);  // FK cascata remove trilhas e caps
  if (error) { showToast('Erro ao remover tópico: ' + error.message); console.warn('dbDeleteTopic', error); }
}
async function dbSetCapProgress(capId, done) {
  if (!sbClient || typeof capId !== 'string') return;
  const myId = memberIdByName(currentUser.name); if (!myId) return;
  const { error } = await sbClient.from('cap_progress').upsert(
    { profile_id: myId, cap_id: capId, done, completed_at: done ? new Date().toISOString() : null },
    { onConflict: 'profile_id,cap_id' });
  if (error) { showToast('Erro ao salvar progresso: ' + error.message); console.warn('dbSetCapProgress', error); }
}

// ---- Atividades (Fase 2): id local (p/ os onclick) + dbId (uuid p/ gravar) ----
async function loadActivitiesFromDB() {
  if (!sbClient) return false;
  const { data, error } = await sbClient.from('activities').select('id, name, description, points, area, mandatory, link').order('mandatory').order('name');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar atividades:', error?.message); return false; }
  activities.length = 0;
  data.forEach(r => activities.push({ id: activityIdCounter++, dbId: r.id, name: r.name, points: r.points, area: r.area, desc: r.description || 'Sem descrição.', mandatory: !!r.mandatory, link: r.link || '' }));
  return true;
}
async function dbCreateActivity(a) {
  if (!sbClient) return;
  const { data, error } = await sbClient.from('activities').insert({ name: a.name, description: a.desc || '', points: a.points || 0, area: a.area, mandatory: !!a.mandatory, link: a.link || '' }).select('id').single();
  if (error) { showToast('Erro ao criar atividade: ' + error.message); console.warn('dbCreateActivity', error); return; }
  a.dbId = data.id;
}
async function dbUpdateActivity(a, patch) {
  if (!sbClient || !a?.dbId) return;
  const row = {};
  if ('link'  in patch) row.link = patch.link;
  if ('name'  in patch) row.name = patch.name;
  if ('points' in patch) row.points = patch.points;
  if ('desc'  in patch) row.description = patch.desc;
  if ('area'  in patch) row.area = patch.area;
  const { error } = await sbClient.from('activities').update(row).eq('id', a.dbId);
  if (error) { showToast('Erro ao salvar atividade: ' + error.message); console.warn('dbUpdateActivity', error); }
}

// ---- Validações (Fase 2): pedidos de aprovação trainee→padrinho ----
async function loadValidationsFromDB() {
  if (!sbClient) return false;
  const nameById = Object.fromEntries(members.map(m => [m.id, m.name]));
  const { data, error } = await sbClient.from('activity_validations')
    .select('id, trainee_id, padrinho_id, activity_name, points, status, sent_at')
    .eq('status', 'pendente').order('sent_at');
  if (error || !Array.isArray(data)) { console.warn('Falha ao carregar validações:', error?.message); return false; }
  pendingValidations.length = 0;
  data.forEach(r => pendingValidations.push({
    dbId: r.id, trainee: nameById[r.trainee_id] || '', padrinho: nameById[r.padrinho_id] || '',
    activity: r.activity_name, points: r.points,
    sent: r.sent_at ? r.sent_at.split('T')[0].split('-').reverse().join('/') : '',
  }));
  return true;
}
async function dbCreateValidation(v) {
  if (!sbClient) return;
  const { data, error } = await sbClient.from('activity_validations').insert({
    trainee_id: memberIdByName(v.trainee), padrinho_id: memberIdByName(v.padrinho),
    activity_id: activities.find(a => a.name === v.activity)?.dbId || null,
    activity_name: v.activity, points: v.points, status: 'pendente',
  }).select('id').single();
  if (error) { showToast('Erro ao enviar pedido: ' + error.message); console.warn('dbCreateValidation', error); return; }
  v.dbId = data.id;
}
async function dbResolveValidation(v, status) {   // 'aprovada' | 'rejeitada'
  if (!sbClient || !v?.dbId) return;
  const { error } = await sbClient.from('activity_validations').update({ status, resolved_at: new Date().toISOString() }).eq('id', v.dbId);
  if (error) { showToast('Erro ao atualizar validação: ' + error.message); console.warn('dbResolveValidation', error); }
}

// ---- Ponto (Fase 2): por MEMBRO e por SEMANA (segunda-feira) ----
function pontoMondayISO() {
  const seg = appToday(); seg.setDate(seg.getDate() - ((seg.getDay() + 6) % 7));   // recua até segunda
  return `${seg.getFullYear()}-${String(seg.getMonth()+1).padStart(2,'0')}-${String(seg.getDate()).padStart(2,'0')}`;
}
async function loadPontoFromDB() {
  if (!sbClient) return false;
  const myId = memberIdByName(currentUser.name); if (!myId) return false;
  const wk = pontoWeekKey();
  const { data, error } = await sbClient.from('ponto_weekly')
    .select('worked, meetings, engajamento, crono_ms').eq('profile_id', myId).eq('week_start', pontoMondayISO()).maybeSingle();
  if (error) { console.warn('Falha ao carregar ponto:', error.message); return false; }
  if (data) {
    const hasHoras = (data.worked || 0) > 0 || (data.meetings || 0) > 0;
    pontoData.semana      = { worked: data.worked || 0, meetings: data.meetings || 0, weekKey: hasHoras ? wk : null };
    pontoData.engajamento = { value: data.engajamento ?? null, weekKey: data.engajamento != null ? wk : null };
    pontoData.crono       = { acumuladoMs: data.crono_ms || 0, weekKey: wk };
  } else {
    pontoData.semana      = { worked: 0, meetings: 0, weekKey: null };
    pontoData.engajamento = { value: null, weekKey: null };
    pontoData.crono       = { acumuladoMs: 0, weekKey: wk };
  }
  return true;
}
async function dbSavePonto(patch) {
  if (!sbClient) return;
  const myId = memberIdByName(currentUser.name); if (!myId) return;
  const { error } = await sbClient.from('ponto_weekly')
    .upsert({ profile_id: myId, week_start: pontoMondayISO(), ...patch }, { onConflict: 'profile_id,week_start' });
  if (error) { showToast('Erro ao salvar ponto: ' + error.message); console.warn('dbSavePonto', error); }
}

async function enterApp(email) {
  if (sbClient) await loadMembersFromDB();   // Fase 2: membros vêm do banco
  const m = members.find(x => memberEmail(x) === email);
  if (!m) { authError('login-error', 'Membro não encontrado.'); showLogin(); return; }
  // Desligado/Inativo não entra no app (é assim que "revogamos" o acesso sem admin).
  if (m.status === 'Inativo') {
    authError('login-error', 'Seu acesso está desativado. Procure a coordenação.');
    if (sbClient) { try { await sbClient.auth.signOut(); } catch (e) {} }
    showLogin(); return;
  }
  m.self = true;                              // marca o usuário logado (não edita o próprio cargo)
  setSession(email);
  setCurrentUserFromMember(m);                // define currentUser ANTES das cargas (loadCapsFromDB lê o progresso dele)
  if (sbClient) {  // Fase 2: domínio vem do banco
    // As cargas são independentes (cada uma popula seu próprio array a partir de
    // `members`, já carregado acima), então rodam EM PARALELO — bem mais rápido
    // que os ~11 awaits sequenciais de antes. O overlay cobre a espera.
    showAppLoading('Carregando seus dados…');
    try {
      await Promise.all([
        loadProjectsFromDB(), loadAvisosFromDB(), loadMetasFromDB(),
        loadCalendarFromDB(), loadDriveFromDB(), loadLegadoFromDB(), loadInstitutionalFromDB(),
        loadCapsFromDB(), loadActivitiesFromDB(), loadValidationsFromDB(), loadPontoFromDB(),
      ]);
    } finally { hideAppLoading(); }
  }
  hideLogin();
  const pwf = document.getElementById('login-password'); if (pwf) pwf.value = '';  // não deixa a senha no DOM
  protoInit();                  // atualiza chip do topbar + select do Modo Protótipo
  applySidebarPermissions();    // mostra só as páginas permitidas para o cargo
  goTo(DEFAULT_PAGE);
}

async function logout() {
  if (sbClient) { try { await sbClient.auth.signOut(); } catch (e) {} }
  clearSession();
  ['login-email', 'login-password'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  showAuthView('login');
  showLogin();
}

// Decide, no boot, se mostra o login ou entra direto (sessão válida).
// A splash de abertura fica no ar até esta decisão terminar (await enterApp),
// então só revela o dashboard OU o login já no estado final — sem piscar a tela.
async function authBoot() {
  try {
    if (sbClient) {
      // Sessão gerenciada pelo Supabase (persistida automaticamente).
      // enterApp hidrata os membros do banco e valida o e-mail por lá.
      const { data } = await sbClient.auth.getSession();
      const email = data?.session?.user?.email?.toLowerCase();
      if (email) await enterApp(email);
      else showLogin();
    } else {
      // Fallback local (protótipo offline).
      const s = getSession();
      if (s && members.some(m => memberEmail(m) === s.email)) await enterApp(s.email);
      else { clearSession(); showLogin(); }
      ensureCredentials();   // garante senha padrão p/ todo mundo (em background)
    }
  } catch (e) {
    console.warn('authBoot falhou — mostrando login:', e);
    showLogin();
  } finally {
    hideBootSplash();        // só agora a splash some, revelando o estado final
  }
}

// ============== PERSISTÊNCIA (localStorage) — Atualização 8 ==============
// Salva os dados de domínio (projetos, membros, metas, capacitações, etc.)
// num único registro JSON, para sobreviverem ao recarregar a página.
// Antes só foto/logo/tema/flags persistiam.
const STATE_KEY = 'portal_ej_state_v1';

// Reúne tudo que deve persistir num objeto serializável (snapshot).
// NÃO inclui estado de UI efêmero (activeProjectId, filtros, abas, etc.).
function collectState() {
  return {
    projects, members, pendingValidations,
    activities, activityIdCounter,
    avisos, avisoIdCounter,
    calendarEvents, legadoData, rnnsData, valoresData,
    metas, metasAnuais, capTree,
    driveTopics, driveTopicIdCounter,
    ponto: pontoData,
  };
}

// Grava o estado atual. Chamado pelo autosave (intervalo + antes de sair).
function saveState() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(collectState())); }
  catch (e) { /* localStorage cheio/indisponível — ignora no protótipo */ }
}

// Lê o estado salvo e o aplica SOBRE os dados padrão, mutando in-place.
// Mutar in-place (e não reatribuir) é necessário porque members/trainees são
// const e porque várias funções capturaram a referência original do array/obj.
function loadState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STATE_KEY)); }
  catch (e) { saved = null; }
  if (!saved || typeof saved !== 'object') return;

  // Esvazia o array e repõe os itens salvos (preserva a referência).
  const fillArr = (arr, data) => { if (Array.isArray(data)) { arr.length = 0; data.forEach(x => arr.push(x)); } };
  // Apaga as chaves e copia as salvas (preserva a referência do objeto).
  const fillObj = (obj, data) => { if (data && typeof data === 'object') { Object.keys(obj).forEach(k => delete obj[k]); Object.assign(obj, data); } };

  fillArr(projects, saved.projects);
  fillArr(members, saved.members);
  fillArr(pendingValidations, saved.pendingValidations);

  // Migração de estado antigo: pontos/padrinho dos trainees moravam num array `trainees`
  // separado. Se vier no formato velho, mescla esses campos no membro correspondente.
  if (Array.isArray(saved.trainees)) {
    saved.trainees.forEach(t => {
      const m = members.find(x => x.name === t.name);
      if (m) {
        if (m.points == null && typeof t.points === 'number') m.points = t.points;
        if (!m.padrinho && t.padrinho) m.padrinho = t.padrinho;
      }
    });
  }
  fillArr(activities, saved.activities);
  fillArr(avisos, saved.avisos);
  fillArr(calendarEvents, saved.calendarEvents);
  fillArr(rnnsData, saved.rnnsData);
  fillArr(valoresData, saved.valoresData);

  fillObj(legadoData, saved.legadoData);
  // metas: rótulo/formato (label/prefixo/sufixo) vêm SEMPRE do código; do estado
  // salvo restauramos só os números editáveis (meta/atual). Senão um snapshot
  // antigo reverteria nome/unidade dos cards.
  if (saved.metas && typeof saved.metas === 'object') {
    Object.keys(metas).forEach(k => {
      const s = saved.metas[k];
      if (s && typeof s === 'object') {
        if (s.meta  != null) metas[k].meta  = Number(s.meta);
        if (s.atual != null) metas[k].atual = Number(s.atual);
      }
    });
  }
  fillObj(metasAnuais, saved.metasAnuais);
  fillObj(capTree, saved.capTree);
  fillArr(driveTopics, saved.driveTopics);

  if (typeof saved.activityIdCounter === 'number') activityIdCounter = saved.activityIdCounter;
  if (typeof saved.avisoIdCounter === 'number') avisoIdCounter = saved.avisoIdCounter;
  if (typeof saved.driveTopicIdCounter === 'number') driveTopicIdCounter = saved.driveTopicIdCounter;

  if (saved.ponto && typeof saved.ponto === 'object') {
    if (saved.ponto.semana)      pontoData.semana      = saved.ponto.semana;
    if (saved.ponto.engajamento) pontoData.engajamento = saved.ponto.engajamento;
    if (saved.ponto.crono)       pontoData.crono       = saved.ponto.crono;
  }

  // Atualização 9.1: estados salvos antigos (criados antes das atividades fixas)
  // não as contêm. Garante 1 atividade fixa por setor, sem pontuação.
  ensureMandatoryActivities();
}

// Garante as 4 atividades FIXAS (uma por setor), sem pontuação. Re-injeta o que
// faltar e normaliza pontos antigos. Idempotente.
function ensureMandatoryActivities() {
  const areas = ['Projetos', 'Comercial', 'ADM/FIN', 'Diretoria'];
  let nextId = activities.reduce((mx, a) => Math.max(mx, a.id || 0), 0) + 1;
  areas.forEach(area => {
    const a = activities.find(x => x.mandatory && x.area === area);
    if (!a) {
      activities.push({ id: nextId++, name: 'Atividade Obrigatória', points: 0, area, mandatory: true, link: '', desc: `Atividade fixa do setor ${area}.` });
    } else {
      a.points = 0; // sem pontuação (normaliza estados antigos com 100 pts)
    }
  });
  if (nextId > activityIdCounter) activityIdCounter = nextId;
}

// Apaga os dados salvos e recarrega com os dados de exemplo originais.
// Exposto na página Configurações ("Restaurar dados de exemplo") e no console.
function resetPortalData() {
  if (!confirm('Isso apaga todas as alterações e volta aos dados de exemplo. Continuar?')) return;
  localStorage.removeItem(STATE_KEY);
  location.reload();
}

// ============== INÍCIO ==============
loadState();                                   // restaura antes do 1º render
loadAuth();                                    // carrega credenciais/sessão
syncFaturamentoFromAnual();                    // card do faturamento espelha o gráfico anual

// Atualização 8 (item 3): na virada de mês, o realizado já está gravado no
// gráfico; o card mensal "reseta" para o valor do novo mês (em geral 0).
onPeriodChange('month', () => {
  syncFaturamentoFromAnual();
  if (document.getElementById('metas-grid')) renderMetas();
  if (document.getElementById('dash-metas')) renderDashboard();
  if (typeof showToast === 'function') showToast('Novo mês: faturamento mensal reiniciado.');
});

// Atualização 11 (item: viradas de semana/dia): atualiza a tela aberta sem precisar
// navegar. O 'day' cobre o re-render genérico (cronograma centrado no "hoje", status
// "Atrasada" das tarefas, ponto, avisos expirados); uma virada de mês também muda o
// dia, então o card de faturamento acima + este re-render se complementam. O 'week'
// só avisa: como toda virada de semana também é virada de dia, o re-render já ocorreu.
onPeriodChange('day', () => { rerenderCurrentPage(); });
onPeriodChange('week', () => {
  if (typeof showToast === 'function') showToast('Nova semana: cronogramas e ponto atualizados.');
});

window.addEventListener('beforeunload', saveState);
setInterval(saveState, 2000);                  // autosave: cobre toda mutação em até 2s
onClockTick();                                 // define a baseline de data (não dispara)
setInterval(onClockTick, 60000);               // checa viradas a cada minuto
authBoot();                                    // login (ou entra direto se há sessão válida)
