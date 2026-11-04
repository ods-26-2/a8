// Testes do acionador (leitura liberada -> cancela). Relógio e temporizador falsos:  npm test
const test = require("node:test");
const assert = require("node:assert/strict");

const { criarAcionador } = require("../src/cancela/acionador");

// Monta um acionador com relógio e temporizador controlados pelo teste
function montar(opcoes = {}) {
  const estado = { agora: Date.parse("2026-11-04T12:00:00.000Z"), aberturas: [], fechamentos: [], timers: [], logs: [] };
  const log = {
    log: (m) => estado.logs.push(["log", m]),
    warn: (m) => estado.logs.push(["warn", m]),
    error: (m) => estado.logs.push(["error", m]),
  };
  const acionador = criarAcionador({
    abrir: async (camera) => {
      if (estado.falhaAbrir) throw new Error(estado.falhaAbrir);
      estado.aberturas.push(camera);
    },
    fechar: async (camera) => {
      if (estado.falhaFechar) throw new Error(estado.falhaFechar);
      estado.fechamentos.push(camera);
    },
    agora: () => estado.agora,
    agendar: (fn, ms) => {
      const t = { fn, ms, cancelado: false, unref() {} };
      estado.timers.push(t);
      return t;
    },
    cancelarAgendamento: (t) => {
      t.cancelado = true;
    },
    log,
    ...opcoes,
  });
  // simula o tempo passando: dispara os temporizadores pendentes e avança o relógio
  estado.passar = async (segundos) => {
    estado.agora += segundos * 1000;
    for (const t of estado.timers) {
      if (!t.cancelado && !t.disparado && t.ms <= segundos * 1000) {
        t.disparado = true;
        await t.fn();
      }
    }
  };
  return { acionador, estado };
}

// leitura como a produzida pelo validador; capturada "agora" por padrão
const leitura = (estado, extra = {}) => ({
  placa: "BRA2E19",
  sourceId: "cam-entrada",
  capturadoEm: new Date(estado.agora).toISOString(),
  ...extra,
});

test("abre a cancela da câmera e agenda o fechamento para 10 s depois", async () => {
  const { acionador, estado } = montar();
  const r = await acionador.acionar(leitura(estado));
  assert.equal(r.estado, "aberta");
  assert.deepEqual(estado.aberturas, ["cam-entrada"]);
  assert.equal(estado.timers.length, 1);
  assert.equal(estado.timers[0].ms, 10000);
  assert.deepEqual(estado.fechamentos, [], "ainda não fechou");

  await estado.passar(10);
  assert.deepEqual(estado.fechamentos, ["cam-entrada"]);
});

test("a mesma placa na mesma câmera dentro de 30 s não abre de novo; depois da janela, abre", async () => {
  const { acionador, estado } = montar();
  await acionador.acionar(leitura(estado));
  await estado.passar(5);
  const r = await acionador.acionar(leitura(estado));
  assert.equal(r.estado, "ignorada");
  assert.equal(r.motivo, "repeticao");
  assert.equal(estado.aberturas.length, 1);

  await estado.passar(26); // 31 s depois da primeira abertura
  const r2 = await acionador.acionar(leitura(estado));
  assert.equal(r2.estado, "aberta");
  assert.equal(estado.aberturas.length, 2);
});

test("outra placa na mesma câmera abre, e o prazo de fechamento recomeça (um só pendente)", async () => {
  const { acionador, estado } = montar();
  await acionador.acionar(leitura(estado));
  await estado.passar(5);
  const r = await acionador.acionar(leitura(estado, { placa: "OVK7900" }));
  assert.equal(r.estado, "aberta");
  assert.equal(estado.aberturas.length, 2);
  assert.equal(estado.timers[0].cancelado, true, "o fechamento antigo foi cancelado");
  assert.equal(estado.timers[1].cancelado, false);
});

test("a mesma placa em outra câmera abre (a janela é por câmera)", async () => {
  const { acionador, estado } = montar();
  await acionador.acionar(leitura(estado));
  const r = await acionador.acionar(leitura(estado, { sourceId: "cam-saida" }));
  assert.equal(r.estado, "aberta");
  assert.deepEqual(estado.aberturas, ["cam-entrada", "cam-saida"]);
});

test("leitura sem source_id não abre nada", async () => {
  const { acionador, estado } = montar();
  for (const sourceId of [null, undefined, "", "   "]) {
    const r = await acionador.acionar(leitura(estado, { sourceId }));
    assert.equal(r.estado, "ignorada");
    assert.equal(r.motivo, "sem_source_id");
  }
  assert.deepEqual(estado.aberturas, []);
  assert.ok(estado.logs.some(([n, m]) => n === "warn" && m.includes("sem source_id")));
});

test("evento antigo (mais de 30 s) não abre; no limite ainda abre", async () => {
  const { acionador, estado } = montar();
  const antigo = leitura(estado, { capturadoEm: new Date(estado.agora - 31000).toISOString() });
  const r = await acionador.acionar(antigo);
  assert.equal(r.motivo, "evento_antigo");
  assert.deepEqual(estado.aberturas, []);

  const limite = leitura(estado, { capturadoEm: new Date(estado.agora - 30000).toISOString() });
  assert.equal((await acionador.acionar(limite)).estado, "aberta");
});

test("as regras podem ser desligadas com 0", async () => {
  const { acionador, estado } = montar({ fecharAposSegundos: 0, janelaRepeticaoSegundos: 0, idadeMaximaSegundos: 0 });
  const velho = leitura(estado, { capturadoEm: "2020-01-01T00:00:00.000Z" });
  assert.equal((await acionador.acionar(velho)).estado, "aberta");
  assert.equal((await acionador.acionar(velho)).estado, "aberta", "sem janela de repetição");
  assert.equal(estado.timers.length, 0, "sem fechamento automático");
});

test("falha ao abrir não lança erro, vai para o log e não bloqueia a próxima tentativa", async () => {
  const { acionador, estado } = montar();
  estado.falhaAbrir = "source_id sem cancela associada: 'cam-x'";
  const r = await acionador.acionar(leitura(estado, { sourceId: "cam-x" }));
  assert.equal(r.estado, "erro");
  assert.ok(estado.logs.some(([n, m]) => n === "error" && m.includes("erro ao abrir")));
  assert.equal(estado.timers.length, 0, "não agenda fechamento de algo que não abriu");

  estado.falhaAbrir = null;
  assert.equal((await acionador.acionar(leitura(estado, { sourceId: "cam-x" }))).estado, "aberta", "falha não gasta a janela");
});

test("falha ao fechar não lança erro e vai para o log", async () => {
  const { acionador, estado } = montar();
  await acionador.acionar(leitura(estado));
  estado.falhaFechar = "cancela não respondeu";
  await estado.passar(10);
  assert.ok(estado.logs.some(([n, m]) => n === "error" && m.includes("erro ao fechar")));
});

test("encerrar() fecha de uma vez as cancelas que aguardavam o fechamento", async () => {
  const { acionador, estado } = montar();
  await acionador.acionar(leitura(estado));
  await acionador.acionar(leitura(estado, { sourceId: "cam-saida" }));
  await acionador.encerrar();
  assert.deepEqual(estado.fechamentos.sort(), ["cam-entrada", "cam-saida"]);
  assert.ok(estado.timers.every((t) => t.cancelado), "os temporizadores foram cancelados");
  await acionador.encerrar();
  assert.equal(estado.fechamentos.length, 2, "chamar de novo não fecha duas vezes");
});
