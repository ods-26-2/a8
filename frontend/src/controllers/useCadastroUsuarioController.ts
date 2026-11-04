
import { useState } from "react";
import { useRouter } from "expo-router";
import { armazenamento } from "@/services/armazenamento";
import { cadastrarUsuario } from "@/services/usuarioService";

type Campo =
  | "nome"
  | "email"
  | "cpf"
  | "senha"
  | "confirmarSenha";

type Formulario = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

type Feedback = {
  tipo: "erro" | "sucesso";
  texto: string;
} | null;

const formularioInicial: Formulario = {
  nome: "",
  email: "",
  cpf: "",
  senha: "",
  confirmarSenha: "",
};

export function useCadastroUsuarioController() {
  const router = useRouter();

  const [form, setForm] = useState<Formulario>(formularioInicial);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function setCampo(campo: Campo, valor: string) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setFeedback(null);
  }

  async function enviar() {
    if (loading) return;

    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();
    const cpf = form.cpf.replace(/\D/g, "");

    if (
      !nome ||
      !email ||
      !cpf ||
      !form.senha ||
      !form.confirmarSenha
    ) {
      setFeedback({
        tipo: "erro",
        texto: "Preencha todos os campos.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFeedback({
        tipo: "erro",
        texto: "Informe um e-mail válido.",
      });
      return;
    }

    if (nome.length < 3) {
      setFeedback({
        tipo: "erro",
        texto: "O nome deve ter pelo menos 3 caracteres.",
      });
      return;
    }

    if (!/^\d{11}$/.test(cpf)) {
      setFeedback({
        tipo: "erro",
        texto: "O CPF deve conter exatamente 11 números.",
      });
      return;
    }

    if (form.senha.length < 8) {
      setFeedback({
        tipo: "erro",
        texto: "A senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setFeedback({
        tipo: "erro",
        texto: "As senhas não coincidem.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const token = await armazenamento.lerToken();

      if (!token) {
        throw new Error(
          "Sessão não encontrada. Entre novamente como empresa."
        );
      }

      const resposta = await cadastrarUsuario(
        {
          nome,
          email,
          cpf,
          senha: form.senha,
        },
        token
      );

      setForm(formularioInicial);

      setFeedback({
        tipo: "sucesso",
        texto: resposta.mensagem || "Usuário cadastrado com sucesso!",
      });
    } catch (error) {
      setFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  function voltar() {
    router.back();
  }

  return {
    form,
    setCampo,
    enviar,
    loading,
    feedback,
    voltar,
  };
}
