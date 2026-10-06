import { useState } from "react";

import { useSessao } from "@/contexts/SessaoContext";
import { ABAS, ATALHOS, IdAba, IdAtalho } from "@/models/HomeEmpresa";

export function useHomeEmpresaController() {
  const { sessao, sair } = useSessao();
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  function abrirAtalho(_id: IdAtalho) {
    // por enquanto nao tem
  }

  return {
    nome: sessao?.empresa.nome ?? "",
    atalhos: ATALHOS,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    abrirAtalho,
    sair,
  };
}