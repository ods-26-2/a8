export const CORES_VEICULO = [
  { nome: "Preto", hex: "#111111" },
  { nome: "Branco", hex: "#F5F5F5" },
  { nome: "Prata", hex: "#C0C0C0" },
  { nome: "Cinza", hex: "#808080" },
  { nome: "Vermelho", hex: "#D32F2F" },
  { nome: "Azul", hex: "#1976D2" },
  { nome: "Verde", hex: "#388E3C" },
  { nome: "Amarelo", hex: "#FBC02D" },
  { nome: "Marrom", hex: "#6D4C41" },
  { nome: "Laranja", hex: "#F57C00" },
] as const;

export function hexDaCor(nome: string): string {
  return CORES_VEICULO.find((c) => c.nome === nome)?.hex ?? "#808080";
}

export interface Veiculo {
  placa: string;
  modelo: string;
  cor: string;
}

export interface VeiculoVinculado extends Veiculo {
  emailUsuario: string;
  nomeUsuario: string;
}

export interface CadastroVeiculo {
  placa: string;
  modelo: string;
  cor: string;
  emailUsuario: string;
}