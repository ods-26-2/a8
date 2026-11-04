import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CHAVE_TOKEN = "token";
const CHAVE_USUARIO = "usuario";

async function ler(chave: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return localStorage.getItem(chave);
    return await SecureStore.getItemAsync(chave);
  } catch {
    return null;
  }
}

async function salvar(chave: string, valor: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

async function remover(chave: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(chave);
      return;
    }
    await SecureStore.deleteItemAsync(chave);
  } catch {
    // nada a remover
  }
}

export const armazenamento = {
  lerToken: () => ler(CHAVE_TOKEN),

  async lerUsuario<T>(): Promise<T | null> {
    const bruto = await ler(CHAVE_USUARIO);
    try {
      return bruto ? (JSON.parse(bruto) as T) : null;
    } catch {
      return null;
    }
  },

  async salvarSessao(token: string, usuario: unknown): Promise<void> {
    await salvar(CHAVE_TOKEN, token);
    await salvar(CHAVE_USUARIO, JSON.stringify(usuario));
  },

  async limparSessao(): Promise<void> {
    await remover(CHAVE_TOKEN);
    await remover(CHAVE_USUARIO);
  },
};