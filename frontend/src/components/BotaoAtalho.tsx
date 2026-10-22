import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text } from "react-native";

import { Cores } from "@/constants/parkflow";
import { Icone } from "@/models/HomeEmpresa";

type Props = {
  titulo: string;
  icone: Icone;
  onPress: () => void;
};

export function CartaoAtalho({ titulo, icone, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [s.cartao, pressed && s.pressionado]} onPress={onPress}>
      <SymbolView name={icone} tintColor={Cores.botaoTexto} size={44} style={s.icone} />
      <Text style={s.titulo}>{titulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  cartao: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: Cores.cartao,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pressionado: { backgroundColor: Cores.cartaoPressionado },
  icone: { width: 44, height: 44 },
  titulo: { color: Cores.botaoTexto, fontSize: 15, fontFamily: "Poppins_600SemiBold" },
});