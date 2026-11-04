import { Pressable, StyleSheet, Text, View } from "react-native";

import { Cores } from "@/constants/parkflow";
import { CORES_VEICULO } from "@/models/Veiculo";

type Props = {
  valor: string;
  onChange: (cor: string) => void;
};

export function SeletorCor({ valor, onChange }: Props) {
  return (
    <View style={s.grupo}>
      <Text style={s.label}>Cor</Text>
      <View style={s.linha}>
        {CORES_VEICULO.map((cor) => {
          const selecionada = cor.nome === valor;
          return (
            <Pressable
              key={cor.nome}
              style={[s.chip, selecionada && s.chipSel]}
              onPress={() => onChange(cor.nome)}
              accessibilityRole="button"
              accessibilityState={{ selected: selecionada }}>
              <View style={[s.bolinha, { backgroundColor: cor.hex }]} />
              <Text style={[s.chipTxt, selecionada && s.chipTxtSel]}>{cor.nome}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grupo: { marginBottom: 20 },
  label: { color: Cores.textoSecundario, fontSize: 13, marginBottom: 8 },
  linha: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Cores.borda,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipSel: { borderColor: Cores.texto, backgroundColor: Cores.campo },
  bolinha: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  chipTxt: { color: Cores.textoSecundario, fontSize: 13 },
  chipTxtSel: { color: Cores.texto },
});