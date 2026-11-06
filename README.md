# Estágio Probatório — SEFAZ/CE

Aplicação de avaliação e gerenciamento do estágio probatório, com referência ao Decreto nº 36.773/2025. **Versão funcional para homologação; não liberada para produção institucional.**

## Comece pela documentação

- [Especificação técnica, requisitos e regras](docs/ESPECIFICACAO_TECNICA.md).
- [Guia de implantação e transferência](docs/GUIA_IMPLANTACAO.md).
- [Checklist de homologação e aceite](docs/CHECKLIST_HOMOLOGACAO.md).
- [Inventário do banco e dependências](docs/INVENTARIO_DADOS.md).

## Organização

| Diretório | Responsabilidade |
| --- | --- |
| `src/domain/` | Regras puras, agregados DDD e testes de prazos/notas/transições |
| `src/lib/` | Funções de aplicação, PDF, calendário e base compartilhada |
| `src/components/` | Formulários, documentos e painéis |
| `src/hooks/` | Sessão, etapa vigente e assinaturas |
| `src/routes/` | Navegação, página principal e conferência pública |
| `src/integrations/` | Autenticação e acesso aos serviços de dados |
| `drizzle/migrations/` | Alterações incrementais; **não constituem instalação completa do banco** |
| `scripts/` | Preparação segura do pacote de transferência |

## Desenvolvimento

Use Bun compatível com `bun.lock` e Node.js LTS compatível com as dependências. Configure um ambiente de homologação separado conforme o guia.

```sh
bun install --frozen-lockfile
bun run dev
bunx vitest run src/domain/domain.test.ts src/lib/servidores.test.ts
```

O build externo é `bun run build`; seu alvo de hospedagem precisa ser validado pela TI. `bun run preview` não é um servidor de produção institucional.

## Pacote de transferência

```sh
python3 scripts/preparar-entrega.py /tmp/estagio-probatorio-sefaz-entrega
```

O destino deve ser inexistente e ficar fora deste repositório. O script exclui configurações locais, dependências, saídas geradas, metadados e concessões administrativas provisórias. Na **cópia de entrega**, remove o acesso automático compartilhado, sem alterar o aplicativo em uso. Leia o manifesto gerado e inspecione a listagem antes de arquivar. A criação de um repositório privado no GitHub é feita pelo proprietário em Configurações do projeto → Git; este pacote não foi publicado automaticamente.

## Alertas

- O acesso automático compartilhado ainda existe no aplicativo de origem; deve ser retirado e a conta revogada antes do uso oficial. Não distribua a árvore original sem a revisão de segurança.
- A exportação completa do banco é separada. O código e a tipagem não recriam o backend por si sós.
- Comissão Central, feriados integrados, atomicidade do RAEP e reforço das regras no servidor são pendências descritas no caderno.
- Não existe licença pública definida neste projeto. O titular e o órgão devem formalizar as condições de cessão, acesso, manutenção e distribuição; não foi atribuída licença automaticamente.
