// Testes das funções de cancela. Rodam sem equipamento nenhum:  npm test
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  abrirCancela,
  fecharCancela,
  cancelaDoSourceId,
  registrarDriver,
  escolherDriver,
} = require("../src/cancela");
const { criarDriverSimulado } = require("../src/cancela/drivers/simulado");

function comDriver(valor, fn) {
  const antes = process.env.CANCELA_DRIVER;
  if (valor === undefined) delete process.env.CANCELA_DRIVER;
  else process.env.CANCELA_DRIVER = valor;
  return Promise.resolve(fn()).finally(() => {
    if (antes === undefined) delete process.env.CANCELA_DRIVER;
    else process.env.CANCELA_DRIVER = antes;
  });
}

test("o source_id da câmera decide a cancela: entrada ou saída", () => {
  assert.equal(cancelaDoSourceId("cam-entrada"), "entrada");
  assert.equal(cancelaDoSourceId("cam-saida"), "saida");
  assert.equal(cancelaDoSourceId("  CAM-ENTRADA "), "entrada", "ignora maiúsculas e espaços");
});

test("source_id desconhecido ou ausente gera erro claro, listando os conhecidos", () => {
  for (const ruim of ["cam-garagem", "", undefined, null, 5]) {
    assert.throws(() => cancelaDoSourceId(ruim), /sem cancela associada.*cam-entrada.*cam-saida/);
  }
});

test("o driver simulado só escreve no log e não aciona nada", async () => {
  const linhas = [];
  const d = criarDriverSimulado({ log: (m) => linhas.push(m) });
  await d.abrir("entrada");
  await d.fechar("saida");
  assert.equal(linhas.length, 2);
  assert.match(linhas[0], /\[CANCELA\] ABRIR\s+cancela=entrada/);
  assert.match(linhas[1], /\[CANCELA\] FECHAR cancela=saida/);
  assert.match(linhas[0], /simulado/);
});

test("abrirCancela e fecharCancela usam o driver simulado por padrão", async () => {
  await comDriver(undefined, async () => {
    const a = await abrirCancela("cam-entrada");
    assert.equal(a.acao, "abrir");
    assert.equal(a.cancela, "entrada");
    assert.equal(a.sourceId, "cam-entrada");
    assert.equal(a.driver, "simulado");
    assert.ok(!Number.isNaN(Date.parse(a.em)));

    const f = await fecharCancela("cam-saida");
    assert.equal(f.acao, "fechar");
    assert.equal(f.cancela, "saida");
    assert.equal(f.driver, "simulado");
  });
});

test("câmera desconhecida: nenhuma cancela é acionada", async () => {
  const chamadas = [];
  registrarDriver("espiao", () => ({
    nome: "espiao",
    async abrir(c) {
      chamadas.push(c);
    },
    async fechar(c) {
      chamadas.push(c);
    },
  }));
  await comDriver("espiao", async () => {
    await assert.rejects(abrirCancela("cam-garagem"), /sem cancela associada/);
    await assert.rejects(fecharCancela(undefined), /sem cancela associada/);
  });
  assert.deepEqual(chamadas, []);
});

test("um driver novo entra sem mudar o restante do código e recebe 'entrada' ou 'saida'", async () => {
  const chamadas = [];
  registrarDriver("falso", () => ({
    nome: "falso",
    async abrir(cancela) {
      chamadas.push(["abrir", cancela]);
    },
    async fechar(cancela) {
      chamadas.push(["fechar", cancela]);
    },
  }));
  await comDriver("falso", async () => {
    const a = await abrirCancela("cam-entrada");
    await fecharCancela("cam-saida");
    assert.equal(a.driver, "falso");
  });
  assert.deepEqual(chamadas, [
    ["abrir", "entrada"],
    ["fechar", "saida"],
  ]);
});

test("CANCELA_DRIVER desconhecido gera erro claro, listando os disponíveis", async () => {
  await comDriver("modbus", async () => {
    await assert.rejects(abrirCancela("cam-entrada"), /CANCELA_DRIVER inválido: 'modbus'.*simulado/);
    assert.throws(() => escolherDriver({ CANCELA_DRIVER: "x" }), /inválido/);
  });
});

test("falha do driver propaga o erro (quem chamou decide o que fazer)", async () => {
  registrarDriver("quebrado", () => ({
    nome: "quebrado",
    async abrir() {
      throw new Error("sem resposta da cancela");
    },
    async fechar() {},
  }));
  await comDriver("quebrado", async () => {
    await assert.rejects(abrirCancela("cam-entrada"), /sem resposta da cancela/);
  });
});
