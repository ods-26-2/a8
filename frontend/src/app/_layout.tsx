import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Cores } from "@/constants/parkflow";
import { SessaoProvider, useSessao } from "@/contexts/SessaoContext";

function Rotas() {
  const { usuario, carregando } = useSessao();

  if (carregando) return null; // espera ler a sessão salva

  const logado = !!usuario;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Cores.fundo } }}>
      {/* Só com sessão */}
      <Stack.Protected guard={logado}>
        <Stack.Screen name="home-empresa" />
        <Stack.Screen name="cadastro-veiculo-convidado" />
      </Stack.Protected>

      {/* Só sem sessão: acesso, login e cadastro de empresa */}
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="index" />
        <Stack.Screen name="acesso" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessaoProvider>
      <StatusBar style="light" />
      <Rotas />
    </SessaoProvider>
  );
}