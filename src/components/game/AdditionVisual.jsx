/**
 * AdditionVisual — teaches the addition technique, NEVER reveals the answer.
 *
 * Easy   → themed items (wagons / gems) pop in group-by-group, then slide together
 * Medium → tens-and-units decomposition; final step shows "= ?" not the answer
 * Hard   → column addition with carry callouts; answer row stays blank until kid submits
 */
import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

// ─── Theme item config ────────────────────────────────────────────────────────

const THEME_ITEMS = {
  boy: {
    group1: '🚂',   // engine
    group2: '🚃',   // wagon
    extra:  ['🍎', '🍊', '⚽', '🔵', '🏀'],  // overflow for large numbers
    unit:   'wagon',
    units:  'wagons',
  },
  girl: {
    group1: '💎',
    group2: '🌸',
    extra:  ['🍬', '🦋', '🌟', '🍭', '🍇'],
    unit:   'gem',
    units:  'gems',
  },
}

// Pick a consistent extra emoji per question (based on num1+num2 seed)
function pickExtra(themeItems, seed) {
  return themeItems.extra[seed % themeItems.extra.length]
}

// ─── Single animated item ─────────────────────────────────────────────────────

function AnimItem({ emoji, anim, size }) {
  return (
    <Animated.Text style={{ fontSize: size, transform: [{ scale: anim }] }}>
      {emoji}
    </Animated.Text>
  )
}

// ─── FadeSlide (opacity + translateY, native driver only) ────────────────────

function FadeSlide({ show, children, style, fromY = 10 }) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(fromY)).current

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]).start()
    } else {
      opacity.setValue(0)
      translateY.setValue(fromY)
    }
  }, [show])

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  )
}

// ─── EASY: themed items connecting ───────────────────────────────────────────

const MAX_ITEMS = 10   // max per group in easy mode

function CountingItems({ num1, num2, theme, r }) {
  const items   = THEME_ITEMS[theme.id]
  const extra   = pickExtra(items, num1 + num2)
  const emoji1  = num1 <= 5 ? items.group1 : extra
  const emoji2  = items.group2
  const itemSize = r.font(num1 + num2 <= 10 ? 28 : 22)

  // One Animated.Value per item slot (10 for group1, 10 for group2)
  const g1Anims = useRef(Array.from({ length: MAX_ITEMS }, () => new Animated.Value(0))).current
  const g2Anims = useRef(Array.from({ length: MAX_ITEMS }, () => new Animated.Value(0))).current
  // Slide-in for group2 container (slides from right)
  const slideX  = useRef(new Animated.Value(80)).current
  const slideOp = useRef(new Animated.Value(0)).current

  const [phase, setPhase] = useState(0)
  // phase 0: nothing
  // phase 1: group1 items popping in
  // phase 2: "+" and group2 sliding in from right, items popping in
  // phase 3: connected label ("= ?") appears

  useEffect(() => {
    // Hard reset
    setPhase(0)
    g1Anims.forEach(a => a.setValue(0))
    g2Anims.forEach(a => a.setValue(0))
    slideX.setValue(80)
    slideOp.setValue(0)

    const timers = []

    // Phase 1: group1 pops in staggered
    timers.push(setTimeout(() => setPhase(1), 200))
    for (let i = 0; i < num1; i++) {
      timers.push(setTimeout(() => {
        Animated.spring(g1Anims[i], { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 12 }).start()
      }, 300 + i * 110))
    }

    // Phase 2: group2 slides in from right
    const phase2Start = 300 + num1 * 110 + 400
    timers.push(setTimeout(() => {
      setPhase(2)
      Animated.parallel([
        Animated.spring(slideX,  { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 5 }),
        Animated.timing(slideOp, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start()
    }, phase2Start))

    // Group2 items pop in staggered after container slides in
    for (let i = 0; i < num2; i++) {
      timers.push(setTimeout(() => {
        Animated.spring(g2Anims[i], { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 12 }).start()
      }, phase2Start + 200 + i * 110))
    }

    // Phase 3: connection label
    timers.push(setTimeout(() => setPhase(3), phase2Start + 200 + num2 * 110 + 400))

    return () => timers.forEach(clearTimeout)
  }, [num1, num2])

  const s = easyStyles(r)

  function ItemGrid({ count, anims, emoji }) {
    const rows = []
    for (let i = 0; i < count; i += 5) {
      const n = Math.min(5, count - i)
      rows.push(
        <View key={i} style={s.itemRow}>
          {Array.from({ length: n }, (_, j) => (
            <AnimItem key={j} emoji={emoji} anim={anims[i + j]} size={itemSize} />
          ))}
        </View>
      )
    }
    return <View style={s.itemGrid}>{rows}</View>
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>
        {theme.id === 'boy' ? 'Connect the wagons!' : 'Join the gems!'}
      </Text>

      <View style={s.groups}>
        {/* Group 1 */}
        {phase >= 1 && (
          <View style={s.groupBox}>
            <ItemGrid count={num1} anims={g1Anims} emoji={emoji1} />
            <Text style={[s.groupLabel, { color: theme.primary }]}>{num1}</Text>
          </View>
        )}

        {/* Plus sign */}
        <FadeSlide show={phase >= 2}>
          <Text style={[s.plus, { color: theme.text }]}>+</Text>
        </FadeSlide>

        {/* Group 2 — slides in from right */}
        <Animated.View style={[s.groupBox, {
          opacity: slideOp,
          transform: [{ translateX: slideX }],
        }]}>
          <ItemGrid count={num2} anims={g2Anims} emoji={emoji2} />
          <Text style={[s.groupLabel, { color: theme.secondary }]}>{num2}</Text>
        </Animated.View>
      </View>

      {/* Phase 3: connected question — NO answer shown */}
      <FadeSlide show={phase >= 3} style={[s.connectedBox, { borderColor: theme.primary }]}>
        <Text style={s.connectedText}>
          {num1} {items.units}  +  {num2} {items.units}  =  {'  '}
        </Text>
        <Text style={[s.questionMark, { color: theme.primary }]}>?</Text>
      </FadeSlide>
    </View>
  )
}

const easyStyles = (r) => StyleSheet.create({
  container:     { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:       { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },
  groups:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: r.sp(10), flexWrap: 'wrap', marginBottom: r.sp(12) },
  groupBox:      { alignItems: 'center' },
  itemGrid:      { gap: r.sp(4) },
  itemRow:       { flexDirection: 'row', gap: r.sp(4) },
  groupLabel:    { fontSize: r.font(18), fontWeight: '900', marginTop: r.sp(6), textAlign: 'center' },
  plus:          { fontSize: r.font(32), fontWeight: '900', marginTop: r.sp(10) },
  connectedBox:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10) },
  connectedText: { fontSize: r.font(14), fontWeight: '700', color: '#444' },
  questionMark:  { fontSize: r.font(28), fontWeight: '900' },
})

// ─── MEDIUM: Tens-and-units (answer NOT shown at final step) ─────────────────

function TensUnits({ num1, num2, r, theme }) {
  const [step, setStep] = useState(0)

  const tens1  = Math.floor(num1 / 10),  units1 = num1 % 10
  const tens2  = Math.floor(num2 / 10),  units2 = num2 % 10
  const uSum   = units1 + units2
  const carry  = Math.floor(uSum / 10)
  const uWrite = uSum % 10
  const tSum   = tens1 + tens2 + carry

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 1300),
      setTimeout(() => setStep(3), 2400),
      setTimeout(() => setStep(4), 3500),
    ]
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = tuStyles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>Break into tens and units!</Text>

      {/* Step 1: decomposition */}
      <FadeSlide show={step >= 1}>
        <View style={s.decompRow}>
          <View style={[s.decompBox, { borderColor: theme.primary }]}>
            <Text style={[s.decompNum, { color: theme.primary }]}>{num1}</Text>
            <Text style={s.decompSub}>{tens1 > 0 ? `${tens1*10} + ${units1}` : `${units1}`}</Text>
          </View>
          <Text style={[s.decompPlus, { color: theme.text }]}>+</Text>
          <View style={[s.decompBox, { borderColor: theme.secondary }]}>
            <Text style={[s.decompNum, { color: theme.secondary }]}>{num2}</Text>
            <Text style={s.decompSub}>{tens2 > 0 ? `${tens2*10} + ${units2}` : `${units2}`}</Text>
          </View>
        </View>
      </FadeSlide>

      <View style={s.stepsCol}>
        {/* Step 2: units */}
        <FadeSlide show={step >= 2}>
          <View style={s.stepRow}>
            <View style={[s.badge, { backgroundColor: theme.surface }]}>
              <Text style={[s.badgeText, { color: theme.text }]}>Units</Text>
            </View>
            <Text style={s.stepMath}>
              {units1} + {units2} = {uSum}
              {carry > 0 ? `  →  write ${uWrite}, carry 1` : ''}
            </Text>
          </View>
        </FadeSlide>

        {/* Step 3: tens */}
        <FadeSlide show={step >= 3}>
          <View style={s.stepRow}>
            <View style={[s.badge, { backgroundColor: theme.surface }]}>
              <Text style={[s.badgeText, { color: theme.text }]}>Tens</Text>
            </View>
            <Text style={s.stepMath}>
              {tens1*10} + {tens2*10}{carry > 0 ? ' + 10' : ''} = {tSum * 10}
            </Text>
          </View>
        </FadeSlide>

        {/* Step 4: final — show the sum expression but leave answer as ? */}
        <FadeSlide show={step >= 4}>
          <View style={[s.finalRow, { borderColor: theme.primary }]}>
            <Text style={[s.finalText, { color: theme.text }]}>
              {tSum * 10} + {uWrite} =
            </Text>
            <Text style={[s.finalQ, { color: theme.primary }]}>  ?</Text>
          </View>
        </FadeSlide>
      </View>
    </View>
  )
}

const tuStyles = (r) => StyleSheet.create({
  container:  { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:    { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },
  decompRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: r.sp(10), marginBottom: r.sp(12) },
  decompBox:  { alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), minWidth: r.sp(64) },
  decompNum:  { fontSize: r.font(24), fontWeight: '900' },
  decompSub:  { fontSize: r.font(11), color: '#888', marginTop: r.sp(2), fontWeight: '600' },
  decompPlus: { fontSize: r.font(26), fontWeight: '900' },
  stepsCol:   { gap: r.sp(8) },
  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: r.sp(10) },
  badge:      { borderRadius: r.sp(8), paddingHorizontal: r.sp(8), paddingVertical: r.sp(4), minWidth: r.sp(50) },
  badgeText:  { fontSize: r.font(11), fontWeight: '800', textAlign: 'center' },
  stepMath:   { fontSize: r.font(13), fontWeight: '600', color: '#444', flexShrink: 1 },
  finalRow:   { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), marginTop: r.sp(4) },
  finalText:  { fontSize: r.font(16), fontWeight: '700', color: '#333' },
  finalQ:     { fontSize: r.font(24), fontWeight: '900' },
})

// ─── HARD: Column addition (answer row stays blank) ───────────────────────────

function ColumnMethod({ num1, num2, r, theme }) {
  const [step, setStep] = useState(0)

  const u1 = num1 % 10,              u2 = num2 % 10
  const t1 = Math.floor(num1/10)%10, t2 = Math.floor(num2/10)%10
  const h1 = Math.floor(num1/100),   h2 = Math.floor(num2/100)

  const uSum   = u1 + u2
  const uWrite = uSum % 10,  uCarry = Math.floor(uSum/10)
  const tSum   = t1 + t2 + uCarry
  const tWrite = tSum % 10,  tCarry = Math.floor(tSum/10)
  const hasH   = h1 > 0 || h2 > 0 || tCarry > 0

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 350),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2400),
      hasH ? setTimeout(() => setStep(4), 3500) : null,
    ].filter(Boolean)
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = colStyles(r)

  const highlight = (active) => active ? { backgroundColor: `${theme.primary}25`, borderRadius: r.sp(4) } : {}

  return (
    <View style={s.container}>
      <Text style={s.heading}>Column by column — right to left!</Text>

      <FadeSlide show={step >= 1}>
        <View style={s.board}>
          {/* Carry row */}
          <View style={s.dRow}>
            {hasH && <Text style={s.carry}>{step >= 4 && tCarry ? tCarry : ' '}</Text>}
            <Text style={s.carry}>{step >= 3 && uCarry ? uCarry : ' '}</Text>
            <Text style={s.carry}> </Text>
          </View>
          {/* num1 */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, highlight(step >= 4)]}>{h1 || ' '}</Text>}
            <Text style={[s.digit, highlight(step >= 3)]}>{num1 >= 10 ? t1 : ' '}</Text>
            <Text style={[s.digit, highlight(step >= 2)]}>{u1}</Text>
          </View>
          {/* num2 */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, highlight(step >= 4)]}>{h2 || ' '}</Text>}
            <Text style={[s.digit, highlight(step >= 3)]}>{num2 >= 10 ? t2 : ' '}</Text>
            <Text style={[s.digit, highlight(step >= 2)]}>{u2}</Text>
          </View>
          {/* Divider */}
          <View style={s.divRow}>
            <Text style={[s.plusSym, { color: theme.primary }]}>+</Text>
            <View style={[s.line, { backgroundColor: theme.primary }]} />
          </View>
          {/* Answer row — always "?" until kid submits */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>}
            <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>
            <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>
          </View>
        </View>
      </FadeSlide>

      {/* Callouts */}
      <View style={s.callouts}>
        <FadeSlide show={step >= 2}>
          <View style={[s.callout, { borderColor: theme.primary }]}>
            <Text style={s.calloutT}>① Units:  {u1} + {u2} = {uSum}</Text>
            {uCarry > 0 && <Text style={s.calloutS}>Write {uWrite}, carry 1 to tens</Text>}
          </View>
        </FadeSlide>
        <FadeSlide show={step >= 3}>
          <View style={[s.callout, { borderColor: theme.secondary }]}>
            <Text style={s.calloutT}>
              ② Tens:  {t1} + {t2}{uCarry > 0 ? ` + ${uCarry} (carry)` : ''} = {tSum}
            </Text>
            {tCarry > 0 && <Text style={s.calloutS}>Write {tWrite}, carry 1 to hundreds</Text>}
          </View>
        </FadeSlide>
        {hasH && (
          <FadeSlide show={step >= 4}>
            <View style={[s.callout, { borderColor: '#999' }]}>
              <Text style={s.calloutT}>
                ③ Hundreds:  {h1} + {h2}{tCarry > 0 ? ` + ${tCarry} (carry)` : ''} = {h1+h2+tCarry}
              </Text>
            </View>
          </FadeSlide>
        )}
      </View>
    </View>
  )
}

const colStyles = (r) => StyleSheet.create({
  container: { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:   { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },
  board:     { alignSelf: 'center', marginBottom: r.sp(12) },
  dRow:      { flexDirection: 'row', justifyContent: 'flex-end', gap: r.sp(2) },
  digit:     { width: r.sp(30), textAlign: 'center', fontSize: r.font(26), fontWeight: '800', color: '#333', paddingVertical: r.sp(2) },
  ansDigit:  { fontWeight: '900' },
  carry:     { width: r.sp(30), textAlign: 'center', fontSize: r.font(12), color: '#E53935', fontWeight: '800', height: r.sp(18) },
  divRow:    { flexDirection: 'row', alignItems: 'center', marginVertical: r.sp(4) },
  plusSym:   { fontSize: r.font(16), fontWeight: '900', marginRight: r.sp(4) },
  line:      { flex: 1, height: 2.5, borderRadius: 2 },
  callouts:  { gap: r.sp(8) },
  callout:   { borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(10) },
  calloutT:  { fontSize: r.font(13), fontWeight: '700', color: '#333' },
  calloutS:  { fontSize: r.font(11), color: '#E53935', fontWeight: '600', marginTop: r.sp(3) },
})

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdditionVisual({ num1, num2, difficulty, theme }) {
  const r   = useResponsive()
  const key = `${num1}+${num2}+${difficulty}`

  if (difficulty === 'easy')   return <CountingItems key={key} num1={num1} num2={num2} theme={theme} r={r} />
  if (difficulty === 'medium') return <TensUnits     key={key} num1={num1} num2={num2} theme={theme} r={r} />
  return                              <ColumnMethod  key={key} num1={num1} num2={num2} theme={theme} r={r} />
}
