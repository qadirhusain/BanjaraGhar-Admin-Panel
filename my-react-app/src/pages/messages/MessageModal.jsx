import { Mail, X } from 'lucide-react'
import { formatDateTime } from '../../utils/date'

export default function MessageModal({ message, onClose, onChangeStatus }) {
  const replyLink = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{message.subject}</h2>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <p className="table__sub">
          {message.name} · {message.email} · {formatDateTime(message.createdAt)}
        </p>

        <div className="message-body">{message.message}</div>

        <div className="modal__footer">
          <select
            value={message.status}
            onChange={(e) => onChangeStatus(message, e.target.value)}
          >
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <a className="btn btn--primary" href={replyLink}>
            <Mail size={16} /> Reply by email
          </a>
        </div>
      </div>
    </div>
  )
}