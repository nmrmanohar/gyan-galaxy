/**
 * Safe storage wrapper.
 * AsyncStorage v3 uses JSI and requires a native build — it crashes in Expo Go.
 * This wrapper catches those errors and falls back to in-memory storage so the
 * app runs fine in Expo Go for development. In a real APK/IPA build, the native
 * module is available and everything persists normally.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

const memory = {}

export const storage = {
  async setItem(key, value) {
    memory[key] = value
    try {
      await AsyncStorage.setItem(key, value)
    } catch (_) {
      // native module not available (Expo Go) — memory fallback is already set
    }
  },

  async getItem(key) {
    try {
      const val = await AsyncStorage.getItem(key)
      if (val !== null) return val
    } catch (_) {
      // native module not available
    }
    return memory[key] ?? null
  },

  async removeItem(key) {
    delete memory[key]
    try {
      await AsyncStorage.removeItem(key)
    } catch (_) {}
  },
}
