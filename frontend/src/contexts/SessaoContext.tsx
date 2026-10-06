import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Empresa } from "@/models/Empresa";
import { ApiError } from "@/services/api";
import { armazenamento } from "@/services/armazenamento";
import { empresaService } from "@/services/empresaService";

interface Sessao {
  token: string;
  empresa: Empresa;
}

interface SessaoContextoValor {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (token: string, empresa: Empresa) => Promise<void>;
  sair: () => Promise<void>;
}

const SessaoContexto = createContext<SessaoContextoValor | null>(null);

export function SessaoProvider({ children }: PropsWithChildren) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const token = await armazenamento.lerToken();
        if (!token) return;

        const { empresa } = await empresaService.perfil(token);
        if (ativo) setSessao({ token, empresa });
      } catch (error) {
        const recusado =
          error instanceof ApiError && [401, 403, 404].includes(error.status);
        if (recusado) await armazenamento.removerToken();
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(async (token: string, empresa: Empresa) => {
    await armazenamento.salvarToken(token);
    setSessao({ token, empresa });
  }, []);

  const sair = useCallback(async () => {
    await armazenamento.removerToken();
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({ sessao, carregando, entrar, sair }),
    [sessao, carregando, entrar, sair]
  );

  return <SessaoContexto.Provider value={valor}>{children}</SessaoContexto.Provider>;
}

export function useSessao() {
  const valor = useContext(SessaoContexto);
  if (!valor) {
    throw new Error("useSessao deve ser usado dentro de <SessaoProvider>");
  }
  return valor;
}