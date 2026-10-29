import { useRouter } from "expo-router";
import { useState } from "react";
import {useSessao} from "@/contexts/SessaoContext";

import { CadastroVeiculoConvidado } from "@/models/VeiculoConvidado";
import { veiculoConvidadoService } from "@/services/veiculoConvidadoService";
import { dataHoraParaApi } from "@/utils/dataHora";

const FORM_INICIAL: CadastroVeiculoConvidado = {
  placa: "",
  emailUsuario: "",
  dataEntrada: "",
  dataSaida: "",
};

type Feedback = { tipo: "erro" | "sucesso"; texto: string } | null;

export function useCadastroVeiculoConvidadoController() {
  const router = useRouter();
  const {usuario, empresaAtual} = useSessao();
  const emailTravado = empresaAtual?.funcao !== "empresa";

  const [form, setForm] = useState<CadastroVeiculoConvidado>(() => ({
    ...FORM_INICIAL,
    emailUsuario: emailTravado ? usuario?.email ?? "" : "",
    }));
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function setCampo<K extends keyof CadastroVeiculoConvidado>(
    campo: K,
    valor: CadastroVeiculoConvidado[K]
  ) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar() {
    const { placa, emailUsuario, dataEntrada, dataSaida } = form;

    if (!placa || !emailUsuario || !dataEntrada) {
      return setFeedback({ tipo: "erro", texto: "Preencha placa, e-mail e data de entrada." });
    }
    if (placa.length !== 7) {
      return setFeedback({ tipo: "erro", texto: "A placa deve ter 7 caracteres." });
    }

    const entrada = dataHoraParaApi(dataEntrada);
    if (!entrada) {
      return setFeedback({ tipo: "erro", texto: "Entrada inválida. Use DD/MM/AAAA HH:MM." });
    }

    const saida = dataSaida ? dataHoraParaApi(dataSaida) : null;
    if (dataSaida && !saida) {
      return setFeedback({ tipo: "erro", texto: "Saída inválida. Use DD/MM/AAAA HH:MM." });
    }
    if (saida && saida < entrada) {
      return setFeedback({ tipo: "erro", texto: "A saída deve ser depois da entrada." });
    }

    try {
      setLoading(true);
      setFeedback(null);
      await veiculoConvidadoService.cadastrar({
        placa,
        emailUsuario: emailUsuario.trim(),
        dataEntrada: entrada,
        dataSaida: saida ?? undefined,
      });
      router.replace("/home-empresa");
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