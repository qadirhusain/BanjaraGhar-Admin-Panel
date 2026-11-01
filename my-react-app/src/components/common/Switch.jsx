export default function Switch({ checked, onChange, disabled = false, label }) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch__track" />
      {label && <span className="switch__label">{label}</span>}
    </label>
  )
}