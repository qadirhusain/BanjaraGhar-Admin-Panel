import { Link } from 'react-router-dom'

// tone: neutral | warning | danger | success
export default function StatCard({ label, value, hint, to, tone = 'neutral' }) {
  const content = (
    <>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </>
  )
  const className = `card stat-card stat-card--${tone}`

  if (to) {
    return (
      <Link to={to} className={`${className} stat-card--link`}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}