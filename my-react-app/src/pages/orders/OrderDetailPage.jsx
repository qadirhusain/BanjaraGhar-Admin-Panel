import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orderApi'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import DetailList from '@/components/common/DetailList'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmModal from '@/components/common/ConfirmModal'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  REFUND_LABELS,
  REFUND_TONES,
  SHIPMENT_STATUS_TONES,
} from '@/utils/statusMeta'
import { formatPaise } from '@/utils/money'
import { formatDateTime } from '@/utils/date'
import { imageUrl } from '@/utils/image'
import { getErrorMessage } from '@/utils/error'
import '@/pages/orders/orders.css'

const CANCELLABLE = ['PENDING_PAYMENT', 'PAID']
const NO_SHIPMENT = ['PENDING_PAYMENT', 'EXPIRED']

async function loadOrder(id) {
  const order = await orderApi.get(id)
  let shipment = null
  if (!NO_SHIPMENT.includes(order.status)) {
    try {
      shipment = await orderApi.getShipment(id)
    } catch (err) {
      // 404 just means no shipment was created for this order yet
      if (err.response?.status !== 404) throw err
    }
  }
  return { order, shipment }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let ignore = false
    loadOrder(id)
      .then((result) => {
        if (ignore) return
        setOrder(result.order)
        setShipment(result.shipment)
        setLoadError('')
      })
      .catch((err) => {
        if (!ignore) setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [id, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  const handleCancel = async () => {
    setBusy(true)
    try {
      await orderApi.cancel(id)
      toast.success(order.status === 'PAID' ? 'Order cancelled. Refund started.' : 'Order cancelled')
      setConfirmCancel(false)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleRetry = async () => {
    setBusy(true)
    try {
      const result = await orderApi.retryShipment(id)
      setShipment(result)
      if (result.status === 'BOOKED') {
        toast.success('Shipment booked with the courier')
      } else {
        toast.error('The courier booking did not go through. See the error below.')
      }
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-muted">Loading...</p>

  if (loadError) {
    return (
      <>
        <Link to="/orders" className="back-link">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <div className="error-box">{loadError}</div>
      </>
    )
  }

  const address = order.address
  const itemColumns = [
    {
      key: 'image',
      header: '',
      width: 70,
      render: (row) =>
        row.imageUrl ? (
          <img className="thumb" src={imageUrl(row.imageUrl)} alt="" />
        ) : (
          <div className="thumb" />
        ),
    },
    { key: 'name', header: 'Product' },
    { key: 'unitPrice', header: 'Price', render: (row) => formatPaise(row.unitPrice) },
    { key: 'quantity', header: 'Qty', width: 70 },
    { key: 'lineTotal', header: 'Total', render: (row) => formatPaise(row.lineTotal) },
  ]

  return (
    <>
      <Link to="/orders" className="back-link">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <StatusBadge tone={ORDER_STATUS_TONES[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </StatusBadge>
            {CANCELLABLE.includes(order.status) && (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </button>
            )}
          </>
        }
      />

      <div className="detail-grid">
        <div className="card panel">
          <h2 className="panel__title">Customer</h2>
          <DetailList
            rows={[
              ['Name', order.customerName],
              ['Email', order.customerEmail],
              ['Phone', order.customerPhone],
            ]}
          />
        </div>

        <div className="card panel">
          <h2 className="panel__title">Delivery address</h2>
          <DetailList
            rows={[
              ['Name', address.name],
              ['Phone', address.phone],
              ['Address', [address.line1, address.line2].filter(Boolean).join(', ')],
              ['City', address.city],
              ['State', address.state],
              ['Pincode', address.pincode],
            ]}
          />
        </div>
      </div>

      <div className="card panel panel--flush" style={{ marginBottom: 20 }}>
        <h2 className="panel__title">Items</h2>
        <DataTable columns={itemColumns} rows={order.items} rowKey="productId" />
      </div>

      <div className="detail-grid">
        <div className="card panel">
          <h2 className="panel__title">Amount</h2>
          <DetailList
            rows={[
              ['Subtotal', formatPaise(order.subtotal)],
              [
                'Discount',
                order.discountAmount > 0
                  ? `-${formatPaise(order.discountAmount)}${order.couponCode ? ` (${order.couponCode})` : ''}`
                  : null,
              ],
              ['Shipping', order.shippingFee > 0 ? formatPaise(order.shippingFee) : 'Free'],
              ['Total', <span key="total" className="total-row">{formatPaise(order.totalAmount)}</span>],
            ]}
          />
        </div>

        <div className="card panel">
          <h2 className="panel__title">Payment and refund</h2>
          <DetailList
            rows={[
              ['Paid at', order.paidAt ? formatDateTime(order.paidAt) : null],
              ['Razorpay order', order.razorpayOrderId],
              ['Razorpay payment', order.razorpayPaymentId],
              [
                'Refund',
                order.refundStatus ? (
                  <StatusBadge key="refund" tone={REFUND_TONES[order.refundStatus]}>
                    {REFUND_LABELS[order.refundStatus]}
                    {order.refundAmount != null && ` · ${formatPaise(order.refundAmount)}`}
                  </StatusBadge>
                ) : null,
              ],
              ['Refund ID', order.refundId],
              ['Cancelled at', order.cancelledAt ? formatDateTime(order.cancelledAt) : null],
            ]}
          />
        </div>
      </div>

      {!NO_SHIPMENT.includes(order.status) && (
        <div className="card panel">
          <h2 className="panel__title">Shipment</h2>

          {!shipment && <p className="panel__hint">No shipment has been created for this order yet.</p>}

          {shipment && (
            <DetailList
              rows={[
                [
                  'Status',
                  <StatusBadge key="status" tone={SHIPMENT_STATUS_TONES[shipment.status]}>
                    {shipment.status}
                  </StatusBadge>,
                ],
                ['Courier', shipment.courierName],
                ['AWB', shipment.awbCode],
                ['Tracking', shipment.trackingStatus],
                [
                  'Track parcel',
                  shipment.trackingUrl ? (
                    <a key="track" href={shipment.trackingUrl} target="_blank" rel="noreferrer">
                      Open tracking page
                    </a>
                  ) : null,
                ],
                ['Booking attempts', shipment.attempts],
                ['Next attempt', shipment.nextAttemptAt ? formatDateTime(shipment.nextAttemptAt) : null],
                ['Last error', shipment.lastError],
              ]}
            />
          )}

          {order.status === 'PAID' && shipment?.status !== 'BOOKED' && (
            <div style={{ marginTop: 16 }}>
              <button type="button" className="btn btn--primary" onClick={handleRetry} disabled={busy}>
                {busy ? 'Please wait...' : 'Send to courier now'}
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmCancel}
        title="Cancel this order?"
        message={
          order.status === 'PAID'
            ? `The courier booking will be cancelled and ${formatPaise(order.totalAmount)} will be refunded to the customer through Razorpay. This cannot be undone.`
            : 'This unpaid order will be cancelled and its stock will be released.'
        }
        confirmText="Yes, cancel order"
        danger
        loading={busy}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  )
}