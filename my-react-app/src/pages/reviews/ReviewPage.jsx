import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { getReviews, setReviewVisible } from '../../api/reviewApi'
import Pagination from '../../components/common/Pagination'
import { formatDateTime } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'
import './reviews.css'

const EMPTY_PAGE = { content: [], page: 0, totalPages: 0, totalElements: 0 }

export default function ReviewsPage() {
  const [data, setData] = useState(EMPTY_PAGE)
  const [visible, setVisible] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getReviews({ visible, page })
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
  }, [visible, page])

  const handleFilter = (e) => {
    setLoading(true)
    setVisible(e.target.value)
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    setLoading(true)
    setPage(newPage)
  }

  const handleToggle = async (review) => {
    try {
      const updated = await setReviewVisible(review.id, !review.visible)
      setData((prev) => ({
        ...prev,
        content: prev.content.map((r) => (r.id === updated.id ? updated : r)),
      }))
      toast.success(updated.visible ? 'Review is now visible' : 'Review hidden')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Reviews</h1>
        <div className="page__actions">
          <select value={visible} onChange={handleFilter}>
            <option value="">All reviews</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Visible</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && data.content.length === 0 && (
              <tr>
                <td colSpan={6} className="table__empty">No reviews found</td>
              </tr>
            )}
            {data.content.map((review) => (
              <tr key={review.id}>
                <td>{review.productName}</td>
                <td>
                  {review.reviewerName}
                  <div className="table__sub">{review.reviewerEmail}</div>
                </td>
                <td>
                  <span className="stars" title={`${review.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={14} fill={n <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </span>
                </td>
                <td className="review-comment">{review.comment || '—'}</td>
                <td>{formatDateTime(review.createdAt)}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={review.visible}
                      onChange={() => handleToggle(review)}
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