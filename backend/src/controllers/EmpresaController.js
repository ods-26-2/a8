const bcrypt = require("bcryptjs");
const EmpresaModel = require("../models/EmpresaModel");

const TIPOS_VALIDOS = ["condominio", "empresa"];

const EmpresaController = {
  async cadastrar(req, res) {
    try {
      const { nome, email, senha, confirmarSenha, cnpj, tipo, userCadastra } = req.body;

      if (!nome || !email || !senha || !confirmarSenha || !cnpj || !tipo) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
      }

      const cnpjLimpo = String(cnpj).replace(/\D/g, "");
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: "CNPJ deve ter 14 dígitos." });
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ erro: "E-mail inválido." });
      }
      if (senha.length < 6) {
        return res.status(400).json({ erro: "A senha deve ter ao menos 6 caracteres." });
      }
      if (senha !== confirmarSenha) {
        return res.status(400).json({ erro: "As senhas não coincidem." });
      }
      if (!TIPOS_VALIDOS.includes(tipo)) {
        return res.status(400).json({ erro: "Tipo inválido." });
      }

      if (await EmpresaModel.findByCnpj(cnpjLimpo)) {
        return res.status(409).json({ erro: "CNPJ já cadastrado." });
      }
      if (await EmpresaModel.findByEmail(email)) {
        return res.status(409).json({ erro: "E-mail já cadastrado." });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await EmpresaModel.create({
        cnpj: cnpjLimpo,
        nome,
        email,
        senhaHash,
        tipo,
        userCadastra: Boolean(userCadastra),
      });

      return res.status(201).json({ mensagem: "Empresa cadastrada com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },
};

module.exports = EmpresaController;