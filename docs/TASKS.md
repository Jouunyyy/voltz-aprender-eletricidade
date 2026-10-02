# Tarefas

Atualizado: 2026-10-02. Backlog não equivale a autorização para executar todas as entradas. Escolher a tarefa em função do pedido atual.

## Pendentes

| ID | Prioridade | Tarefa | Critério de conclusão / dependência |
| --- | --- | --- | --- |
| AUTH-01 | Alta | Em curso: concluir configuração e validação Auth | Código corrigido e testes locais aprovados; faltam acesso administrativo Supabase/Google, conta confirmada e testes reais de login/email. Ver auth-review-2026-10-02.md. |
| SEC-01 | Alta | Esclarecer discrepância do GitGuard | Nova execução comprovadamente sobre código corrigido, com logs/trechos coerentes. O relatório de da62a8d ainda mostrava Math.random antigo; causa não confirmada. |
| SEC-02 | Média | Rever proteção de passwords comprometidas | Confirmar disponibilidade no plano, ativar se aplicável e verificar configuração. Advisor indicava desativada; ferramentas usadas não expunham a alteração. |
| OPS-01 | Média | Concluir publicação MidiaHost, se continuar pretendida | Configurar secret VOLTZ_FTP_PASSWORD por canal seguro, executar workflow e validar destino. GitHub Pages já foi publicado. |
| DATA-01 | Média | Completar reprodução do backend por migrations locais | Inventariar histórico remoto e reconciliar lacunas; reconstruir em ambiente isolado antes de considerar reprodutível. |
| QA-01 | Média | Rever pedagogicamente os 50 níveis | Checklist por nível: teoria, exemplos, diagramas, respostas e explicações revistos; registar responsável/evidência. |
| MEDIA-01 | Média | Verificar disponibilidade das videoaulas | Conferir links, thumbnails, reprodução móvel e estados de ausência para cada entrada do catálogo. |
| SEC-03 | A decidir | Definir integridade exigida para progresso/certificados | Decisão explícita sobre progresso enviado pelo cliente; se necessário, especificar e testar validação de aprendizagem no servidor. |

## Concluído com evidência

- [x] DOC-01 — Estrutura documental com PRD, arquitetura, regras, design, tarefas, memória, índice e orientações de agentes; ligações locais verificadas nesta alteração.
- [x] SEC-00 — Correções de segurança no commit da62a8d: seis Actions por SHA, Web Crypto, exceção restrita para chave pública e validação partilhada de comandos.
- [x] QA-00 — Na revisão de segurança: 16 testes, typecheck e build aprovados; teste SQL Live passou com rollback.
- [x] OPS-00 — GitHub Pages publicado no run 36932152422; APIs Admin v11, Professores v7 e Live v6 publicadas em 2026-10-01.

## Uso

Ao iniciar, marcar uma tarefa explicitamente como em curso. Ao concluir, anotar data, commit/PR ou outra evidência e resultado da validação. Se bloqueada, indicar dependência concreta. Não remover pendências só para deixar a lista vazia.
