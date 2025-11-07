let create: any;

try {
  const zustand = require('zustand');
  create = zustand.create || zustand.default?.create || zustand;
} catch (error) {
  throw new Error(
    '[swapmodal] Zustand is required for usePersistForm. Please install it:\n' +
      '  npm install zustand\n' +
      '  # or\n' +
      '  bun add zustand\n' +
      '  # or\n' +
      '  pnpm add zustand'
  );
}

if (!create) {
  throw new Error(
    '[swapmodal] Zustand is required for usePersistForm. Please install it:\n' +
      '  npm install zustand\n' +
      '  # or\n' +
      '  bun add zustand\n' +
      '  # or\n' +
      '  pnpm add zustand'
  );
}

type FormStateStore = {
  formStates: Record<string, any>;
  setFormState: (key: string, state: any) => void;
  getFormState: (key: string) => any;
  clearFormState: (key: string) => void;
  clearAllFormStates: () => void;
};

const storeConfig = (set: any, get: any) => ({
  formStates: {} as Record<string, any>,
  setFormState: (key: string, state: any) => {
    set((store: FormStateStore) => ({
      formStates: {
        ...store.formStates,
        [key]: state,
      },
    }));
  },
  getFormState: (key: string) => {
    return get().formStates[key] || null;
  },
  clearFormState: (key: string) => {
    set((store: FormStateStore) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = store.formStates;
      return { formStates: rest };
    });
  },
  clearAllFormStates: () => {
    set({ formStates: {} });
  },
});

const useFormStateStoreHook = (create as any)()(storeConfig);

export function useFormStateStore(): FormStateStore {
  return useFormStateStoreHook();
}
