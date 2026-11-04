// Recebe o valor de uma mensagem do tópico ods.i7.plate_read, valida e confere a placa no banco.
// Não conhece o Kafka (recebe só os bytes), então é testável sem broker.
// Não grava nada: o resultado vai para o log. Por isso receber o mesmo evento duas vezes
// não causa efeito duplicado (guia do Kafka, seção 4.4).

const { validarLeituraPlaca } = require("./validarLeituraPlaca");

// Resultados possíveis
const RESULTADO = {
  LIBERADO: "liberado",
  NEGADO: "negado",
  BAIXA_CONFIANCA: "baixa_confianca",
};

// 'YYYY-MM-DD HH:mm:ss' no fuso do condomínio/empresa. É o formato de Veiculo_Convidado,
// que guarda o horário local digitado no app (sem fuso).
function paraHorarioLocal(isoUtc, fuso) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date(isoUtc));
}

/**
 * Regra de acesso (PROVISÓRIA: sem filtro por empresa, o evento ainda não traz o CNPJ).
 * Ordem:
 *   1. confiança abaixo do mínimo            -> baixa_confianca (não libera sozinho)
 *   2. placa vinculada a alguma empresa      -> liberado
 *   3. convidado com o período cobrindo agora -> liberado
 *   4. convidado, mas fora do período        -> negado (convidado_fora_do_periodo)
 *   5. caso contrário                        -> negado (nao_cadastrado)
 */
async function decidir(leitura, modelo, config) {
  if (leitura.confianca < config.confiancaMinima) {
    return { resultado: RESULTADO.BAIXA_CONFIANCA, motivo: "confianca_abaixo_do_minimo" };
  }
  if (await modelo.placaVinculadaAEmpresa(leitura.placa)) {
    return { resultado: RESULTADO.LIBERADO, motivo: "veiculo_vinculado" };
  }
  const local = paraHorarioLocal(leitura.capturadoEm, config.fusoHorario);
  if (await modelo.convidadoNoPeriodo(leitura.placa, local)) {
    return { resultado: RESULTADO.LIBERADO, motivo: "convidado_no_periodo" };
  }
  if (await modelo.convidadoCadastrado(leitura.placa)) {
    return { resultado: RESULTADO.NEGADO, motivo: "convidado_fora_do_periodo" };
  }
  return { resultado: RESULTADO.NEGADO, motivo: "nao_cadastrado" };
}

/**
 * @param valor   bytes (Buffer) ou texto da mensagem
 * @param deps    { modelo, config: { topico, confiancaMinima, fusoHorario }, acionador?, log }
 *                `acionador` (opcional): se vier, a leitura LIBERADA aciona a cancela.
 * @returns { estado: "processada" | "descartada", ... }
 * Mensagem inválida NÃO lança erro (é descartada e registrada no log).
 * Falha de banco LANÇA o erro: o Kafka não confirma a mensagem e ela é lida de novo.
 */
async function processarMensagem(valor, { modelo, config, acionador = null, log = console }) {
  if (valor === null || valor === undefined) {
    log.warn("[KAFKA] mensagem descartada: sem conteúdo");
    return { estado: "descartada", motivo: "sem conteúdo" };
  }

  let evento;
  try {
    evento = JSON.parse(Buffer.isBuffer(valor) ? valor.toString("utf8") : String(valor));
  } catch {
    log.warn("[KAFKA] mensagem descartada: JSON inválido");
    return { estado: "descartada", motivo: "JSON inválido" };
  }

  const validacao = validarLeituraPlaca(evento, config.topico);
  if (!validacao.valido) {
    log.warn(`[KAFKA] mensagem descartada: ${validacao.motivo}`);
    return { estado: "descartada", motivo: validacao.motivo };
  }

  const leitura = validacao.leitura;
  const decisao = await decidir(leitura, modelo, config);

  log.log(
    `[KAFKA] ${leitura.placa} (${leitura.classeVeiculo}, confiança ${leitura.confianca}) ` +
      `${leitura.sourceId ? `câmera ${leitura.sourceId} ` : ""}-> ${decisao.resultado} (${decisao.motivo})`
  );

  // Só leitura liberada aciona a cancela. O acionador nunca lança erro.
  const cancela = decisao.resultado === RESULTADO.LIBERADO && acionador ? await acionador.acionar(leitura) : null;

  return { estado: "processada", leitura, ...decisao, cancela };
}

module.exports = { processarMensagem, decidir, paraHorarioLocal, RESULTADO };
