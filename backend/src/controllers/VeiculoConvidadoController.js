const VeiculoConvidadoModel = require("../models/VeiculoConvidadoModel");

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const VeiculoConvidadoController = {
  async cadastrar(req, res) {
    try {
      const { cnpj, email: emailDoToken, funcao } = req.contexto;
      const { placa, dataEntrada, dataSaida } = req.body;
      const emailUsuario = funcao === "empresa" ? req.body.emailUsuario : emailDoToken;
    
      if (!placa || !emailUsuario || !dataEntrada) {
        return res.status(400).json({ erro: "Preencha placa, e-mail do usuário e data de entrada." });
      }

      const placaLimpa = String(placa).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      // aceita AAA9999 (antiga) e AAA9A99 (Mercosul)
      if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaLimpa)) {
        return res.status(400).json({ erro: "Placa inválida." });
      }
      if (!/^\S+@\S+\.\S+$/.test(emailUsuario)) {
        return res.status(400).json({ erro: "E-mail inválido." });
      }
      if (!FORMATO_DATA.test(dataEntrada) || (dataSaida && !FORMATO_DATA.test(dataSaida))) {
        return res.status(400).json({ erro: "Data inválida." });
      }
      if (dataSaida && dataSaida < dataEntrada) {
        return res.status(400).json({ erro: "A saída deve ser depois da entrada." });
      }

      if (!(await VeiculoConvidadoModel.usuarioExiste(emailUsuario))) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      await VeiculoConvidadoModel.create({
        placa: placaLimpa,
        cnpj, // CNPJ vem do token, nunca do formulário
        email: emailUsuario,
        dataEntrada,
        dataSaida: dataSaida || null,
      });

      return res.status(201).json({ mensagem: "Veículo convidado cadastrado com sucesso." });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ erro: "Este veículo já está cadastrado como convidado desse usuário." });
      }
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },
};

module.exports = VeiculoConvidadoController;