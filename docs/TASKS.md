# Tarefas

Atualizado: 2026-10-24. Backlog não equivale a autorização para executar todas as entradas. Escolher a tarefa em função do pedido atual.

## Pendentes

| ID | Prioridade | Tarefa | Critério de conclusão / dependência |
| --- | --- | --- | --- |
| AUTH-01 | Alta | Em curso: concluir configuração e validação Auth | Código corrigido e testes locais aprovados; faltam acesso administrativo Supabase/Google, conta confirmada e testes reais de login/email. Ver auth-review-2026-10-02.md. |
| SEC-01 | Alta | Esclarecer discrepância do GitGuard | Nova execução comprovadamente sobre código corrigido, com logs/trechos coerentes. O relatório de da62a8d ainda mostrava Math.random antigo; causa não confirmada. |
| SEC-02 | Média | Rever proteção de passwords comprometidas | Confirmar disponibilidade no plano, ativar se aplicável e verificar configuração. Advisor indicava desativada; ferramentas usadas não expunham a alteração. |
| OPS-01 | Média | Concluir publicação MidiaHost, se continuar pretendida | Configurar secret VOLTZ_FTP_PASSWORD por canal seguro, executar workflow e validar destino. GitHub Pages já foi publicado. |
| DATA-01 | Média | Completar reprodução do backend por migrations locais | Inventariar histórico remoto e reconciliar lacunas; reconstruir em ambiente isolado antes de considerar reprodutível. |
| QA-01 | Média | Revisão técnica e pedagógica independente dos 50 níveis | Banco e aulas ampliados em 2026-10-24; falta revisão por profissional qualificado e validação com alunos. Registar responsável/evidência. |
| MEDIA-01 | Média | Verificar disponibilidade das videoaulas | Conferir links, thumbnails, reprodução móvel e estados de ausência para cada entrada do catálogo. |
| SEC-03 | A decidir | Definir integridade exigida para progresso/certificados | Decisão explícita sobre progresso enviado pelo cliente; se necessário, especificar e testar validação de aprendizagem no servidor. |

## Concluído com evidência

- [x] LEARN-01 — 2026-10-24: cinco categorias, 50 casos com solução e erro frequente, 500 perguntas específicas e revisão integrada. 31 testes, typecheck e builds aprovados; CI 40056462984 publicou GitHub Pages e Live v8 foi verificado; ver [registo](learning-review-2026-10-24.md).

- [x] DEP-01 — 2026-10-24: Vite 8.3.5, source-map-js 1.2.2 e Node 22.23.4; audit sem vulnerabilidades conhecidas, 27 testes, typecheck e ambos os builds aprovados localmente. Confirmação do deploy depende do workflow deste commit.

- [x] DOC-01 — Estrutura documental com PRD, arquitetura, regras, design, tarefas, memória, índice e orientações de agentes; ligações locais verificadas nesta alteração.
- [x] SEC-00 — Correções de segurança no commit da62a8d: seis Actions por SHA, Web Crypto, exceção restrita para chave pública e validação partilhada de comandos.
- [x] QA-00 — Na revisão de segurança: 16 testes, typecheck e build aprovados; teste SQL Live passou com rollback.
- [x] OPS-00 — GitHub Pages publicado no run 36932152422; APIs Admin v11, Professores v7 e Live v6 publicadas em 2026-10-01.

## Uso

Ao iniciar, marcar uma tarefa explicitamente como em curso. Ao concluir, anotar data, commit/PR ou outra evidência e resultado da validação. Se bloqueada, indicar dependência concreta. Não remover pendências só para deixar a lista vazia.

## Piloto visual para avaliação

- CARTOON-01 — cinco primeiras perguntas do nível 1 implementadas em amostra independente. 32 testes, typecheck e build local aprovados. Avaliação do utilizador pendente antes de alargar o estilo; ver [registo](cartoon-pilot.md).

- CARTOON-02 — Circuitos completos de série e paralelo implementados para substituir o esquema de emojis no Manual e o diagrama da aula Aprendiz 6. Cabos, bateria e duas lâmpadas; estados independentes com controlos por toque/teclado. Aguardar avaliação visual do utilizador antes de generalizar outros circuitos.

- CARTOON-03 — Gráficos didáticos existentes convertidos para o estilo aprovado, com objetos gerados e ligações em código. Validação e publicação registadas em [cartoon-art-rollout.md](cartoon-art-rollout.md); teste num iPhone físico continua por realizar.

## Correção móvel das aulas

Removido max-height de 285 px que deixava gráficos/laboratórios transbordar sobre o texto. Altura automática e grelha de uma coluna até 900 px, controlos e textos ajustados. Prévia inclui aulas reais com os estilos de produção e seleção dos 50 níveis/8 etapas, sem gravar progresso. Validar em `circuitos-cartoon.html?lessons=1`.

## Certificado: composição e PDF

Faísca completa em WebP; mensagem, QR e assinatura em zonas distintas. Download usa o mesmo DOM do certificado, renderizado a 2800×1750 e colocado numa única página A4 horizontal, preservando cores e proporções independentemente da orientação do telemóvel. html2canvas/jsPDF carregados apenas ao descarregar. Prévia de QA sem validade: `circuitos-cartoon.html?certificate=1`. O PDF contém uma imagem de alta resolução e link de validação clicável; o texto não é selecionável.

## Alinhamento dos símbolos no PDF — 2026-10-25

Exportação desenha os quatro ícones, o raio da marca e o QR diretamente no canvas, a partir das caixas do DOM clonado sem escala. Evita dependência da baseline de emojis e de object-fit/bordas no html2canvas. QR quadrado com margem branca simétrica, sem interpolação; ligação clicável acompanha a sua caixa real. O HTML visível não foi alterado. Typecheck, 34 testes e build locais passaram; confirmar exportação e deploy do commit antes de declarar publicação. Safari físico ainda não testado.
