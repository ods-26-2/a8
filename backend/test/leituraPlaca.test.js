// Testes do consumidor de leituras de placa. Rodam sem Kafka e sem MySQL:  npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { validarLeituraPlaca } = require("../src/kafka/validarLeituraPlaca");
const { processarMensagem, paraHorarioLocal, RESULTADO } = require("../src/kafka/processarLeituraPlaca");
const { iniciarConsumidorPlacas, iniciarComReconexao, lerConfig } = require("../src/kafka/consumidorPlacas");

const TOPICO = "ods.i7.plate_read";

// Eventos gerados pelo publicador REAL do I7 (scripts/publicador_eventos.py)
function fixture(nome) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", nome), "utf8"));
}
const carro = () => fixture("evento-i7-carro-mercosul.json"); // BRA2E19, confiança 0,97, 11:34:44Z
const moto = () => fixture("evento-i7-moto-antiga.json"); // MSA2398, confiança 0,62

// Modelo falso, em memória (conta as consultas para provar o que NÃO foi consultado)
function modeloFalso({ vinculadas = [], convidados = [] } = {}) {
  return {
    consultas: 0,
    async placaVinculadaAEmpresa(placa) {
      this.consultas += 1;
      return vinculadas.includes(placa);
    },
    async convidadoCadastrado(placa) {
      this.consultas += 1;
      return convidados.some((c) => c.placa === placa);
    },
    async convidadoNoPeriodo(placa, local) {
      this.consultas += 1;
      return convidados.some((c) => c.placa === placa && c.entrada <= local && (!c.saida || c.saida >= local));
    },
  };
}

const CONFIG = { topico: TOPICO, confiancaMinima: 0.9, fusoHorario: "America/Sao_Paulo" };
const LOG_MUDO = { log() {}, warn() {} };
const bytes = (obj) => Buffer.from(JSON.stringify(obj), "utf8");
const processar = (valor, modelo, config = CONFIG, acionador = null) =>
  processarMensagem(valor, { modelo, config, acionador, log: LOG_MUDO });

// ------------------------------ validação ------------------------------
test("os eventos reais do I7 passam na validação", () => {
  for (const ev of [carro(), moto()]) {
    const r = validarLeituraPlaca(ev, TOPICO);
    assert.equal(r.valido, true, r.motivo);
  }
  const r = validarLeituraPlaca(carro(), TOPICO).leitura;
  assert.equal(r.placa, "BRA2E19");
  assert.equal(r.plateLayout, "MERCOSUL");
  assert.equal(r.classeVeiculo, "car");
  assert.equal(r.confianca, 0.97);
  assert.equal(r.sourceId, "cam-entrada");
  assert.equal(r.capturadoEm, "2026-11-04T11:34:44.886Z");
});

test("envelope fora do formato é recusado, com o motivo", () => {
  const casos = {
    "sem occurred_at": (e) => delete e.occurred_at,
    "sem message_type": (e) => delete e.message_type,
    "schema de outro tópico": (e) => (e.schema = "ods.i1.detections"),
    "versão 2.0": (e) => (e.schema_version = "2.0"),
    "message_id inválido": (e) => (e.message_id = "123"),
    "data inválida": (e) => (e.occurred_at = "ontem"),
    "payload não é objeto": (e) => (e.payload = "x"),
    "classe desconhecida": (e) => (e.payload.class = "truck"),
    "confiança acima de 1": (e) => (e.payload.confidence = 1.2),
    "confiança em texto": (e) => (e.payload.confidence = "0.9"),
    "layout desconhecido": (e) => (e.payload.plate_layout = "X"),
    "placa fora do formato do layout": (e) => (e.payload.license_plate = "BRA1234"), // layout é MERCOSUL
    "placa minúscula": (e) => (e.payload.license_plate = "bra2e19"),
  };
  for (const [nome, mutar] of Object.entries(casos)) {
    const ev = carro();
    mutar(ev);
    assert.equal(validarLeituraPlaca(ev, TOPICO).valido, false, nome);
  }
  for (const lixo of [null, [], "texto", 5]) {
    assert.equal(validarLeituraPlaca(lixo, TOPICO).valido, false);
  }
});

test("versão 1.x futura é aceita", () => {
  const ev = carro();
  ev.schema_version = "1.3";
  assert.equal(validarLeituraPlaca(ev, TOPICO).valido, true);
});

// ------------------------------ horários ------------------------------
test("conversão de horário: UTC -> horário local de São Paulo", () => {
  assert.equal(paraHorarioLocal("2026-11-04T11:34:44.886Z", "America/Sao_Paulo"), "2026-11-04 08:34:44");
  assert.equal(paraHorarioLocal("2026-11-04T02:59:59.000Z", "America/Sao_Paulo"), "2026-11-03 23:59:59");
  assert.equal(paraHorarioLocal("2026-11-04T03:00:00.000Z", "America/Sao_Paulo"), "2026-11-04 00:00:00");
});

// ------------------------------ regra de acesso ------------------------------
test("veículo vinculado a alguma empresa é liberado", async () => {
  const r = await processar(bytes(carro()), modeloFalso({ vinculadas: ["BRA2E19"] }));
  assert.equal(r.estado, "processada");
  assert.equal(r.resultado, RESULTADO.LIBERADO);
  assert.equal(r.motivo, "veiculo_vinculado");
});

test("placa desconhecida é negada", async () => {
  const r = await processar(bytes(carro()), modeloFalso());
  assert.equal(r.resultado, RESULTADO.NEGADO);
  assert.equal(r.motivo, "nao_cadastrado");
});

test("convidado: libera dentro do período e nega fora (horário local, não UTC)", async () => {
  const convidado = (entrada, saida) => ({ placa: "BRA2E19", entrada, saida });
  // o evento é 08:34:44 em São Paulo (11:34:44 UTC)
  const dentro = modeloFalso({ convidados: [convidado("2026-11-04 08:00:00", "2026-11-04 09:00:00")] });
  const r = await processar(bytes(carro()), dentro);
  assert.equal(r.resultado, RESULTADO.LIBERADO);
  assert.equal(r.motivo, "convidado_no_periodo");

  const semSaida = modeloFalso({ convidados: [convidado("2026-11-04 08:00:00", null)] });
  assert.equal((await processar(bytes(carro()), semSaida)).resultado, RESULTADO.LIBERADO);

  // janela 11:00-12:00 só cobriria o horário em UTC; no horário local o carro chegou antes
  const foraPeloFuso = modeloFalso({ convidados: [convidado("2026-11-04 11:00:00", "2026-11-04 12:00:00")] });
  const f = await processar(bytes(carro()), foraPeloFuso);
  assert.equal(f.resultado, RESULTADO.NEGADO);
  assert.equal(f.motivo, "convidado_fora_do_periodo");

  const jaSaiu = modeloFalso({ convidados: [convidado("2026-11-03 08:00:00", "2026-11-04 08:00:00")] });
  const j = await processar(bytes(carro()), jaSaiu);
  assert.equal(j.resultado, RESULTADO.NEGADO);
  assert.equal(j.motivo, "convidado_fora_do_periodo");

  // convidado só de OUTRA placa: a placa lida continua "não cadastrada"
  const outra = modeloFalso({ convidados: [{ placa: "ZZZ9Z99", entrada: "2026-11-04 08:00:00", saida: null }] });
  assert.equal((await processar(bytes(carro()), outra)).motivo, "nao_cadastrado");
});

test("confiança abaixo do mínimo não libera, mesmo com a placa cadastrada (e nem consulta o banco)", async () => {
  const m = modeloFalso({ vinculadas: ["MSA2398"] });
  const r = await processar(bytes(moto()), m); // confiança 0,62
  assert.equal(r.resultado, RESULTADO.BAIXA_CONFIANCA);
  assert.equal(r.motivo, "confianca_abaixo_do_minimo");
  assert.equal(m.consultas, 0);

  // exatamente no limite libera (>= mínimo)
  const limite = moto();
  limite.payload.confidence = 0.9;
  assert.equal((await processar(bytes(limite), m)).resultado, RESULTADO.LIBERADO);
});

test("o mínimo de confiança é configurável", async () => {
  const m = modeloFalso({ vinculadas: ["MSA2398"] });
  const r = await processar(bytes(moto()), m, { ...CONFIG, confiancaMinima: 0.5 });
  assert.equal(r.resultado, RESULTADO.LIBERADO);
});

test("não exige source_id nem session_id (só aparecem no log, se vierem)", async () => {
  const ev = carro();
  delete ev.source_id;
  delete ev.session_id;
  const r = await processar(bytes(ev), modeloFalso({ vinculadas: ["BRA2E19"] }));
  assert.equal(r.resultado, RESULTADO.LIBERADO);
});

// ------------------------------ cancela ------------------------------
function acionadorFalso() {
  const leituras = [];
  return {
    leituras,
    async acionar(leitura) {
      leituras.push(leitura);
      return { estado: "aberta" };
    },
  };
}

test("só a leitura LIBERADA aciona a cancela, com o source_id da câmera", async () => {
  const a = acionadorFalso();
  const r = await processar(bytes(carro()), modeloFalso({ vinculadas: ["BRA2E19"] }), CONFIG, a);
  assert.equal(r.resultado, RESULTADO.LIBERADO);
  assert.equal(a.leituras.length, 1);
  assert.equal(a.leituras[0].sourceId, "cam-entrada");
  assert.equal(a.leituras[0].placa, "BRA2E19");
  assert.deepEqual(r.cancela, { estado: "aberta" });
});

test("negado e baixa confiança NÃO acionam a cancela", async () => {
  const a = acionadorFalso();
  const negado = await processar(bytes(carro()), modeloFalso(), CONFIG, a);
  assert.equal(negado.resultado, RESULTADO.NEGADO);
  const baixa = await processar(bytes(moto()), modeloFalso({ vinculadas: ["MSA2398"] }), CONFIG, a);
  assert.equal(baixa.resultado, RESULTADO.BAIXA_CONFIANCA);
  assert.equal(a.leituras.length, 0);
  assert.equal(negado.cancela, null);
});

test("mensagem inválida não aciona a cancela", async () => {
  const a = acionadorFalso();
  const ruim = carro();
  delete ruim.occurred_at;
  await processar(bytes(ruim), modeloFalso({ vinculadas: ["BRA2E19"] }), CONFIG, a);
  assert.equal(a.leituras.length, 0);
});

// ------------------------------ robustez ------------------------------
test("o mesmo evento recebido duas vezes dá o mesmo resultado, sem efeito colateral", async () => {
  const m = modeloFalso({ vinculadas: ["BRA2E19"] });
  const r1 = await processar(bytes(carro()), m);
  const r2 = await processar(bytes(carro()), m);
  assert.equal(r1.resultado, r2.resultado);
  assert.equal(typeof m.registrar, "undefined", "o consumidor não grava nada no banco");
});

test("mensagens inválidas são descartadas sem erro e sem consultar o banco", async () => {
  const m = modeloFalso({ vinculadas: ["BRA2E19"] });
  const ruim = carro();
  delete ruim.occurred_at;
  for (const valor of [Buffer.from("isto não é json"), bytes(ruim), null, undefined, Buffer.from("[]")]) {
    const r = await processar(valor, m);
    assert.equal(r.estado, "descartada");
  }
  assert.equal(m.consultas, 0);
});

test("falha do banco PROPAGA o erro (a mensagem não é confirmada e será lida de novo)", async () => {
  const m = modeloFalso();
  m.placaVinculadaAEmpresa = async () => {
    throw new Error("banco fora do ar");
  };
  await assert.rejects(processar(bytes(carro()), m), /banco fora do ar/);
});

// ------------------------------ consumidor Kafka (cliente falso) ------------------------------
function kafkaFalso() {
  const estado = { config: null, groupId: null, inscrito: null, run: null, conectou: false, desconectou: false };
  class KafkaFalso {
    constructor(config) {
      estado.config = config;
    }
    consumer({ groupId }) {
      estado.groupId = groupId;
      return {
        async connect() {
          estado.conectou = true;
        },
        async subscribe(args) {
          estado.inscrito = args;
        },
        async run(args) {
          estado.run = args;
        },
        async disconnect() {
          estado.desconectou = true;
        },
      };
    }
  }
  return { KafkaClasse: KafkaFalso, estado };
}

test("o consumidor usa broker, tópico e group.id da configuração e entrega as mensagens ao processador", async () => {
  const { KafkaClasse, estado } = kafkaFalso();
  const modelo = modeloFalso({ vinculadas: ["BRA2E19"] });
  const logs = [];
  const config = lerConfig({ KAFKA_BROKER: "10.0.0.5:9093", KAFKA_TOPICO: TOPICO, KAFKA_ATIVO: "true" });

  const acionador = {
    leituras: [],
    encerrou: false,
    async acionar(l) {
      this.leituras.push(l);
      return { estado: "aberta" };
    },
    async encerrar() {
      this.encerrou = true;
    },
  };
  const c = await iniciarConsumidorPlacas(config, {
    KafkaClasse,
    modelo,
    acionador,
    log: { log: (m) => logs.push(m), warn() {}, error() {} },
  });

  assert.deepEqual(estado.config.brokers, ["10.0.0.5:9093"]);
  assert.equal(estado.groupId, "A8-acesso");
  assert.deepEqual(estado.inscrito, { topic: TOPICO, fromBeginning: false });
  assert.ok(estado.config.retry.maxRetryTime >= 30000, "espera máxima entre tentativas deve ser longa");

  await estado.run.eachMessage({ message: { value: bytes(carro()) } });
  assert.ok(logs.some((m) => m.includes("BRA2E19") && m.includes("liberado")), "o resultado vai para o log");

  assert.equal(acionador.leituras.length, 1, "a leitura liberada chegou ao acionador da cancela");

  await c.parar();
  assert.equal(estado.desconectou, true);
  assert.equal(acionador.encerrou, true, "ao parar, as cancelas pendentes são fechadas");
});

test("configuração: padrões e leitura do ambiente", () => {
  const padrao = lerConfig({});
  assert.equal(padrao.ativo, false, "desligado por padrão");
  assert.equal(padrao.topico, "ods.i7.plate_read");
  assert.equal(padrao.groupId, "A8-acesso");
  assert.equal(padrao.confiancaMinima, 0.9);
  assert.equal(padrao.fusoHorario, "America/Sao_Paulo");
  assert.equal(padrao.desdeOInicio, false);
  assert.equal(padrao.fecharAposSegundos, 10);
  assert.equal(padrao.janelaRepeticaoSegundos, 30);
  assert.equal(padrao.idadeMaximaSegundos, 30);

  const custom = lerConfig({ KAFKA_ATIVO: "TRUE", KAFKA_DESDE_O_INICIO: "true", PLACA_CONFIANCA_MINIMA: "0.75" });
  assert.equal(custom.ativo, true);
  assert.equal(custom.desdeOInicio, true);
  assert.equal(custom.confiancaMinima, 0.75);
  assert.equal(lerConfig({ PLACA_CONFIANCA_MINIMA: "abc" }).confiancaMinima, 0.9, "valor inválido volta ao padrão");
  const cancela = lerConfig({ CANCELA_FECHAR_APOS_SEGUNDOS: "5", CANCELA_JANELA_REPETICAO_SEGUNDOS: "0", CANCELA_IDADE_MAXIMA_SEGUNDOS: "-1" });
  assert.equal(cancela.fecharAposSegundos, 5);
  assert.equal(cancela.janelaRepeticaoSegundos, 0, "0 desliga a regra");
  assert.equal(cancela.idadeMaximaSegundos, 30, "negativo volta ao padrão");
});

test("se o broker estiver fora do ar ao iniciar, tenta de novo até conectar", async () => {
  let tentativas = 0;
  let conectado = false;
  class KafkaInstavel {
    consumer() {
      return {
        async connect() {
          tentativas += 1;
          if (tentativas < 3) throw new Error("broker indisponível");
          conectado = true;
        },
        async subscribe() {},
        async run() {},
        async disconnect() {},
      };
    }
  }
  const erros = [];
  const c = iniciarComReconexao(lerConfig({}), {
    KafkaClasse: KafkaInstavel,
    modelo: modeloFalso(),
    log: { log() {}, warn() {}, error: (m) => erros.push(m) },
    esperaMs: 5,
  });
  for (let i = 0; i < 100 && !conectado; i++) await new Promise((r) => setTimeout(r, 10));
  assert.equal(conectado, true);
  assert.equal(tentativas, 3);
  assert.ok(erros.some((m) => m.includes("broker indisponível")));
  await c.parar();
});

test("parar() durante as tentativas encerra o laço", async () => {
  let tentativas = 0;
  class KafkaSempreFora {
    consumer() {
      return {
        async connect() {
          tentativas += 1;
          throw new Error("fora");
        },
      };
    }
  }
  const c = iniciarComReconexao(lerConfig({}), {
    KafkaClasse: KafkaSempreFora,
    modelo: modeloFalso(),
    log: { log() {}, warn() {}, error() {} },
    esperaMs: 5,
  });
  await new Promise((r) => setTimeout(r, 40));
  await c.parar();
  const antes = tentativas;
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(tentativas, antes, "não tenta mais depois de parar");
  assert.ok(antes >= 2);
});
