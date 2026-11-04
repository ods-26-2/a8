import { EmpresaAtual } from "./EmpresaVinculada";

export interface LoginRequest {
  email: string;
  senha: string;
}

export type TipoConta = "empresa" | "condominio" | "usuario";

export interface UsuarioLogado {
  email: string;
  nome: string;
  tipo: TipoConta;
  cnpj?: string;
  cpf?: string;
  empresaAtual?: EmpresaAtual; 
}

export interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
}