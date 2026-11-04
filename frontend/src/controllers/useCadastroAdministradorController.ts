// frontend/src/controllers/useCadastroAdministradorController.ts
import { useState } from "react";
import { useRouter } from "expo-router";

import { administradorService } from "@/services/administradorService";
import {
  FORM_ADMINISTRADOR_VAZIO,
  FormAdministrador,
} from "@/models/Administrador";

type Feedback = { tipo: "erro" | "sucesso"; texto: string } | null;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useCadastroAdministradorController() {
  const router = useRouter();

  const [form, setForm] = useState<FormAdministrador>(FORM_ADMINISTRADOR_VAZIO);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function setCampo(campo: keyof FormAdministrador, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar(): string | null {
    if (form.nome.trim().length < 2) return "Informe o nome completo.";
    if (!EMAIL_VALIDO.test(form.email.trim())) return "Informe um e-mail válido.";
    if (form.cpf.length !== 11) return "O CPF deve ter 11 números.";
    if (form.senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (form.senha !== form.confirmarSenha) return "A confirmação não confere com a senha.";
    return null;
  }

  async function enviar() {
    if (loading) return;
    setFeedback(null);

    const erro = validar();
    if (erro) {
      setFeedback({ tipo: "erro", texto: erro });
      return;
    }

    setLoading(true);
    try {
      const { mensagem } = await administradorService.cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        cpf: form.cpf,
        senha: form.senha,
      });
      setForm(FORM_ADMINISTRADOR_VAZIO);
      setFeedback({ tipo: "sucesso", texto: mensagem });
    } catch (e) {
      setFeedback({
        tipo: "erro",
        texto: e instanceof Error ? e.message : "Não foi possível cadastrar o administrador.",
      });
    } finally {
      setLoading(false);
    }
  }

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/home-empresa" as any);
  }

  return { form, setCampo, enviar, loading, feedback, voltar };
}