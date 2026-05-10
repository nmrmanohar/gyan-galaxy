import { useEffect, useRef } from 'react'
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

// state: 'idle' | 'correct' | 'wrong' | 'reveal'
export default function AnswerButton({ label, state, onPress, disabled }) {
  const r          = useResponsive()
  const shakeAnim  = useRef(new Animated.Value(0)).current
  const scaleAnim  = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (state === 'correct') {
      // Pop bounce
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.18, useNativeDriver: true, speed: 40 }),
        Animated.spring(scaleAnim, { toValue: 1.0,  useNativeDriver: true, speed: 20 }),
      ]).start()
    }

    if (state === 'wrong') {
      // Horizontal shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  10, duration: 50,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  8,  duration: 50,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8,  duration: 50,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  4,  duration: 50,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0,  duration: 50,  useNativeDriver: true }),
      ]).start()
    }

    // Dim buttons that are neither correct nor the wrong pick when answered
    if (state === 'dim') {
      Animated.timing(opacityAnim, { toValue: 0.35, duration: 200, useNativeDriver: true }).start()
    } else {
      Animated.timing(opacityAnim, { toValue: 1.0,  duration: 100, useNativeDriver: true }).start()
    }
  }, [state])

  // Reset animations when state goes back to idle (new question)
  useEffect(() => {
    if (state === 'idle') {
      scaleAnim.setValue(1)
      shakeAnim.setValue(0)
      opacityAnim.setValue(1)
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
  reveal:  '#81C784',  // correct answer revealed after wrong pick
  dim:     '#fff',
}

const TEXT = {
  idle:    '#333',
  correct: '#fff',
  wrong:   '#fff',
  reveal:  '#fff',
  dim:     '#bbb',
}

const styles = (r, state) => StyleSheet.create({
  btn: {
    backgroundColor: BG[state] ?? '#fff',
    borderRadius: r.sp(16),
    paddingVertical: r.sp(18),
    paddingHorizontal: r.sp(10),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: state === 'correct' ? 6 : 3,
    borderWidth: 2,
    borderColor: state === 'idle' || state === 'dim' ? '#E0E0E0' : 'transparent',
    minHeight: r.sp(70),
  },
  label: {
    fontSize: r.font(26),
    fontWeight: '800',
    color: TEXT[state] ?? '#333',
  },
  badge: {
    position: 'absolute',
    top: r.sp(6),
    right: r.sp(10),
    fontSize: r.font(14),
    color: '#fff',
    fontWeight: '800',
  },
})
