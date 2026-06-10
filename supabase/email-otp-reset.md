# Reset de senha por e-mail (código OTP de 6 dígitos)

O código do app já está pronto (`SupabaseAuthProvider.sendResetCode` usa
`signInWithOtp`, e `confirmReset` usa `verifyOtp` com `type: 'email'`).
Falta só **configurar o template de e-mail no Supabase** para enviar o
token de 6 dígitos — por padrão o template manda um *link*, não um código.

## Passo a passo (Dashboard, uma vez)

1. Supabase Dashboard → **Authentication** → **Emails** (ou **Email Templates**).
2. Abra a aba **Magic Link** (é o template que o `signInWithOtp` dispara).
3. **Subject (assunto):**
   ```
   Seu código de acesso — Portal Integre Jr
   ```
4. **Message body (HTML):** substitua todo o conteúdo por:
   ```html
   <h2>Redefinição de senha — Portal EJ</h2>
   <p>Use o código abaixo para redefinir sua senha no Portal Integre Jr.</p>
   <p style="font-size:30px;font-weight:bold;letter-spacing:6px;margin:18px 0;">{{ .Token }}</p>
   <p>O código expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
   ```
   O importante é a variável **`{{ .Token }}`** (o código de 6 dígitos).
   Removemos o `{{ .ConfirmationURL }}` de propósito: o fluxo é por código,
   não por link, para não confundir o usuário.
5. **Save**.

## Opcional — tempo de expiração do código
**Authentication → Providers → Email → "Email OTP Expiration"** (padrão 3600s = 1h).

## Testar
1. Tela de login → **Esqueci / mudar senha** → digite um e-mail real cadastrado.
2. O código de 6 dígitos chega por e-mail (cheque o spam).
3. Digite o código + nova senha → **Redefinir senha** → logar com a nova senha.

## ⚠️ Limite do plano grátis (importante)
O serviço de e-mail embutido do Supabase é só para teste: **rate limit baixo**
(poucos e-mails por hora) e pode cair no spam. Para uso real pela EJ inteira,
configurar **SMTP customizado** em Authentication → SMTP Settings
(ex.: Resend, SendGrid, Brevo, ou o Google Workspace da EJ). Isso é a parte
final da Fase 1 antes do uso em produção.
