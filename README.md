# Voltz — Aprender Eletricidade

Plataforma visual e gamificada, em português de Portugal, para aprender fundamentos de eletricidade e segurança elétrica.

## Estado atual

O Voltz inclui:

- autenticação obrigatória;
- manual de iniciação;
- 5 categorias e 50 níveis progressivos;
- aulas visuais e desafios com regra de 8/10;
- progresso sincronizado com Supabase e cache local por utilizador;
- **Voltz Live** para desafios multiplayer autenticados;
- **Voltz Professores** para turmas, acompanhamento agregado e recomendações;
- **Voltz Admin** para gestão operacional da plataforma;
- emails da Faísca com consentimento, feedback e lembretes.

O frontend é React + Vite + TypeScript. O backend utiliza Supabase (Auth, Postgres e Edge Functions).

## Desenvolvimento

```bash
npm ci
npm run typecheck
npm run dev
```

Para validar uma alteração antes de publicar:

```bash
npm test
npm run typecheck
npm run build
```

## Publicação

Cada atualização da branch `main` é compilada e publicada automaticamente no GitHub Pages através de GitHub Actions. O diretório `dist/` é gerado pelo CI e não deve ser versionado.

## Documentação e continuidade

Começa pelo [índice de documentação](docs/README.md). Inclui [requisitos](docs/PRD.md), [arquitetura](docs/ARCHITECTURE.md), [regras](docs/RULES.md), [design](docs/DESIGN.md), [tarefas](docs/TASKS.md) e [memória técnica](docs/MEMORY.md).

As orientações para trabalhar no repositório estão em [AGENTS.md](AGENTS.md). Os documentos devem ser atualizados juntamente com as alterações relevantes; não existe atualização automática.
