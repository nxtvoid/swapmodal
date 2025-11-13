import { renderHook, act, waitFor } from '@testing-library/react';
import { usePersistForm } from '../persistForm';
import { formStateStore } from '../useFormStateStore';

describe('usePersistForm', () => {
  beforeEach(() => {
    // Clear all form states before each test
    const store = formStateStore.getState();
    store.clearAllFormStates();
  });

  describe('basic functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form',
          defaultValues: { name: 'John', age: 25 },
        })
      );

      expect(result.current.getValues()).toEqual({ name: 'John', age: 25 });
    });

    it('should persist form state when values change', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-persist',
          defaultValues: { name: '' },
          debounceMs: 100,
        })
      );

      // Set a value
      act(() => {
        result.current.setValue('name', 'test value');
      });

      // Wait for debounce to persist
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-persist']).toBeTruthy();
        },
        { timeout: 300 }
      );

      const store = formStateStore.getState();
      expect(store.formStates['test-form-persist'].name).toBe('test value');
    });

    it('should restore persisted state on mount', async () => {
      // First render - set a value
      const { result: result1, unmount } = renderHook(() =>
        usePersistForm({
          key: 'test-form-restore',
          defaultValues: { name: '' },
          debounceMs: 50,
        })
      );

      act(() => {
        result1.current.setValue('name', 'persisted value');
      });

      // Wait for debounce
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-restore']).toBeTruthy();
        },
        { timeout: 200 }
      );

      unmount();

      // Second render - should restore the value
      const { result: result2 } = renderHook(() =>
        usePersistForm({
          key: 'test-form-restore',
          defaultValues: { name: '' },
        })
      );

      expect(result2.current.getValues().name).toBe('persisted value');
    });
  });

  describe('reset functionality', () => {
    it('should clear persisted state when reset is called', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-reset',
          defaultValues: { name: '' },
          debounceMs: 50,
        })
      );

      // Set a value
      act(() => {
        result.current.setValue('name', 'test');
      });

      // Wait for debounce to persist
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-reset']).toBeTruthy();
        },
        { timeout: 200 }
      );

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify state is cleared
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-reset']).toBeUndefined();
        },
        { timeout: 200 }
      );

      // Verify form values are reset
      expect(result.current.getValues().name).toBe('');
    });

    it('should reset to new values and clear persisted state', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-reset-values',
          defaultValues: { name: '', email: '' },
          debounceMs: 50,
        })
      );

      // Set values
      act(() => {
        result.current.setValue('name', 'John');
        result.current.setValue('email', 'john@example.com');
      });

      // Wait for persistence
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-reset-values']).toBeTruthy();
        },
        { timeout: 200 }
      );

      // Reset with new values
      act(() => {
        result.current.reset({ name: 'Jane', email: 'jane@example.com' });
      });

      // Verify state is cleared
      const store = formStateStore.getState();
      expect(store.formStates['test-form-reset-values']).toBeUndefined();

      // Verify form has new values
      expect(result.current.getValues()).toEqual({
        name: 'Jane',
        email: 'jane@example.com',
      });
    });

    it('should not persist values during reset operation', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-no-persist-on-reset',
          defaultValues: { name: '' },
          debounceMs: 50,
        })
      );

      // Set a value
      act(() => {
        result.current.setValue('name', 'test');
      });

      // Wait for persistence
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-no-persist-on-reset']).toBeTruthy();
        },
        { timeout: 200 }
      );

      // Reset immediately
      act(() => {
        result.current.reset();
      });

      // Wait a bit to ensure no re-persistence happens
      await new Promise((resolve) => setTimeout(resolve, 150));

      // State should remain cleared
      const store = formStateStore.getState();
      expect(store.formStates['test-form-no-persist-on-reset']).toBeUndefined();
    });
  });

  describe('debounce functionality', () => {
    it('should debounce rapid changes', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-debounce',
          defaultValues: { name: '' },
          debounceMs: 100,
        })
      );

      // Make rapid changes
      act(() => {
        result.current.setValue('name', 'a');
      });
      act(() => {
        result.current.setValue('name', 'ab');
      });
      act(() => {
        result.current.setValue('name', 'abc');
      });

      // Check immediately - should not be persisted yet
      const storeImmediate = formStateStore.getState();
      expect(storeImmediate.formStates['test-form-debounce']).toBeUndefined();

      // Wait for debounce
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-debounce']).toBeTruthy();
        },
        { timeout: 300 }
      );

      const storeFinal = formStateStore.getState();
      expect(storeFinal.formStates['test-form-debounce'].name).toBe('abc');
    });

    it('should use custom debounce time', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-custom-debounce',
          defaultValues: { name: '' },
          debounceMs: 500, // Long debounce
        })
      );

      act(() => {
        result.current.setValue('name', 'test');
      });

      // Wait less than debounce time
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should not be persisted yet
      const storeEarly = formStateStore.getState();
      expect(storeEarly.formStates['test-form-custom-debounce']).toBeUndefined();

      // Wait for full debounce time
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['test-form-custom-debounce']).toBeTruthy();
        },
        { timeout: 600 }
      );
    });
  });

  describe('multiple forms', () => {
    it('should handle multiple forms with different keys independently', async () => {
      const { result: result1 } = renderHook(() =>
        usePersistForm({
          key: 'form-1',
          defaultValues: { name: 'Form 1' },
          debounceMs: 50,
        })
      );

      const { result: result2 } = renderHook(() =>
        usePersistForm({
          key: 'form-2',
          defaultValues: { name: 'Form 2' },
          debounceMs: 50,
        })
      );

      // Set different values
      act(() => {
        result1.current.setValue('name', 'Updated Form 1');
        result2.current.setValue('name', 'Updated Form 2');
      });

      // Wait for persistence
      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['form-1']).toBeTruthy();
        },
        { timeout: 200 }
      );

      await waitFor(
        () => {
          const store = formStateStore.getState();
          expect(store.formStates['form-2']).toBeTruthy();
        },
        { timeout: 200 }
      );

      const store = formStateStore.getState();
      expect(store.formStates['form-1'].name).toBe('Updated Form 1');
      expect(store.formStates['form-2'].name).toBe('Updated Form 2');

      // Reset form 1
      act(() => {
        result1.current.reset();
      });

      // Form 1 should be cleared, Form 2 should remain
      await waitFor(() => {
        const storeAfterReset = formStateStore.getState();
        expect(storeAfterReset.formStates['form-1']).toBeUndefined();
      });

      const storeAfterReset = formStateStore.getState();
      expect(storeAfterReset.formStates['form-2']).toBeTruthy();
    });
  });

  describe('getPersistValues and clearPersist', () => {
    it('should return null when no values are persisted', () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-get-persist',
          defaultValues: { name: '' },
        })
      );

      expect(result.current.getPersistValues()).toBeNull();
    });

    it('should return persisted values after changes', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-get-persist-values',
          defaultValues: { name: '', email: '' },
          debounceMs: 50,
        })
      );

      // Set values
      act(() => {
        result.current.setValue('name', 'John');
        result.current.setValue('email', 'john@example.com');
      });

      // Wait for persistence
      await waitFor(
        () => {
          const persisted = result.current.getPersistValues();
          expect(persisted).toBeTruthy();
        },
        { timeout: 200 }
      );

      const persisted = result.current.getPersistValues();
      expect(persisted).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should clear persisted values with clearPersist', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-clear-persist',
          defaultValues: { name: '' },
          debounceMs: 50,
        })
      );

      // Set a value
      act(() => {
        result.current.setValue('name', 'test');
      });

      // Wait for persistence
      await waitFor(
        () => {
          expect(result.current.getPersistValues()).toBeTruthy();
        },
        { timeout: 200 }
      );

      // Verify it's persisted
      expect(result.current.getPersistValues()).toEqual({ name: 'test' });

      // Clear persist
      act(() => {
        result.current.clearPersist();
      });

      // Should be null now
      expect(result.current.getPersistValues()).toBeNull();

      // Form values should remain unchanged
      expect(result.current.getValues().name).toBe('test');
    });

    it('should show difference between form values and persisted values', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-diff',
          defaultValues: { name: '' },
          debounceMs: 100,
        })
      );

      // Set initial value
      act(() => {
        result.current.setValue('name', 'initial');
      });

      // Wait for persistence
      await waitFor(
        () => {
          expect(result.current.getPersistValues()).toBeTruthy();
        },
        { timeout: 200 }
      );

      expect(result.current.getPersistValues()).toEqual({ name: 'initial' });

      // Change value but don't wait for debounce
      act(() => {
        result.current.setValue('name', 'changed');
      });

      // Form has new value
      expect(result.current.getValues().name).toBe('changed');

      // But persisted still has old value (debounce not finished)
      expect(result.current.getPersistValues()).toEqual({ name: 'initial' });

      // Wait for debounce to complete
      await waitFor(
        () => {
          const persisted = result.current.getPersistValues();
          expect(persisted?.name).toBe('changed');
        },
        { timeout: 200 }
      );
    });

    it('should return null after reset', async () => {
      const { result } = renderHook(() =>
        usePersistForm({
          key: 'test-form-reset-persist',
          defaultValues: { name: '' },
          debounceMs: 50,
        })
      );

      // Set value and wait for persistence
      act(() => {
        result.current.setValue('name', 'test');
      });

      await waitFor(
        () => {
          expect(result.current.getPersistValues()).toBeTruthy();
        },
        { timeout: 200 }
      );

      // Reset
      act(() => {
        result.current.reset();
      });

      // Should be null after reset
      expect(result.current.getPersistValues()).toBeNull();
    });
  });
});
