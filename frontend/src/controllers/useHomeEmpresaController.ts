
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSessao } from "@/contexts/SessaoContext";
import {
  ABAS,
  ATALHOS,
  IdAba,
  IdAtalho,
} from "@/models/HomeEmpresa";

export function useHomeEmpresaController() {
  const router = useRouter();
  const { usuario, sair } = useSessao();

  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  function abrirAtalho(id: IdAtalho) {
    console.log("Atalho clicado:", id);

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
    nomeEmpresa: usuario?.nome ?? "",
    atalhos: ATALHOS,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    abrirAtalho,
    sair,
  };
}
