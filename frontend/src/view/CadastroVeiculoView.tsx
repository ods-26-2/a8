import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CampoTexto } from "@/components/Input";
import { SeletorCor } from "@/components/SeletorCor";
import { Cores } from "@/constants/parkflow";
import { useCadastroVeiculoController } from "@/controllers/useCadastroVeiculoController";

export default function CadastroVeiculoView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { form, setCampo, enviar, loading, feedback, emailTravado, voltar } =
    useCadastroVeiculoController();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.topo}>
            <Pressable onPress={voltar} hitSlop={10}>
              <SymbolView
                name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
                tintColor={Cores.texto}
                size={22}
              />
            </Pressable>
            <Image source={require("@/assets/images/logo.png")} style={s.logo} />
          </View>

          <Text style={s.titulo}>Cadastrar veículo</Text>

          <CampoTexto
            label="Placa"
            icone={{ ios: "car", android: "directions_car", web: "directions_car" }}
            placeholder="Ex.: ABC1D23"
            autoCapitalize="characters"
            maxLength={7}
            value={form.placa}
            onChangeText={(v) => setCampo("placa", v.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
          />
          <CampoTexto
            label="Modelo"
            icone={{ ios: "car.side", android: "directions_car", web: "directions_car" }}
            placeholder="Ex.: Gol"
            autoCapitalize="words"
            maxLength={60}
            value={form.modelo}
            onChangeText={(v) => setCampo("modelo", v)}
          />

          <SeletorCor valor={form.cor} onChange={(cor) => setCampo("cor", cor)} />

          <CampoTexto
            label="E-mail do usuário"
            icone={{ ios: "envelope", android: "mail", web: "mail" }}
            placeholder="usuario@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.emailUsuario}
            editable={!emailTravado}
            style={emailTravado ? { opacity: 0.6 } : undefined}
            onChangeText={(v) => setCampo("emailUsuario", v)}
          />

          {feedback && (
            <Text style={[s.feedback, feedback.tipo === "erro" ? s.erro : s.sucesso]}>{feedback.texto}</Text>
          )}

          <Pressable style={[s.botao, loading && s.botaoOff]} onPress={enviar} disabled={loading}>
            {loading ? <ActivityIndicator color={Cores.botaoTexto} /> : <Text style={s.botaoTxt}>Cadastrar</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Cores.fundo },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, width: "100%", maxWidth: 480, alignSelf: "center" },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 100, height: 100 },
  titulo: { color: Cores.texto, fontSize: 30, marginTop: 24, marginBottom: 28, fontFamily: "Poppins_700Bold" },
  feedback: { marginBottom: 14, textAlign: "center" },
  erro: { color: Cores.erro },
  sucesso: { color: Cores.sucesso },
  botao: { backgroundColor: Cores.botao, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  botaoOff: { opacity: 0.6 },
  botaoTxt: { color: Cores.botaoTexto, fontSize: 16, fontFamily: "Poppins_700Bold" },
});