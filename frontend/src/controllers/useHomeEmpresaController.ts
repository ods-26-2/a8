import { useState } from "react";

import { ABAS, ATALHOS, IdAba, IdAtalho } from "@/models/HomeEmpresa";

export function useHomeEmpresaController() {
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  function abrirAtalho(_id: IdAtalho) {
    // Por enquanto os atalhos não navegam.
    // Quando as telas existirem: router.push("/cadastro-administrador"), etc.
  }

  return {
    atalhos: ATALHOS,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    abrirAtalho,
  };
}