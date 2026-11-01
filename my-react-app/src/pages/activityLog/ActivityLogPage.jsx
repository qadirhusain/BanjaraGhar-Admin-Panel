import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getActivityLog } from '../../api/activityLogApi'
import Pagination from '../../components/common/Pagination'
import { formatDateTime } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'
import { describeAction } from '../../utils/activity'

const EMPTY_PAGE = { content: [], page: 0, totalPages: 0, totalElements: 0 }

const ENTITY_TYPES = [
  'products',
  'categories',
  'orders',
  'returns',
  'coupons',
  'banners',
  'home-sections',
  'reviews',
  'messages',
  'newsletter',
  'settings',
]

export default function ActivityLogPage() {
  const [data, setData] = useState(EMPTY_PAGE)
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getActivityLog({ entityType, page })
      .then((result) => {
        if (!ignore) setData(result)
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [entityType, page])

  const handleFilter = (e) => {
    setLoading(true)
    setEntityType(e.target.value)
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    setLoading(true)
    setPage(newPage)
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Activity log</h1>
        <div className="page__actions">
          <select value={entityType} onChange={handleFilter}>
            <option value="">All activity</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Admin</th>
              <th>Activity</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && data.content.length === 0 && (
              <tr>
                <td colSpan={4} className="table__empty">No activity yet</td>
              </tr>
            )}
            {data.content.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDateTime(entry.createdAt)}</td>
                <td>
                  {entry.adminName}
                  <div className="table__sub">{entry.adminEmail}</div>
                </td>
                <td>
                  <strong>{describeAction(entry.action)}</strong>
                  <div className="table__sub">
                    <code>{entry.action}</code>
                  </div>
                </td>
                <td>
                  {entry.entityType}
                  {entry.entityId && (
                    <div className="table__sub" title={entry.entityId}>
                      {entry.entityId.slice(0, 8)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={data.page} totalPages={data.totalPages} onChange={handlePageChange} />
    </div>
  )
}