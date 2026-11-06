# CADERNO DE ESPECIFICAÇÃO TÉCNICA E FUNCIONAL
**Sistema Informatizado de Avaliação Especial de Desempenho em Estágio Probatório**
*Referência normativa: Decreto Estadual nº 36.773/2025 – Governo do Estado do Ceará*

**Versão 2 — SEFAZ/CE — 06/11/2026.** Preparado para transferência e homologação institucional. As regras descritas como normativas/requeridas devem ser validadas pela Gestão de Pessoas e assessoria jurídica contra o texto e anexos oficiais. Não há certificação de conformidade integral. Funcionalidades parciais e bloqueadores estão explicitados nas seções 12 a 16. A documentação técnica não libera esta versão para uso em produção.

---

## SUMÁRIO

1. Apresentação e Objetivo
2. Arquitetura Tecnológica e Requisitos Não Funcionais
3. Matriz de Perfis e Controle de Acesso (RBAC)
4. Módulo do Cronograma de Etapas (Motor de Prazos)
5. Formulários Oficiais do Decreto nº 36.773/2025
6. Fluxo de Trabalho, Tramitação e Regras de Negócio
7. Assinatura Eletrônica e Autenticidade Pública
8. Módulo de Inteligência Gerencial (BI)
9. Ambiente de Homologação e Simulação
10. Modelagem Orientada a Domínio (DDD)
11. Recomendações para Implantação (Equipe de TI)
12. Requisitos funcionais rastreáveis e critérios de aceite
13. Estados, regras e lacunas de implementação
14. Segurança, proteção de dados e requisitos operacionais
15. Transferência, testes e pendências prioritárias
16. Dicionário dos instrumentos e fontes de verdade

---

## 1. APRESENTAÇÃO E OBJETIVO

### 1.1 Finalidade
Consolidar a especificação funcional e a arquitetura técnica para implementação, sustentação e implantação do sistema nos órgãos e entidades da Administração Pública Estadual Direta, Autárquica e Fundacional do Ceará, substituindo a tramitação em papel e garantindo celeridade, integridade, transparência e observância dos prazos legais.

### 1.2 Base Normativa
* Decreto Estadual nº 36.773/2025 – avaliação especial de desempenho para aquisição de estabilidade.
* Lei Estadual nº 9.826/1974 – Estatuto dos Funcionários Públicos Civis do Estado do Ceará.
* Lei Federal nº 13.709/2018 (LGPD).
* Lei Federal nº 14.063/2020 – assinaturas eletrônicas na administração pública.

---

## 2. ARQUITETURA TECNOLÓGICA E REQUISITOS NÃO FUNCIONAIS

```text
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                   │
│      React 19 | TypeScript | Tailwind CSS | TanStack Router │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / RPC
┌──────────────────────────────▼──────────────────────────────┐
│               CAMADA DE APLICAÇÃO E DOMÍNIO                 │
│  Server Functions | Validação Zod | Domínio DDD (src/domain)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Conexão segura / RLS
┌──────────────────────────────▼──────────────────────────────┐
│                       CAMADA DE DADOS                       │
│     PostgreSQL | Row-Level Security | Trilha de Auditoria   │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend**: React 19 + TypeScript, TanStack Start/Router, Tailwind CSS; geração de PDF em página A4 única (794 × 1123 px) fiel ao formulário preenchido.
* **Backend**: funções de servidor tipadas com validação Zod e autenticação por token Bearer.
* **Banco de dados**: PostgreSQL com Row-Level Security; um órgão nunca acessa registros de outro (exceto administração, Gestão de Pessoas central e comissões).
* **Requisitos não funcionais a contratar/validar**: disponibilidade, desempenho, rastreabilidade, segurança e suporte a navegadores modernos/dispositivos móveis. Não há SLA comprovado, assinatura criptográfica certificada ou garantia técnica de não repúdio nesta versão.

---

## 3. MATRIZ DE PERFIS E CONTROLE DE ACESSO (RBAC)

Os papéis ficam em tabela própria (`user_roles`), nunca no cadastro do usuário, e são verificados no servidor por função `SECURITY DEFINER`.

| Papel | Atribuições | Escopo |
| :--- | :--- | :--- |
| Administrador Geral | Cadastro de órgãos, cronogramas, acessos e ambiente de testes | Todos os órgãos |
| Gestão de Pessoas (COGEP/RH) | Cronogramas locais, monitoramento de prazos, consulta somente leitura do FAPEP 1/2 | Próprio órgão |
| Avaliador – Chefia Imediata | Notas do FAPEP 1, feedback, assinatura, decisão sobre reconsideração | Subordinados diretos |
| Avaliador – Chefia Mediata | Acompanhamento gerencial e validação complementar | Subunidade |
| Avaliador – Par | Notas do FAPEP 2 | Servidores designados |
| Servidor Avaliado | Ciência, concordância, reconsideração, RAEP | Própria avaliação |
| Comissão Setorial | Julgamento em 1ª instância, parecer e homologação | Órgão de atuação |
| Comissão Central | Julgamento em 2ª e última instância | Processos em recurso central |

No cadastro, o usuário escolhe perfil e órgão; a busca de servidores só retorna nomes do órgão escolhido.

**Situação desta cópia:** o acesso inicial está provisoriamente automático e compartilhado com privilégios administrativos. Não demonstra segregação real de usuários. Os papéis existentes estão no inventário de dados; Comissão Central não tem papel operacional separado. A matriz acima descreve o objetivo institucional, não prova todas as restrições atuais. Cadastro de órgão/perfil/matrícula deve passar por aprovação institucional antes de uso oficial; metadados editáveis de cadastro não são evidência de autorização.

---

## 4. MÓDULO DO CRONOGRAMA DE ETAPAS (MOTOR DE PRAZOS)

### 4.1 Papel Centralizador
O fluxo institucional começa pela definição das janelas por Gestão de Pessoas/Administrador, conforme competência a aprovar. **Na implementação atual, somente administrador escreve ciclos e etapas.** Delegação à Gestão de Pessoas é requisito a ajustar. O FAPEP verifica a janela na interface, mas não há comprovação de bloqueio obrigatório de toda ação no servidor.

### 4.2 Etapas Parametrizáveis

| # | Identificador | Descrição | Executor |
| :---: | :--- | :--- | :--- |
| 1 | `avaliacao_chefia` | Preenchimento e assinatura do FAPEP 1 | Chefia Imediata |
| 2 | `avaliacao_pares` | Preenchimento e assinatura do FAPEP 2 | Pares |
| 3 | `ciencia_servidor` | Ciência da avaliação | Servidor |
| 4 | `pedido_reconsideracao` | Pedido fundamentado de revisão | Servidor |
| 5 | `resposta_chefia` | Análise e decisão da reconsideração | Chefia / Pares |
| 6 | `ciencia_resposta_chefia` | Ciência da decisão da chefia | Servidor |
| 7 | `recurso_comissao_setorial` | RAEP em 1ª instância | Servidor |
| 8 | `resposta_comissao_setorial` | Julgamento colegiado setorial | Comissão Setorial |
| 9 | `ciencia_resposta_setorial` | Ciência da decisão setorial | Servidor |
| 10 | `recurso_comissao_central` | Recurso à Comissão Central | Servidor |

### 4.3 Regras de Operação
1. **Hierarquia de calendários**: cronograma específico do órgão/número da avaliação prevalece; sem ele, aplica-se o cronograma geral; sem datas, aplicam-se os prazos legais em dias úteis.
2. **Bloqueio**: antes do início, *"Etapa não iniciada"*; após o fim, *"Prazo regulamentar encerrado"* (somente leitura).
3. **Rotina automática**: verificação periódica de prazos expirados, disparando concordância tácita e preclusão.
4. **Linha do tempo visual**: etapa vigente, etapas futuras e etapas encerradas identificadas por cor.

**Limitações atuais:** etapa sem datas não bloqueia preenchimento; definir explicitamente a política de cronograma obrigatório. A expiração é solicitada ao carregar a sessão, mas não foi confirmado um job periódico independente. A função SQL de dias úteis exclui finais de semana, sem feriados; o domínio aceita feriados, porém não está integrado a um cadastro institucional único. Corrigir divergências de prazo e fuso antes da produção.

---

## 5. FORMULÁRIOS OFICIAIS

* **FAPEP 1 – Chefia Imediata**: identificação (nome, matrícula, cargo, órgão, lotação, período); requisitos, critérios, descrição legal do critério, nota; campo opcional *Considerações/Justificativa/Feedback*; total e percentual automáticos; assinatura no campo "Assinatura do Chefe Imediato". Salvar, baixar e assinar ficam bloqueados até que todos os campos obrigatórios estejam preenchidos. O PDF não traz a parte da comissão antes da homologação.
* **FAPEP 2 – Pares**: mesma estrutura, com número do par avaliador.
* **Número, data e período da avaliação (FAPEP 1/2)**: menu suspenso com as avaliações 1 a 6. Escolher o número preenche **Período de** e **Período até**: na primeira avaliação, início é a admissão/início do exercício e fim é a primeira data da base; nas avaliações 2 a 6, início é o dia corrido seguinte à data da avaliação anterior e fim é a data da avaliação selecionada. A Data da avaliação mantém o preenchimento já existente com a data correspondente da base (`avaliador.data`), sem alterar a data/hora efetiva da assinatura. Trocar o servidor recalcula os campos mantendo o número selecionado; selecionar o número antes do servidor também é suportado. Datas ausentes/inválidas nos períodos ficam vazias, sem estimar término semestral; os campos permanecem editáveis. O JSON salvo e o PDF usam `periodoInicio`/`periodoFim` do formulário.
* **FAFEP – Avaliação Final**: campos para registrar notas parciais, médias, parecer e conclusão (na tela, Aprovado/Reprovado). O preenchimento é manual; consolidação automática e limiar legal de aprovação não estão implementados/comprovados.
* **RAEP – Recurso**: identificação, destinatária Setorial/Central, avaliação objeto, razões/provas em texto, local e data. Não há upload de anexos implementado; selecionar Central não cria tramitação de segunda instância.
* **FADA – Acompanhamento e Desenvolvimento**: ocorrências, orientações, planos de alinhamento e capacitações.

---

## 6. FLUXO DE TRABALHO E REGRAS DE NEGÓCIO

### 6.1 Diagrama Sequencial

```text
       [0. Configuração do Cronograma do Ciclo]
 (Gestão de Pessoas / COGEP define datas e prazos no sistema)
                        │
                        ▼
             [1. Avaliação Inicial]
  (Chefia Imediata - FAPEP 1 / Pares - FAPEP 2)
                        │
                        ▼
       [2. Notificação e Ciência do Servidor]
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
  [Concordância com a Nota]   [Pedido de Reconsideração]
  (Expressa ou Tácita)        (Prazo: 3 dias úteis)
            │                       │
            │                       ▼
            │         [Análise da Reconsideração]
            │         (Chefia e Pares: até 5 dias úteis)
            │         (Alterações em destaque visual âmbar)
            │                       │
            │           ┌───────────┴───────────┐
            │           ▼                       ▼
            │     [Concordância]         [Recurso RAEP]
            │           │          (Comissão Setorial: até 5 dias úteis)
            │           │                       │
            │           │                       ▼
            │           │            [Julgamento Setorial]
            │           │            (10 dias úteis + 10 prorrogáveis)
            │           │                       │
            │           │           ┌───────────┴───────────┐
            │           │           ▼                       ▼
            │           │     [Concordância]     [Recurso 2ª Instância]
            │           │           │     (Comissão Central: até 5 dias úteis)
            │           │           │                       │
            │           │           │                       ▼
            │           │           │            [Julgamento Central]
            │           │           │         (10 dias úteis + 10 prorrogáveis)
            │           │           │                       │
            └───────────┼───────────┴───────────────────────┘
                        ▼
             [Homologação Final do Ciclo]
```

### 6.2 Prazos Regulamentares

| Procedimento | Responsável | Prazo | Prorrogação | Efeito da omissão |
| :--- | :--- | :--- | :--- | :--- |
| Pedido de reconsideração | Servidor | 3 dias úteis após a ciência | Vedada | Concordância tácita |
| Decisão da reconsideração | Chefia e Pares | Até 5 dias úteis | Vedada | Servidor notificado do resultado |
| Recurso à Comissão Setorial (RAEP) | Servidor | Até 5 dias úteis | Vedada | Preclusão |
| Julgamento setorial | Comissão Setorial | Até 10 dias úteis | Uma vez, +10 dias úteis, justificada | Decisão registrada no RAEP |
| Recurso à Comissão Central | Servidor | Até 5 dias úteis | Vedada | Decisão setorial definitiva |
| Julgamento central | Comissão Central | Até 10 dias úteis | Uma vez, +10 dias úteis, justificada | Encerramento da via recursal |

### 6.3 Regras Críticas
1. **Dias úteis**: excluem sábados, domingos e feriados cadastrados; contagem inicia no dia útil seguinte à ciência.
2. **Concordância tácita**: vencidos 3 dias úteis sem manifestação, o sistema muda o status automaticamente.
3. **Auditoria visual**: nota alterada na revisão aparece com valor anterior riscado e novo valor em âmbar.
4. **Fluxo único de reconsideração**: após a revisão, a discordância segue apenas por RAEP.
5. **Prorrogação única**: comissões só prorrogam uma vez, com justificativa obrigatória.
6. **Preclusão**: após o prazo, novos recursos são bloqueados.
7. **Imutabilidade**: documentos assinados/homologados não podem ser editados.

Essas regras representam a política esperada. A implementação das notas e transições básicas usa o domínio, mas há lacunas: RAEP vinculado é gravado antes da validação; julgamento/prorrogação não estão integralmente ligados às telas; sem conta de servidor vinculada, o gatilho pode encaminhar diretamente à homologação; o fluxo inicia ao salvar FAPEP, antes da assinatura eletrônica. Esses comportamentos não devem ser aceitos como regra institucional sem correção/decisão formal.

---

## 7. ASSINATURA ELETRÔNICA E AUTENTICIDADE PÚBLICA

* **Assinatura**: confirmação da mesma senha de acesso no ato da assinatura; registra nome, matrícula, perfil, e-mail, data/hora e código de verificação exclusivo.
* **Validador público (`/verificar`)**: sem login, qualquer pessoa ou órgão de controle (CGE, PGE, TCE) informa o código impresso no PDF e confirma autenticidade, signatários, datas e situação, sem acesso às notas (LGPD).

O mecanismo registra metadados após reautenticação; não é assinatura ICP-Brasil nem assinatura criptográfica do PDF. O endpoint retorna nome abreviado do servidor e nomes dos signatários, além dos metadados; a publicidade e o nível de assinatura aceito exigem análise jurídica/LGPD. Com conta compartilhada, a identidade do assinante não está assegurada. O download reconstrói o PDF a partir do documento e dados, não entrega necessariamente um arquivo binário arquivado com hash imutável.

---

## 8. MÓDULO DE INTELIGÊNCIA GERENCIAL (BI)

* Aba **Gerenciamento Estágio Probatório** com dados por órgão.
* Cartões: total de servidores em estágio probatório e quantidade por data de efetivo exercício.
* Filtros: órgão, data de efetivo exercício e busca por nome, matrícula ou cargo; painel *Detalhamento* com os servidores filtrados.
* Nesta cópia SEFAZ, a tabela enviada **SEFAZ – Servidores efetivos admitidos após 10-03-2025.xlsx** é importada para a base `servidores`, compartilhada pelo preenchimento dos instrumentos FAPEP 1/2, FAFEP, FADA e busca no RAEP e pelo gerenciamento. São quatro servidores, identificados pela matrícula; importações atualizam a mesma matrícula sem duplicar registros.
* O detalhamento mostra órgão, nome, matrícula, admissão, cargo e as seis datas de avaliação, preservadas literalmente da fonte. As datas previstas não substituem o cronograma administrativo de abertura e encerramento das etapas.
* O gerenciamento consulta a base do aplicativo, com as permissões existentes, sem conexão com Google Sheets. Alterações no arquivo Excel não são sincronizadas automaticamente: exigem nova importação. Documentos já salvos permanecem imutáveis.

---

## 9. AMBIENTE DE HOMOLOGAÇÃO E SIMULAÇÃO

A opção **Ambiente de teste foi removida desta cópia**, conforme solicitado. Consultas ocultam registros marcados como teste; ainda há campos/funções legados no banco. Eles não constituem uma tela disponível. Para implantação institucional, provisionar um backend de homologação separado com dados fictícios; não reintroduzir automaticamente a opção removida.

---

## 10. MODELAGEM ORIENTADA A DOMÍNIO (DDD)

### 10.1 Linguagem Ubíqua
Os termos do decreto são usados literalmente no código, nas tabelas e nas reuniões:

| Termo | Significado |
| :--- | :--- |
| `ServidorAvaliado` | Ocupante de cargo efetivo em estágio probatório |
| `ChefiaImediata` | Autoridade que avalia no FAPEP 1 |
| `ParAvaliador` | Colega designado para o FAPEP 2 |
| `Reconsideracao` | Pedido justificado de revisão em 3 dias úteis |
| `ConcordanciaTacita` | Efeito da inércia do servidor no prazo legal |
| `RAEP` | Recurso à Comissão Setorial ou Central |
| `Preclusao` | Perda do direito de recorrer por decurso de prazo |
| `Homologacao` | Ato colegiado que convalida o resultado |

### 10.2 Contextos Delimitados (Bounded Contexts)

```text
┌──────────────────────────────────────────────────────────┐
│        GESTÃO FUNCIONAL E LOTAÇÃO (Suporte)              │
│        Servidor, Órgão, Cargo, Data de exercício         │
└────────────────────────────┬─────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────┐
│     CICLO AVALIATIVO E TRAMITAÇÃO (Domínio Principal)    │
│   FAPEP 1/2, notas, reconsideração, RAEP, homologação    │
└──────────────┬──────────────────────────────┬────────────┘
               ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│ MOTOR DE PRAZOS (Genérico)│   │ ASSINATURA E AUDITORIA (Gen.)│
│ Dias úteis, cronograma    │   │ Código, /verificar           │
└──────────────────────────┘   └──────────────────────────────┘
```

### 10.3 Design Tático (implementado em `src/domain/`)

| Elemento | Tipo | Arquivo | Invariantes |
| :--- | :--- | :--- | :--- |
| `AvaliacaoFapep` | Raiz de agregação | `avaliacao/AvaliacaoFapep.ts` | Assina só com todos os critérios pontuados; notas mudam só em rascunho ou na revisão (com histórico anterior/novo); concordância tácita só após 3 dias úteis; reconsideração única; homologação imutável |
| `RecursoRaep` | Raiz de agregação | `recurso/RecursoRaep.ts` | Protocolo em até 5 dias úteis (senão preclusão); razões obrigatórias; julgamento em 10 dias úteis; uma única prorrogação justificada; decisão fundamentada |
| `Nota` | Objeto de valor | `avaliacao/Nota.ts` | Valor entre 0 e o máximo do critério |
| `PontuacaoTotal` | Objeto de valor | `avaliacao/Nota.ts` | Soma e percentual derivados das notas |
| `PrazoDiasUteis` | Objeto de valor / serviço | `prazos/PrazoDiasUteis.ts` | Exclui fins de semana e feriados; `PRAZOS_LEGAIS` centraliza 3/5/5/10/5/10 dias |
| `RaizAgregado`, `ErroDominio` | Base compartilhada | `shared/base.ts` | Eventos de domínio e erros de regra |

**Eventos de domínio emitidos**: `AvaliacaoAssinada`, `NotificacaoCienciaDisparada`, `ConcordanciaRegistrada`, `ReconsideracaoSolicitada`, `RevisaoConcluida`, `ConcordanciaTacitaRegistrada`, `AvaliacaoHomologada`, `RecursoRaepProtocolado`, `PrazoJulgamentoProrrogado`, `RecursoJulgado`.

### 10.4 Organização em Camadas

```text
src/
├── domain/          Regras puras do decreto (sem tela, sem banco) + testes
├── lib/             Casos de uso e funções de servidor (*.functions.ts)
├── integrations/    Banco de dados e autenticação (infraestrutura)
├── components/      Formulários e painéis (apresentação)
└── routes/          Páginas e rotas públicas (/verificar)
```

A camada `domain` não importa React, banco ou framework. Notas e serviço `decidirTransicao` são usados por telas, mas os agregados não são aplicados uniformemente em operações transacionais de servidor. O banco tem RLS e gatilhos; isso não comprova aplicação de todas as invariantes de domínio. Eventos emitidos pelos agregados não equivalem a uma trilha de eventos persistida completa.

### 10.5 Testes Automatizados
`src/domain/domain.test.ts` (Vitest) cobre: contagem de dias úteis com feriado, bloqueio de assinatura incompleta, escala de notas, concordância tácita e homologação, histórico de alterações na reconsideração, preclusão e prorrogação única. Executar: `bunx vitest run src/domain`.

### 10.6 Benefícios
* **Segurança jurídica**: o código usa os termos e prazos do decreto, facilitando auditoria.
* **Manutenção**: mudança de prazo ou regra altera um único ponto (`PRAZOS_LEGAIS` ou o agregado).
* **Testabilidade**: regras verificáveis sem banco ou navegador.

---

## 11. RECOMENDAÇÕES PARA IMPLANTAÇÃO (EQUIPE DE TI)

1. **Infraestrutura**: contêineres Docker no Data Center da ETICE; PostgreSQL gerenciado com backup diário e réplica de leitura.
2. **Domínio e certificados**: publicação em domínio oficial (ex.: `estagioprobatorio.seplag.ce.gov.br`) com TLS.
3. **E-mail institucional**: configurar domínio de envio (registros DNS) para notificações do fluxo, hoje desativadas.
4. **Identidade**: possibilidade de login unificado do Estado (Ceará Digital / Gov.br) via OAuth 2.0 / OpenID Connect.
5. **Pendências antes da produção**: reativar o login obrigatório (acesso provisório atual deve ser removido), habilitar proteção contra senhas vazadas e revisar avisos de segurança do banco.
6. **Código-fonte**: disponível por sincronização com GitHub ou download do projeto.

---

*Documento técnico para instrução de planejamento e implantação pelas equipes de Tecnologia da Informação e Gestão de Pessoas do Estado do Ceará.*

### Integração do domínio com as telas
- Notas do FAPEP 1/2: soma e validação pela classe `Nota`/`PontuacaoTotal` (escala 0–10 por critério); nota fora da escala bloqueia salvar, assinar e baixar.
- Fluxo: painéis usam `decidirTransicao` (`src/domain/fluxo/FluxoAvaliacao.ts`) para estado e alguns prazos legais. A validação do RAEP vinculado ocorre depois de inserir o recurso; deverá ser movida/reforçada em uma operação atômica de servidor. Não afirmar que toda regra é aplicada antes de toda gravação nesta versão.
- O prazo de manifestação do servidor é calculado por `PrazoDiasUteis`.

## 12. REQUISITOS FUNCIONAIS RASTREÁVEIS E CRITÉRIOS DE ACEITE

Legenda: **implementado** significa identificado no código e/ou verificado no ambiente atual, não homologação institucional. **Parcial** exige complementação. **Requerido** representa objetivo ainda não atendido. Arquivos permitem localizar as responsabilidades sem reorganizar regras em cópias duplicadas.

| ID | Requisito e situação | Critério de aceite / referência |
| --- | --- | --- |
| RF-01 | Duas abas principais: Avaliação e Gerenciamento — implementado | Abrir os dois módulos e preservar navegação; `src/routes/index.tsx` |
| RF-02 | Base única SEFAZ — implementado | Matrícula identifica registro; mesma informação nos instrumentos e painel; `ServidorSelect`, `servidores.ts`, `gerenciamento.functions.ts` |
| RF-03 | Busca por nome/matrícula — implementado | Seleção preenche nome, matrícula, cargo, órgão e exercício conforme instrumento, sem alterar documentos salvos |
| RF-04 | Número 1 a 6, data de fonte e período automático — implementado | Primeira avaliação começa na admissão; seguintes no dia posterior ao fim anterior; fim é a data literal selecionada; troca de servidor atualiza campos e ausência não estima datas; `FormFapep`, `periodoAvaliacaoServidor` |
| RF-05 | FAPEP 1/2 e notas — implementado | 13 critérios, 0–10 cada, total 130 e percentual; campos obrigatórios bloqueiam salvar/baixar/assinar; `formularios.ts`, `Nota.ts` |
| RF-06 | Descrição legal e feedback — implementado | Descrição separada e texto justificado; feedback editável opcional; anexos precisam conferência jurídica |
| RF-07 | FAFEP — parcial | Campos de notas/médias/parecer existem; consolidação automática, fórmula e limiar de conclusão dependem validação/implementação |
| RF-08 | FADA — implementado como formulário | Registrar atividades, períodos, acompanhamento e avaliação; completude institucional precisa reforço |
| RF-09 | RAEP — parcial | Texto e vínculo existem; criação/vínculo/prazo atômicos são requeridos; sem anexos digitais implementados |
| RF-10 | Ciência e reconsideração — parcial | Concordar/discordar e revisão existem; contas individuais, marco de assinatura, feriados e enforcement no servidor pendentes |
| RF-11 | Homologação setorial — parcial | Parecer e estado homologado existem; prazo colegiado, decisão recursal e prorrogação única precisam integração completa |
| RF-12 | Comissão Central — requerido | Papel próprio, encaminhamento, decisão em segunda instância e prorrogação; opção textual Central é insuficiente |
| RF-13 | Cronograma — parcial | Admin cadastra dez etapas; janelas órgão/número; política de datas ausentes e bloqueio server-side exigidos |
| RF-14 | Assinatura — parcial | Reautenticação e metadados existentes; signatário/papel devem ser validados no servidor; nível jurídico precisa aceite |
| RF-15 | PDF/consulta — implementado com limites | Consultar dados salvos e gerar A4 único fiel; testar texto longo e arquivamento/hash se exigidos |
| RF-16 | Conferência pública — implementado | Código retorna metadados sem notas/conteúdo; validar exposição, prevenção de abuso e retenção |
| RF-17 | Gerenciamento — implementado | Total do órgão, contagem por exercício, filtros de órgão/data/busca e seis datas em detalhamento; `PainelGerenciamento` |
| RF-18 | Autenticação/RBAC institucional — parcial | Tela e papéis existem; acesso automático removido da cópia de entrega, mas origem continua provisória; perfis precisam aprovação |
| RF-19 | Notificações — parcial | Avisos internos; envio transacional por e-mail suspenso por decisão do titular; sem envio WhatsApp implementado |
| RF-20 | Homologação separada — requerido para implantação | Sem tela Ambiente de teste; backend separado deve ser provisionado pela TI |

### Casos de uso essenciais

**UC-01 — Configurar ciclo:** administrador, ou RH após delegação formal, escolhe órgão, número e etapas; cadastra início/fim; TI/RH conferem prioridades e política de ausências. A assinatura não pode contornar janela institucional aprovada.

**UC-02 — Avaliar servidor:** avaliador autorizado busca registro, seleciona 1–6, confere o período preenchido automaticamente e a data de fonte, informa setor/notas/dados do avaliador e feedback opcional, salva e assina. A implementação atual salva antes de assinar; a entrega institucional deverá coordenar o início do fluxo com a assinatura válida.

**UC-03 — Manifestar-se:** conta individual vinculada à matrícula lê avaliação e decide concordância ou reconsideração justificada. Concordância vai à homologação; discordância inicial vai à revisão. Expiração deve respeitar marco de ciência aprovado e dias úteis institucionais.

**UC-04 — Revisar:** chefia/pares examinam pedido em 5 dias úteis, registram decisão e alterações; original preservado e diferenças destacadas. Nova manifestação concordante vai à homologação; discordante habilita recurso.

**UC-05 — Recorrer:** servidor protocola razões em 5 dias úteis; servidor valida autoridade, estado, prazo e cria RAEP/vínculo atomicamente. Comissões decidem e registram prorrogação única fundamentada; Central depende implementação própria.

**UC-06 — Consultar e gerenciar:** avaliador/RH/comissão autorizados consultam documentos sem edição original; gerenciamento usa a base SEFAZ e filtra por exercício. O usuário público consulta somente código/metadados permitidos.

## 13. ESTADOS, REGRAS E LACUNAS DE IMPLEMENTAÇÃO

### 13.1 Transições básicas no serviço de domínio

| Estado | Ação | Próximo estado |
| --- | --- | --- |
| `aguardando_servidor` | concordar | `aguardando_homologacao` |
| `aguardando_servidor` | discordar | `em_revisao` |
| `em_revisao` | revisar | `aguardando_servidor_revisao` |
| `aguardando_servidor_revisao` | concordar | `aguardando_homologacao` |
| `aguardando_servidor_revisao` | discordar | `aguardando_recurso` |
| `aguardando_recurso` | protocolar_recurso | `recurso_apresentado` |
| `aguardando_homologacao` ou `recurso_apresentado` | homologar | `homologado` |

O estado `concluido` é usado para outros instrumentos. Concordância tácita é tratada por função de expiração, não por ação do usuário na tabela. O serviço não autoriza homologar diretamente em `aguardando_recurso`, embora haja divergência com permissões/possibilidades de banco/interface que devem ser reconciliadas.

### 13.2 Regras de negócio para implementação institucional

- **RN-01 — Fonte única:** registros de servidores e seis datas são preservados da fonte; alterações exigem importação controlada. Não há sincronização automática de Excel ou dependência de Google Sheets nesta cópia.
- **RN-02 — Data prevista e período:** seleção usa índice 1–6 da lista de datas. O período inicia na admissão para a primeira avaliação e no dia corrido seguinte ao fim anterior nas demais; termina na data literal selecionada. Datas faltantes/ inválidas ficam vazias, sem estimativas. Seleção do servidor e do número atualiza os períodos nos dois FAPEPs. Campos continuam editáveis; bloqueio de edição, caso exigido, depende decisão institucional. Data prevista, período avaliado, cronograma e hora efetiva de assinatura são conceitos distintos.
- **RN-03 — Pontuação:** cada um dos 13 critérios aceita 0–10; soma máxima 130; percentual deriva do total. Repetir validação no servidor; notas inválidas não podem virar resultado oficial porque a UI deixou de contá-las.
- **RN-04 — Completude:** FAPEP exige identidade, exercício, cargo, órgão, setor, número, início/fim de período, notas e nome/cargo/local/data do avaliador; FAPEP 2 acrescenta par nº. Feedback, observações e sugestões não são exigidos pelo validador atual.
- **RN-05 — Prazos:** constantes 3/5/5/10/5/10 estão centralizadas em `PRAZOS_LEGAIS`. Aplicar calendário de feriados e fuso institucional único em todas as camadas; prazo depende de evento de ciência formal, não de data prevista importada.
- **RN-06 — Prorrogação:** uma única extensão de 10 dias úteis por instância colegiada, motivada e auditada. O agregado de recurso prevê controle, mas telas/persistência ainda exigem integração.
- **RN-07 — Imutabilidade/versionamento:** original salvo não pode ser sobrescrito; revisão é registro separado; após homologação não há nova edição. Congelar dados usados no PDF e, se necessário, arquivar arquivo e hash; não confundir renderização repetida com identidade binária.
- **RN-08 — Autoridade:** ações são validadas por usuário, papel, órgão, vínculo e estado no servidor. Admin não pode representar assinatura de outro agente; perfis amplos não devem visualizar outro órgão por mera autoseleção de cadastro.
- **RN-09 — Ciência obrigatória:** conta do servidor deve ser vinculada antes do fluxo. O comportamento atual que pula ciência se não houver vínculo é uma lacuna, não concordância tácita juridicamente comprovada.
- **RN-10 — Atomicidade:** protocolo de recurso, vínculo e transição formam uma operação; falha não deixa registro órfão. Repetições e concorrência precisam proteção de idempotência/versionamento.
- **RN-11 — Preclusão:** ação fora do prazo é recusada sem persistência parcial. Efeito da omissão do julgador deve ser aprovado juridicamente; expiração não equivale a decisão automática da comissão.
- **RN-12 — Conclusão final:** fórmula, pesos, limiar de aprovação e consolidação do FAFEP devem ser confirmados nos anexos pelo órgão; não foram inventados como regra nesta entrega.

## 14. SEGURANÇA, PROTEÇÃO DE DADOS E REQUISITOS OPERACIONAIS

**Autenticação:** login individual, recuperação e política de senha institucional. Cadastro privilegiado requer aprovação; conferir e-mail, matrícula e órgão com fonte institucional. Implementar controles adicionais de acesso/MFA se exigidos pela TI. Não usar a conta compartilhada em homologação com dados pessoais reais.

**Autorização:** regras no servidor e banco para cada operação, com least privilege. Roles em tabela protegida própria. Revisar RLS, grants, políticas de inserção/assinatura, funções SECURITY DEFINER e schema privado; preservar proteção CSRF e autenticação de server functions. Testes negativos precisam cobrir chamadas diretas, troca de IDs, escalada de papel, leitura entre órgãos e assinatura por perfil indevido.

**Dados pessoais:** nomes, matrículas, e-mails, dados funcionais, notas, justificativas e assinaturas exigem acesso restrito, minimização e registro de finalidade. Órgão deve definir base legal, controlador/operador, retenção documental, transparência e procedimento de incidentes. Exportação completa contém contas e hashes; guardar em canal seguro, nunca no GitHub.

**Auditoria requerida:** autor, instante, documento/versão, ação, estado anterior/novo e resultado; revisão/prorrogação com motivação. Não registrar senhas, tokens ou conteúdo sensível indiscriminadamente em logs. Eventos dos agregados precisam persistência ou trilha equivalente para rastreabilidade completa.

**Assinatura:** autoridade competente e jurídico devem aprovar o nível de assinatura simples/avançada/qualificada conforme legislação aplicável; registro de senha/metadados não é certificado digital. Definir validade, revogação, integridade, arquivamento e consulta externa.

**Operação:** HTTPS, backups testados, controle de acesso administrativo, monitoramento, atualização de dependências, contrato de suporte e plano de continuidade. Metas de usuários simultâneos, latência, RPO/RTO e disponibilidade são parâmetros a contratar, não métricas validadas. Acessibilidade, teclado, leitores de tela e contraste devem ser testados em homologação.

## 15. TRANSFERÊNCIA, TESTES E PENDÊNCIAS PRIORITÁRIAS

### 15.1 Artefatos e limites

Entrega inclui README, este caderno, guia de implantação, inventário, checklist, fonte e testes. `scripts/preparar-entrega.py` cria cópia sanitizada sem login compartilhado ou migração de concessão provisória admin. Não modifica a aplicação atual nem revoga sua conta no backend. O pacote é acompanhado de manifesto; sem `.env`, dados exportados, credenciais, repositório, dependências ou saídas geradas.

O banco precisa de exportação oficial separada: **More → Database → Manage → Settings → Export project data → Export data → Database → Export → Start export**. Migrações locais são incrementais e não criam banco novo. Configuração do provedor de login/segredos deve ser reprovisionada; armazenamento não integra a exportação. A entrega não é deploy interno validado nem conexão/publicação no GitHub.

### 15.2 Prioridades para liberação

| Prioridade | Trabalho necessário | Responsável sugerido |
| --- | --- | --- |
| Bloqueador | Remover acesso/admin provisório, revogar conta/sessões e validar perfis | TI/segurança + gestor |
| Bloqueador | Obter/restaurar banco completo e conferir objetos/políticas/grants | TI/dados |
| Bloqueador | Fazer validação de estado, prazo, assinatura e papel no servidor; RAEP atômico | Desenvolvimento |
| Bloqueador | Coordenar assinatura e ciência, impedir salto por falta de vínculo | Desenvolvimento + RH/jurídico |
| Bloqueador normativo | Integrar calendário de feriados/fuso, julgamentos/prorrogações e Comissão Central | Desenvolvimento + RH/jurídico |
| Antes do aceite | Definir competência cronograma admin/RH e bloqueio sem datas | RH + TI |
| Antes do aceite | Conferir anexos, consolidação FAFEP, limiar e validação completa dos instrumentos | RH/jurídico + desenvolvimento |
| Antes do aceite | Homologar PDF longo, consulta pública, nível de assinatura e retenção | TI + RH/jurídico |
| Operacional | Domínio, backup, monitoramento, suporte, treinamento e termo de cessão | Órgão/TI/titular |

### 15.3 Evidência disponível

Executados em 06/11/2026: `bunx vitest run src/domain/domain.test.ts src/lib/servidores.test.ts`, **16 testes aprovados**. Cobrem regras do domínio e mapeamento literal das datas da base. Não são testes de todas as permissões, de todo fluxo de UI ou da restauração em novo backend. A seleção das seis datas, seleção antes do servidor e troca de servidor em FAPEP 1/2 foi verificada na interface nesta versão. O checklist separado define o que a equipe deverá comprovar antes do aceite.

### 15.4 Governança e decisões pendentes

Órgão define hospedagem e orçamento, escala, política de usuários, calendários, retenção, SLA e suporte. Gestor/titular formalizam cessão e acesso ao código; licença de distribuição não foi atribuída automaticamente. A integração Git cria repositório privado novo pelo proprietário; exportação de banco é sempre separada. Não colocar dados funcionais/contas no repositório mesmo que privado.

## 16. DICIONÁRIO DOS INSTRUMENTOS E FONTES DE VERDADE

### 16.1 FAPEP 1/2

`identificacao`: nome, matrícula, início do exercício, cargo, órgão, setor. Sem ato de nomeação nestes dois instrumentos. `numeroAvaliacao`: 1–6 por menu; `periodoInicio`/`periodoFim`: preenchimento automático pela base conforme RN-02, com edição manual disponível; `parNumero`: FAPEP 2. `notas`: mapa por ID de critério; `justificativas`: feedback por critério. `observacoes`, `sugestoes`: complementos. `avaliador`: nome, cargo, local, data. A data usa a base importada quando selecionados servidor/número; timestamp real da assinatura fica em `assinaturas.assinado_em`.

Critérios implementados: idoneidade moral e ética (postura profissional; relacionamento interpessoal; probidade; equilíbrio emocional), disciplina (observância às normas e regulamentos; assiduidade; pontualidade), dedicação ao serviço (responsabilidade; cooperação; iniciativa e participação na área de trabalho), eficiência (produtividade e resultado; qualidade do trabalho; conhecimento técnico). A redação integral e IDs estão em `REQUISITOS`, `src/lib/formularios.ts`; conferência com os anexos oficiais é requisito jurídico de aceite, não substituída por este resumo.

### 16.2 FAFEP

Identificação inclui ato de nomeação. Matriz manual de seis avaliações e médias para pares 1–3, chefia e média geral; comissão registra avaliação, pontuação, conclusão, portaria/data, local/data, presidente e dois membros com cargos. Não lê/calcula automaticamente todas as avaliações registradas.

### 16.3 RAEP e FADA

RAEP: nome, matrícula, cargo, lotação, órgão, comissão destino, avaliação objeto, razões/provas textuais, local/data; vínculo opcional à avaliação revisada. Falta atomização e tramitação Central. FADA: identificação do servidor, local/data e lista de atividades com descrições, período, orientação/avaliação conforme campos implementados. Estruturas exatas ficam em `src/components/forms/` e no documento renderizado; validação completa institucional deve ser reforçada.

### 16.4 Persistência e integridade

JSON do formulário e snapshots de revisão/homologação ficam em `formularios`; `servidores` é a fonte dos dados funcionais atuais, não deve modificar retroativamente o JSON salvo. `user_roles` é a fonte de autorização, não localStorage. Datas legais são centralizadas no domínio, mas a SQL existente deve ser harmonizada. `docs/INVENTARIO_DADOS.md` descreve entidades, objetos e limitações do baseline local.
