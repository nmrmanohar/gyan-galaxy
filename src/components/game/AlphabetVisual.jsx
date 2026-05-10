/**
 * AlphabetVisual — shown after the kid answers.
 * Displays the letter, its lowercase twin, example word + emoji, and phonetic hint.
 */
import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

export default function AlphabetVisual({ question, theme }) {
  const r = useResponsive()

  const letterScale  = useRef(new Animated.Value(0)).current
  const wordOpacity  = useRef(new Animated.Value(0)).current
  const wordSlideY   = useRef(new Animated.Value(16)).current
  const phoneticOp   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    letterScale.setValue(0)
    wordOpacity.setValue(0)
    wordSlideY.setValue(16)
    phoneticOp.setValue(0)

    Animated.sequence([
      Animated.spring(letterScale, {
        toValue: 1, useNativeDriver: true, speed: 14, bounciness: 16,
      }),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(wordSlideY,  { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]),
      Animated.timing(phoneticOp, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start()
  }, [question.letter])

  const s = styles(r, theme)

  return (
    <View style={s.container}>

      {/* Letter pair: uppercase + lowercase */}
      <View style={s.letterRow}>
        <Animated.Text style={[s.bigLetter, { color: theme.primary, transform: [{ scale: letterScale }] }]}>
          {question.letter.toUpperCase()}
        </Animated.Text>
        <Animated.Text style={[s.smallLetter, { color: theme.secondary, transform: [{ scale: letterScale }] }]}>
          {question.letter.toLowerCase()}
        </Animated.Text>
      </View>

      {/* Word + emoji */}
      <Animated.View style={[s.wordRow, { opacity: wordOpacity, transform: [{ translateY: wordSlideY }] }]}>
        <Text style={s.wordEmoji}>{question.emoji}</Text>
        <View>
          <Text style={[s.wordText, { color: theme.text }]}>
            <Text style={[s.wordFirstLetter, { color: theme.primary }]}>{question.letter}</Text>
            {question.word.slice(1)}
          </Text>
          <Text style={[s.isFor, { color: theme.textLight }]}>
            {question.letter} is for {question.word}
          </Text>
        </View>
      </Animated.View>

      {/* Phonetic hint */}
      <Animated.View style={[s.phoneticBox, { opacity: phoneticOp, backgroundColor: theme.surface }]}>
        <Text style={[s.phoneticLabel, { color: theme.textLight }]}>Say it: </Text>
        <Text style={[s.phoneticText, { color: theme.primary }]}>{question.phonetic}</Text>
      </Animated.View>

    </View>
  )
}

const styles = (r, theme) => StyleSheet.create({
  container:   { padding: r.sp(16), backgroundColor: '#FAFAFA', borderRadius: r.sp(16), alignItems: 'center' },

  letterRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: r.sp(12), marginBottom: r.sp(12) },
  bigLetter:   { fontSize: r.font(72), fontWeight: '900', lineHeight: r.font(80) },
  smallLetter: { fontSize: r.font(52), fontWeight: '800', lineHeight: r.font(60), marginBottom: r.sp(4) },

  wordRow:     { flexDirection: 'row', alignItems: 'center', gap: r.sp(14), marginBottom: r.sp(12) },
  wordEmoji:   { fontSize: r.font(40) },
  wordText:    { fontSize: r.font(22), fontWeight: '700' },
  wordFirstLetter: { fontSize: r.font(22), fontWeight: '900' },
  isFor:       { fontSize: r.font(12), fontWeight: '600', marginTop: r.sp(2) },

  phoneticBox: { flexDirection: 'row', alignItems: 'center', borderRadius: r.sp(20), paddingHorizontal: r.sp(16), paddingVertical: r.sp(8) },
  phoneticLabel:{ fontSize: r.font(13), fontWeight: '600' },
  phoneticText: { fontSize: r.font(16), fontWeight: '900', letterSpacing: 1 },
})
