/**
 * Visual teaching component for addition.
 * Three modes based on difficulty:
 *   easy   → counting dots (single-digit, groups of 5)
 *   medium → tens-and-units breakdown
 *   hard   → column addition with carry-over
 *
 * Each mode auto-plays through steps when the question changes.
 */
import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

// ─── Shared fade-in helper ────────────────────────────────────────────────────

function useFadeIn(visible) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: visible ? 350 : 0,
      useNativeDriver: true,
    }).start()
  }, [visible])
  return anim
}

function FadeSlide({ show, children, style, fromY = 12 }) {
  const opacity   = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(fromY)).current

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 20, bounciness: 5, useNativeDriver: true }),
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

// ─── Dot row renderer ─────────────────────────────────────────────────────────

function DotGroup({ count, color, r, label }) {
  const COLS = 5
  const rows = []
  for (let i = 0; i < count; i += COLS) {
    const n = Math.min(COLS, count - i)
    rows.push(
      <View key={i} style={{ flexDirection: 'row', gap: r.sp(5), marginBottom: r.sp(5) }}>
        {Array.from({ length: n }, (_, j) => (
          <View key={j} style={{
            width: r.sp(13), height: r.sp(13),
            borderRadius: r.sp(7),
            backgroundColor: color,
          }} />
        ))}
      </View>
    )
  }
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: r.font(22), fontWeight: '900', color, marginBottom: r.sp(6) }}>
        {label}
      </Text>
      {rows}
    </View>
  )
}

// ─── EASY: Counting dots ──────────────────────────────────────────────────────

function CountingDots({ num1, num2, answer, theme, r }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 350),
      setTimeout(() => setStep(2), 1100),
      setTimeout(() => setStep(3), 2100),
    ]
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = dotStyles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>Count them together!</Text>

      <View style={s.row}>
        {/* Group 1 */}
        <FadeSlide show={step >= 1}>
          <DotGroup count={num1} color={theme.primary} r={r} label={String(num1)} />
        </FadeSlide>

        {/* Plus sign */}
        <FadeSlide show={step >= 2}>
          <Text style={[s.operator, { color: theme.text }]}>+</Text>
        </FadeSlide>

        {/* Group 2 */}
        <FadeSlide show={step >= 2}>
          <DotGroup count={num2} color={theme.secondary} r={r} label={String(num2)} />
        </FadeSlide>
      </View>

      {/* Result */}
      <FadeSlide show={step >= 3} style={s.resultRow}>
        <Text style={[s.equals, { color: theme.text }]}>= </Text>
        <View style={{ alignItems: 'center' }}>
          {/* Combined dot rows */}
          {(() => {
            const all = [
              ...Array(num1).fill(theme.primary),
              ...Array(num2).fill(theme.secondary),
            ]
            const rows = []
            for (let i = 0; i < all.length; i += 5) {
              const slice = all.slice(i, i + 5)
              rows.push(
                <View key={i} style={{ flexDirection: 'row', gap: r.sp(5), marginBottom: r.sp(5) }}>
                  {slice.map((col, j) => (
                    <View key={j} style={{
                      width: r.sp(13), height: r.sp(13),
                      borderRadius: r.sp(7), backgroundColor: col,
                    }} />
                  ))}
                </View>
              )
            }
            return rows
          })()}
          <Text style={[s.answerLabel, { color: theme.primary }]}>{answer}</Text>
        </View>
      </FadeSlide>
    </View>
  )
}

const dotStyles = (r) => StyleSheet.create({
  container:   { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:     { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(14), textAlign: 'center' },
  row:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: r.sp(16), flexWrap: 'wrap' },
  operator:    { fontSize: r.font(36), fontWeight: '900', marginTop: r.sp(14) },
  resultRow:   { flexDirection: 'row', alignItems: 'flex-start', marginTop: r.sp(16), justifyContent: 'center' },
  equals:      { fontSize: r.font(28), fontWeight: '900', marginTop: r.sp(6) },
  answerLabel: { fontSize: r.font(26), fontWeight: '900', marginTop: r.sp(4) },
})

// ─── MEDIUM: Tens-and-units breakdown ────────────────────────────────────────

function TensUnits({ num1, num2, answer, theme, r }) {
  const [step, setStep] = useState(0)

  const tens1  = Math.floor(num1 / 10)
  const units1 = num1 % 10
  const tens2  = Math.floor(num2 / 10)
  const units2 = num2 % 10

  const unitsSum  = units1 + units2
  const unitWrite = unitsSum % 10
  const carry     = Math.floor(unitsSum / 10)   // 0 or 1
  const tensSum   = tens1 + tens2 + carry

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 300),   // show breakdown
      setTimeout(() => setStep(2), 1200),  // units combine
      setTimeout(() => setStep(3), 2200),  // tens combine
      setTimeout(() => setStep(4), 3300),  // show total
    ]
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = tuStyles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>Break it into tens and units!</Text>

      {/* Step 1: Decomposition */}
      <FadeSlide show={step >= 1}>
        <View style={s.decompRow}>
          <DecompBox num={num1} tens={tens1} units={units1} color={theme.primary} r={r} />
          <Text style={[s.plus, { color: theme.text }]}>+</Text>
          <DecompBox num={num2} tens={tens2} units={units2} color={theme.secondary} r={r} />
        </View>
      </FadeSlide>

      <View style={s.stepsCol}>
        {/* Step 2: Units column */}
        <FadeSlide show={step >= 2}>
          <View style={s.stepRow}>
            <View style={[s.stepBadge, { backgroundColor: theme.surface }]}>
              <Text style={[s.stepLabel, { color: theme.text }]}>Units</Text>
            </View>
            <Text style={s.stepMath}>
              {units1} + {units2} = {unitsSum}
              {carry > 0 ? `  →  write ${unitWrite}, carry 1` : ''}
            </Text>
          </View>
        </FadeSlide>

        {/* Step 3: Tens column */}
        <FadeSlide show={step >= 3}>
          <View style={s.stepRow}>
            <View style={[s.stepBadge, { backgroundColor: theme.surface }]}>
              <Text style={[s.stepLabel, { color: theme.text }]}>Tens</Text>
            </View>
            <Text style={s.stepMath}>
              {tens1}0 + {tens2}0{carry > 0 ? ' + 10 (carry)' : ''} = {tensSum * 10}
            </Text>
          </View>
        </FadeSlide>

        {/* Step 4: Total */}
        <FadeSlide show={step >= 4}>
          <View style={[s.totalRow, { borderColor: theme.primary }]}>
            <Text style={[s.totalLabel, { color: theme.text }]}>
              {tensSum * 10} + {unitWrite} =
            </Text>
            <Text style={[s.totalAnswer, { color: theme.primary }]}> {answer}</Text>
          </View>
        </FadeSlide>
      </View>
    </View>
  )
}

function DecompBox({ num, tens, units, color, r }) {
  const s = tuStyles(r)
  return (
    <View style={[s.decompBox, { borderColor: color }]}>
      <Text style={[s.decompNum, { color }]}>{num}</Text>
      <Text style={s.decompEq}>= {tens > 0 ? `${tens}0 + ` : ''}{units}</Text>
    </View>
  )
}

const tuStyles = (r) => StyleSheet.create({
  container:   { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:     { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },
  decompRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: r.sp(10), marginBottom: r.sp(14) },
  plus:        { fontSize: r.font(28), fontWeight: '900' },
  decompBox:   { alignItems: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10), minWidth: r.sp(70) },
  decompNum:   { fontSize: r.font(24), fontWeight: '900' },
  decompEq:    { fontSize: r.font(12), color: '#888', marginTop: r.sp(2), fontWeight: '600' },
  stepsCol:    { gap: r.sp(8) },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: r.sp(10) },
  stepBadge:   { borderRadius: r.sp(8), paddingHorizontal: r.sp(8), paddingVertical: r.sp(4), minWidth: r.sp(52) },
  stepLabel:   { fontSize: r.font(11), fontWeight: '800', textAlign: 'center' },
  stepMath:    { fontSize: r.font(14), fontWeight: '600', color: '#444', flexShrink: 1 },
  totalRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10), marginTop: r.sp(4) },
  totalLabel:  { fontSize: r.font(16), fontWeight: '700' },
  totalAnswer: { fontSize: r.font(24), fontWeight: '900' },
})

// ─── HARD: Column addition ────────────────────────────────────────────────────

function ColumnMethod({ num1, num2, answer, theme, r }) {
  const [step, setStep] = useState(0)

  // Break each number into digit columns (up to 3 digits)
  const digits1 = String(num1).padStart(3, ' ')
  const digits2 = String(num2).padStart(3, ' ')
  const dAns    = String(answer).padStart(3, ' ')

  // Column sums with carry
  const u1 = num1 % 10,            u2 = num2 % 10
  const t1 = Math.floor(num1 / 10) % 10, t2 = Math.floor(num2 / 10) % 10
  const h1 = Math.floor(num1 / 100),     h2 = Math.floor(num2 / 100)

  const uSum   = u1 + u2
  const uWrite = uSum % 10
  const uCarry = Math.floor(uSum / 10)

  const tSum   = t1 + t2 + uCarry
  const tWrite = tSum % 10
  const tCarry = Math.floor(tSum / 10)

  const hSum   = h1 + h2 + tCarry

  const hasHundreds = h1 > 0 || h2 > 0 || hSum > 0

  const totalSteps = hasHundreds ? 5 : 4

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 350),   // show stacked numbers
      setTimeout(() => setStep(2), 1100),  // units column
      setTimeout(() => setStep(3), 2200),  // tens column
      hasHundreds ? setTimeout(() => setStep(4), 3300) : null,  // hundreds
      setTimeout(() => setStep(hasHundreds ? 5 : 4), hasHundreds ? 4400 : 3300),  // answer
    ].filter(Boolean)
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = colStyles(r)

  const colHighlight = (colStep) =>
    step >= colStep ? { backgroundColor: `${theme.primary}22`, borderRadius: r.sp(6) } : {}

  return (
    <View style={s.container}>
      <Text style={s.heading}>Column addition — right to left!</Text>

      {/* Stacked numbers */}
      <FadeSlide show={step >= 1}>
        <View style={s.board}>
          {/* Carry row */}
          <View style={s.digitRow}>
            <Text style={s.carryCell}>{(step >= 3 && tCarry > 0) ? tCarry : ' '}</Text>
            <Text style={s.carryCell}>{(step >= 2 && uCarry > 0) ? uCarry : ' '}</Text>
            <Text style={s.carryCell}> </Text>
          </View>

          {/* num1 */}
          <View style={s.digitRow}>
            {hasHundreds && <Text style={[s.digit, colHighlight(4)]}>{h1 || ' '}</Text>}
            <Text style={[s.digit, colHighlight(3)]}>{t1 || (num1 < 10 ? ' ' : '0')}</Text>
            <Text style={[s.digit, colHighlight(2)]}>{u1}</Text>
          </View>

          {/* + num2 */}
          <View style={s.digitRow}>
            {hasHundreds && <Text style={[s.digit, colHighlight(4)]}>{h2 || ' '}</Text>}
            <Text style={[s.digit, colHighlight(3)]}>{t2 || (num2 < 10 ? ' ' : '0')}</Text>
            <Text style={[s.digit, colHighlight(2)]}>{u2}</Text>
          </View>

          {/* Divider with + */}
          <View style={s.dividerRow}>
            <Text style={[s.plusSign, { color: theme.primary }]}>+</Text>
            <View style={[s.divider, { backgroundColor: theme.primary }]} />
          </View>

          {/* Answer */}
          <FadeSlide show={step >= totalSteps}>
            <View style={s.digitRow}>
              {hasHundreds && <Text style={[s.digit, s.answerDigit, { color: theme.primary }]}>{hSum > 0 ? hSum : ' '}</Text>}
              <Text style={[s.digit, s.answerDigit, { color: theme.primary }]}>{tWrite}</Text>
              <Text style={[s.digit, s.answerDigit, { color: theme.primary }]}>{uWrite}</Text>
            </View>
          </FadeSlide>
        </View>
      </FadeSlide>

      {/* Step callouts */}
      <View style={s.callouts}>
        <FadeSlide show={step >= 2}>
          <View style={[s.callout, { borderColor: theme.primary }]}>
            <Text style={s.calloutTitle}>① Units  {u1} + {u2} = {uSum}</Text>
            {uCarry > 0 && <Text style={s.calloutSub}>Write {uWrite}, carry {uCarry} to tens</Text>}
          </View>
        </FadeSlide>

        <FadeSlide show={step >= 3}>
          <View style={[s.callout, { borderColor: theme.secondary }]}>
            <Text style={s.calloutTitle}>② Tens  {t1} + {t2}{uCarry > 0 ? ` + ${uCarry}` : ''} = {tSum}</Text>
            {tCarry > 0 && <Text style={s.calloutSub}>Write {tWrite}, carry {tCarry} to hundreds</Text>}
          </View>
        </FadeSlide>

        {hasHundreds && (
          <FadeSlide show={step >= 4}>
            <View style={[s.callout, { borderColor: '#888' }]}>
              <Text style={s.calloutTitle}>③ Hundreds  {h1} + {h2}{tCarry > 0 ? ` + ${tCarry}` : ''} = {hSum}</Text>
            </View>
          </FadeSlide>
        )}
      </View>
    </View>
  )
}

const colStyles = (r) => StyleSheet.create({
  container:    { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:      { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },
  board:        { alignSelf: 'center', marginBottom: r.sp(12) },
  digitRow:     { flexDirection: 'row', justifyContent: 'flex-end', gap: r.sp(4) },
  digit:        { width: r.sp(32), textAlign: 'center', fontSize: r.font(28), fontWeight: '800', color: '#333', paddingVertical: r.sp(2) },
  answerDigit:  { fontWeight: '900' },
  carryCell:    { width: r.sp(32), textAlign: 'center', fontSize: r.font(13), color: '#E53935', fontWeight: '800', height: r.sp(18) },
  dividerRow:   { flexDirection: 'row', alignItems: 'center', marginVertical: r.sp(4) },
  plusSign:     { fontSize: r.font(18), fontWeight: '900', marginRight: r.sp(4) },
  divider:      { flex: 1, height: 2.5, borderRadius: 2 },
  callouts:     { gap: r.sp(8) },
  callout:      { borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(10) },
  calloutTitle: { fontSize: r.font(13), fontWeight: '700', color: '#333' },
  calloutSub:   { fontSize: r.font(12), color: '#E53935', fontWeight: '600', marginTop: r.sp(3) },
})

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AdditionVisual({ num1, num2, answer, difficulty, theme }) {
  const r = useResponsive()
  const key = `${num1}+${num2}`   // force re-mount on new question

  if (difficulty === 'easy') {
    return <CountingDots   key={key} num1={num1} num2={num2} answer={answer} theme={theme} r={r} />
  }
  if (difficulty === 'medium') {
    return <TensUnits      key={key} num1={num1} num2={num2} answer={answer} theme={theme} r={r} />
  }
  return   <ColumnMethod   key={key} num1={num1} num2={num2} answer={answer} theme={theme} r={r} />
}
