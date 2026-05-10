import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore } from '../../../src/store/useAppStore'
import { useResponsive } from '../../../src/hooks/useResponsive'

const LEVELS = [
  { id: 1, emoji: '🅰️', title: 'स्वर',    titleEn: 'Swaras (Vowels)',      desc: 'अ आ इ ई उ ऊ ए ऐ ओ औ अं अः',        boyGame: 'Vowel Highway Signs',   girlGame: 'Rainbow Vowel Magic'    },
  { id: 2, emoji: '🔡', title: 'व्यंजन',  titleEn: 'Vyanjanas (Consonants)',desc: 'क ख ग घ... all consonants',          boyGame: 'Vyanjana Station Boards',girlGame: 'Vyanjana Garden Labels' },
  { id: 3, emoji: '✨', title: 'मात्राएँ', titleEn: 'Matras (Vowel Signs)',  desc: 'का कि की कु कू के कै को कौ...',     boyGame: 'Matra Road Signs',      girlGame: 'Matra Flower Charm'     },
  { id: 4, emoji: '📝', title: 'शब्द',    titleEn: 'Words',                 desc: 'Common Hindi words with pictures',    boyGame: 'Truck Delivery Words',   girlGame: 'Word Bloom Garden'      },
  { id: 5, emoji: '📖', title: 'वाक्य',   titleEn: 'Sentences',             desc: 'Simple sentences & reading',          boyGame: 'Read the Bus Route',     girlGame: 'Story Sentence Train'   },
]

export default function HindiSubject() {
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

        <Text style={s.title}>🏔️ हिन्दी</Text>
        <Text style={s.subtitle}>{theme.worlds.hindi}</Text>

        {LEVELS.map((level) => {
          const stars    = starsFor('hindi', level.id)
          const gameName = theme.id === 'boy' ? level.boyGame : level.girlGame
          return (
            <TouchableOpacity key={level.id} style={s.card} activeOpacity={0.85}
              onPress={() => router.push(`/(app)/hindi/${level.id}`)}>
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
