import { VeiculoConvidadoRequest } from "@/models/VeiculoConvidado";
import { apiRequest } from "./api";

export const veiculoConvidadoService = {
  cadastrar: (dados: VeiculoConvidadoRequest) =>
    apiRequest<{ mensagem: string }>("/api/veiculos-convidados", "POST", dados),
};