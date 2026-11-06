# Checklist de homologação e aceite — SEFAZ/CE

Execução obrigatória pela TI e Gestão de Pessoas antes do uso oficial. Usar dados fictícios, contas individuais e backend separado. Marcar resultado, responsável, data e evidência para cada item; itens em aberto impedem declarar produção homologada.

## Infraestrutura e segurança

- [ ] Dependências instaladas com lockfile; build validado no alvo escolhido.
- [ ] Exportação completa restaurada e políticas/grants/funções/triggers conferidos.
- [ ] Acesso automático e concessão provisória admin removidos; conta e sessões compartilhadas revogadas.
- [ ] Perfis, órgão e matrícula aprovados pelo órgão, sem autoconcessão privilegiada.
- [ ] Cada papel acessa somente funções/documentos autorizados; tentativas diretas pela API são recusadas.
- [ ] Avaliador não pode se passar por servidor/comissão; perfil somente leitura não pode assinar como chefia.
- [ ] Autenticação, expiração/renovação, recuperação e CSRF funcionam no endereço de destino.
- [ ] Metadados públicos e logs cumprem política LGPD; segredos não aparecem no navegador ou repositório.
- [ ] Backup e recuperação testados; RPO/RTO, monitoramento e responsáveis aprovados.

## Base e instrumentos

- [ ] Quatro matrículas SEFAZ e seis datas correspondem à fonte, sem inventar datas ausentes.
- [ ] Busca por nome/matrícula preenche o mesmo servidor usado pelo gerenciamento.
- [ ] FAPEP 1 e 2: menu 1 a 6 atualiza a data para todas as seis opções.
- [ ] Trocar servidor mantém número e troca data; escolher número antes do servidor também funciona.
- [ ] Data prevista não altera a hora da assinatura nem substitui cronograma administrativo.
- [ ] Nota vazia, não numérica, negativa e acima de 10 bloqueia ações; 13 notas de 10 totalizam 130 e 100%.
- [ ] Identificação, período e avaliador completos são exigidos; feedback vazio é aceito.
- [ ] FAPEP 2 exige número de par; duplicidade/quantidade de pares é decidida e validada no servidor.
- [ ] FAFEP: médias e conclusão institucional são conferidas; não assumir consolidação automática atual.
- [ ] RAEP e FADA: obrigatoriedade completa e integridade dos campos foram reforçadas.
- [ ] PDF é A4 único, legível, sem corte para conteúdo curto e longo; assinatura no campo correspondente.
- [ ] Documentos salvos não são editáveis pela UI nem pela API; revisão preserva original.

## Prazos e tramitação

- [ ] Configuração do cronograma é a primeira atividade; definição de competência admin/RH aprovada.
- [ ] Ciclo órgão/número tem prioridade correta; ausência de cronograma tem política explícita.
- [ ] Abertura, último dia, vencimento, fuso horário e feriados conferidos em UI, servidor e SQL.
- [ ] Sem conta individual vinculada ao servidor, avaliação não ignora ciência silenciosamente.
- [ ] Ciência e assinatura são coordenadas: gravação sem assinatura não dispara fluxo indevido.
- [ ] Reconsideração em 3 dias úteis; justificativa exigida; resposta chefia/pares em 5 dias úteis.
- [ ] Revisão destaca alteração e mantém valor anterior; concordar encaminha à homologação.
- [ ] Discordância da revisão habilita RAEP em 5 dias úteis.
- [ ] RAEP expirado/duplicado é recusado antes da gravação; criação e vínculo são atômicos.
- [ ] Comissão Setorial decide em 10 dias úteis; uma única prorrogação de 10 com justificativa.
- [ ] Comissão Central tem papel e fluxo completo; recurso em 5, julgamento em 10 e prorrogação única.
- [ ] Concordância tácita tem marco aprovado e job autônomo verificado; ausência de acesso não paralisa expiração.
- [ ] Homologação impede mudança posterior; assinaturas e histórico podem ser auditados.

## Evidências desta preparação

Em 06/11/2026, os testes existentes de domínio e base foram executados: 16 casos aprovados. O preenchimento das seis datas nos FAPEP 1/2 e a troca de servidor foram verificados anteriormente na interface. Não houve, nesta preparação, novo teste integral de todos os perfis, restauração do banco, deploy interno ou validação jurídica. O checklist não é preenchido automaticamente por esses testes unitários.