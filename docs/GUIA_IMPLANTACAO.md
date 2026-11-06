# Guia de implantação e transferência — SEFAZ/CE

Versão 2 — 06/11/2026. Público: equipe de TI, segurança da informação e Gestão de Pessoas. Este guia acompanha a especificação; não é certificação jurídica nem autorização de produção.

## 1. O que está sendo entregue

Código React 19/TypeScript/TanStack Start, regras DDD, testes, formulários e documentos. Mantida a organização atual para evitar refatoração sem cobertura suficiente. O pacote não contém credenciais, dados exportados do banco, contas de usuários ou uma instalação completa da infraestrutura. A cópia preparada pelo script exige login individual; o aplicativo de origem permanece com o acesso provisório solicitado anteriormente.

## 2. Decisão de hospedagem

**Alternativa A — homologar usando os serviços atuais:** menor adaptação, mas exige autorização institucional para uso da nuvem, custos, localização/tratamento de dados e acesso aos serviços.

**Alternativa B — instalar na infraestrutura do órgão:** exige destino compatível com TanStack Start, serviços de autenticação e API de dados compatíveis ou adaptação da integração. Instalar somente PostgreSQL não atende as chamadas de login, sessão, API e RPC do código. A TI deverá estimar esse trabalho; não há Dockerfile nem alvo de produção interno validado nesta entrega.

A configuração Vite atual usa `@lovable.dev/vite-tanstack-config` e alvo padrão de hospedagem da plataforma. Ao escolher outro destino, validar o suporte do adaptador oficial, preservar `src/server.ts`, `src/start.ts`, autenticação e proteção CSRF. Não trocar o roteador nem remover o servidor para tratar a aplicação como arquivos estáticos.

## 3. Ambiente e configuração

1. Criar ambientes separados de desenvolvimento, homologação e produção; não apontar a cópia da TI para dados oficiais durante os testes.
2. Instalar Bun compatível com o lockfile e Node.js LTS compatível com Vite/TanStack; registrar as versões utilizadas no aceite.
3. Instalar dependências: `bun install --frozen-lockfile`.
4. Criar configuração local a partir de `.env.example`, usando valores do ambiente **de destino**, sem copiar valores do projeto original.
5. Configurar autenticação individual, domínios de redirecionamento, política de senha, recuperação e validação dos perfis pelo órgão.
6. Provisionar o backend completo antes de executar ações persistentes; conferir inventário e dependências SQL.
7. Executar `bun run dev`, testes e `bun run build` no ambiente da TI. O comportamento publicado deve ser testado, não apenas o ambiente de desenvolvimento.

### Variáveis identificadas no código

| Nome | Uso e tratamento |
| --- | --- |
| `VITE_SUPABASE_URL` | Endereço da API de dados/autenticação de destino; configuração pública do cliente |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública de destino; nunca usar chave administrativa aqui |
| `SUPABASE_URL` | Endereço usado no servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública usada na validação do servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas servidor, se houver operação privilegiada; não é disponibilizada pela Lovable Cloud, e deve ser provisionada no destino conforme a solução escolhida |
| `LOVABLE_CRON_SECRET` / `LOVABLE_CRON_SECRET_PREVIOUS` | Somente se a integração de cron correspondente for implantada; presença do helper não comprova agendamento |
| `LOVABLE_DB_MIGRATION_URL` | Uso local da ferramenta Drizzle, não do navegador; configuração existente não é um bootstrap completo |

Segredos de destino devem ficar em cofre institucional; não compartilhar por e-mail, chat ou repositório. Variáveis `VITE_*` entram no código distribuído ao navegador. Configuração de autenticação/provedores não é restaurada apenas com arquivos do código.

## 4. Banco: exportação separada

As três migrações locais pressupõem banco existente. `drizzle/schema.ts` não é o esquema completo. **Não executar `drizzle push` nem aplicar os SQL como instalação de banco vazio.**

O proprietário deve abrir **More → Database → Manage → Settings → Export project data → Export data → Database → Export → Start export**. O arquivo é disponibilizado por link enviado por e-mail ou em More → Storage. A exportação inclui estrutura, dados e contas com hashes de senha; deve ser transportada por canal seguro, com acesso mínimo e retenção controlada. Não a anexar ao GitHub.

A exportação não inclui segredos, configurações dos provedores de login nem arquivos de armazenamento. Limites informados pela plataforma: banco até 15 GB, arquivo até 5 GB e uma exportação por 24 horas. O backend precisa estar em execução. Não foi realizada exportação completa nesta entrega.

A TI deverá revisar os objetos `public` e dependências de segurança, restaurar em homologação compatível e tratar schemas gerenciados conforme a solução de destino. Se usar outro serviço de autenticação, planejar remapeamento de IDs, sessões e senhas; não inventar contas ou copiar credenciais compartilhadas.

## 5. Segurança obrigatória antes de produção

- Remover login automático, revogar a conta compartilhada e suas sessões; a cópia de entrega remove o trecho de código, mas não revoga a conta do backend de origem.
- Remover gatilho/função de concessão administrativa por e-mail autorizado; atribuir administrador por procedimento institucional auditável.
- Submeter perfis privilegiados e matrícula/órgão a validação institucional, sem confiar em informações editáveis fornecidas no cadastro.
- Auditar RLS, GRANT, SECURITY DEFINER e políticas de assinatura. Acesso à interface não equivale a autorização no servidor.
- Validar prazo, papel, estado, conteúdo e assinatura na mesma operação transacional; impedir chamada direta que contorne o formulário.
- Definir política LGPD, logs, retenção, recuperação, cópias e nível de assinatura eletrônica aceito pelo órgão.
- Revisar a consulta pública: ela revela metadados mínimos e nomes dos signatários; não tratar como dado totalmente anônimo.

## 6. Homologação, operação e reversão

Executar o checklist com contas individuais de cada papel, incluindo testes negativos e ações concorrentes. Resolver os bloqueadores de produção listados na especificação. TI e Gestão de Pessoas registram evidências e assinam termo de aceite; jurídico valida regras e modelos do decreto.

Na entrada em produção: backup verificado, migrações revisadas, período de manutenção, configuração de domínio HTTPS, monitoramento e responsáveis por incidentes. Definir RPO/RTO, metas de desempenho e disponibilidade em acordo próprio; nenhuma meta foi comprovada por este protótipo.

Reversão: preservar versão anterior do código e backup compatível do banco; restauração pode perder alterações posteriores. Testar recuperação em ambiente separado e não prometer reversão automática. Na Lovable Cloud, backups diários cobrem banco, não armazenamento, e não constituem recuperação ponto-a-ponto.

## 7. GitHub e cessão

O titular conecta o projeto por Configurações do projeto → Git. A conexão cria repositório novo e privado; não conecta repositório já existente. Antes de sincronizar a árvore original, revisar/remover credenciais e concessões administrativas provisórias também no histórico e revogar a conta. O pacote sanitizado pode ser entregue à TI para importação manual em repositório institucional privado. Não foi estabelecida conexão nem publicação no GitHub por este trabalho.

Formalizar titularidade, licença/termo de cessão, responsáveis por manutenção, suporte, custos e propriedade dos dados. Inventariar licenças das dependências; não assumir que todas tenham as mesmas condições de distribuição.