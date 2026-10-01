import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { Cores } from "@/constants/parkflow";

type Props = TextInputProps & {
  label: string;
  senha?: boolean;
};

export function CampoTexto({ label, senha = false, style, ...rest }: Props) {
  const [oculto, setOculto] = useState(senha);

  return (
    <View style={s.grupo}>
      <Text style={s.label}>{label}</Text>
      <View style={s.campo}>
        <TextInput
          placeholderTextColor={Cores.placeholder}
          {...rest}
          secureTextEntry={oculto}
          style={[s.input, style]}
        />
        {senha && (
          <Pressable onPress={() => setOculto((v) => !v)} hitSlop={10}>
            <SymbolView
              name={{
                ios: oculto ? "eye.slash" : "eye",
                android: oculto ? "visibility_off" : "visibility",
                web: oculto ? "visibility_off" : "visibility",
              }}
              tintColor={Cores.textoSecundario}
              size={20}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grupo: { marginBottom: 16 },
  label: { color: Cores.textoSecundario, fontSize: 13, marginBottom: 6 },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Cores.campo,
    borderColor: Cores.borda,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: Cores.texto, fontSize: 15, paddingVertical: 14 },
});