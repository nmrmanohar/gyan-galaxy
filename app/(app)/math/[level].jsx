import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore }      from '../../../src/store/useAppStore'
import { useResponsive }    from '../../../src/hooks/useResponsive'
import { generateSession, calcStars, LEVEL_CONTEXT } from '../../../src/utils/mathProblems'
import AnswerButton         from '../../../src/components/game/AnswerButton'
import GameProgressBar      from '../../../src/components/game/GameProgressBar'
import ResultsModal         from '../../../src/components/game/ResultsModal'

const TOTAL       = 10
const AUTO_NEXT_MS = 1300   // ms before advancing after an answer

export default function MathGame() {
  const { level }  = useLocalSearchParams()
  const levelId    = parseInt(level, 10)
  const router     = useRouter()
  const r          = useResponsive()
  const theme      = useAppStore((s) => s.theme)
  const awardStars = useAppStore((s) => s.awardStars)

  const ctx = LEVEL_CONTEXT[theme.id]?.[levelId] ?? { title: 'Math', prompt: 'What is the answer?', icon: '🔢' }

  // ── Session state ──────────────────────────────────────────────────────────
  const [questions,    setQuestions]    = useState([])
  const [qIndex,       setQIndex]       = useState(0)
  const [selected,     setSelected]     = useState(null)   // index into choices[]
  const [isAnswered,   setIsAnswered]   = useState(false)
  const [score,        setScore]        = useState(0)
  const [showResults,  setShowResults]  = useState(false)
  const [stars,        setStars]        = useState(0)

  // Feedback flash behind question card
  const flashAnim  = useRef(new Animated.Value(0)).current
  const questionScaleAnim = useRef(new Animated.Value(1)).current

  // ── Init / reset ───────────────────────────────────────────────────────────
  function startSession() {
    setQuestions(generateSession(levelId))
    setQIndex(0)
    setSelected(null)
    setIsAnswered(false)
    setScore(0)
    setShowResults(false)
    setStars(0)
    flashAnim.setValue(0)
    questionScaleAnim.setValue(1)
  }

  useEffect(() => { startSession() }, [levelId])

  // ── Derived ────────────────────────────────────────────────────────────────
  const question    = questions[qIndex]
  const isCorrect   = selected !== null && question?.choices[selected] === question?.answer

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback((choiceIndex) => {
    if (isAnswered || !question) return
    setSelected(choiceIndex)
    setIsAnswered(true)

    const correct = question.choices[choiceIndex] === question.answer

    if (correct) {
      setScore((s) => s + 1)
      // Green flash + question card bounce
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start()
      Animated.sequence([
        Animated.spring(questionScaleAnim, { toValue: 1.04, useNativeDriver: true, speed: 30 }),
        Animated.spring(questionScaleAnim, { toValue: 1.0,  useNativeDriver: true, speed: 20 }),
      ]).start()
    }

    // Auto advance
    setTimeout(() => advance(correct), AUTO_NEXT_MS)
  }, [isAnswered, question, qIndex, score])

  function advance(wasCorrect) {
    const nextIndex = qIndex + 1
    if (nextIndex >= TOTAL) {
      const finalScore = score + (wasCorrect ? 1 : 0)
      const earned = calcStars(finalScore, TOTAL)
      setStars(earned)
      awardStars('math', levelId, earned)
      setShowResults(true)
    } else {
      setQIndex(nextIndex)
      setSelected(null)
      setIsAnswered(false)
      flashAnim.setValue(0)
    }
  }

  // ── Button state per choice ─────────────────────────────────────────────────
  function buttonState(choiceIndex) {
    if (!isAnswered) return 'idle'
    const val     = question.choices[choiceIndex]
    const isRight = val === question.answer
    if (choiceIndex === selected) return isRight ? 'correct' : 'wrong'
    if (isRight)                  return 'reveal'   // show correct after wrong pick
    return 'dim'
  }

  // ── Difficulty label ───────────────────────────────────────────────────────
  function diffBadge(diff) {
    return { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }[diff] ?? ''
  }

  if (!question) return null

  const s = styles(r, theme)

  const flashBg = flashAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(76,175,80,0)', 'rgba(76,175,80,0.18)'],
  })

  return (
    <SafeAreaView style={s.safe}>

      {/* Back */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.ctxTitle}>{ctx.icon}  {ctx.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress */}
      <GameProgressBar
        current={qIndex + 1}
        total={TOTAL}
        score={score}
        theme={theme}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Difficulty badge */}
        <Text style={s.diffBadge}>{diffBadge(question.difficulty)}</Text>

        {/* Context prompt */}
        <Text style={s.prompt}>{ctx.prompt}</Text>

        {/* Question card */}
        <Animated.View style={[s.questionCard, {
          backgroundColor: flashBg,
          transform: [{ scale: questionScaleAnim }],
        }]}>
          <Text style={s.questionText}>{question.question}</Text>
          <Text style={s.questionEquals}>= ?</Text>
        </Animated.View>

        {/* Answer grid: 2×2 */}
        <View style={s.grid}>
          <View style={s.row}>
            <AnswerButton
              label={String(question.choices[0])}
              state={buttonState(0)}
              onPress={() => handleAnswer(0)}
              disabled={isAnswered}
            />
            <AnswerButton
              label={String(question.choices[1])}
              state={buttonState(1)}
              onPress={() => handleAnswer(1)}
              disabled={isAnswered}
            />
          </View>
          <View style={s.row}>
            <AnswerButton
              label={String(question.choices[2])}
              state={buttonState(2)}
              onPress={() => handleAnswer(2)}
              disabled={isAnswered}
            />
            <AnswerButton
              label={String(question.choices[3])}
              state={buttonState(3)}
              onPress={() => handleAnswer(3)}
              disabled={isAnswered}
            />
          </View>
        </View>

        {/* Feedback text */}
        {isAnswered && (
          <Text style={[s.feedback, { color: isCorrect ? '#4CAF50' : '#EF5350' }]}>
            {isCorrect
              ? ['Great! 🎉', 'Correct! ⭐', 'Awesome! 🚀', 'Perfect! 🌟'][Math.floor(Math.random() * 4)]
              : `The answer is ${question.answer}`
            }
          </Text>
        )}

      </ScrollView>

      {/* Results overlay */}
      <ResultsModal
        visible={showResults}
        stars={stars}
        score={score}
        total={TOTAL}
        theme={theme}
        onReplay={startSession}
        onBack={() => router.back()}
      />

    </SafeAreaView>
  )
}

const styles = (r, theme) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.background },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: r.sp(16),
    paddingTop: r.sp(8),
    paddingBottom: r.sp(4),
  },
  backBtn:  { width: 60 },
  backText: { fontSize: r.font(15), color: theme.primary, fontWeight: '700' },
  ctxTitle: { fontSize: r.font(15), fontWeight: '700', color: theme.text },

  scroll: {
    padding: r.sp(20),
    paddingBottom: r.sp(40),
    alignItems: 'center',
  },

  diffBadge: { fontSize: r.font(13), marginBottom: r.sp(6), fontWeight: '600' },

  prompt: {
    fontSize: r.font(15),
    color: theme.textLight,
    fontWeight: '600',
    marginBottom: r.sp(20),
    textAlign: 'center',
  },

  questionCard: {
    width: '100%',
    borderRadius: r.sp(20),
    paddingVertical: r.sp(32),
    alignItems: 'center',
    marginBottom: r.sp(28),
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  questionText:   { fontSize: r.font(44), fontWeight: '900', color: theme.text, letterSpacing: 2 },
  questionEquals: { fontSize: r.font(28), fontWeight: '700', color: theme.textLight, marginTop: r.sp(4) },

  grid: { width: '100%', gap: r.sp(14) },
  row:  { flexDirection: 'row', gap: r.sp(14) },

  feedback: {
    marginTop: r.sp(20),
    fontSize: r.font(18),
    fontWeight: '700',
    textAlign: 'center',
  },
})
