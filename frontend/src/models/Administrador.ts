export type FormAdministrador = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

export const FORM_ADMINISTRADOR_VAZIO: FormAdministrador = {
  nome: "",
  email: "",
  cpf: "",
  senha: "",
  confirmarSenha: "",
};

export type CadastrarAdministradorPayload = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
};