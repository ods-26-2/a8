import { useState } from "react";
import {useSessao} from "@/contexts/SessaoContext";
import { ABAS, ATALHOS, IdAba, IdAtalho } from "@/models/HomeEmpresa";
import {useRouter} from "expo-router";

const router = useRouter();

export function useHomeEmpresaController() {
  const {usuario, sair} = useSessao();
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  function abrirAtalho(id: IdAtalho) {
    if (id === "convidado") router.push("/cadastro-veiculo-convidado");
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