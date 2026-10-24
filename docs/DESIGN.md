# Design e identidade

Base: estilos existentes no código em 2026-10-01; este documento não substitui uma inspeção visual da página renderizada.

## Identidade existente

- Nome: Voltz — Aprender Eletricidade. Mascote: Faísca.
- Fonte declarada: Nunito Sans, com Segoe UI, Arial e sans-serif como alternativas.
- Ícones: lucide-react; manter consistência entre áreas.
- Cartões claros, cantos arredondados, destaques azuis e ação principal amarela. Ilustrações e diagramas devem apoiar a aprendizagem.

Tokens de marca definidos em [globals.css](../src/globals.css):

| Token | Valor | Uso de referência |
| --- | --- | --- |
| --ink | #12233f | Texto escuro |
| --blue | #1268f4 | Marca, navegação e destaques |
| --blue-dark | #0748b6 | Azul escuro |
| --cyan | #12cbe8 | Destaque secundário |
| --yellow | #ffd21f | Ação principal e marca |
| --line | #dce6f3 | Contornos |
| --soft | #f3f7fc | Fundos suaves |
| --green | #19a967 | Sucesso/progresso |

Os tokens genéricos Tailwind/shadcn no início do CSS coexistem com os tokens Voltz. Consultar a classe efetivamente aplicada antes de alterar uma cor global.

## Organização visual

O layout base, percurso e desafios estão em globals.css. Live, Professores, Admin, videoaulas, avaliações e certificados têm folhas CSS específicas junto dos componentes em src. Reutilizar componentes e estilos existentes, evitando acrescentar overrides globais que afetem outras áreas.

Preservar a navegação lateral no desktop e a navegação adaptada ao telemóvel. Manter títulos curtos, ações claras, textos legíveis, foco visível e rótulos acessíveis. Não usar apenas cor para indicar erro, acerto ou bloqueio.

Estados a prever: carregamento, conteúdo vazio, erro, sucesso, ação indisponível e recuperação da ligação. Botões em processamento não devem gerar operações duplicadas.

## Imagens e certificados

Usar os assets existentes em [public](../public), incluindo faisca.png e faisca-mobile.webp. Respeitar proporções e evitar cortar a mascote. A versão de impressão do certificado deve manter nome, código, data e elementos de validação legíveis.

## Aceitação de alterações visuais

Verificar pelo menos um viewport de telemóvel (referência de trabalho: 390 × 844 CSS px) e um desktop (1440 × 900), ajustando quando o pedido indicar outro dispositivo. Confirmar ausência de scroll horizontal acidental, navegação utilizável, texto não cortado e estados interativos. Estes tamanhos são critérios de revisão, não afirmação de teste já realizado.

## Aulas ampliadas — 2026-10-24

As aulas mantêm laboratórios e esquema nas etapas 4 e 5; acrescentam caso aplicado, erro frequente e revisão final. A solução do caso começa fechada e volta a fechar ao mudar de etapa. A revisão usa `details/summary` nativo e uma lista numerada, com quebra de texto em ecrãs estreitos. O indicador mostra oito etapas; não se promete uma duração fixa para conteúdos de complexidade diferente.

## Piloto cartoon — cinco perguntas do nível 1

A amostra pública `amostra-cartoon.html` usa objetos isolados, com transparência, amarelo/azul e contornos azul-escuro. Valores e respostas continuam a ser texto HTML. São as cinco primeiras perguntas na ordem de autoria de `aprendiz-1`; o percurso normal mantém o baralhamento existente. Experiências posteriores à resposta alteram leituras, resistência e estado do interruptor. O piloto não grava progresso e ainda não substitui os visuais dos restantes níveis.

## Circuitos cartoon completos — correção de 2026-10-24

A comparação de série/paralelo no Manual e na aula Aprendiz 6 passa a mostrar bateria, cabos contínuos ligados aos dois polos e duas lâmpadas com casquilhos. O componente SVG/React permite retirar/repor cada lâmpada: em série qualquer abertura apaga ambas; em paralelo só apaga o ramo aberto. Os símbolos, fios e estados são desenhados em código para preservar a topologia; a bateria reutiliza o asset cartoon. Prévia pública em `circuitos-cartoon.html`, com o mesmo componente do produto. O brilho é ilustrativo, não uma comparação de potência.

## Generalização dos gráficos cartoon

Objetos transparentes gerados em `public/cartoon-art/`, reutilizados por `cartoon-learning.tsx` e `cartoon-art.tsx`. Valores, fórmulas, ligações e estados permanecem em código. O Manual deixa de depender de fotografias externas; laboratórios mantêm controlos e respostas. Perguntas apenas textuais permanecem sem ilustração. Diagramas de avaliação não oferecem controlos ou legendas que revelem a resposta. Ver [registo](cartoon-art-rollout.md).

## Correção móvel das aulas

Removido max-height de 285 px que deixava gráficos/laboratórios transbordar sobre o texto. Altura automática e grelha de uma coluna até 900 px, controlos e textos ajustados. Prévia inclui aulas reais com os estilos de produção e seleção dos 50 níveis/8 etapas, sem gravar progresso. Validar em `circuitos-cartoon.html?lessons=1`.
