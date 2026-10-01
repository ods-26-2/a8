import { useRouter } from "expo-router";
import { useState } from "react";

import { CadastroEmpresa } from "@/models/Empresa";
import { empresaService } from "@/services/empresaService";

const FORM_INICIAL: CadastroEmpresa = {
  nome: "",
  cnpj: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  tipo: "empresa",
  userCadastra: false,
};

type Feedback = { tipo: "erro" | "sucesso"; texto: string } | null;

export function useCadastroEmpresaController() {
  const router = useRouter();
  const [form, setForm] = useState<CadastroEmpresa>(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function setCampo<K extends keyof CadastroEmpresa>(campo: K, valor: CadastroEmpresa[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar() {
    const { nome, cnpj, email, senha, confirmarSenha } = form;

    if (!nome || !cnpj || !email || !senha || !confirmarSenha) {
      return setFeedback({ tipo: "erro", texto: "Preencha todos os campos." });
    }
    if (cnpj.length !== 14) {
      return setFeedback({ tipo: "erro", texto: "O CNPJ deve ter 14 dígitos." });
    }
    if (senha !== confirmarSenha) {
      return setFeedback({ tipo: "erro", texto: "As senhas não coincidem." });
    }

    try {
      setLoading(true);
      setFeedback(null);
      const { mensagem } = await empresaService.cadastrar(form);
      setFeedback({ tipo: "sucesso", texto: mensagem });
      setForm(FORM_INICIAL);
      // Passo do Login: aqui faremos router.replace("/login")
    } catch (error) {
      setFeedback({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Falha ao conectar.",
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setCampo,
    enviar,
    loading,
    feedback,
    podeVoltar: router.canGoBack(),
    voltar: () => router.back(),
  };
}