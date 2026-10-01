# Memória técnica do projeto

Última atualização: 2026-10-01. Este ficheiro é contexto persistido no repositório; só ajuda uma sessão que o consulte. Não contém credenciais nem substitui o código ou logs de produção.

## Estado de referência

Base de código revista: da62a8d01338705fe671a6047123699a5e494018. SPA React/Vite/TypeScript e backend Supabase. As funcionalidades existentes estão no [PRD](PRD.md); caminhos e publicação na [arquitetura](ARCHITECTURE.md).

Os 50 níveis existem no código. Não confundir isto com revisão pedagógica integral nem com disponibilidade verificada de todos os vídeos.

## Decisões a preservar

- Português de Portugal, identidade Faísca, Nunito Sans e padrões visuais existentes.
- Aprovação individual: pelo menos 8/10 nas primeiras respostas. O baralhamento não pode alterar a correspondência de respostas.
- Texto de utilizador é dado; não há LLM identificado nesta versão.
- Autorizações de Admin/Professores/Live são verificadas no servidor; mostrar ou esconder botões é apenas apresentação.
- A chave publishable do Supabase é pública por definição. A exceção de scanner é específica, não uma permissão para publicar segredos.
- Push do frontend e deploy de Edge Functions são operações separadas.

## Trabalho verificado em 2026-10-01

Correções de segurança em [da62a8d](https://github.com/Jouunyyy/voltz-aprender-eletricidade/commit/da62a8d01338705fe671a6047123699a5e494018): Actions fixadas, Web Crypto no quiz, parser de comandos com limites/allowlist e testes de regressão.

16 testes locais, typecheck e build passaram. O teste SQL Live passou com rollback. Pedidos sem sessão às três APIs publicadas receberam 401. Verificações de papéis negaram acesso administrativo/professor a uma identidade sem esses papéis.

[Workflow 36932152422](https://github.com/Jouunyyy/voltz-aprender-eletricidade/actions/runs/36932152422) publicou GitHub Pages; FTPS MidiaHost foi ignorado por falta do secret. Edge Functions observadas após publicação: Admin v11, Professores v7 e Live v6. São observações datadas, não garantia do estado futuro.

O GitGuard identificou da62a8d no cabeçalho, mas mostrou as mesmas oito ocorrências e o trecho antigo com Math.random. Não se determinou a causa; não registar o scanner como confirmado limpo. Consultar SEC-01 em [TASKS](TASKS.md).

## Organização documental

Nesta alteração, foi criada a documentação de produto e manutenção, preservando os documentos especializados existentes. AGENTS.md orienta a consulta inicial e a atualização dos documentos relevantes ao concluir trabalho. Não foi criada automação que atualize memória ou tarefas sozinha.

## Próxima sessão

Consultar o pedido do utilizador e [TASKS](TASKS.md), verificar o estado do Git e confirmar qualquer estado remoto necessário. Não repetir correções já aplicadas por causa de alertas históricos. Atualizar esta memória apenas com decisões e resultados verificáveis.
