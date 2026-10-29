import {TipoEmpresa} from "./Empresa";

export type FuncaoEmpresa = "empresa" | "adm" | "comum";

export interface EmpresaVinculada {
  cnpj: string;
  nome: string;
  tipo: TipoEmpresa;
  funcao: "adm" | "comum";
}

export interface EmpresaAtual{
    cnpj: string;
    nome: string;
    tipo: TipoEmpresa;
    funcao: FuncaoEmpresa;
}