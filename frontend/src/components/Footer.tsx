import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Cores } from "@/constants/parkflow";
import { Aba, IdAba } from "@/models/HomeEmpresa";

type Props = {
  abas: Aba[];
  ativa: IdAba;
  onChange: (id: IdAba) => void;
};

export function Footer({ abas, ativa, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.barra, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        const cor = selecionada ? Cores.texto : Cores.textoSecundario;

        return (
          <Pressable
            key={aba.id}
            style={s.item}
            onPress={() => onChange(aba.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selecionada }}>
            <SymbolView name={aba.icone} tintColor={cor} size={24} style={s.icone} />
            <Text style={[s.texto, { color: cor }]}>{aba.titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  barra: {
    flexDirection: "row",
    backgroundColor: Cores.barra,
    paddingTop: 12,
  },
  item: { flex: 1, alignItems: "center", gap: 4 },
  icone: { width: 24, height: 24 },
  texto: { fontSize: 11, fontFamily: "Poppins_500Medium" },
});