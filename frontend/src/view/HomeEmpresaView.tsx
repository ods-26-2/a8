import { SymbolView } from "expo-symbols";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Footer } from "@/components/Footer";
import { CartaoAtalho } from "@/components/BotaoAtalho";
import { Cores } from "@/constants/parkflow";
import { useHomeEmpresaController } from "@/controllers/useHomeEmpresaController";

export default function HomeEmpresaView() {
  const { nome, atalhos, abas, abaAtiva, setAbaAtiva, abrirAtalho, sair } =
    useHomeEmpresaController();

  return (
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
            <View style={s.boasVindas}>
              <Text style={s.bemVindo}>Bem-vindo,</Text>
              <Text style={s.nome} numberOfLines={2}>
                {nome}
              </Text>
            </View>
          </View>

          {/* Toque longo no logo = sair da conta (provisório, até existir a aba Perfil) */}
          <Pressable onLongPress={sair} delayLongPress={600}>
            <Image source={require("@/assets/images/logo.png")} style={s.logo} />
          </Pressable>
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
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Cores.fundo },
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
  boasVindas: { flex: 1 },
  bemVindo: { color: Cores.textoSecundario, fontSize: 12, fontFamily: "Poppins_400Regular" },
  nome: { color: Cores.texto, fontSize: 18, fontFamily: "Poppins_700Bold" },
  logo: { width: 100, height: 100 },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    marginTop: 24,
  },
});