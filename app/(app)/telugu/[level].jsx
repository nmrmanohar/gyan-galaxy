import { useLocalSearchParams } from 'expo-router'
import ScriptGameScreen from '../../../src/components/game/ScriptGameScreen'
import { generateTeluguSession, calcTeluguStars, TELUGU_LEVEL_CONTEXT } from '../../../src/utils/teluguProblems'

export default function TeluguGame() {
  const { level } = useLocalSearchParams()
  return (
    <ScriptGameScreen
      subject="telugu"
      levelId={parseInt(level, 10)}
      generateSession={generateTeluguSession}
      calcStars={calcTeluguStars}
      levelContext={TELUGU_LEVEL_CONTEXT}
      activeUpToLevel={2}
    />
  )
}
