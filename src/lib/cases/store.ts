import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type { CaseRecord, IdType } from "@/lib/osint/types";

const MAX_CASES = 40;

type CaseStore = {
  cases: CaseRecord[];
  activeId: string | null;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setActive: (id: string | null) => void;
  openNew: () => void;
  createCase: (query: string, type: IdType) => CaseRecord;
  patch: (id: string, fn: (c: CaseRecord) => CaseRecord) => void;
  remove: (id: string) => void;
  setNotes: (id: string, notes: string) => void;
};

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      cases: [],
      activeId: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setActive: (id) => set({ activeId: id }),
      openNew: () => set({ activeId: null }),
      createCase: (query, type) => {
        const record: CaseRecord = {
          id: uid("FTH"),
          query,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          notes: "",
          brief: null,
          briefStatus: "idle",
          runId: 1,
          modules: {},
        };
        set((s) => ({
          cases: [record, ...s.cases].slice(0, MAX_CASES),
          activeId: record.id,
        }));
        return record;
      },
      patch: (id, fn) => {
        set((s) => ({
          cases: s.cases.map((c) => (c.id === id ? fn(c) : c)),
        }));
      },
      remove: (id) => {
        const { activeId, cases } = get();
        const next = cases.filter((c) => c.id !== id);
        set({
          cases: next,
          activeId: activeId === id ? (next[0]?.id ?? null) : activeId,
        });
      },
      setNotes: (id, notes) => {
        get().patch(id, (c) => ({ ...c, notes, updatedAt: Date.now() }));
      },
    }),
    {
      name: "fathom-cases",
      partialize: (s) => ({ cases: s.cases, activeId: s.activeId }),
      onRehydrateStorage: () => () => {
        useCaseStore.getState().setHasHydrated(true);
      },
    },
  ),
);

export function useActiveCase() {
  return useCaseStore((s) => s.cases.find((c) => c.id === s.activeId) ?? null);
}
