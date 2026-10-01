# Revisão de segurança — 1 de outubro de 2026

Base: commit 201a44c7a9b29a8e4076e9cec54ab79917fdd9bb e relatório GitGuard cmuq2ae5k036zhcdmspuce1d8.

## Os oito alertas

- Seis referências de GitHub Actions fixadas nos SHA completos, resolvidos junto dos repositórios originais.
- Baralhamento das perguntas passou a usar Web Crypto com rejection sampling, sem viés de módulo. O uso anterior não gerava credenciais.
- A chave do cliente é `sb_publishable_`, pública por definição, não um segredo. Documentada e incluída numa exceção Gitleaks restrita ao valor exato e ao ficheiro; nenhuma regra global desativada. Não foi revogada. Um scanner que ignore a configuração do repositório pode continuar a assinalá-la. https://supabase.com/docs/guides/api/api-keys

## Texto e comandos

Não foi encontrada integração LLM, avaliação de código, shell ou inserção de HTML bruto nos componentes analisados. Texto livre é renderizado pelo React; os emails existentes escapam nomes. Não se deve transformar feedback em instruções privilegiadas se futuramente for adicionada IA.

As APIs Admin, Professores e Live verificam identidade com Supabase Auth. Foram reforçadas com leitura JSON limitada por bytes durante o streaming, validação de objeto, lista explícita de ações, rejeição de campos superiores inesperados e de chaves de protótipo. Pedidos malformados recebem 400, tamanho excessivo 413 e formato errado 415. Texto livre não é filtrado por palavras: SQL, HTML e instruções mantêm-se dados, sem selecionar comandos. As verificações de papel e pertença existentes são preservadas.

Na base de dados em produção: todas as nove tabelas públicas têm RLS; user_roles tem apenas política SELECT própria. RPCs administrativos, professores, certificados e Live não permitem EXECUTE a anon/authenticated. Chamadas com identidade sem papel foram rejeitadas por Admin e Professores. Não foram alteradas políticas nem dados reais.

## Validação e limites

16 testes automáticos: pedidos malformados, tamanho UTF-8, comandos arbitrários, tentativa de identidade e papel falsos, texto malicioso inerte, handlers reais com Auth/REST simulados e consistência das respostas dos 50 níveis. Typecheck e build aprovados. O projeto não tem linter configurado. GitGuard/Gitleaks não foram executados novamente nesta sessão.

Supabase Advisor assinala proteção de palavras-passe comprometidas desativada. Não é possível alterar essa configuração com as ferramentas Supabase disponíveis. Os avisos informativos de tabelas com RLS sem políticas correspondem a acesso exclusivo do servidor, não a tabelas abertas.

Esta revisão cobre os alertas e os caminhos de entrada/comandos examinados; não constitui garantia de ausência de todas as vulnerabilidades. O progresso individual continua a ser enviado pelo cliente: esta arquitetura não é uma certificação antifraude de aprendizagem.
