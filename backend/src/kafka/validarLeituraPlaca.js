// Valida o envelope recebido do Kafka antes de usar o conteúdo (guia do Kafka B2, seção 4.3).
// Três níveis: é um JSON válido (feito por quem chama); o envelope tem os campos e o tipo
// de evento esperados; o payload tem a estrutura que o A8 sabe processar.
// Mensagem fora do formato é descartada e o motivo vai para o log, nunca processada "na tentativa".

const CAMPOS_OBRIGATORIOS = [
  "message_id",
  "message_type",
  "schema",
  "schema_version",
  "producer",
  "occurred_at",
  "payload",
];

const VERSAO_SUPORTADA = "1."; // aceita 1.0, 1.1, ... mas não 2.0

const FORMATOS_PLACA = {
  MERCOSUL: /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/, // AAA9A99
  OLD_BR: /^[A-Z]{3}[0-9]{4}$/, // AAA9999
};

const CLASSES_VEICULO = ["car", "motorcycle"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ehTextoNaoVazio(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

/**
 * Confere o evento ods.i7.plate_read.
 * Devolve { valido: true, leitura } ou { valido: false, motivo }.
 * `leitura` já vem normalizada, no formato que o restante do A8 usa.
 */
function validarLeituraPlaca(evento, schemaEsperado) {
  if (evento === null || typeof evento !== "object" || Array.isArray(evento)) {
    return { valido: false, motivo: "o evento não é um objeto JSON" };
  }

  // 1) O envelope tem todos os campos obrigatórios?
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!(campo in evento)) {
      return { valido: false, motivo: `campo obrigatório ausente: ${campo}` };
    }
  }

  // 2) É o tipo de evento e a versão que este componente espera?
  if (evento.message_type !== "event") {
    return { valido: false, motivo: `message_type inesperado: ${evento.message_type}` };
  }
  if (evento.schema !== schemaEsperado) {
    return { valido: false, motivo: `schema inesperado: ${evento.schema}` };
  }
  if (!String(evento.schema_version).startsWith(VERSAO_SUPORTADA)) {
    return { valido: false, motivo: `versão não suportada: ${evento.schema_version}` };
  }
  if (!UUID.test(String(evento.message_id))) {
    return { valido: false, motivo: "message_id não é um UUID" };
  }
  const instante = new Date(evento.occurred_at);
  if (!ehTextoNaoVazio(evento.occurred_at) || Number.isNaN(instante.getTime())) {
    return { valido: false, motivo: "occurred_at não é uma data ISO 8601 válida" };
  }

  // 3) O conteúdo (payload) está no formato que este componente entende?
  const payload = evento.payload;
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return { valido: false, motivo: "payload não é um objeto" };
  }
  if (!CLASSES_VEICULO.includes(payload.class)) {
    return { valido: false, motivo: `payload.class inválida: ${payload.class}` };
  }
  const confianca = payload.confidence;
  if (typeof confianca !== "number" || Number.isNaN(confianca) || confianca < 0 || confianca > 1) {
    return { valido: false, motivo: "confidence ausente ou fora do intervalo 0 a 1" };
  }
  const formato = FORMATOS_PLACA[payload.plate_layout];
  if (!formato) {
    return { valido: false, motivo: `plate_layout inválido: ${payload.plate_layout}` };
  }
  if (typeof payload.license_plate !== "string" || !formato.test(payload.license_plate)) {
    return {
      valido: false,
      motivo: `license_plate não segue o formato ${payload.plate_layout}: ${payload.license_plate}`,
    };
  }

  return {
    valido: true,
    leitura: {
      messageId: evento.message_id.toLowerCase(),
      placa: payload.license_plate,
      plateLayout: payload.plate_layout,
      classeVeiculo: payload.class,
      confianca,
      sourceId: ehTextoNaoVazio(evento.source_id) ? evento.source_id.trim() : null, // só para o log
      capturadoEm: instante.toISOString(), // UTC, ex.: 2026-11-04T11:34:44.886Z
    },
  };
}

module.exports = { validarLeituraPlaca, FORMATOS_PLACA, CLASSES_VEICULO };
