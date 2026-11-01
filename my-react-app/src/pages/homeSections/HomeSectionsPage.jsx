import { useCallback, useEffect, useState } from 'react'
import { ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  deleteHomeSection,
  getHomeSections,
  setHomeSectionActive,
} from '../../api/homeSectionApi'
import { getErrorMessage } from '../../utils/error'
import SectionFormModal from './SectionFormModal'
import SectionProductsModal from './SectionProductModal'
import './homeSections.css'

export default function HomeSectionsPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState({ open: false, section: null })
  const [productsModal, setProductsModal] = useState(null)

  const load = useCallback(async () => {
    try {
      setSections(await getHomeSections())
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const handleToggle = async (section) => {
    try {
      const updated = await setHomeSectionActive(section.id, !section.active)
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      toast.success(updated.active ? 'Section activated' : 'Section deactivated')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async (section) => {
    if (!window.confirm(`Delete section "${section.title}"?`)) return
    try {
      await deleteHomeSection(section.id)
      setSections((prev) => prev.filter((s) => s.id !== section.id))
      toast.success('Section deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleSaved = () => {
    setFormModal({ open: false, section: null })
    setProductsModal(null)
    load()
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Home sections</h1>
        <button className="btn btn--primary" onClick={() => setFormModal({ open: true, section: null })}>
          <Plus size={16} /> Add section
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Layout</th>
              <th>Order</th>
              <th>Products</th>
              <th>Enabled</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && sections.length === 0 && (
              <tr>
                <td colSpan={6} className="table__empty">No sections yet</td>
              </tr>
            )}
            {sections.map((section) => (
              <tr key={section.id}>
                <td>
                  <strong>{section.title}</strong>
                  {section.subtitle && <div className="table__sub">{section.subtitle}</div>}
                </td>
                <td>{section.layout === 'GRID' ? 'Grid' : 'Slider'}</td>
                <td>{section.sortOrder}</td>
                <td>{section.productIds.length}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={section.active}
                      onChange={() => handleToggle(section)}
                    />
                    <span className="switch__slider" />
                  </label>
                </td>
                <td className="table__actions">
                  <button
                    className="icon-btn"
                    title="Choose products"
                    onClick={() => setProductsModal(section)}
                  >
                    <ListPlus size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => setFormModal({ open: true, section })}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    title="Delete"
                    onClick={() => handleDelete(section)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formModal.open && (
        <SectionFormModal
          section={formModal.section}
          onClose={() => setFormModal({ open: false, section: null })}
          onSaved={handleSaved}
        />
      )}

      {productsModal && (
        <SectionProductsModal
          section={productsModal}
          onClose={() => setProductsModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}