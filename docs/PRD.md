# PRD — Voltz: Aprender Eletricidade

## Objetivo

Ensinar fundamentos de eletricidade e segurança elétrica através de aulas visuais, exercícios e progressão, em português de Portugal. A experiência deve ser clara no telemóvel e no computador, com a mascote Faísca a acompanhar a aprendizagem.

## Utilizadores

| Perfil | Necessidades |
| --- | --- |
| Aluno/utilizador | Aprender, praticar, retomar progresso e consultar o certificado |
| Professor | Organizar turmas, acompanhar dificuldades e recomendar níveis |
| Administrador | Gerir acessos, escolas, feedback, denúncias e operação |
| Visitante com código | Consultar a validação pública limitada de um certificado |

## Funcionalidades implementadas no código

- Autenticação e perfil; progresso sincronizado por conta.
- Manual de iniciação e percurso com cinco categorias de dez níveis: Aprendiz, Ajudante, Instalador, Técnico e Especialista.
- Aulas visuais e desafios de dez perguntas. Aprovação com pelo menos oito respostas certas à primeira tentativa; revisão após erro não apaga o erro da nota.
- XP, progressão e apresentação do estado de aprendizagem.
- Videoaulas organizadas por pares de níveis e registo de progresso. Ter catálogo no código não confirma disponibilidade de todos os vídeos externos.
- Voltz Live com salas autenticadas, anfitrião, perguntas, respostas e classificação calculada no servidor; ver [especificação](voltz-live.md).
- Professores: turmas, associação de alunos, estatísticas e recomendações.
- Admin: utilizadores/papéis, escolas, estatísticas, avaliações, feedback, denúncias e estado operacional.
- Certificados: pedido de emissão, consulta própria, impressão e validação pública por código. O cliente considera o manual concluído e os 50 níveis; a emissão tem validação adicional no servidor.
- Avaliação da experiência; emails de aprendizagem com consentimento e email transacional de certificado.

## Critérios de aceitação

1. O aluno consegue entrar, concluir um desafio, sair e recuperar o progresso da mesma conta.
2. Aprovação, respostas corretas e XP mantêm as regras implementadas; um novo baralhamento preserva a resposta correta.
3. Um utilizador comum não obtém poderes de professor/admin por alterar o navegador, metadados ou texto de um formulário.
4. No Live, o anfitrião controla a sessão e o servidor protege pontuação, prazo e resposta correta antes da revelação.
5. Erros de rede têm mensagem e possibilidade de recuperação; não são apresentados como operações concluídas.
6. Interface utilizável em telemóvel, teclado e desktop; certificado legível no ecrã e impressão.
7. Conteúdo didático distingue simulação de intervenção real e não apresenta o certificado como habilitação profissional.

## Limites e evolução

Não há integração LLM identificada no código analisado. O progresso individual é enviado pelo cliente; a plataforma não deve ser apresentada como avaliação antifraude. A presença de 50 níveis não equivale a revisão pedagógica integral. Melhorias propostas e bloqueios estão em [TASKS](TASKS.md); não são compromissos implementados.
