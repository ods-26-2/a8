export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  mensagem: string;
  tipo: "usuario" | "empresa";
  usuario?: {
    email: string;
    nome: string;
    cpf?: string;
  };
  empresa?: {
    cnpj: string;
    nome: string;
    email: string;
    tipo: string;
    userCadastra: boolean;
  };
}