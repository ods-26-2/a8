export type TipoEmpresa = "empresa" | "condominio";

export interface CadastroEmpresa {
  nome: string;
  cnpj: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: TipoEmpresa;
  userCadastra: boolean;
}

export interface Empresa {
  cnpj: string;
  nome: string;
  tipo: TipoEmpresa;
  email?: string;
  userCadastra?: boolean;
}

export interface RespostaAutenticacao {
  mensagem?: string;
  token: string;
  empresa: Empresa;
}