import { SymbolView } from "expo-symbols";
import { ComponentProps, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { Cores } from "@/constants/parkflow";

type Props = TextInputProps & {
  label: string;
  icone?: ComponentProps<typeof SymbolView>["name"];
  senha?: boolean;
};

export function CampoTexto({ label, icone, senha = false, style, onFocus, onBlur, ...rest }: Props) {
  const [oculto, setOculto] = useState(senha);
  const [focado, setFocado] = useState(false);

  return (
    <View style={s.grupo}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.linha, focado && s.linhaFocada]}>
        {icone && <SymbolView name={icone} tintColor={Cores.textoSecundario} size={20} style={s.icone} />}
        <TextInput
          placeholderTextColor={Cores.placeholder}
          {...rest}
          secureTextEntry={oculto}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
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
  grupo: { marginBottom: 20 },
  label: { color: Cores.textoSecundario, fontSize: 13, marginBottom: 4 },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Cores.borda,
    paddingVertical: 8,
  },
  linhaFocada: { borderBottomColor: Cores.texto },
  icone: { width: 20, height: 20, marginRight: 12 },
  input: { flex: 1, color: Cores.texto, fontSize: 15, paddingVertical: 6, outlineWidth: 0 },
});