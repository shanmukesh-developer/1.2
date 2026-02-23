function sumBy(arr, fn) {
  let s = 0
  for (const x of arr) s += fn(x)
  return s
}

function roleCounts(players) {
  const counts = {
    Batsman: 0,
    Bowler: 0,
    'All-Rounder': 0,
    'Wicket-Keeper': 0,
  }
  for (const p of players) {
    if (counts[p.role] !== undefined) counts[p.role]++
  }
  return counts
}

export function getBalancedSquadBonus(players) {
  const c = roleCounts(players)
  const ok = c.Batsman >= 3 && c.Bowler >= 3 && c['All-Rounder'] >= 1 && c['Wicket-Keeper'] >= 1
  return ok ? 50 : 0
}

export function getStarBonus(players) {
  return players.reduce((acc, p) => acc + (p.star ? 20 : 0), 0)
}

export function getTeamBaseScore(players) {
  return sumBy(players, (p) => (p.performanceIndex || 0) + (p.rating || 0))
}

export function scoreTeam({ squad, captainId }) {
  const base = getTeamBaseScore(squad)
  const starBonus = getStarBonus(squad)
  const balancedBonus = getBalancedSquadBonus(squad)

  let captainBonus = 0
  if (captainId) {
    const captain = squad.find((p) => p.id === captainId)
    if (captain) {
      captainBonus = Math.round(((captain.performanceIndex || 0) + (captain.rating || 0)) * 0.5)
    }
  }

  const total = base + starBonus + balancedBonus + captainBonus

  return {
    total,
    breakdown: {
      base,
      starBonus,
      balancedBonus,
      captainBonus,
    },
  }
}

export function rankTeams(users) {
  const scored = users.map((u) => {
    const { total, breakdown } = scoreTeam({ squad: u.squad || [], captainId: u.captainId })
    return {
      userId: u.id,
      username: u.username,
      teamName: u.teamName,
      avatar: u.avatar,
      score: total,
      breakdown,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  return {
    leaderboard: scored,
    top10: scored.slice(0, 10),
  }
}
