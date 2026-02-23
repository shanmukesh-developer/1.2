export default function PowerCard({ power, disabled, onUse }) {
  return (
    <button
      className={`w-full text-left rounded-2xl border p-3 transition ${
        disabled ? 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed' : 'border-neon-gold/30 bg-neon-gold/10 hover:bg-neon-gold/15'
      }`}
      onClick={onUse}
      disabled={disabled}
    >
      <div className="font-semibold">{power.name}</div>
      <div className="text-sm text-white/70">{power.description}</div>
    </button>
  )
}
