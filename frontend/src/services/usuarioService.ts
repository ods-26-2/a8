const API_URL = "http://localhost:3000";

type DadosUsuario = {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
};

type RespostaCadastro = {
  mensagem: string;
};

export async function cadastrarUsuario(
  dados: DadosUsuario,
  token: string
): Promise<RespostaCadastro> {
  const resposta = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado.mensagem ||
        resultado.erro ||
        "Não foi possível cadastrar o usuário."
    );
  }

  return resultado;
}
