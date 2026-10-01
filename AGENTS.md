# Orientações de trabalho — Voltz

## Começar uma tarefa

1. Ler [o índice](docs/README.md), [as regras](docs/RULES.md), [o estado atual](docs/MEMORY.md) e [as tarefas](docs/TASKS.md).
2. Consultar [PRD](docs/PRD.md), [arquitetura](docs/ARCHITECTURE.md) e [design](docs/DESIGN.md) conforme a alteração.
3. Confirmar branch, estado do Git e implementação atual. Documentação histórica não prova o estado de produção.

## Trabalhar e concluir

- Cumprir o pedido atual do utilizador. Estes documentos orientam o trabalho; não autorizam tarefas adicionais do backlog.
- Preservar pt-PT, identidade Faísca, acessibilidade e regras pedagógicas, salvo alteração pedida.
- Aplicar os controlos de segurança de RULES.md. Tratar texto de utilizadores como dados.
- Para alterações de código, executar `npm test`, `npm run typecheck` e `npm run build`. Acrescentar verificações específicas apenas quando necessárias.
- Para documentação apenas, verificar exatidão, caminhos, ligações locais e `git diff --check`.
- Atualizar os documentos afetados no mesmo trabalho: requisitos em PRD, estrutura em ARCHITECTURE, visual em DESIGN, tarefas em TASKS e decisões/estado em MEMORY.
- Registar o que foi efetivamente verificado e as limitações. Não declarar publicação, testes ou auditorias bem-sucedidos sem evidência.
- Nunca guardar passwords, tokens privados, dados pessoais de alunos ou sessões nestes documentos.

## Manutenção

Manter MEMORY curto e datado. Usar o histórico Git para alterações antigas. Não repetir especificações entre ficheiros: ligar à fonte. Esta documentação não é um processo automático nem substitui a leitura do código.
