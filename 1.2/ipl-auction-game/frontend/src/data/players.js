const COUNTRIES = [
  'India',
  'Australia',
  'England',
  'Pakistan',
  'South Africa',
  'New Zealand',
  'Sri Lanka',
  'Bangladesh',
  'Afghanistan',
  'West Indies',
  'Ireland',
  'Scotland',
  'Netherlands',
  'Nepal',
  'UAE',
  'USA',
  'Zimbabwe',
]

const REAL_IPL_PLAYERS = [
  {
    id: 'virat-kohli',
    name: 'Virat Kohli',
    role: 'Batsman',
    country: 'India',
    basePrice: 200,
    rating: 91,
    style: 'Aggressive',
    photo: '/assets/players/virat.jpg',
    stats: {
      matches: 237,
      runs: 6285,
      average: 35.1,
      strikeRate: 19.3,
      centuries: 46,
      fifties: 1
    }
  },
  {
    id: 'rohit-sharma',
    name: 'Rohit Sharma',
    role: 'All-Rounder',
    country: 'India',
    basePrice: 180,
    rating: 89,
    style: 'Finisher',
    photo: '/assets/players/rohit.jpg',
    stats: {
      matches: 208,
      runs: 5879,
      average: 35.6,
      strikeRate: 18.8,
      centuries: 44,
      wickets: 151,
      economy: 5.8
    }
  },
  {
    id: 'ms-dhoni',
    name: 'MS Dhoni',
    role: 'Wicket-Keeper',
    country: 'India',
    basePrice: 150,
    rating: 87,
    style: 'Finisher',
    photo: '/assets/players/dhoni.jpg',
    stats: {
      matches: 234,
      runs: 5166,
      average: 38.1,
      strikeRate: 17.5,
      centuries: 6,
      dismissals: 83,
      stumpings: 0
    }
  },
  {
    id: 'jasprit-bumrah',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    country: 'India',
    basePrice: 120,
    rating: 85,
    style: 'Express',
    photo: '/assets/players/bumrah.jpg',
    stats: {
      matches: 217,
      runs: 5447,
      average: 25.1,
      strikeRate: 20.1,
      wickets: 145,
      economy: 6.9
    }
  },
  {
    id: 'david-warner',
    name: 'David Warner',
    role: 'Batsman',
    country: 'Australia',
    basePrice: 200,
    rating: 88,
    style: 'Aggressive',
    photo: '/assets/players/warner.jpg',
    stats: {
      matches: 161,
      runs: 5881,
      average: 36.5,
      strikeRate: 21.9,
      centuries: 18,
      fifties: 7
    }
  },
  {
    id: 'kane-williamson',
    name: 'Kane Williamson',
    role: 'Batsman',
    country: 'New Zealand',
    basePrice: 150,
    rating: 86,
    style: 'Technical',
    photo: '/assets/players/williamson.jpg',
    stats: {
      matches: 159,
      runs: 6249,
      average: 39.3,
      strikeRate: 19.6,
      centuries: 42,
      fifties: 3
    }
  },
  {
    id: 'aaron-finch',
    name: 'Aaron Finch',
    role: 'Batsman',
    country: 'Australia',
    basePrice: 120,
    rating: 84,
    style: 'Aggressive',
    photo: '/assets/players/finch.jpg',
    stats: {
      matches: 103,
      runs: 2763,
      average: 26.8,
      strikeRate: 20.6,
      centuries: 17,
      fifties: 2
    }
  },
  {
    id: 'quinton-de-kock',
    name: 'Quinton de Kock',
    role: 'Wicket-Keeper',
    country: 'South Africa',
    basePrice: 100,
    rating: 82,
    style: 'Aggressive',
    photo: '/assets/players/dekock.jpg',
    stats: {
      matches: 178,
      runs: 5507,
      average: 30.9,
      strikeRate: 18.7,
      centuries: 33,
      fifties: 0,
      stumpings: 0
    }
  },
  {
    id: 'jofra-archer',
    name: 'Jofra Archer',
    role: 'Bowler',
    country: 'England',
    basePrice: 160,
    rating: 83,
    style: 'Swing',
    photo: '/assets/players/archer.jpg',
    stats: {
      matches: 144,
      runs: 5946,
      average: 41.3,
      strikeRate: 20.2,
      wickets: 227,
      economy: 6.6
    }
  },
  {
    id: 'rashid-khan',
    name: 'Rashid Khan',
    role: 'Bowler',
    country: 'Pakistan',
    basePrice: 180,
    rating: 81,
    style: 'Swing',
    photo: '/assets/players/rashid.jpg',
    stats: {
      matches: 169,
      runs: 5414,
      average: 32.0,
      strikeRate: 18.9,
      wickets: 195,
      economy: 6.8
    }
  },
  {
    id: 'shakib-al-hasan',
    name: 'Shakib Al Hasan',
    role: 'All-Rounder',
    country: 'Bangladesh',
    basePrice: 140,
    rating: 79,
    style: 'All-Rounder',
    photo: '/assets/players/shakib.jpg',
    stats: {
      matches: 179,
      runs: 6353,
      average: 35.5,
      strikeRate: 19.3,
      wickets: 226,
      economy: 4.4
    }
  },
  {
    id: 'faf-du-plessis',
    name: 'Faf du Plessis',
    role: 'All-Rounder',
    country: 'South Africa',
    basePrice: 110,
    rating: 77,
    style: 'All-Rounder',
    photo: '/assets/players/faf.jpg',
    stats: {
      matches: 143,
      runs: 3880,
      average: 27.1,
      strikeRate: 21.5,
      wickets: 127,
      economy: 5.4
    }
  },
  {
    id: 'chris-gayle',
    name: 'Chris Gayle',
    role: 'Batsman',
    country: 'West Indies',
    basePrice: 200,
    rating: 85,
    style: 'Power',
    photo: '/assets/players/gayle.jpg',
    stats: {
      matches: 163,
      runs: 10405,
      average: 63.8,
      strikeRate: 17.3,
      centuries: 42,
      fifties: 31,
      wickets: 0
    }
  },
  {
    id: 'andre-russell',
    name: 'Andre Russell',
    role: 'All-Rounder',
    country: 'West Indies',
    basePrice: 120,
    rating: 75,
    style: 'All-Rounder',
    photo: '/assets/players/russell.jpg',
    stats: {
      matches: 67,
      runs: 1034,
      average: 15.4,
      strikeRate: 17.2,
      centuries: 4,
      wickets: 0,
      economy: 9.8
    }
  },
  {
    id: 'kieron-pollard',
    name: 'Kieron Pollard',
    role: 'All-Rounder',
    country: 'West Indies',
    basePrice: 140,
    rating: 73,
    style: 'All-Rounder',
    photo: '/assets/players/pollard.jpg',
    stats: {
      matches: 71,
      runs: 2204,
      average: 31.0,
      strikeRate: 17.5,
      centuries: 6,
      wickets: 0,
      economy: 7.7
    }
  },
  // Additional 15 popular IPL players
  {
    id: 'suryakumar-yadav',
    name: 'Suryakumar Yadav',
    role: 'Batsman',
    country: 'India',
    basePrice: 150,
    rating: 88,
    style: 'Aggressive',
    photo: '/assets/players/surya.jpg',
    stats: {
      matches: 120,
      runs: 3526,
      average: 29.4,
      strikeRate: 18.9,
      centuries: 2,
      fifties: 18,
      wickets: 0
    }
  },
  {
    id: 'shreyas-iyer',
    name: 'Shreyas Iyer',
    role: 'Batsman',
    country: 'India',
    basePrice: 140,
    rating: 86,
    style: 'Aggressive',
    photo: '/assets/players/shreyas.jpg',
    stats: {
      matches: 95,
      runs: 2896,
      average: 30.5,
      strikeRate: 19.3,
      centuries: 3,
      fifties: 21,
      wickets: 0
    }
  },
  {
    id: 'hardik-pandya',
    name: 'Hardik Pandya',
    role: 'All-Rounder',
    country: 'India',
    basePrice: 120,
    rating: 84,
    style: 'All-Rounder',
    photo: '/assets/players/hardik.jpg',
    stats: {
      matches: 87,
      runs: 2266,
      average: 26.0,
      strikeRate: 19.3,
      centuries: 1,
      fifties: 15,
      wickets: 42,
      economy: 7.2
    }
  },
  {
    id: 'ravindra-jadeja',
    name: 'Ravindra Jadeja',
    role: 'All-Rounder',
    country: 'India',
    basePrice: 100,
    rating: 82,
    style: 'All-Rounder',
    photo: '/assets/players/jadeja.jpg',
    stats: {
      matches: 132,
      runs: 3358,
      average: 25.4,
      strikeRate: 19.3,
      centuries: 3,
      fifties: 10,
      wickets: 0,
      economy: 8.1
    }
  },
  {
    id: 'axar-patel',
    name: 'Axar Patel',
    role: 'Bowler',
    country: 'India',
    basePrice: 100,
    rating: 79,
    style: 'Swing',
    photo: '/assets/players/axar.jpg',
    stats: {
      matches: 65,
      runs: 1639,
      average: 25.2,
      strikeRate: 19.3,
      wickets: 85,
      economy: 6.3
    }
  },
  {
    id: 'kuldeep-yadav',
    name: 'Kuldeep Yadav',
    role: 'Bowler',
    country: 'India',
    basePrice: 80,
    rating: 77,
    style: 'Swing',
    photo: '/assets/players/kuldeep.jpg',
    stats: {
      matches: 82,
      runs: 2241,
      average: 27.3,
      strikeRate: 19.3,
      wickets: 105,
      economy: 6.8
    }
  },
  {
    id: 'yuzvendra-chahal',
    name: 'Yuzvendra Chahal',
    role: 'Bowler',
    country: 'India',
    basePrice: 80,
    rating: 75,
    style: 'Swing',
    photo: '/assets/players/chahal.jpg',
    stats: {
      matches: 71,
      runs: 2576,
      average: 36.3,
      strikeRate: 19.3,
      wickets: 92,
      economy: 6.8
    }
  },
  {
    id: 'mohammed-siraj',
    name: 'Mohammed Siraj',
    role: 'Bowler',
    country: 'India',
    basePrice: 80,
    rating: 73,
    style: 'Express',
    photo: '/assets/players/siraj.jpg',
    stats: {
      matches: 30,
      runs: 826,
      average: 27.5,
      strikeRate: 19.3,
      wickets: 35,
      economy: 6.8
    }
  },
  {
    id: 'rishabh-pant',
    name: 'Rishabh Pant',
    role: 'Wicket-Keeper',
    country: 'India',
    basePrice: 100,
    rating: 79,
    style: 'Aggressive',
    photo: '/assets/players/pant.jpg',
    stats: {
      matches: 98,
      runs: 3201,
      average: 32.7,
      strikeRate: 19.3,
      centuries: 5,
      fifties: 16,
      wickets: 0,
      stumpings: 0
    }
  },
  {
    id: 'sanju-samson',
    name: 'Sanju Samson',
    role: 'Batsman',
    country: 'India',
    basePrice: 120,
    rating: 76,
    style: 'Aggressive',
    photo: '/assets/players/samson.jpg',
    stats: {
      matches: 55,
      runs: 1654,
      average: 30.1,
      strikeRate: 19.3,
      centuries: 3,
      fifties: 8,
      wickets: 0
    }
  },
  {
    id: 'ruturaj-gaikwad',
    name: 'Ruturaj Gaikwad',
    role: 'Batsman',
    country: 'India',
    basePrice: 100,
    rating: 74,
    style: 'Aggressive',
    photo: '/assets/players/ruturaj.jpg',
    stats: {
      matches: 58,
      runs: 1855,
      average: 32.0,
      strikeRate: 19.3,
      centuries: 4,
      fifties: 11,
      wickets: 0
    }
  },
  {
    id: 'shubman-gill',
    name: 'Shubman Gill',
    role: 'Batsman',
    country: 'India',
    basePrice: 100,
    rating: 82,
    style: 'Aggressive',
    photo: '/assets/players/gill.jpg',
    stats: {
      matches: 28,
      runs: 950,
      average: 33.9,
      strikeRate: 19.3,
      centuries: 3,
      fifties: 4,
      wickets: 0
    }
  },
  {
    id: 'ishan-kishan',
    name: 'Ishan Kishan',
    role: 'Batsman',
    country: 'India',
    basePrice: 80,
    rating: 78,
    style: 'Aggressive',
    photo: '/assets/players/ishan.jpg',
    stats: {
      matches: 45,
      runs: 1452,
      average: 32.3,
      strikeRate: 19.3,
      centuries: 4,
      fifties: 8,
      wickets: 0
    }
  },
  {
    id: 'devdutt-padikkal',
    name: 'Devdutt Padikkal',
    role: 'Batsman',
    country: 'India',
    basePrice: 80,
    rating: 75,
    style: 'Aggressive',
    photo: '/assets/players/devdutt.jpg',
    stats: {
      matches: 38,
      runs: 1692,
      average: 44.5,
      strikeRate: 19.3,
      centuries: 5,
      fifties: 8,
      wickets: 0
    }
  }
]

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']

const COUNTRY_FLAG = Object.fromEntries(COUNTRIES.map((c) => [c, '/assets/flags/placeholder.svg']))

function hashStringToInt(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seeded01(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function makePlayer({ id, name, country, role, tier }) {
  const seed = hashStringToInt(`${name}|${country}|${role}|${id}`)

  const baseByTier = {
    1: 200,
    2: 160,
    3: 120,
    4: 90,
    5: 60,
  }

  const r1 = seeded01(seed + 1)
  const r2 = seeded01(seed + 2)

  const rating = clamp(Math.round(55 + tier * 7 + r1 * 25), 1, 100)
  const performanceIndex = clamp(Math.round(50 + tier * 6 + r2 * 30), 1, 100)

  const star = tier >= 4 && seeded01(seed + 3) > 0.55

  const basePrice = Math.max(20, Math.round((baseByTier[tier] + seeded01(seed + 4) * 40) / 10) * 10)

  return {
    id,
    name,
    country,
    role,
    basePrice,
    rating,
    performanceIndex,
    star,
    photo: '/assets/players/placeholder.svg',
    flag: COUNTRY_FLAG[country] || '/assets/flags/placeholder.svg',
  }
}

const NAME_BANK = {
  India: [
    'Arjun',
    'Rohit',
    'Virat',
    'Shubman',
    'Rishabh',
    'Hardik',
    'Jasprit',
    'Kuldeep',
    'Suryakumar',
    'Ishan',
    'Ravindra',
    'Bhuvneshwar',
    'Axar',
    'Mohammed',
    'Yuzvendra',
    'KL',
    'Shreyas',
    'Sanju',
  ],
  Australia: [
    'David',
    'Steve',
    'Pat',
    'Mitchell',
    'Glenn',
    'Josh',
    'Travis',
    'Adam',
    'Marcus',
    'Alex',
    'Cameron',
    'Nathan',
    'Ashton',
  ],
  England: [
    'Joe',
    'Ben',
    'Jos',
    'Jonny',
    'Jofra',
    'Sam',
    'Mark',
    'Chris',
    'Adil',
    'Moeen',
    'Harry',
  ],
  Pakistan: [
    'Babar',
    'Rizwan',
    'Shaheen',
    'Shadab',
    'Haris',
    'Fakhar',
    'Naseem',
    'Imad',
    'Hasan',
    'Iftikhar',
  ],
  'South Africa': [
    'Quinton',
    'Kagiso',
    'Aiden',
    'David',
    'Rassie',
    'Anrich',
    'Lungi',
    'Marco',
    'Heinrich',
  ],
  'New Zealand': ['Kane', 'Trent', 'Tim', 'Devon', 'Daryl', 'Mitchell', 'Ish', 'Lockie'],
  'Sri Lanka': ['Kusal', 'Wanindu', 'Dasun', 'Dushmantha', 'Maheesh', 'Pathum', 'Charith'],
  Bangladesh: ['Shakib', 'Tamim', 'Mustafizur', 'Litton', 'Taskin', 'Mehidy', 'Mahmudullah'],
  Afghanistan: ['Rashid', 'Mohammad', 'Mujeeb', 'Naveen', 'Rahmanullah', 'Najibullah'],
  'West Indies': ['Andre', 'Nicholas', 'Jason', 'Kieron', 'Sunil', 'Alzarri', 'Shai'],
  Ireland: ['Paul', 'Andrew', 'Josh', 'George', 'Harry', 'Mark'],
  Scotland: ['Kyle', 'Richie', 'George', 'Brad', 'Michael', 'Safyaan'],
  Netherlands: ['Max', 'Bas', 'Logan', 'Colin', 'Paul', 'Roelof'],
  Nepal: ['Sandeep', 'Rohit', 'Dipendra', 'Sompal', 'Aasif'],
  UAE: ['Muhammad', 'Chirag', 'Rohan', 'Vriitya', 'Zahoor'],
  USA: ['Monank', 'Steven', 'Ali', 'Saurabh', 'Nosthush', 'Jaskaran'],
  Zimbabwe: ['Sikandar', 'Sean', 'Blessing', 'Craig', 'Richard', 'Wellington'],
}

const SURNAME_BANK = [
  'Sharma',
  'Khan',
  'Singh',
  'Patel',
  'Smith',
  'Johnson',
  'Brown',
  'Taylor',
  'Miller',
  'Davies',
  'Anderson',
  'Ali',
  'Hussain',
  'Fernando',
  'Perera',
  'Rahman',
  'Kumar',
  'De Silva',
  'van der Merwe',
  'O’Connor',
  'Mutumbami',
  'Campbell',
  'Holder',
  'Raza',
  'Lamichhane',
  'Jansen',
]

function makeName(country, idx) {
  const firsts = NAME_BANK[country] || ['Player']
  const f = firsts[idx % firsts.length]
  const s = SURNAME_BANK[(hashStringToInt(`${country}|${idx}`) + idx) % SURNAME_BANK.length]
  const suffix = idx >= firsts.length ? ` ${idx - firsts.length + 1}` : ''
  return `${f} ${s}${suffix}`
}

function roleFor(country, idx) {
  const seed = hashStringToInt(`${country}|role|${idx}`)
  return ROLES[seed % ROLES.length]
}

function tierFor(country, idx) {
  const seed = hashStringToInt(`${country}|tier|${idx}`)
  const v = seed % 100
  if (v < 10) return 5
  if (v < 28) return 4
  if (v < 55) return 3
  if (v < 80) return 2
  return 1
}

function generatePlayers() {
  const players = []
  let id = 1

  for (const country of COUNTRIES) {
    const count =
      country === 'India'
        ? 34
        : country === 'Australia'
          ? 28
          : country === 'England'
            ? 26
            : country === 'Pakistan'
              ? 24
              : country === 'South Africa'
                ? 22
                : country === 'New Zealand'
                  ? 18
                  : country === 'West Indies'
                    ? 18
                    : country === 'Sri Lanka'
                      ? 18
                      : country === 'Bangladesh'
                        ? 18
                        : country === 'Afghanistan'
                          ? 16
                          : 12

    for (let i = 0; i < count; i++) {
      const name = makeName(country, i)
      const role = roleFor(country, i)
      const tier = tierFor(country, i)
      players.push(makePlayer({ id, name, country, role, tier }))
      id++
    }
  }

  while (players.length < 320) {
    const country = COUNTRIES[players.length % COUNTRIES.length]
    const i = players.length
    players.push(
      makePlayer({
        id,
        name: makeName(country, i),
        country,
        role: roleFor(country, i + 7),
        tier: tierFor(country, i + 13),
      })
    )
    id++
  }

  return players
}

const cleanedRealPlayers = REAL_IPL_PLAYERS.map((p) => {
  const photo = typeof p.photo === 'string' ? p.photo : null
  const isLocalJpg = photo && photo.startsWith('/assets/players/') && photo.toLowerCase().endsWith('.jpg')
  return isLocalJpg ? { ...p, photo: null } : p
})

export const players = cleanedRealPlayers
export const countries = COUNTRIES
export const roles = ROLES
