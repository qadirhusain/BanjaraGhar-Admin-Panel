import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/productApi'
import { getErrorMessage } from '@/utils/error'

const MAX_RELATED = 4

export default function RelatedProductsCard({ product }) {
  const [allProducts, setAllProducts] = useState([])
  const [selected, setSelected] = useState(product.relatedProductIds)
  const [choice, setChoice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    // The shop has fewer than 50 products, so one page is enough
    productApi
      .list(0, 50)
      .then((result) => {
        if (!ignore) setAllProducts(result.content)
      })
      .catch((err) => {
        if (!ignore) toast.error(getErrorMessage(err))
      })
    return () => {
      ignore = true
    }
  }, [])

  const nameOf = (id) => allProducts.find((p) => p.id === id)?.name ?? 'Unknown product'
  const options = allProducts.filter((p) => p.id !== product.id && !selected.includes(p.id))

  const add = () => {
    if (!choice) return
    setSelected([...selected, choice])
    setChoice('')
  }

  const remove = (id) => setSelected(selected.filter((x) => x !== id))

  const save = async () => {
    setSaving(true)
    try {
      await productApi.setRelated(product.id, selected)
      toast.success('Related products saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card panel">
      <h2 className="panel__title">Related products</h2>
      <p className="panel__hint">
        Shown first under &quot;You may also like&quot;. Pick up to {MAX_RELATED}; the rest are filled
        automatically from the same category.
      </p>

      {selected.length > 0 && (
        <ul className="related-list">
          {selected.map((id) => (
            <li key={id} className="related-list__item">
              <span>{nameOf(id)}</span>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => remove(id)}
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected.length < MAX_RELATED && (
        <div className="cell-actions" style={{ marginBottom: 16 }}>
          <select
            className="input"
            style={{ maxWidth: 320 }}
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">Select a product</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn" onClick={add} disabled={!choice}>
            Add
          </button>
        </div>
      )}

      <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save related products'}
      </button>
    </div>
  )
}