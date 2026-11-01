import { useState } from 'react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/productApi'
import Switch from '@/components/common/Switch'
import { getErrorMessage } from '@/utils/error'

export default function ProductStatusCard({ product, onChange }) {
  const [stock, setStock] = useState(String(product.stockQuantity))
  const [busy, setBusy] = useState(false)

  const run = async (action, successMessage) => {
    setBusy(true)
    try {
      onChange(await action())
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card panel">
      <h2 className="panel__title">Status and stock</h2>
      <p className="panel__hint">Customers see the product only when Active is on.</p>

      <div className="cell-actions" style={{ gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Switch
          label="Active"
          checked={product.active}
          disabled={busy}
          onChange={(checked) => run(() => productApi.setActive(product.id, checked))}
        />
        <Switch
          label="Featured on home page"
          checked={product.featured}
          disabled={busy}
          onChange={(checked) => run(() => productApi.setFeatured(product.id, checked))}
        />

        <div className="cell-actions" style={{ alignItems: 'flex-end' }}>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field__label">Stock quantity</span>
            <input
              className="input"
              style={{ width: 140 }}
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn"
            disabled={busy || stock === ''}
            onClick={() => run(() => productApi.setStock(product.id, Number(stock)), 'Stock updated')}
          >
            Update stock
          </button>
        </div>
      </div>
    </div>
  )
}