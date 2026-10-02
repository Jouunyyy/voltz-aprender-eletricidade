# Documentação do Voltz

Ponto de entrada para compreender, desenvolver e manter o projeto. Base verificada em 2026-10-01: commit `da62a8d01338705fe671a6047123699a5e494018`.

| Documento | Fonte principal para |
| --- | --- |
| [PRD.md](PRD.md) | Objetivos, utilizadores, funcionalidades e critérios de aceitação |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Componentes, dados, APIs e publicação |
| [RULES.md](RULES.md) | Regras de desenvolvimento, segurança e validação |
| [DESIGN.md](DESIGN.md) | Identidade visual e critérios de interface |
| [TASKS.md](TASKS.md) | Pendências com critérios de conclusão |
| [MEMORY.md](MEMORY.md) | Estado datado, decisões e continuidade |

Para começar: ler RULES, MEMORY e TASKS; depois consultar os documentos relevantes para a tarefa. As instruções para agentes estão no [AGENTS.md](../AGENTS.md).

## Documentos especializados preservados

- [Voltz Live](voltz-live.md): desenho e validação inicial do motor; contém informação histórica de setembro.
- [Revisão de segurança de outubro](security-review-2026-10-01.md): alterações e limites da análise.
- [Histórico administrativo](../supabase/admin-migrations.md): migrations e controlos de Admin.

- [Auditoria de autenticação](auth-review-2026-10-02.md): correções e limites de validação de outubro.

## Como manter

Atualizar o documento que é fonte do assunto e ligar a ele nos restantes. Distinguir sempre implementação existente, estado observado em produção e proposta futura. Só marcar tarefas concluídas com evidência. Não mover ficheiros da aplicação para organizar documentação.
