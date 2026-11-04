# Cancela / catraca (abrir e fechar)

Funções para acionar a cancela, independentes do equipamento. **Por enquanto são simuladas:** só escrevem no log que a cancela foi aberta ou fechada. O protocolo real será acrescentado depois, sem mudar o restante do código.

## Como usar

A cancela é decidida pelo **`source_id` da câmera** que leu a placa, o mesmo campo que vem no evento do I7:

```js
const { abrirCancela, fecharCancela } = require("./src/cancela");

await abrirCancela("cam-entrada");  // abre a cancela de entrada
await fecharCancela("cam-saida");   // fecha a cancela de saída
```

| `source_id` da câmera | Cancela |
|---|---|
| `cam-entrada` | `entrada` |
| `cam-saida` | `saida` |

Por enquanto o I7 só publica `cam-entrada`. A tabela fica em `CANCELA_POR_SOURCE_ID`, em `backend/src/cancela/index.js`; para acrescentar uma câmera, acrescente uma linha. Maiúsculas e espaços são ignorados. Um `source_id` que não está na tabela gera um **erro claro** e **nenhuma cancela é acionada**.

Cada chamada devolve `{ acao, cancela, sourceId, driver, em }` (por exemplo, `{ acao: "abrir", cancela: "entrada", sourceId: "cam-entrada", driver: "simulado", em: "2026-11-04T13:50:03.681Z" }`). No log:

```
[CANCELA] ABRIR  cancela=entrada (simulado: nenhuma cancela foi acionada)
[CANCELA] FECHAR cancela=saida (simulado: nenhuma cancela foi acionada)
```

Se o equipamento falhar, a função **lança o erro**: quem chamou decide o que fazer (tentar de novo, avisar, não liberar).

## Como funciona

O a8 só conhece `abrirCancela(sourceId)` e `fecharCancela(sourceId)`. A tabela acima traduz o `source_id` em `entrada` ou `saida`, e quem fala com o equipamento é um **driver**, escolhido no `backend/.env`:

| Variável | Padrão | O que faz |
|---|---|---|
| `CANCELA_DRIVER` | `simulado` | Qual driver usar. Hoje só existe `simulado` |

```
backend/src/cancela/
├── index.js              abrirCancela, fecharCancela, tabela source_id -> cancela e registro de drivers
└── drivers/
    └── simulado.js       driver que só escreve no log
```

## Como acrescentar um protocolo real

1. Crie `backend/src/cancela/drivers/<nome>.js` com este formato:
   ```js
   function criarDriverMeuProtocolo() {
     return {
       nome: "meu-protocolo",
       async abrir(cancela) { /* cancela = "entrada" ou "saida"; envie o comando de abrir e lance um erro se falhar */ },
       async fechar(cancela) { /* envie o comando de fechar */ },
     };
   }
   module.exports = { criarDriverMeuProtocolo };
   ```
2. Registre-o em `DRIVERS`, em `backend/src/cancela/index.js`:
   ```js
   "meu-protocolo": () => criarDriverMeuProtocolo(),
   ```
3. No `.env`: `CANCELA_DRIVER=meu-protocolo`.

Endereço, porta e credenciais do equipamento entram como variáveis de ambiente lidas dentro do driver (nunca fixas no código).

## Ligação com o consumidor do I7

Quando o consumidor decide `liberado`, ele chama o **acionador** (`backend/src/cancela/acionador.js`), que abre a cancela da câmera (`abrirCancela(source_id)`) e fecha depois de um tempo. Só a leitura `liberado` aciona a cancela. `negado` e `baixa_confianca` nunca abrem.

Regras do acionador, nesta ordem:

| # | Situação | O que acontece |
|---|---|---|
| 1 | Leitura sem `source_id` | **Não abre** (sem ele não há como escolher a cancela). Aviso no log |
| 2 | Evento antigo (mais de 30 s) | **Não abre**. Evita abrir por mensagens atrasadas, por exemplo ao reprocessar o tópico |
| 3 | Mesma placa, mesma câmera, dentro de 30 s | **Não abre de novo**. Com câmera real o I7 lê o mesmo carro em vários quadros; a janela evita dezenas de comandos para um carro só |
| 4 | Demais casos | **Abre**, e agenda o fechamento para 10 s depois |

Mais detalhes:

- Há **um único fechamento pendente por câmera**: se outro carro abrir antes dos 10 s, o prazo recomeça.
- A janela de repetição só conta **aberturas**. Uma leitura negada não gasta a janela, e uma falha ao abrir também não.
- Falha da cancela (ou `source_id` fora da tabela) **não derruba o consumidor**: o erro vai para o log e as próximas mensagens continuam sendo lidas.
- Ao desligar o backend (`docker stop`), as cancelas que ainda aguardavam o fechamento são **fechadas na hora**.

Variáveis do `backend/.env` (`0` desliga a regra):

| Variável | Padrão | O que faz |
|---|---|---|
| `CANCELA_FECHAR_APOS_SEGUNDOS` | `10` | Fecha sozinho depois de N s. `0`: não fecha sozinho |
| `CANCELA_JANELA_REPETICAO_SEGUNDOS` | `30` | Mesma placa + mesma câmera dentro da janela não abre de novo. `0`: sem janela |
| `CANCELA_IDADE_MAXIMA_SEGUNDOS` | `30` | Evento mais velho que isso não abre. `0`: não confere a idade |

No log, um carro liberado aparece assim:

```
[KAFKA] BRA2E19 (car, confiança 0.97) câmera cam-entrada -> liberado (veiculo_vinculado)
[CANCELA] ABRIR  cancela=entrada (simulado: nenhuma cancela foi acionada)
... 10 s depois ...
[CANCELA] FECHAR cancela=entrada (simulado: nenhuma cancela foi acionada)
```

Quem decide o fechamento por sensor (fechar ao detectar a passagem, em vez de por tempo) é uma regra a combinar quando houver o equipamento.

## Testar

```bash
cd backend
npm test
```
