# Voltz Admin — migrations aplicadas

Projeto Supabase: `utgtvdmafmehjgebyhqk`

O Voltz Admin foi aplicado através de migrations versionadas no projeto Supabase. Este ficheiro mantém o repositório alinhado com o histórico efetivamente aplicado; o SQL executável permanece no histórico de migrations do projeto Supabase e nas definições de schema/RPC aí instaladas.

| Versão | Migration |
| --- | --- |
| 20260906082749 | `voltz_admin_core` |
| 20260906082909 | `voltz_admin_api` |
| 20260906082931 | `voltz_admin_system_health` |
| 20260906083300 | `voltz_admin_email_logs` |
| 20260906083744 | `voltz_admin_read_models` |
| 20260906084228 | `voltz_admin_harden_new_user_trigger` |
| 20260906084345 | `voltz_admin_service_only_client_writes` |
| 20260906084522 | `voltz_admin_safe_compatibility_shims` |
| 20260906084632 | `voltz_admin_cover_foreign_keys` |
| 20260906084706 | `voltz_admin_school_read_model` |

## Segurança

- `public.user_roles`: RLS; cada utilizador autenticado só lê a própria role; sem escrita pelo cliente.
- `public.user_activity` e `public.user_activity_days`: RLS; sem acesso direto do cliente; heartbeat passa pela Edge Function autenticada.
- schema privado `voltz_admin`: sem `USAGE` para `anon`/`authenticated`; tabelas service-only.
- RPCs administrativos: execute apenas para `service_role`; cada read/write administrativo volta a validar role `admin` no servidor.
- telemetria, feedback e reports: Bearer validado na Edge Function e helpers service-only.
- `service_role` nunca é exposta no frontend.

## Tabelas administrativas

`schools`, `teacher_schools`, `feedback`, `reports`, `app_errors`, `email_logs`, `audit_logs`, `certificates`.

## RPCs/read models principais

`voltz_admin_command`, `voltz_admin_users`, `voltz_admin_user_detail`, `voltz_admin_teachers`, `voltz_admin_statistics`, `voltz_admin_schools`, `voltz_admin_system`, `voltz_activity_touch_server`, `voltz_error_log_server`, `voltz_feedback_submit_server`, `voltz_report_submit_server`.

## Edge Function

`supabase/functions/voltz-admin/index.ts` é a única API HTTP administrativa usada pelo browser. A função valida a sessão Supabase e, para ações administrativas, exige `role=admin` antes de encaminhar para os RPCs service-only.
