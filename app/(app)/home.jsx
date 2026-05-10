import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../src/store/useAppStore'
import { useResponsive } from '../../src/hooks/useResponsive'

const SUBJECTS = [
  { id: 'math',    emoji: '🔢', label: 'Math',    route: '/(app)/math',    boyLabel: 'Train Station Math',  girlLabel: 'Fairy Bakery Math'   },
  { id: 'english', emoji: '🔤', label: 'English', route: '/(app)/english', boyLabel: 'Driver License English', girlLabel: 'Garden Library English' },
  { id: 'telugu',  emoji: '🌺', label: 'Telugu',  route: '/(app)/telugu',  boyLabel: 'Loco Pilot Telugu',   girlLabel: 'Magic Spell Telugu'   },
  { id: 'hindi',   emoji: '🏔️', label: 'Hindi',   route: '/(app)/hindi',   boyLabel: 'Highway Hindi',       girlLabel: 'Rainbow Hindi'        },
]

export default function Home() {
  const router     = useRouter()
  const r          = useResponsive()
  const theme      = useAppStore((s) => s.theme)
  const name       = useAppStore((s) => s.profileName)
  const gems       = useAppStore((s) => s.gems)
  const totalStars = useAppStore((s) => s.totalStars)
  const progress   = useAppStore((s) => s.progress)

  const starsFor = (subjectId) =>
    Object.values(progress[subjectId] ?? {}).reduce((a, b) => a + b, 0)

  const s = styles(r, theme)

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hi, {name}! {theme.pet}</Text>
            <Text style={s.subGreeting}>Ready to learn today?</Text>
          </View>
          <View style={s.gemBadge}>
            <Text style={s.gemText}>{theme.currency.split(' ')[0]} {gems}</Text>
          </View>
        </View>

        {/* Total stars banner */}
        <View style={[s.banner, { backgroundColor: theme.primary }]}>
          <Text style={s.bannerText}>⭐ Total Stars: {totalStars()}</Text>
          <Text style={s.bannerSub}>{theme.label}</Text>
        </View>

        {/* Subject grid */}
        <Text style={s.sectionTitle}>Choose a Subject</Text>
        <View style={s.grid}>
          {SUBJECTS.map((sub) => {
            const earned = starsFor(sub.id)
            const worldName = theme.id === 'boy' ? sub.boyLabel : sub.girlLabel
            return (
              <TouchableOpacity
                key={sub.id}
                style={s.card}
                onPress={() => router.push(sub.route)}
                activeOpacity={0.85}
              >
                <Text style={s.cardEmoji}>{sub.emoji}</Text>
                <Text style={s.cardLabel}>{sub.label}</Text>
                <Text style={s.cardWorld} numberOfLines={2}>{worldName}</Text>
                <Text style={s.cardStars}>{'⭐'.repeat(Math.min(earned, 5))}{earned > 0 ? ` ${earned}` : ''}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Switch theme */}
        <TouchableOpacity style={s.switchBtn} onPress={() => router.push('/onboarding')}>
          <Text style={[s.switchText, { color: theme.primary }]}>🔄 Switch Theme / Profile</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (r, theme) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.background },
  scroll: { padding: r.sp(20), paddingBottom: r.sp(40) },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: r.sp(16) },
  greeting:   { fontSize: r.font(24), fontWeight: '800', color: theme.text },
  subGreeting:{ fontSize: r.font(14), color: theme.textLight, marginTop: r.sp(2) },

  gemBadge: { backgroundColor: theme.surface, borderRadius: r.sp(20), paddingHorizontal: r.sp(14), paddingVertical: r.sp(8) },
  gemText:  { fontSize: r.font(16), fontWeight: '700', color: theme.text },

  banner:    { borderRadius: r.sp(14), padding: r.sp(16), marginBottom: r.sp(24), alignItems: 'center' },
  bannerText:{ fontSize: r.font(20), fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: r.font(13), color: 'rgba(255,255,255,0.8)', marginTop: r.sp(4) },

  sectionTitle: { fontSize: r.font(18), fontWeight: '700', color: theme.text, marginBottom: r.sp(14) },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: r.sp(14) },

  card: {
    width: r.vs(42),
    aspectRatio: 0.85,
    backgroundColor: '#fff',
    borderRadius: r.sp(16),
    padding: r.sp(14),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardEmoji: { fontSize: r.font(36), marginBottom: r.sp(6) },
  cardLabel: { fontSize: r.font(16), fontWeight: '800', color: theme.text, marginBottom: r.sp(4) },
  cardWorld: { fontSize: r.font(11), color: '#888', textAlign: 'center', marginBottom: r.sp(8) },
  cardStars: { fontSize: r.font(14) },

  switchBtn:  { marginTop: r.sp(32), alignItems: 'center' },
  switchText: { fontSize: r.font(14), fontWeight: '600' },
})
