import { apiRequest } from "./api";
import { AtualizarPerfilPayload, PerfilUsuario } from "../models/Perfil";

export function buscarPerfil(): Promise<PerfilUsuario> {
  return apiRequest<PerfilUsuario>("/api/usuarios/perfil", "GET");
}

export function atualizarPerfil(payload: AtualizarPerfilPayload): Promise<PerfilUsuario> {
  return apiRequest<PerfilUsuario>("/api/usuarios/perfil", "PUT", payload);
}