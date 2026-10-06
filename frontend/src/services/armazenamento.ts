import * as SecureStore from "expo-secure-store";
import {Platform} from "react-native";

const CHAVE_TOKEN = "token";

export const armazenamento = {
  async lerToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") return localStorage.getItem(CHAVE_TOKEN);
      return await SecureStore.getItemAsync(CHAVE_TOKEN);
    } catch {
      return null;
    }
  },

  async salvarToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(CHAVE_TOKEN, token);
      return;
    }
    await SecureStore.setItemAsync(CHAVE_TOKEN, token);
  },

  async removerToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(CHAVE_TOKEN);
        return;
      }
      await SecureStore.deleteItemAsync(CHAVE_TOKEN);
    } catch {
      // nada a remover
    }
  },
};