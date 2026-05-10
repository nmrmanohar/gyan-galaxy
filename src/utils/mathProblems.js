// ─── Helpers ─────────────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Difficulty ranges ────────────────────────────────────────────────────────

const RANGES = {
  addition: {
    easy:   { min: 1,  max: 10 },
    medium: { min: 5,  max: 20 },
    hard:   { min: 10, max: 50 },
  },
  subtraction: {
    easy:   { min: 1,  max: 10 },
    medium: { min: 5,  max: 20 },
    hard:   { min: 10, max: 50 },
  },
  multiplication: {
    easy:   { min: 1, max: 5  },
    medium: { min: 1, max: 10 },
    hard:   { min: 2, max: 12 },
  },
  division: {
    easy:   { divisors: [2, 3, 4, 5],     maxQuotient: 5  },
    medium: { divisors: [2, 3, 4, 5, 6],  maxQuotient: 10 },
    hard:   { divisors: [2,3,4,5,6,7,8],  maxQuotient: 12 },
  },
}

// ─── Problem generators ───────────────────────────────────────────────────────

function makeAddition(difficulty) {
  const { min, max } = RANGES.addition[difficulty]
  const num1 = randInt(min, max)
  const num2 = randInt(min, max)
  return { num1, num2, answer: num1 + num2, symbol: '+', question: `${num1} + ${num2}` }
}

function makeSubtraction(difficulty) {
  const { min, max } = RANGES.subtraction[difficulty]
  let num1 = randInt(min, max)
  let num2 = randInt(min, max)
  if (num2 > num1) [num1, num2] = [num2, num1]  // ensure non-negative
  return { num1, num2, answer: num1 - num2, symbol: '−', question: `${num1} − ${num2}` }
}

function makeMultiplication(difficulty) {
  const { min, max } = RANGES.multiplication[difficulty]
  const num1 = randInt(min, max)
  const num2 = randInt(min, max)
  return { num1, num2, answer: num1 * num2, symbol: '×', question: `${num1} × ${num2}` }
}

function makeDivision(difficulty) {
  const { divisors, maxQuotient } = RANGES.division[difficulty]
  const divisor  = divisors[Math.floor(Math.random() * divisors.length)]
  const quotient = randInt(1, maxQuotient)
  const dividend = divisor * quotient
  return { num1: dividend, num2: divisor, answer: quotient, symbol: '÷', question: `${dividend} ÷ ${divisor}` }
}

// ─── Distractor choices ───────────────────────────────────────────────────────

function makeChoices(answer, operation) {
  const choices = new Set([answer])

  // Generate 3 distractors close to the correct answer
  const spread = operation === 'multiplication' || operation === 'division' ? 5 : 4
  let attempts = 0
  while (choices.size < 4 && attempts < 40) {
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? 1 : -1)
    const distractor = answer + delta
    if (distractor > 0 && distractor !== answer) choices.add(distractor)
    attempts++
  }
  // fallback: just add sequential numbers if we couldn't fill
  let fill = answer + 1
  while (choices.size < 4) { choices.add(fill); fill++ }

  return shuffle([...choices])
}

// ─── Single problem factory ───────────────────────────────────────────────────

const GENERATORS = {
  1: makeAddition,
  2: makeSubtraction,
  3: makeMultiplication,
  4: makeDivision,
}

const OPERATION_NAMES = {
  1: 'addition',
  2: 'subtraction',
  3: 'multiplication',
  4: 'division',
}

function difficultyForIndex(index) {
  if (index < 3) return 'easy'
  if (index < 7) return 'medium'
  return 'hard'
}

// ─── Session generator: 10 questions, ramping difficulty ─────────────────────

export function generateSession(levelId) {
  const gen      = GENERATORS[levelId]
  const opName   = OPERATION_NAMES[levelId]
  if (!gen) throw new Error(`Unknown level: ${levelId}`)

  return Array.from({ length: 10 }, (_, i) => {
    const difficulty = difficultyForIndex(i)
    const problem    = gen(difficulty)
    return {
      ...problem,
      difficulty,
      choices: makeChoices(problem.answer, opName),
    }
  })
}

// ─── Stars calculation ────────────────────────────────────────────────────────

export function calcStars(score, total = 10) {
  const pct = score / total
  if (pct >= 0.9) return 3
  if (pct >= 0.6) return 2
  if (pct >= 0.3) return 1
  return 0
}

// ─── Theme context strings ────────────────────────────────────────────────────

export const LEVEL_CONTEXT = {
  girl: {
    1: { title: 'Fairy Bakery',      prompt: 'Fill the order correctly!',       icon: '🧁' },
    2: { title: 'Mermaid Market',    prompt: 'How many gems are left?',          icon: '💎' },
    3: { title: 'Princess Treasury', prompt: 'Count the gem groups!',            icon: '👑' },
    4: { title: 'Unicorn Ranch',     prompt: 'Share carrots equally!',           icon: '🦄' },
  },
  boy: {
    1: { title: 'Train Station',     prompt: 'Load the wagon correctly!',        icon: '🚂' },
    2: { title: 'Truck Delivery',    prompt: 'How many boxes remain?',           icon: '🚚' },
    3: { title: 'Tower Crane',       prompt: 'Stack the containers!',            icon: '🏗️' },
    4: { title: 'Cargo Split',       prompt: 'Divide the cargo equally!',        icon: '⚙️' },
  },
}
