/**
 * Skeleton Loader Component
 * Used for loading states in tables/lists
 */

export function SkeletonRow({ columns = 6 }: { columns?: number }) {
  return (
    <tr style={{ height: '48px' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '8px' }}>
          <div
            style={{
              height: '16px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.7,
            }}
          />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 3, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} columns={columns} />
        ))}
      </tbody>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </table>
  )
}
