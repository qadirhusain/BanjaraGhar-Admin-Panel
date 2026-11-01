import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllProducts, setHomeSectionProducts } from '../../api/homeSectionApi'
import { getErrorMessage } from '../../utils/error'
import { formatPaise } from '../../utils/money'
import { imageUrl } from '../../utils/image'

const MAX_PRODUCTS = 20

export default function SectionProductsModal({ section, onClose, onSaved }) {
  const [products, setProducts] = useState([])
  const [selectedIds, setSelectedIds] = useState(section.productIds)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [])

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const available = products.filter(
    (p) => !selectedIds.includes(p.id) && p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const add = (id) => setSelectedIds((prev) => [...prev, id])

  const remove = (id) => setSelectedIds((prev) => prev.filter((x) => x !== id))

  const move = (index, direction) => {
    setSelectedIds((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const item = next[index]
      next[index] = next[target]
      next[target] = item
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setHomeSectionProducts(section.id, selectedIds)
      toast.success('Products saved')
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Products in "{section.title}"</h2>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="picker">
          <div className="picker__column">
            <h3>
              Selected ({selectedIds.length}/{MAX_PRODUCTS})
            </h3>
            {selectedIds.length === 0 && <p className="table__sub">No products selected</p>}
            {selectedIds.map((id, index) => {
              const product = productsById.get(id)
              return (
                <div className="picker__item" key={id}>
                  <img src={imageUrl(product?.imageUrl)} alt="" />
                  <span className="picker__name">{product?.name ?? 'Loading...'}</span>
                  <button
                    className="icon-btn"
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    disabled={index === selectedIds.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    type="button"
                    onClick={() => remove(id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="picker__column">
            <h3>All products</h3>
            <input
              className="picker__search"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {available.map((product) => (
              <div className="picker__item" key={product.id}>
                <img src={imageUrl(product.imageUrl)} alt="" />
                <span className="picker__name">
                  {product.name}
                  <small>
                    {formatPaise(product.price)}
                    {!product.active && ' · Inactive'}
                  </small>
                </span>
                <button
                  className="icon-btn"
                  type="button"
                  disabled={selectedIds.length >= MAX_PRODUCTS}
                  onClick={() => add(product.id)}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save products'}
          </button>
        </div>
      </div>
    </div>
  )
}