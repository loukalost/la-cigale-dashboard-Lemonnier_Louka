/**
 * Toast Notification Component
 * Success/error feedback messages
 */

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  visible: boolean
  onClose?: () => void
  duration?: number // milliseconds, 0 = no auto-close
}

export function Toast({ message, type = 'info', visible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(visible)

  useEffect(() => {
    setShow(visible)
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  if (!show) return null

  const bgColors: Record<ToastType, string> = {
    success: '#DCFCE7',
    error: '#FEE2E2',
    info: '#DBEAFE',
  }

  const textColors: Record<ToastType, string> = {
    success: '#15803D',
    error: '#991B1B',
    info: '#0C4A6E',
  }

  const borderColors: Record<ToastType, string> = {
    success: '#16A34A',
    error: '#DC2626',
    info: '#3B82F6',
  }

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        backgroundColor: bgColors[type],
        color: textColors[type],
        padding: '12px 16px',
        borderRadius: '4px',
        border: `1px solid ${borderColors[type]}`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-in-out',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icons[type]}</span>
      <span>{message}</span>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
