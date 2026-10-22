import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { SymbolView } from "expo-symbols";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Footer } from "@/components/Footer";
import { CartaoAtalho } from "@/components/BotaoAtalho";
import { Cores } from "@/constants/parkflow";
import { useHomeEmpresaController } from "@/controllers/useHomeEmpresaController";

export default function HomeEmpresaView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { atalhos, abas, abaAtiva, setAbaAtiva, abrirAtalho } = useHomeEmpresaController();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={s.webBackground}>
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}>
        <View style={s.topo}>
          <View style={s.perfil}>
            <SymbolView
              name={{
                ios: "person.crop.circle.fill",
                android: "account_circle",
                web: "account_circle",
              }}
              tintColor={Cores.texto}
              size={44}
              style={s.avatar}
            />
            <Text style={s.bemVindo}>Bem-vindo</Text>
          </View>

          <Image source={require("@/assets/images/logo.png")} style={s.logo} />
        </View>

        <View style={s.grade}>
          {atalhos.map((atalho) => (
            <CartaoAtalho
              key={atalho.id}
              titulo={atalho.titulo}
              icone={atalho.icone}
              onPress={() => abrirAtalho(atalho.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Footer abas={abas} ativa={abaAtiva} onChange={setAbaAtiva} />
    </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
    webBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Cores.fundo,
  },
  safe: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Cores.fundo },
  flex: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  perfil: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, marginRight: 8 },
  avatar: { width: 44, height: 44 },
  bemVindo: { color: Cores.texto, fontSize: 20, fontFamily: "Poppins_700Bold" },
  logo: { width: 100, height: 100 },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    marginTop: 24,
  },
});