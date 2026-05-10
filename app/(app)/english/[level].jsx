import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppStore }      from '../../../src/store/useAppStore'
import { useResponsive }    from '../../../src/hooks/useResponsive'
import { generateEnglishSession, calcEnglishStars, ENGLISH_LEVEL_CONTEXT } from '../../../src/utils/englishProblems'
import AnswerButton         from '../../../src/components/game/AnswerButton'
import GameProgressBar      from '../../../src/components/game/GameProgressBar'
import ResultsModal         from '../../../src/components/game/ResultsModal'
import AlphabetVisual       from '../../../src/components/game/AlphabetVisual'

const TOTAL        = 10
const AUTO_NEXT_MS = 4500

const CORRECT_MSGS = ['Great! 🎉', 'Correct! ⭐', 'Awesome! 🚀', 'Perfect! 🌟', 'Yes! 🙌']
const WRONG_MSGS   = ['Not quite!', 'Good try!', 'Keep going!']

const DIFF_BADGE = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }

// ─── Question card — varies by question type ──────────────────────────────────

function QuestionCard({ question, theme, r }) {
  const s = cardStyles(r, theme)

  if (question.type === 'medium') {
    // Show emoji + blanked word (e.g. "🍎  _pple")
    return (
      <View style={s.card}>
        <Text style={s.mediumDisplay}>{question.questionDisplay}</Text>
      </View>
    )
  }

  // Easy + Hard: show big letter
  return (
    <View style={s.card}>
      <Text style={[s.bigLetter, { color: theme.primary }]}>{question.letter}</Text>
      {question.type === 'easy' && (
        <Text style={[s.phonetic, { color: theme.textLight }]}>
          Say: {question.phonetic}
        </Text>
      )}
    </View>
  )
}

const cardStyles = (r, theme) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: r.sp(20),
    paddingVertical: r.sp(28),
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: r.sp(16),
  },
  bigLetter:     { fontSize: r.font(72), fontWeight: '900', color: theme.primary, lineHeight: r.font(80) },
  phonetic:      { fontSize: r.font(15), fontWeight: '700', marginTop: r.sp(6) },
  mediumDisplay: { fontSize: r.font(34), fontWeight: '800', color: '#333', textAlign: 'center', paddingHorizontal: r.sp(16) },
})

// ─── Main game screen ─────────────────────────────────────────────────────────

export default function EnglishGame() {
  const { level }  = useLocalSearchParams()
  const levelId    = parseInt(level, 10)
  const router     = useRouter()
  const r          = useResponsive()
  const theme      = useAppStore((s) => s.theme)
  const awardStars = useAppStore((s) => s.awardStars)

  const ctx = ENGLISH_LEVEL_CONTEXT[theme.id]?.[levelId] ?? { title: 'English', prompt: 'Pick the right answer!', icon: '🔤' }

  // ── Session state ───────────────────────────────────────────────────────────
  const [questions,   setQuestions]   = useState([])
  const [qIndex,      setQIndex]      = useState(0)
  const [selected,    setSelected]    = useState(null)
  const [isAnswered,  setIsAnswered]  = useState(false)
  const [score,       setScore]       = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [stars,       setStars]       = useState(0)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  // ── Animations ──────────────────────────────────────────────────────────────
  const flashAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  // ── Session init ────────────────────────────────────────────────────────────
  function startSession() {
    const qs = generateEnglishSession(levelId)
    setQuestions(qs)
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

  // ── Answer handler ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((choiceIndex) => {
    if (isAnswered || !question) return
    setSelected(choiceIndex)
    setIsAnswered(true)

    const correct = question.choices[choiceIndex] === question.answer

    if (correct) {
      setScore((s) => s + 1)
      setFeedbackMsg(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)])
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 450, useNativeDriver: false }),
      ]).start()
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
      const earned = calcEnglishStars(finalScore, TOTAL)
      setStars(earned)
      awardStars('english', levelId, earned)
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
    if (i === selected)          return val === question.answer ? 'correct' : 'wrong'
    if (val === question.answer) return 'reveal'
    return 'dim'
  }

  // Easy choices contain emoji+word (multi-line), others are short
  const needsCompact = question?.type === 'easy' || question?.type === 'hard'

  if (!question) return null

  const s = styles(r, theme)
  const flashBg = flashAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(76,175,80,0)', 'rgba(76,175,80,0.2)'],
  })

  // Level not yet implemented
  if (levelId > 1) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.comingSoon}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.comingSoonEmoji}>{ctx.icon}</Text>
          <Text style={[s.comingSoonTitle, { color: theme.primary }]}>{ctx.title}</Text>
          <Text style={s.comingSoonSub}>Coming soon! 🚀</Text>
          <Text style={s.comingSoonDesc}>{ctx.world}</Text>
        </View>
      </SafeAreaView>
    )
  }

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
        <Text style={s.prompt}>{question.prompt}</Text>

        {/* Question card — JS-driver flash outer, native-driver scale inner */}
        <Animated.View style={[s.cardOuter, { backgroundColor: flashBg }]}>
          <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <QuestionCard question={question} theme={theme} r={r} />
          </Animated.View>
        </Animated.View>

        {/* 2×2 Answer grid */}
        <View style={s.grid}>
          <View style={s.row}>
            <AnswerButton
              label={question.choices[0]}
              state={buttonState(0)}
              onPress={() => handleAnswer(0)}
              disabled={isAnswered}
              compact={needsCompact}
            />
            <AnswerButton
              label={question.choices[1]}
              state={buttonState(1)}
              onPress={() => handleAnswer(1)}
              disabled={isAnswered}
              compact={needsCompact}
            />
          </View>
          <View style={s.row}>
            <AnswerButton
              label={question.choices[2]}
              state={buttonState(2)}
              onPress={() => handleAnswer(2)}
              disabled={isAnswered}
              compact={needsCompact}
            />
            <AnswerButton
              label={question.choices[3]}
              state={buttonState(3)}
              onPress={() => handleAnswer(3)}
              disabled={isAnswered}
              compact={needsCompact}
            />
          </View>
        </View>

        {/* Feedback */}
        {isAnswered && (
          <Text style={[s.feedback, { color: isCorrect ? '#4CAF50' : '#EF5350' }]}>
            {isCorrect
              ? feedbackMsg
              : `${feedbackMsg}  The answer is ${question.answer.replace('\n', ' ')}`
            }
          </Text>
        )}

        {/* Teaching visual — shown after answering (level 1 only) */}
        {isAnswered && levelId === 1 && (
          <View style={s.visualWrap}>
            <AlphabetVisual question={question} theme={theme} />
          </View>
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
  safe:    { flex: 1, backgroundColor: theme.background },

  topBar:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: r.sp(16), paddingTop: r.sp(8), paddingBottom: r.sp(4),
  },
  backBtn:  { width: 60 },
  backText: { fontSize: r.font(15), color: theme.primary, fontWeight: '700' },
  ctxTitle: { fontSize: r.font(15), fontWeight: '700', color: theme.text },

  scroll:    { padding: r.sp(20), paddingBottom: r.sp(40), alignItems: 'center' },
  diffBadge: { fontSize: r.font(13), marginBottom: r.sp(4), fontWeight: '600' },
  prompt:    { fontSize: r.font(14), color: theme.textLight, fontWeight: '600', marginBottom: r.sp(14), textAlign: 'center' },

  cardOuter: { width: '100%', borderRadius: r.sp(20), marginBottom: r.sp(16), overflow: 'hidden' },

  grid:      { width: '100%', gap: r.sp(12) },
  row:       { flexDirection: 'row', gap: r.sp(12) },
  feedback:  { marginTop: r.sp(16), fontSize: r.font(17), fontWeight: '700', textAlign: 'center' },
  visualWrap:{ width: '100%', marginTop: r.sp(16) },

  // Coming soon screen
  comingSoon:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: r.sp(32) },
  comingSoonEmoji: { fontSize: r.font(64), marginBottom: r.sp(12) },
  comingSoonTitle: { fontSize: r.font(28), fontWeight: '900', marginBottom: r.sp(8) },
  comingSoonSub:   { fontSize: r.font(22), fontWeight: '700', color: '#888', marginBottom: r.sp(8) },
  comingSoonDesc:  { fontSize: r.font(14), color: '#aaa', textAlign: 'center' },
})
