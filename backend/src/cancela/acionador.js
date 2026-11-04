// Liga a decisão "liberado" (consumidor do I7) à cancela: abre e, depois de um tempo, fecha.
// Não conhece o Kafka nem o banco, só recebe a leitura; por isso é testável com relógio falso.
//
// Regras, nesta ordem (a primeira que se aplica vale):
//   1. leitura sem source_id            -> não abre (não há como escolher a cancela)
//   2. evento antigo (mais de N s)      -> não abre (ex.: reprocessamento de mensagens atrasadas)
//   3. mesma placa na mesma câmera dentro da janela de repetição -> não abre de novo
//   4. caso contrário                   -> abre, e agenda o fechamento
//
// acionar() NUNCA lança erro: uma falha da cancela vai para o log e não impede o consumidor
// de continuar lendo as próximas mensagens (nem faz o Kafka entregar a mesma mensagem de novo).

function criarAcionador({
  abrir,
  fechar,
  fecharAposSegundos = 10, // 0 = não fecha sozinho
  janelaRepeticaoSegundos = 30, // 0 = sem janela
  idadeMaximaSegundos = 30, // 0 = não confere a idade do evento
  agora = () => Date.now(),
  agendar = setTimeout,
  cancelarAgendamento = clearTimeout,
  log = console,
}) {
  const ultimaAbertura = new Map(); // "câmera|placa" -> instante (ms) da última abertura
  const fechamentos = new Map(); // câmera -> temporizador do fechamento pendente

  function limparJanelasVencidas(instante) {
    const janelaMs = janelaRepeticaoSegundos * 1000;
    for (const [chave, quando] of ultimaAbertura) {
      if (instante - quando >= janelaMs) ultimaAbertura.delete(chave);
    }
  }

  async function fecharAgora(camera) {
    fechamentos.delete(camera);
    try {
      await fechar(camera);
    } catch (erro) {
      log.error(`[CANCELA] erro ao fechar (${camera}): ${erro.message}`);
    }
  }

  async function acionar(leitura) {
    const camera = typeof leitura.sourceId === "string" ? leitura.sourceId.trim().toLowerCase() : "";
    if (!camera) {
      log.warn(`[CANCELA] ${leitura.placa}: liberada, mas sem source_id: cancela não acionada`);
      return { estado: "ignorada", motivo: "sem_source_id" };
    }

    const instante = agora();

    if (idadeMaximaSegundos > 0) {
      const idade = (instante - Date.parse(leitura.capturadoEm)) / 1000;
      if (Number.isFinite(idade) && idade > idadeMaximaSegundos) {
        log.warn(
          `[CANCELA] ${leitura.placa}: liberada, mas o evento tem ${Math.round(idade)} s ` +
            `(máximo ${idadeMaximaSegundos} s): cancela não acionada`
        );
        return { estado: "ignorada", motivo: "evento_antigo" };
      }
    }

    limparJanelasVencidas(instante);
    const chave = `${camera}|${leitura.placa}`;
    if (janelaRepeticaoSegundos > 0 && ultimaAbertura.has(chave)) {
      log.log(`[CANCELA] ${leitura.placa}: já aberta há pouco nesta câmera, ignorada`);
      return { estado: "ignorada", motivo: "repeticao" };
    }

    try {
      await abrir(camera);
    } catch (erro) {
      log.error(`[CANCELA] erro ao abrir (${leitura.sourceId}): ${erro.message}`);
      return { estado: "erro", motivo: erro.message };
    }
    ultimaAbertura.set(chave, instante);

    // Um único fechamento pendente por câmera: se outro carro abrir antes, o prazo recomeça.
    if (fechamentos.has(camera)) cancelarAgendamento(fechamentos.get(camera));
    if (fecharAposSegundos > 0) {
      const t = agendar(() => fecharAgora(camera), fecharAposSegundos * 1000);
      if (t && typeof t.unref === "function") t.unref(); // não impede o processo de encerrar
      fechamentos.set(camera, t);
    }
    return { estado: "aberta" };
  }

  // Ao desligar o backend, fecha de uma vez as cancelas que ainda aguardavam o fechamento.
  async function encerrar() {
    const abertas = [...fechamentos.keys()];
    for (const camera of abertas) cancelarAgendamento(fechamentos.get(camera));
    fechamentos.clear();
    for (const camera of abertas) await fecharAgora(camera);
  }

  return { acionar, encerrar };
}

module.exports = { criarAcionador };
