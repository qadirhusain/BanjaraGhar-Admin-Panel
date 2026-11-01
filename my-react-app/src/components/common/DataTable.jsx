// columns: [{ key, header, render?: (row) => node, width?, align? }]
export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyText = "Nothing to show yet",
  rowKey = "id",
}) {
  return (
    <div className="card data-table">
      <div className="data-table__scroll">
        <table className="data-table__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="data-table__message">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__message">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ textAlign: col.align }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
