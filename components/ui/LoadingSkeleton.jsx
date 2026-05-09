'use client'

export default function LoadingSkeleton({ rows = 5, height = 'h-12' }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={`skeleton ${height} rounded-xl`} />
      ))}
    </div>
  )
}
