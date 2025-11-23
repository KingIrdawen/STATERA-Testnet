// Shim for @react-native-async-storage/async-storage
// This module is required by @metamask/sdk but is not available in web environments
// This shim provides a no-op implementation for web builds

const AsyncStorage = {
  getItem: async (_k: string): Promise<string | null> => null,
  setItem: async (_k: string, _v: string): Promise<void> => undefined,
  removeItem: async (_k: string): Promise<void> => undefined,
  clear: async (): Promise<void> => undefined,
  getAllKeys: async (): Promise<string[]> => [],
  multiGet: async (_keys: string[]): Promise<[string, string | null][]> => [],
  multiSet: async (_keyValuePairs: [string, string][]): Promise<void> => undefined,
  multiRemove: async (_keys: string[]): Promise<void> => undefined,
};

export default AsyncStorage;
export { AsyncStorage };

