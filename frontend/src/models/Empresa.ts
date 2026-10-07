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