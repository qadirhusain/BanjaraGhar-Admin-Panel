import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { returnApi } from '@/api/returnApi'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import Pagination from '@/components/common/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import ReturnReviewModal from '@/pages/returns/ReturnReviewModal'
import { RETURN_STATUS_LABELS, RETURN_STATUS_TONES } from '@/utils/statusMeta'
import { formatPaise } from '@/utils/money'
import { formatDateTime } from '@/utils/date'
import { getErrorMessage } from '@/utils/error'

const PAGE_SIZE = 20

const TABS = [
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
]

export default function ReturnsPage() {
  const [status, setStatus] = useState('REQUESTED')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(null)

  useEffect(() => {
    let ignore = false
    returnApi
      .list({ status, page, size: PAGE_SIZE })
      .then((result) => {
        if (!ignore) setData(result)
      })
      .catch((err) => {
        if (!ignore) toast.error(getErrorMessage(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [status, page])

  const changeTab = (value) => {
    if (value === status) return
    setLoading(true)
    setPage(0)
    setStatus(value)
  }

  const changePage = (next) => {
    setLoading(true)
    setPage(next)
  }

  // After a decision, the row is replaced; on the "Requested" tab it drops out of the list
  const handleDecided = (updated) => {
    setData((current) => ({
      ...current,
      content:
        status === 'REQUESTED'
          ? current.content.filter((row) => row.id !== updated.id)
          : current.content.map((row) => (row.id === updated.id ? updated : row)),
    }))
    setReviewing(null)
  }

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order',
      render: (row) => <Link to={`/orders/${row.orderId}`}>{row.orderNumber}</Link>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="cell-stack">
          <strong>{row.customerName}</strong>
          <span className="text-muted">{row.customerEmail}</span>
        </div>
      ),
    },
    { key: 'orderTotal', header: 'Order total', render: (row) => formatPaise(row.orderTotal) },
    {
      key: 'refundAmount',
      header: 'Refund',
      render: (row) => (row.refundAmount != null ? formatPaise(row.refundAmount) : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge tone={RETURN_STATUS_TONES[row.status]}>
          {RETURN_STATUS_LABELS[row.status]}
        </StatusBadge>
      ),
    },
    { key: 'createdAt', header: 'Requested', render: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <button type="button" className="btn btn--sm" onClick={() => setReviewing(row)}>
          {row.status === 'REQUESTED' ? 'Review' : 'View'}
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Returns" subtitle="Customers can return damaged or wrong items with photo proof" />

      <div className="filters">
        <div className="segmented">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`segmented__btn${tab.value === status ? ' segmented__btn--active' : ''}`}
              onClick={() => changeTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data.content}
        loading={loading}
        emptyText="No returns here"
      />
      <Pagination page={page} totalPages={data.totalPages} onChange={changePage} />

      {reviewing && (
        <ReturnReviewModal
          key={reviewing.id}
          item={reviewing}
          onClose={() => setReviewing(null)}
          onDecided={handleDecided}
        />
      )}
    </>
  )
}