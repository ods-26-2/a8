
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
import { Cores } from "@/constants/parkflow";
import { useCadastroUsuarioController } from "@/controllers/useCadastroUsuarioController";

export default function CadastroUsuarioView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    form,
    setCampo,
    enviar,
    loading,
    feedback,
    voltar,
  } = useCadastroUsuarioController();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.topo}>
            <Pressable onPress={voltar} hitSlop={10}>
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "chevron_left",
                  web: "chevron_left",
                }}
                tintColor={Cores.texto}
                size={22}
              />
            </Pressable>

            <Image
              source={require("@/assets/images/logo.png")}
              style={s.logo}
            />
          </View>

          <Text style={s.titulo}>Cadastro de usuário</Text>

          <CampoTexto
            label="Nome completo"
            icone={{
              ios: "person",
              android: "person",
              web: "person",
            }}
            placeholder="Digite seu nome"
            autoCapitalize="words"
            value={form.nome}
            onChangeText={(v) => setCampo("nome", v)}
          />

          <CampoTexto
            label="E-mail"
            icone={{
              ios: "envelope",
              android: "mail",
              web: "mail",
            }}
            placeholder="usuario@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setCampo("email", v)}
          />

          <CampoTexto
            label="CPF"
            icone={{
              ios: "person.text.rectangle",
              android: "badge",
              web: "badge",
            }}
            placeholder="Digite os 11 números do CPF"
            keyboardType="numeric"
            maxLength={11}
            value={form.cpf}
            onChangeText={(v) =>
              setCampo("cpf", v.replace(/\D/g, "").slice(0, 11))
            }
          />

          <CampoTexto
            label="Senha"
            icone={{
              ios: "lock",
              android: "lock",
              web: "lock",
            }}
            placeholder="Mínimo de 8 caracteres"
            secureTextEntry
            autoCapitalize="none"
            value={form.senha}
            onChangeText={(v) => setCampo("senha", v)}
          />

          <CampoTexto
            label="Confirmar senha"
            icone={{
              ios: "lock.shield",
              android: "verified_user",
              web: "verified_user",
            }}
            placeholder="Digite a senha novamente"
            secureTextEntry
            autoCapitalize="none"
            value={form.confirmarSenha}
            onChangeText={(v) => setCampo("confirmarSenha", v)}
          />

          {feedback && (
            <Text
              style={[
                s.feedback,
                feedback.tipo === "erro" ? s.erro : s.sucesso,
              ]}
            >
              {feedback.texto}
            </Text>
          )}

          <Pressable
            style={[s.botao, loading && s.botaoOff]}
            onPress={enviar}
            disabled={loading}
          >
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
  safe: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 30,
    marginTop: 24,
    marginBottom: 28,
    fontFamily: "Poppins_700Bold",
  },
  feedback: {
    marginBottom: 14,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  erro: {
    color: Cores.erro,
  },
  sucesso: {
    color: Cores.sucesso,
  },
  botao: {
    backgroundColor: Cores.botao,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  botaoOff: {
    opacity: 0.6,
  },
  botaoTxt: {
    color: Cores.botaoTexto,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
