// Consumidor do tópico ods.i7.plate_read (leituras de placa do I7).
// Segue o guia do Kafka B2: endereço do broker configurável, group.id próprio, validação do
// envelope antes de usar o conteúdo, tolerância a mensagens duplicadas e cuidado com o
// consumo de créditos do broker compartilhado (sem laços apertados: se a conexão cair, o
// kafkajs tenta de novo com espera crescente).

const { Kafka, logLevel } = require("kafkajs");
const PlacaModel = require("../models/PlacaModel");
const { processarMensagem } = require("./processarLeituraPlaca");
const { abrirCancela, fecharCancela } = require("../cancela");
const { criarAcionador } = require("../cancela/acionador");

// número >= 0 vindo do ambiente; valor ausente ou inválido volta ao padrão
function numeroDoAmbiente(valor, padrao) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return padrao;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : padrao;
}

function lerConfig(env = process.env) {
  const confiancaMinima = Number(env.PLACA_CONFIANCA_MINIMA ?? 0.9);
  return {
    ativo: String(env.KAFKA_ATIVO).toLowerCase() === "true",
    broker: env.KAFKA_BROKER || "34.66.235.91:9093", // temporário (nuvem); na versão final será local
    topico: env.KAFKA_TOPICO || "ods.i7.plate_read",
    groupId: env.KAFKA_GROUP_ID || "A8-acesso", // cada componente consumidor usa o seu
    // false: um group.id novo começa nas mensagens NOVAS; true: relê o tópico desde o início
    desdeOInicio: String(env.KAFKA_DESDE_O_INICIO).toLowerCase() === "true",
    confiancaMinima: Number.isFinite(confiancaMinima) ? confiancaMinima : 0.9,
    fusoHorario: env.FUSO_HORARIO || "America/Sao_Paulo",
    // cancela (0 desliga cada regra)
    fecharAposSegundos: numeroDoAmbiente(env.CANCELA_FECHAR_APOS_SEGUNDOS, 10),
    janelaRepeticaoSegundos: numeroDoAmbiente(env.CANCELA_JANELA_REPETICAO_SEGUNDOS, 30),
    idadeMaximaSegundos: numeroDoAmbiente(env.CANCELA_IDADE_MAXIMA_SEGUNDOS, 30),
  };
}

/**
 * Inicia o consumidor. Devolve { parar } (desconecta do broker).
 * `deps` existe para teste: { KafkaClasse, modelo, acionador, log }.
 */
async function iniciarConsumidorPlacas(config = lerConfig(), deps = {}) {
  const { KafkaClasse = Kafka, modelo = PlacaModel, log = console } = deps;
  const acionador =
    deps.acionador ||
    criarAcionador({
      abrir: abrirCancela,
      fechar: fecharCancela,
      fecharAposSegundos: config.fecharAposSegundos,
      janelaRepeticaoSegundos: config.janelaRepeticaoSegundos,
      idadeMaximaSegundos: config.idadeMaximaSegundos,
      log,
    });

  const kafka = new KafkaClasse({
    clientId: "a8-backend",
    brokers: [config.broker],
    logLevel: logLevel.WARN,
    connectionTimeout: 10000,
    // espera crescente entre tentativas (0,5 s até 60 s): não martela o broker compartilhado
    retry: { initialRetryTime: 500, maxRetryTime: 60000, retries: 8 },
  });

  const consumidor = kafka.consumer({ groupId: config.groupId });

  await consumidor.connect();
  await consumidor.subscribe({ topic: config.topico, fromBeginning: config.desdeOInicio });
  await consumidor.run({
    // Uma mensagem por vez, na ordem. Se este handler LANÇAR erro (ex.: banco fora do ar),
    // o offset não é confirmado e a mensagem é lida de novo depois: nenhuma leitura se perde.
    eachMessage: async ({ message }) => {
      await processarMensagem(message.value, { modelo, config, acionador, log });
    },
  });

  log.log(
    `[KAFKA] consumidor ativo: tópico ${config.topico} em ${config.broker} ` +
      `(group.id ${config.groupId}, ${config.desdeOInicio ? "desde o início" : "só mensagens novas"})`
  );

  return {
    async parar() {
      await consumidor.disconnect();
      await acionador.encerrar(); // fecha de uma vez as cancelas que aguardavam o fechamento
    },
  };
}

/**
 * Inicia o consumidor e, se o broker não responder (ex.: fora do ar na hora em que o backend
 * sobe), tenta de novo a cada `esperaMs` (padrão: 60 s) até conseguir ou até `parar()`.
 * Devolve { parar } imediatamente; a conexão acontece em segundo plano.
 */
function iniciarComReconexao(config = lerConfig(), deps = {}) {
  const { log = console, esperaMs = 60000 } = deps;
  let consumidor = null;
  let parado = false;

  (async () => {
    while (!parado && !consumidor) {
      try {
        const c = await iniciarConsumidorPlacas(config, deps);
        if (parado) await c.parar();
        else consumidor = c;
      } catch (erro) {
        log.error(`[KAFKA] não foi possível iniciar o consumidor: ${erro.message}`);
        log.error(`[KAFKA] nova tentativa em ${Math.round(esperaMs / 1000)} s`);
        await new Promise((resolve) => setTimeout(resolve, esperaMs));
      }
    }
  })();

  return {
    async parar() {
      parado = true;
      if (consumidor) await consumidor.parar();
    },
  };
}

module.exports = { iniciarConsumidorPlacas, iniciarComReconexao, lerConfig };
