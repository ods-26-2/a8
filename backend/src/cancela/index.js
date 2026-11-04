// Abertura e fechamento de cancela/catraca, independentes do equipamento.
// O restante do a8 só chama abrirCancela(sourceId) e fecharCancela(sourceId), passando o
// source_id da câmera que leu a placa (o mesmo que vem no evento do I7). Quem decide QUAL
// cancela acionar (entrada ou saída) é a tabela CANCELA_POR_SOURCE_ID abaixo, e quem fala com
// o equipamento é o "driver" escolhido em CANCELA_DRIVER (padrão: "simulado", que só escreve no log).
//
// Para suportar um protocolo real (Modbus, relé, API HTTP, MQTT...), crie um driver novo em
// ./drivers/ com { nome, abrir(cancela), fechar(cancela) }, registre-o abaixo em DRIVERS e
// escolha-o no .env (CANCELA_DRIVER=nome). Nenhum outro código precisa mudar.

const { criarDriverSimulado } = require("./drivers/simulado");

// source_id da câmera -> cancela que ela comanda. Para acrescentar uma câmera, acrescente uma linha.
const CANCELA_POR_SOURCE_ID = {
  "cam-entrada": "entrada",
  "cam-saida": "saida",
};

// Drivers disponíveis, por nome. Cada valor é uma função que devolve o driver.
const DRIVERS = {
  simulado: () => criarDriverSimulado(),
};

/** Registra um driver (usado nos testes e por quem quiser acrescentar um em tempo de execução). */
function registrarDriver(nome, criar) {
  if (typeof criar !== "function") {
    throw new Error("registrarDriver: o segundo argumento deve ser uma função que devolve o driver");
  }
  DRIVERS[nome] = criar;
}

function escolherDriver(env = process.env) {
  const nome = (env.CANCELA_DRIVER || "simulado").trim().toLowerCase();
  const criar = DRIVERS[nome];
  if (!criar) {
    throw new Error(
      `CANCELA_DRIVER inválido: '${nome}'. Disponíveis: ${Object.keys(DRIVERS).join(", ")}`
    );
  }
  return criar();
}

/** Qual cancela ("entrada" ou "saida") é comandada pela câmera `sourceId`. Lança erro se for desconhecida. */
function cancelaDoSourceId(sourceId) {
  const chave = typeof sourceId === "string" ? sourceId.trim().toLowerCase() : "";
  const cancela = CANCELA_POR_SOURCE_ID[chave];
  if (!cancela) {
    throw new Error(
      `source_id sem cancela associada: '${sourceId}'. Conhecidos: ${Object.keys(CANCELA_POR_SOURCE_ID).join(", ")}`
    );
  }
  return cancela;
}

/**
 * Aciona a abertura da cancela da câmera `sourceId` (ex.: "cam-entrada" abre a cancela de entrada).
 * @returns {Promise<{ acao: "abrir", cancela: string, sourceId: string, driver: string, em: string }>}
 */
async function abrirCancela(sourceId) {
  const cancela = cancelaDoSourceId(sourceId);
  const driver = escolherDriver();
  await driver.abrir(cancela);
  return { acao: "abrir", cancela, sourceId, driver: driver.nome, em: new Date().toISOString() };
}

/**
 * Aciona o fechamento da cancela da câmera `sourceId`.
 * @returns {Promise<{ acao: "fechar", cancela: string, sourceId: string, driver: string, em: string }>}
 */
async function fecharCancela(sourceId) {
  const cancela = cancelaDoSourceId(sourceId);
  const driver = escolherDriver();
  await driver.fechar(cancela);
  return { acao: "fechar", cancela, sourceId, driver: driver.nome, em: new Date().toISOString() };
}

module.exports = {
  abrirCancela,
  fecharCancela,
  cancelaDoSourceId,
  registrarDriver,
  escolherDriver,
  CANCELA_POR_SOURCE_ID,
  DRIVERS,
};
