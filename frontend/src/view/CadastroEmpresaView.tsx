import { SymbolView } from "expo-symbols";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CampoTexto } from "@/components/Input";
import { Cores } from "@/constants/parkflow";
import { useCadastroEmpresaController } from "@/controllers/useCadastroEmpresaController";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";

export default function CadastroEmpresaView() {

    const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    });

  const { form, setCampo, enviar, loading, feedback, podeVoltar, voltar } =
    useCadastroEmpresaController();

    if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={s.topo}>
            {podeVoltar ? (
              <Pressable onPress={voltar} hitSlop={10}>
                <SymbolView
                  name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
                  tintColor={Cores.texto}
                  size={22}
                />
              </Pressable>
            ) : (
              <View style={s.espaco} />
            )}
            <Image
                source={require("@/assets/images/logo.png")}
                style={s.logo}
            />
          </View>

          <Text style={s.titulo}>Cadastrar Empresa</Text>

          <CampoTexto
            label="Nome da empresa"
            icone={{ ios: "person", android: "person", web: "person" }}
            placeholder="Ex.: Condomínio dos Sonhos"
            autoCapitalize="words"
            value={form.nome}
            onChangeText={(v) => setCampo("nome", v)}
          />
          <CampoTexto
            label="CNPJ"
            icone={{ ios: "building.2", android: "apartment", web: "apartment" }}
            placeholder="Somente números"
            keyboardType="numeric"
            maxLength={14}
            value={form.cnpj}
            onChangeText={(v) => setCampo("cnpj", v.replace(/\D/g, ""))}
          />
          <CampoTexto
            label="E-mail"
            icone={{ ios: "envelope", android: "mail", web: "mail" }}
            placeholder="empresa@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setCampo("email", v)}
          />
          <CampoTexto
            label="Senha"
            icone={{ ios: "lock", android: "lock", web: "lock" }}
            placeholder="Mínimo de 6 caracteres"
            senha
            value={form.senha}
            onChangeText={(v) => setCampo("senha", v)}
          />
          <CampoTexto
            label="Confirmar senha"
            icone={{ ios: "lock", android: "lock", web: "lock" }}
            placeholder="Repita a senha"
            senha
            value={form.confirmarSenha}
            onChangeText={(v) => setCampo("confirmarSenha", v)}
          />

          <Text style={s.label}>Tipo</Text>
          <View style={s.linhaTipo}>
            {(["empresa", "condominio"] as const).map((t) => (
              <Pressable
                key={t}
                style={[s.tipo, form.tipo === t && s.tipoAtivo]}
                onPress={() => setCampo("tipo", t)}>
                <Text style={[s.tipoTxt, form.tipo === t && s.tipoTxtAtivo]}>
                  {t === "empresa" ? "Empresa" : "Condomínio"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={s.linhaSwitch}>
            <Text style={s.switchTxt}>Permitir cadastro de usuários</Text>
            <Switch
              value={form.userCadastra}
              onValueChange={(v) => setCampo("userCadastra", v)}
              trackColor={{ false: Cores.borda, true: Cores.botao }}
              thumbColor={form.userCadastra ? Cores.fundo : Cores.texto}
            />
          </View>

          {feedback && (
            <Text style={[s.feedback, feedback.tipo === "erro" ? s.erro : s.sucesso]}>
              {feedback.texto}
            </Text>
          )}

          <Pressable style={[s.botao, loading && s.botaoOff]} onPress={enviar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Cores.botaoTexto} />
            ) : (
              <Text style={s.botaoTxt}>Cadastrar</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Cores.fundo },
  flex: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  espaco: { width: 22 },
  logo: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTxt: { color: Cores.texto, fontWeight: "800", fontSize: 18 },
  titulo: { color: Cores.texto, fontSize: 30, marginTop: 24, marginBottom: 28, fontFamily: "Poppins_700Bold" },
  label: { color: Cores.textoSecundario, fontSize: 13, fontFamily: "Poppins_500Medium", marginBottom: 6 },
  linhaTipo: { flexDirection: "row", gap: 10, marginBottom: 18 },
  tipo: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cores.borda,
    backgroundColor: Cores.campo,
    alignItems: "center",
  },
  tipoAtivo: { backgroundColor: Cores.botao, borderColor: Cores.botao },
  tipoTxt: { color: Cores.texto, fontFamily: "Poppins_500Medium" },
  tipoTxtAtivo: { color: Cores.botaoTexto, fontWeight: "600", fontFamily: "Poppins_600SemiBold" },
  linhaSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  switchTxt: { color: Cores.texto, fontSize: 14, flex: 1, marginRight: 12, fontFamily: "Poppins_400Regular" },
  feedback: { marginBottom: 14, textAlign: "center" },
  erro: { color: Cores.erro },
  sucesso: { color: Cores.sucesso },
  botao: { backgroundColor: Cores.botao, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  botaoOff: { opacity: 0.6 },
  botaoTxt: { color: Cores.botaoTexto, fontWeight: "700", fontSize: 16, fontFamily: "Poppins_700Bold" },
});