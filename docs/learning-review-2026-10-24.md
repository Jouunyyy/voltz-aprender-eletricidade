# Evolução das cinco categorias — 2026-10-24

## Alteração

50 unidades, mantendo os IDs e as chaves de progresso existentes. Cada unidade acrescenta contexto, caso aplicado, raciocínio resolvido e erro frequente. O desafio usa dez perguntas escritas para o nível, com três opções e explicação: 500 perguntas no total. Deixa de usar objetivos e frases de outros níveis como distratores genéricos.

| Categoria | Ênfase da revisão |
| --- | --- |
| Aprendiz | Grandezas, unidades, cálculos, circuitos e interpretação de modelos |
| Ajudante | Escolha e estado de ferramentas, medições, cabos, ligações e bancada |
| Instalador | Plantas, comandos, tomadas, queda de tensão e verificações |
| Técnico | Coordenação de proteções, diferenciais, terra, corte e distribuição |
| Especialista | Hipóteses, medições contextualizadas, diagnóstico e relatório |

As aulas passam de seis para oito etapas. Mantêm os laboratórios e diagramas existentes, acrescentando caso aplicado, erro frequente e revisão final das ideias-chave. A solução é revelável e reinicia fechada ao trocar de etapa. A regra 8/10, XP, progresso, certificados, Auth e papéis não foram alterados. Não se reiniciou progresso de utilizadores.

O frontend e a função Live importam o mesmo banco. Salas já criadas conservam as perguntas que ficaram guardadas quando foram criadas; salas novas usam a versão publicada do banco.

## Verificação técnica

- Typecheck aprovado.
- 31 testes aprovados em Node 22.23.4: cobertura exata dos 50 IDs, dez perguntas por nível, opções distintas, explicações presentes, manutenção das respostas após baralhamento e banco não mutado.
- Cálculos de referência conferidos por operações independentes nos testes.
- Handler Live exercitado com Auth/RPC simulados: cinco seleções de categoria e 50 seleções de nível; ignora perguntas injetadas no pedido.
- Build GitHub Pages aprovado. O bundle principal passou a cerca de 615 kB (187 kB gzip); Vite avisa acima de 500 kB, sem impedir o build. Separação de bundles fica fora desta alteração de conteúdo.
- Não foram alterados schema, RLS, papéis ou credenciais.
- Build adicional com base `/` aprovado localmente; FTPS MidiaHost não publicado por falta da configuração secreta existente.
- Código publicado no commit `a74964066554afaf28c245e5db8d1f7d4fed61ff`; [CI 40056462984](https://github.com/Jouunyyy/voltz-aprender-eletricidade/actions/runs/40056462984) concluiu typecheck, testes, build e deploy GitHub Pages com sucesso.
- Verificação HTTP: JS `index-Dn3gtv0_.js` e CSS `index-DHJddXc8.css` publicados são byte a byte iguais a um build em checkout limpo. O primeiro build no diretório de trabalho incluía classes detetadas em artefactos locais não versionados; a comparação final usou apenas o checkout publicado.
- Live versão 8 ACTIVE: os 11 ficheiros publicados coincidem com as fontes verificadas; manteve autenticação própria do handler e configuração anterior. OPTIONS 200 e pedido sem sessão 401.
- Teste Live autenticado no navegador: criar sala de cinco perguntas do nível Aprendiz 1, iniciar, responder, receber 1000 pontos e explicação correta; terminar a sala pelo comando normal. Não se apagaram respostas nem outros dados.
- Inspeção no Chrome desktop (viewport com 1363 px): casos aplicados de Aprendiz 1, Ajudante 6, Instalador 8, Técnico 3 e Especialista 10. Soluções reveladas, navegação e revisão final de dez ideias verificadas; ausência de overflow horizontal nas aulas inspecionadas. Não foi executada uma passagem manual pelas 500 perguntas novas.
- Confirmado que sair de uma etapa e regressar volta a fechar a solução. Confirmado desafio individual com pergunta nova e feedback correto. O progresso permaneceu em 50/50 e 12 500 XP após reload e os testes.
- Security Advisors: 22 ocorrências INFO de RLS sem políticas e um WARN de proteção contra passwords comprometidas desativada. Não há alterações de base de dados nesta intervenção; não se declarou o projeto sem avisos. [Aviso RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) e [proteção de passwords](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Referências consultadas e limites

Referências usadas para conferir distinções técnicas, não para reproduzir texto ou declarar conformidade de uma instalação:

- [DGEG — CTE 64](https://www.dgeg.gov.pt/pt/areas-setoriais/energia/energia-eletrica/atividade-normativa/cte-64/).
- [RTIEBT — texto consolidado](https://diariodarepublica.pt/dr/legislacao-consolidada/portaria/2006-70055500).
- [Fluke — continuidade](https://www.fluke.com/en-us/learn/blog/electrical/what-is-continuity).
- [Schneider Electric — coordenação entre disjuntores](https://www.electrical-installation.org/enwiki/Coordination_between_circuit-breakers).
- [Schneider Electric — associação de dispositivos de proteção](https://www.electrical-installation.org/enwiki/Practical_values_for_a_protective_scheme).

Valores de exercícios são modelos com hipóteses explícitas. Um critério numérico fornecido num exercício não é apresentado como limite universal. Distingue-se RCCB de RCBO, seletividade de retaguarda, continuidade de isolamento e indício de causa confirmada. Não se ensina a eliminar proteções para contornar avarias.

A revisão automatizada não substitui avaliação técnica por profissional qualificado nem estudo de eficácia pedagógica com alunos. QA-01 mantém essa pendência. Não se afirma teste em Safari/iPhone físico nem certificação profissional dos conteúdos.
