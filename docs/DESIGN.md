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
