import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMessages, setMessageStatus } from '../../api/messageApi'
import Pagination from '../../components/common/Pagination'
import { formatDateTime } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'
import MessageModal from './MessageModal'
import './messages.css'

const EMPTY_PAGE = { content: [], page: 0, totalPages: 0, totalElements: 0 }

const STATUS_BADGE = {
  NEW: 'badge--yellow',
  READ: 'badge--grey',
  RESOLVED: 'badge--green',
}

export default function MessagesPage() {
  const [data, setData] = useState(EMPTY_PAGE)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let ignore = false

    getMessages({ status, page })
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
  }, [status, page])

  const replaceMessage = (updated) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((m) => (m.id === updated.id ? updated : m)),
    }))
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev))
  }

  const handleFilter = (e) => {
    setLoading(true)
    setStatus(e.target.value)
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    setLoading(true)
    setPage(newPage)
  }

  const handleChangeStatus = async (message, newStatus) => {
    try {
      replaceMessage(await setMessageStatus(message.id, newStatus))
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  // Opening a new message marks it as read
  const handleOpen = (message) => {
    setSelected(message)
    if (message.status === 'NEW') {
      handleChangeStatus(message, 'READ')
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Messages</h1>
        <div className="page__actions">
          <select value={status} onChange={handleFilter}>
            <option value="">All messages</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && data.content.length === 0 && (
              <tr>
                <td colSpan={5} className="table__empty">No messages found</td>
              </tr>
            )}
            {data.content.map((message) => (
              <tr
                key={message.id}
                className={`message-row ${message.status === 'NEW' ? 'message-row--new' : ''}`}
                onClick={() => handleOpen(message)}
              >
                <td>
                  {message.name}
                  <div className="table__sub">{message.email}</div>
                </td>
                <td>{message.subject}</td>
                <td className="message-preview">{message.message}</td>
                <td>{formatDateTime(message.createdAt)}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[message.status]}`}>{message.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={data.page} totalPages={data.totalPages} onChange={handlePageChange} />

      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  )
}