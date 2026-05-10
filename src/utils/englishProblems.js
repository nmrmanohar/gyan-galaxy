export const ALPHABET_DATA = [
  { letter: 'A', word: 'Apple',     emoji: '🍎', phonetic: 'AYY'   },
  { letter: 'B', word: 'Ball',      emoji: '⚽', phonetic: 'BEE'   },
  { letter: 'C', word: 'Car',       emoji: '🚗', phonetic: 'SEE'   },
  { letter: 'D', word: 'Dog',       emoji: '🐶', phonetic: 'DEE'   },
  { letter: 'E', word: 'Elephant',  emoji: '🐘', phonetic: 'EEE'   },
  { letter: 'F', word: 'Fish',      emoji: '🐠', phonetic: 'EFF'   },
  { letter: 'G', word: 'Grapes',    emoji: '🍇', phonetic: 'JEE'   },
  { letter: 'H', word: 'Hat',       emoji: '🎩', phonetic: 'AYCH'  },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦', phonetic: 'EYE'   },
  { letter: 'J', word: 'Juice',     emoji: '🧃', phonetic: 'JAY'   },
  { letter: 'K', word: 'Kite',      emoji: '🪁', phonetic: 'KAY'   },
  { letter: 'L', word: 'Lion',      emoji: '🦁', phonetic: 'ELL'   },
  { letter: 'M', word: 'Mango',     emoji: '🥭', phonetic: 'EMM'   },
  { letter: 'N', word: 'Nest',      emoji: '🐦', phonetic: 'ENN'   },
  { letter: 'O', word: 'Orange',    emoji: '🍊', phonetic: 'OH'    },
  { letter: 'P', word: 'Parrot',    emoji: '🦜', phonetic: 'PEE'   },
  { letter: 'Q', word: 'Queen',     emoji: '👸', phonetic: 'CUE'   },
  { letter: 'R', word: 'Rainbow',   emoji: '🌈', phonetic: 'ARE'   },
  { letter: 'S', word: 'Sun',       emoji: '☀️', phonetic: 'ESS'   },
  { letter: 'T', word: 'Train',     emoji: '🚂', phonetic: 'TEE'   },
  { letter: 'U', word: 'Umbrella',  emoji: '☂️', phonetic: 'YOU'   },
  { letter: 'V', word: 'Van',       emoji: '🚐', phonetic: 'VEE'   },
  { letter: 'W', word: 'Whale',     emoji: '🐋', phonetic: 'DUB-U' },
  { letter: 'X', word: 'Xmas Tree', emoji: '🎄', phonetic: 'EX'    },
  { letter: 'Y', word: 'Yacht',     emoji: '⛵', phonetic: 'WHY'   },
  { letter: 'Z', word: 'Zebra',     emoji: '🦓', phonetic: 'ZEE'   },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOthers(correctLetter, count) {
  return shuffle(ALPHABET_DATA.filter(d => d.letter !== correctLetter)).slice(0, count)
}

// Easy: show letter → pick the matching emoji+word
function makeEasyQuestion(data) {
  const others = pickOthers(data.letter, 3)
  const answer = `${data.emoji}\n${data.word}`
  const choices = shuffle([answer, ...others.map(d => `${d.emoji}\n${d.word}`)])
  return {
    type: 'easy',
    difficulty: 'easy',
    letter: data.letter,
    word: data.word,
    emoji: data.emoji,
    phonetic: data.phonetic,
    prompt: `${data.letter} is for...?`,
    answer,
    choices,
  }
}

// Medium: show emoji + blanked word → pick the starting letter
function makeMediumQuestion(data) {
  const others   = pickOthers(data.letter, 3)
  const blanked  = `${data.emoji}  _${data.word.slice(1)}`
  const answer   = data.letter
  const choices  = shuffle([answer, ...others.map(d => d.letter)])
  return {
    type: 'medium',
    difficulty: 'medium',
    letter: data.letter,
    word: data.word,
    emoji: data.emoji,
    phonetic: data.phonetic,
    prompt: 'What letter is missing?',
    questionDisplay: blanked,
    answer,
    choices,
  }
}

// Hard: show letter only (no picture) → pick the word that starts with it
function makeHardQuestion(data) {
  const others = pickOthers(data.letter, 3)
  const answer = data.word
  const choices = shuffle([answer, ...others.map(d => d.word)])
  return {
    type: 'hard',
    difficulty: 'hard',
    letter: data.letter,
    word: data.word,
    emoji: data.emoji,
    phonetic: data.phonetic,
    prompt: `Which word starts with ${data.letter}?`,
    answer,
    choices,
  }
}

export function generateAlphabetSession() {
  const selected = shuffle(ALPHABET_DATA).slice(0, 10)
  return selected.map((data, i) => {
    if (i < 3) return makeEasyQuestion(data)
    if (i < 7) return makeMediumQuestion(data)
    return makeHardQuestion(data)
  })
}

export function generateEnglishSession(levelId) {
  if (levelId === 1) return generateAlphabetSession()
  return []
}

export function calcEnglishStars(score, total) {
  const pct = score / total
  if (pct >= 0.9) return 3
  if (pct >= 0.6) return 2
  if (pct >= 0.3) return 1
  return 0
}

export const ENGLISH_LEVEL_CONTEXT = {
  boy: {
    1: { title: 'Alphabets',     prompt: 'Pick the right answer!', icon: '🔤', world: 'Driver License — Read the signs!' },
    2: { title: 'Words',         prompt: 'Spell the word!',        icon: '📝', world: 'Station Name Boards'              },
    3: { title: 'Pronunciation', prompt: 'Say it out loud!',       icon: '🔊', world: "Driver's Announcements"           },
    4: { title: 'Sentences',     prompt: 'Build the sentence!',    icon: '📖', world: 'Read the Road Signs'              },
  },
  girl: {
    1: { title: 'Alphabets',     prompt: 'Pick the right answer!', icon: '🦋', world: 'Garden Library — Learn letters!'  },
    2: { title: 'Words',         prompt: 'Spell the word!',        icon: '🌸', world: 'Garden Word Bloom'                },
    3: { title: 'Pronunciation', prompt: 'Say it out loud!',       icon: '🎀', world: 'Fairy Tale Narration'             },
    4: { title: 'Sentences',     prompt: 'Build the sentence!',    icon: '📖', world: 'Rainbow Sentence Builder'         },
  },
}
