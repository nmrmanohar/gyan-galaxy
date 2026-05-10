/**
 * SubtractionVisual — teaches subtraction technique, never reveals the answer.
 *
 * Easy   → all items appear, then the subtracted ones shrink + turn red and fade
 * Medium → tens-and-units decomposition with borrowing shown step by step
 * Hard   → column subtraction with borrowing callouts; answer row stays "?"
 */
import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

const THEME_ITEMS = {
  boy:  { emoji: '🚃', removeEmoji: '📦', unit: 'wagon',  units: 'wagons',  action: 'Unload the wagons!' },
  girl: { emoji: '💎', removeEmoji: '💸', unit: 'gem',    units: 'gems',    action: 'Spend the gems!'   },
}
const EXTRA = {
  boy:  ['🍎', '⚽', '🔵', '🏀', '🍊'],
  girl: ['🌸', '🍬', '🦋', '🌟', '🍭'],
}

function pickEmoji(themeId, seed) {
  return EXTRA[themeId][seed % EXTRA[themeId].length]
}

// ─── FadeSlide helper ─────────────────────────────────────────────────────────

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

// ─── EASY: items cross out ────────────────────────────────────────────────────

const MAX = 10

function CrossOutItems({ num1, num2, theme, r }) {
  const cfg   = THEME_ITEMS[theme.id]
  const emoji = num1 > 5 ? pickEmoji(theme.id, num1) : cfg.emoji
  const sz    = r.font(num1 <= 10 ? 26 : 22)

  // One scale + one opacity anim per item slot (max 10)
  const scales   = useRef(Array.from({ length: MAX }, () => new Animated.Value(0))).current
  const opacities = useRef(Array.from({ length: MAX }, () => new Animated.Value(1))).current
  const [phase, setPhase] = useState(0)
  // phase 0: nothing
  // phase 1: all num1 items pop in
  // phase 2: last num2 items cross out (shrink + fade + red tint tracked via state)
  // phase 3: "= ?" label

  const [crossedOut, setCrossedOut] = useState(false)

  useEffect(() => {
    setPhase(0)
    setCrossedOut(false)
    scales.forEach(a => a.setValue(0))
    opacities.forEach(a => a.setValue(1))

    const timers = []

    // Phase 1: pop in all num1 items staggered
    timers.push(setTimeout(() => setPhase(1), 200))
    for (let i = 0; i < num1; i++) {
      timers.push(setTimeout(() => {
        Animated.spring(scales[i], { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 12 }).start()
      }, 300 + i * 100))
    }

    // Phase 2: cross out last num2 items (items num1-num2 ... num1-1)
    const phase2Start = 300 + num1 * 100 + 500
    timers.push(setTimeout(() => {
      setPhase(2)
      const removeStart = num1 - num2  // index of first item to remove
      for (let i = removeStart; i < num1; i++) {
        const delay = (i - removeStart) * 120
        timers.push(setTimeout(() => {
          Animated.parallel([
            Animated.spring(scales[i],    { toValue: 0.2, useNativeDriver: true, speed: 18 }),
            Animated.timing(opacities[i], { toValue: 0.2, duration: 300, useNativeDriver: true }),
          ]).start()
        }, delay))
      }
      setTimeout(() => setCrossedOut(true), num2 * 120 + 400)
    }, phase2Start))

    // Phase 3: result label
    timers.push(setTimeout(() => setPhase(3), phase2Start + num2 * 120 + 700))

    return () => timers.forEach(clearTimeout)
  }, [num1, num2])

  const s = styles(r)

  function renderItems() {
    const rows = []
    for (let i = 0; i < num1; i += 5) {
      const n = Math.min(5, num1 - i)
      rows.push(
        <View key={i} style={s.itemRow}>
          {Array.from({ length: n }, (_, j) => {
            const idx   = i + j
            const isOut = idx >= (num1 - num2)
            return (
              <Animated.View key={j} style={{
                transform: [{ scale: scales[idx] }],
                opacity: opacities[idx],
              }}>
                <Text style={[
                  { fontSize: sz },
                  phase >= 2 && isOut && { tintColor: '#EF5350' },
                ]}>{isOut && phase >= 2 ? '❌' : emoji}</Text>
              </Animated.View>
            )
          })}
        </View>
      )
    }
    return rows
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>{cfg.action}</Text>

      {phase >= 1 && (
        <View style={s.itemsWrap}>
          <View style={s.itemsGrid}>{renderItems()}</View>
          <Text style={[s.totalLabel, { color: theme.primary }]}>{num1} {cfg.units}</Text>
        </View>
      )}

      <FadeSlide show={phase >= 2}>
        <View style={s.opRow}>
          <Text style={[s.opText, { color: '#EF5350' }]}>
            ❌ Remove {num2} {cfg.units}
          </Text>
        </View>
      </FadeSlide>

      <FadeSlide show={phase >= 3}>
        <View style={[s.resultBox, { borderColor: theme.primary }]}>
          <Text style={s.resultText}>
            {num1} − {num2}  =
          </Text>
          <Text style={[s.questionMark, { color: theme.primary }]}>  ?</Text>
        </View>
      </FadeSlide>
    </View>
  )
}

// ─── MEDIUM: tens-units with borrowing ───────────────────────────────────────

function TensUnits({ num1, num2, r, theme }) {
  const [step, setStep] = useState(0)

  const t1 = Math.floor(num1 / 10), u1 = num1 % 10
  const t2 = Math.floor(num2 / 10), u2 = num2 % 10
  const needBorrow = u1 < u2

  // After borrowing: units1 becomes u1+10, tens1 becomes t1-1
  const adj_u1 = needBorrow ? u1 + 10 : u1
  const adj_t1 = needBorrow ? t1 - 1  : t1
  const uAns   = adj_u1 - u2
  const tAns   = adj_t1 - t2

  useEffect(() => {
    setStep(0)
    const t = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 1300),
      needBorrow
        ? setTimeout(() => setStep(3), 2300)
        : null,
      setTimeout(() => setStep(needBorrow ? 4 : 3), needBorrow ? 3300 : 2300),
    ].filter(Boolean)
    return () => t.forEach(clearTimeout)
  }, [num1, num2])

  const s = styles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>Break into tens and units!</Text>

      <FadeSlide show={step >= 1}>
        <View style={s.decompRow}>
          <View style={[s.decompBox, { borderColor: theme.primary }]}>
            <Text style={[s.decompNum, { color: theme.primary }]}>{num1}</Text>
            <Text style={s.decompSub}>{t1 > 0 ? `${t1*10} + ${u1}` : `${u1}`}</Text>
          </View>
          <Text style={[s.decompMinus, { color: theme.text }]}>−</Text>
          <View style={[s.decompBox, { borderColor: theme.secondary }]}>
            <Text style={[s.decompNum, { color: theme.secondary }]}>{num2}</Text>
            <Text style={s.decompSub}>{t2 > 0 ? `${t2*10} + ${u2}` : `${u2}`}</Text>
          </View>
        </View>
      </FadeSlide>

      <View style={s.stepsCol}>
        {/* Check units */}
        <FadeSlide show={step >= 2}>
          <View style={s.stepRow}>
            <View style={[s.badge, { backgroundColor: theme.surface }]}>
              <Text style={[s.badgeText, { color: theme.text }]}>Units</Text>
            </View>
            <Text style={s.stepMath}>
              {u1} − {u2}
              {needBorrow ? `  →  can't! Borrow from tens` : `  =  ${uAns}`}
            </Text>
          </View>
        </FadeSlide>

        {/* Borrowing step */}
        {needBorrow && (
          <FadeSlide show={step >= 3}>
            <View style={[s.borrowBox, { borderColor: '#E53935' }]}>
              <Text style={s.borrowTitle}>🔄 Borrow 10 from the tens place</Text>
              <Text style={s.borrowMath}>
                {t1} tens → {adj_t1} tens  |  {u1} units → {adj_u1} units
              </Text>
              <Text style={s.borrowMath}>{adj_u1} − {u2} = {uAns}</Text>
            </View>
          </FadeSlide>
        )}

        {/* Tens */}
        <FadeSlide show={step >= (needBorrow ? 4 : 3)}>
          <View style={s.stepRow}>
            <View style={[s.badge, { backgroundColor: theme.surface }]}>
              <Text style={[s.badgeText, { color: theme.text }]}>Tens</Text>
            </View>
            <Text style={s.stepMath}>
              {adj_t1*10} − {t2*10} = {tAns*10}
            </Text>
          </View>
        </FadeSlide>

        {/* Final — leave as ? */}
        <FadeSlide show={step >= (needBorrow ? 4 : 3)}>
          <View style={[s.finalRow, { borderColor: theme.primary }]}>
            <Text style={[s.finalText, { color: theme.text }]}>
              {tAns*10} + {uAns} =
            </Text>
            <Text style={[s.finalQ, { color: theme.primary }]}>  ?</Text>
          </View>
        </FadeSlide>
      </View>
    </View>
  )
}

// ─── HARD: column subtraction with borrowing ─────────────────────────────────

function ColumnMethod({ num1, num2, r, theme }) {
  const [step, setStep] = useState(0)

  const u1 = num1 % 10,              u2 = num2 % 10
  const t1 = Math.floor(num1/10)%10, t2 = Math.floor(num2/10)%10
  const h1 = Math.floor(num1/100),   h2 = Math.floor(num2/100)

  const uBorrow = u1 < u2
  const adj_u1  = uBorrow ? u1 + 10 : u1
  const adj_t1  = uBorrow ? t1 - 1  : t1
  const tBorrow = adj_t1 < t2
  const adj_t1b = tBorrow ? adj_t1 + 10 : adj_t1
  const adj_h1  = tBorrow ? h1 - 1 : h1
  const hasH    = h1 > 0 || h2 > 0

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

  const s = styles(r)
  const hl = (active) => active ? { backgroundColor: `${theme.primary}25`, borderRadius: r.sp(4) } : {}

  return (
    <View style={s.container}>
      <Text style={s.heading}>Column subtraction — right to left!</Text>

      <FadeSlide show={step >= 1}>
        <View style={s.board}>
          {/* Borrow indicators */}
          <View style={s.dRow}>
            {hasH && <Text style={s.borrow}>{step >= 4 && tBorrow ? `${adj_h1}` : ' '}</Text>}
            <Text style={s.borrow}>{step >= 3 && uBorrow ? `${adj_t1b}` : ' '}</Text>
            <Text style={s.borrow}>{step >= 2 && uBorrow ? `${adj_u1}` : ' '}</Text>
          </View>
          {/* num1 */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, hl(step >= 4)]}>{h1 || ' '}</Text>}
            <Text style={[s.digit, hl(step >= 3), uBorrow && step >= 3 && s.strikeT]}>{num1 >= 10 ? t1 : ' '}</Text>
            <Text style={[s.digit, hl(step >= 2), uBorrow && step >= 2 && s.strikeU]}>{u1}</Text>
          </View>
          {/* num2 */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, hl(step >= 4)]}>{h2 || ' '}</Text>}
            <Text style={[s.digit, hl(step >= 3)]}>{num2 >= 10 ? t2 : ' '}</Text>
            <Text style={[s.digit, hl(step >= 2)]}>{u2}</Text>
          </View>
          {/* Divider */}
          <View style={s.divRow}>
            <Text style={[s.minusSym, { color: theme.primary }]}>−</Text>
            <View style={[s.line, { backgroundColor: theme.primary }]} />
          </View>
          {/* Answer — always ? */}
          <View style={s.dRow}>
            {hasH && <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>}
            <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>
            <Text style={[s.digit, s.ansDigit, { color: theme.primary }]}>?</Text>
          </View>
        </View>
      </FadeSlide>

      <View style={s.callouts}>
        <FadeSlide show={step >= 2}>
          <View style={[s.callout, { borderColor: theme.primary }]}>
            <Text style={s.calloutT}>
              ① Units:  {u1} − {u2}
              {uBorrow ? `  →  borrow! ${adj_u1} − ${u2} = ${adj_u1-u2}` : `  =  ${u1-u2}`}
            </Text>
            {uBorrow && <Text style={s.calloutS}>Tens column reduces by 1</Text>}
          </View>
        </FadeSlide>
        <FadeSlide show={step >= 3}>
          <View style={[s.callout, { borderColor: theme.secondary }]}>
            <Text style={s.calloutT}>
              ② Tens:  {adj_t1} − {t2}
              {tBorrow ? `  →  borrow! ${adj_t1b} − ${t2} = ${adj_t1b-t2}` : `  =  ${adj_t1-t2}`}
            </Text>
            {tBorrow && <Text style={s.calloutS}>Hundreds column reduces by 1</Text>}
          </View>
        </FadeSlide>
        {hasH && (
          <FadeSlide show={step >= 4}>
            <View style={[s.callout, { borderColor: '#999' }]}>
              <Text style={s.calloutT}>
                ③ Hundreds:  {adj_h1} − {h2} = {adj_h1 - h2}
              </Text>
            </View>
          </FadeSlide>
        )}
      </View>
    </View>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = (r) => StyleSheet.create({
  container:   { padding: r.sp(14), backgroundColor: '#FAFAFA', borderRadius: r.sp(16) },
  heading:     { fontSize: r.font(13), color: '#888', fontWeight: '700', marginBottom: r.sp(12), textAlign: 'center' },

  // Easy
  itemsWrap:   { alignItems: 'center', marginBottom: r.sp(10) },
  itemsGrid:   { gap: r.sp(4) },
  itemRow:     { flexDirection: 'row', gap: r.sp(4) },
  totalLabel:  { fontSize: r.font(15), fontWeight: '800', marginTop: r.sp(6) },
  opRow:       { alignItems: 'center', marginBottom: r.sp(8) },
  opText:      { fontSize: r.font(14), fontWeight: '700' },
  resultBox:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10) },
  resultText:  { fontSize: r.font(16), fontWeight: '700', color: '#333' },
  questionMark:{ fontSize: r.font(26), fontWeight: '900' },

  // Medium
  decompRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: r.sp(10), marginBottom: r.sp(12) },
  decompBox:   { alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), minWidth: r.sp(64) },
  decompNum:   { fontSize: r.font(24), fontWeight: '900' },
  decompSub:   { fontSize: r.font(11), color: '#888', marginTop: r.sp(2), fontWeight: '600' },
  decompMinus: { fontSize: r.font(26), fontWeight: '900' },
  stepsCol:    { gap: r.sp(8) },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: r.sp(10) },
  badge:       { borderRadius: r.sp(8), paddingHorizontal: r.sp(8), paddingVertical: r.sp(4), minWidth: r.sp(50) },
  badgeText:   { fontSize: r.font(11), fontWeight: '800', textAlign: 'center' },
  stepMath:    { fontSize: r.font(13), fontWeight: '600', color: '#444', flexShrink: 1 },
  borrowBox:   { borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(10) },
  borrowTitle: { fontSize: r.font(13), fontWeight: '700', color: '#E53935', marginBottom: r.sp(4) },
  borrowMath:  { fontSize: r.font(12), fontWeight: '600', color: '#444' },
  finalRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), marginTop: r.sp(4) },
  finalText:   { fontSize: r.font(16), fontWeight: '700', color: '#333' },
  finalQ:      { fontSize: r.font(24), fontWeight: '900' },

  // Hard
  board:       { alignSelf: 'center', marginBottom: r.sp(12) },
  dRow:        { flexDirection: 'row', justifyContent: 'flex-end', gap: r.sp(2) },
  digit:       { width: r.sp(30), textAlign: 'center', fontSize: r.font(26), fontWeight: '800', color: '#333', paddingVertical: r.sp(2) },
  ansDigit:    { fontWeight: '900' },
  strikeT:     { textDecorationLine: 'line-through', color: '#aaa' },
  strikeU:     { textDecorationLine: 'line-through', color: '#aaa' },
  borrow:      { width: r.sp(30), textAlign: 'center', fontSize: r.font(12), color: '#E53935', fontWeight: '800', height: r.sp(18) },
  divRow:      { flexDirection: 'row', alignItems: 'center', marginVertical: r.sp(4) },
  minusSym:    { fontSize: r.font(16), fontWeight: '900', marginRight: r.sp(4) },
  line:        { flex: 1, height: 2.5, borderRadius: 2 },
  callouts:    { gap: r.sp(8) },
  callout:     { borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(10) },
  calloutT:    { fontSize: r.font(13), fontWeight: '700', color: '#333' },
  calloutS:    { fontSize: r.font(11), color: '#E53935', fontWeight: '600', marginTop: r.sp(3) },
})

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SubtractionVisual({ num1, num2, difficulty, theme }) {
  const r   = useResponsive()
  const key = `${num1}-${num2}-${difficulty}`

  if (difficulty === 'easy')   return <CrossOutItems key={key} num1={num1} num2={num2} theme={theme} r={r} />
  if (difficulty === 'medium') return <TensUnits     key={key} num1={num1} num2={num2} theme={theme} r={r} />
  return                              <ColumnMethod  key={key} num1={num1} num2={num2} theme={theme} r={r} />
}
