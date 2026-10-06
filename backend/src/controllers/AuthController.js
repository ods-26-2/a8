const bcrypt = require("bcryptjs");
const {gerarToken} = require("../config/token");
const EmpresaModel = require("../models/EmpresaModel");

const AuthController = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: "Informe e-mail e senha." });
      }

      const empresa = await EmpresaModel.findParaLogin(email);
      const senhaOk = empresa && (await bcrypt.compare(senha, empresa.senha));

      if (!senhaOk) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      const token = gerarToken({ id: empresa.CNPJ, papel: "empresa" });

      return res.json({
        token,
        empresa: { cnpj: empresa.CNPJ, nome: empresa.Nome, tipo: empresa.Tipo },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },
};

module.exports = AuthController;