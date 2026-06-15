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
};
