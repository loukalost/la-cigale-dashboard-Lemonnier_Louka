/**
 * Empty State Component
 * Displayed when no data available
 */

interface EmptyStateProps {
  title?: string
  message: string
  cta?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title = 'Aucune réservation', message, cta }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: '#6B7280',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
        {title}
      </h2>
      <p style={{ fontSize: '14px', marginBottom: cta ? '24px' : '0' }}>{message}</p>
      {cta && (
        <button
          onClick={cta.onClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {cta.label}
        </button>
      )}
    </div>
  )
}
