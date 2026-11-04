// frontend/src/view/PerfilUsuarioView.tsx
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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Footer } from "@/components/Footer";
import { Cores } from "@/constants/parkflow";
import { usePerfilController } from "@/controllers/usePerfilController";

type CampoProps = {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  editavel?: boolean;
};

function Campo({ label, value, onChangeText, placeholder, secure, editavel = true }: CampoProps) {
  return (
    <View style={s.campo}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, !editavel && s.inputOff]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Cores.textoSecundario}
        secureTextEntry={secure}
        editable={editavel}
        autoCapitalize={secure || !editavel ? "none" : "words"}
        autoCorrect={false}
      />
    </View>
  );
}

export default function PerfilUsuarioView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    perfil, nome, setNome,
    senhaAtual, setSenhaAtual, novaSenha, setNovaSenha, confirmarSenha, setConfirmarSenha,
    carregando, salvando, erro, sucesso, podeSalvar, salvar, recarregar,
    voltar, irParaHome, abasFooter, sair,
  } = usePerfilController();

  if (!fontsLoaded) return null;

  const ehEmpresa = perfil?.tipoConta === "empresa";

  return (
    <View style={s.webBackground}>
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={s.topo}>
              <Pressable onPress={voltar} hitSlop={12} style={s.voltar}>
                <SymbolView
                  name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }}
                  tintColor={Cores.texto}
                  size={24}
                />
              </Pressable>
              <Text style={s.titulo}>Meu perfil</Text>
            </View>

            <View style={s.avatarBox}>
              <SymbolView
                name={
                  ehEmpresa
                    ? { ios: "building.2.fill", android: "business", web: "business" }
                    : { ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" }
                }
                tintColor={Cores.texto}
                size={88}
                style={s.avatar}
              />
            </View>

            {carregando && <ActivityIndicator color={Cores.texto} style={s.carregando} />}

            {!carregando && !perfil && !!erro && (
              <Pressable onPress={recarregar}>
                <Text style={s.erro}>{erro} Toque para tentar de novo.</Text>
              </Pressable>
            )}

            {!!perfil && (
              <>
                <Text style={s.secaoTitulo}>Dados pessoais</Text>
                <Campo
                  label={ehEmpresa ? "Nome da empresa / condomínio" : "Nome"}
                  value={nome}
                  onChangeText={setNome}
                  placeholder={ehEmpresa ? "Nome da empresa ou condomínio" : "Seu nome"}
                />
                <Campo label="E-mail" value={perfil.email} editavel={false} />
                {ehEmpresa ? (
                  <>
                    {!!perfil.cnpj && <Campo label="CNPJ" value={perfil.cnpj} editavel={false} />}
                    {!!perfil.tipoEmpresa && <Campo label="Tipo" value={perfil.tipoEmpresa} editavel={false} />}
                  </>
                ) : (
                  !!perfil.cpf && <Campo label="CPF" value={perfil.cpf} editavel={false} />
                )}

                <Text style={[s.secaoTitulo, s.secaoEspaco]}>Alterar senha</Text>
                <Text style={s.dica}>Deixe em branco se não quiser trocar a senha.</Text>
                <Campo label="Senha atual" value={senhaAtual} onChangeText={setSenhaAtual} secure placeholder="••••••" />
                <Campo label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secure placeholder="Mínimo 6 caracteres" />
                <Campo label="Confirmar nova senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secure placeholder="Repita a nova senha" />

                {!!erro && <Text style={s.erro}>{erro}</Text>}
                {!!sucesso && <Text style={s.sucesso}>{sucesso}</Text>}

                <Pressable
                  style={[s.botao, !podeSalvar && s.botaoOff]}
                  onPress={salvar}
                  disabled={!podeSalvar}>
                  {salvando ? (
                    <ActivityIndicator color={Cores.botaoTexto} />
                  ) : (
                    <Text style={s.botaoTxt}>Salvar alterações</Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {!carregando && (
          <Footer
            abas={abasFooter}
            ativa="perfil"
            onChange={(id) => (id === "perfil" ? undefined : irParaHome())}
            onSair={sair}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  webBackground: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Cores.fundo },
  safe: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Cores.fundo },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 40, width: "100%", maxWidth: 480, alignSelf: "center" },
  topo: { flexDirection: "row", alignItems: "center", gap: 8 },
  voltar: { padding: 4 },
  titulo: { color: Cores.texto, fontSize: 24, fontFamily: "Poppins_700Bold" },
  avatarBox: { alignItems: "center", marginTop: 20, marginBottom: 8 },
  avatar: { width: 88, height: 88 },
  carregando: { marginTop: 40 },
  secaoTitulo: { color: Cores.texto, fontSize: 18, fontFamily: "Poppins_600SemiBold", marginTop: 16, marginBottom: 12 },
  secaoEspaco: { marginTop: 28 },
  dica: { color: Cores.textoSecundario, fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: -6, marginBottom: 12 },
  campo: { marginBottom: 14 },
  label: { color: Cores.textoSecundario, fontSize: 13, fontFamily: "Poppins_500Medium", marginBottom: 6 },
  input: {
    backgroundColor: Cores.botao,
    color: Cores.botaoTexto,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  inputOff: { opacity: 0.6 },
  erro: { color: Cores.erro, textAlign: "center", marginTop: 12, fontFamily: "Poppins_400Regular" },
  sucesso: { color: Cores.texto, textAlign: "center", marginTop: 12, fontFamily: "Poppins_500Medium" },
  botao: {
    backgroundColor: Cores.botao,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  botaoOff: { opacity: 0.5 },
  botaoTxt: { color: Cores.botaoTexto, fontSize: 16, fontFamily: "Poppins_600SemiBold" },
});
