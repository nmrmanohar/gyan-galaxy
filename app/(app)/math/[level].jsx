import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView }     from 'react-native-safe-area-context'
import { useAppStore }      from '../../../src/store/useAppStore'
import { useResponsive }    from '../../../src/hooks/useResponsive'
import { generateSession, calcStars, LEVEL_CONTEXT } from '../../../src/utils/mathProblems'
import AnswerButton         from '../../../src/components/game/AnswerButton'
import GameProgressBar      from '../../../src/components/game/GameProgressBar'
import ResultsModal         from '../../../src/components/game/ResultsModal'
import AdditionVisual        from '../../../src/components/game/AdditionVisual'
import SubtractionVisual    from '../../../src/components/game/SubtractionVisual'
import MultiplicationVisual from '../../../src/components/game/MultiplicationVisual'
import DivisionVisual       from '../../../src/components/game/DivisionVisual'

const TOTAL        = 10
const AUTO_NEXT_MS = 4500

const CORRECT_MSGS = ['Great! 🎉', 'Correct! ⭐', 'Awesome! 🚀', 'Perfect! 🌟', 'Yes! 🙌']
const WRONG_MSGS   = ['Not quite!', 'Good try!', 'Keep going!']

export default function MathGame() {
  const { level }  = useLocalSearchParams()
  const levelId    = parseInt(level, 10)
  const router     = useRouter()
  const r          = useResponsive()
  const theme      = useAppStore((s) => s.theme)
  const awardStars = useAppStore((s) => s.awardStars)

  const ctx = LEVEL_CONTEXT[theme.id]?.[levelId] ?? { title: 'Math', prompt: 'What is the answer?', icon: '🔢' }

  // ── Session state ──────────────────────────────────────────────────────────
  const [questions,   setQuestions]   = useState([])
  const [qIndex,      setQIndex]      = useState(0)
  const [selected,    setSelected]    = useState(null)
  const [isAnswered,  setIsAnswered]  = useState(false)
  const [score,       setScore]       = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [stars,       setStars]       = useState(0)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  // ── Animations (each value uses ONE driver type consistently) ─────────────
  // flashAnim: JS driver only — used for backgroundColor interpolation
  const flashAnim = useRef(new Animated.Value(0)).current

  // scaleAnim: native driver only — used for transform.scale
  const scaleAnim = useRef(new Animated.Value(1)).current

  // ── Init / reset ───────────────────────────────────────────────────────────
  function startSession() {
    setQuestions(generateSession(levelId))
    setQIndex(0)
    setSelected(null)
    setIsAnswered(false)
    setScore(0)
    setShowResults(false)
    setStars(0)
    setFeedbackMsg('')
    flashAnim.setValue(0)
    scaleAnim.setValue(1)
  }

  useEffect(() => { startSession() }, [levelId])

  const question  = questions[qIndex]
  const isCorrect = selected !== null && question?.choices[selected] === question?.answer

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback((choiceIndex) => {
    if (isAnswered || !question) return
    setSelected(choiceIndex)
    setIsAnswered(true)

    const correct = question.choices[choiceIndex] === question.answer

    if (correct) {
      setScore((s) => s + 1)
      setFeedbackMsg(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)])

      // Flash background — JS driver only (no native driver on this value)
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 450, useNativeDriver: false }),
      ]).start()

      // Scale bounce — native driver only (separate Animated.Value, separate view)
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, speed: 30 }),
        Animated.spring(scaleAnim, { toValue: 1.0,  useNativeDriver: true, speed: 18 }),
      ]).start()
    } else {
      setFeedbackMsg(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)])
    }

    setTimeout(() => advance(correct), AUTO_NEXT_MS)
  }, [isAnswered, question, qIndex, score])

  function advance(wasCorrect) {
    const next = qIndex + 1
    if (next >= TOTAL) {
      const finalScore = score + (wasCorrect ? 1 : 0)
      const earned = calcStars(finalScore, TOTAL)
      setStars(earned)
      awardStars('math', levelId, earned)
      setShowResults(true)
    } else {
      setQIndex(next)
      setSelected(null)
      setIsAnswered(false)
      setFeedbackMsg('')
      flashAnim.setValue(0)
      scaleAnim.setValue(1)
    }
  }

  function buttonState(i) {
    if (!isAnswered) return 'idle'
    const val = question.choices[i]
    if (i === selected)         return val === question.answer ? 'correct' : 'wrong'
    if (val === question.answer) return 'reveal'
    return 'dim'
  }

  const DIFF_BADGE = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }

  if (!question) return null

  const s = styles(r, theme)

  // JS-driven interpolated background color
  const flashBg = flashAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(76,175,80,0)', 'rgba(76,175,80,0.2)'],
  })

  return (
    <SafeAreaView style={s.safe}>

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.ctxTitle}>{ctx.icon}  {ctx.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <GameProgressBar current={qIndex + 1} total={TOTAL} score={score} theme={theme} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.diffBadge}>{DIFF_BADGE[question.difficulty]}</Text>
        <Text style={s.prompt}>{ctx.prompt}</Text>

        {/*
          Question card: TWO nested Animated.Views — one per driver type.
          JS driver (flashBg/backgroundColor) lives on the outer view.
          Native driver (scale transform) lives on the inner view.
          This avoids the mixed-driver crash.
        */}
        <Animated.View style={[s.questionCardOuter, { backgroundColor: flashBg }]}>
          <Animated.View style={[s.questionCardInner, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={s.questionText}>{question.question}</Text>
            <Text style={s.questionEquals}>= ?</Text>
          </Animated.View>
        </Animated.View>

        {/* Visual teaching — shown AFTER the kid answers, reveals how to work it out */}
        {isAnswered && levelId === 1 && (
          <View style={s.visualWrap}>
            <AdditionVisual
              num1={question.num1}
              num2={question.num2}
              answer={question.answer}
              difficulty={question.difficulty}
              theme={theme}
            />
          </View>
        )}
        {isAnswered && levelId === 2 && (
          <View style={s.visualWrap}>
            <SubtractionVisual
              num1={question.num1}
              num2={question.num2}
              answer={question.answer}
              difficulty={question.difficulty}
              theme={theme}
            />
          </View>
        )}
        {isAnswered && levelId === 3 && (
          <View style={s.visualWrap}>
            <MultiplicationVisual
              num1={question.num1}
              num2={question.num2}
              answer={question.answer}
              difficulty={question.difficulty}
              theme={theme}
            />
          </View>
        )}
        {isAnswered && levelId === 4 && (
          <View style={s.visualWrap}>
            <DivisionVisual
              num1={question.num1}
              num2={question.num2}
              answer={question.answer}
              difficulty={question.difficulty}
              theme={theme}
            />
          </View>
        )}

        {/* 2×2 Answer grid */}
        <View style={s.grid}>
          <View style={s.row}>
            <AnswerButton label={String(question.choices[0])} state={buttonState(0)} onPress={() => handleAnswer(0)} disabled={isAnswered} />
            <AnswerButton label={String(question.choices[1])} state={buttonState(1)} onPress={() => handleAnswer(1)} disabled={isAnswered} />
          </View>
          <View style={s.row}>
            <AnswerButton label={String(question.choices[2])} state={buttonState(2)} onPress={() => handleAnswer(2)} disabled={isAnswered} />
            <AnswerButton label={String(question.choices[3])} state={buttonState(3)} onPress={() => handleAnswer(3)} disabled={isAnswered} />
          </View>
        </View>

        {isAnswered && (
          <Text style={[s.feedback, { color: isCorrect ? '#4CAF50' : '#EF5350' }]}>
            {isCorrect ? feedbackMsg : `${feedbackMsg}  The answer is ${question.answer}`}
          </Text>
        )}

      </ScrollView>

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: r.sp(16), paddingTop: r.sp(8), paddingBottom: r.sp(4),
  },
  backBtn:  { width: 60 },
  backText: { fontSize: r.font(15), color: theme.primary, fontWeight: '700' },
  ctxTitle: { fontSize: r.font(15), fontWeight: '700', color: theme.text },

  scroll: { padding: r.sp(20), paddingBottom: r.sp(40), alignItems: 'center' },

  diffBadge: { fontSize: r.font(13), marginBottom: r.sp(4), fontWeight: '600' },
  prompt:    { fontSize: r.font(14), color: theme.textLight, fontWeight: '600', marginBottom: r.sp(14), textAlign: 'center' },

  // Outer view: JS-driven background flash only
  questionCardOuter: {
    width: '100%',
    borderRadius: r.sp(20),
    marginBottom: r.sp(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  // Inner view: native-driver scale only
  questionCardInner: {
    backgroundColor: '#fff',
    borderRadius: r.sp(20),
    paddingVertical: r.sp(28),
    alignItems: 'center',
  },
  questionText:   { fontSize: r.font(42), fontWeight: '900', color: theme.text, letterSpacing: 2 },
  questionEquals: { fontSize: r.font(24), fontWeight: '700', color: theme.textLight, marginTop: r.sp(4) },

  visualWrap: { width: '100%', marginBottom: r.sp(20) },

  grid:     { width: '100%', gap: r.sp(12) },
  row:      { flexDirection: 'row', gap: r.sp(12) },
  feedback: { marginTop: r.sp(16), fontSize: r.font(17), fontWeight: '700', textAlign: 'center' },
})
