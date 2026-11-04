import { apiRequest } from "./api";
import { CadastrarAdministradorPayload } from "../models/Administrador";

export const administradorService = {
  cadastrar(payload: CadastrarAdministradorPayload) {
    return apiRequest<{ mensagem: string }>("/api/administradores", "POST", payload);
  },
};