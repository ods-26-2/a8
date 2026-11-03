import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Cores } from "@/constants/parkflow";
import { hexDaCor } from "@/models/Veiculo";

type Props = {
  modelo: string;
  cor: string;
  placa: string;
  detalhe?: string; // ex.: nome do dono, na lista da empresa
  onExcluir: () => void;
};

export function CartaoVeiculo({ modelo, cor, placa, detalhe, onExcluir }: Props) {
  return (
    <View style={s.cartao}>
      <Text style={s.modelo} numberOfLines={2}>{modelo}</Text>

      <View style={s.linhaCor}>
        <View style={[s.bolinha, { backgroundColor: hexDaCor(cor) }]} />
        <Text style={s.cor}>{cor}</Text>
      </View>

      <Text style={s.placa}>{placa}</Text>
      {!!detalhe && <Text style={s.detalhe} numberOfLines={1}>{detalhe}</Text>}

      <Pressable style={s.lixeira} onPress={onExcluir} hitSlop={8} accessibilityLabel={`Remover ${modelo}`}>
        <SymbolView
          name={{ ios: "trash", android: "delete", web: "delete" }}
          tintColor={Cores.botaoTexto}
          size={22}
        />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  cartao: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: Cores.cartao,
    borderRadius: 20,
    padding: 14,
  },
  modelo: { color: Cores.botaoTexto, fontSize: 16, fontFamily: "Poppins_700Bold" },
  linhaCor: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  bolinha: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: "rgba(0,0,0,0.35)" },
  cor: { color: Cores.botaoTexto, fontSize: 13, fontFamily: "Poppins_500Medium" },
  placa: { color: Cores.botaoTexto, fontSize: 13, marginTop: 8, letterSpacing: 1, fontFamily: "Poppins_600SemiBold" },
  detalhe: { color: Cores.botaoTexto, fontSize: 11, marginTop: 2, paddingRight: 34, opacity: 0.8 },
  lixeira: { position: "absolute", right: 12, bottom: 12 },
});