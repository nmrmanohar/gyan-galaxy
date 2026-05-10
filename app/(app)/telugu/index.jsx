import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../../src/store/useAppStore'
import { useResponsive } from '../../../src/hooks/useResponsive'

const LEVELS = [
  { id: 1, emoji: '🅰️', title: 'అచ్చులు',       titleEn: 'Achulu (Vowels)',      desc: 'అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ అం అః', boyGame: 'Vowel Signal Boards',    girlGame: 'Magic Vowel Spells'      },
  { id: 2, emoji: '🔡', title: 'హల్లులు',       titleEn: 'Hallulu (Consonants)', desc: 'క ఖ గ ... all 36 consonants',        boyGame: 'Hallu Station Names',    girlGame: 'Hallu Flower Pots'       },
  { id: 3, emoji: '✨', title: 'గుణింతాలు',     titleEn: 'Gunintalu',           desc: 'క కా కి కీ కు కూ... vowel signs',    boyGame: 'Road Sign Gunintalu',    girlGame: 'Gunintalu Garden'        },
  { id: 4, emoji: '🔗', title: 'ఒత్తులు',       titleEn: 'Othulu (Conjuncts)',  desc: 'క్క క్త ప్ప... conjunct letters',    boyGame: 'Train Bogey Conjuncts',  girlGame: 'Puzzle Piece Othulu'     },
  { id: 5, emoji: '📝', title: 'పదాలు',         titleEn: 'Words',               desc: 'Common Telugu words with pictures',   boyGame: 'Truck Cargo Words',      girlGame: 'Word Waterfall Catch'    },
  { id: 6, emoji: '📖', title: 'వాక్యాలు',      titleEn: 'Sentences',           desc: 'Simple sentences & reading',          boyGame: 'Read the Logbook',       girlGame: 'Story Book Sentences'    },
]

export default function TeluguSubject() {
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

        <Text style={s.title}>🌺 తెలుగు</Text>
        <Text style={s.subtitle}>{theme.worlds.telugu}</Text>

        {LEVELS.map((level) => {
          const stars    = starsFor('telugu', level.id)
          const gameName = theme.id === 'boy' ? level.boyGame : level.girlGame
          return (
            <TouchableOpacity key={level.id} style={s.card} activeOpacity={0.85}
              onPress={() => router.push(`/(app)/telugu/${level.id}`)}>
              <View style={s.cardLeft}>
                <Text style={s.opEmoji}>{level.emoji}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{level.title}</Text>
                <Text style={s.cardTitleEn}>{level.titleEn}</Text>
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
  safe:        { flex: 1, backgroundColor: theme.background },
  scroll:      { padding: r.sp(20), paddingBottom: r.sp(40) },
  back:        { marginBottom: r.sp(16) },
  backText:    { fontSize: r.font(16), color: theme.primary, fontWeight: '600' },
  title:       { fontSize: r.font(30), fontWeight: '800', color: theme.text },
  subtitle:    { fontSize: r.font(15), color: theme.textLight, marginBottom: r.sp(24) },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: r.sp(16), marginBottom: r.sp(14), padding: r.sp(16), elevation: 3 },
  cardLeft:    { marginRight: r.sp(14) },
  opEmoji:     { fontSize: r.font(32) },
  cardBody:    { flex: 1 },
  cardTitle:   { fontSize: r.font(20), fontWeight: '700', color: theme.text },
  cardTitleEn: { fontSize: r.font(13), color: theme.textLight, fontWeight: '600', marginTop: r.sp(2) },
  cardDesc:    { fontSize: r.font(11), color: '#888', marginTop: r.sp(2) },
  cardGame:    { fontSize: r.font(12), color: theme.primary, marginTop: r.sp(4), fontWeight: '600' },
  cardRight:   { marginLeft: r.sp(10) },
  stars:       { fontSize: r.font(14) },
})
