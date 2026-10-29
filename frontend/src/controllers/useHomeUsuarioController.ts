import { useCallback, useEffect, useState } from "react";

import { useSessao } from "@/contexts/SessaoContext";
import { EmpresaVinculada } from "@/models/EmpresaVinculada";
import { ABAS, IdAba } from "@/models/HomeEmpresa";
import { usuarioService } from "@/services/usuarioService";

export function useHomeUsuarioController() {
  const { usuario, escolherEmpresa, sair } = useSessao();

  const [vinculos, setVinculos] = useState<EmpresaVinculada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abrindo, setAbrindo] = useState<string | null>(null); 
  const [erro, setErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useState<IdAba>("home");

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");
      const { empresas } = await usuarioService.listarEmpresas();
      setVinculos(empresas);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar suas empresas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirEmpresa(empresa: EmpresaVinculada) {
    if (abrindo) return;
    try {
      setAbrindo(empresa.cnpj);
      setErro("");
      const { token, empresa: confirmada } = await usuarioService.entrarEmpresa(empresa.cnpj);
      await escolherEmpresa(token, confirmada); 
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível abrir a empresa.");
    } finally {
      setAbrindo(null);
    }
  }

  return {
    nome: usuario?.nome ?? "",
    condominios: vinculos.filter((e) => e.tipo === "condominio"),
    empresas: vinculos.filter((e) => e.tipo === "empresa"),
    semVinculos: !carregando && !erro && vinculos.length === 0,
    carregando,
    abrindo,
    erro,
    abrirEmpresa,
    recarregar: carregar,
    abas: ABAS,
    abaAtiva,
    setAbaAtiva,
    sair,
  };
}