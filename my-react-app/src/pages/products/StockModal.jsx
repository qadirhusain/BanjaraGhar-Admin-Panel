import { useState } from 'react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/productApi'
import Modal from '@/components/common/Modal'
import { getErrorMessage } from '@/utils/error'

export default function StockModal({ product, onClose, onSaved }) {
  const [quantity, setQuantity] = useState(String(product.stockQuantity))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await productApi.setStock(product.id, Number(quantity))
      toast.success('Stock updated')
      onSaved(updated.stockQuantity)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title="Update stock"
      onClose={onClose}
      width={380}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="stock-form" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <form id="stock-form" onSubmit={handleSubmit}>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          {product.name}
        </p>
        <label className="field">
          <span className="field__label">Quantity in stock</span>
          <input
            className="input"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            autoFocus
          />
        </label>
      </form>
    </Modal>
  )
}