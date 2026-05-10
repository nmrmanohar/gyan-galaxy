import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '../src/store/useAppStore'

export default function Splash() {
  const router       = useRouter()
  const onboardingDone = useAppStore((s) => s.onboardingDone)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(onboardingDone ? '/(app)/home' : '/onboarding')
    }, 300)
    return () => clearTimeout(timer)
  }, [onboardingDone])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F8' }}>
      <ActivityIndicator size="large" color="#FF6B9D" />
    </View>
  )
}
