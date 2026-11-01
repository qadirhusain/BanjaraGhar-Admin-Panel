import Modal from '@/components/common/Modal'

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}