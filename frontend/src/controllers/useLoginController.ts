import { useState } from "react";
import { fazerLogin } from "../services/loginService";
import { useSessao } from "@/contexts/SessaoContext";

export function useLoginController() {
  const {entrar: abrirSessao} = useSessao();
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

      const {token, usuario} = await fazerLogin({email: email.trim(), senha});

      if (usuario.tipo !== "empresa" && usuario.tipo !== "condominio"){
        setErro("Tipo de usuário não permitido.");
        return;
      }

      await abrirSessao(token, usuario);
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