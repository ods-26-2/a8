const bcrypt = require("bcryptjs");
const {gerarToken} = require("../config/token");
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

      const token = gerarToken({ id: cnpjLimpo, papel: "empresa" });

      return res.status(201).json({
        mensagem: "Empresa cadastrada com sucesso.",
        token,
        empresa: { cnpj: cnpjLimpo, nome, tipo },
      });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },

  async perfil(req, res) {
    try {
      if (req.auth.papel !== "empresa") {
        return res.status(403).json({ erro: "Acesso negado." });
      }

      const empresa = await EmpresaModel.findPerfil(req.auth.id);
      if (!empresa) {
        return res.status(404).json({ erro: "Empresa não encontrada." });
      }

      return res.json({
        empresa: {
          cnpj: empresa.CNPJ,
          nome: empresa.Nome,
          email: empresa.email,
          tipo: empresa.Tipo,
          userCadastra: Boolean(empresa.User_cadastra),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },

};

module.exports = EmpresaController;