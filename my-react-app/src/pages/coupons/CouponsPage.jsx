import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCoupon, getCoupons, setCouponActive } from '../../api/couponApi';
import { formatDateTime } from '../../utils/date';
import { formatPaise } from '../../utils/money';
import { getErrorMessage } from '../../utils/error';
import CouponFormModal from './CouponFormModal';
import './coupons.css';

const getStatus = (coupon) => {
  const now = Date.now();
  if (!coupon.active) return { label: 'Inactive', className: 'badge--grey' };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now)
    return { label: 'Expired', className: 'badge--red' };
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now)
    return { label: 'Scheduled', className: 'badge--yellow' };
  return { label: 'Active', className: 'badge--green' };
};

const formatDiscount = (coupon) =>
  coupon.discountType === 'PERCENT'
    ? `${coupon.discountValue}%${
        coupon.maxDiscountAmount ? ` (max ${formatPaise(coupon.maxDiscountAmount)})` : ''
      }`
    : formatPaise(coupon.discountValue);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, coupon: null });

  const load = useCallback(async () => {
    try {
      setCoupons(await getCoupons());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchCoupons = async () => {
      try {
        const nextCoupons = await getCoupons();
        if (!cancelled) setCoupons(nextCoupons);
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCoupons();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async (coupon) => {
    try {
      const updated = await setCouponActive(coupon.id, !coupon.active);
      setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(updated.active ? 'Coupon activated' : 'Coupon deactivated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast.success('Coupon deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaved = () => {
    setModal({ open: false, coupon: null });
    load();
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>Coupons</h1>
        <button className="btn btn--primary" onClick={() => setModal({ open: true, coupon: null })}>
          <Plus size={16} /> Add coupon
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min order</th>
              <th>Used</th>
              <th>Valid from</th>
              <th>Valid until</th>
              <th>Status</th>
              <th>Enabled</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="table__empty">Loading...</td>
              </tr>
            )}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan={9} className="table__empty">No coupons yet</td>
              </tr>
            )}
            {coupons.map((coupon) => {
              const status = getStatus(coupon);
              return (
                <tr key={coupon.id}>
                  <td>
                    <strong>{coupon.code}</strong>
                    {coupon.description && <div className="table__sub">{coupon.description}</div>}
                  </td>
                  <td>{formatDiscount(coupon)}</td>
                  <td>{coupon.minOrderAmount ? formatPaise(coupon.minOrderAmount) : '—'}</td>
                  <td>
                    {coupon.redeemedCount} / {coupon.usageLimit ?? '∞'}
                    <div className="table__sub">{coupon.perUserLimit} per customer</div>
                  </td>
                  <td>{formatDateTime(coupon.startsAt)}</td>
                  <td>{formatDateTime(coupon.expiresAt)}</td>
                  <td>
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={coupon.active}
                        onChange={() => handleToggle(coupon)}
                      />
                      <span className="switch__slider" />
                    </label>
                  </td>
                  <td className="table__actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => setModal({ open: true, coupon })}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      title="Delete"
                      onClick={() => handleDelete(coupon)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CouponFormModal
          coupon={modal.coupon}
          onClose={() => setModal({ open: false, coupon: null })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}