// Driver SIMULADO: não fala com nenhuma cancela, só escreve no log que ela foi aberta/fechada.
// É o driver padrão enquanto não houver protocolo nem equipamento real.
//
// Todo driver segue o mesmo contrato:
//   { nome: "texto", async abrir(cancela), async fechar(cancela) }
// onde `cancela` é "entrada" ou "saida". Se algo der errado, o driver LANÇA um erro
// (quem chamou decide o que fazer).

function criarDriverSimulado(log = console) {
  // `log` pode ser o console ou { log: função } (usado nos testes)
  return {
    nome: "simulado",

    async abrir(cancela) {
      log.log(`[CANCELA] ABRIR  cancela=${cancela} (simulado: nenhuma cancela foi acionada)`);
    },

    async fechar(cancela) {
      log.log(`[CANCELA] FECHAR cancela=${cancela} (simulado: nenhuma cancela foi acionada)`);
    },
  };
}

module.exports = { criarDriverSimulado };
