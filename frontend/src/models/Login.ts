export interface LoginRequest {
  email: string;
  senha: string;
}

export type TipoConta =
  | "empresa"
  | "condominio"
  | "empresa_adm"
  | "empresa_usuario"
  | "usuario";

export interface UsuarioLogado {
  email: string;
  nome: string;
  tipo: TipoConta;
  cnpj?: string;
  cpf?: string;
}

export interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
}