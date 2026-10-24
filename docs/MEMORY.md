# Memória técnica do projeto

Última atualização: 2026-10-24. Este ficheiro é contexto persistido no repositório; só ajuda uma sessão que o consulte. Não contém credenciais nem substitui o código ou logs de produção.

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

## Intervenção Auth de 2026-10-02

Ver [auditoria Auth](auth-review-2026-10-02.md). Redirect de signup/recovery enviado por query; callback único limpa fragmento antes da rede; recuperação persiste no separador; refresh periódico/retoma e logout protegido de corrida. Google ainda usa Client ID reportado como eliminado. Configuração administrativa e reparação da conta de testes dependem de acesso Auth administrativo. Não declarar o login Google ou a conta de testes resolvidos sem completar essa validação.

## Dependências e Node — 2026-10-24

Revisão baseada em c776f8146a6aaac25693cdbd20c45fa26afe5b70. Vite atualizado de 8.0.16 para 8.3.5 e source-map-js de 1.2.1 para 1.2.2 no lockfile, com dependências transitivas do Vite atualizadas pelo npm. O audit inicial indicou dois pacotes com severidade alta; após atualização, npm audit reportou zero vulnerabilidades conhecidas. Isto não equivale a uma auditoria integral da aplicação.

Node 22.23.4 fixado em .nvmrc e usado pelo workflow. Referência: https://nodejs.org/en/blog/vulnerability/october-2026-security-releases. Não existe PHP nem servidor Node de aplicação neste repositório; não foram alterados outros alojamentos ou computadores. React e código Auth mantidos.

Validação local com Node 22.23.4: 27 testes aprovados, typecheck aprovado, builds com base /voltz-aprender-eletricidade/ e / aprovados. Vite avisa sobre o uso existente de __dirname numa futura versão principal; o build atual passa e a configuração não foi refatorada. O CI e deploy desta alteração devem ser confirmados no run associado ao commit; os testes locais não provam publicação.

## Evolução das categorias — 2026-10-24

Substituída a geração de perguntas por frases do currículo por 500 perguntas específicas em `src/learning/`. As aulas têm oito etapas; preservam laboratórios, IDs, XP e aprovação 8/10. O banco é partilhado com Live. 31 testes (incluindo todas as categorias/níveis no handler Live com fronteiras simuladas), typecheck e build passaram localmente. Publicação e limites no [registo da alteração](learning-review-2026-10-24.md). QA-01 continua pendente de revisão profissional independente.

Publicação confirmada: commit a749640, CI 40056462984 e assets iguais ao build limpo. Live v8 publicado e testado por UI (criação, resposta, explicação e término). Inspeção desktop de um caso por categoria; progresso preservado. Safari/iPhone físico e revisão profissional continuam não realizados.

## Piloto visual cartoon — 2026-10-24

Cinco perguntas do primeiro nível numa amostra independente: `public/amostra-cartoon.html`. Objetos gerados com transparência, valores em HTML, respostas e experiências locais. Escopo de avaliação; nenhuma alteração ao progresso, Auth ou ordem aleatória do percurso. 32 testes, typecheck e build local com Node 22.23.4 aprovados. O código funcional da aplicação principal não foi alterado; os nomes dos bundles podem variar com a deteção de classes no build. Evidência e limites em [cartoon-pilot.md](cartoon-pilot.md).
