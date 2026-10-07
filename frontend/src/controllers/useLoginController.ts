import { useState } from "react";
import { fazerLogin } from "../services/loginService";

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

      // Por enquanto vamos apenas mostrar no console.
      // Depois decidimos para qual tela o usuário será enviado.

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