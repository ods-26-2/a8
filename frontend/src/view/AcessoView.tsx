import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useFonts, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";

const { width, height } = Dimensions.get("window");

export default function AcessoView() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>

        {/* LOGO */}
        <Image
          source={require("../../assets/images/logopark.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Acesso rápido e{"\n"}inteligente
          </Text>

          <Text style={styles.description}>
            Entre com praticidade e segurança.
          </Text>

          <Text style={styles.description}>
            Convide seus visitantes pelo aplicativo.
          </Text>
        </View>

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151421",
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,

    paddingTop: height * 0.03,
    paddingBottom: height * 0.04,
  },

  logo: {
    width: width * 100,
    height: height * 0.5,
  },

  textContainer: {
    alignItems: "center",
    marginTop: height * 0.07,
  },

  title: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    lineHeight: 32,
    textAlign: "center",
    marginBottom: 20,
  },

  description: {
    color: "rgba(142, 140, 152, 0.65)",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 5,
    letterSpacing: 0.3,

  },
  button: {
    width: "100%",
    height: 60,

    backgroundColor: "#E8EAED",

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 75,
  },

  buttonText: {
    color: "#151421",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
  },
});