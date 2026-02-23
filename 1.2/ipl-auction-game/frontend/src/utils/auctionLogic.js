export const BID_INCREMENT = 10
export const ROUND_SECONDS = 10

export const POWER_CARDS = [
  {
    id: 'double_bid',
    name: 'Double Bid',
    description: 'Your next bid counts as +₹20 instead of +₹10.',
  },
  {
    id: 'freeze_opponent',
    name: 'Freeze Opponent',
    description: 'Block one opponent from bidding for this round.',
  },
  {
    id: 'instant_buy',
    name: 'Instant Buy',
    description: 'Auto-win this player at current price.',
  },
  {
    id: 'secret_bid',
    name: 'Secret Bid',
    description: 'Place a hidden max bid; system bids for you up to that amount.',
  },
  {
    id: 'price_drop',
    name: 'Price Drop',
    description: 'Reduce the base price of this player by 20% before bidding starts.',
  },
]

export const AUCTION_EVENTS = [
  {
    id: 'injury_alert',
    name: 'Injury Alert',
    apply(player) {
      return { ...player, performanceIndex: Math.max(1, (player.performanceIndex || 0) - 10) }
    },
  },
  {
    id: 'form_boost',
    name: 'Form Boost',
    apply(player) {
      return { ...player, performanceIndex: Math.min(100, (player.performanceIndex || 0) + 15) }
    },
  },
  {
    id: 'sponsor_bonus',
    name: 'Sponsor Bonus',
    applyToUser(user) {
      return { ...user, purse: (user.purse || 0) + 200 }
    },
  },
  {
    id: 'market_crash',
    name: 'Market Crash',
    apply(player) {
      return { ...player, basePrice: Math.max(10, Math.round(((player.basePrice || 0) * 0.8) / 10) * 10) }
    },
  },
  {
    id: 'fan_hype',
    name: 'Fan Hype',
    apply(player) {
      return { ...player, rating: Math.min(100, (player.rating || 0) + 8) }
    },
  },
]

export function pickRandom(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)]
}

export function shuffleCopy(arr, rng = Math.random) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomPowerCards(count = 2, rng = Math.random) {
  const shuffled = shuffleCopy(POWER_CARDS, rng)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function canAfford(user, price) {
  return (user.purse || 0) >= price
}

export function nextBidAmount({ currentBid, increment = BID_INCREMENT, doubleBidActive = false }) {
  const inc = doubleBidActive ? increment * 2 : increment
  return (currentBid || 0) + inc
}

export function shouldTriggerEvent(rng = Math.random) {
  return rng() < 0.18
}

export function applyRandomEvent({ player, users, rng = Math.random }) {
  const event = pickRandom(AUCTION_EVENTS, rng)
  let nextPlayer = player
  let nextUsers = users

  if (event.apply) nextPlayer = event.apply(player)
  if (event.applyToUser) {
    const idx = Math.floor(rng() * users.length)
    nextUsers = users.map((u, i) => (i === idx ? event.applyToUser(u) : u))
  }

  return {
    event,
    player: nextPlayer,
    users: nextUsers,
  }
}

export function resolveWinner({ users, winnerUserId, player, price }) {
  if (!winnerUserId) return users

  return users.map((u) => {
    if (u.id !== winnerUserId) return u

    const purse = Math.max(0, (u.purse || 0) - price)
    const squad = [...(u.squad || []), { ...player, finalPrice: price }]

    return {
      ...u,
      purse,
      squad,
    }
  })
}
