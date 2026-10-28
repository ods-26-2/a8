import { useState } from "react";
import {useSessao} from "@/contexts/SessaoContext";
import { ABAS, ATALHOS, IdAba, IdAtalho } from "@/models/HomeEmpresa";

export function useHomeEmpresaController() {
  const {usuario, sair} = useSessao();
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  function abrirAtalho(_id: IdAtalho) {
    // Por enquanto os atalhos não navegam.
    // Quando as telas existirem: router.push("/cadastro-administrador"), etc.
  }

  return {
    nomeEmpresa: usuario?.nome ?? "",
    atalhos: ATALHOS,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    abrirAtalho,
    sair,
  };
}