import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { CartaoVeiculo } from "@/components/CartaoVeiculo";
import { ModalConfirmar } from "@/components/ModalConfirmar";
import { Cores } from "@/constants/parkflow";
import { useMeusVeiculosController } from "@/controllers/useMeusVeiculosController";

export function MeusVeiculos() {
  const { veiculos, carregando, erro, recarregar, alvo, pedirExclusao, cancelar, confirmar, excluindo } =
    useMeusVeiculosController();

  return (
    <View style={s.raiz}>
      <Text style={s.titulo}>Meus veículos</Text>

      {carregando && <ActivityIndicator color={Cores.texto} style={s.espaco} />}

      {!!erro && (
        <Pressable onPress={recarregar}>
          <Text style={s.erro}>{erro} Toque para tentar de novo.</Text>
        </Pressable>
      )}

      {!carregando && !erro && veiculos.length === 0 && (
        <Text style={s.vazio}>
          Você ainda não tem veículos. Cadastre pela empresa em "Veículos Vinculados".
        </Text>
      )}

      <View style={s.grade}>
        {veiculos.map((v) => (
          <CartaoVeiculo
            key={v.placa}
            modelo={v.modelo ?? "Sem modelo"}
            cor={v.cor ?? "—"}
            placa={v.placa}
            onExcluir={() => pedirExclusao(v)}
          />
        ))}
      </View>

      <ModalConfirmar
        visivel={!!alvo}
        titulo="Remover veículo"
        mensagem={`Tem certeza que quer remover ${alvo?.modelo}-${alvo?.cor}?`}
        detalhe="Ele será removido de todas as empresas."
        carregando={excluindo}
        onConfirmar={confirmar}
        onCancelar={cancelar}
      />
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { marginTop: 28 },
  titulo: { color: Cores.texto, fontSize: 26, fontFamily: "Poppins_700Bold", marginBottom: 16 },
  espaco: { marginTop: 24 },
  erro: { color: Cores.erro, textAlign: "center", marginTop: 16 },
  vazio: { color: Cores.textoSecundario, textAlign: "center", marginTop: 24 },
  grade: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
});