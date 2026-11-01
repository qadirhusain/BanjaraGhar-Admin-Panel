// rows: [[label, value], ...]
export default function DetailList({ rows }) {
  return (
    <dl className="detail-list">
      {rows.map(([label, value]) => (
        <div key={label} className="detail-list__row">
          <dt>{label}</dt>
          <dd>{value === null || value === undefined || value === '' ? '-' : value}</dd>
        </div>
      ))}
    </dl>
  )
}