import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { parseParticipantToken, type ParsedToken } from './token';

/** A saved stage: its parsed details plus the raw token to (re)join with. */
export interface StageToken extends ParsedToken {
  /** Stable id — the stage ARN (one entry per stage). */
  id: string;
  raw: string;
  addedAt: number;
}

interface TokenStoreValue {
  stages: StageToken[];
  /** True while a token is being parsed/added (drives the spinner). */
  processing: boolean;
  /** Last add error, if any. */
  error: string | null;
  /** Parse and save a token. Rejects with a message on invalid input. */
  addToken: (raw: string) => Promise<void>;
  removeStage: (id: string) => void;
  /** The stage currently selected to join / in a call. */
  selectedId: string | null;
  select: (id: string | null) => void;
  selected: StageToken | null;
}

const TokenStoreContext = createContext<TokenStoreValue | null>(null);

export function TokenStoreProvider({ children }: { children: ReactNode }) {
  const [stages, setStages] = useState<StageToken[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addToken = useCallback(async (raw: string) => {
    setProcessing(true);
    setError(null);
    try {
      const parsed = parseParticipantToken(raw);
      if (!parsed || !parsed.stageArn) {
        throw new Error("That doesn't look like an IVS participant token.");
      }
      const entry: StageToken = {
        ...parsed,
        id: parsed.stageArn,
        raw: raw.trim(),
        addedAt: Date.now(),
      };
      // Dedupe by stage: a new token for an existing stage replaces it,
      // keeping the list position.
      setStages((prev) => {
        const i = prev.findIndex((s) => s.id === entry.id);
        if (i === -1) return [entry, ...prev];
        const copy = prev.slice();
        copy[i] = entry;
        return copy;
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setProcessing(false);
    }
  }, []);

  const removeStage = useCallback((id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const value = useMemo<TokenStoreValue>(
    () => ({
      stages,
      processing,
      error,
      addToken,
      removeStage,
      selectedId,
      select: setSelectedId,
      selected: stages.find((s) => s.id === selectedId) ?? null,
    }),
    [stages, processing, error, addToken, removeStage, selectedId]
  );

  return (
    <TokenStoreContext.Provider value={value}>
      {children}
    </TokenStoreContext.Provider>
  );
}

export function useTokenStore(): TokenStoreValue {
  const ctx = useContext(TokenStoreContext);
  if (!ctx) {
    throw new Error('useTokenStore must be used within a <TokenStoreProvider>');
  }
  return ctx;
}
