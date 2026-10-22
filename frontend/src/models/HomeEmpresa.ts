import { SymbolView } from "expo-symbols";
import { ComponentProps } from "react";

export type Icone = ComponentProps<typeof SymbolView>["name"];

export type IdAtalho = "administrador" | "usuario" | "convidado";
export type IdAba = "home" | "veiculos" | "perfil";

export interface Atalho {
  id: IdAtalho;
  titulo: string;
  icone: Icone;
}

export interface Aba {
  id: IdAba;
  titulo: string;
  icone: Icone;
}

export const ATALHOS: Atalho[] = [
  {
    id: "administrador",
    titulo: "Administrador",
    icone: { ios: "person.badge.key", android: "admin_panel_settings", web: "admin_panel_settings" },
  },
  {
    id: "usuario",
    titulo: "Usuário",
    icone: { ios: "person", android: "person", web: "person" },
  },
  {
    id: "convidado",
    titulo: "Convidado",
    icone: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
  },
];

export const ABAS: Aba[] = [
  { id: "home", titulo: "Home", icone: { ios: "house", android: "home", web: "home" } },
  { id: "veiculos", titulo: "Veículos", icone: { ios: "car", android: "directions_car", web: "directions_car" } },
  { id: "perfil", titulo: "Perfil", icone: { ios: "person", android: "person", web: "person" } },
];