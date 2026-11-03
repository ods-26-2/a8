import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { useSessao } from "@/contexts/SessaoContext";
import { VeiculoVinculado } from "@/models/Veiculo";
import { veiculoService } from "@/services/veiculoService";

export function useVeiculosVinculadosController() {
  const router = useRouter();
  const { empresaAtual } = useSessao();

  // empresa e adm veem todos, buscam por placa e removem de qualquer usuário
  const ehGestor = empresaAtual?.funcao !== "comum";
  const podeCadastrar = ehGestor || !!empresaAtual?.usuariosCadastram;

  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState(""); // busca com atraso, para não chamar a API a cada tecla
  const [veiculos, setVeiculos] = useState<VeiculoVinculado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [alvo, setAlvo] = useState<VeiculoVinculado | null>(null);
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTermo(busca), 350);
    return () => clearTimeout(t);
  }, [busca]);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");
      const { veiculos } = await veiculoService.listarDaEmpresa(termo || undefined);
      setVeiculos(veiculos);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os veículos.");
    } finally {
      setCarregando(false);
    }
  }, [termo]);

  // recarrega ao abrir a tela, ao voltar do cadastro e quando a busca muda
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function confirmarRemocao() {
    if (!alvo) return;
    try {
      setRemovendo(true);
      await veiculoService.desvincularDaEmpresa(alvo.placa, alvo.emailUsuario);
      setVeiculos((atual) =>
        atual.filter((v) => !(v.placa === alvo.placa && v.emailUsuario === alvo.emailUsuario))
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível remover o veículo.");
    } finally {
      setRemovendo(false);
      setAlvo(null);
    }
  }

  return {
    nomeEmpresa: empresaAtual?.nome ?? "",
    ehGestor,
    podeCadastrar,
    busca,
    setBusca: (v: string) => setBusca(v.replace(/[^A-Za-z0-9]/g, "").toUpperCase()),
    veiculos,
    carregando,
    erro,
    recarregar: carregar,
    alvo,
    pedirRemocao: setAlvo,
    cancelar: () => setAlvo(null),
    confirmarRemocao,
    removendo,
    cadastrarNovo: () => router.push("/cadastro-veiculo"),
    voltar: () => router.back(),
  };
}