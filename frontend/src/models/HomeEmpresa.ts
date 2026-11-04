import { SymbolView } from "expo-symbols";
import { ComponentProps } from "react";

import { FuncaoEmpresa } from "./EmpresaVinculada";

export type Icone = ComponentProps<typeof SymbolView>["name"];

export type IdAtalho = "administrador" | "usuario" | "convidado" | "veiculos";
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
  rota?: string;
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
  {
    id: "veiculos",
    titulo: "Veículos Vinculados",
    icone: { ios: "car", android: "directions_car", web: "directions_car" },
  },
];

export const ATALHOS_POR_FUNCAO: Record<FuncaoEmpresa, IdAtalho[]> = {
  empresa: ["administrador", "usuario", "convidado", "veiculos"],
  adm: ["usuario", "convidado", "veiculos"],
  comum: ["convidado"],
};

const ABA_HOME: Aba = { id: "home", titulo: "Home", icone: { ios: "house", android: "home", web: "home" } };

// Home do usuário (sem empresa): aba interna, SEM rota
const ABA_VEICULOS: Aba = {
  id: "veiculos",
  titulo: "Veículos",
  icone: { ios: "car", android: "directions_car", web: "directions_car" },
};

// Dentro de uma empresa: tela própria
const ABA_VEICULOS_VINCULADOS: Aba = {
  id: "veiculos",
  titulo: "Veículos",
  icone: { ios: "car", android: "directions_car", web: "directions_car" },
  rota: "/veiculos-vinculados",
};

const ABA_PERFIL: Aba = {
  id: "perfil",
  titulo: "Perfil",
  icone: { ios: "person", android: "person", web: "person" },
  rota: "/perfil",
};

export const ABAS_USUARIO: Aba[] = [ABA_HOME, ABA_VEICULOS, ABA_PERFIL];
export const ABAS: Aba[] = [ABA_HOME, ABA_PERFIL];

export function abasPorFuncao(funcao: FuncaoEmpresa): Aba[] {
  return funcao === "adm"
    ? [ABA_HOME, ABA_VEICULOS_VINCULADOS, ABA_PERFIL]
    : [ABA_HOME, ABA_PERFIL];
}