import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLoginController } from "../controllers/useLoginController";

export default function LoginView() {
  const {
    email,
    setEmail,
    senha,
    setSenha,
    mostrarSenha,
    setMostrarSenha,
    carregando,
    erro,
    entrar,
  } = useLoginController();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* TOPO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          <Text style={styles.title}>Login</Text>

          {/* EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={17}
                color="#777582"
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor="#777582"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* SENHA */}
          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color="#777582"
              />

              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                placeholderTextColor="#777582"
                secureTextEntry={!mostrarSenha}
              />

              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Ionicons
                  name={
                    mostrarSenha
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={18}
                  color="#777582"
                />
              </TouchableOpacity>
            </View>
          </View>

          {erro !== "" && (
            <Text style={styles.errorText}>
              {erro}
            </Text>
          )}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={entrar}
            disabled={carregando}
          >
            <Text style={styles.loginButtonText}>
              {carregando ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          {/* CADASTRO */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Eu sou um novo usuário.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/cadastro")}
            >
              <Text style={styles.registerLink}>
                {" "}Cadastrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151421",
  },

  keyboard: {
    flex: 1,
  },

  header: {
    height: 80,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#22212E",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    marginTop:35,
    width: 100,
    height: 100,
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 35,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "700",
    marginBottom: 35,
  },

  field: {
    marginBottom: 25,
  },

  label: {
    color: "#8B8995",
    fontSize: 18,
    marginBottom: 8,
  },

  inputContainer: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#62616D",
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 10,
    paddingVertical: 0,
  },

  loginButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#E8EAED",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  loginButtonText: {
    color: "#151421",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },

  registerText: {
    color: "#ababab",
    fontSize: 16,
  },

  registerLink: {
    color: "#00A8FF",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
});