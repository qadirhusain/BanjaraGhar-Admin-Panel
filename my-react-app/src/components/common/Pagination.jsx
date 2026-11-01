// page is 0-based, like the backend
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn--sm"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="pagination__info">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn--sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}