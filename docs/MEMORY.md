# Memória técnica do projeto

Última atualização: 2026-10-25. Este ficheiro é contexto persistido no repositório; só ajuda uma sessão que o consulte. Não contém credenciais nem substitui o código ou logs de produção.

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

## Correção do conceito visual — circuitos completos

O utilizador esclareceu que pretende bateria, cabos e lâmpadas ligados, e não objetos isolados quando o tema é um circuito. Implementado componente cartoon reutilizado no Manual (série/paralelo), aula Aprendiz 6 e prévia `circuitos-cartoon.html`. SVG assegura os percursos completos; cada lâmpada pode abrir o circuito/ramo. Não se alteram perguntas, progresso ou Auth. Ver testes `cartoon-circuits.test.mjs`; confirmar CI e inspeção visual do commit antes de declarar publicação.

Validação local desta correção: Node 22.23.4, typecheck aprovado, 34 testes aprovados e build Vite das duas entradas aprovado. O esquema do Manual mantém a posição antes do texto em ecrãs estreitos. Nenhuma alteração de backend.

Publicação inicial confirmada em e36e78e, CI/Pages 40059850344 aprovado. Prévia aberta no browser; desligar L1 por clique em série apaga ambas, e por Enter em paralelo deixa L2 acesa. Ajustado rótulo de lâmpada desligada para não sobrepor o segundo ramo. Safari/iPhone físico ainda não verificado.

Integração confirmada no Manual autenticado, capítulo 4. Ajustada apenas a grelha dos cartões que contêm esta comparação para usar a largura total e evitar espaço vazio excessivo na coluna de texto; restantes capítulos preservados.

## Generalização cartoon — 2026-10-24

O utilizador aprovou os circuitos completos e pediu aplicar o estilo a todos os gráficos didáticos existentes. Gerados seis assets, integrados Manual, laboratórios, circuitos e formas de onda; diagramas conceptuais mantêm conteúdo e recebem estilo cartoon. Não se alterou banco de perguntas, progresso ou backend. Ver [registo e limites](cartoon-art-rollout.md); publicação deve ser confirmada pelo CI e pela prévia pública.

## Correção móvel das aulas

Removido max-height de 285 px que deixava gráficos/laboratórios transbordar sobre o texto. Altura automática e grelha de uma coluna até 900 px, controlos e textos ajustados. Prévia inclui aulas reais com os estilos de produção e seleção dos 50 níveis/8 etapas, sem gravar progresso. Validar em `circuitos-cartoon.html?lessons=1`.

## Certificado: composição e PDF

Faísca completa em WebP; mensagem, QR e assinatura em zonas distintas. Download usa o mesmo DOM do certificado, renderizado a 2800×1750 e colocado numa única página A4 horizontal, preservando cores e proporções independentemente da orientação do telemóvel. html2canvas/jsPDF carregados apenas ao descarregar. Prévia de QA sem validade: `circuitos-cartoon.html?certificate=1`. O PDF contém uma imagem de alta resolução e link de validação clicável; o texto não é selecionável.

## Alinhamento dos símbolos no PDF — 2026-10-25

Exportação desenha os quatro ícones, o raio da marca e o QR diretamente no canvas, a partir das caixas do DOM clonado sem escala. Evita dependência da baseline de emojis e de object-fit/bordas no html2canvas. QR quadrado com margem branca simétrica, sem interpolação; ligação clicável acompanha a sua caixa real. O HTML visível não foi alterado. Typecheck, 34 testes e build locais passaram; confirmar exportação e deploy do commit antes de declarar publicação. Safari físico ainda não testado.

## Otimização de entrada — 2026-10-25

- Favicon usa `%BASE_URL%`, compatível com GitHub Pages e domínio na raiz.
- VoltzRoot é carregado depois da autenticação através de React.lazy/Suspense. No build de raiz, JS inicial referenciado pelo HTML passou de cerca de 619 KB para 256 KB sem compressão; não é uma medição de tempo real no telemóvel.
- public/.htaccess propõe DEFLATE para texto, HTML revalidado, cache de 1 ano para JS/CSS com hash e 1 dia para imagens/fontes. No alojamento existente, inspecionar e preservar regras locais antes de instalar; configuração ainda não confirmada em produção.
- Typecheck, 34 testes e builds com base Pages e `/` passaram. Não foi realizado Lighthouse nem teste Safari nesta intervenção. A sessão cPanel expirou por mudança de IP antes do upload; publicação MidiaHost pendente.

## Planos no Perfil — 2026-10-25

Apresentação Free/Pro/Escolas por baixo do nome, com diálogo de comparação responsivo. Preços: Free 0 €, Pro 3,99 €/mês ou 29,99 €/ano, Escolas 550 €/ano. Nesta fase todas as contas são apresentadas como Free: não existe subscrição paga integrada. Não inferir plano a partir das roles. Sem cobrança, alteração de acesso ou bloqueio do percurso/certificado. Adesões pagas, resolução do plano no servidor e limites Live pendentes.

### Correção visual dos planos

Diálogo montado num portal em document.body para não herdar cores e botões do cabeçalho escuro do Perfil. Cabeçalho sticky, fecho de 44 px, margem automática e dimensões móveis em dvh. Typecheck, 34 testes e build passaram; Safari real não validado nesta alteração.


## Centro de ajuda Voltz — 2026-10-25

Criada a entrada pública `/apoio.html`, sem dependência de autenticação, com FAQ, aviso de que os planos pagos ainda não estão ativos e contacto `mailto:voltz@midiahost.pt`. Link incluído no ecrã de entrada e no Perfil. Não recebe nem guarda tickets; publicação remota por confirmar.

## Páginas legais Voltz — 2026-10-25

Implementadas duas entradas independentes: `/privacidade.html` e `/termos.html`. A política reflete os dados vistos no Auth, progresso, atividade/erros, emails, certificados, armazenamento de sessão e fornecedores; os Termos explicam limites educativos, conta, propriedade e ausência atual de pagamentos. Avisos visíveis identificam a falta de nome legal/morada do operador e de prazos de retenção confirmados. 34 testes, typecheck, builds Pages/raiz e diff check passaram. Não tratar como informação jurídica final até os dados serem validados.
