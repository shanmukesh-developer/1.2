import { useMemo } from 'react'
import { useVoiceRoom } from '../realtime/useVoiceRoom.jsx'

export default function VoicePanel({ roomCode, userId, users }) {
  const voice = useVoiceRoom({ roomCode, userId })

  const me = useMemo(() => {
    return (users || []).find((u) => u.id === userId) || null
  }, [userId, users])

  const participants = useMemo(() => {
    const list = voice.peerIds.length > 0 ? voice.peerIds : userId ? [userId] : []
    return list.map((id) => {
      const u = (users || []).find((x) => x.id === id) || null
      return {
        id,
        teamName: u?.teamName || '',
        label: u?.teamName || u?.username || id,
        isMe: id === userId,
      }
    })
  }, [userId, users, voice.peerIds])

  function teamCode(teamName) {
    const name = String(teamName || '').trim()
    const map = {
      'Mumbai Indians': 'MI',
      'Chennai Super Kings': 'CSK',
      'Royal Challengers Bangalore': 'RCB',
      'Kolkata Knight Riders': 'KKR',
      'Delhi Capitals': 'DC',
      'Punjab Kings': 'PBKS',
      'Rajasthan Royals': 'RR',
      'Sunrisers Hyderabad': 'SRH',
      'Gujarat Titans': 'GT',
      'Lucknow Super Giants': 'LSG',
      HOST: 'HOST',
    }
    if (map[name]) return map[name]
    const parts = name.split(' ').filter(Boolean)
    if (parts.length === 0) return 'P'
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase()
    return parts.map((p) => p[0]).join('').slice(0, 4).toUpperCase()
  }

  function teamBadgeClass(teamName) {
    const name = String(teamName || '').trim()
    const map = {
      'Mumbai Indians': 'bg-blue-600/40 border-blue-400/40',
      'Chennai Super Kings': 'bg-yellow-600/40 border-yellow-400/40',
      'Royal Challengers Bangalore': 'bg-red-600/40 border-red-400/40',
      'Kolkata Knight Riders': 'bg-purple-600/40 border-purple-400/40',
      'Delhi Capitals': 'bg-blue-500/40 border-blue-300/40',
      'Punjab Kings': 'bg-red-500/40 border-red-300/40',
      'Rajasthan Royals': 'bg-pink-600/40 border-pink-300/40',
      'Sunrisers Hyderabad': 'bg-orange-600/40 border-orange-300/40',
      'Gujarat Titans': 'bg-indigo-600/40 border-indigo-300/40',
      'Lucknow Super Giants': 'bg-teal-600/40 border-teal-300/40',
      HOST: 'bg-white/10 border-white/20',
    }
    return map[name] || 'bg-white/10 border-white/20'
  }

  function teamLogoUrl(teamName) {
    const name = String(teamName || '').trim()
    const map = {
      'Mumbai Indians': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png',
      'Chennai Super Kings':
        'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Chennai_Super_Kings_Logo.svg/200px-Chennai_Super_Kings_Logo.svg.png',
      'Royal Challengers Bangalore':
        'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Royal_Challengers_Bangalore_Logo.svg/200px-Royal_Challengers_Bangalore_Logo.svg.png',
      'Kolkata Knight Riders':
        'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png',
      'Delhi Capitals':
        'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Delhi_Capitals.svg/200px-Delhi_Capitals.svg.png',
      'Punjab Kings':
        'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
      'Rajasthan Royals':
        'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
      'Sunrisers Hyderabad':
        'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/200px-Sunrisers_Hyderabad.svg.png',
      'Gujarat Titans':
        'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/200px-Gujarat_Titans_Logo.svg.png',
      'Lucknow Super Giants':
        'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Lucknow_Super_Giants_logo.png/200px-Lucknow_Super_Giants_logo.png',
    }
    return map[name] || null
  }

  function levelFor(p) {
    if (p.isMe) return voice.levels.local || 0
    return voice.levels[p.id] || 0
  }

  function isSpeaking(lvl) {
    return lvl > 0.04
  }

  return (
    <div className="rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-white">Voice</div>
          <div className="text-xs text-white/60">Room audio</div>
        </div>
        <div className="text-xs text-white/60">{me ? me.teamName : 'Player'}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!voice.joined ? (
          <button
            type="button"
            onClick={voice.join}
            disabled={!voice.enabled}
            className="col-span-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold"
          >
            Join Voice
          </button>
        ) : (
          <button
            type="button"
            onClick={voice.leave}
            className="col-span-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Leave Voice
          </button>
        )}

        <button
          type="button"
          onClick={() => voice.setMicEnabled((v) => !v)}
          disabled={!voice.joined}
          className={`px-4 py-3 rounded-xl text-white font-bold disabled:bg-gray-600 disabled:cursor-not-allowed ${
            voice.micEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Mic: {voice.micEnabled ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          onClick={() => voice.setSpeakerEnabled((v) => !v)}
          disabled={!voice.joined}
          className={`px-4 py-3 rounded-xl text-white font-bold disabled:bg-gray-600 disabled:cursor-not-allowed ${
            voice.speakerEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Speaker: {voice.speakerEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs text-white/60 mb-2">Participants</div>
        <div className="space-y-2">
          {participants.map((p) => {
            const lvl = levelFor(p)
            const pct = Math.max(0, Math.min(100, Math.round(lvl * 220)))
            const logo = teamLogoUrl(p.teamName)
            return (
              <div key={p.id} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    voice.joined && isSpeaking(lvl) ? 'bg-green-400 animate-pulse' : 'bg-white/20'
                  }`}
                />

                {logo ? (
                  <img
                    src={logo}
                    alt={teamCode(p.teamName)}
                    className={`w-10 h-7 rounded-lg border object-contain p-1 ${teamBadgeClass(p.teamName)}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div
                    className={`w-10 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black text-white ${teamBadgeClass(
                      p.teamName
                    )}`}
                  >
                    {teamCode(p.teamName)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-white truncate">
                      {p.label}
                      {p.isMe ? ' (You)' : ''}
                    </div>
                    <div className="text-[10px] text-white/40">{voice.joined ? `${pct}%` : '--'}</div>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                      style={{ width: voice.joined ? `${pct}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {voice.audioElements}
    </div>
  )
}
