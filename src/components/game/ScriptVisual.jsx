/**
 * ScriptVisual — shown after the kid answers.
 * Works for Telugu, Hindi, and any script with char + translit + example + meaning.
 */
import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

export default function ScriptVisual({ question, theme }) {
  const r = useResponsive()

  const charScale   = useRef(new Animated.Value(0)).current
  const infoOpacity = useRef(new Animated.Value(0)).current
  const infoSlideY  = useRef(new Animated.Value(16)).current
  const wordOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    charScale.setValue(0)
    infoOpacity.setValue(0)
    infoSlideY.setValue(16)
    wordOpacity.setValue(0)

    Animated.sequence([
      Animated.spring(charScale, {
        toValue: 1, useNativeDriver: true, speed: 14, bounciness: 16,
      }),
      Animated.parallel([
        Animated.timing(infoOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(infoSlideY,  { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]),
      Animated.timing(wordOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start()
  }, [question.char])

  const s = styles(r, theme)

  return (
    <View style={s.container}>

      {/* Big character with scale bounce */}
      <Animated.Text style={[s.bigChar, { color: theme.primary, transform: [{ scale: charScale }] }]}>
        {question.char}
      </Animated.Text>

      {/* Transliteration + "sounds like" */}
      <Animated.View style={[s.translitRow, { opacity: infoOpacity, transform: [{ translateY: infoSlideY }] }]}>
        <View style={[s.translitBadge, { backgroundColor: theme.surface }]}>
          <Text style={[s.translitText, { color: theme.primary }]}>{question.translit}</Text>
        </View>
        <Text style={[s.soundsLike, { color: theme.textLight }]}>← how it sounds</Text>
      </Animated.View>

      {/* Example word + meaning */}
      <Animated.View style={[s.exampleRow, { opacity: wordOpacity }]}>
        <View style={[s.exampleBox, { borderColor: theme.primary }]}>
          <Text style={[s.exampleChar, { color: theme.primary }]}>
            {question.char}
          </Text>
          <Text style={[s.exampleArrow, { color: theme.textLight }]}> → </Text>
          <Text style={[s.exampleWord, { color: theme.text }]}>{question.example}</Text>
          <Text style={[s.exampleMeaning, { color: theme.textLight }]}>
            {' '}({question.meaning})
          </Text>
        </View>
      </Animated.View>

    </View>
  )
}

const styles = (r, theme) => StyleSheet.create({
  container:     { padding: r.sp(16), backgroundColor: '#FAFAFA', borderRadius: r.sp(16), alignItems: 'center' },

  bigChar:       { fontSize: r.font(72), fontWeight: '900', lineHeight: r.font(84), marginBottom: r.sp(10) },

  translitRow:   { flexDirection: 'row', alignItems: 'center', gap: r.sp(10), marginBottom: r.sp(14) },
  translitBadge: { borderRadius: r.sp(20), paddingHorizontal: r.sp(16), paddingVertical: r.sp(6) },
  translitText:  { fontSize: r.font(20), fontWeight: '900', letterSpacing: 1 },
  soundsLike:    { fontSize: r.font(12), fontWeight: '600' },

  exampleRow:    { width: '100%' },
  exampleBox:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: r.sp(12), padding: r.sp(12), flexWrap: 'wrap' },
  exampleChar:   { fontSize: r.font(20), fontWeight: '900' },
  exampleArrow:  { fontSize: r.font(16), fontWeight: '600' },
  exampleWord:   { fontSize: r.font(20), fontWeight: '700' },
  exampleMeaning:{ fontSize: r.font(13), fontWeight: '600' },
})
