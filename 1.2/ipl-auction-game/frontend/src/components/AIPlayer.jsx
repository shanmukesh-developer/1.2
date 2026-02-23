import { useState, useEffect } from 'react'
import { useGame } from '../state/gameState.jsx'

const AI_NAMES = ['Bot Sharma', 'AI Kohli', 'Robot Dhoni', 'Cyber Jadeja', 'Pixel Pandya', 'Virtual Raina', 'Code Gill', 'Binary Rahul', 'Algo Rohit']
const AI_TEAMS = ['Digital Destroyers', 'Binary Blasters', 'Cyber Kings', 'Virtual Riders', 'AI Super Giants', 'Bot Capitals', 'Algorithm United']

export default function AIPlayer({ enabled, onToggle }) {
  const { state, dispatch } = useGame()
  const [aiCount, setAiCount] = useState(3)

  useEffect(() => {
    if (enabled && aiCount > 0) {
      const timer = setTimeout(() => {
        const aiName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]
        const aiTeam = AI_TEAMS[Math.floor(Math.random() * AI_TEAMS.length)]
        
        dispatch({
          type: 'ADD_USER',
          payload: {
            username: aiName,
            teamName: aiTeam,
            avatar: { id: 'ai', label: 'AI', src: '/assets/avatars/avatar-2.svg' },
          },
        })

        setAiCount(prev => prev - 1)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [enabled, aiCount, dispatch])

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/70">AI Players</span>
        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-white"
        >
          Disable
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-green-400">
          {aiCount} AI players active
        </div>
        <button
          onClick={() => setAiCount(prev => Math.min(prev + 1, 8))}
          disabled={aiCount >= 8}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Add AI Player
        </button>
      </div>
    </div>
  )
}
