import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../../src/store/useAppStore'
import { useResponsive } from '../../../src/hooks/useResponsive'

const LEVELS = [
  { id: 1, op: '➕', title: 'Addition',       desc: 'Add numbers, easy → hard',    boyGame: '🚂 Load the Train Wagons',   girlGame: '🧁 Fairy Bakery Orders'    },
  { id: 2, op: '➖', title: 'Subtraction',    desc: 'Subtract and find what\'s left', boyGame: '🚚 Unload Truck Deliveries', girlGame: '💎 Mermaid Market Gems'    },
  { id: 3, op: '✖️', title: 'Multiplication', desc: 'Times tables 1–12',            boyGame: '🏗️ Tower Crane Stacking',   girlGame: '👑 Princess Gem Groups'    },
  { id: 4, op: '➗', title: 'Division',       desc: 'Divide cargo equally',         boyGame: '⚙️ Split Cargo to Trucks',  girlGame: '🦄 Share Unicorn Carrots'  },
]

export default function MathSubject() {
  const router     = useRouter()
  const r          = useResponsive()
  const theme      = useAppStore((s) => s.theme)
  const starsFor   = useAppStore((s) => s.starsFor)

  const s = styles(r, theme)

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={s.title}>🔢 Math</Text>
        <Text style={s.subtitle}>{theme.worlds.math}</Text>

        {LEVELS.map((level) => {
          const stars    = starsFor('math', level.id)
          const gameName = theme.id === 'boy' ? level.boyGame : level.girlGame
          const unlocked = level.id === 1 || starsFor('math', level.id - 1) > 0
          return (
            <TouchableOpacity
              key={level.id}
              style={[s.card, !unlocked && s.cardLocked]}
              activeOpacity={unlocked ? 0.85 : 1}
              onPress={() => unlocked && router.push(`/(app)/math/${level.id}`)}
            >
              <View style={s.cardLeft}>
                <Text style={s.opEmoji}>{unlocked ? level.op : '🔒'}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={[s.cardTitle, !unlocked && s.lockedText]}>{level.title}</Text>
                <Text style={s.cardDesc}>{unlocked ? level.desc : 'Complete previous level to unlock'}</Text>
                {unlocked && <Text style={s.cardGame}>{gameName}</Text>}
              </View>
              <View style={s.cardRight}>
                {unlocked
                  ? <Text style={s.stars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
                  : <Text style={s.lockedBadge}>LOCKED</Text>
                }
              </View>
            </TouchableOpacity>
          )
        })}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (r, theme) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.background },
  scroll: { padding: r.sp(20), paddingBottom: r.sp(40) },

  back:     { marginBottom: r.sp(16) },
  backText: { fontSize: r.font(16), color: theme.primary, fontWeight: '600' },

  title:    { fontSize: r.font(30), fontWeight: '800', color: theme.text },
  subtitle: { fontSize: r.font(15), color: theme.textLight, marginBottom: r.sp(24) },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: r.sp(16),
    marginBottom: r.sp(14),
    padding: r.sp(16),
    elevation: 3,
  },
  cardLeft:  { marginRight: r.sp(14) },
  opEmoji:   { fontSize: r.font(32) },
  cardBody:  { flex: 1 },
  cardTitle: { fontSize: r.font(18), fontWeight: '700', color: theme.text },
  cardDesc:  { fontSize: r.font(12), color: '#888', marginTop: r.sp(2) },
  cardGame:  { fontSize: r.font(12), color: theme.primary, marginTop: r.sp(4), fontWeight: '600' },
  cardRight:   { marginLeft: r.sp(10), alignItems: 'flex-end' },
  stars:       { fontSize: r.font(14) },
  cardLocked:  { opacity: 0.55 },
  lockedText:  { color: '#aaa' },
  lockedBadge: { fontSize: r.font(10), color: '#bbb', fontWeight: '700', borderWidth: 1, borderColor: '#ddd', borderRadius: r.sp(4), paddingHorizontal: r.sp(6), paddingVertical: r.sp(2) },
})
