import { CadastroVeiculo, Veiculo, VeiculoVinculado } from "@/models/Veiculo";
import { apiRequest } from "./api";

export const veiculoService = {
  // home do usuário
  listarMeus: () => apiRequest<{ veiculos: Veiculo[] }>("/api/veiculos/meus"),

  excluirMeu: (placa: string) =>
    apiRequest<{ mensagem: string }>(`/api/veiculos/meus/${encodeURIComponent(placa)}`, "DELETE"),

  // dentro da empresa
  listarDaEmpresa: (placa?: string) =>
    apiRequest<{ veiculos: VeiculoVinculado[] }>(
      `/api/veiculos/empresa${placa ? `?placa=${encodeURIComponent(placa)}` : ""}`
    ),

  cadastrarNaEmpresa: (dados: CadastroVeiculo) =>
    apiRequest<{ mensagem: string }>("/api/veiculos/empresa", "POST", dados),

  desvincularDaEmpresa: (placa: string, email: string) =>
    apiRequest<{ mensagem: string }>(
      `/api/veiculos/empresa/${encodeURIComponent(placa)}/${encodeURIComponent(email)}`,
      "DELETE"
    ),
};