import { useState } from "react";
import { fazerLogin } from "../services/loginService";
import { router } from "expo-router";

export function useLoginController() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o email e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const resultado = await fazerLogin({
        email: email.trim(),
        senha,
      });

      console.log("Login realizado com sucesso:");
      console.log(resultado);

      router.replace("/home-empresa");
    } catch (error: any) {
      console.error("Erro no login:", error);

      setErro(
        error.message || "Não foi possível realizar o login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return {
    email,
    setEmail,

    senha,
    setSenha,

    mostrarSenha,
    setMostrarSenha,

    carregando,
    erro,

    entrar,
  };
}