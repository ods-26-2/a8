import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CartaoVeiculo } from "@/components/CartaoVeiculo";
import { CampoTexto } from "@/components/Input";
import { ModalConfirmar } from "@/components/ModalConfirmar";
import { Cores } from "@/constants/parkflow";
import { useVeiculosVinculadosController } from "@/controllers/useVeiculosVinculadosController";

export default function VeiculosVinculadosView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    nomeEmpresa, ehGestor, podeCadastrar, busca, setBusca, veiculos, carregando, erro, recarregar,
    alvo, pedirRemocao, cancelar, confirmarRemocao, removendo, cadastrarNovo, voltar,
  } = useVeiculosVinculadosController();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={s.safe}>
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

        <Text style={s.titulo}>Veículos vinculados</Text>
        <Text style={s.subtitulo} numberOfLines={1}>{nomeEmpresa}</Text>

        {ehGestor && (
          <CampoTexto
            label="Buscar por placa"
            icone={{ ios: "magnifyingglass", android: "search", web: "search" }}
            placeholder="Ex.: ABC1D23"
            autoCapitalize="characters"
            maxLength={7}
            value={busca}
            onChangeText={setBusca}
          />
        )}

        {podeCadastrar && (
          <Pressable style={s.botao} onPress={cadastrarNovo}>
            <Text style={s.botaoTxt}>Cadastrar novo</Text>
          </Pressable>
        )}

        {carregando && <ActivityIndicator color={Cores.texto} style={s.espaco} />}

        {!!erro && (
          <Pressable onPress={recarregar}>
            <Text style={s.erro}>{erro} Toque para tentar de novo.</Text>
          </Pressable>
        )}

        {!carregando && !erro && veiculos.length === 0 && (
          <Text style={s.vazio}>
            {busca ? "Nenhum veículo encontrado com essa placa." : "Nenhum veículo vinculado a esta empresa."}
          </Text>
        )}

        <View style={s.grade}>
          {veiculos.map((v) => (
            <CartaoVeiculo
              key={`${v.placa}-${v.emailUsuario}`}
              modelo={v.modelo ?? "Sem modelo"}
              cor={v.cor ?? "—"}
              placa={v.placa}
              detalhe={ehGestor ? v.nomeUsuario : undefined}
              onExcluir={() => pedirRemocao(v)}
            />
          ))}
        </View>
      </ScrollView>

      <ModalConfirmar
        visivel={!!alvo}
        titulo="Remover veículo"
        mensagem={`Tem certeza que quer remover ${alvo?.modelo}-${alvo?.cor}?`}
        detalhe="Ele sai desta empresa, mas continua cadastrado para o usuário."
        carregando={removendo}
        onConfirmar={confirmarRemocao}
        onCancelar={cancelar}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Cores.fundo },
  content: { padding: 24, paddingBottom: 40, width: "100%", maxWidth: 480, alignSelf: "center" },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 100, height: 100 },
  titulo: { color: Cores.texto, fontSize: 30, marginTop: 24, fontFamily: "Poppins_700Bold" },
  subtitulo: { color: Cores.textoSecundario, fontSize: 14, marginBottom: 24, fontFamily: "Poppins_500Medium" },
  botao: { backgroundColor: Cores.botao, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 24 },
  botaoTxt: { color: Cores.botaoTexto, fontSize: 16, fontFamily: "Poppins_700Bold" },
  espaco: { marginTop: 24 },
  erro: { color: Cores.erro, textAlign: "center", marginTop: 16 },
  vazio: { color: Cores.textoSecundario, textAlign: "center", marginTop: 24 },
  grade: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
});