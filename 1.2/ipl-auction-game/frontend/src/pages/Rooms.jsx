import { Link, useNavigate } from 'react-router-dom'

export default function Rooms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Live Auction Rooms</h1>
          <Link 
            to="/" 
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample rooms for demonstration */}
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-orange-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Room #{i + 1}</h3>
                  <p className="text-gray-400">Host: Player{i + 1}</p>
                </div>
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  LIVE
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white font-medium">{Math.floor(Math.random() * 8) + 2}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400 font-medium">In Progress</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors">
                Join Room
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
