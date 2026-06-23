// ============================================================================
// Configuração do Supabase (Fase 1)
// ----------------------------------------------------------------------------
// A `anonKey` é PÚBLICA — foi feita para rodar no frontend, sem problema.
// ⚠️ NUNCA coloque aqui a chave `service_role` (secret): essa fica só em
//    scripts locais e jamais no código que vai para o navegador.
// ============================================================================
window.SUPABASE_CONFIG = {
  url: 'https://niawkodrysligvecsfug.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYXdrb2RyeXNsaWd2ZWNzZnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTI3OTYsImV4cCI6MjA5NjUyODc5Nn0.MQXhN60HW8yIxjPUnqu9v68JNmSHCOMAwpcOmBN2_iM',
};

// ============================================================================
// Integração Google Workspace (Fase 5) — específica de CADA EJ.
// ----------------------------------------------------------------------------
// `clientId` é o OAuth Client ID (Web) criado no Google Cloud da EJ. É PÚBLICO
// (vai no frontend, sem segredo). Enquanto estiver VAZIO, a integração fica
// desligada e o app funciona normalmente (o botão "Conectar" some).
// Outra EJ que adotar a plataforma só troca estes 3 valores — o código não muda.
// ============================================================================
window.GOOGLE_CONFIG = {
  clientId: '1024997106052-er49mhsab92f8h1b92rauq0v45h5802q.apps.googleusercontent.com',
  companyDomain: 'integrejr.com.br',     // domínio do Workspace da EJ
  calendarTimeZone: 'America/Sao_Paulo', // fuso usado nos eventos
  // ID da planilha-espelho do Ponto (horas + engajamento por semana). É PÚBLICO
  // (não é segredo — a chave da service account fica em env var no backend).
  // VAZIO = espelho desligado: o app salva normalmente no Supabase e só não
  // envia ao Sheets. Preencher após criar/compartilhar a planilha (PLANO 3.4).
  pontoSheetId: '16KOrGStvJCMBIZW6WmG_JWpp9Dd40Gkg4FCpufpVUxM',

  // Espelhar TAREFAS de projeto na agenda do RESPONSÁVEL (backend
  // /api/calendar-task, Modelo B). FALSE = desligado: o app salva a tarefa
  // normalmente no Supabase e só não cria o evento. Ligar (true) APÓS o setup
  // de delegação de domínio + GOOGLE_SA_KEY na Vercel (ver topo de
  // api/calendar-task.js — precisa de super-admin do Workspace).
  taskCalendar: false,
};

// ============================================================================
// Módulos da plataforma (feature-flags) — específico de CADA EJ.
// ----------------------------------------------------------------------------
// Liga/desliga páginas inteiras SEM mexer no código. Um módulo em `false`
// SOME da barra lateral e fica inacessível por navegação direta (cai no
// dashboard). É assim que a plataforma é vendida em pacotes: a mesma base de
// código serve todas as EJs — muda só este objeto. NUNCA recortar/apagar
// páginas por cliente (forks viram pesadelo de manutenção).
//
// NÚCLEO (sempre ativo, não tem flag aqui): login, dashboard, perfil, membros,
// configurações. Esses não desligam.
//
// A integração Google (Calendário/e-mail) se autodesliga sozinha quando o
// `clientId` acima está vazio — é independente destas flags.
// ============================================================================
window.MODULES = {
  avisos:       true,
  calendario:   true,
  ponto:        true,
  projetos:     true,
  capacitacoes: true,
  trainees:     true,
  rnn:          true,
  legado:       true,
  drive:        true,
  contratos:    true,
  metas:        true,
};

// ============================================================================
// Configurações gerais da plataforma — ajustáveis por EJ.
// ----------------------------------------------------------------------------
// `retencaoDesligamentoMeses`: ao desligar um membro, ele fica INATIVO e
// recuperável por este nº de meses; depois o registro é apagado de vez (o
// apagamento automático — job no Supabase — entra na fase de backend). Default
// 6 meses; cada EJ pode mudar.
// ============================================================================
window.PLATFORM_CONFIG = {
  retencaoDesligamentoMeses: 6,

  // ==========================================================================
  // Documentos (termo de desligamento, contratos) — específico de CADA EJ.
  // --------------------------------------------------------------------------
  // Dados da EJ e signatários que entram nos documentos. Quando a diretoria
  // mudar, basta atualizar `signatarios` aqui — o código não muda. Outra EJ que
  // adotar a plataforma troca este bloco inteiro.
  // ==========================================================================
  documentos: {
    // ==========================================================================
    // Motor de documentos via Google Docs (saída IDÊNTICA ao modelo oficial).
    // --------------------------------------------------------------------------
    // `engine:false` (ou IDs vazios) = desligado: a plataforma gera o documento
    // pela impressão do navegador (ponte). Quando ligado, copia o Google Doc
    // modelo, troca os {{campos}} e exporta PDF — logo/cabeçalho/rodapé/fonte
    // saem idênticos (ver api/gerar-documento.js).
    //
    // Para ligar: (1) ter os modelos como Google Docs com os {{campos}};
    // (2) COMPARTILHAR cada Doc + a pasta de saída com o e-mail da service
    // account (Editor); (3) colar os Doc IDs abaixo e pôr engine:true; (4) pôr o
    // id da PASTA na env DOC_DRIVE_FOLDER_ID da Vercel (não fica aqui — o destino
    // não pode vir do navegador, senão um chamador redirecionaria as cópias).
    // O Doc ID está na URL: .../document/d/<ESTE_ID>/edit
    // Cada EJ usa os SEUS próprios Docs — é assim que o produto é multi-EJ.
    // ==========================================================================
    engine: true,
    templates: {
      termo:           '1MnhFtCnh111c-oDNCAs8cT0A3dsr7lF_lMCfvh1g1hY',   // Google Doc do Termo de Desligamento
      contratoServico: '1Tl91BjIaT28J2OdnUCyZQJwfkKCCTK4UwGv-RMnfoYY',   // Google Doc do Contrato de Prestação de Serviços
    },
    // A pasta de saída é definida no SERVIDOR: env DOC_DRIVE_FOLDER_ID (Vercel).

    empresa: {
      razaoSocial: 'Integre Júnior Consultoria em Engenharia',
      nomeCurto:   'Integre Júnior',
      cnpj:        '26.154.689/0001-00',
      endereco:    'Rua Eng. Udo Deeke, número 485, bairro Salto do Norte, Blumenau/SC',
      cep:         '89037-000',
      cidade:      'Blumenau',
      estado:      'SC',
    },
    // `match` liga cada signatário ao CARGO na plataforma: o nome é preenchido
    // automaticamente por quem ocupa esse cargo HOJE (membro ativo). Se o cargo
    // estiver vago, usa o `nome` fixo abaixo como fallback. Assim, ao trocar a
    // diretoria, os documentos se atualizam sozinhos (não precisa editar aqui).
    signatarios: {
      // Quem "representa" a EJ no cabeçalho do termo (fallback do presidente).
      representanteTermo: 'Tiago Queiroz Borba',
      // Assinaturas do termo de desligamento (nome + cargo). Nome = automático
      // pelo `match`; `nome` é só o fallback se o cargo estiver vago.
      termo: [
        { match: { role: 'Presidente' },                 cargo: 'Diretor Presidente',               nome: 'Tiago Queiroz Borba' },
        { match: { role: 'Diretor', sector: 'ADM/FIN' },  cargo: 'Diretor Administrativo Financeiro',  nome: 'Pedro Henrique Freire da Trindade' },
      ],
      // Assinaturas do contrato. Precisam de qualificação completa porque o
      // contrato as descreve por extenso (RG/CPF/endereço). O NOME segue o
      // `match` (presidente e diretor de Projetos atuais); RG/CPF/endereço
      // continuam os daqui (ajustar quando a pessoa do cargo mudar).
      contrato: [
        { match: { role: 'Presidente' },                  cargo: 'Diretor Presidente',            nome: 'Tiago Queiroz Borba', nacionalidade: 'brasileiro', estadoCivil: 'solteiro', profissao: 'estudante', rg: '544525188', cpf: '468.302.078-51', endereco: 'Rua Leopoldo Wilhelm, 310, Velha, Blumenau/SC, CEP 89045140' },
        { match: { role: 'Diretor', sector: 'Projetos' },  cargo: 'Diretor de Projetos e Pesquisa', nome: 'Lucas Sampaio Gomes', nacionalidade: 'brasileiro', estadoCivil: 'solteiro', profissao: 'estudante', rg: '7953858',   cpf: '085.350.209-93', endereco: 'Rua Wilhelm Budag, 45, Velha, Blumenau/SC, CEP 89045-090' },
      ],
    },
  },
};
