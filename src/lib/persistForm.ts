import { useRef, useEffect, useMemo, useCallback } from 'react';
import { UseFormReturn, FieldValues, DeepPartial } from 'react-hook-form';
import { useFormStateStore } from './useFormStateStore';

export type PersistFormOptions = {
  key: string;
  /**
   * debounce delay in milliseconds for saving form state
   * @default 300
   */
  debounceMs?: number;
};

export type PersistFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  reset: (...args: Parameters<UseFormReturn<T>['reset']>) => void;
};

/**
 * Wrapper around react-hook-form's useForm that automatically persists form state
 * across component remounts (e.g., when switching between Dialog/Drawer)
 *
 * Uses a subscription pattern to avoid unnecessary re-renders and includes
 * debouncing to optimize performance.
 *
 * @param formFactory - Function that returns the result of useForm
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const form = usePersistForm(
 *   () => useForm({
 *     resolver: zodResolver(Schema),
 *     defaultValues: { name: '', description: '' }
 *   }),
 *   { key: 'unique-form-key', debounceMs: 300 }
 * )
 *
 * // form.reset() will also clear the persisted state
 * ```
 */
export function usePersistForm<T extends FieldValues>(
  formFactory: () => UseFormReturn<T>,
  options: PersistFormOptions
): PersistFormReturn<T> {
  const { key, debounceMs = 300 } = options;
  const form = formFactory();
  const store = useFormStateStore();
  const { setFormState, getFormState, clearFormState } = store;
  const isInitialMount = useRef(true);
  const hasRestored = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitialMount.current && !hasRestored.current) {
      const saved = getFormState(key);
      if (saved) {
        form.reset(saved as T);
        hasRestored.current = true;
      }
      isInitialMount.current = false;
    }
  }, [key, getFormState, form]);

  const saveFormState = useCallback(
    (values: DeepPartial<T>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setFormState(key, values);
      }, debounceMs);
    },
    [key, setFormState, debounceMs]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    const subscription = form.watch((values: DeepPartial<T>) => {
      if (hasRestored.current || !isInitialMount.current) {
        saveFormState(values);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, saveFormState]);

  const reset = useMemo(
    () =>
      ((...args: Parameters<UseFormReturn<T>['reset']>) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }

        form.reset(...args);
        clearFormState(key);
        hasRestored.current = false;
      }) as UseFormReturn<T>['reset'],
    [form, key, clearFormState]
  );

  return {
    ...form,
    reset,
  } as PersistFormReturn<T>;
}
