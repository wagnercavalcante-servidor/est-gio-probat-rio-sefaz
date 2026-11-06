# Inventário de dados e dependências — SEFAZ/CE

Levantamento de 06/11/2026, baseado no código e metadados disponíveis. Não inclui dados individuais, senhas, chaves, IDs de projeto ou exportação completa do banco. As definições efetivas e privilégios devem ser obtidos/revisados na exportação oficial.

## Entidades

| Tabela | Conteúdo | Relações/observações |
| --- | --- | --- |
| `servidores` | Nome, matrícula, órgão, cargo, exercício, vínculo e `datas_avaliacoes` JSON com seis datas ISO | Base única dos instrumentos e gerenciamento; matrícula identifica servidor; quatro registros importados nesta cópia |
| `profiles` | Nome, e-mail, órgão e matrícula de usuário | Liga conta autenticada à avaliação; dados editáveis exigem validação institucional |
| `user_roles` | Papéis atribuídos ao usuário | Separada de profile; revisar concessões e funções auxiliares |
| `formularios` | Tipo, servidor, órgão, número, JSON `dados`, pontuação, autor e timestamps | Contém estado, ciência, prazo, revisão, homologação, vínculo RAEP, código e marcador legado de teste |
| `assinaturas` | Documento, usuário, tipo, nome, matrícula, perfil, e-mail e timestamp | Relacionada a formulário; bloqueio de alteração; não é certificado ICP-Brasil |
| `ciclos_avaliacao` | Nome, órgão/número opcional, ativo, autor e marcador de teste | Abrange geral ou órgão/avaliação |
| `ciclo_etapas` | Ciclo, etapa, início/fim e timestamps | Dez etapas cadastráveis |

O modelo existente contém relações com contas gerenciadas de autenticação. Ao adaptar para outro serviço, revisar/remapear essas relações; não aplicar o esquema sobre autenticação incompatível.

## Papéis e etapas

Enum `app_role`: `admin`, `gestao_pessoas`, `comissao`, `avaliador` (legado), `chefia_imediata`, `chefia_mediata`, `par`, `servidor`. Não existe papel específico da Comissão Central neste levantamento.

Enum `etapa_avaliacao`: `avaliacao_chefia`, `avaliacao_pares`, `ciencia_servidor`, `pedido_reconsideracao`, `resposta_chefia`, `ciencia_resposta_chefia`, `recurso_comissao_setorial`, `resposta_comissao_setorial`, `ciencia_resposta_setorial`, `recurso_comissao_central`.

## Funções, gatilhos e políticas a preservar/revisar

RPCs usadas pelo aplicativo: `listar_orgaos`, `expirar_prazos_avaliacao`, `verificar_documento`.

Dependências SQL observadas: `prazo_dias_uteis`, `prazo_etapa`, `preparar_fluxo_formulario`, `validar_alteracao_formulario`, `bloqueia_alteracao_assinatura`, `update_updated_at_column`, `handle_new_user`, `usuario_tem_papel`, `orgao_do_usuario`, funções privadas de papel/visibilidade e objetos legados de teste. A função de prazo SQL exclui fins de semana, mas não integra feriados.

Gatilhos: criação de profile/papel na conta; preparação do fluxo ao inserir; validação de alteração/exclusão de formulário; bloqueio de assinatura; timestamps de ciclos/etapas. Há concessão provisória de admin por e-mail na origem, que deve ser removida antes do uso oficial, não reproduzida no destino.

Políticas observadas: leitura por autor/servidor/perfis amplos; atualização por servidor, autor da revisão e comissão/admin conforme estado; ciclos/etapas escritos por admin; servidores somente leitura no aplicativo; assinatura inserida pelo usuário com acesso ao documento. Essas políticas não comprovam, sozinhas, validação de conteúdo, prazos, papel correto para cada assinatura ou escopo institucional completo. Revisar também grants, search_path, permissões EXECUTE e funções do schema privado.

## Migrações versionadas

- `0000_admin_conta_provisoria.sql`: mecanismo administrativo provisório, excluído do pacote de transferência.
- `0001_gatilhos_novo_usuario.sql`: no pacote sanitizado mantém apenas criação do usuário; concessão provisória de admin é removida.
- `0002_servidores_datas_avaliacoes_planilha.sql`: acrescenta datas à tabela existente; não cria a tabela nem exporta os quatro registros.

**Não existe baseline completo no repositório.** Não reconstruir segurança por inferência da tipagem gerada. Obter exportação oficial, revisar dependências, separar dados pessoais e validar restauração. Artefatos e snapshots Drizzle não substituem essa etapa.

## Integrações e operação

Gerenciamento não depende mais de Google Sheets. Não há buckets de armazenamento identificados nos metadados consultados; o formulário RAEP tem texto de razões/provas, não fluxo de upload implementado. Não há comprovação de job periódico autônomo; a expiração também é solicitada ao carregar sessão. E-mails transacionais do fluxo estão suspensos; provedores de autenticação, remetente e configurações devem ser inventariados no ambiente, não deduzidos dos arquivos.