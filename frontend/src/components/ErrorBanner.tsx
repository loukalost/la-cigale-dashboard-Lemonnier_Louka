/**
 * Error Banner Component
 * Displays error messages with retry option
 */

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        backgroundColor: '#FEE2E2',
        borderLeft: '3px solid #DC2626',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#991B1B', fontSize: '14px' }}>
        <strong>⚠️ Erreur :</strong> {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '4px 12px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  )
}
