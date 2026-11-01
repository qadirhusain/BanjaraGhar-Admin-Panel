import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryApi } from '@/api/categoryApi'
import { uploadApi } from '@/api/uploadApi'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import Switch from '@/components/common/Switch'
import { imageUrl } from '@/utils/image'
import { getErrorMessage } from '@/utils/error'

export default function CategoriesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState(null)
  // null = form closed, {} = new category, a category = editing it
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let ignore = false
    categoryApi
      .list()
      .then((data) => {
        if (!ignore) setRows(data)
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
  }, [reloadKey])

  const toggleActive = async (category, active) => {
    setBusyId(category.id)
    try {
      const updated = await categoryApi.setActive(category.id, active)
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const handleSaved = () => {
    setEditing(null)
    setReloadKey((key) => key + 1)
  }

  const columns = [
    {
      key: 'image',
      header: '',
      width: 70,
      render: (row) =>
        row.image ? (
          <img className="thumb" src={imageUrl(row.image)} alt="" />
        ) : (
          <div className="thumb" />
        ),
    },
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug', render: (row) => <span className="text-muted">{row.slug}</span> },
    { key: 'sortOrder', header: 'Order', width: 80 },
    {
      key: 'active',
      header: 'Active',
      width: 100,
      render: (row) => (
        <Switch
          checked={row.active}
          disabled={busyId === row.id}
          onChange={(checked) => toggleActive(row, checked)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 90,
      align: 'right',
      render: (row) => (
        <button type="button" className="btn btn--sm" onClick={() => setEditing(row)}>
          Edit
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Smaller order number shows first on the website"
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
            <Plus size={16} />
            Add category
          </button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText='No categories yet. Click "Add category".'
      />

      {editing && (
        <CategoryFormModal
          key={editing.id ?? 'new'}
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = Boolean(category.id)
  const [form, setForm] = useState({
    name: category.name ?? '',
    description: category.description ?? '',
    sortOrder: String(category.sortOrder ?? 0),
    image: category.image ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadApi.uploadImage(file)
      setForm((current) => ({ ...current, image: url }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
      sortOrder: Number(form.sortOrder) || 0,
    }
    try {
      if (isEdit) {
        await categoryApi.update(category.id, body)
      } else {
        await categoryApi.create(body)
      }
      toast.success(isEdit ? 'Category saved' : 'Category added')
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={isEdit ? 'Edit category' : 'Add category'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            className="btn btn--primary"
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Description</span>
          <textarea
            className="input"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
          />
        </label>

        <label className="field">
          <span className="field__label">Sort order</span>
          <input
            className="input"
            type="number"
            min="0"
            name="sortOrder"
            value={form.sortOrder}
            onChange={handleChange}
          />
        </label>

        <div className="field">
          <span className="field__label">Image</span>
          {form.image && (
            <img className="thumb" style={{ width: 90, height: 90 }} src={imageUrl(form.image)} alt="" />
          )}
          <div className="cell-actions">
            <label className="btn btn--sm">
              {uploading ? 'Uploading...' : form.image ? 'Change image' : 'Upload image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                disabled={uploading}
                hidden
              />
            </label>
            {form.image && (
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setForm({ ...form, image: '' })}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}