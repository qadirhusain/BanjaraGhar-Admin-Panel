import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBanner, getCategories, updateBanner } from '../../api/bannerApi'
import { toInputValue, toIso } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'
import ImageUpload from './ImageUpload'

const buildInitialForm = (banner) => {
  if (!banner) {
    return {
      title: '',
      subtitle: '',
      buttonText: '',
      linkUrl: '',
      imageUrl: '',
      mobileImageUrl: '',
      placement: 'HOME',
      categoryId: '',
      sortOrder: '',
      startsAt: '',
      endsAt: '',
    }
  }
  return {
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    buttonText: banner.buttonText || '',
    linkUrl: banner.linkUrl || '',
    imageUrl: banner.imageUrl,
    mobileImageUrl: banner.mobileImageUrl || '',
    placement: banner.placement,
    categoryId: banner.categoryId || '',
    sortOrder: String(banner.sortOrder),
    startsAt: toInputValue(banner.startsAt),
    endsAt: toInputValue(banner.endsAt),
  }
}

const blankToNull = (value) => (value.trim() ? value.trim() : null)

export default function BannerFormModal({ banner, onClose, onSaved }) {
  const isEdit = Boolean(banner)
  const [form, setForm] = useState(() => buildInitialForm(banner))
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => toast.error(getErrorMessage(error)))
  }, [])

  const isCategoryBanner = form.placement === 'CATEGORY'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.imageUrl) {
      toast.error('Please upload a banner image')
      return
    }

    const payload = {
      title: blankToNull(form.title),
      subtitle: blankToNull(form.subtitle),
      buttonText: blankToNull(form.buttonText),
      linkUrl: blankToNull(form.linkUrl),
      imageUrl: form.imageUrl,
      mobileImageUrl: form.mobileImageUrl || null,
      placement: form.placement,
      categoryId: isCategoryBanner ? form.categoryId || null : null,
      sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
      startsAt: toIso(form.startsAt),
      endsAt: toIso(form.endsAt),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateBanner(banner.id, payload)
        toast.success('Banner updated')
      } else {
        await createBanner(payload)
        toast.success('Banner created')
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
          <h2>{isEdit ? 'Edit banner' : 'Add banner'}</h2>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form__row">
            <ImageUpload
              label="Banner image"
              required
              value={form.imageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
            />
            <ImageUpload
              label="Mobile image (optional)"
              value={form.mobileImageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, mobileImageUrl: url }))}
            />
          </div>

          <div className="form__row">
            <label className="form__field">
              Title
              <input name="title" value={form.title} onChange={handleChange} maxLength={150} />
            </label>
            <label className="form__field">
              Subtitle
              <input name="subtitle" value={form.subtitle} onChange={handleChange} maxLength={250} />
            </label>
          </div>

          <div className="form__row">
            <label className="form__field">
              Button text
              <input
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                maxLength={40}
                placeholder="Shop now"
              />
            </label>
            <label className="form__field">
              Link
              <input
                name="linkUrl"
                value={form.linkUrl}
                onChange={handleChange}
                maxLength={500}
                placeholder="/shop or /category/home-decor"
              />
            </label>
          </div>

          <div className="form__row">
            <label className="form__field">
              Placement
              <select name="placement" value={form.placement} onChange={handleChange}>
                <option value="HOME">Home page</option>
                <option value="CATEGORY">Category page</option>
              </select>
            </label>

            {isCategoryBanner && (
              <label className="form__field">
                Category
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

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

          <div className="form__row">
            <label className="form__field">
              Show from
              <input
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={handleChange}
              />
            </label>
            <label className="form__field">
              Show until
              <input
                name="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={handleChange}
              />
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