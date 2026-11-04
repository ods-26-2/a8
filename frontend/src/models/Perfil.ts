export type TipoConta = "usuario" | "empresa";

export type PerfilUsuario = {
  tipoConta: TipoConta;
  ehAdmin?: boolean;
  email: string;
  nome: string;
  cpf?: string | null;
  cnpj?: string | null;
  tipoEmpresa?: string | null;
};

export type AtualizarPerfilPayload = {
  nome?: string;
  senhaAtual?: string;
  novaSenha?: string;
};
