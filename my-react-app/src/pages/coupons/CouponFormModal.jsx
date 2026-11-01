import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createCoupon, updateCoupon } from "../../api/couponApi";
import { toInputValue, toIso } from "../../utils/date";
import { paiseToRupees, rupeesToPaise } from "../../utils/money";
import { getErrorMessage } from "../../utils/error";

const buildInitialForm = (coupon) => {
  if (!coupon) {
    return {
      code: "",
      description: "",
      discountType: "PERCENT",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      usageLimit: "",
      perUserLimit: "1",
      startsAt: "",
      expiresAt: "",
    };
  }

  const isPercent = coupon.discountType === "PERCENT";
  return {
    code: coupon.code,
    description: coupon.description || "",
    discountType: coupon.discountType,
    discountValue: isPercent
      ? String(coupon.discountValue)
      : String(paiseToRupees(coupon.discountValue)),
    maxDiscountAmount: coupon.maxDiscountAmount
      ? String(paiseToRupees(coupon.maxDiscountAmount))
      : "",
    minOrderAmount: coupon.minOrderAmount
      ? String(paiseToRupees(coupon.minOrderAmount))
      : "",
    usageLimit: coupon.usageLimit ?? "",
    perUserLimit: String(coupon.perUserLimit),
    startsAt: toInputValue(coupon.startsAt),
    expiresAt: toInputValue(coupon.expiresAt),
  };
};

export default function CouponFormModal({ coupon, onClose, onSaved }) {
  const isEdit = Boolean(coupon);
  const [form, setForm] = useState(() => buildInitialForm(coupon));
  const [saving, setSaving] = useState(false);

  const isPercent = form.discountType === "PERCENT";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: form.code.trim(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      discountValue: isPercent
        ? Number(form.discountValue)
        : rupeesToPaise(form.discountValue),
      maxDiscountAmount:
        isPercent && form.maxDiscountAmount
          ? rupeesToPaise(form.maxDiscountAmount)
          : null,
      minOrderAmount: form.minOrderAmount
        ? rupeesToPaise(form.minOrderAmount)
        : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      startsAt: toIso(form.startsAt),
      expiresAt: toIso(form.expiresAt),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateCoupon(coupon.id, payload);
        toast.success("Coupon updated");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created");
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{isEdit ? "Edit coupon" : "Add coupon"}</h2>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form__row">
            <label className="form__field">
              Code
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                disabled={isEdit}
                placeholder="WELCOME10"
                required
              />
              {isEdit && <small>Code cannot be changed</small>}
            </label>

            <label className="form__field">
              Discount type
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Flat amount (₹)</option>
              </select>
            </label>
          </div>

          <label className="form__field">
            Description
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={200}
              placeholder="10% off on your first order"
            />
          </label>

          <div className="form__row">
            <label className="form__field">
              {isPercent ? "Discount (%)" : "Discount (₹)"}
              <input
                name="discountValue"
                type="number"
                min="1"
                max={isPercent ? 100 : undefined}
                step={isPercent ? "1" : "0.01"}
                value={form.discountValue}
                onChange={handleChange}
                required
              />
            </label>

            {isPercent && (
              <label className="form__field">
                Maximum discount (₹)
                <input
                  name="maxDiscountAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.maxDiscountAmount}
                  onChange={handleChange}
                  placeholder="No cap"
                />
              </label>
            )}
          </div>

          <div className="form__row">
            <label className="form__field">
              Minimum order (₹)
              <input
                name="minOrderAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="No minimum"
              />
            </label>

            <label className="form__field">
              Total usage limit
              <input
                name="usageLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited"
              />
            </label>

            <label className="form__field">
              Per customer limit
              <input
                name="perUserLimit"
                type="number"
                min="1"
                value={form.perUserLimit}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form__row">
            <label className="form__field">
              Valid from
              <input
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={handleChange}
              />
            </label>

            <label className="form__field">
              Valid until
              <input
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
