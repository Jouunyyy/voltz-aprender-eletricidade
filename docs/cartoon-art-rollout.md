# Integração cartoon — 2026-10-24

## Escopo

Gráficos existentes do Manual, laboratórios e demonstrações das aulas, e diagramas das perguntas. Não se acrescentaram imagens às perguntas apenas textuais. Mascote, fotografias de perfil, vídeos, certificados, autenticação e progresso não foram alterados.

## Implementação

- Seis objetos transparentes gerados com a skill imagegen / ferramenta integrada: cabos, contador, lâmpada, quadro, tomada e fonte, em `public/cartoon-art/`. Os objetos existentes do piloto são reutilizados.
- Prompt comum: “Single isolated [subject]. Premium Voltz educational cartoon object: rounded navy outlines, dimensional soft shading, royal blue and warm yellow palette, clean readable silhouette, front facing. Physical object only, no scene, no UI, no words, no numbers, no diagram, no extra decorative items. Fully transparent background, no floor shadow. Square composition.” Subjects: insulated electrical wires; electrical energy meter; light bulb in two-terminal holder; electrical distribution board; Type F socket; bench power supply. Assets WebP com alpha, 640 px.
- Cabos e valores são SVG/texto em código. Fonte e resistência formam um percurso completo. Multímetro com seletor V/A/Ω ligado aos mesmos valores/controles existentes. Interruptores alteram o estado da lâmpada. Série/paralelo preservam o modelo testado.
- Nas perguntas de série/paralelo o gráfico é estático: a lâmpada aberta é identificada, mas o brilho e as legendas não revelam o resultado esperado. Não há controlos nem explicação da resposta antes da escolha.
- Lei de Ohm substitui a imagem externa quebrada. Removidos os inventários obsoletos de fotografias didáticas externas. Formas de onda continuam vetoriais para manter exatidão; diagramas de conceitos mantêm os rótulos originais com acabamento cartoon.
- Prévia `circuitos-cartoon.html` reutiliza os componentes reais e inclui viewport de 390 px por iframe para revisão.

## Validação

Typecheck, testes e build devem ser consultados no CI associado a este commit. Inspeção visual do deploy deve ser confirmada após a publicação. Não foi testado num iPhone físico. Os esquemas são modelos didáticos, não projetos de instalação.
