import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Cores } from "@/constants/parkflow";

type Props = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  detalhe?: string;
  textoConfirmar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function ModalConfirmar({
  visivel,
  titulo,
  mensagem,
  detalhe,
  textoConfirmar = "Remover",
  carregando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={s.fundo}>
        <View style={s.caixa}>
          <SymbolView
            name={{ ios: "trash", android: "delete", web: "delete" }}
            tintColor={Cores.erro}
            size={30}
            style={s.icone}
          />
          <Text style={s.titulo}>{titulo}</Text>
          <Text style={s.mensagem}>{mensagem}</Text>
          {!!detalhe && <Text style={s.detalhe}>{detalhe}</Text>}

          <View style={s.botoes}>
            <Pressable style={[s.botao, s.cancelar]} onPress={onCancelar} disabled={carregando}>
              <Text style={s.cancelarTxt}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[s.botao, s.confirmar, carregando && s.off]}
              onPress={onConfirmar}
              disabled={carregando}>
              {carregando ? (
                <ActivityIndicator color={Cores.texto} />
              ) : (
                <Text style={s.confirmarTxt}>{textoConfirmar}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  caixa: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Cores.campo,
    borderWidth: 1,
    borderColor: Cores.borda,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  icone: { width: 30, height: 30, marginBottom: 12 },
  titulo: { color: Cores.texto, fontSize: 20, fontFamily: "Poppins_700Bold", textAlign: "center" },
  mensagem: { color: Cores.texto, fontSize: 15, marginTop: 10, textAlign: "center", fontFamily: "Poppins_500Medium" },
  detalhe: { color: Cores.textoSecundario, fontSize: 13, marginTop: 8, textAlign: "center" },
  botoes: { flexDirection: "row", gap: 12, marginTop: 24, width: "100%" },
  botao: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  cancelar: { borderWidth: 1, borderColor: Cores.borda },
  cancelarTxt: { color: Cores.texto, fontFamily: "Poppins_600SemiBold" },
  confirmar: { backgroundColor: Cores.erro },
  confirmarTxt: { color: Cores.texto, fontFamily: "Poppins_700Bold" },
  off: { opacity: 0.6 },
});