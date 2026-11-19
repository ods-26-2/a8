# Leitura de placas via Kafka (integração com o I7)

O I7 (leitura de placas) publica no Kafka um evento a cada placa lida na câmera. O backend do a8 consome esses eventos, **confere se a placa está cadastrada** (veículo de uma empresa ou convidado no período) e mostra o resultado no log. Quando o veículo é liberado, aciona a cancela (por enquanto simulada).

```
câmera → I7 → Kafka (ods.i7.plate_read) → backend a8 (consumidor) → confere no banco → resultado no log
```

O consumidor roda dentro do próprio backend (`backend/src/kafka/`). Ele fica **desligado** até `KAFKA_ATIVO=true`, e, se o broker estiver fora do ar, a API continua funcionando normalmente. **Não cria tabelas nem grava nada no banco**: só consulta `Veiculo_Empresa` e `Veiculo_Convidado`.

> **Regra provisória.** O evento do I7 ainda não informa a empresa (CNPJ) do portão, então a conferência procura a placa em **qualquer** empresa. Na prática, uma placa vinculada ao condomínio A é liberada também no portão do B. Quando o I7 passar a enviar o CNPJ (ou a aplicação mapear a câmera para uma empresa), as duas consultas de `backend/src/models/PlacaModel.js` devem ganhar o filtro `AND f_CNPJ = ?`.

## 1. Configurar

**1.1. Variáveis no `backend/.env`** (todas opcionais, menos `KAFKA_ATIVO`):

| Variável | Padrão | O que faz |
|---|---|---|
| `KAFKA_ATIVO` | `false` | `true` liga o consumidor |
| `KAFKA_BROKER` | `200.17.66.56:9092` | Endereço do broker. Hoje é o da **Jetson**: `172.18.4.56:9092` de dentro da rede do Dcomp, `200.17.66.56:9092` de fora (por exemplo, na nuvem). É temporário e compartilhado por todas as squads; na versão final será local. Veja a seção 1.4 |
| `KAFKA_TOPICO` | `ods.i7.plate_read` | Tópico a consumir (também é o `schema` esperado no evento) |
| `KAFKA_GROUP_ID` | `A8-acesso` | Identifica este componente. Cada consumidor usa o seu, para um não atrapalhar a leitura do outro |
| `KAFKA_DESDE_O_INICIO` | `false` | `false`: um `group.id` novo lê só as mensagens **novas**. `true`: relê o tópico inteiro (inclui eventos de teste do I7) |
| `PLACA_CONFIANCA_MINIMA` | `0.9` | Abaixo disso a leitura **não libera** (veja a regra abaixo) |
| `FUSO_HORARIO` | `America/Sao_Paulo` | Fuso usado para comparar a hora da leitura com o período dos convidados |
| `CANCELA_FECHAR_APOS_SEGUNDOS`, `CANCELA_JANELA_REPETICAO_SEGUNDOS`, `CANCELA_IDADE_MAXIMA_SEGUNDOS` | `10`, `30`, `30` | Abertura e fechamento da cancela quando a leitura é liberada. Detalhes em [`cancela.md`](cancela.md) |

```env
KAFKA_ATIVO=true
# fora do Dcomp (nuvem); dentro do Dcomp use 172.18.4.56:9092
KAFKA_BROKER=200.17.66.56:9092
KAFKA_TOPICO=ods.i7.plate_read
```

**1.2. Instale a dependência nova** (o `package-lock.json` já vai atualizado, e o Docker usa `npm ci`):

```bash
cd backend
npm install
```

**1.3. Reconstrua o backend** (o código novo só entra na imagem com `--build`). Com o broker da Jetson, inclua a ponte (seção 1.4):

```bash
docker compose -f docker-compose.yml -f docker-compose.ponte.yml up -d --build --force-recreate backend kafka-ponte
```

No log (`docker logs a8-backend --tail 20`) deve aparecer:

```
[KAFKA] consumidor ativo: tópico ods.i7.plate_read em 200.17.66.56:9092 (group.id A8-acesso, só mensagens novas)
```

Para acompanhar as leituras em tempo real: `docker logs -f --tail 20 a8-backend` (Ctrl+C só fecha a visualização; o consumidor continua).

Não há migração de banco para esta integração.

**1.4. Broker da Jetson e a ponte (`docker-compose.ponte.yml`).** O broker da Jetson anuncia o endereço `localhost:9092` (configuração `advertised.listeners`). O cliente conecta no `KAFKA_BROKER`, recebe esse endereço e passa a usá-lo; dentro do container, `localhost` é o próprio backend, e o log mostra `Connection error ... broker: "localhost:9092" ... ECONNREFUSED`. Enquanto o broker não for corrigido, a ponte resolve: um container `socat` que divide a rede do backend, responde em `localhost:9092` e repassa para a Jetson.

- Use **sempre** os dois `-f` (comando do 1.3). Sem o segundo, a ponte não sobe e o erro volta.
- Não use `docker compose restart backend`: a ponte fica presa à rede antiga do container. Recrie os dois juntos (`--force-recreate backend kafka-ponte`).
- O alvo da ponte é o endereço público (`200.17.66.56:9092`), o certo para a nuvem. Dentro do Dcomp, use o privado nos dois lugares: `KAFKA_BROKER=172.18.4.56:9092` no `backend/.env` e `KAFKA_ALVO=172.18.4.56:9092` antes do comando (`KAFKA_ALVO=172.18.4.56:9092 docker compose -f ... up -d ...`).
- Usando o endereço privado, a rede do Compose não pode estar na faixa `172.18.0.0/16`, senão o container não alcança a Jetson. Acrescente `-f docker-compose.rede.yml` (veja [`docker.md`](docker.md), seção 1).
- Antes de subir, confira se a máquina alcança o broker: `nc -zv -w 5 200.17.66.56 9092` (ou o privado, dentro do Dcomp).

Quando o `advertised.listeners` da Jetson for corrigido, a ponte e o arquivo de rede deixam de ser necessários; basta o `KAFKA_BROKER`.

## 2. Regra de acesso

Para cada leitura, nesta ordem (a primeira que se aplica vale):

| # | Condição | Resultado | Motivo |
|---|---|---|---|
| 1 | `confidence` menor que `PLACA_CONFIANCA_MINIMA` | `baixa_confianca` | `confianca_abaixo_do_minimo` |
| 2 | A placa está em `Veiculo_Empresa` (de qualquer empresa) | `liberado` | `veiculo_vinculado` |
| 3 | A placa está em `Veiculo_Convidado` e a hora da leitura está entre `data_entrada` e `data_saida` (saída vazia = sem fim) | `liberado` | `convidado_no_periodo` |
| 4 | A placa consta como convidado, mas a hora da leitura está **fora** do período | `negado` | `convidado_fora_do_periodo` |
| 5 | Nenhuma das anteriores | `negado` | `nao_cadastrado` |

Quando o resultado é `liberado`, o consumidor também **aciona a cancela** da câmera (hoje simulada: só aparece no log; veja [`cancela.md`](cancela.md)). O resultado aparece no log, uma linha por leitura:

```
[KAFKA] BRA2E19 (car, confiança 0.97) câmera cam-entrada -> liberado (veiculo_vinculado)
```

**Sobre `confidence`.** O I7 envia a **menor** confiança entre os 7 caracteres da placa (0 a 1), que foi a medida que melhor separou leituras certas de erradas. Nos testes do I7 (800 imagens), com 0,9 de mínimo, cerca de 74% das leituras passam e ~1,5% das que passam estão erradas. Leituras abaixo disso ficam como `baixa_confianca`, para conferência manual. Se a confiança estiver baixa, o banco nem é consultado.

**Horários.** A hora da leitura chega em UTC (`occurred_at`). Os períodos de convidados são guardados como o app os digita (horário local, sem fuso), então a comparação converte a hora da leitura para `FUSO_HORARIO`.

## 3. Como o consumidor se comporta

- **Valida antes de usar** (guia do Kafka, seção 4.3): campos obrigatórios do envelope, `schema` e versão (`1.x`), estrutura do payload e formato da placa (Mercosul `AAA9A99` ou antiga `AAA9999`). Mensagem inválida é **descartada** e o motivo vai para o log (`[KAFKA] mensagem descartada: ...`).
- **Duplicatas não fazem mal:** como nada é gravado, receber o mesmo evento duas vezes só repete a linha do log (guia, seção 4.4).
- **Não perde leitura:** se o banco falhar, o erro não é engolido; o Kafka não confirma a mensagem e ela é lida de novo depois.
- **Cuidado com os créditos do broker** (guia, seção 4.5): se a conexão cair, as novas tentativas esperam cada vez mais (de 0,5 s até 60 s), e não há polling em laço apertado. Se o broker estiver fora do ar quando o backend sobe, ele tenta de novo a cada 60 s até conectar. Ao receber `SIGTERM` (`docker stop`), o consumidor sai do grupo e encerra.
- **Ordem:** uma mensagem por vez, na ordem em que chegaram.

## 4. Testar

**Sem Kafka e sem banco** (testes automáticos, com eventos reais gerados pelo publicador do I7):

```bash
cd backend
npm test
```

**Com o I7 de verdade:** com o consumidor ligado, cadastre um veículo na empresa com a placa que será lida e peça à equipe do I7 para publicar uma leitura (`PUBLICACAO_MODO=kafka`, poucas imagens). Confira a linha `[KAFKA] ... -> liberado` em `docker logs a8-backend --tail 20`.

Evite deixar um consumidor de teste rodando em segundo plano: o broker é compartilhado por todas as squads. Também não deixe dois backends (por exemplo, nuvem e laboratório) ligados com o mesmo `KAFKA_GROUP_ID`: eles dividem as mensagens entre si.

## 5. Limitações e próximos passos

- **Sem filtro por empresa** (veja o aviso no topo). É o primeiro ajuste depois da entrega.
- **Ponte para o broker da Jetson** (seção 1.4): necessária até a Jetson anunciar o endereço real no `advertised.listeners`.
- **A cancela é simulada** (só escreve no log) até haver protocolo/equipamento real, e o consumidor **não guarda histórico** de leituras.
- O tópico `ods.i7.plate_read` segue o padrão das outras squads (`ods.<componente>.<evento>`); o guia do Kafka sugere `ods.veiculo.placa_lida` para o I7. Se a TRA-1 decidir mudar, basta trocar `KAFKA_TOPICO`.