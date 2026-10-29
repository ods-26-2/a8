import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Cores } from "@/constants/parkflow";
import { SessaoProvider, useSessao } from "@/contexts/SessaoContext";

function Rotas() {
  const { usuario, empresaAtual, carregando } = useSessao();

  if (carregando) return null;

  const logado = !!usuario;
  const naEmpresa = !!empresaAtual;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Cores.fundo } }}>
      {/* Usuário logado que ainda não escolheu empresa */}
      <Stack.Protected guard={logado && !naEmpresa}>
        <Stack.Screen name="home-usuario" />
      </Stack.Protected>

      {/* Dentro de uma empresa (login da empresa, ou usuário que escolheu uma) */}
      <Stack.Protected guard={naEmpresa}>
        <Stack.Screen name="home-empresa" />
        <Stack.Screen name="cadastro-veiculo-convidado" />
        <Stack.Screen name="cadastro-usuario" />
      </Stack.Protected>

      {/* Sem sessão */}
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