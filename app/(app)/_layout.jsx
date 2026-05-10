import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="math/index" />
      <Stack.Screen name="english/index" />
      <Stack.Screen name="telugu/index" />
      <Stack.Screen name="hindi/index" />
    </Stack>
  )
}
