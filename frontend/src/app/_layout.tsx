import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { Cores } from "@/constants/parkflow";
import { SessaoProvider, useSessao } from "../contexts/SessaoContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessaoProvider>
      <StatusBar style="light" />
      <ControladorSplash />
      <Navegador />
    </SessaoProvider>
  );
}

function ControladorSplash() {
  const { carregando } = useSessao();
  const [fontesProntas, erroFontes] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const pronto = !carregando && (fontesProntas || erroFontes !== null);

  useEffect(() => {
    if (pronto) SplashScreen.hide();
  }, [pronto]);

  return null;
}

function Navegador() {
  const { sessao } = useSessao();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Cores.fundo } }}>
      <Stack.Protected guard={!!sessao}>
        <Stack.Screen name="home-empresa" />
      </Stack.Protected>

      <Stack.Protected guard={!sessao}>
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
    </Stack>
  );
}