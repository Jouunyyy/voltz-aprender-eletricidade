# Auditoria Auth — 2026-10-02

## Evidência e causas

- O endpoint authorize do Supabase responde 302 com o Client ID Google anteriormente reportado como eliminado, e callback Supabase correto. O browser desta sessão recebeu 502 ao chegar ao Google; eliminação administrativa/data/autor não verificados. Não foram criadas credenciais Google nem reutilizados secrets.
- O código OAuth já enviava origin + BASE_URL, incluindo o path GitHub correto. O signup não enviava redirect; recover enviava redirect_to no JSON em vez da query usada pelo cliente oficial. Estes fluxos dependiam do Site URL. A configuração privada Site URL/allowlist ainda não pôde ser lida: painel pede login, conector não expõe configuração Auth. A causa exata do redirect OAuth antigo para a raiz permanece por confirmar.
- O processamento estava dividido entre main e AuthApp. Recovery só limpava o fragmento após validar user; uma falha podia deixar tokens visíveis. Corrigido para limpar antes de qualquer pedido.
- Refresh apagava sessão em erros HTTP temporários, não coordenava separadores e podia repor uma sessão após logout. Corrigidos estes casos.
- Live só permitia CORS GitHub. Corrigido para permitir também o domínio MidiaHost, preservando autenticação no servidor.

## Alterações

- auth-redirect.ts: URL derivada de origin + base do deployment; signup/recover com redirect_to na query; extração e limpeza síncrona do callback, incluindo erros e recovery.
- auth-session.ts: callback único antes de React/telemetria; validação de user; flag de recuperação por utilizador no sessionStorage; refresh periódico e após visibility/pageshow/online; logout local imediato; sincronização entre separadores.
- supabase-client.ts: validação de sessão armazenada, rotação de refresh, preservação em 5xx, proteção contra corrida com logout, Web Locks quando disponível (fallback sem Locks).
- supabase-auth.tsx/main.tsx: integração; alteração de password usa token atualizado; erros de callback apresentados na entrada.
- voltz-live/index.ts: CORS dos dois deployments. Publicado como v7, verify_jwt false preservado porque o handler valida Bearer em Auth.
- tests/auth.test.mjs: testes de redirects, callback, recovery, persistência, refresh e logout.

## Configuração pretendida (ainda por aplicar/verificar no painel)

Site URL: `https://jouunyyy.github.io/voltz-aprender-eletricidade/`.
Redirect allowlist: esse URL e `https://voltz.midiahost.pt/`.
Ao migrar o domínio principal, mudar Site URL; manter ambos na allowlist enquanto ambos estiverem ativos. Frontend Pages usa base `/voltz-aprender-eletricidade/`; MidiaHost compila com `VOLTZ_BASE=/`.
Google: novo cliente Web com callback `https://utgtvdmafmehjgebyhqk.supabase.co/auth/v1/callback`; origens GitHub e MidiaHost. Guardar ID/secret apenas no provider Supabase. Não usar secrets antigos. Rever templates de confirmação/recovery para utilizarem ConfirmationURL e SMTP para entrega.

## Segurança e validação

- Typecheck e builds Pages/MidiaHost passaram; 27 testes passaram (16 anteriores + 11 Auth).
- Configuração pública confirma email/Google ativos, signup permitido e confirmação de email obrigatória.
- A conta de teste pedida existe, não confirmada, com exatamente uma linha role user. Não se escreveu em auth.users nem se alterou a conta antiga. Password/login real ainda não verificados: requer Admin Auth suportado.
- RLS continua ativa nas nove tabelas públicas. user_roles só permite SELECT da própria role; não se usa user_metadata para autorizar. Roles existentes: user, teacher, admin. Nenhum sistema novo.
- Security Advisors: 22 INFO de RLS sem políticas para tabelas de acesso servidor e 1 WARN de proteção de passwords comprometidas desativada. Nenhuma política foi aberta para silenciar avisos.
- Pesquisa por padrões de secret Supabase, secret OAuth Google, private keys e JWTs literais não encontrou valores no código versionado atual. A chave publishable continua pública e intencional. Não é uma certificação de ausência de todos os tipos possíveis de segredo.
- O token previamente exposto não foi lido, reutilizado ou incluído em código/logs. Revogação da sessão comprometida ainda exige identificar a conta e acesso administrativo; não se terminaram sessões de outros utilizadores indiscriminadamente.
- Testes de sessão são automatizados com respostas simuladas. Não equivalem a login real ou teste em Safari/iPhone físico. A limpeza usa History API e armazenamento do browser; a retoma após suspensão é tratada por pageshow/visibilitychange.
- Não houve alteração ao menu, currículo, progresso ou sistemas de roles.

## Bloqueios restantes

Autenticação no painel Supabase e acesso Google Cloud para ler/aplicar configuração, trocar o cliente Google e reparar a conta via Admin Auth. Login real, entrega/click de emails, Google completo, revogação da sessão exposta e Safari físico permanecem por validar. CI/deploy frontend devem ser confirmados pelo commit publicado; consultar histórico do workflow.
