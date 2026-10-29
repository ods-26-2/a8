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

import { Footer } from "@/components/Footer";
import { Cores } from "@/constants/parkflow";
import { useHomeUsuarioController } from "@/controllers/useHomeUsuarioController";
import { EmpresaVinculada } from "@/models/EmpresaVinculada";
import { Icone } from "@/models/HomeEmpresa";

type SecaoProps = {
  titulo: string;
  icone: Icone;
  itens: EmpresaVinculada[];
  abrindo: string | null;
  onPress: (empresa: EmpresaVinculada) => void;
};

function Secao({ titulo, icone, itens, abrindo, onPress }: SecaoProps) {
  if (itens.length === 0) return null;

  return (
    <View style={s.secao}>
      <View style={s.secaoTopo}>
        <Text style={s.secaoTitulo}>{titulo}</Text>
        <SymbolView name={icone} tintColor={Cores.texto} size={26} style={s.secaoIcone} />
      </View>

      {itens.map((empresa) => (
        <Pressable
          key={empresa.cnpj}
          style={[s.item, abrindo === empresa.cnpj && s.itemOff]}
          onPress={() => onPress(empresa)}
          disabled={!!abrindo}>
          <Text style={s.itemTxt} numberOfLines={1}>{empresa.nome}</Text>
          {abrindo === empresa.cnpj ? (
            <ActivityIndicator color={Cores.botaoTexto} />
          ) : (
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              tintColor={Cores.botaoTexto}
              size={20}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}

export default function HomeUsuarioView() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    nome, condominios, empresas, semVinculos, carregando, abrindo, erro,
    abrirEmpresa, recarregar, abas, abaAtiva, setAbaAtiva, sair,
  } = useHomeUsuarioController();

  if (!fontsLoaded) return null;

  return (
    <View style={s.webBackground}>
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.topo}>
            <View style={s.perfil}>
              <SymbolView
                name={{ ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" }}
                tintColor={Cores.texto}
                size={44}
                style={s.avatar}
              />
              <View style={s.flex}>
                <Text style={s.bemVindo}>Bem-vindo(a),</Text>
                <Text style={s.nome} numberOfLines={2}>{nome}</Text>
              </View>
            </View>
            <Image source={require("@/assets/images/logo.png")} style={s.logo} />
          </View>

          {carregando && <ActivityIndicator color={Cores.texto} style={s.carregando} />}

          {!!erro && (
            <Pressable onPress={recarregar}>
              <Text style={s.erro}>{erro} Toque para tentar de novo.</Text>
            </Pressable>
          )}

          {semVinculos && (
            <Text style={s.vazio}>Você ainda não está vinculado a nenhuma empresa ou condomínio.</Text>
          )}

          <Secao
            titulo="Condomínio"
            icone={{ ios: "house", android: "home", web: "home" }}
            itens={condominios}
            abrindo={abrindo}
            onPress={abrirEmpresa}
          />
          <Secao
            titulo="Empresa"
            icone={{ ios: "building.2", android: "business", web: "business" }}
            itens={empresas}
            abrindo={abrindo}
            onPress={abrirEmpresa}
          />
        </ScrollView>

        <Footer abas={abas} ativa={abaAtiva} onChange={setAbaAtiva} onSair={sair} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  webBackground: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Cores.fundo },
  safe: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Cores.fundo },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 32, width: "100%", maxWidth: 480, alignSelf: "center" },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  perfil: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, marginRight: 8 },
  avatar: { width: 44, height: 44 },
  bemVindo: { color: Cores.textoSecundario, fontSize: 13, fontFamily: "Poppins_400Regular" },
  nome: { color: Cores.texto, fontSize: 20, fontFamily: "Poppins_700Bold" },
  logo: { width: 100, height: 100 },
  carregando: { marginTop: 40 },
  erro: { color: Cores.erro, textAlign: "center", marginTop: 24 },
  vazio: { color: Cores.textoSecundario, textAlign: "center", marginTop: 40, fontFamily: "Poppins_400Regular" },
  secao: { marginTop: 28 },
  secaoTopo: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  secaoTitulo: { color: Cores.texto, fontSize: 26, fontFamily: "Poppins_700Bold" },
  secaoIcone: { width: 26, height: 26 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Cores.botao,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemOff: { opacity: 0.6 },
  itemTxt: { flex: 1, color: Cores.botaoTexto, fontSize: 15, fontFamily: "Poppins_600SemiBold", marginRight: 8 },
});