import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getSubscribers, setSubscriberActive } from '../../api/subscriberApi'
import Pagination from '../../components/common/Pagination'
import { formatDateTime } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'

const EMPTY_PAGE = { content: [], page: 0, totalPages: 0, totalElements: 0 }

export default function SubscribersPage() {
  const [data, setData] = useState(EMPTY_PAGE)
  const [active, setActive] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getSubscribers({ active, page })
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
  }, [active, page])

  const handleFilter = (e) => {
    setLoading(true)
    setActive(e.target.value)
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    setLoading(true)
    setPage(newPage)
  }

  const handleToggle = async (subscriber) => {
    try {
      const updated = await setSubscriberActive(subscriber.id, !subscriber.active)
      setData((prev) => ({
        ...prev,
        content: prev.content.map((s) => (s.id === updated.id ? updated : s)),
      }))
      toast.success(updated.active ? 'Subscriber activated' : 'Subscriber deactivated')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Subscribers ({data.totalElements})</h1>
        <div className="page__actions">
          <select value={active} onChange={handleFilter}>
            <option value="">All subscribers</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed on</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && data.content.length === 0 && (
              <tr>
                <td colSpan={3} className="table__empty">No subscribers found</td>
              </tr>
            )}
            {data.content.map((subscriber) => (
              <tr key={subscriber.id}>
                <td>{subscriber.email}</td>
                <td>{formatDateTime(subscriber.subscribedAt)}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={subscriber.active}
                      onChange={() => handleToggle(subscriber)}
                    />
                    <span className="switch__slider" />
                  </label>
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