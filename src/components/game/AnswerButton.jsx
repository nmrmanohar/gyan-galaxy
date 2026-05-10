import { useEffect, useRef } from 'react'
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

// state: 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim'
export default function AnswerButton({ label, state, onPress, disabled }) {
  const r           = useResponsive()
  const shakeAnim   = useRef(new Animated.Value(0)).current
  const scaleAnim   = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Always stop any running animations on this node first
    shakeAnim.stopAnimation()
    scaleAnim.stopAnimation()
    opacityAnim.stopAnimation()

    if (state === 'idle') {
      // Hard-reset — no animation, just snap back instantly
      shakeAnim.setValue(0)
      scaleAnim.setValue(1)
      opacityAnim.setValue(1)
      return
    }

    if (state === 'correct') {
      // Pop bounce on scale — native driver only
      Animated.sequence([
        Animated.spring(scaleAnim,  { toValue: 1.15, useNativeDriver: true, speed: 40, bounciness: 6 }),
        Animated.spring(scaleAnim,  { toValue: 1.0,  useNativeDriver: true, speed: 20 }),
      ]).start()
      // Keep opacity fully visible
      opacityAnim.setValue(1)
    }

    if (state === 'wrong') {
      // Horizontal shake — native driver only
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  8,  duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  4,  duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0,  duration: 40, useNativeDriver: true }),
      ]).start()
      opacityAnim.setValue(1)
    }

    if (state === 'reveal') {
      // The correct answer after a wrong pick — gently fade in to full
      opacityAnim.setValue(1)
      scaleAnim.setValue(1)
    }

    if (state === 'dim') {
      // Buttons that aren't involved — fade out slightly
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [state])

  const s = styles(r, state)

  return (
    <Animated.View style={{
      transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
      opacity: opacityAnim,
      flex: 1,
    }}>
      <TouchableOpacity
        style={s.btn}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={s.label}>{label}</Text>
        {state === 'correct' && <Text style={s.badge}>✓</Text>}
        {state === 'wrong'   && <Text style={s.badge}>✗</Text>}
      </TouchableOpacity>
    </Animated.View>
  )
}

const BG = {
  idle:    '#fff',
  correct: '#4CAF50',
  wrong:   '#EF5350',
  reveal:  '#66BB6A',
  dim:     '#fff',
}
const TEXT_COLOR = {
  idle:    '#333',
  correct: '#fff',
  wrong:   '#fff',
  reveal:  '#fff',
  dim:     '#ccc',
}

const styles = (r, state) => StyleSheet.create({
  btn: {
    backgroundColor: BG[state] ?? '#fff',
    borderRadius: r.sp(16),
    paddingVertical: r.sp(18),
    paddingHorizontal: r.sp(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: state === 'correct' || state === 'reveal' ? 6 : 2,
    borderWidth: 2,
    borderColor: state === 'idle' || state === 'dim' ? '#E8E8E8' : 'transparent',
    minHeight: r.sp(72),
  },
  label: {
    fontSize: r.font(28),
    fontWeight: '800',
    color: TEXT_COLOR[state] ?? '#333',
  },
  badge: {
    position: 'absolute',
    top: r.sp(6),
    right: r.sp(10),
    fontSize: r.font(14),
    color: '#fff',
    fontWeight: '900',
  },
})
