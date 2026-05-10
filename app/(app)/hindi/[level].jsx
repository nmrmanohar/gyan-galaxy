import { useLocalSearchParams } from 'expo-router'
import ScriptGameScreen from '../../../src/components/game/ScriptGameScreen'
import { generateHindiSession, calcHindiStars, HINDI_LEVEL_CONTEXT } from '../../../src/utils/hindiProblems'

export default function HindiGame() {
  const { level } = useLocalSearchParams()
  return (
    <ScriptGameScreen
      subject="hindi"
      levelId={parseInt(level, 10)}
      generateSession={generateHindiSession}
      calcStars={calcHindiStars}
      levelContext={HINDI_LEVEL_CONTEXT}
      activeUpToLevel={2}
    />
  )
}
