# Arquitetura

## Stack e execução

SPA React 19 + TypeScript, compilada por Vite 8. Tailwind 4, estilos CSS específicos e ícones Lucide. As versões exatas estão em [package.json](../package.json) e [package-lock.json](../package-lock.json).

Não existe servidor Node de aplicação neste repositório: o frontend estático comunica por HTTP com Supabase Auth, REST e Edge Functions Deno.

## Mapa do código

| Caminho | Responsabilidade |
| --- | --- |
| [src/main.tsx](../src/main.tsx) | Arranque, callback OAuth, erros e validação pública de certificado |
| [src/supabase-auth.tsx](../src/supabase-auth.tsx) | Autenticação, perfil e ligação ao progresso remoto |
| [src/supabase-client.ts](../src/supabase-client.ts) | Configuração pública e renovação da sessão |
| [src/voltz-root.tsx](../src/voltz-root.tsx) | Integração das áreas, navegação e certificados |
| [src/full-voltz-app.tsx](../src/full-voltz-app.tsx) | Percurso, manual, aulas, desafios e perfil |
| [src/curriculum.ts](../src/curriculum.ts) / [src/quiz.ts](../src/quiz.ts) | Categorias/níveis e construção/baralhamento dos quizzes |
| [src/voltz-live.tsx](../src/voltz-live.tsx) / [src/live-api.ts](../src/live-api.ts) | Interface e cliente HTTP Live |
| [src/voltz-teachers.tsx](../src/voltz-teachers.tsx) / [src/teacher-api.ts](../src/teacher-api.ts) | Professores, alunos e turmas |
| [src/voltz-admin.tsx](../src/voltz-admin.tsx) | Gestão administrativa |
| [src/video-lessons.ts](../src/video-lessons.ts) / [src/voltz-videoaulas.tsx](../src/voltz-videoaulas.tsx) | Catálogo e reprodução de videoaulas |
| [src/certificate-system.tsx](../src/certificate-system.tsx) / [src/certificate-api.ts](../src/certificate-api.ts) | Certificados e respetiva API |
| [src/telemetry.ts](../src/telemetry.ts) / [src/learning-telemetry.ts](../src/learning-telemetry.ts) | Erros e eventos de aprendizagem |
| [components/ui](../components/ui) / [lib](../lib) | Componentes e utilitários partilhados |
| [public](../public) | Imagens, favicon e modelos estáticos |
| [supabase/functions](../supabase/functions) | Funções HTTP de backend |
| [supabase/migrations](../supabase/migrations) | SQL versionado disponível no repositório |
| [tests](../tests) | Regressões de segurança e motor Live |

A integração de áreas em voltz-root usa portais e observação do DOM. Alterar classes/estrutura de navegação pode afetar estas ligações; não presumir um router convencional.

## Dados e limites de confiança

Projeto Supabase identificado: `utgtvdmafmehjgebyhqk`. O browser só contém chave publishable. Tokens de sessão ficam no armazenamento local; evitar qualquer execução de HTML/código fornecido por utilizadores.

Tabelas públicas observadas na revisão de 2026-10-01: progress, email_preferences, user_roles, user_activity, user_activity_days, video_progress, app_ratings, rating_prompt_state e certificates, todas com RLS. Dados operacionais adicionais usam schemas voltz_admin, voltz_teacher e voltz_live.

Admin, Professores e Live validam Bearer em Auth antes de encaminhar ações para RPCs. A identidade vem da sessão validada; papéis e pertença são verificados no servidor. O [leitor partilhado](../supabase/functions/_shared/request.ts) limita tamanho e estrutura dos pedidos. Certificados e emails têm handlers próprios; não presumir que usam esse leitor.

O frontend pode esconder botões por papel, mas isso não constitui autorização. O Live calcula pontuação no servidor; o progresso individual tem uma fronteira de confiança diferente, descrita no PRD.

## Publicação

[pages.yml](../.github/workflows/pages.yml) instala dependências, verifica tipos, corre testes, compila e publica GitHub Pages em pushes para main. Base padrão: `/voltz-aprender-eletricidade/`, configurada em [vite.config.ts](../vite.config.ts).

A publicação FTPS opcional para MidiaHost usa `VOLTZ_FTP_PASSWORD` nos secrets do GitHub e recompila com `VOLTZ_BASE=/`. Na última execução confirmada, foi ignorada por ausência do secret.

Edge Functions são publicadas separadamente no Supabase: fazer push de código não as publica por este workflow. Não reaplicar schemas consolidados como migrations: o histórico administrativo no servidor contém alterações não reproduzidas integralmente pelos ficheiros locais. Conferir [admin-migrations.md](../supabase/admin-migrations.md) e o estado remoto antes de qualquer alteração de schema.
