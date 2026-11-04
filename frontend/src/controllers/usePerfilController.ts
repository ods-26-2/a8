import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { atualizarPerfil, buscarPerfil } from "@/services/perfilService";
import { useSessao } from "@/contexts/SessaoContext";
import { ABAS_USUARIO, abasPorFuncao } from "@/models/HomeEmpresa";
import { PerfilUsuario } from "@/models/Perfil";

export function usePerfilController() {
  const router = useRouter();
  const { sair, empresaAtual } = useSessao(); // mesmo "sair" usado na home

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [nome, setNome] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await buscarPerfil();
      setPerfil(dados);
      setNome(dados.nome ?? "");
    } catch (e: any) {
      // mostra o motivo real (ex.: "Cannot GET", "Token inválido", "Conta não encontrada")
      setErro(`Não foi possível carregar o perfil: ${e?.message ?? "erro desconhecido"}.`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const quererTrocarSenha = !!(senhaAtual || novaSenha || confirmarSenha);
  const nomeAlterado = !!perfil && nome.trim() !== perfil.nome;
  const podeSalvar = (nomeAlterado || quererTrocarSenha) && !salvando;

  function validar(): string | null {
    if (nome.trim().length < 2) return "Informe um nome válido.";
    if (quererTrocarSenha) {
      if (!senhaAtual) return "Informe a senha atual.";
      if (novaSenha.length < 6) return "A nova senha deve ter pelo menos 6 caracteres.";
      if (novaSenha !== confirmarSenha) return "A confirmação não confere com a nova senha.";
      if (novaSenha === senhaAtual) return "A nova senha deve ser diferente da atual.";
    }
    return null;
  }

  async function salvar() {
    setErro("");
    setSucesso("");

    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }

    setSalvando(true);
    try {
      const atualizado = await atualizarPerfil({
        nome: nome.trim(),
        ...(quererTrocarSenha ? { senhaAtual, novaSenha } : {}),
      });
      setPerfil(atualizado);
      setNome(atualizado.nome);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso("Perfil atualizado! Faça login novamente para continuar.");
      // encerra a sessão para o login refletir os dados novos (nome/senha)
      setTimeout(() => {
        sair();
      }, 1500);
    } catch (e: any) {
      setErro(e?.message ?? "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  // Abas do footer iguais às da home de onde o usuário veio
  const abasFooter = !perfil
    ? abasPorFuncao("comum")
    : perfil.tipoConta === "empresa"
      ? abasPorFuncao("empresa")
      : empresaAtual
        ? abasPorFuncao(perfil.ehAdmin ? "adm" : "comum")
        : ABAS_USUARIO;

  // Vai direto para a home da sessão atual. dismissTo volta para ela se já estiver na pilha
  // (evita empilhar a home duas vezes); senão, navega até ela.
  function irParaHome() {
    const rota = empresaAtual ? "/home-empresa" : "/home-usuario";
    router.dismissTo(rota as any);
  }

  return {
    perfil,
    nome, setNome,
    senhaAtual, setSenhaAtual,
    novaSenha, setNovaSenha,
    confirmarSenha, setConfirmarSenha,
    carregando, salvando, erro, sucesso,
    podeSalvar, salvar, recarregar: carregar,
    voltar: () => (router.canGoBack() ? router.back() : irParaHome()),
    irParaHome,
    abasFooter,
    sair,
  };
}