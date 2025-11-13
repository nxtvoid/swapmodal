import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFormStateStore } from './useFormStateStore';
import {
  useForm as useFormOriginal,
  UseFormReturn,
  FieldValues,
  DeepPartial,
  UseFormProps,
} from 'react-hook-form';

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

export type UsePersistFormOptions<T extends FieldValues> = UseFormProps<T> & {
  key: string;
  debounceMs?: number;
};

/**
 * Hook that combines useForm with automatic state persistence
 *
 * @param options - Combined form configuration and persistence options
 *
 * @example
 * ```tsx
 * const form = usePersistForm({
 *   key: 'create-folder-form',
 *   resolver: zodResolver(Schema),
 *   defaultValues: { name: '', description: '' }
 * });
 *
 * // form.reset() will also clear the persisted state
 * ```
 */
export function usePersistForm<T extends FieldValues>(
  options: UsePersistFormOptions<T>
): PersistFormReturn<T> {
  const { key, debounceMs = 300, ...formConfig } = options;

  const store = useFormStateStore();
  const { setFormState, getFormState, clearFormState } = store;
  const isInitialMount = useRef(true);
  const hasRestored = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isResetting = useRef(false);

  const initialDefaultValues = useMemo(() => {
    const saved = getFormState(key);
    return saved || formConfig.defaultValues;
  }, [key, getFormState, formConfig.defaultValues]);

  const form = useFormOriginal<T>({
    ...formConfig,
    defaultValues: initialDefaultValues as any,
  });

  useEffect(() => {
    if (isInitialMount.current && !hasRestored.current) {
      const saved = getFormState(key);
      if (saved) {
        form.reset(saved as any);
        hasRestored.current = true;
      }
      isInitialMount.current = false;
    }
  }, [key, getFormState, form]);

  const saveFormState = useCallback(
    (values: DeepPartial<T>) => {
      if (isResetting.current) {
        return;
      }

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
        isResetting.current = true;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }

        form.reset(...args);
        clearFormState(key);
        hasRestored.current = false;

        setTimeout(() => {
          isResetting.current = false;
        }, 100);
      }) as UseFormReturn<T>['reset'],
    [form, key, clearFormState]
  );

  return {
    ...form,
    reset,
  } as PersistFormReturn<T>;
}
