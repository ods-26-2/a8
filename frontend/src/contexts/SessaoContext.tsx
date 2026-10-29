import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { EmpresaAtual, EmpresaVinculada } from "@/models/EmpresaVinculada";
import { UsuarioLogado } from "@/models/Login";
import { registrarAoSessaoExpirar } from "@/services/api";
import { armazenamento } from "@/services/armazenamento";

type SessaoContextType = {
  usuario: UsuarioLogado | null;
  empresaAtual: EmpresaAtual | null;
  carregando: boolean;
  entrar: (token: string, usuario: UsuarioLogado) => Promise<void>;
  escolherEmpresa: (token: string, empresa: EmpresaVinculada) => Promise<void>;
  voltarParaEmpresas: () => Promise<void>;
  sair: () => Promise<void>;
};

const SessaoContext = createContext<SessaoContextType | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await armazenamento.lerToken();
      const salvo = await armazenamento.lerUsuario<UsuarioLogado>();
      if (token && salvo) setUsuario(salvo);
      setCarregando(false);
    })();

    registrarAoSessaoExpirar(() => setUsuario(null));
    return () => registrarAoSessaoExpirar(null);
  }, []);

  // Empresa/condomínio já "está" na própria empresa; usuário só depois de escolher uma
  const empresaAtual = useMemo<EmpresaAtual | null>(() => {
    if (!usuario) return null;
    if (usuario.tipo === "empresa" || usuario.tipo === "condominio") {
      return { cnpj: usuario.cnpj ?? "", nome: usuario.nome, tipo: usuario.tipo, funcao: "empresa" };
    }
    return usuario.empresaAtual ?? null;
  }, [usuario]);

  async function entrar(token: string, novoUsuario: UsuarioLogado) {
    await armazenamento.salvarSessao(token, novoUsuario);
    setUsuario(novoUsuario);
  }

  async function escolherEmpresa(token: string, empresa: EmpresaVinculada) {
    if (!usuario) return;
    const atualizado: UsuarioLogado = { ...usuario, empresaAtual: { ...empresa } };
    await armazenamento.salvarSessao(token, atualizado); // token novo, já com empresa + função
    setUsuario(atualizado);
  }

  async function voltarParaEmpresas() {
    if (!usuario) return;
    const { empresaAtual: _descartada, ...resto } = usuario;
    const token = await armazenamento.lerToken();
    if (token) await armazenamento.salvarSessao(token, resto);
    setUsuario(resto);
  }

  async function sair() {
    await armazenamento.limparSessao();
    setUsuario(null);
  }

  return (
    <SessaoContext.Provider
      value={{ usuario, empresaAtual, carregando, entrar, escolherEmpresa, voltarParaEmpresas, sair }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao deve ser usado dentro de <SessaoProvider>.");
  return ctx;
}