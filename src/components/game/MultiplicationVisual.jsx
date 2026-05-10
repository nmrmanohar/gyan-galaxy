/**
 * MultiplicationVisual — never reveals the answer.
 *
 * Easy   → array model: num1 rows of num2 items appear row by row
 * Medium → split-five method: break larger factor into (×5) + (×remainder)
 * Hard   → column multiplication with partial products; answer stays "?"
 */
import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

const THEME_ITEMS = {
  boy:  { emoji: '🚃', unit: 'wagon', units: 'wagons', action: 'Fill the trains!'    },
  girl: { emoji: '💎', unit: 'gem',   units: 'gems',   action: 'Stack the gems!'    },
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

// ─── EASY: array model ────────────────────────────────────────────────────────
// Shows num1 rows of num2 items, rows appear one by one

function ArrayModel({ num1, num2, theme, r, answer }) {
  const cfg   = THEME_ITEMS[theme.id]
  // Use overflow emoji for larger numbers to keep items small
  const emoji = num2 > 5 ? pickEmoji(theme.id, num1 + num2) : cfg.emoji
  const sz    = r.font(num2 <= 4 ? 26 : num2 <= 6 ? 22 : 18)

  // One scale anim per row (max 5 rows in easy mode)
  const rowAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current
  const [visibleRows, setVisibleRows] = useState(0)
  const [showLabel,   setShowLabel]   = useState(false)

  useEffect(() => {
    rowAnims.forEach(a => a.setValue(0))
    setVisibleRows(0)
    setShowLabel(false)

    // Revealed mode: show all rows immediately
    if (answer != null) {
      rowAnims.slice(0, num1).forEach(a => a.setValue(1))
      setVisibleRows(num1)
      setTimeout(() => setShowLabel(true), 80)
      return
    }

    const timers = []
    // Pop each row in, 600ms apart
    for (let i = 0; i < num1; i++) {
      timers.push(setTimeout(() => {
        setVisibleRows(i + 1)
        Animated.spring(rowAnims[i], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
      }, 300 + i * 550))
    }
    // Show label after all rows
    timers.push(setTimeout(() => setShowLabel(true), 300 + num1 * 550 + 400))
    return () => timers.forEach(clearTimeout)
  }, [num1, num2, answer])

  const s = styles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>{cfg.action}  {num1} groups of {num2}</Text>

      <View style={s.arrayGrid}>
        {Array.from({ length: num1 }, (_, row) => (
          <Animated.View
            key={row}
            style={[s.arrayRow, {
              opacity:   rowAnims[row],
              transform: [{ scale: rowAnims[row] }],
            }]}
          >
            {/* Row label */}
            <Text style={[s.rowNum, { color: theme.textLight }]}>
              {row + 1}×
            </Text>
            {/* Items */}
            <View style={s.rowItems}>
              {Array.from({ length: num2 }, (_, col) => (
                <Text key={col} style={{ fontSize: sz }}>{emoji}</Text>
              ))}
            </View>
          </Animated.View>
        ))}
      </View>

      <FadeSlide show={showLabel}>
        <View style={[s.labelBox, { borderColor: answer != null ? '#4CAF50' : theme.primary }]}>
          <Text style={s.labelText}>
            {num1} groups  ×  {num2} {cfg.units}  =
          </Text>
          <Text style={[s.qMark, { color: answer != null ? '#4CAF50' : theme.primary }]}>
            {'  '}{answer != null ? answer : '?'}
          </Text>
        </View>
      </FadeSlide>
    </View>
  )
}

// ─── MEDIUM: split-5 method ───────────────────────────────────────────────────
// Break the larger factor: e.g. 7×8 = 7×5 + 7×3 = 35 + 21 = ?

function SplitFive({ num1, num2, r, theme, answer }) {
  // Always split num2 (the second factor) if > 5
  // If num2 <= 5, split num1
  const [big, small] = num2 > 5 ? [num1, num2] : [num2, num1]
  const split5  = Math.min(small, 5)
  const split2  = small - split5
  const part1   = big * split5
  const part2   = big * split2

  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    const fast = answer != null
    const t = [
      setTimeout(() => setStep(1), fast ?  80 : 300),
      setTimeout(() => setStep(2), fast ? 280 : 1300),
      split2 > 0 ? setTimeout(() => setStep(3), fast ? 480 : 2300) : null,
      setTimeout(() => setStep(split2 > 0 ? 4 : 3), fast ? (split2 > 0 ? 680 : 480) : (split2 > 0 ? 3300 : 2300)),
    ].filter(Boolean)
    return () => t.forEach(clearTimeout)
  }, [num1, num2, answer])

  const s = styles(r)

  return (
    <View style={s.container}>
      <Text style={s.heading}>Split the bigger number!</Text>

      <FadeSlide show={step >= 1}>
        <View style={s.splitHeader}>
          <Text style={[s.splitEq, { color: theme.text }]}>
            {num1} × {num2}
          </Text>
          <Text style={[s.splitArrow, { color: theme.textLight }]}>  =  </Text>
          <Text style={[s.splitEq, { color: theme.primary }]}>
            {big} × {split5}
          </Text>
          {split2 > 0 && <>
            <Text style={[s.splitArrow, { color: theme.textLight }]}>  +  </Text>
            <Text style={[s.splitEq, { color: theme.secondary }]}>
              {big} × {split2}
            </Text>
          </>}
        </View>
      </FadeSlide>

      <View style={s.stepsCol}>
        <FadeSlide show={step >= 2}>
          <View style={s.stepRow}>
            <View style={[s.badge, { backgroundColor: theme.surface }]}>
              <Text style={[s.badgeText, { color: theme.text }]}>Part 1</Text>
            </View>
            <Text style={s.stepMath}>{big} × {split5} = {part1}</Text>
          </View>
        </FadeSlide>

        {split2 > 0 && (
          <FadeSlide show={step >= 3}>
            <View style={s.stepRow}>
              <View style={[s.badge, { backgroundColor: theme.surface }]}>
                <Text style={[s.badgeText, { color: theme.text }]}>Part 2</Text>
              </View>
              <Text style={s.stepMath}>{big} × {split2} = {part2}</Text>
            </View>
          </FadeSlide>
        )}

        <FadeSlide show={step >= (split2 > 0 ? 4 : 3)}>
          <View style={[s.finalRow, { borderColor: answer != null ? '#4CAF50' : theme.primary }]}>
            <Text style={[s.finalText, { color: theme.text }]}>
              {part1}{split2 > 0 ? ` + ${part2}` : ''} =
            </Text>
            <Text style={[s.finalQ, { color: answer != null ? '#4CAF50' : theme.primary }]}>
              {'  '}{answer != null ? answer : '?'}
            </Text>
          </View>
        </FadeSlide>
      </View>
    </View>
  )
}

// ─── HARD: column multiplication ─────────────────────────────────────────────

function ColumnMethod({ num1, num2, r, theme, answer }) {
  // num1 × num2 where num1 can be 2-digit, num2 is 1 or 2 digit
  // Use standard long multiplication
  const u2    = num2 % 10
  const t2    = Math.floor(num2 / 10)
  const hasT2 = t2 > 0

  const ansU = answer != null ? answer % 10 : null
  const ansT = answer != null ? Math.floor(answer / 10) % 10 : null
  const ansH = answer != null ? Math.floor(answer / 100) : null

  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    const fast = answer != null
    const t = [
      setTimeout(() => setStep(1), fast ?  80 : 350),
      setTimeout(() => setStep(2), fast ? 280 : 1200),
      hasT2 ? setTimeout(() => setStep(3), fast ? 480 : 2300) : null,
      setTimeout(() => setStep(hasT2 ? 4 : 3), fast ? (hasT2 ? 680 : 480) : (hasT2 ? 3300 : 2300)),
    ].filter(Boolean)
    return () => t.forEach(clearTimeout)
  }, [num1, num2, answer])

  const s = styles(r)
  const hl = (active) => active ? { backgroundColor: `${theme.primary}25`, borderRadius: r.sp(4) } : {}
  const hl2 = (active) => active ? { backgroundColor: `${theme.secondary}25`, borderRadius: r.sp(4) } : {}

  // Partial products
  const partial1 = num1 * u2           // num1 × units digit of num2
  const partial2 = hasT2 ? num1 * t2 : 0  // num1 × tens digit of num2

  return (
    <View style={s.container}>
      <Text style={s.heading}>Multiply column by column!</Text>

      <FadeSlide show={step >= 1}>
        <View style={s.board}>
          {/* num1 */}
          <View style={s.dRow}>
            <Text style={s.digit}>{Math.floor(num1/10) > 0 ? Math.floor(num1/10) : ' '}</Text>
            <Text style={s.digit}>{num1 % 10}</Text>
          </View>
          {/* × num2 */}
          <View style={s.dRow}>
            <Text style={[s.digit, hl(step >= 3)]}>{Math.floor(num2/10) > 0 ? Math.floor(num2/10) : ' '}</Text>
            <Text style={[s.digit, hl(step >= 2)]}>{num2 % 10}</Text>
          </View>
          {/* Divider */}
          <View style={s.divRow}>
            <Text style={[s.mulSym, { color: theme.primary }]}>×</Text>
            <View style={[s.line, { backgroundColor: theme.primary }]} />
          </View>
          {/* Partial product 1 */}
          <FadeSlide show={step >= 2}>
            <View style={s.dRow}>
              <Text style={s.partial}>{partial1}</Text>
            </View>
          </FadeSlide>
          {/* Partial product 2 (shifted) */}
          {hasT2 && (
            <FadeSlide show={step >= 3}>
              <View style={s.dRow}>
                <Text style={s.partial}>{partial2}0</Text>
              </View>
            </FadeSlide>
          )}
          {/* Second divider */}
          {hasT2 && step >= 3 && (
            <View style={[s.line, { backgroundColor: '#aaa', marginVertical: r.sp(4) }]} />
          )}
          {/* Answer row — shows actual digits after kid submits */}
          <FadeSlide show={step >= (hasT2 ? 4 : 3)}>
            <View style={s.dRow}>
              <Text style={[s.digit, s.ansDigit, { color: answer != null ? '#4CAF50' : theme.primary }]}>
                {answer != null ? (answer >= 100 ? ansH : ' ') : '?'}
              </Text>
              <Text style={[s.digit, s.ansDigit, { color: answer != null ? '#4CAF50' : theme.primary }]}>
                {answer != null ? (answer >= 10 ? ansT : ' ') : '?'}
              </Text>
              <Text style={[s.digit, s.ansDigit, { color: answer != null ? '#4CAF50' : theme.primary }]}>
                {answer != null ? ansU : '?'}
              </Text>
            </View>
          </FadeSlide>
        </View>
      </FadeSlide>

      <View style={s.callouts}>
        <FadeSlide show={step >= 2}>
          <View style={[s.callout, { borderColor: theme.primary }]}>
            <Text style={s.calloutT}>
              ① {num1} × {u2} (units) = {partial1}
            </Text>
          </View>
        </FadeSlide>
        {hasT2 && (
          <FadeSlide show={step >= 3}>
            <View style={[s.callout, { borderColor: theme.secondary }]}>
              <Text style={s.calloutT}>
                ② {num1} × {t2}0 (tens) = {partial2 * 10}
              </Text>
              <Text style={s.calloutS}>Write a 0 at the end (shifted)</Text>
            </View>
          </FadeSlide>
        )}
        {hasT2 && (
          <FadeSlide show={step >= 4}>
            <View style={[s.callout, { borderColor: '#999' }]}>
              <Text style={s.calloutT}>
                ③ Add: {partial1} + {partial2 * 10} = ?
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

  // Easy array
  arrayGrid:   { gap: r.sp(6), marginBottom: r.sp(12) },
  arrayRow:    { flexDirection: 'row', alignItems: 'center', gap: r.sp(8) },
  rowNum:      { fontSize: r.font(13), fontWeight: '700', width: r.sp(22) },
  rowItems:    { flexDirection: 'row', gap: r.sp(4), flexWrap: 'wrap' },
  labelBox:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: r.sp(12), padding: r.sp(10) },
  labelText:   { fontSize: r.font(14), fontWeight: '700', color: '#333' },
  qMark:       { fontSize: r.font(26), fontWeight: '900' },

  // Medium split
  splitHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: r.sp(12) },
  splitEq:     { fontSize: r.font(18), fontWeight: '800' },
  splitArrow:  { fontSize: r.font(16), fontWeight: '600' },
  stepsCol:    { gap: r.sp(8) },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: r.sp(10) },
  badge:       { borderRadius: r.sp(8), paddingHorizontal: r.sp(8), paddingVertical: r.sp(4), minWidth: r.sp(50) },
  badgeText:   { fontSize: r.font(11), fontWeight: '800', textAlign: 'center' },
  stepMath:    { fontSize: r.font(13), fontWeight: '600', color: '#444', flexShrink: 1 },
  finalRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: r.sp(10), padding: r.sp(10), marginTop: r.sp(4) },
  finalText:   { fontSize: r.font(16), fontWeight: '700', color: '#333' },
  finalQ:      { fontSize: r.font(24), fontWeight: '900' },

  // Hard column
  board:       { alignSelf: 'center', marginBottom: r.sp(12) },
  dRow:        { flexDirection: 'row', justifyContent: 'flex-end', gap: r.sp(2) },
  digit:       { width: r.sp(30), textAlign: 'center', fontSize: r.font(26), fontWeight: '800', color: '#333', paddingVertical: r.sp(2) },
  ansDigit:    { fontWeight: '900' },
  partial:     { fontSize: r.font(20), fontWeight: '700', color: '#555', textAlign: 'right', paddingRight: r.sp(4) },
  divRow:      { flexDirection: 'row', alignItems: 'center', marginVertical: r.sp(4) },
  mulSym:      { fontSize: r.font(16), fontWeight: '900', marginRight: r.sp(4) },
  line:        { flex: 1, height: 2.5, borderRadius: 2 },
  callouts:    { gap: r.sp(8) },
  callout:     { borderWidth: 1.5, borderRadius: r.sp(10), padding: r.sp(10) },
  calloutT:    { fontSize: r.font(13), fontWeight: '700', color: '#333' },
  calloutS:    { fontSize: r.font(11), color: '#888', fontWeight: '600', marginTop: r.sp(3) },
})

// ─── Main export ──────────────────────────────────────────────────────────────

export default function MultiplicationVisual({ num1, num2, difficulty, theme, answer }) {
  const r   = useResponsive()
  const key = `${num1}x${num2}-${difficulty}`

  if (difficulty === 'easy')   return <ArrayModel  key={key} num1={num1} num2={num2} theme={theme} r={r} answer={answer} />
  if (difficulty === 'medium') return <SplitFive   key={key} num1={num1} num2={num2} theme={theme} r={r} answer={answer} />
  return                              <ColumnMethod key={key} num1={num1} num2={num2} theme={theme} r={r} answer={answer} />
}
