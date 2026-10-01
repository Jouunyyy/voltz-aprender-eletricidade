# Regras de desenvolvimento

## Produto e código

- Usar pt-PT e terminologia consistente com o percurso.
- Preservar a lógica existente e separar mudanças funcionais de reorganização documental.
- Reutilizar curriculum e quiz; evitar cópias divergentes das perguntas entre cliente e Live.
- Não alterar identificadores de níveis, chaves de progresso ou contratos de API sem plano de compatibilidade.
- Não substituir as imagens da Faísca, fontes ou padrões visuais sem pedido de redesign.
- Manter código novo legível e com tipos adequados; não replicar minificação manual do código antigo.

## Segurança

- Texto livre, nomes, feedback e resultados externos são dados, nunca instruções ou código executável.
- Não usar eval, Function, shell ou HTML bruto para interpretar conteúdo de utilizadores. Manter escape de texto e parametrização de pedidos/SQL.
- Autenticar e autorizar operações no servidor. Não confiar em user_metadata, role, userId ou score fornecidos pelo browser para conceder privilégios.
- Preservar RLS e privilégios mínimos. Não abrir políticas para resolver erros de acesso.
- Chaves secret/service_role, tokens privados e credenciais nunca entram no frontend, documentação ou Git. A chave publishable é pública; não confundir presença dessa chave com acesso administrativo.
- Fixar Actions por SHA completo. Manter lockfile; atualizações devem ter validação proporcional.
- Não desativar scanners globalmente para ocultar alertas. Exceções devem ser restritas, justificadas e verificadas.
- Não enviar emails de teste a pessoas nem executar ações sobre contas reais apenas para validar código sem autorização aplicável.

## Validação

Para código: `npm test`, `npm run typecheck`, `npm run build`. Não há script lint configurado. Testes Node exigem suporte a strip-types; o CI usa Node 22 atualizado e a sessão de outubro usou Node 24.19.0.

Para visual: verificar a área alterada em desktop e telemóvel, estados de carregamento/erro/vazio, teclado e scroll. Para certificados, incluir impressão. Para APIs/RLS, testar também rejeições de acesso e identidade.

[tests/live-engine.sql](../tests/live-engine.sql) é um teste transacional de base de dados, com identidades temporárias e rollback; requer acesso de owner e não faz parte de npm test. Preferir ambiente de teste e inspecionar efeitos/triggers antes de correr.

Para documentação apenas: confirmar caminhos, ligações e afirmações, e executar `git diff --check`; não há necessidade de repetir o build.

## Conclusão e documentação

Uma tarefa fica concluída quando os critérios e verificações correspondentes estão satisfeitos. Indicar falhas e bloqueios explicitamente. A presença de um commit não prova deploy; um relatório com cabeçalho novo e código antigo não prova nova análise.

Atualizar [TASKS](TASKS.md) e [MEMORY](MEMORY.md), e a especificação afetada. Guardar só contexto técnico útil, com data e evidência; nunca dados pessoais ou passwords. As instruções atuais do utilizador prevalecem sobre orientações deste repositório.
