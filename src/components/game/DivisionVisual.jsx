/**
 * DivisionVisual — never reveals the answer.
 *
 * Easy   → dealing items: num1 items distributed round-robin into num2 groups
 * Medium → repeated subtraction: count how many times num2 fits into num1
 * Hard   → long division: estimate → multiply → subtract → bring down
 */
import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

const THEME_ITEMS = {
  boy:  { emoji: '🚃', group: '🚂', unit: 'wagon', units: 'wagons', groupLabel: 'train' },
  girl: { emoji: '💎', group: '🧺', unit: 'gem',   units: 'gems',   groupLabel: 'basket' },
}
const EXTRA = {
  boy:  ['🍎', '⚽', '🔵', '🏀', '🍊'],
  girl: ['🌸', '🍬', '🦋', '🌟', '🍭'],
}
function pickEmoji(themeId, seed) {
  return EXTRA[themeId][seed % EXTRA[themeId].length]
}

function FadeSlide({ show, children, style, fromY = 10 }) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(fromY)).current
  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]).start()
    } else { opacity.setValue(0); translateY.setValue(fromY) }
  }, [show])
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  )
}

// ─── EASY: dealing items into groups ─────────────────────────────────────────
// Distributes num1 items one at a time round-robin into num2 groups

const MAX_GROUPS = 6  // cap groups for visual sanity
const MAX_ITEMS  = 20 // cap total items shown

function DealingItems({ num1, num2, theme, r }) {
  const cfg        = THEME_ITEMS[theme.id]
  const emoji      = num1 > 12 ? pickEmoji(theme.id, num1 + num2) : cfg.emoji
  const groupCount = Math.min(num2, MAX_GROUPS)
  const itemCount  = Math.min(num1, MAX_ITEMS)

  // One animated value per item (max MAX_ITEMS)
  const itemAnims = useRef(
    Array.from({ length: MAX_ITEMS }, () => new Animated.Value(0))
  ).current

  // Which group each item index belongs to
  const itemToGroup = Array.from({ length: itemCount }, (_, i) => i % groupCount)

  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    itemAnims.forEach(a => a.setValue(0))
    setShowLabel(false)

    const timers = []
    for (let i = 0; i < itemCount; i++) {
      timers.push(setTimeout(() => {
        Animated.spring(itemAnims[i], {
          toValue: 1, useNativeDriver: true, speed: 28, bounciness: 10,
        }).start()
      }, 300 + i * 220))
    }
    timers.push(setTimeout(() => setShowLabel(true), 300 + itemCount * 220 + 400))
    return () => timers.forEach(clearTimeout)
  }, [num1, num2])

  const s = styles(r)

  // Build groups: group i contains all items where i % groupCount === i
  const groups = Array.from({ length: groupCount }, (_, g) =>
    Array.from({ length: itemCount }, (_, i) => i).filter(i => i % groupCount === g)
  )
  const sz = r.font(itemCount <= 6 ? 26 : itemCount <= 12 ? 20 : 16)

  return (
    <View style={s.container}>
      <Text style={s.heading}>
        Share {num1} {cfg.units} into {groupCount} {cfg.groupLabel}s!
      </Text>

      <View style={s.groupsRow}>
        {Array.from({ length: groupCount }, (_, g) => (
          <View key={g} style={[s.groupBox, { borderColor: theme.primary }]}>
            <Text style={s.groupLabel}>{cfg.group}</Text>
            <View style={s.groupItems}>
              {groups[g].map((itemIdx) => (
                <Animated.Text
                  key={itemIdx}
                  style={{
                    fontSize: sz,
                    opacity:    itemAnims[itemIdx],
                    transform: [{ scale: itemAnims[itemIdx] }],
                  }}
                >
                  {emoji}
                </Animated.Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <FadeSlide show={showLabel}>
        <View style={[s.labelBox, { borderColor: theme.primary }]}>
          <Text style={s.labelText}>
            {num1} {cfg.units}  ÷  {groupCount} {cfg.groupLabel}s  =
          </Text>
          <Text style={[s.qMark, { color: theme.primary }]}>  ?</Text>
        </View>
      </FadeSlide>
    </View>
  )
}

// ─── MEDIUM: repeated subtraction ────────────────────────────────────────────
// Counts how many times we can subtract num2 from num1

const MAX_STEPS = 8

function RepeatedSubtraction({ num1, num2, r, theme }) {
  const actualSteps = Math.floor(num1 / num2)
  const showSteps   = Math.min(actualSteps, MAX_STEPS)
  const isTruncated = actualSteps > MAX_STEPS

  const [visibleStep, setVisibleStep] = useState(0)
  const [showLabel,   setShowLabel]   = useState(false)

  useEffect(() => {
    setVisibleStep(0)
    setShowLabel(false)

    const timers = []
    for (let i = 1; i <= showSteps; i++) {
      timers.push(setTimeout(() => setVisibleStep(i), 300 + (i - 1) * 600))
    }
    timers.push(setTimeout(() => setShowLabel(true), 300 + showSteps * 600 + 400))
    return () => timers.forEach(clearTimeout)
  }, [num1, num2])

  const s  = styles(r)
  const steps = Array.from({ length: showSteps }, (_, i) => ({
    from: num1 - i * num2,
    to:   num1 - (i + 1) * num2,
    count: i + 1,
  }))

  return (
    <View style={s.container}>
      <Text style={s.heading}>How many times does {num2} fit into {num1}?</Text>

      <View style={s.stepsCol}>
        {steps.map((step, i) => (
          <FadeSlide key={i} show={visibleStep > i}>
            <View style={[s.subStep, { borderColor: i === showSteps - 1 && !isTruncated ? theme.primary : '#ddd' }]}>
              <View style={s.subStepLeft}>
                <Text style={[s.subCount, { color: theme.primary }]}>#{step.count}</Text>
              </View>
              <Text style={s.subMath}>
                {step.from} − {num2} = {step.to}
              </Text>
            </View>
          </FadeSlide>
        ))}

        {isTruncated && (
          <FadeSlide show={visibleStep >= showSteps}>
            <Text style={[s.ellipsis, { color: theme.textLight }]}>
              ···  ({actualSteps - MAX_STEPS} more times)
            </Text>
          </FadeSlide>
        )}
      </View>

      <FadeSlide show={showLabel}>
        <View style={[s.finalRow, { borderColor: theme.primary }]}>
          <Text style={[s.finalText, { color: theme.text }]}>
            Subtracted {num2} a total of
          </Text>
          <Text style={[s.finalQ, { color: theme.primary }]}>  ?  </Text>
          <Text style={[s.finalText, { color: theme.text }]}>times</Text>
        </View>
      </FadeSlide>
    </View>
  )
}

// ─── HARD: long division ──────────────────────────────────────────────────────

function LongDivision({ num1, num2, r, theme }) {
  // num1 ÷ num2
  // Walk through digit by digit (simplified for 2-digit ÷ 1-digit or 3-digit ÷ 1-digit)
  const dividendStr = String(num1)
  const steps = []

  let current = 0
  for (let i = 0; i < dividendStr.length; i++) {
    current = current * 10 + parseInt(dividendStr[i], 10)
    const quotientDigit = Math.floor(current / num2)
    const product       = quotientDigit * num2
    const remainder     = current - product
    steps.push({
      brought: dividendStr[i],
      running: current,
      quotientDigit,
      product,
      remainder,
    })
    current = remainder
  }

  const [visibleStep, setVisibleStep] = useState(0)
  const [showAnswer, setShowAnswer]   = useState(false)

  useEffect(() => {
    setVisibleStep(0)
    setShowAnswer(false)

    const timers = []
    for (let i = 1; i <= steps.length; i++) {
      timers.push(setTimeout(() => setVisibleStep(i), 350 + (i - 1) * 1000))
    }
    timers.push(setTimeout(() => setShowAnswer(true), 350 + steps.length * 1000 + 400))
    return () => timers.forEach(clearTimeout)
  }, [num1, num2])

  const s  = styles(r)
  const qMarks = '?'.repeat(steps.filter((s, i) => i < visibleStep && s.quotientDigit > 0 || (s.running >= num2 && i < visibleStep)).length) || '?'

  return (
    <View style={s.container}>
      <Text style={s.heading}>Divide step by step!</Text>

      {/* Division box header */}
      <FadeSlide show={visibleStep >= 1}>
        <View style={s.divBox}>
          <Text style={[s.divisor, { color: theme.primary }]}>{num2}</Text>
          <View style={s.bracket}>
            <View style={[s.bracketTop, { borderColor: theme.primary }]} />
            <Text style={s.dividend}>{dividendStr}</Text>
          </View>
        </View>
      </FadeSlide>

      {/* Steps */}
      <View style={s.ldSteps}>
        {steps.map((step, i) => (
          <FadeSlide key={i} show={visibleStep > i}>
            <View style={[s.ldStep, { backgroundColor: i % 2 === 0 ? `${theme.primary}10` : `${theme.secondary}10` }]}>
              <Text style={[s.stepNum, { color: theme.textLight }]}>Step {i + 1}</Text>
              <Text style={s.ldMath}>
                How many times does {num2} go into {step.running}?
              </Text>
              <View style={s.ldCalcRow}>
                <View style={[s.ldBadge, { backgroundColor: `${theme.primary}20` }]}>
                  <Text style={[s.ldBadgeText, { color: theme.primary }]}>
                    {num2} × {step.quotientDigit} = {step.product}
                  </Text>
                </View>
                <Text style={s.ldRemain}>
                  remainder: {step.remainder}
                </Text>
              </View>
            </View>
          </FadeSlide>
        ))}
      </View>

      <FadeSlide show={showAnswer}>
        <View style={[s.finalRow, { borderColor: theme.primary, marginTop: r.sp(8) }]}>
          <Text style={[s.finalText, { color: theme.text }]}>
            {num1} ÷ {num2} =
          </Text>
          <Text style={[s.finalQ, { color: theme.primary }]}>  ?</Text>
        </View>
      </FadeSlide>
    </View>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = (r) => StyleSheet.create({
  container:   { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:     { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },

  // Easy dealing
  groupsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: r.sp(8), justifyContent: 'center', marginBottom: r.sp(12) },
  groupBox:    { borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(8), alignItems: 'center', minWidth: r.sp(52), flex: 1 },
  groupLabel:  { fontSize: r.font(22), marginBottom: r.sp(4) },
  groupItems:  { flexDirection: 'row', flexWrap: 'wrap', gap: r.sp(3), justifyContent: 'center' },
  labelBox:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10) },
  labelText:   { fontSize: r.font(14), fontWeight: '700', color: '#333' },
  qMark:       { fontSize: r.font(26), fontWeight: '900' },

  // Medium repeated subtraction
  stepsCol:    { gap: r.sp(6), marginBottom: r.sp(10) },
  subStep:     { flexDirection: 'row', alignItems: 'center', gap: r.sp(8), borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(8) },
  subStepLeft: { minWidth: r.sp(28) },
  subCount:    { fontSize: r.font(12), fontWeight: '900' },
  subMath:     { fontSize: r.font(14), fontWeight: '700', color: '#333' },
  ellipsis:    { textAlign: 'center', fontSize: r.font(16), fontWeight: '700', marginVertical: r.sp(4) },
  finalRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), marginTop: r.sp(4), flexWrap: 'wrap', justifyContent: 'center' },
  finalText:   { fontSize: r.font(15), fontWeight: '700', color: '#333' },
  finalQ:      { fontSize: r.font(24), fontWeight: '900' },

  // Hard long division
  divBox:      { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: r.sp(12) },
  divisor:     { fontSize: r.font(30), fontWeight: '900', marginRight: r.sp(6) },
  bracket:     { borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: '#555', paddingLeft: r.sp(8), paddingTop: r.sp(4) },
  bracketTop:  { position: 'absolute', top: 0, left: 0, right: 0, height: 0 },
  dividend:    { fontSize: r.font(30), fontWeight: '900', color: '#333', paddingRight: r.sp(8) },
  ldSteps:     { gap: r.sp(8), marginBottom: r.sp(6) },
  ldStep:      { borderRadius: r.sp(10), padding: r.sp(10) },
  stepNum:     { fontSize: r.font(11), fontWeight: '700', marginBottom: r.sp(3) },
  ldMath:      { fontSize: r.font(13), fontWeight: '700', color: '#333', marginBottom: r.sp(6) },
  ldCalcRow:   { flexDirection: 'row', alignItems: 'center', gap: r.sp(10), flexWrap: 'wrap' },
  ldBadge:     { borderRadius: r.sp(8), paddingHorizontal: r.sp(10), paddingVertical: r.sp(4) },
  ldBadgeText: { fontSize: r.font(13), fontWeight: '800' },
  ldRemain:    { fontSize: r.font(12), color: '#888', fontWeight: '600' },
})

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DivisionVisual({ num1, num2, difficulty, theme }) {
  const r   = useResponsive()
  const key = `${num1}div${num2}-${difficulty}`

  if (difficulty === 'easy')   return <DealingItems         key={key} num1={num1} num2={num2} theme={theme} r={r} />
  if (difficulty === 'medium') return <RepeatedSubtraction  key={key} num1={num1} num2={num2} theme={theme} r={r} />
  return                              <LongDivision         key={key} num1={num1} num2={num2} theme={theme} r={r} />
}
