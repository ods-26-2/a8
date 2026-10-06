import { CadastroEmpresa, Empresa, RespostaAutenticacao } from "@/models/Empresa";
import { apiRequest } from "./api";

export const empresaService = {
  cadastrar: (dados: CadastroEmpresa) =>
    apiRequest<RespostaAutenticacao>("/api/empresas", "POST", dados),

  perfil: (token: string) =>
    apiRequest<{ empresa: Empresa }>("/api/empresas/me", "GET", undefined, token),
};