export default function BidPulse({ valueKey, children }) {
  return (
    <span key={valueKey} className="inline-block vfx-bid-pop">
      {children}
    </span>
  )
}
