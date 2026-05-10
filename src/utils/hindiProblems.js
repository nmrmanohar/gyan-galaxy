// ── Hindi vowels (Swaras) ─────────────────────────────────────────────────────
export const SWARAS = [
  { char: 'अ',  translit: 'a',   example: 'अनार',    meaning: 'Pomegranate' },
  { char: 'आ',  translit: 'aa',  example: 'आम',      meaning: 'Mango'       },
  { char: 'इ',  translit: 'i',   example: 'इमली',    meaning: 'Tamarind'    },
  { char: 'ई',  translit: 'ii',  example: 'ईख',      meaning: 'Sugarcane'   },
  { char: 'उ',  translit: 'u',   example: 'उल्लू',   meaning: 'Owl'         },
  { char: 'ऊ',  translit: 'uu',  example: 'ऊन',      meaning: 'Wool'        },
  { char: 'ऋ',  translit: 'ri',  example: 'ऋषि',     meaning: 'Sage'        },
  { char: 'ए',  translit: 'e',   example: 'एड़ी',    meaning: 'Heel'        },
  { char: 'ऐ',  translit: 'ai',  example: 'ऐनक',     meaning: 'Spectacles'  },
  { char: 'ओ',  translit: 'o',   example: 'ओस',      meaning: 'Dew'         },
  { char: 'औ',  translit: 'au',  example: 'औजार',    meaning: 'Tool'        },
  { char: 'अं', translit: 'am',  example: 'अंगूर',   meaning: 'Grapes'      },
  { char: 'अः', translit: 'aha', example: 'अःहंकार', meaning: 'Ego'         },
]

// ── Hindi consonants (Vyanjanas) ──────────────────────────────────────────────
export const VYANJANAS = [
  { char: 'क',  translit: 'ka',   example: 'कमल',      meaning: 'Lotus'      },
  { char: 'ख',  translit: 'kha',  example: 'खरगोश',    meaning: 'Rabbit'     },
  { char: 'ग',  translit: 'ga',   example: 'गाय',      meaning: 'Cow'        },
  { char: 'घ',  translit: 'gha',  example: 'घर',       meaning: 'House'      },
  { char: 'च',  translit: 'cha',  example: 'चाय',      meaning: 'Tea'        },
  { char: 'छ',  translit: 'chha', example: 'छाता',     meaning: 'Umbrella'   },
  { char: 'ज',  translit: 'ja',   example: 'जल',       meaning: 'Water'      },
  { char: 'झ',  translit: 'jha',  example: 'झूला',     meaning: 'Swing'      },
  { char: 'ट',  translit: 'ta',   example: 'टमाटर',    meaning: 'Tomato'     },
  { char: 'ठ',  translit: 'tha',  example: 'ठंड',      meaning: 'Cold'       },
  { char: 'ड',  translit: 'da',   example: 'डमरू',     meaning: 'Damaru drum'},
  { char: 'ढ',  translit: 'dha',  example: 'ढोल',      meaning: 'Dhol drum'  },
  { char: 'त',  translit: 'ta',   example: 'तरबूज',    meaning: 'Watermelon' },
  { char: 'थ',  translit: 'tha',  example: 'थाली',     meaning: 'Plate'      },
  { char: 'द',  translit: 'da',   example: 'दादा',     meaning: 'Grandfather'},
  { char: 'ध',  translit: 'dha',  example: 'धरती',     meaning: 'Earth'      },
  { char: 'न',  translit: 'na',   example: 'नल',       meaning: 'Tap/Pipe'   },
  { char: 'प',  translit: 'pa',   example: 'पानी',     meaning: 'Water'      },
  { char: 'फ',  translit: 'pha',  example: 'फूल',      meaning: 'Flower'     },
  { char: 'ब',  translit: 'ba',   example: 'बकरी',     meaning: 'Goat'       },
  { char: 'भ',  translit: 'bha',  example: 'भालू',     meaning: 'Bear'       },
  { char: 'म',  translit: 'ma',   example: 'मछली',     meaning: 'Fish'       },
  { char: 'य',  translit: 'ya',   example: 'यात्रा',   meaning: 'Journey'    },
  { char: 'र',  translit: 'ra',   example: 'राजा',     meaning: 'King'       },
  { char: 'ल',  translit: 'la',   example: 'लड्डू',    meaning: 'Laddu'      },
  { char: 'व',  translit: 'va',   example: 'वायु',     meaning: 'Air/Wind'   },
  { char: 'श',  translit: 'sha',  example: 'शेर',      meaning: 'Lion'       },
  { char: 'स',  translit: 'sa',   example: 'सूरज',     meaning: 'Sun'        },
  { char: 'ह',  translit: 'ha',   example: 'हाथी',     meaning: 'Elephant'   },
  { char: 'क्ष', translit: 'ksha', example: 'क्षमा',   meaning: 'Forgiveness'},
  { char: 'त्र', translit: 'tra',  example: 'त्रिशूल',  meaning: 'Trident'    },
  { char: 'ज्ञ', translit: 'gya',  example: 'ज्ञान',    meaning: 'Knowledge'  },
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

export function generateHindiSession(levelId) {
  if (levelId === 1) return makeSession(SWARAS)
  if (levelId === 2) return makeSession(VYANJANAS)
  return []
}

export function calcHindiStars(score, total) {
  const p = score / total
  return p >= 0.9 ? 3 : p >= 0.6 ? 2 : p >= 0.3 ? 1 : 0
}

export const HINDI_LEVEL_CONTEXT = {
  boy: {
    1: { title: 'स्वर',    titleEn: 'Vowels',      icon: '🅰️', world: 'Vowel Highway Signs'    },
    2: { title: 'व्यंजन',  titleEn: 'Consonants',  icon: '🔡', world: 'Vyanjana Station Boards' },
    3: { title: 'मात्राएँ', titleEn: 'Matras',      icon: '✨', world: 'Matra Road Signs'        },
    4: { title: 'शब्द',    titleEn: 'Words',       icon: '📝', world: 'Truck Delivery Words'    },
    5: { title: 'वाक्य',   titleEn: 'Sentences',   icon: '📖', world: 'Read the Bus Route'      },
  },
  girl: {
    1: { title: 'स्वर',    titleEn: 'Vowels',      icon: '🅰️', world: 'Rainbow Vowel Magic'     },
    2: { title: 'व्यंजन',  titleEn: 'Consonants',  icon: '🔡', world: 'Vyanjana Garden Labels'  },
    3: { title: 'मात्राएँ', titleEn: 'Matras',      icon: '✨', world: 'Matra Flower Charm'      },
    4: { title: 'शब्द',    titleEn: 'Words',       icon: '📝', world: 'Word Bloom Garden'       },
    5: { title: 'वाक्य',   titleEn: 'Sentences',   icon: '📖', world: 'Story Sentence Train'    },
  },
}
