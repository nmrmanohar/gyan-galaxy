import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'

export default function GameProgressBar({ current, total, score, theme }) {
  const r           = useResponsive()
  const widthAnim   = useRef(new Animated.Value(0)).current
  const pct         = current / total

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 400,
      useNativeDriver: false,
    }).start()
  }, [pct])

  const s = styles(r, theme)

  return (
    <View style={s.wrapper}>
      {/* Progress track */}
      <View style={s.track}>
        <Animated.View style={[s.fill, {
          width: widthAnim.interpolate({
            inputRange:  [0, 1],
            outputRange: ['0%', '100%'],
          }),
          backgroundColor: theme.primary,
        }]} />
      </View>

      {/* Labels */}
      <View style={s.labels}>
        <Text style={s.labelText}>Q {current}/{total}</Text>
        <Text style={s.scoreText}>⭐ {score}</Text>
      </View>
    </View>
  )
}

const styles = (r, theme) => StyleSheet.create({
  wrapper: { paddingHorizontal: r.sp(20), paddingTop: r.sp(10), paddingBottom: r.sp(6) },

  track: {
    height: r.sp(10),
    backgroundColor: '#E0E0E0',
    borderRadius: r.sp(10),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: r.sp(10),
  },

  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: r.sp(6),
  },
  labelText: { fontSize: r.font(13), color: '#888', fontWeight: '600' },
  scoreText: { fontSize: r.font(13), color: theme.primary, fontWeight: '700' },
})
