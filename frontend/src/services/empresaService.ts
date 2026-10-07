import { CadastroEmpresa } from "@/models/Empresa";
import { apiRequest } from "./api";

export const empresaService = {
  cadastrar: (dados: CadastroEmpresa) =>
    apiRequest<{ mensagem: string }>("/api/empresas", "POST", dados),
};