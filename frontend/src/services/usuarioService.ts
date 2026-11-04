import { EmpresaVinculada } from "@/models/EmpresaVinculada";
import { apiRequest } from "./api";

type DadosUsuario = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
};

export function cadastrarUsuario(dados: DadosUsuario, _token?: string) {
  return apiRequest<{ mensagem: string }>("/api/usuarios", "POST", dados);
}

export const usuarioService = {
  listarEmpresas: () =>
    apiRequest<{ empresas: EmpresaVinculada[] }>("/api/usuarios/empresas"),

  entrarEmpresa: (cnpj: string) =>
    apiRequest<{ token: string; empresa: EmpresaVinculada }>(
      "/api/usuarios/entrar-empresa",
      "POST",
      { cnpj }
    ),
};