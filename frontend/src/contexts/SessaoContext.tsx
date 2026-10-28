import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { UsuarioLogado } from "@/models/Login";
import { registrarAoSessaoExpirar } from "@/services/api";
import { armazenamento } from "@/services/armazenamento";

type SessaoContextType = {
  usuario: UsuarioLogado | null;
  carregando: boolean;
  entrar: (token: string, usuario: UsuarioLogado) => Promise<void>;
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

  async function entrar(token: string, novoUsuario: UsuarioLogado) {
    await armazenamento.salvarSessao(token, novoUsuario);
    setUsuario(novoUsuario);
  }

  async function sair() {
    await armazenamento.limparSessao();
    setUsuario(null);
  }

  return (
    <SessaoContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao deve ser usado dentro de <SessaoProvider>.");
  return ctx;
}