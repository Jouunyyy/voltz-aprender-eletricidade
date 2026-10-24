# Amostra cartoon — nível 1

Pedido: entregar cinco perguntas para avaliação visual, com objetos isolados adequados a cada tema.

## Implementação

- Página: `public/amostra-cartoon.html`.
- Assets e interação: `public/cartoon-pilot/`.
- Perguntas originais 1–5 de `aprendiz-1`, sem alterar texto, opções ou resposta correta; teste impede divergência silenciosa do snapshot.
- Multímetro em A com leitura HTML 3 A, bateria com 9 V, fonte/resistência para 15 V e 5 Ω, interruptor aberto com fonte de 12 V, comparação de 5 Ω com 10 Ω sob tensão constante.
- Respostas, explicações e navegação 1–5. Experiências depois da resposta: 3/6 A, 5/10 Ω com cálculo, abertura/fecho do interruptor e corrente a tensão constante.
- Ilustrações são modelos simplificados. Não são instruções para medições reais.
- Nenhuma gravação de respostas, XP, certificados ou sessão. A amostra pode ser vista sem login.

## Imagens

Geradas com a ferramenta integrada de imagens, usando o multímetro aprovado como referência de estilo. Distribuídas em WebP 640 px, transparência preservada, cerca de 230 KiB no total. Sem dependências externas para carregar imagens. Originais gerados não são necessários ao funcionamento do site.

Prompts finais e referência de cada asset em `cartoon-prompts.json`. Base comum: objeto físico isolado, acabamento cartoon dimensional amarelo/azul, contornos navy, sem cenário, títulos, UI ou valores elétricos incorporados. Os valores são HTML; seletor em A para a leitura em ampere; COM preto. Interruptor com estados aberto e fechado distintos.

## Validação local

- Node 22.23.4: 32 testes aprovados; typecheck aprovado; build aprovado.
- `node --check public/cartoon-pilot/app.js` e `git diff --check` aprovados.
- JS/CSS principal conserva os hashes do build limpo anterior: `index-Dn3gtv0_.js`, `index-DHJddXc8.css`.
- Avisos existentes: chunk principal superior a 500 kB e futuro loader Vite com `__dirname`.
- Publicação e inspeção no browser devem ser registadas depois do deploy. Safari/iPhone físico não testado nesta fase. A amostra não substitui a revisão pedagógica independente.
