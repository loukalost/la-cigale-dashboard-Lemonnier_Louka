/**
 * Liste View Page (US-001)
 * Main page for viewing all reservations in table format
 */

import { useState, useEffect } from 'react'
import {
  ReservationTable,
  ReservationForm,
  Modal,
  ErrorBanner,
  Toast,
  EmptyState,
} from '@/components'
import { useReservations, useCreateReservation, useUpdateReservation, useDeleteReservation } from '@/hooks'
import type { Reservation, CreateReservationDTO, UpdateReservationDTO, ReservationStatus } from '@/types'

export function ListPage() {
  const [filters, setFilters] = useState({ dateStart: '', dateEnd: '' })
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data
  const { reservations, loading, error } = useReservations({
    ...filters,
    searchQuery,
  })

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedForEdit, setSelectedForEdit] = useState<Reservation | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Reservation | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // Mutations
  const { mutate: createReservation, loading: createLoading } = useCreateReservation()
  const { mutate: updateReservation, loading: updateLoading } = useUpdateReservation()
  const { mutate: deleteReservation, loading: deleteLoading } = useDeleteReservation()

  // Handlers
  const handleCreateSubmit = async (dto: CreateReservationDTO) => {
    const result = await createReservation(dto)
    if (result) {
      setToastMessage(`Réservation créée: ${dto.prenom} ${dto.nomComplet}`)
      setToastType('success')
      setShowToast(true)
      setShowCreateModal(false)
      // Trigger refetch (would implement in real version with cache invalidation)
    } else {
      setToastMessage('Erreur lors de la création')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleUpdateSubmit = async (dto: UpdateReservationDTO) => {
    if (!selectedForEdit) return
    const result = await updateReservation(selectedForEdit.id, dto)
    if (result) {
      setToastMessage('Réservation modifiée')
      setToastType('success')
      setShowToast(true)
      setSelectedForEdit(null)
    } else {
      setToastMessage('Erreur lors de la modification')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return
    const result = await deleteReservation(showDeleteConfirm.id)
    if (result) {
      setToastMessage('Réservation supprimée')
      setToastType('success')
      setShowToast(true)
      setShowDeleteConfirm(null)
    } else {
      setToastMessage('Erreur lors de la suppression')
      setToastType('error')
      setShowToast(true)
    }
  }

  const handleStatusChange = async (reservation: Reservation, newStatus: ReservationStatus) => {
    const result = await updateReservation(reservation.id, { statut: newStatus })
    if (result) {
      setToastMessage(`Statut changé en ${newStatus}`)
      setToastType('success')
      setShowToast(true)
    }
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>📋 Réservations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={primaryButtonStyle}
        >
          + Nouvelle réservation
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error.message}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Filters */}
      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="🔍 Rechercher par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={filterInputStyle}
        />
        <input
          type="date"
          value={filters.dateStart}
          onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
          style={filterInputStyle}
          placeholder="Date min"
        />
        <input
          type="date"
          value={filters.dateEnd}
          onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
          style={filterInputStyle}
          placeholder="Date max"
        />
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>Chargement...</div>
      ) : reservations.length === 0 ? (
        <EmptyState
          message="Aucune réservation pour cette période"
          cta={{
            label: '+ Créer une réservation',
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <ReservationTable
          reservations={reservations}
          onEdit={(res) => setSelectedForEdit(res)}
          onDelete={(res) => setShowDeleteConfirm(res)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        size="medium"
      >
        <ReservationForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          loading={createLoading}
        />
      </Modal>

      {/* Edit Modal */}
      {selectedForEdit && (
        <Modal
          isOpen={!!selectedForEdit}
          onClose={() => setSelectedForEdit(null)}
          size="medium"
        >
          <ReservationForm
            initialData={selectedForEdit}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setSelectedForEdit(null)}
            loading={updateLoading}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          size="small"
        >
          <div style={{ padding: '24px' }}>
            <p style={{ marginBottom: '12px' }}>
              Êtes-vous sûr de vouloir supprimer cette réservation ?
            </p>
            <p style={{ marginBottom: '16px', color: '#6B7280', fontSize: '14px' }}>
              {showDeleteConfirm.prenom} {showDeleteConfirm.nomComplet} • {showDeleteConfirm.date} à{' '}
              {showDeleteConfirm.heure}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{ ...secondaryButtonStyle }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  ...primaryButtonStyle,
                  backgroundColor: '#DC2626',
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
}

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap',
}

const filterInputStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  flex: '1',
  minWidth: '200px',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#2563EB',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#e5e7eb',
  color: '#374151',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
}
