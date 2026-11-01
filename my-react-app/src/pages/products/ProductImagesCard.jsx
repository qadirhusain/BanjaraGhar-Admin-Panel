import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/productApi'
import ConfirmModal from '@/components/common/ConfirmModal'
import { imageUrl } from '@/utils/image'
import { getErrorMessage } from '@/utils/error'

const MAX_IMAGES = 8
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export default function ProductImagesCard({ productId, initialImages }) {
  const [images, setImages] = useState(initialImages)
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const room = MAX_IMAGES - images.length
    if (files.length > room) {
      toast.error(`You can add ${room} more image(s). Only the first ${room} will be uploaded.`)
    }

    setBusy(true)
    for (const file of files.slice(0, room)) {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 5 MB`)
        continue
      }
      try {
        const saved = await productApi.uploadImage(productId, file)
        setImages((current) => [...current, saved])
      } catch (err) {
        toast.error(getErrorMessage(err))
        break
      }
    }
    setBusy(false)
  }

  const move = async (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]

    setBusy(true)
    try {
      setImages(await productApi.reorderImages(productId, next.map((image) => image.id)))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await productApi.deleteImage(productId, deleting.id)
      setImages((current) => current.filter((image) => image.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card panel">
      <h2 className="panel__title">Photos</h2>
      <p className="panel__hint">
        The first photo is the main one. JPG, PNG or WebP, up to 5 MB each, max {MAX_IMAGES} photos.
      </p>

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image, index) => (
            <div key={image.id} className="image-tile">
              {index === 0 && <span className="image-tile__badge">Main</span>}
              <img className="image-tile__img" src={imageUrl(image.url)} alt="" />
              <div className="image-tile__bar">
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Move left"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={busy || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move right"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={busy}
                  onClick={() => setDeleting(image)}
                  aria-label="Delete photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <label className="btn" style={{ marginTop: images.length > 0 ? 16 : 0 }}>
          {busy ? 'Please wait...' : 'Add photos'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            disabled={busy}
            onChange={handleFiles}
          />
        </label>
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Delete photo?"
        message="This photo will be removed from the product."
        confirmText="Delete"
        danger
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}