import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orderApi'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import Pagination from '@/components/common/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  REFUND_LABELS,
  REFUND_TONES,
} from '@/utils/statusMeta'
import { formatPaise } from '@/utils/money'
import { formatDateTime } from '@/utils/date'
import { getErrorMessage } from '@/utils/error'

const PAGE_SIZE = 20

export default function OrdersPage() {
  // The filters live in the address bar, so /orders?status=PAID works as a link
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const q = searchParams.get('q') ?? ''

  const [searchText, setSearchText] = useState(q)
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    orderApi
      .list({ status, q, page, size: PAGE_SIZE })
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
  }, [status, q, page])

  const applyFilters = (next) => {
    if (next.status === status && next.q === q) return
    const params = {}
    if (next.status) params.status = next.status
    if (next.q) params.q = next.q
    setLoading(true)
    setPage(0)
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    applyFilters({ status, q: searchText.trim() })
  }

  const changePage = (next) => {
    setLoading(true)
    setPage(next)
  }

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order',
      render: (row) => <Link to={`/orders/${row.id}`}>{row.orderNumber}</Link>,
    },
    { key: 'createdAt', header: 'Placed', render: (row) => formatDateTime(row.createdAt) },
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
    { key: 'itemCount', header: 'Items', width: 70 },
    { key: 'totalAmount', header: 'Total', render: (row) => formatPaise(row.totalAmount) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="cell-stack" style={{ alignItems: 'flex-start' }}>
          <StatusBadge tone={ORDER_STATUS_TONES[row.status]}>
            {ORDER_STATUS_LABELS[row.status]}
          </StatusBadge>
          {row.refundStatus && (
            <StatusBadge tone={REFUND_TONES[row.refundStatus]}>
              {REFUND_LABELS[row.refundStatus]}
            </StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <Link to={`/orders/${row.id}`} className="btn btn--sm">
          View
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Orders" />

      <div className="filters">
        <select
          className="input"
          value={status}
          onChange={(e) => applyFilters({ status: e.target.value, q })}
        >
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <form className="cell-actions" onSubmit={handleSearch}>
          <input
            className="input"
            style={{ minWidth: 260 }}
            placeholder="Order number or customer email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button type="submit" className="btn">
            Search
          </button>
          {q && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSearchText('')
                applyFilters({ status, q: '' })
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <DataTable
        columns={columns}
        rows={data.content}
        loading={loading}
        emptyText="No orders found"
      />
      <Pagination page={page} totalPages={data.totalPages} onChange={changePage} />
    </>
  )
}