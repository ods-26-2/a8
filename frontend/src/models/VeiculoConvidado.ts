export interface CadastroVeiculoConvidado {
  placa: string;
  emailUsuario: string;
  dataEntrada: string; // DD/MM/AAAA HH:MM
  dataSaida: string;   // opcional
}

export interface VeiculoConvidadoRequest {
  placa: string;
  emailUsuario: string;
  dataEntrada: string; // YYYY-MM-DD HH:MM:SS
  dataSaida?: string;
}