import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteBanner, getBanners, setBannerActive } from '../../api/bannerApi'
import { formatDateTime } from '../../utils/date'
import { getErrorMessage } from '../../utils/error'
import { imageUrl } from '../../utils/image'
import BannerFormModal from './BannerFormModal'
import './banners.css'

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [placement, setPlacement] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, banner: null })

  const load = useCallback(async () => {
    try {
      setBanners(await getBanners(placement))
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [placement])

  useEffect(() => {
    let ignore = false

    getBanners(placement)
      .then((result) => {
        if (!ignore) setBanners(result)
      })
      .catch((error) => {
        if (!ignore) toast.error(getErrorMessage(error))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [placement])

  const handleToggle = async (banner) => {
    try {
      const updated = await setBannerActive(banner.id, !banner.active)
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      toast.success(updated.active ? 'Banner activated' : 'Banner deactivated')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async (banner) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await deleteBanner(banner.id)
      setBanners((prev) => prev.filter((b) => b.id !== banner.id))
      toast.success('Banner deleted')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleSaved = () => {
    setModal({ open: false, banner: null })
    load()
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Banners</h1>
        <div className="page__actions">
          <select value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="">All placements</option>
            <option value="HOME">Home page</option>
            <option value="CATEGORY">Category pages</option>
          </select>
          <button className="btn btn--primary" onClick={() => setModal({ open: true, banner: null })}>
            <Plus size={16} /> Add banner
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Placement</th>
              <th>Order</th>
              <th>Shown from</th>
              <th>Shown until</th>
              <th>Enabled</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && banners.length === 0 && (
              <tr>
                <td colSpan={8} className="table__empty">No banners yet</td>
              </tr>
            )}
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>
                  <img className="banner-thumb" src={imageUrl(banner.imageUrl)} alt="" />
                </td>
                <td>
                  <strong>{banner.title || '(no title)'}</strong>
                  {banner.subtitle && <div className="table__sub">{banner.subtitle}</div>}
                </td>
                <td>
                  {banner.placement === 'HOME' ? 'Home page' : `Category: ${banner.categoryName}`}
                </td>
                <td>{banner.sortOrder}</td>
                <td>{formatDateTime(banner.startsAt)}</td>
                <td>{formatDateTime(banner.endsAt)}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={banner.active}
                      onChange={() => handleToggle(banner)}
                    />
                    <span className="switch__slider" />
                  </label>
                </td>
                <td className="table__actions">
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => setModal({ open: true, banner })}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    title="Delete"
                    onClick={() => handleDelete(banner)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <BannerFormModal
          banner={modal.banner}
          onClose={() => setModal({ open: false, banner: null })}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}