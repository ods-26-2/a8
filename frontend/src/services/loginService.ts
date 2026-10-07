import { apiRequest } from "./api";
import { LoginRequest, LoginResponse } from "../models/Login";

export async function fazerLogin(
  dados: LoginRequest
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/api/login",
    "POST",
    dados
  );
}