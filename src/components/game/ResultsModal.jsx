import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

const STAR_MESSAGES = {
  3: ['Amazing! 🎉', 'You nailed it! 🚀', 'Superstar! ⭐'],
  2: ['Great job! 👏', 'Well done! 🙌', 'Keep it up! 💪'],
  1: ['Good try! 😊', 'Getting better! 🌱', 'Practice makes perfect!'],
  0: ['Keep going! 💛', 'Try again, you can do it!', 'Every mistake is a lesson!'],
}

function pickMessage(stars) {
  const arr = STAR_MESSAGES[stars]
  return arr[Math.floor(Math.random() * arr.length)]
}

function StarRow({ stars, r, theme }) {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 200),
        Animated.spring(anim, {
          toValue: i < stars ? 1 : 0.3,
          useNativeDriver: true,
          speed: 12,
          bounciness: 14,
        }),
      ]).start()
    })
  }, [stars])

  return (
    <View style={{ flexDirection: 'row', gap: r.sp(12), marginVertical: r.sp(16) }}>
      {anims.map((anim, i) => (
        <Animated.Text
          key={i}
          style={{
            fontSize: r.font(52),
            transform: [{ scale: anim }],
            opacity: i < stars ? 1 : 0.25,
          }}
        >
          ⭐
        </Animated.Text>
      ))}
    </View>
  )
}

export default function ResultsModal({ visible, stars, score, total, theme, onReplay, onBack }) {
  const r          = useResponsive()
  const slideAnim  = useRef(new Animated.Value(300)).current
  const fadeAnim   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1,   duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 8, useNativeDriver: true }),
      ]).start()
    } else {
      slideAnim.setValue(300)
      fadeAnim.setValue(0)
    }
  }, [visible])

  const message = pickMessage(stars)
  const s       = styles(r, theme)

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[s.card, { transform: [{ translateY: slideAnim }] }]}>

          {/* Theme icon */}
          <Text style={s.icon}>{theme.pet}</Text>

          {/* Message */}
          <Text style={[s.title, { color: theme.primary }]}>{message}</Text>

          {/* Stars */}
          <StarRow stars={stars} r={r} theme={theme} />

          {/* Score */}
          <View style={[s.scoreBadge, { backgroundColor: theme.surface }]}>
            <Text style={[s.scoreNum, { color: theme.text }]}>{score}</Text>
            <Text style={[s.scoreOf,  { color: theme.textLight }]}>/ {total} correct</Text>
          </View>

          {/* Difficulty badge */}
          <Text style={s.diffLabel}>
            {score >= 9 ? '🔥 Excellent!' : score >= 6 ? '👍 Good' : '📚 Keep practising'}
          </Text>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary }]} onPress={onReplay}>
              <Text style={s.btnText}>🔄  Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: theme.surface }]} onPress={onBack}>
              <Text style={[s.btnText, { color: theme.text }]}>🏠  Home</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = (r, theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: r.sp(24),
  },
  card: {
    width: '100%',
    maxWidth: r.vs(90),
    backgroundColor: '#fff',
    borderRadius: r.sp(24),
    padding: r.sp(28),
    alignItems: 'center',
    elevation: 12,
  },

  icon:      { fontSize: r.font(56), marginBottom: r.sp(4) },
  title:     { fontSize: r.font(24), fontWeight: '800', textAlign: 'center' },

  scoreBadge:  { flexDirection: 'row', alignItems: 'baseline', gap: r.sp(6), borderRadius: r.sp(12), paddingHorizontal: r.sp(20), paddingVertical: r.sp(10), marginBottom: r.sp(8) },
  scoreNum:    { fontSize: r.font(40), fontWeight: '900' },
  scoreOf:     { fontSize: r.font(18), fontWeight: '600' },

  diffLabel: { fontSize: r.font(14), color: '#888', marginBottom: r.sp(24) },

  btnRow: { flexDirection: 'row', gap: r.sp(12), width: '100%' },
  btn:    { flex: 1, borderRadius: r.sp(14), paddingVertical: r.sp(14), alignItems: 'center', elevation: 2 },
  btnText:{ fontSize: r.font(16), fontWeight: '700', color: '#fff' },
})
