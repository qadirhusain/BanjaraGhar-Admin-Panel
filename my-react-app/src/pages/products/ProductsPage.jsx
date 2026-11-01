import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/productApi'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import Pagination from '@/components/common/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import Switch from '@/components/common/Switch'
import StockModal from '@/pages/products/StockModal'
import { formatPaise } from '@/utils/money'
import { imageUrl } from '@/utils/image'
import { getErrorMessage } from '@/utils/error'

const PAGE_SIZE = 20
const LOW_STOCK = 5

function StockCell({ quantity }) {
  if (quantity === 0) return <StatusBadge tone="danger">Out of stock</StatusBadge>
  if (quantity <= LOW_STOCK) return <StatusBadge tone="warning">{quantity} left</StatusBadge>
  return <span>{quantity}</span>
}

export default function ProductsPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [stockProduct, setStockProduct] = useState(null)

  useEffect(() => {
    let ignore = false
    productApi
      .list(page, PAGE_SIZE)
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
  }, [page])

  const changePage = (next) => {
    setLoading(true)
    setPage(next)
  }

  const patchRow = (id, changes) =>
    setData((current) => ({
      ...current,
      content: current.content.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    }))

  // field is "active" or "featured"; the server sends the updated product back
  const toggle = async (product, field, action) => {
    setBusyId(product.id)
    try {
      const updated = await action()
      patchRow(product.id, { [field]: updated[field] })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
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
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="cell-stack">
          <strong>{row.name}</strong>
          <span className="text-muted">{row.sku}</span>
        </div>
      ),
    },
    { key: 'categoryName', header: 'Category' },
    { key: 'price', header: 'Price', render: (row) => formatPaise(row.price) },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => <StockCell quantity={row.stockQuantity} />,
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (row) => (
        <Switch
          checked={row.featured}
          disabled={busyId === row.id}
          onChange={(checked) =>
            toggle(row, 'featured', () => productApi.setFeatured(row.id, checked))
          }
        />
      ),
    },
    {
      key: 'active',
      header: 'Active',
      render: (row) => (
        <Switch
          checked={row.active}
          disabled={busyId === row.id}
          onChange={(checked) => toggle(row, 'active', () => productApi.setActive(row.id, checked))}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="cell-actions" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--sm" onClick={() => setStockProduct(row)}>
            Stock
          </button>
          <Link to={`/products/${row.id}/edit`} className="btn btn--sm">
            Edit
          </Link>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="New products stay hidden until you add photos, set stock and turn Active on"
        actions={
          <Link to="/products/new" className="btn btn--primary">
            <Plus size={16} />
            Add product
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={data.content}
        loading={loading}
        emptyText='No products yet. Click "Add product".'
      />
      <Pagination page={page} totalPages={data.totalPages} onChange={changePage} />

      {stockProduct && (
        <StockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
          onSaved={(quantity) => {
            patchRow(stockProduct.id, { stockQuantity: quantity })
            setStockProduct(null)
          }}
        />
      )}
    </>
  )
}