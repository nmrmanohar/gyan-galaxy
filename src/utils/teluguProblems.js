// ── Telugu vowels (Achulu) ────────────────────────────────────────────────────
export const ACHULU = [
  { char: 'అ',  translit: 'a',   example: 'అమ్మ',      meaning: 'Mother'    },
  { char: 'ఆ',  translit: 'aa',  example: 'ఆవు',       meaning: 'Cow'       },
  { char: 'ఇ',  translit: 'i',   example: 'ఇల్లు',     meaning: 'House'     },
  { char: 'ఈ',  translit: 'ii',  example: 'ఈగ',        meaning: 'Fly'       },
  { char: 'ఉ',  translit: 'u',   example: 'ఉప్పు',     meaning: 'Salt'      },
  { char: 'ఊ',  translit: 'uu',  example: 'ఊరు',       meaning: 'Village'   },
  { char: 'ఋ',  translit: 'ru',  example: 'ఋషి',       meaning: 'Sage'      },
  { char: 'ఎ',  translit: 'e',   example: 'ఎలుక',      meaning: 'Mouse'     },
  { char: 'ఏ',  translit: 'ee',  example: 'ఏనుగు',     meaning: 'Elephant'  },
  { char: 'ఐ',  translit: 'ai',  example: 'ఐదు',       meaning: 'Five'      },
  { char: 'ఒ',  translit: 'o',   example: 'ఒంటె',      meaning: 'Camel'     },
  { char: 'ఓ',  translit: 'oo',  example: 'ఓడ',        meaning: 'Ship'      },
  { char: 'ఔ',  translit: 'au',  example: 'ఔషధం',     meaning: 'Medicine'  },
  { char: 'అం', translit: 'am',  example: 'అంగడి',     meaning: 'Shop'      },
  { char: 'అః', translit: 'aha', example: 'అఃహంకారం',  meaning: 'Ego'       },
]

// ── Telugu consonants (Hallulu) ───────────────────────────────────────────────
export const HALLULU = [
  { char: 'క',  translit: 'ka',   example: 'కాకి',      meaning: 'Crow'       },
  { char: 'ఖ',  translit: 'kha',  example: 'ఖర్జూర',    meaning: 'Date fruit' },
  { char: 'గ',  translit: 'ga',   example: 'గడ్డి',     meaning: 'Grass'      },
  { char: 'ఘ',  translit: 'gha',  example: 'ఘంట',      meaning: 'Bell'       },
  { char: 'చ',  translit: 'cha',  example: 'చెట్టు',    meaning: 'Tree'       },
  { char: 'ఛ',  translit: 'chha', example: 'ఛత్ర',      meaning: 'Umbrella'   },
  { char: 'జ',  translit: 'ja',   example: 'జలం',       meaning: 'Water'      },
  { char: 'ఝ',  translit: 'jha',  example: 'ఝరి',       meaning: 'Waterfall'  },
  { char: 'ట',  translit: 'ta',   example: 'టమాటా',     meaning: 'Tomato'     },
  { char: 'ఠ',  translit: 'tha',  example: 'ఠీవి',      meaning: 'Dignity'    },
  { char: 'డ',  translit: 'da',   example: 'డబ్బు',     meaning: 'Money'      },
  { char: 'ఢ',  translit: 'dha',  example: 'ఢంకా',      meaning: 'Drum'       },
  { char: 'త',  translit: 'ta',   example: 'తల',        meaning: 'Head'       },
  { char: 'థ',  translit: 'tha',  example: 'థాలీ',      meaning: 'Platter'    },
  { char: 'ద',  translit: 'da',   example: 'దారి',      meaning: 'Road'       },
  { char: 'ధ',  translit: 'dha',  example: 'ధనం',      meaning: 'Wealth'     },
  { char: 'న',  translit: 'na',   example: 'నీరు',      meaning: 'Water'      },
  { char: 'ప',  translit: 'pa',   example: 'పండు',      meaning: 'Fruit'      },
  { char: 'ఫ',  translit: 'pha',  example: 'ఫలం',       meaning: 'Result'     },
  { char: 'బ',  translit: 'ba',   example: 'బల్ల',      meaning: 'Table'      },
  { char: 'భ',  translit: 'bha',  example: 'భూమి',      meaning: 'Earth'      },
  { char: 'మ',  translit: 'ma',   example: 'మావిడి',    meaning: 'Mango tree' },
  { char: 'య',  translit: 'ya',   example: 'యానం',      meaning: 'Journey'    },
  { char: 'ర',  translit: 'ra',   example: 'రైలు',      meaning: 'Train'      },
  { char: 'ల',  translit: 'la',   example: 'లడ్డు',     meaning: 'Laddu'      },
  { char: 'వ',  translit: 'va',   example: 'వంట',       meaning: 'Cooking'    },
  { char: 'శ',  translit: 'sha',  example: 'శక్తి',     meaning: 'Power'      },
  { char: 'ష',  translit: 'sha',  example: 'షాపు',      meaning: 'Shop'       },
  { char: 'స',  translit: 'sa',   example: 'సూర్యుడు',  meaning: 'Sun'        },
  { char: 'హ',  translit: 'ha',   example: 'హంస',       meaning: 'Swan'       },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOthers(correct, pool, count) {
  return shuffle(pool.filter(d => d.char !== correct.char)).slice(0, count)
}

// Easy: show char → pick transliteration from 4
function makeEasy(item, pool) {
  const others = pickOthers(item, pool, 3)
  const answer = item.translit
  return {
    type: 'easy', difficulty: 'easy',
    ...item,
    prompt: 'What sound does this make?',
    answer,
    choices: shuffle([answer, ...others.map(d => d.translit)]),
  }
}

// Medium: show transliteration → pick character from 4
function makeMedium(item, pool) {
  const others = pickOthers(item, pool, 3)
  const answer = item.char
  return {
    type: 'medium', difficulty: 'medium',
    ...item,
    prompt: `Which letter says  "${item.translit}" ?`,
    answer,
    choices: shuffle([answer, ...others.map(d => d.char)]),
  }
}

// Hard: show char → pick example word from 4
function makeHard(item, pool) {
  const others = pickOthers(item, pool, 3)
  const answer = item.example
  return {
    type: 'hard', difficulty: 'hard',
    ...item,
    prompt: 'Pick the word that uses this letter',
    answer,
    choices: shuffle([answer, ...others.map(d => d.example)]),
  }
}

function makeSession(pool) {
  const selected = shuffle(pool).slice(0, 10)
  return selected.map((item, i) => {
    if (i < 3) return makeEasy(item, pool)
    if (i < 7) return makeMedium(item, pool)
    return makeHard(item, pool)
  })
}

export function generateTeluguSession(levelId) {
  if (levelId === 1) return makeSession(ACHULU)
  if (levelId === 2) return makeSession(HALLULU)
  return []
}

export function calcTeluguStars(score, total) {
  const p = score / total
  return p >= 0.9 ? 3 : p >= 0.6 ? 2 : p >= 0.3 ? 1 : 0
}

export const TELUGU_LEVEL_CONTEXT = {
  boy: {
    1: { title: 'అచ్చులు',   titleEn: 'Vowels',      icon: '🅰️', world: 'Vowel Signal Boards'   },
    2: { title: 'హల్లులు',   titleEn: 'Consonants',  icon: '🔡', world: 'Hallu Station Names'   },
    3: { title: 'గుణింతాలు', titleEn: 'Gunintalu',   icon: '✨', world: 'Road Sign Gunintalu'   },
    4: { title: 'ఒత్తులు',   titleEn: 'Othulu',      icon: '🔗', world: 'Train Bogey Conjuncts' },
    5: { title: 'పదాలు',     titleEn: 'Words',       icon: '📝', world: 'Truck Cargo Words'     },
    6: { title: 'వాక్యాలు',  titleEn: 'Sentences',   icon: '📖', world: 'Read the Logbook'      },
  },
  girl: {
    1: { title: 'అచ్చులు',   titleEn: 'Vowels',      icon: '🅰️', world: 'Magic Vowel Spells'    },
    2: { title: 'హల్లులు',   titleEn: 'Consonants',  icon: '🔡', world: 'Hallu Flower Pots'     },
    3: { title: 'గుణింతాలు', titleEn: 'Gunintalu',   icon: '✨', world: 'Gunintalu Garden'      },
    4: { title: 'ఒత్తులు',   titleEn: 'Othulu',      icon: '🔗', world: 'Puzzle Piece Othulu'   },
    5: { title: 'పదాలు',     titleEn: 'Words',       icon: '📝', world: 'Word Waterfall Catch'  },
    6: { title: 'వాక్యాలు',  titleEn: 'Sentences',   icon: '📖', world: 'Story Book Sentences'  },
  },
}
