export type Usuario = {
  nome: string;
  email: string;
  cpf: string;
};

export type CadastroUsuario = {
  nome: string;
  email: string;
  cpf: string;
  cnpj: string;
  senha: string;
  confirmarSenha: string;
};

export type RespostaCadastroUsuario = {
  mensagem: string;
  usuario?: Usuario & {
    cnpj: string;
  };
  erro?: string;
};
