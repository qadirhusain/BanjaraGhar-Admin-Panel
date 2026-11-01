import { useState } from 'react'
import toast from 'react-hot-toast'
import { returnApi } from '@/api/returnApi'
import Modal from '@/components/common/Modal'
import DetailList from '@/components/common/DetailList'
import StatusBadge from '@/components/common/StatusBadge'
import { RETURN_STATUS_LABELS, RETURN_STATUS_TONES } from '@/utils/statusMeta'
import { formatPaise, paiseToRupees, rupeesToPaise } from '@/utils/money'
import { formatDateTime } from '@/utils/date'
import { imageUrl } from '@/utils/image'
import { getErrorMessage } from '@/utils/error'
import '@/pages/orders/orders.css'

export default function ReturnReviewModal({ item, onClose, onDecided }) {
  const pending = item.status === 'REQUESTED'
  const [mode, setMode] = useState(null) // null | 'approve' | 'reject'
  const [amount, setAmount] = useState(String(paiseToRupees(item.orderTotal)))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === 'approve') {
        const updated = await returnApi.approve(item.id, {
          refundAmount: rupeesToPaise(amount),
          note: note.trim(),
        })
        if (updated.returnAwb) {
          toast.success('Return approved. Refund started and pickup booked.')
        } else {
          toast.success('Return approved and refund started.')
          toast('The return pickup was not booked automatically. Book it in the Shiprocket panel.', {
            duration: 9000,
          })
        }
        onDecided(updated)
      } else {
        const updated = await returnApi.reject(item.id, { note: note.trim() })
        toast.success('Return rejected')
        onDecided(updated)
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
      setSaving(false)
    }
  }

  const footer = !pending ? (
    <button type="button" className="btn" onClick={onClose}>
      Close
    </button>
  ) : mode === null ? (
    <>
      <button type="button" className="btn" onClick={onClose}>
        Close
      </button>
      <button type="button" className="btn btn--danger" onClick={() => setMode('reject')}>
        Reject
      </button>
      <button type="button" className="btn btn--primary" onClick={() => setMode('approve')}>
        Approve
      </button>
    </>
  ) : (
    <>
      <button type="button" className="btn" onClick={() => setMode(null)} disabled={saving}>
        Back
      </button>
      <button
        type="submit"
        form="return-decision-form"
        className={`btn ${mode === 'approve' ? 'btn--primary' : 'btn--danger'}`}
        disabled={saving}
      >
        {saving ? 'Please wait...' : mode === 'approve' ? 'Approve and refund' : 'Reject return'}
      </button>
    </>
  )

  return (
    <Modal open title={`Return for ${item.orderNumber}`} onClose={onClose} width={600} footer={footer}>
      <DetailList
        rows={[
          ['Customer', `${item.customerName} (${item.customerEmail})`],
          ['Order total', formatPaise(item.orderTotal)],
          ['Requested', formatDateTime(item.createdAt)],
          [
            'Status',
            <StatusBadge key="status" tone={RETURN_STATUS_TONES[item.status]}>
              {RETURN_STATUS_LABELS[item.status]}
            </StatusBadge>,
          ],
          ['Refund amount', item.refundAmount != null ? formatPaise(item.refundAmount) : null],
          ['Decided', item.decidedAt ? formatDateTime(item.decidedAt) : null],
          ['Your note', item.adminNote],
          ['Return AWB', item.returnAwb],
        ]}
      />

      <h3 style={{ margin: '16px 0 8px' }}>Customer&apos;s reason</h3>
      <div className="reason-box">{item.reason}</div>

      <h3 style={{ marginBottom: 8 }}>Photos</h3>
      <div className="photo-row">
        {item.photoUrls.map((url) => (
          <a key={url} href={imageUrl(url)} target="_blank" rel="noreferrer">
            <img className="photo-row__img" src={imageUrl(url)} alt="Return proof" />
          </a>
        ))}
      </div>

      {pending && mode && (
        <form id="return-decision-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {mode === 'approve' ? (
            <>
              <label className="field">
                <span className="field__label">Refund amount (₹)</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={paiseToRupees(item.orderTotal)}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Note for the customer (optional)</span>
                <textarea
                  className="input"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="notice">
                This refunds the customer through Razorpay right away and cannot be undone.
              </div>
            </>
          ) : (
            <label className="field">
              <span className="field__label">Reason for rejecting (the customer will see this)</span>
              <textarea
                className="input"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
            </label>
          )}
        </form>
      )}
    </Modal>
  )
}