import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryApi } from '@/api/categoryApi'
import { productApi } from '@/api/productApi'
import PageHeader from '@/components/common/PageHeader'
import ProductStatusCard from '@/pages/products/ProductStatusCard'
import ProductImagesCard from '@/pages/products/ProductImagesCard'
import RelatedProductsCard from '@/pages/products/RelatedProductsCard'
import { paiseToRupees, rupeesToPaise } from '@/utils/money'
import { getErrorMessage } from '@/utils/error'

const emptyForm = {
  name: '',
  categoryId: '',
  description: '',
  price: '',
  mrp: '',
  material: '',
  colour: '',
  size: '',
  careInstructions: '',
  sku: '',
  packedWeightG: '',
  packedLengthCm: '',
  packedBreadthCm: '',
  packedHeightCm: '',
}

// Server product -> form values (prices in rupees)
const toForm = (p) => ({
  name: p.name,
  categoryId: p.categoryId,
  description: p.description,
  price: String(paiseToRupees(p.price)),
  mrp: String(paiseToRupees(p.mrp)),
  material: p.material ?? '',
  colour: p.colour ?? '',
  size: p.size ?? '',
  careInstructions: p.careInstructions ?? '',
  sku: p.sku,
  packedWeightG: String(p.packedWeightG),
  packedLengthCm: String(p.packedLengthCm),
  packedBreadthCm: String(p.packedBreadthCm),
  packedHeightCm: String(p.packedHeightCm),
})

// Form values -> request body (prices in paise)
const toRequest = (f) => ({
  name: f.name.trim(),
  categoryId: f.categoryId,
  description: f.description.trim(),
  price: rupeesToPaise(f.price),
  mrp: rupeesToPaise(f.mrp),
  material: f.material.trim(),
  colour: f.colour.trim(),
  size: f.size.trim(),
  careInstructions: f.careInstructions.trim(),
  sku: f.sku.trim(),
  packedWeightG: Number(f.packedWeightG),
  packedLengthCm: Number(f.packedLengthCm),
  packedBreadthCm: Number(f.packedBreadthCm),
  packedHeightCm: Number(f.packedHeightCm),
})

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [product, setProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    const requests = [categoryApi.list()]
    if (id) requests.push(productApi.get(id))

    Promise.all(requests)
      .then(([categoryList, loaded]) => {
        if (ignore) return
        setCategories(categoryList)
        if (loaded) {
          setProduct(loaded)
          setForm(toForm(loaded))
        }
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
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const bind = (name) => ({ name, value: form[name], onChange: handleChange })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        const updated = await productApi.update(id, toRequest(form))
        setProduct(updated)
        toast.success('Product saved')
      } else {
        const created = await productApi.create(toRequest(form))
        toast.success('Product created. Now add photos, stock and turn it on.')
        navigate(`/products/${created.id}/edit`, { replace: true })
        return
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setSaving(false)
  }

  if (loading) return <p className="text-muted">Loading...</p>

  if (loadError) {
    return (
      <>
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Back to products
        </Link>
        <div className="error-box">{loadError}</div>
      </>
    )
  }

  return (
    <>
      <Link to="/products" className="back-link">
        <ArrowLeft size={16} /> Back to products
      </Link>
      <PageHeader title={isEdit ? 'Edit product' : 'Add product'} subtitle={isEdit ? product?.sku : undefined} />

      <form className="card panel" onSubmit={handleSubmit}>
        <h2 className="panel__title">Product details</h2>
        <p className="panel__hint">Prices are in rupees. Packed size is used for shipping.</p>

        <div className="form-grid">
          <label className="field field--full">
            <span className="field__label">Name</span>
            <input className="input" maxLength={200} required {...bind('name')} />
          </label>

          <label className="field">
            <span className="field__label">Category</span>
            <select className="input" required {...bind('categoryId')}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.active ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">SKU</span>
            <input className="input" maxLength={50} required {...bind('sku')} />
          </label>

          <label className="field field--full">
            <span className="field__label">Description</span>
            <textarea className="input" maxLength={5000} required {...bind('description')} />
          </label>

          <label className="field">
            <span className="field__label">Selling price (₹)</span>
            <input className="input" type="number" min="0.01" step="0.01" required {...bind('price')} />
          </label>

          <label className="field">
            <span className="field__label">MRP (₹)</span>
            <input className="input" type="number" min="0.01" step="0.01" required {...bind('mrp')} />
          </label>

          <label className="field">
            <span className="field__label">Material</span>
            <input className="input" maxLength={150} {...bind('material')} />
          </label>

          <label className="field">
            <span className="field__label">Colour</span>
            <input className="input" maxLength={150} {...bind('colour')} />
          </label>

          <label className="field">
            <span className="field__label">Size</span>
            <input className="input" maxLength={100} {...bind('size')} />
          </label>

          <label className="field">
            <span className="field__label">Care instructions</span>
            <input className="input" maxLength={255} {...bind('careInstructions')} />
          </label>

          <label className="field">
            <span className="field__label">Packed weight (g)</span>
            <input className="input" type="number" min="1" step="1" required {...bind('packedWeightG')} />
          </label>

          <label className="field">
            <span className="field__label">Packed length (cm)</span>
            <input className="input" type="number" min="1" step="1" required {...bind('packedLengthCm')} />
          </label>

          <label className="field">
            <span className="field__label">Packed breadth (cm)</span>
            <input className="input" type="number" min="1" step="1" required {...bind('packedBreadthCm')} />
          </label>

          <label className="field">
            <span className="field__label">Packed height (cm)</span>
            <input className="input" type="number" min="1" step="1" required {...bind('packedHeightCm')} />
          </label>
        </div>

        <div className="form-actions">
          <Link to="/products" className="btn">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>

      {isEdit && product && (
        <>
          <ProductStatusCard product={product} onChange={setProduct} />
          <ProductImagesCard productId={product.id} initialImages={product.images} />
          <RelatedProductsCard product={product} />
        </>
      )}
    </>
  )
}