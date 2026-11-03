import { useRouter } from "expo-router";
import { useState } from "react";

import { useSessao } from "@/contexts/SessaoContext";
import { CadastroVeiculo } from "@/models/Veiculo";
import { veiculoService } from "@/services/veiculoService";

type Feedback = { tipo: "erro" | "sucesso"; texto: string } | null;

export function useCadastroVeiculoController() {
  const router = useRouter();
  const { usuario, empresaAtual } = useSessao();

  // usuário comum cadastra para si; empresa e adm escolhem o e-mail
  const emailTravado = empresaAtual?.funcao === "comum";

  const [form, setForm] = useState<CadastroVeiculo>(() => ({
    placa: "",
    modelo: "",
    cor: "",
    emailUsuario: emailTravado ? usuario?.email ?? "" : "",
  }));
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function setCampo<K extends keyof CadastroVeiculo>(campo: K, valor: CadastroVeiculo[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setFeedback(null);
  }

  async function enviar() {
    if (loading) return;

    const { placa, modelo, cor, emailUsuario } = form;

    if (!placa || !modelo.trim() || !cor || !emailUsuario.trim()) {
      return setFeedback({ tipo: "erro", texto: "Preencha placa, modelo, cor e e-mail." });
    }
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
      return setFeedback({ tipo: "erro", texto: "Placa inválida. Ex.: ABC1D23." });
    }
    if (modelo.trim().length < 2) {
      return setFeedback({ tipo: "erro", texto: "Informe o modelo do veículo." });
    }

    try {
      setLoading(true);
      setFeedback(null);
      await veiculoService.cadastrarNaEmpresa({
        placa,
        modelo: modelo.trim(),
        cor,
        emailUsuario: emailUsuario.trim(),
      });
      router.back(); // a lista recarrega sozinha ao ganhar foco
    } catch (error) {
      setFeedback({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Falha ao conectar.",
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setCampo,
    enviar,
    loading,
    feedback,
    emailTravado,
    voltar: () => router.back(),
  };
}