import { useWindowDimensions } from 'react-native'

export function useResponsive() {
  const { width, height } = useWindowDimensions()

  const shorter = Math.min(width, height)
  const longer  = Math.max(width, height)

  // Fluid unit helpers — like vw/vh in CSS
  const vw = (pct) => width * (pct / 100)
  const vh = (pct) => height * (pct / 100)
  // vs = % of shorter side — safe in both portrait and landscape
  const vs = (pct) => shorter * (pct / 100)

  // Fluid font: scales continuously with screen size, clamped to readable range
  const font = (size) => {
    const scaled = Math.round(shorter * (size / 400))
    return Math.max(10, Math.min(scaled, size * 2.5))
  }

  // Game canvas — 16:9 box that fills the shorter axis
  const gameWidth  = shorter * 0.95
  const gameHeight = shorter * 0.95 * (9 / 16)

  // Spacing helper — consistent padding/margin scaling
  const sp = (size) => Math.round(shorter * (size / 400))

  // Icon sizes
  const icon = (size) => Math.round(shorter * (size / 400))

  return {
    width,
    height,
    shorter,
    longer,
    vw,
    vh,
    vs,
    font,
    sp,
    icon,
    gameWidth,
    gameHeight,
    isLandscape: width > height,
  }
}
