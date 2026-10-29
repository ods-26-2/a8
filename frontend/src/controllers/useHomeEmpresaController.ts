import { useRouter } from "expo-router";
import { useState } from "react";

import { useSessao } from "@/contexts/SessaoContext";
import { ABAS, ATALHOS, ATALHOS_POR_FUNCAO, IdAba, IdAtalho } from "@/models/HomeEmpresa";

export function useHomeEmpresaController() {
  const router = useRouter();
  const { usuario, empresaAtual, sair, voltarParaEmpresas } = useSessao();

  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  // Mostra só os atalhos que a função (empresa / adm / comum) pode usar
  const funcao = empresaAtual?.funcao ?? "comum";
  const atalhos = ATALHOS.filter((a) => ATALHOS_POR_FUNCAO[funcao].includes(a.id));

  function abrirAtalho(id: IdAtalho) {
    switch (id) {
      case "convidado":
        router.push("/cadastro-veiculo-convidado");
        break;
      case "usuario":
        router.push("/cadastro-usuario");
        break;
      default:
        console.warn("Atalho sem rota configurada:", id);
    }
  }

  return {
    nomeEmpresa: empresaAtual?.nome ?? "",
    podeTrocarEmpresa: usuario?.tipo === "usuario",
    trocarEmpresa: voltarParaEmpresas,
    atalhos,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    abrirAtalho,
    sair,
  };
}