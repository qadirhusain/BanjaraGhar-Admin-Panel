import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getShippingSettings, updateShippingSettings } from '../../api/settingsApi';
import { paiseToRupees, rupeesToPaise } from '../../utils/money';
import { getErrorMessage } from '../../utils/error';

export default function SettingsPage() {
  const [form, setForm] = useState({ flatFee: '', freeAbove: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getShippingSettings();
        setForm({
          flatFee: paiseToRupees(data.flatFee),
          freeAbove: paiseToRupees(data.freeAbove),
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShippingSettings({
        flatFee: rupeesToPaise(form.flatFee),
        freeAbove: rupeesToPaise(form.freeAbove),
      });
      toast.success('Shipping settings saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="page__header">
        <h1>Settings</h1>
      </div>

      <form className="form" style={{ maxWidth: 420 }} onSubmit={handleSubmit}>
        <h2>Shipping</h2>

        <label className="form__field">
          Flat shipping fee (₹)
          <input
            name="flatFee"
            type="number"
            min="0"
            step="0.01"
            value={form.flatFee}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form__field">
          Free shipping above (₹)
          <input
            name="freeAbove"
            type="number"
            min="0"
            step="0.01"
            value={form.freeAbove}
            onChange={handleChange}
            required
          />
          <small>Orders above this amount get free shipping</small>
        </label>

        <div>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}