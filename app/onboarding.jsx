import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../src/store/useAppStore'
import { useResponsive } from '../src/hooks/useResponsive'
import { GIRL_THEME, BOY_THEME } from '../src/themes/themes'

export default function Onboarding() {
  const router    = useRouter()
  const setProfile = useAppStore((s) => s.setProfile)
  const r         = useResponsive()

  const [name,      setName]      = useState('')
  const [selected,  setSelected]  = useState(null)  // 'girl' | 'boy'

  const canContinue = name.trim().length > 0 && selected !== null

  function handleStart() {
    if (!canContinue) return
    setProfile(name.trim(), selected === 'girl' ? GIRL_THEME : BOY_THEME)
    router.replace('/(app)/home')
  }

  const s = styles(r)

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Text style={s.title}>🌟 Gyan Galaxy 🌟</Text>
        <Text style={s.subtitle}>Learn Math, English, Telugu & Hindi!</Text>

        <Text style={s.label}>What's your name?</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#bbb"
          maxLength={20}
        />

        <Text style={s.label}>Choose your world</Text>

        <View style={s.themeRow}>
          {/* Girl Card */}
          <TouchableOpacity
            style={[s.themeCard, selected === 'girl' && s.themeCardSelected, { borderColor: GIRL_THEME.primary }]}
            onPress={() => setSelected('girl')}
            activeOpacity={0.8}
          >
            <Text style={s.themeEmoji}>🧚</Text>
            <Text style={[s.themeLabel, { color: GIRL_THEME.primary }]}>Fairy Garden</Text>
            <Text style={s.themeDesc}>Unicorns · Butterflies{'\n'}Gems · Magic</Text>
          </TouchableOpacity>

          {/* Boy Card */}
          <TouchableOpacity
            style={[s.themeCard, selected === 'boy' && s.themeCardSelected, { borderColor: BOY_THEME.primary }]}
            onPress={() => setSelected('boy')}
            activeOpacity={0.8}
          >
            <Text style={s.themeEmoji}>🚂</Text>
            <Text style={[s.themeLabel, { color: BOY_THEME.primary }]}>Vehicle World</Text>
            <Text style={s.themeDesc}>Trains · Cars{'\n'}Trucks · Buses</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.switchHint}>You can switch themes anytime later!</Text>

        <TouchableOpacity
          style={[s.startBtn, !canContinue && s.startBtnDisabled]}
          onPress={handleStart}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={s.startBtnText}>🚀 Let's Go!</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (r) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#FFF0F8' },
  scroll: { padding: r.sp(20), alignItems: 'center', paddingBottom: r.sp(40) },

  title:    { fontSize: r.font(32), fontWeight: '800', color: '#5A005A', marginTop: r.sp(20), textAlign: 'center' },
  subtitle: { fontSize: r.font(16), color: '#FF6B9D', marginTop: r.sp(6), marginBottom: r.sp(30), textAlign: 'center' },

  label: { alignSelf: 'flex-start', fontSize: r.font(16), fontWeight: '700', color: '#5A005A', marginBottom: r.sp(8) },

  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderRadius: r.sp(12),
    padding: r.sp(14),
    fontSize: r.font(18),
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: r.sp(24),
  },

  themeRow: { flexDirection: 'row', gap: r.sp(16), marginBottom: r.sp(12) },

  themeCard: {
    flex: 1,
    borderWidth: 3,
    borderRadius: r.sp(16),
    padding: r.sp(18),
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  themeCardSelected: { backgroundColor: '#FFF0F8' },

  themeEmoji: { fontSize: r.font(48), marginBottom: r.sp(8) },
  themeLabel: { fontSize: r.font(16), fontWeight: '800', marginBottom: r.sp(6) },
  themeDesc:  { fontSize: r.font(12), color: '#888', textAlign: 'center', lineHeight: r.font(18) },

  switchHint: { fontSize: r.font(12), color: '#aaa', marginBottom: r.sp(32) },

  startBtn:         { backgroundColor: '#FF6B9D', borderRadius: r.sp(16), paddingVertical: r.sp(16), paddingHorizontal: r.sp(48), elevation: 4 },
  startBtnDisabled: { backgroundColor: '#ddd' },
  startBtnText:     { fontSize: r.font(20), fontWeight: '800', color: '#fff' },
})
