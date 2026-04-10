/**
 * Modal Component - Generic wrapper
 */

import { useState, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

export function Modal({ isOpen, onClose, title, children, size = 'medium' }: ModalProps) {
  const [show, setShow] = useState(isOpen)

  useEffect(() => {
    setShow(isOpen)
  }, [isOpen])

  if (!show) return null

  const widths: Record<string, string> = {
    small: '400px',
    medium: '600px',
    large: '800px',
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: widths[size],
          maxWidth: '90vw',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1001,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6B7280',
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
