import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createHomeSection, updateHomeSection } from '../../api/homeSectionApi'
import { getErrorMessage } from '../../utils/error'

export default function SectionFormModal({ section, onClose, onSaved }) {
  const isEdit = Boolean(section)
  const [form, setForm] = useState({
    title: section?.title ?? '',
    subtitle: section?.subtitle ?? '',
    layout: section?.layout ?? 'GRID',
    sortOrder: section ? String(section.sortOrder) : '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      layout: form.layout,
      sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateHomeSection(section.id, payload)
        toast.success('Section updated')
      } else {
        await createHomeSection(payload)
        toast.success('Section created. Now choose its products.')
      }
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{isEdit ? 'Edit section' : 'Add section'}</h2>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              placeholder="Cozy corners"
              required
            />
          </label>

          <label className="form__field">
            Subtitle
            <input
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              maxLength={250}
            />
          </label>

          <div className="form__row">
            <label className="form__field">
              Layout
              <select name="layout" value={form.layout} onChange={handleChange}>
                <option value="GRID">Grid</option>
                <option value="SLIDER">Slider</option>
              </select>
            </label>

            <label className="form__field">
              Sort order
              <input
                name="sortOrder"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={handleChange}
                placeholder="0"
              />
              <small>Smaller numbers come first</small>
            </label>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}