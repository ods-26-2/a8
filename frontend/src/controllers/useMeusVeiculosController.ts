import { useCallback, useEffect, useState, useRef } from "react";


import { Veiculo } from "@/models/Veiculo";
import { veiculoService } from "@/services/veiculoService";

export function useMeusVeiculosController() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [alvo, setAlvo] = useState<Veiculo | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");
      const { veiculos } = await veiculoService.listarMeus();
      setVeiculos(veiculos);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar seus veículos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const emAndamento = useRef(false);
  
  async function confirmar() {
    if (!alvo || emAndamento.current) return;
    emAndamento.current = true;
    const placa = alvo.placa;

    try {
        setExcluindo(true);
        setErro("");
        await veiculoService.excluirMeu(placa);
        setVeiculos((atual) => atual.filter((v) => v.placa !== placa));
    } catch (error) {
        const mensagem = error instanceof Error ? error.message : "Não foi possível remover o veículo.";
        await carregar();     // mostra o estado real
        setErro(mensagem);
    } finally {
        emAndamento.current = false;
        setExcluindo(false);
        setAlvo(null);
    }
    }

  return {
    veiculos,
    carregando,
    erro,
    recarregar: carregar,
    alvo,
    pedirExclusao: setAlvo,
    cancelar: () => setAlvo(null),
    confirmar,
    excluindo,
  };
}