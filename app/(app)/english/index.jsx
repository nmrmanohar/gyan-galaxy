import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../../src/store/useAppStore'
import { useResponsive } from '../../../src/hooks/useResponsive'

const LEVELS = [
  { id: 1, emoji: '🔤', title: 'Alphabets',    desc: 'A to Z with sounds & pictures',   boyGame: 'Cargo Spelling Trucks',     girlGame: 'Butterfly Letter Catching'   },
  { id: 2, emoji: '📝', title: 'Words',         desc: 'Spell 3–5 letter words',          boyGame: 'Station Name Boards',       girlGame: 'Garden Word Bloom'           },
  { id: 3, emoji: '🔊', title: 'Pronunciation', desc: 'Hear and repeat correctly',       boyGame: 'Driver\'s Announcements',   girlGame: 'Fairy Tale Narration'        },
  { id: 4, emoji: '📖', title: 'Sentences',     desc: 'Read and arrange sentences',      boyGame: 'Read the Road Signs',       girlGame: 'Rainbow Sentence Builder'    },
]

export default function EnglishSubject() {
  const router   = useRouter()
  const r        = useResponsive()
  const theme    = useAppStore((s) => s.theme)
  const starsFor = useAppStore((s) => s.starsFor)

  const s = styles(r, theme)

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={s.title}>🔤 English</Text>
        <Text style={s.subtitle}>{theme.worlds.english}</Text>

        {LEVELS.map((level) => {
          const stars    = starsFor('english', level.id)
          const gameName = theme.id === 'boy' ? level.boyGame : level.girlGame
          return (
            <TouchableOpacity key={level.id} style={s.card} activeOpacity={0.85}
              onPress={() => router.push(`/(app)/english/${level.id}`)}>
              <View style={s.cardLeft}>
                <Text style={s.opEmoji}>{level.emoji}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{level.title}</Text>
                <Text style={s.cardDesc}>{level.desc}</Text>
                <Text style={s.cardGame}>{gameName}</Text>
              </View>
              <View style={s.cardRight}>
                <Text style={s.stars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
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
  back:      { marginBottom: r.sp(16) },
  backText:  { fontSize: r.font(16), color: theme.primary, fontWeight: '600' },
  title:     { fontSize: r.font(30), fontWeight: '800', color: theme.text },
  subtitle:  { fontSize: r.font(15), color: theme.textLight, marginBottom: r.sp(24) },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: r.sp(16), marginBottom: r.sp(14), padding: r.sp(16), elevation: 3 },
  cardLeft:  { marginRight: r.sp(14) },
  opEmoji:   { fontSize: r.font(32) },
  cardBody:  { flex: 1 },
  cardTitle: { fontSize: r.font(18), fontWeight: '700', color: theme.text },
  cardDesc:  { fontSize: r.font(12), color: '#888', marginTop: r.sp(2) },
  cardGame:  { fontSize: r.font(12), color: theme.primary, marginTop: r.sp(4), fontWeight: '600' },
  cardRight: { marginLeft: r.sp(10) },
  stars:     { fontSize: r.font(14) },
})
